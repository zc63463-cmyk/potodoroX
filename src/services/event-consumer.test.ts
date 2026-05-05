import { describe, it, expect, vi, beforeEach } from "vitest";
import type { OutboxEvent } from "./outbox";
import type { Task } from "@/types";

// ============================================================
// 消费者回归测试
// ============================================================

// 使用 vi.hoisted 创建可被 mock 工厂和测试共享的 mock 对象
const mockDb = vi.hoisted(() => ({
  getTask: vi.fn() as ReturnType<typeof vi.fn>,
  upsertTask: vi.fn(),
  deleteTask: vi.fn(),
  getReflection: vi.fn(),
  upsertReflection: vi.fn(),
  deleteReflection: vi.fn(),
  getSession: vi.fn(),
  upsertSession: vi.fn(),
}));

const mockGithub = vi.hoisted(() => ({
  isConfigured: vi.fn(),
  pullEvents: vi.fn(),
}));

const mockOutbox = vi.hoisted(() => ({
  filterUnprocessed: vi.fn(),
  markProcessed: vi.fn(),
  markTombstone: vi.fn(),
  getTombstone: vi.fn(),
  removeTombstone: vi.fn(),
}));

vi.mock("./github", () => ({
  isConfigured: () => mockGithub.isConfigured(),
  pullEvents: () => mockGithub.pullEvents(),
}));

vi.mock("./outbox", () => ({
  filterUnprocessed: (e: OutboxEvent[]) => mockOutbox.filterUnprocessed(e),
  markProcessed: (id: string) => mockOutbox.markProcessed(id),
  markTombstone: (t: string, e: string, ts?: string) =>
    mockOutbox.markTombstone(t, e, ts),
  getTombstone: (t: string, e: string) => mockOutbox.getTombstone(t, e),
  removeTombstone: (t: string, e: string) => mockOutbox.removeTombstone(t, e),
}));

vi.mock("./database", () => ({ db: mockDb }));

// 导入被测模块
const { consumeEvents, consumeEventsFrom, parseTime, isNewerThan } =
  await import("./event-consumer");

// ============================================================
// 测试辅助
// ============================================================

function makeEvent(overrides: Partial<OutboxEvent> = {}): OutboxEvent {
  return {
    eventId: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: "task.created",
    entityType: "task",
    entityId: "task-1",
    payload: { id: "task-1", title: "test", updatedAt: "2026-05-04 10:00:00" },
    timestamp: "2026-05-04T10:00:00.000Z",
    ...overrides,
  };
}

// ============================================================
// parseTime & isNewerThan
// ============================================================

describe("parseTime", () => {
  it("应解析 ISO 8601", () => {
    expect(parseTime("2026-05-04T10:00:00.000Z")).toBeGreaterThan(0);
  });
  it("应解析本地时间格式", () => {
    expect(parseTime("2026-05-04 10:00:00")).toBeGreaterThan(0);
  });
  it("Invalid Date 返回 0", () => {
    expect(parseTime("bad")).toBe(0);
  });
});

describe("isNewerThan", () => {
  it("本地晚于事件 → true", () => {
    expect(isNewerThan("2026-05-05 00:00:00", "2026-05-03T00:00:00.000Z")).toBe(
      true
    );
  });
  it("本地早于事件 → false", () => {
    expect(isNewerThan("2026-05-03 00:00:00", "2026-05-05T00:00:00.000Z")).toBe(
      false
    );
  });
  it("相同时刻 → false", () => {
    expect(isNewerThan("2026-05-04 10:00:00", "2026-05-04T10:00:00.000Z")).toBe(
      false
    );
  });
  it("Invalid Date → false", () => {
    expect(isNewerThan("bad", "2026-05-04T10:00:00.000Z")).toBe(false);
  });
});

// ============================================================
// consumeEvents 消费者链路
// ============================================================

