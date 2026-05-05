// ============================================================
// PomodoroX - 事件消费者
// 从 GitHub 拉取 outbox 事件 → 按 eventId 去重 → 幂等写入本地
// ============================================================

import type { OutboxEvent } from "./outbox";
import {
  filterUnprocessed,
  markProcessed,
  markTombstone,
  getTombstone,
  removeTombstone,
} from "./outbox";
import { db } from "./database";
import { isConfigured, pullEvents } from "./github";
import type { Task, Reflection, Session } from "@/types";

// ============================================================
// 实体版本保护
// ============================================================

/**
 * 解析时间字符串为毫秒时间戳
 * 兼容 YYYY-MM-DD HH:mm:ss（本地时间格式）和 ISO 8601 两种格式
 * 在 iOS Safari 上 new Date("YYYY-MM-DD HH:mm:ss") 可能返回 Invalid Date，
 * 因此先替换空格为 T 确保标准化
 */
export function parseTime(ts: string): number {
  const normalized = ts.replace(" ", "T");
  const ms = new Date(normalized).getTime();
  // 解析失败时返回 0，让版本比较保守地放行（不会错误阻止新事件）
  return Number.isNaN(ms) ? 0 : ms;
}

/**
 * 统一时间戳比较（避免 YYYY-MM-DD HH:mm:ss 与 ISO 格式字符串直接比较的 bug）
 * @returns true if localTs is strictly after eventTs (local is newer)
 */
export function isNewerThan(localTs: string, eventTs: string): boolean {
  return parseTime(localTs) > parseTime(eventTs);
}

/**
 * 检查事件是否应被跳过（版本保护）
 * 返回 true = 跳过此事件（远端数据比本地旧）
 *
 * 保护规则：
 * 1. 墓碑覆盖：如果实体已被删除（墓碑时间 > 事件时间），跳过创建/更新
 * 2. 版本领先：如果本地实体 updatedAt > 事件时间戳，跳过覆盖
 */
async function shouldSkipDueToVersion(event: OutboxEvent): Promise<boolean> {
  const eventType = event.type;
  const entityId = event.entityId;
  const entityType = event.entityType;

  // 删除事件总是执行（它们是最终的墓碑）
  if (eventType.endsWith(".deleted")) return false;

  // 1. 检查墓碑：是否有更近的删除
  const tombstone = await getTombstone(entityType, entityId);
  if (tombstone && isNewerThan(tombstone.deletedAt, event.timestamp)) {
    console.log(
      `[EventConsumer] 跳过 ${eventType} ${entityId}: ` +
        `墓碑时间 ${tombstone.deletedAt} > 事件时间 ${event.timestamp}`
    );
    return true;
  }

  // 2. 版本比较：从本地获取最新实体
  try {
    switch (entityType) {
      case "task": {
        const task = await db.getTask(entityId);
        if (task && isNewerThan(task.updatedAt, event.timestamp)) {
          console.log(
            `[EventConsumer] 跳过 ${eventType} ${entityId}: ` +
              `本地 updatedAt ${task.updatedAt} > 事件时间 ${event.timestamp}`
          );
          return true;
        }
        break;
      }
      case "reflection": {
        const reflection = await db.getReflection(entityId);
        if (reflection && isNewerThan(reflection.updatedAt, event.timestamp)) {
          console.log(
            `[EventConsumer] 跳过 ${eventType} ${entityId}: ` +
              `本地 updatedAt ${reflection.updatedAt} > 事件时间 ${event.timestamp}`
          );
          return true;
        }
        break;
      }
      case "session": {
        // session.updated 也走版本保护；session.created 通常没有本地版本可比较
        const session = await db.getSession(entityId);
        if (
          session &&
          session.updatedAt &&
          isNewerThan(session.updatedAt, event.timestamp)
        ) {
          console.log(
            `[EventConsumer] 跳过 ${eventType} ${entityId}: ` +
              `本地 updatedAt ${session.updatedAt} > 事件时间 ${event.timestamp}`
          );
          return true;
        }
        break;
      }
    }
  } catch {
    // 查询失败时，允许事件通过处理
    return false;
  }

  return false;
}

