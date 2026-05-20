// ============================================================
// outbox 回归测试
// 覆盖：事件写入/读取/清理、墓碑操作、迁移后的薄包装调用
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
  Object.values(mockDb).forEach((m: any) => {
    if (typeof m.mockClear === "function") m.mockClear();
  });
  mockIdbGet.mockClear().mockResolvedValue("done");
  mockIdbSet.mockClear();
  mockIdbKeys.mockClear();
  mockIdbDel.mockClear();
});

describe("outbox", () => {
  // ============================================================
  // 事件写入与读取
  // ============================================================
  it("writeEvent 应创建并写入事件", async () => {
    const event = await writeEvent("task.created", "t1", { title: "Test" });
    expect(event.type).toBe("task.created");
    expect(event.entityType).toBe("task");
    expect(event.entityId).toBe("t1");
    expect(mockDb.writeOutboxEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "task.created",
        entityId: "t1",
      })
    );
  });

  it("getUnpushedEvents 应返回未推送事件", async () => {
    mockDb.getUnpushedOutboxEvents.mockResolvedValue([{ eventId: "e1" }]);
    const events = await getUnpushedEvents();
    expect(events).toHaveLength(1);
    expect(mockDb.getUnpushedOutboxEvents).toHaveBeenCalled();
  });

  it("getUnpushedCount 应返回数量", async () => {
    mockDb.getOutboxEventCount.mockResolvedValue(5);
    const count = await getUnpushedCount();
    expect(count).toBe(5);
    expect(mockDb.getOutboxEventCount).toHaveBeenCalled();
  });

  it("removePushedEvents 应删除已推送事件", async () => {
    await removePushedEvents(["e1", "e2"]);
    expect(mockDb.removePushedOutboxEvents).toHaveBeenCalledWith(["e1", "e2"]);
  });

  // ============================================================
  // 已处理事件记录
  // ============================================================
  it("markProcessed 应标记事件为已处理", async () => {
    await markProcessed("e1");
    expect(mockDb.markOutboxEventProcessed).toHaveBeenCalledWith("e1");
  });

  it("isProcessed 应返回处理状态", async () => {
    mockDb.isOutboxEventProcessed.mockResolvedValue(true);
    const result = await isProcessed("e1");
    expect(result).toBe(true);
    expect(mockDb.isOutboxEventProcessed).toHaveBeenCalledWith("e1");
  });

  it("filterUnprocessed 应筛选未处理事件", async () => {
    const events = [{ eventId: "e1" }, { eventId: "e2" }] as any;
    mockDb.filterUnprocessedOutboxEvents.mockResolvedValue([events[0]]);
    const result = await filterUnprocessed(events);
    expect(result).toHaveLength(1);
    expect(mockDb.filterUnprocessedOutboxEvents).toHaveBeenCalledWith(events);
  });

  // ============================================================
  // 墓碑机制
  // ============================================================
  it("markTombstone 应记录墓碑", async () => {
    await markTombstone("task", "t1");
    expect(mockDb.markTombstone).toHaveBeenCalledWith("task", "t1", undefined);
  });

  it("markTombstone 应支持自定义时间戳", async () => {
    await markTombstone("task", "t1", "2026-05-01T10:00:00Z");
    expect(mockDb.markTombstone).toHaveBeenCalledWith(
      "task",
      "t1",
      "2026-05-01T10:00:00Z"
    );
  });

  it("getTombstone 应返回墓碑", async () => {
    mockDb.getTombstone.mockResolvedValue({
      entityType: "task",
      entityId: "t1",
      deletedAt: "2026-05-01",
    });
    const result = await getTombstone("task", "t1");
    expect(result).toBeDefined();
    expect(mockDb.getTombstone).toHaveBeenCalledWith("task", "t1");
  });

  it("removeTombstone 应清除墓碑", async () => {
    await removeTombstone("task", "t1");
    expect(mockDb.removeTombstone).toHaveBeenCalledWith("task", "t1");
  });

  it("getAllTombstones 应返回所有墓碑", async () => {
    mockDb.getAllTombstones.mockResolvedValue([
      { entityType: "task", entityId: "t1", deletedAt: "2026-05-01" },
    ]);
    const result = await getAllTombstones();
    expect(result).toHaveLength(1);
    expect(mockDb.getAllTombstones).toHaveBeenCalled();
  });

  it("upsertTombstones 应批量写入墓碑", async () => {
    const tombstones = [
      { entityType: "task", entityId: "t1", deletedAt: "2026-05-01" },
    ];
    await upsertTombstones(tombstones as any);
    expect(mockDb.upsertTombstones).toHaveBeenCalledWith(tombstones);
  });

  // ============================================================
  // 清理
  // ============================================================
  it("clearAll 应清空 outbox 和 processed 事件", async () => {
    await clearAll();
    expect(mockDb.clearOutbox).toHaveBeenCalled();
    expect(mockDb.clearProcessedEvents).toHaveBeenCalled();
  });
});