describe("consumeEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGithub.isConfigured.mockReturnValue(true);
    mockDb.getTask.mockResolvedValue(null);
    mockDb.getReflection.mockResolvedValue(null);
    mockDb.getSession.mockResolvedValue(null);
    mockOutbox.getTombstone.mockResolvedValue(null);
    mockOutbox.filterUnprocessed.mockImplementation((e) => Promise.resolve(e));
  });

  it("GitHub 未配置时跳过", async () => {
    mockGithub.isConfigured.mockReturnValue(false);
    const r = await consumeEvents();
    expect(r).toMatchObject({ pulled: 0, processed: 0, errors: 0 });
  });

  it("无远程事件时返回空", async () => {
    mockGithub.pullEvents.mockResolvedValue([]);
    const r = await consumeEvents();
    expect(r).toMatchObject({ pulled: 0, processed: 0, errors: 0 });
  });

  it("正常消费 task.created", async () => {
    const e = makeEvent({
      payload: {
        id: "task-1",
        title: "新建",
        updatedAt: "2026-05-04 10:00:00",
      },
    });
    mockGithub.pullEvents.mockResolvedValue([e]);
    const r = await consumeEvents();
    expect(r.processed).toBe(1);
    expect(r.applied).toBe(1);
    expect(r.skipped).toBe(0);
    expect(mockDb.upsertTask).toHaveBeenCalledWith(e.payload);
    expect(mockOutbox.markProcessed).toHaveBeenCalledWith(e.eventId);
  });

  it("已处理的事件跳过", async () => {
    mockGithub.pullEvents.mockResolvedValue([makeEvent()]);
    mockOutbox.filterUnprocessed.mockResolvedValue([]);
    const r = await consumeEvents();
    expect(r.processed).toBe(0);
    expect(r.alreadyProcessed).toBe(1);
    expect(mockDb.upsertTask).not.toHaveBeenCalled();
  });

  // ---- 版本保护 ----

  it("旧 task.updated 不覆盖本地新数据", async () => {
    // 本地 updatedAt 17:00 (+08 = 09:00 UTC) > 事件 08:00 UTC → 本地新，跳过
    mockDb.getTask.mockResolvedValue({
      id: "task-1",
      title: "新版本",
      updatedAt: "2026-05-04 17:00:00",
    } as Task);
    const old = makeEvent({
      type: "task.updated",
      timestamp: "2026-05-04T08:00:00.000Z",
      payload: {
        id: "task-1",
        title: "旧版本",
        updatedAt: "2026-05-04 08:00:00",
      },
    });
    mockGithub.pullEvents.mockResolvedValue([old]);
    const r = await consumeEvents();
    expect(r.processed).toBe(1); // 事件被消费(标记 processed)，但未被 upsert
    expect(r.applied).toBe(0);
    expect(r.skipped).toBe(1);
    expect(r.skippedLocalNewer).toBe(1);
    expect(mockDb.upsertTask).not.toHaveBeenCalled();
  });

  // ---- 墓碑保护 ----

  it("task.deleted 后旧 task.created 不复活", async () => {
    const del = makeEvent({
      type: "task.deleted",
      timestamp: "2026-05-04T10:00:00.000Z",
      payload: { id: "task-1" },
    });
    const oldCreate = makeEvent({
      type: "task.created",
      eventId: "old-create",
      timestamp: "2026-05-04T09:00:00.000Z",
      payload: {
        id: "task-1",
        title: "旧创建",
        updatedAt: "2026-05-04 09:00:00",
      },
    });
    mockGithub.pullEvents.mockResolvedValue([del, oldCreate]);
    // .deleted 事件不走 getTombstone（shouldSkipDueToVersion 提前返回 false）
    // 只需为 oldCreate 事件配置 1 次
    mockOutbox.getTombstone.mockResolvedValueOnce({
      entityId: "task-1",
      entityType: "task",
      deletedAt: "2026-05-04T10:00:00.000Z",
    });

    const r = await consumeEvents();
    expect(r.pulled).toBe(2);
    expect(r.processed).toBe(2); // 都被消费：del 被应用，oldCreate 被版本保护跳过
    expect(r.applied).toBe(1);
    expect(r.skipped).toBe(1);
    expect(r.skippedTombstone).toBe(1);
    expect(mockDb.deleteTask).toHaveBeenCalledWith("task-1");
    expect(mockOutbox.markTombstone).toHaveBeenCalledWith(
      "task",
      "task-1",
      "2026-05-04T10:00:00.000Z"
    );
    expect(mockDb.upsertTask).not.toHaveBeenCalled(); // 旧创建不复活
    expect(mockOutbox.markProcessed).toHaveBeenCalledTimes(2);
  });

  // ---- 新创建应覆盖删除 ----

  it("删除后新 task.created 可恢复实体", async () => {
    const del = makeEvent({
      type: "task.deleted",
      timestamp: "2026-05-04T09:00:00.000Z",
      payload: { id: "task-1" },
    });
    const newCreate = makeEvent({
      type: "task.created",
      eventId: "new-create",
      timestamp: "2026-05-04T10:00:00.000Z",
      payload: {
        id: "task-1",
        title: "新创建",
        updatedAt: "2026-05-04 10:00:00",
      },
    });
    mockGithub.pullEvents.mockResolvedValue([del, newCreate]);
    // .deleted 不走 getTombstone，只需为 newCreate 配置 1 次
    mockOutbox.getTombstone.mockResolvedValueOnce({
      entityId: "task-1",
      entityType: "task",
      deletedAt: "2026-05-04T09:00:00.000Z",
    });
    const r = await consumeEvents();
    expect(r.processed).toBe(2);
    expect(mockDb.deleteTask).toHaveBeenCalledWith("task-1");
    expect(mockOutbox.markTombstone).toHaveBeenCalledWith(
      "task",
      "task-1",
      "2026-05-04T09:00:00.000Z"
    );
    expect(mockDb.upsertTask).toHaveBeenCalledWith(newCreate.payload);
    expect(mockOutbox.removeTombstone).toHaveBeenCalledWith("task", "task-1");
  });

  // ---- 错误恢复 ----

  it("单个事件失败不影响后续", async () => {
    const bad = makeEvent({ eventId: "bad", payload: { id: "bad" } });
    const good = makeEvent({ eventId: "good", payload: { id: "good" } });
    mockGithub.pullEvents.mockResolvedValue([bad, good]);
    mockDb.upsertTask
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce(undefined);
    const r = await consumeEvents();
    expect(r.processed).toBe(1);
    expect(r.errors).toBe(1);
  });
});

