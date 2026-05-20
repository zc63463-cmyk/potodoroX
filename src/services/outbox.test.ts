// ============================================================
// outbox 集成测试（业务逻辑验证）
// 覆盖：事件结构、迁移流程、墓碑机制、清理行为
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  writeEvent,
  getUnpushedEvents,
  getUnpushedCount,
  removePushedEvents,
  markProcessed,
  isProcessed,
  filterUnprocessed,
  markTombstone,
  getTombstone,
  removeTombstone,
  getAllTombstones,
  upsertTombstones,
  clearAll,
} from "@/services/outbox";

const mockDb = vi.hoisted(() => ({
  writeOutboxEvent: vi.fn().mockResolvedValue(undefined),
  getUnpushedOutboxEvents: vi.fn().mockResolvedValue([]),
  getOutboxEventCount: vi.fn().mockResolvedValue(0),
  removePushedOutboxEvents: vi.fn().mockResolvedValue(undefined),
  markOutboxEventProcessed: vi.fn().mockResolvedValue(undefined),
  isOutboxEventProcessed: vi.fn().mockResolvedValue(false),
  filterUnprocessedOutboxEvents: vi.fn().mockResolvedValue([]),
  markTombstone: vi.fn().mockResolvedValue(undefined),
  getTombstone: vi.fn().mockResolvedValue(null),
  removeTombstone: vi.fn().mockResolvedValue(undefined),
  getAllTombstones: vi.fn().mockResolvedValue([]),
  upsertTombstones: vi.fn().mockResolvedValue(undefined),
  clearOutbox: vi.fn().mockResolvedValue(undefined),
  clearProcessedEvents: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/services/database", () => ({ db: mockDb }));

const mockIdbGet = vi.hoisted(() => vi.fn());
const mockIdbSet = vi.hoisted(() => vi.fn());
const mockIdbKeys = vi.hoisted(() => vi.fn());
const mockIdbDel = vi.hoisted(() => vi.fn());

vi.mock("idb-keyval", () => ({
  get: mockIdbGet,
  set: mockIdbSet,
  keys: mockIdbKeys,
  del: mockIdbDel,
}));

beforeEach(() => {
  Object.values(mockDb).forEach((m: unknown) => {
    if (typeof (m as { mockClear?: () => void }).mockClear === "function")
      (m as { mockClear: () => void }).mockClear();
  });
  // 默认：迁移已完成
  mockIdbGet.mockClear().mockResolvedValue("done");
  mockIdbSet.mockClear();
  mockIdbKeys.mockClear().mockResolvedValue([]);
  mockIdbDel.mockClear();
});

// ============================================================
// 事件结构验证
// ============================================================
describe("writeEvent — 事件结构", () => {
  it("应生成完整的 event 对象（eventId / type / entityType / entityId / payload / timestamp）", async () => {
    const payload = { title: "测试任务", priority: "high" };

    const event = await writeEvent("task.created", "t1", payload);

    // 结构完整性
    expect(event).toHaveProperty("eventId");
    expect(event).toHaveProperty("type");
    expect(event).toHaveProperty("entityType");
    expect(event).toHaveProperty("entityId");
    expect(event).toHaveProperty("payload");
    expect(event).toHaveProperty("timestamp");

    // 值正确性
    expect(event.type).toBe("task.created");
    expect(event.entityId).toBe("t1");
    expect(event.payload).toEqual(payload);
  });

  it("entityType 应从 type 正确提取（task.created → task）", async () => {
    const event = await writeEvent("task.created", "t1", {});
    expect(event.entityType).toBe("task");
  });

  it("entityType 应从 type 正确提取（reflection.updated → reflection）", async () => {
    const event = await writeEvent("reflection.updated", "r1", {});
    expect(event.entityType).toBe("reflection");
  });

  it("entityType 应从 type 正确提取（session.created → session）", async () => {
    const event = await writeEvent("session.created", "s1", {});
    expect(event.entityType).toBe("session");
  });

  it("eventId 应为非空字符串", async () => {
    const event = await writeEvent("task.created", "t1", {});
    expect(typeof event.eventId).toBe("string");
    expect(event.eventId.length).toBeGreaterThan(0);
  });

  it("timestamp 应为 ISO 8601 格式", async () => {
    const event = await writeEvent("task.created", "t1", {});
    const date = new Date(event.timestamp);
    expect(date.getTime()).not.toBeNaN(); // 可解析
    expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO 格式
  });

  it("payload 为 null 时应正确传递", async () => {
    const event = await writeEvent("task.deleted", "t1", null);
    expect(event.payload).toBeNull();
  });

  it("应写入 db writeOutboxEvent", async () => {
    await writeEvent("task.created", "t1", {});
    expect(mockDb.writeOutboxEvent).toHaveBeenCalledTimes(1);
    expect(mockDb.writeOutboxEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "task.created",
        entityId: "t1",
      })
    );
  });

  it("迁移完成后不应调用 IndexedDB 旧存储", async () => {
    await writeEvent("task.created", "t1", {});

    // 已迁移 → 不应读/写旧存储
    const allKeysCalls = mockIdbKeys.mock.calls.length;
    expect(allKeysCalls).toBe(0);
  });
});

// ============================================================
// 读取 / 清理（委托验证）
// ============================================================
describe("读取与清理", () => {
  it("getUnpushedEvents 应返回 db 结果", async () => {
    mockDb.getUnpushedOutboxEvents.mockResolvedValue([
      { eventId: "e1" },
      { eventId: "e2" },
    ] as never);
    const events = await getUnpushedEvents();
    expect(events).toHaveLength(2);
  });

  it("getUnpushedCount 应透传数量", async () => {
    mockDb.getOutboxEventCount.mockResolvedValue(42);
    const count = await getUnpushedCount();
    expect(count).toBe(42);
  });

  it("removePushedEvents 应透传 ID 列表", async () => {
    await removePushedEvents(["e1", "e2", "e3"]);
    expect(mockDb.removePushedOutboxEvents).toHaveBeenCalledWith([
      "e1",
      "e2",
      "e3",
    ]);
  });
});

// ============================================================
// 已处理事件记录
// ============================================================
describe("processed events", () => {
  it("markProcessed → db", async () => {
    await markProcessed("ev-1");
    expect(mockDb.markOutboxEventProcessed).toHaveBeenCalledWith("ev-1");
  });

  it("isProcessed → db 结果反向", async () => {
    mockDb.isOutboxEventProcessed.mockResolvedValue(false);
    expect(await isProcessed("ev-1")).toBe(false);

    mockDb.isOutboxEventProcessed.mockResolvedValue(true);
    expect(await isProcessed("ev-2")).toBe(true);
  });

  it("filterUnprocessed 应筛选", async () => {
    const events = [{ eventId: "e1" }, { eventId: "e2" }] as never;
    mockDb.filterUnprocessedOutboxEvents.mockResolvedValue([events[0]]);
    const result = await filterUnprocessed(events);
    expect(result).toHaveLength(1);
  });
});

// ============================================================
// 墓碑机制
// ============================================================
describe("tombstone", () => {
  it("markTombstone → db（无自定义时间戳）", async () => {
    await markTombstone("task", "t1");
    expect(mockDb.markTombstone).toHaveBeenCalledWith("task", "t1", undefined);
  });

  it("markTombstone → db（自定义时间戳）", async () => {
    await markTombstone("reflection", "r1", "2026-05-20T10:00:00Z");
    expect(mockDb.markTombstone).toHaveBeenCalledWith(
      "reflection",
      "r1",
      "2026-05-20T10:00:00Z"
    );
  });

  it("getTombstone → db 结果", async () => {
    mockDb.getTombstone.mockResolvedValue({
      entityType: "task",
      entityId: "t1",
      deletedAt: "2026-05-01",
    } as never);
    const result = await getTombstone("task", "t1");
    expect(result).toBeDefined();
    expect(result!.entityType).toBe("task");
  });

  it("removeTombstone → db", async () => {
    await removeTombstone("task", "t1");
    expect(mockDb.removeTombstone).toHaveBeenCalledWith("task", "t1");
  });

  it("getAllTombstones → db 结果", async () => {
    mockDb.getAllTombstones.mockResolvedValue([
      { entityType: "task", entityId: "t1", deletedAt: "2026-05-01" },
    ] as never);
    const result = await getAllTombstones();
    expect(result).toHaveLength(1);
  });

  it("upsertTombstones → db 批量写入", async () => {
    const tombstones = [
      { entityType: "task" as const, entityId: "t1", deletedAt: "2026-05-01" },
    ];
    await upsertTombstones(tombstones);
    expect(mockDb.upsertTombstones).toHaveBeenCalledWith(tombstones);
  });
});

// ============================================================
// clearAll
// ============================================================
describe("clearAll", () => {
  it("应清空 outbox + processed events", async () => {
    mockIdbKeys.mockResolvedValue([]);

    await clearAll();

    expect(mockDb.clearOutbox).toHaveBeenCalled();
    expect(mockDb.clearProcessedEvents).toHaveBeenCalled();
  });

  it("应清理旧存储中的过期 key", async () => {
    // 模拟旧存储残留
    mockIdbKeys.mockResolvedValue([
      "outbox-event-old-1",
      "outbox-processed-old-2",
      "tombstone-old-3",
      "other-key",
    ]);

    await clearAll();

    // 旧 key 应被删除
    expect(mockIdbDel).toHaveBeenCalledWith("outbox-event-old-1");
    expect(mockIdbDel).toHaveBeenCalledWith("outbox-processed-old-2");
    expect(mockIdbDel).toHaveBeenCalledWith("tombstone-old-3");
    // 其他 key 不应被删除
    expect(mockIdbDel).toHaveBeenCalledTimes(3);
  });
});
