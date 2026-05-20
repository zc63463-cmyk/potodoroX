/**
 * MemoryStore 补充测试
 * 提升浏览器用户数据层覆盖率：84.7% → 目标 92%+
 *
 * 覆盖缺口：
 * - updateSession 不存在时返回 null
 * - getSyncStatus 统计
 * - filterUnprocessedOutboxEvents
 * - getOutboxEventCount
 * - getSessionsByTask / getSessionsByDateRange 边缘
 */

import { describe, it, expect, beforeEach } from "vitest";
import { MemoryStore } from "./memory-store";
import type { OutboxEvent, TombstoneRecord } from "@/types";
import { generateId } from "@/utils/id";

// 禁用 MemoryStore 的 IndexedDB 自动保存（避免 happy-dom 报错）
function createStore() {
  const store = new MemoryStore();
  // 通过私有属性访问来设置 autoSaveEnabled
  (store as any).autoSaveEnabled = false;
  return store;
}

// ============================================================
// updateSession 边界
// ============================================================
describe("MemoryStore — updateSession", () => {
  let store: MemoryStore;

  beforeEach(async () => {
    store = createStore();
    await store.init();
  });

  it("更新不存在的 session 应返回 null", async () => {
    const result = await store.updateSession("nonexistent", {
      completion: "总结",
    });
    expect(result).toBeNull();
  });

  it("更新存在的 session 应返回更新后的对象", async () => {
    const session = await store.createSession({
      taskId: "t1",
      type: "work",
      duration: 1500,
      completed: false,
      startedAt: "2026-05-20T10:00:00Z",
      plan: "",
      completion: "",
    });
    (store as any).autoSaveEnabled = false; // 每次 create 后会重置

    const updated = await store.updateSession(session.id, {
      completed: true,
      completion: "完成了",
    });

    expect(updated).not.toBeNull();
    expect(updated!.completed).toBe(true);
    expect(updated!.completion).toBe("完成了");
    expect(updated!.updatedAt).toBeTruthy();
  });
});

// ============================================================
// getSyncStatus
// ============================================================
describe("MemoryStore — getSyncStatus", () => {
  it("空数据库应返回全 0", async () => {
    const store = createStore();
    await store.init();
    const status = await store.getSyncStatus();
    expect(status.pendingCount).toBe(0);
    expect(status.lastSyncAt).toBeNull();
    expect(status.isSyncing).toBe(false);
  });

  it("应该正确统计各实体未同步数量", async () => {
    const store = createStore();
    await store.init();

    // 创建未同步的 task, reflection, session
    await store.createTask({
      title: "任务1",
      description: "",
      priority: "medium",
      plan: "",
      completion: "",
      estimatedPomodoros: 1,
      tags: [],
      dueDate: null,
    });
    await store.createReflection({
      date: "2026-05-20",
      content: "反思内容",
      mood: "good",
      relatedTaskIds: [],
      tags: [],
    });
    await store.createSession({
      taskId: null,
      type: "work",
      duration: 1500,
      completed: true,
      startedAt: "2026-05-20T10:00:00Z",
      plan: "",
      completion: "",
    });

    const status = await store.getSyncStatus();
    expect(status.pendingCount).toBe(3);
  });

  it("已同步的实体不应计入", async () => {
    const store = createStore();
    await store.init();

    const task = await store.createTask({
      title: "任务",
      description: "",
      priority: "medium",
      plan: "",
      completion: "",
      estimatedPomodoros: 1,
      tags: [],
      dueDate: null,
    });

    await store.markTaskSynced(task.id);

    const status = await store.getSyncStatus();
    expect(status.pendingCount).toBe(0);
  });
});

