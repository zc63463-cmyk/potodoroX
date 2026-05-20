// ============================================================
// PomodoroX - Outbox 事件队列
// Append-only 事件流：每条 CRUD 操作生成一个不可变事件
// 统一存储层：通过 database.ts 持久化（SQLite / IndexedDB）
// ============================================================

import { get, set, keys, del } from "idb-keyval";
import { generateId } from "@/utils/id";
import { db } from "./database";
import type { OutboxEvent, OutboxEventType, TombstoneRecord } from "@/types";

export type { OutboxEvent, OutboxEventType, TombstoneRecord };

// ---- 旧存储迁移（一次性） ----

const OLD_OUTBOX_PREFIX = "outbox-event-";
const OLD_PROCESSED_PREFIX = "outbox-processed-";
const OLD_TOMBSTONE_PREFIX = "tombstone-";

const MIGRATION_FLAG_KEY = "outbox-migrated-v2";

let migrated = false;

async function ensureMigrated(): Promise<void> {
  if (migrated) return;

  // 使用独立持久化标志判断迁移状态（不受 clearAll 影响）
  const flag = await get<string>(MIGRATION_FLAG_KEY);
  if (flag === "done") {
    migrated = true;
    return;
  }

  try {
    const allKeys = await keys();

    // 迁移 outbox 事件
    const eventKeys = allKeys.filter((k) =>
      String(k).startsWith(OLD_OUTBOX_PREFIX)
    );
    for (const key of eventKeys) {
      const event = await get<OutboxEvent>(key);
      if (event) {
        await db.writeOutboxEvent(event);
        await del(key);
      }
    }

    // 迁移 processed 记录
    const processedKeys = allKeys.filter((k) =>
      String(k).startsWith(OLD_PROCESSED_PREFIX)
    );
    for (const key of processedKeys) {
      const record = await get<{ eventId: string; processedAt: string }>(key);
      if (record) {
        await db.markOutboxEventProcessed(record.eventId);
        await del(key);
      }
    }

    // 迁移 tombstones
    const tombstoneKeys = allKeys.filter((k) =>
      String(k).startsWith(OLD_TOMBSTONE_PREFIX)
    );
    for (const key of tombstoneKeys) {
      const record = await get<TombstoneRecord>(key);
      if (record) {
        await db.markTombstone(
          record.entityType,
          record.entityId,
          record.deletedAt
        );
        await del(key);
      }
    }

    if (
      eventKeys.length > 0 ||
      processedKeys.length > 0 ||
      tombstoneKeys.length > 0
    ) {
      if (import.meta.env.DEV)
        console.log(
          `[Outbox] 已从旧存储迁移: ${eventKeys.length} 事件, ${processedKeys.length} 已处理, ${tombstoneKeys.length} 墓碑`
        );
    }

    // 设置持久化标志，防止 clearAll 后重复迁移
    await set(MIGRATION_FLAG_KEY, "done");
    migrated = true;
  } catch (err) {
    console.warn("[Outbox] 迁移旧数据失败:", err);
    // 不设置 migrated = true，下次调用会重试
  }
}

// ============================================================
// 事件写入
// ============================================================

/**
 * 创建并写入一个 outbox 事件
 */
export async function writeEvent(
  type: OutboxEventType,
  entityId: string,
  payload: unknown
): Promise<OutboxEvent> {
  await ensureMigrated();

  const entityType = type.split(".")[0]; // "task.created" → "task"

  const event: OutboxEvent = {
    eventId: generateId(),
    type,
    entityType,
    entityId,
    payload,
    timestamp: new Date().toISOString(),
  };

  await db.writeOutboxEvent(event);
  return event;
}

// ============================================================
// 事件读取
// ============================================================

/** 获取所有未推送的 outbox 事件 */
export async function getUnpushedEvents(): Promise<OutboxEvent[]> {
  await ensureMigrated();
  return db.getUnpushedOutboxEvents();
}

/** 获取未推送事件的数量 */
export async function getUnpushedCount(): Promise<number> {
  await ensureMigrated();
  return db.getOutboxEventCount();
}

// ============================================================
// 事件清理（推送成功后删除本地事件）
// ============================================================

/** 删除已成功推送的事件 */
export async function removePushedEvents(eventIds: string[]): Promise<void> {
  await ensureMigrated();
  await db.removePushedOutboxEvents(eventIds);
}

// ============================================================
// 已处理事件记录（消费端去重）
// ============================================================

/** 标记事件为已处理 */
export async function markProcessed(eventId: string): Promise<void> {
  await ensureMigrated();
  await db.markOutboxEventProcessed(eventId);
}

/** 检查事件是否已被处理 */
export async function isProcessed(eventId: string): Promise<boolean> {
  await ensureMigrated();
  return db.isOutboxEventProcessed(eventId);
}

/** 从远程事件列表中筛选出尚未处理的事件 */
export async function filterUnprocessed(
  events: OutboxEvent[]
): Promise<OutboxEvent[]> {
  await ensureMigrated();
  return db.filterUnprocessedOutboxEvents(events);
}

// ============================================================
// 墓碑机制
// ============================================================

/** 墓碑记录类型（向后兼容导出） */
export type Tombstone = TombstoneRecord;

/** 记录实体删除墓碑 */
export async function markTombstone(
  entityType: string,
  entityId: string,
  timestamp?: string
): Promise<void> {
  await ensureMigrated();
  await db.markTombstone(entityType, entityId, timestamp);
}

/** 检查实体是否有墓碑 */
export async function getTombstone(
  entityType: string,
  entityId: string
): Promise<TombstoneRecord | null> {
  await ensureMigrated();
  return db.getTombstone(entityType, entityId);
}

/** 清除墓碑 */
export async function removeTombstone(
  entityType: string,
  entityId: string
): Promise<void> {
  await ensureMigrated();
  await db.removeTombstone(entityType, entityId);
}

/** 获取所有本地墓碑 */
export async function getAllTombstones(): Promise<TombstoneRecord[]> {
  await ensureMigrated();
  return db.getAllTombstones();
}

/** 批量写入墓碑 */
export async function upsertTombstones(
  tombstones: TombstoneRecord[]
): Promise<void> {
  await ensureMigrated();
  await db.upsertTombstones(tombstones);
}

// ============================================================
// 清理（测试用 / 重置）
// ============================================================

/** 清除所有 outbox 数据 */
export async function clearAll(): Promise<void> {
  await ensureMigrated();
  await db.clearOutbox();
  await db.clearProcessedEvents();
  // 同时清理旧存储（防止重复迁移）
  try {
    const allKeys = await keys();
    for (const key of allKeys) {
      const strKey = String(key);
      if (
        strKey.startsWith(OLD_OUTBOX_PREFIX) ||
        strKey.startsWith(OLD_PROCESSED_PREFIX) ||
        strKey.startsWith(OLD_TOMBSTONE_PREFIX)
      ) {
        await del(key);
      }
    }
  } catch {
    /* ignore */
  }
}
