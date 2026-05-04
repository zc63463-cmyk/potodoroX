// ============================================================
// PomodoroX - Outbox 事件队列
// Append-only 事件流：每条 CRUD 操作生成一个不可变事件
// 本地 IndexedDB 持久化 → 推送至 GitHub outbox/ 目录
// ============================================================

import { get, set, keys, del } from 'idb-keyval'
import { generateId } from '@/utils/id'

// ============================================================
// 事件类型定义
// ============================================================

/** 支持的事件类型 */
export type OutboxEventType =
  | 'task.created'
  | 'task.updated'
  | 'task.deleted'
  | 'reflection.created'
  | 'reflection.updated'
  | 'reflection.deleted'
  | 'session.created'

/** Outbox 事件结构 */
export interface OutboxEvent {
  /** 全局唯一事件 ID（用于幂等去重） */
  eventId: string
  /** 事件类型 */
  type: OutboxEventType
  /** 实体类型（task / reflection / session） */
  entityType: string
  /** 实体 ID */
  entityId: string
  /** 事件载荷（完整实体数据或 { id }） */
  payload: unknown
  /** 事件发生时间（ISO 8601） */
  timestamp: string
}

/** 已处理事件记录（用于消费端去重） */
interface ProcessedEvent {
  eventId: string
  processedAt: string
}

// ============================================================
// IndexedDB Key 常量
// ============================================================

/** outbox 事件的前缀 */
const OUTBOX_PREFIX = 'outbox-event-'

/** 已处理事件索引 Key（前缀） */
const PROCESSED_PREFIX = 'outbox-processed-'

// ============================================================
// 事件写入
// ============================================================

/**
 * 创建并写入一个 outbox 事件
 * @param type 事件类型
 * @param entityId 实体 ID
 * @param payload 事件载荷
 * @returns 创建的事件
 */
export async function writeEvent(
  type: OutboxEventType,
  entityId: string,
  payload: unknown
): Promise<OutboxEvent> {
  const entityType = type.split('.')[0] // "task.created" → "task"

  const event: OutboxEvent = {
    eventId: generateId(),
    type,
    entityType,
    entityId,
    payload,
    timestamp: new Date().toISOString(),
  }

  await set(`${OUTBOX_PREFIX}${event.eventId}`, event)
  return event
}

// ============================================================
// 事件读取
// ============================================================

/**
 * 获取所有未推送的 outbox 事件
 */
export async function getUnpushedEvents(): Promise<OutboxEvent[]> {
  const allKeys = await keys()
  const eventKeys = allKeys.filter((k) => String(k).startsWith(OUTBOX_PREFIX))

  const events: OutboxEvent[] = []
  for (const key of eventKeys) {
    const event = await get<OutboxEvent>(key)
    if (event) {
      events.push(event)
    }
  }

  // 按时间戳升序排列（先发生的先推送）
  events.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  return events
}

/**
 * 获取未推送事件的数量
 */
export async function getUnpushedCount(): Promise<number> {
  const allKeys = await keys()
  return allKeys.filter((k) => String(k).startsWith(OUTBOX_PREFIX)).length
}

// ============================================================
// 事件清理（推送成功后删除本地事件）
// ============================================================

/**
 * 删除已成功推送的事件
 * @param eventIds 已推送的事件 ID 列表
 */
export async function removePushedEvents(eventIds: string[]): Promise<void> {
  for (const eventId of eventIds) {
    await del(`${OUTBOX_PREFIX}${eventId}`)
  }
}

// ============================================================
// 已处理事件记录（消费端去重）
// ============================================================

/**
 * 标记事件为已处理（消费端使用）
 * @param eventId 已处理的事件 ID
 */
export async function markProcessed(eventId: string): Promise<void> {
  const record: ProcessedEvent = {
    eventId,
    processedAt: new Date().toISOString(),
  }
  await set(`${PROCESSED_PREFIX}${eventId}`, record)
}

/**
 * 检查事件是否已被处理
 */
export async function isProcessed(eventId: string): Promise<boolean> {
  const record = await get<ProcessedEvent>(`${PROCESSED_PREFIX}${eventId}`)
  return !!record
}

/**
 * 从远程事件列表中筛选出尚未处理的事件
 */
export async function filterUnprocessed(
  events: OutboxEvent[]
): Promise<OutboxEvent[]> {
  const result: OutboxEvent[] = []
  for (const event of events) {
    const processed = await isProcessed(event.eventId)
    if (!processed) {
      result.push(event)
    }
  }
  return result
}

// ============================================================
// 清理（测试用 / 重置）
// ============================================================

/** 墓碑前缀 */
const TOMBSTONE_PREFIX = 'tombstone-'

/** 墓碑记录（记录实体最后一次删除的时间） */
interface TombstoneRecord {
  entityId: string
  entityType: string
  deletedAt: string
}

/**
 * 记录实体删除墓碑（防止乱序事件复活已删除实体）
 * @param timestamp 删除事件的时间戳，默认为当前时间
 */
export async function markTombstone(entityType: string, entityId: string, timestamp?: string): Promise<void> {
  const record: TombstoneRecord = {
    entityId,
    entityType,
    deletedAt: timestamp ?? new Date().toISOString(),
  }
  await set(`${TOMBSTONE_PREFIX}${entityType}-${entityId}`, record)
}

/**
 * 检查实体是否有墓碑（最近是否被删除过）
 */
export async function getTombstone(entityType: string, entityId: string): Promise<TombstoneRecord | null> {
  const record = await get<TombstoneRecord>(`${TOMBSTONE_PREFIX}${entityType}-${entityId}`)
  return record ?? null
}

/**
 * 清除墓碑
 */
export async function removeTombstone(entityType: string, entityId: string): Promise<void> {
  await del(`${TOMBSTONE_PREFIX}${entityType}-${entityId}`)
}

/**
 * 清除所有 outbox 数据（仅测试用）
 */
export async function clearAll(): Promise<void> {
  const allKeys = await keys()
  for (const key of allKeys) {
    const strKey = String(key)
    if (strKey.startsWith(OUTBOX_PREFIX) || strKey.startsWith(PROCESSED_PREFIX) || strKey.startsWith(TOMBSTONE_PREFIX)) {
      await del(key)
    }
  }
}