// ============================================================
// 事件处理
// ============================================================

/**
 * 处理单个 outbox 事件
 * 幂等：同一个 eventId 多次调用效果相同
 * 版本安全：旧事件不会覆盖新数据（通过 shouldSkipDueToVersion 保护）
 */
async function processEvent(event: OutboxEvent): Promise<void> {
  // 版本保护检查
  if (await shouldSkipDueToVersion(event)) {
    // 跳过的事件仍然标记为已处理，避免重复检查
    return;
  }

  switch (event.type) {
    // ---- Task 事件 ----
    case "task.created":
    case "task.updated": {
      const task = event.payload as Task;
      await db.upsertTask(task);
      // 创建/更新成功后清除墓碑（实体已重新存在）
      await removeTombstone("task", event.entityId);
      break;
    }
    case "task.deleted": {
      const { id } = event.payload as { id: string };
      await db.deleteTask(id);
      // 记录墓碑（使用删除事件的时间戳，而非消费端本地时间）
      await markTombstone("task", id, event.timestamp);
      break;
    }

    // ---- Reflection 事件 ----
    case "reflection.created":
    case "reflection.updated": {
      const reflection = event.payload as Reflection;
      await db.upsertReflection(reflection);
      await removeTombstone("reflection", event.entityId);
      break;
    }
    case "reflection.deleted": {
      const { id } = event.payload as { id: string };
      await db.deleteReflection(id);
      await markTombstone("reflection", id, event.timestamp);
      break;
    }

    // ---- Session 事件 ----
    case "session.created":
    case "session.updated": {
      const session = event.payload as Session;
      await db.upsertSession(session);
      break;
    }

    default:
      console.warn("[EventConsumer] 未知事件类型:", event.type);
  }
}

/**
 * 从 GitHub 拉取并消费所有 outbox 事件
 * 幂等安全：已处理的事件会自动跳过
 * 版本安全：通过 shouldSkipDueToVersion 自动保护
 */
export async function consumeEvents(): Promise<{
  pulled: number;
  processed: number;
  errors: number;
}> {
  if (!isConfigured()) {
    return { pulled: 0, processed: 0, errors: 0 };
  }

  // 1. 拉取远程 outbox 事件
  const remoteEvents = await pullEvents();

  // 2. 委托给 transport-agnostic 的消费函数
  return consumeEventsFrom(remoteEvents);
}

/**
 * 消费任意来源（GitHub / WebDAV / ...）的事件数组
 * 幂等安全：已处理的事件会自动跳过（按 eventId 去重）
 * 版本安全：通过 shouldSkipDueToVersion 自动保护
 *
 * 与传输无关的纯消费逻辑——供 WebDAV / GitHub / 测试等共享。
 */
export async function consumeEventsFrom(remoteEvents: OutboxEvent[]): Promise<{
  pulled: number;
  processed: number;
  errors: number;
}> {
  if (!remoteEvents || remoteEvents.length === 0) {
    return { pulled: 0, processed: 0, errors: 0 };
  }

  // 1. 按时间戳排序（先发生的先处理，使用 parseTime 避免字典序 bug）
  const sorted = [...remoteEvents].sort(
    (a, b) => parseTime(a.timestamp) - parseTime(b.timestamp)
  );

  // 2. 过滤出未处理的事件
  const unprocessed = await filterUnprocessed(sorted);

  // 3. 逐个处理（含版本保护校验）
  let processed = 0;
  let errors = 0;

  for (const event of unprocessed) {
    try {
      await processEvent(event);
      await markProcessed(event.eventId);
      processed++;
    } catch (err) {
      console.error(`[EventConsumer] 处理事件失败 ${event.eventId}:`, err);
      errors++;
    }
  }

  console.log(
    `[EventConsumer] 完成: 远程 ${remoteEvents.length} 个事件, ` +
      `新处理 ${processed} 个, 失败 ${errors} 个`
  );

  return {
    pulled: remoteEvents.length,
    processed,
    errors,
  };
}