// ============================================================
// Outbox
// ============================================================
describe("MemoryStore — Outbox", () => {
  let store: MemoryStore;

  beforeEach(async () => {
    store = createStore();
    await store.init();
  });

  it("getOutboxEventCount 空时返回 0", async () => {
    const count = await store.getOutboxEventCount();
    expect(count).toBe(0);
  });

  it("getOutboxEventCount 有事件时返回正确数量", async () => {
    await store.writeOutboxEvent({
      eventId: generateId(),
      type: "task.created",
      entityType: "task",
      entityId: "t1",
      payload: "{}",
      timestamp: "2026-05-20T10:00:00Z",
    });
    await store.writeOutboxEvent({
      eventId: generateId(),
      type: "task.updated",
      entityType: "task",
      entityId: "t2",
      payload: "{}",
      timestamp: "2026-05-20T10:01:00Z",
    });

    const count = await store.getOutboxEventCount();
    expect(count).toBe(2);
  });

  it("getUnpushedOutboxEvents 应按时间排序", async () => {
    const earlier: OutboxEvent = {
      eventId: "early",
      type: "task.created",
      entityType: "task",
      entityId: "t1",
      payload: "{}",
      timestamp: "2026-05-20T09:00:00Z",
    };
    const later: OutboxEvent = {
      eventId: "later",
      type: "task.updated",
      entityType: "task",
      entityId: "t2",
      payload: "{}",
      timestamp: "2026-05-20T11:00:00Z",
    };

    await store.writeOutboxEvent(later);
    await store.writeOutboxEvent(earlier);

    const events = await store.getUnpushedOutboxEvents();
    expect(events).toHaveLength(2);
    // 应按时间升序
    expect(events[0].eventId).toBe("early");
    expect(events[1].eventId).toBe("later");
  });

  it("removePushedOutboxEvents 应仅删除指定事件", async () => {
    await store.writeOutboxEvent({
      eventId: "e1",
      type: "task.created",
      entityType: "task",
      entityId: "t1",
      payload: "{}",
      timestamp: "2026-05-20T10:00:00Z",
    });
    await store.writeOutboxEvent({
      eventId: "e2",
      type: "task.updated",
      entityType: "task",
      entityId: "t2",
      payload: "{}",
      timestamp: "2026-05-20T10:01:00Z",
    });

    await store.removePushedOutboxEvents(["e1"]);

    const events = await store.getUnpushedOutboxEvents();
    expect(events).toHaveLength(1);
    expect(events[0].eventId).toBe("e2");
    expect(await store.getOutboxEventCount()).toBe(1);
  });

  it("markOutboxEventProcessed 应正确标记", async () => {
    const eventId = "evt-1";
    await store.writeOutboxEvent({
      eventId,
      type: "task.created",
      entityType: "task",
      entityId: "t1",
      payload: "{}",
      timestamp: "2026-05-20T10:00:00Z",
    });

    expect(await store.isOutboxEventProcessed(eventId)).toBe(false);

    await store.markOutboxEventProcessed(eventId);

    expect(await store.isOutboxEventProcessed(eventId)).toBe(true);
  });

  it("filterUnprocessedOutboxEvents 应过滤已处理事件", async () => {
    const raw: OutboxEvent[] = [
      {
        eventId: "raw-1",
        type: "task.created",
        entityType: "task",
        entityId: "t1",
        payload: "{}",
        timestamp: "2026-05-20T10:00:00Z",
      },
      {
        eventId: "raw-2",
        type: "reflection.created",
        entityType: "reflection",
        entityId: "r1",
        payload: "{}",
        timestamp: "2026-05-20T10:01:00Z",
      },
    ];

    await store.markOutboxEventProcessed("raw-1");

    const filtered = await store.filterUnprocessedOutboxEvents(raw);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].eventId).toBe("raw-2");
  });

  it("clearOutbox 应清空队列", async () => {
    await store.writeOutboxEvent({
      eventId: "e1",
      type: "task.created",
      entityType: "task",
      entityId: "t1",
      payload: "{}",
      timestamp: "2026-05-20T10:00:00Z",
    });
    await store.clearOutbox();

    expect(await store.getOutboxEventCount()).toBe(0);
  });

  it("clearProcessedEvents 应清空已处理记录", async () => {
    await store.markOutboxEventProcessed("evt-1");
    await store.clearProcessedEvents();

    expect(await store.isOutboxEventProcessed("evt-1")).toBe(false);
  });
});