// ============================================================
// consumeEventsFrom transport-agnostic 消费（Phase 2 WebDAV 复用）
// ============================================================

describe("consumeEventsFrom", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.getTask.mockResolvedValue(null);
    mockDb.getReflection.mockResolvedValue(null);
    mockDb.getSession.mockResolvedValue(null);
    mockOutbox.getTombstone.mockResolvedValue(null);
    mockOutbox.filterUnprocessed.mockImplementation((e) => Promise.resolve(e));
  });

  it("不依赖 GitHub 配置：即使未配置也能消费传入事件", async () => {
    mockGithub.isConfigured.mockReturnValue(false);
    const e = makeEvent();
    const r = await consumeEventsFrom([e]);
    expect(r.processed).toBe(1);
    expect(mockDb.upsertTask).toHaveBeenCalled();
  });

  it("空数组直接返回", async () => {
    const r = await consumeEventsFrom([]);
    expect(r).toMatchObject({ pulled: 0, processed: 0, errors: 0 });
    expect(mockOutbox.filterUnprocessed).not.toHaveBeenCalled();
  });

  it("按时间戳升序处理（混合格式）", async () => {
    const order: string[] = [];
    mockDb.upsertTask.mockImplementation(async (t: any) => {
      order.push(t.id);
    });
    const e1 = makeEvent({
      eventId: "first",
      timestamp: "2026-05-04T08:00:00.000Z",
      payload: { id: "first", title: "", updatedAt: "2026-05-04 08:00:00" },
    });
    const e2 = makeEvent({
      eventId: "second",
      timestamp: "2026-05-04T12:00:00.000Z",
      payload: { id: "second", title: "", updatedAt: "2026-05-04 12:00:00" },
    });
    // 传入乱序 → 消费端应按 parseTime 正序排列
    await consumeEventsFrom([e2, e1]);
    expect(order).toEqual(["first", "second"]);
  });

  it("session.updated 事件应触发 upsertSession", async () => {
    const ev = makeEvent({
      type: "session.updated",
      entityType: "session",
      entityId: "sess-1",
      payload: {
        id: "sess-1",
        type: "work",
        duration: 1500,
        startedAt: "2026-05-04T10:00:00.000Z",
        completed: true,
        plan: "补充计划",
        completion: "已完成",
        updatedAt: "2026-05-04 18:00:00",
      },
      timestamp: "2026-05-04T10:00:00.000Z",
    });
    const r = await consumeEventsFrom([ev]);
    expect(r.processed).toBe(1);
    expect(mockDb.upsertSession).toHaveBeenCalledWith(ev.payload);
  });

  it("session.updated：本地 updatedAt 较新时被跳过", async () => {
    mockDb.getSession.mockResolvedValue({
      id: "sess-1",
      updatedAt: "2026-05-04 20:00:00", // 本地较新
    } as any);
    const ev = makeEvent({
      type: "session.updated",
      entityType: "session",
      entityId: "sess-1",
      timestamp: "2026-05-04T08:00:00.000Z",
      payload: { id: "sess-1", updatedAt: "2026-05-04 08:00:00" },
    });
    const r = await consumeEventsFrom([ev]);
    expect(r.processed).toBe(1); // 标记为已处理
    expect(mockDb.upsertSession).not.toHaveBeenCalled();
  });
});
