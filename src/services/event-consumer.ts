import type { OutboxEvent } from "./outbox";
import {
  filterUnprocessed,
  markProcessed,
  markTombstone,
  getTombstone,
  removeTombstone,
} from "./outbox";
import { db } from "./database";
import type { Task, Reflection, Session } from "@/types";

/** 事务包装的事件处理，确保 db 操作 + markProcessed 原子完成 */
async function processEventInTransaction(
  event: OutboxEvent
): Promise<ProcessEventResult> {
  return db.transaction(async () => {
    const result = await processEvent(event);
    await markProcessed(event.eventId);
    return result;
  });
}

export interface ConsumeEventsResult {
  pulled: number;
  processed: number;
  applied: number;
  skipped: number;
  skippedLocalNewer: number;
  skippedTombstone: number;
  alreadyProcessed: number;
  errors: number;
}

type SkipReason = "localNewer" | "tombstoneNewer";
type SkipDecision = { skip: false } | { skip: true; reason: SkipReason };
type ProcessEventResult =
  | { status: "applied" }
  | { status: "skipped"; reason: SkipReason };

function emptyConsumeResult(): ConsumeEventsResult {
  return {
    pulled: 0,
    processed: 0,
    applied: 0,
    skipped: 0,
    skippedLocalNewer: 0,
    skippedTombstone: 0,
    alreadyProcessed: 0,
    errors: 0,
  };
}

/**
 * Parse both ISO strings and local "YYYY-MM-DD HH:mm:ss" timestamps.
 * iOS Safari can reject the local format unless the space is normalized.
 */
export function parseTime(ts: string): number {
  const normalized = ts.replaceAll(" ", "T");
  const ms = new Date(normalized).getTime();
  // Invalid values become 0 so version checks do not incorrectly block newer events.
  return Number.isNaN(ms) ? 0 : ms;
}

/** Returns true when the local timestamp is strictly newer than the event timestamp. */
export function isNewerThan(localTs: string, eventTs: string): boolean {
  return parseTime(localTs) > parseTime(eventTs);
}

async function shouldSkipDueToVersion(
  event: OutboxEvent
): Promise<SkipDecision> {
  const eventType = event.type;
  const entityId = event.entityId;
  const entityType = event.entityType;

  // Delete events should also respect version order to avoid deleting newer local data.
  // (Tombstone protection below still applies if a newer tombstone exists.)

  const tombstone = await getTombstone(entityType, entityId);
  if (tombstone && isNewerThan(tombstone.deletedAt, event.timestamp)) {
    if (import.meta.env.DEV)
      console.log(
        `[EventConsumer] 跳过 ${eventType} ${entityId}: ` +
          `墓碑时间 ${tombstone.deletedAt} > 事件时间 ${event.timestamp}`
      );
    return { skip: true, reason: "tombstoneNewer" };
  }

  try {
    switch (entityType) {
      case "task": {
        const task = await db.getTask(entityId);
        if (task && isNewerThan(task.updatedAt, event.timestamp)) {
          if (import.meta.env.DEV)
            console.log(
              `[EventConsumer] 跳过 ${eventType} ${entityId}: ` +
                `本地 updatedAt ${task.updatedAt} > 事件时间 ${event.timestamp}`
            );
          return { skip: true, reason: "localNewer" };
        }
        break;
      }
      case "reflection": {
        const reflection = await db.getReflection(entityId);
        if (reflection && isNewerThan(reflection.updatedAt, event.timestamp)) {
          if (import.meta.env.DEV)
            console.log(
              `[EventConsumer] 跳过 ${eventType} ${entityId}: ` +
                `本地 updatedAt ${reflection.updatedAt} > 事件时间 ${event.timestamp}`
            );
          return { skip: true, reason: "localNewer" };
        }
        break;
      }
      case "session": {
        const session = await db.getSession(entityId);
        if (
          session &&
          session.updatedAt &&
          isNewerThan(session.updatedAt, event.timestamp)
        ) {
          if (import.meta.env.DEV)
            console.log(
              `[EventConsumer] 跳过 ${eventType} ${entityId}: ` +
                `本地 updatedAt ${session.updatedAt} > 事件时间 ${event.timestamp}`
            );
          return { skip: true, reason: "localNewer" };
        }
        break;
      }
    }
  } catch {
    // If the local lookup fails, allow the event through so sync can keep moving.
    return { skip: false };
  }

  return { skip: false };
}

async function processEvent(event: OutboxEvent): Promise<ProcessEventResult> {
  const skip = await shouldSkipDueToVersion(event);
  if (skip.skip) {
    return { status: "skipped", reason: skip.reason };
  }

  switch (event.type) {
    case "task.created":
    case "task.updated": {
      const task = event.payload as Task;
      await db.upsertTask(task);
      await removeTombstone("task", event.entityId);
      break;
    }
    case "task.deleted": {
      const { id } = event.payload as { id: string };
      await db.deleteTask(id);
      await markTombstone("task", id, event.timestamp);
      break;
    }

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

    case "session.created":
    case "session.updated": {
      const session = event.payload as Session;
      await db.upsertSession(session);
      await removeTombstone("session", event.entityId);
      break;
    }
    case "session.deleted": {
      const { id } = event.payload as { id: string };
      await db.deleteSession(id);
      await markTombstone("session", id, event.timestamp);
      break;
    }

    default:
      console.warn("[EventConsumer] 未知事件类型:", event.type);
  }

  return { status: "applied" };
}

/** 事件提供方接口（解耦具体同步后端） */
export interface EventProvider {
  isConfigured(): boolean;
  pullEvents(): Promise<OutboxEvent[]>;
}

/**
 * 消费远程事件
 * @param provider 事件提供方（如 GitHub / WebDAV）。若不提供，返回空结果。
 */
export async function consumeEvents(
  provider?: EventProvider
): Promise<ConsumeEventsResult> {
  if (!provider || !provider.isConfigured()) {
    return emptyConsumeResult();
  }

  const remoteEvents = await provider.pullEvents();
  return consumeEventsFrom(remoteEvents);
}

export async function consumeEventsFrom(
  remoteEvents: OutboxEvent[]
): Promise<ConsumeEventsResult> {
  if (!remoteEvents || remoteEvents.length === 0) {
    return emptyConsumeResult();
  }

  const sorted = [...remoteEvents].sort(
    (a, b) => parseTime(a.timestamp) - parseTime(b.timestamp)
  );
  const unprocessed = await filterUnprocessed(sorted);

  let processed = 0;
  let applied = 0;
  let skipped = 0;
  let skippedLocalNewer = 0;
  let skippedTombstone = 0;
  let errors = 0;

  for (const event of unprocessed) {
    try {
      const result = await processEventInTransaction(event);
      processed++;
      if (result.status === "applied") {
        applied++;
      } else {
        skipped++;
        if (result.reason === "localNewer") skippedLocalNewer++;
        if (result.reason === "tombstoneNewer") skippedTombstone++;
      }
    } catch (err) {
      console.error(`[EventConsumer] 处理事件失败 ${event.eventId}:`, err);
      errors++;
    }
  }

  if (import.meta.env.DEV)
    console.log(
      `[EventConsumer] 完成: 远程 ${remoteEvents.length} 个事件, ` +
        `新处理 ${processed} 个, 应用 ${applied} 个, 跳过 ${skipped} 个, 失败 ${errors} 个`
    );

  return {
    pulled: remoteEvents.length,
    processed,
    applied,
    skipped,
    skippedLocalNewer,
    skippedTombstone,
    alreadyProcessed: remoteEvents.length - unprocessed.length,
    errors,
  };
}