// ============================================================
// Tombstones
// ============================================================
describe("MemoryStore — Tombstones", () => {
  let store: MemoryStore;

  beforeEach(async () => {
    store = createStore();
    await store.init();
  });

  it("markTombstone 应记录删除标记", async () => {
    await store.markTombstone("task", "t1", "2026-05-20T10:00:00Z");

    const tombstone = await store.getTombstone("task", "t1");
    expect(tombstone).not.toBeNull();
    expect(tombstone!.entityType).toBe("task");
    expect(tombstone!.entityId).toBe("t1");
    expect(tombstone!.deletedAt).toBe("2026-05-20T10:00:00Z");
  });

  it("markTombstone 无 deletedAt 应自动生成时间", async () => {
    await store.markTombstone("reflection", "r1");

    const tombstone = await store.getTombstone("reflection", "r1");
    expect(tombstone).not.toBeNull();
    expect(tombstone!.deletedAt).toBeTruthy();
  });

  it("getTombstone 不存在应返回 null", async () => {
    const result = await store.getTombstone("task", "nonexistent");
    expect(result).toBeNull();
  });

  it("removeTombstone 应删除标记", async () => {
    await store.markTombstone("session", "s1");
    await store.removeTombstone("session", "s1");

    const result = await store.getTombstone("session", "s1");
    expect(result).toBeNull();
  });

  it("getAllTombstones 应返回所有墓碑", async () => {
    await store.markTombstone("task", "t1");
    await store.markTombstone("task", "t2");

    const all = await store.getAllTombstones();
    expect(all).toHaveLength(2);
  });

  it("upsertTombstones 应批量导入", async () => {
    const incoming: TombstoneRecord[] = [
      { entityType: "task", entityId: "t1", deletedAt: "2026-05-20T10:00:00Z" },
      {
        entityType: "reflection",
        entityId: "r1",
        deletedAt: "2026-05-20T11:00:00Z",
      },
    ];

    await store.upsertTombstones(incoming);

    const all = await store.getAllTombstones();
    expect(all).toHaveLength(2);
    expect(await store.getTombstone("task", "t1")).not.toBeNull();
    expect(await store.getTombstone("reflection", "r1")).not.toBeNull();
  });
});

// ============================================================
// Session 查询
// ============================================================
describe("MemoryStore — Session 查询", () => {
  let store: MemoryStore;

  beforeEach(async () => {
    store = createStore();
    await store.init();
  });

  it("getSessionsByTask 空时返回空数组", async () => {
    const sessions = await store.getSessionsByTask("t1");
    expect(sessions).toEqual([]);
  });

  it("getSessionsByTask 应返回指定任务的 sessions", async () => {
    await store.createSession({
      taskId: "t1",
      type: "work",
      duration: 1500,
      completed: true,
      startedAt: "2026-05-20T10:00:00Z",
      plan: "计划",
      completion: "完成",
    });
    await store.createSession({
      taskId: "t2",
      type: "work",
      duration: 1800,
      completed: true,
      startedAt: "2026-05-20T11:00:00Z",
      plan: "",
      completion: "",
    });

    const t1Sessions = await store.getSessionsByTask("t1");
    expect(t1Sessions).toHaveLength(1);
    expect(t1Sessions[0].taskId).toBe("t1");

    const t2Sessions = await store.getSessionsByTask("t2");
    expect(t2Sessions).toHaveLength(1);
    expect(t2Sessions[0].taskId).toBe("t2");
  });

  it("getSessionsByDateRange 应按日期范围过滤", async () => {
    await store.createSession({
      taskId: null,
      type: "work",
      duration: 1500,
      completed: true,
      startedAt: "2026-05-20T10:00:00Z",
      plan: "",
      completion: "",
    });
    await store.createSession({
      taskId: null,
      type: "work",
      duration: 1500,
      completed: true,
      startedAt: "2026-05-21T10:00:00Z",
      plan: "",
      completion: "",
    });
    await store.createSession({
      taskId: null,
      type: "work",
      duration: 1500,
      completed: true,
      startedAt: "2026-05-22T10:00:00Z",
      plan: "",
      completion: "",
    });

    const range = await store.getSessionsByDateRange(
      "2026-05-20",
      "2026-05-21"
    );
    expect(range).toHaveLength(2);
  });
});

// ============================================================
// syncLog / syncConflict
// ============================================================
describe("MemoryStore — Sync 日志", () => {
  it("recordSync 应记录同步日志", async () => {
    const store = createStore();
    await store.init();

    await store.recordSync("task", "t1");

    const status = await store.getSyncStatus();
    // 验证 lastSyncAt 已更新
    expect(status.lastSyncAt).toBeTruthy();
  });

  it("getSyncConflicts 空时返回空数组", async () => {
    const store = createStore();
    await store.init();

    const conflicts = await store.getSyncConflicts();
    expect(conflicts).toEqual([]);
  });

  it("clearSyncConflicts 应清空冲突日志", async () => {
    const store = createStore();
    await store.init();

    await store.recordSyncConflict({
      entityType: "task",
      entityId: "t1",
      localUpdatedAt: "2026-05-20T10:00:00Z",
      remoteUpdatedAt: "2026-05-20T11:00:00Z",
      resolvedAt: "2026-05-20T12:00:00Z",
      resolution: "local_wins",
      localSnapshot: "{}",
      remoteSnapshot: "{}",
    });

    expect((await store.getSyncConflicts()).length).toBe(1);

    await store.clearSyncConflicts();
    expect((await store.getSyncConflicts()).length).toBe(0);
  });
});

// ============================================================
// upsert 操作
// ============================================================
describe("MemoryStore — Upsert", () => {
  let store: MemoryStore;

  beforeEach(async () => {
    store = createStore();
    await store.init();
  });

  it("upsertTask 新增时应创建", async () => {
    const task = await store.upsertTask({
      id: "imported-1",
      title: "导入的任务",
      description: "",
      status: "todo",
      priority: "medium",
      plan: "",
      completion: "",
      estimatedPomodoros: 1,
      actualPomodoros: 0,
      tags: [],
      dueDate: null,
      createdAt: "2026-05-20T10:00:00Z",
      updatedAt: "2026-05-20T10:00:00Z",
      synced: true,
    });

    expect(task.id).toBe("imported-1");
    const fetched = await store.getTask("imported-1");
    expect(fetched).not.toBeNull();
  });

  it("upsertTask 存在时应更新", async () => {
    // 先创建
    await store.createTask({
      title: "原任务",
      description: "",
      priority: "medium",
      plan: "",
      completion: "",
      estimatedPomodoros: 1,
      tags: [],
      dueDate: null,
    });

    const tasks = await store.getAllTasks();
    const id = tasks[0].id;

    const upserted = await store.upsertTask({
      id,
      title: "更新的任务",
      description: "新增描述",
      status: "in_progress",
      priority: "high",
      plan: "",
      completion: "",
      estimatedPomodoros: 2,
      actualPomodoros: 1,
      tags: ["重构"],
      dueDate: null,
      createdAt: "2026-05-20T09:00:00Z",
      updatedAt: "2026-05-20T11:00:00Z",
      synced: true,
    });

    expect(upserted.title).toBe("更新的任务");
    expect(upserted.priority).toBe("high");
    const fetched = await store.getTask(id);
    expect(fetched!.title).toBe("更新的任务");
  });
});
