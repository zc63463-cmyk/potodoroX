import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

// ============================================================
// session store · deleteSession 联动测试
//
// 验证规格（设计文档 D1）：
// - 删除 work+completed+taskId 的 session → 触发 taskStore.updateTask
//   将 actualPomodoros 减 1（不低于 0），并产生 task.updated 事件
// - 删除 break / incomplete / 无 taskId 的 session → 不触发计数回退
// - 始终写出 session.deleted 事件
// ============================================================

const mockDb = vi.hoisted(() => ({
  getSession: vi.fn(),
  deleteSession: vi.fn(),
  getTask: vi.fn(),
  updateTask: vi.fn(),
  transaction: vi.fn((fn) => fn()),
  createSession: vi.fn(),
  updateSession: vi.fn(),
  getAllSessions: vi.fn(),
  getUnsyncedSessions: vi.fn(),
  // 下列方法 useTaskStore 内部可能间接调用，留空 mock 防止崩溃
  getAllTasks: vi.fn().mockResolvedValue([]),
  upsertTask: vi.fn(),
}));

const mockRecordEvent = vi.hoisted(() => vi.fn());
const mockUpdateTask = vi.hoisted(() => vi.fn());
const mockGetTaskById = vi.hoisted(() => vi.fn());

vi.mock("@/services/database", () => ({ db: mockDb }));

vi.mock("@/stores/sync", () => ({
  useSyncStore: () => ({
    recordEvent: mockRecordEvent,
  }),
}));

vi.mock("@/stores/task", () => ({
  useTaskStore: () => ({
    getTaskById: mockGetTaskById,
    updateTask: mockUpdateTask,
  }),
}));

const { useSessionStore } = await import("./session");

beforeEach(() => {
  setActivePinia(createPinia());
  mockDb.getSession.mockReset();
  mockDb.deleteSession.mockReset().mockResolvedValue(true);
  mockDb.getTask.mockReset();
  mockDb.updateTask.mockReset();
  mockRecordEvent.mockReset().mockResolvedValue(undefined);
  mockUpdateTask.mockReset().mockResolvedValue(null);
  mockGetTaskById.mockReset();
});

describe("sessionStore.deleteSession", () => {
  it("session 不存在时返回 false 且不写事件", async () => {
    mockDb.getSession.mockResolvedValue(null);
    const store = useSessionStore();
    const ok = await store.deleteSession("not-exists");
    expect(ok).toBe(false);
    expect(mockDb.deleteSession).not.toHaveBeenCalled();
    expect(mockRecordEvent).not.toHaveBeenCalled();
  });

  it("删除 work+completed+taskId 的 session 应回退任务 actualPomodoros 减 1", async () => {
    mockDb.getSession.mockResolvedValue({
      id: "sess-1",
      taskId: "task-1",
      type: "work",
      completed: true,
      duration: 1500,
      startedAt: "2026-05-06 10:00:00",
      endedAt: "2026-05-06 10:25:00",
      plan: "",
      completion: "",
      synced: true,
      updatedAt: "2026-05-06 10:25:00",
    });
    mockDb.getTask.mockResolvedValue({
      id: "task-1",
      actualPomodoros: 3,
    });

    const store = useSessionStore();
    const ok = await store.deleteSession("sess-1");

    expect(ok).toBe(true);
    expect(mockDb.deleteSession).toHaveBeenCalledWith("sess-1");
    expect(mockRecordEvent).toHaveBeenCalledWith("session.deleted", "sess-1", {
      id: "sess-1",
    });
    expect(mockDb.updateTask).toHaveBeenCalledWith("task-1", {
      actualPomodoros: 2,
    });
  });

  it("actualPomodoros 已为 0 时不再减为负数（且不发起 updateTask）", async () => {
    mockDb.getSession.mockResolvedValue({
      id: "sess-2",
      taskId: "task-zero",
      type: "work",
      completed: true,
      duration: 1500,
      startedAt: "2026-05-06 10:00:00",
      endedAt: "2026-05-06 10:25:00",
      plan: "",
      completion: "",
      synced: true,
      updatedAt: "2026-05-06 10:25:00",
    });
    mockGetTaskById.mockReturnValue({
      id: "task-zero",
      actualPomodoros: 0,
    });

    const store = useSessionStore();
    const ok = await store.deleteSession("sess-2");

    expect(ok).toBe(true);
    expect(mockDb.updateTask).not.toHaveBeenCalled();
  });

  it("删除 break 类型的 session 不触发计数回退", async () => {
    mockDb.getSession.mockResolvedValue({
      id: "sess-3",
      taskId: "task-1",
      type: "break",
      completed: true,
      duration: 300,
      startedAt: "2026-05-06 10:25:00",
      endedAt: "2026-05-06 10:30:00",
      plan: "",
      completion: "",
      synced: true,
      updatedAt: "2026-05-06 10:30:00",
    });

    const store = useSessionStore();
    const ok = await store.deleteSession("sess-3");

    expect(ok).toBe(true);
    expect(mockRecordEvent).toHaveBeenCalled();
    expect(mockDb.updateTask).not.toHaveBeenCalled();
    expect(mockGetTaskById).not.toHaveBeenCalled();
  });

  it("删除未完成的 work session 不触发计数回退", async () => {
    mockDb.getSession.mockResolvedValue({
      id: "sess-4",
      taskId: "task-1",
      type: "work",
      completed: false,
      duration: 600,
      startedAt: "2026-05-06 11:00:00",
      endedAt: null,
      plan: "",
      completion: "",
      synced: true,
      updatedAt: "2026-05-06 11:10:00",
    });

    const store = useSessionStore();
    const ok = await store.deleteSession("sess-4");

    expect(ok).toBe(true);
    expect(mockDb.updateTask).not.toHaveBeenCalled();
  });

  it("无 taskId 的独立 session 不触发计数回退", async () => {
    mockDb.getSession.mockResolvedValue({
      id: "sess-5",
      taskId: null,
      type: "work",
      completed: true,
      duration: 1500,
      startedAt: "2026-05-06 11:00:00",
      endedAt: "2026-05-06 11:25:00",
      plan: "",
      completion: "",
      synced: true,
      updatedAt: "2026-05-06 11:25:00",
    });

    const store = useSessionStore();
    const ok = await store.deleteSession("sess-5");

    expect(ok).toBe(true);
    expect(mockDb.updateTask).not.toHaveBeenCalled();
  });

  it("taskStore 中找不到 task 时回退到 db.getTask（保证多端场景下也能回退计数）", async () => {
    mockDb.getSession.mockResolvedValue({
      id: "sess-6",
      taskId: "task-from-db",
      type: "work",
      completed: true,
      duration: 1500,
      startedAt: "2026-05-06 10:00:00",
      endedAt: "2026-05-06 10:25:00",
      plan: "",
      completion: "",
      synced: true,
      updatedAt: "2026-05-06 10:25:00",
    });
    mockGetTaskById.mockReturnValue(undefined); // 内存 store 中没有
    mockDb.getTask.mockResolvedValue({
      id: "task-from-db",
      actualPomodoros: 5,
    });

    const store = useSessionStore();
    const ok = await store.deleteSession("sess-6");

    expect(ok).toBe(true);
    expect(mockDb.getTask).toHaveBeenCalledWith("task-from-db");
    expect(mockDb.updateTask).toHaveBeenCalledWith("task-from-db", {
      actualPomodoros: 4,
    });
  });
});

// ============================================================
// loadAllSessions
// ============================================================
describe("sessionStore.loadAllSessions", () => {
  beforeEach(() => {
    mockDb.getAllSessions.mockReset();
  });

  it("应加载所有会话并更新内存状态", async () => {
    const sessions = [
      {
        id: "s1",
        type: "work",
        startedAt: "2026-05-19 10:00:00",
        duration: 1500,
        completed: true,
      },
      {
        id: "s2",
        type: "short_break",
        startedAt: "2026-05-19 10:25:00",
        duration: 300,
        completed: true,
      },
    ];
    mockDb.getAllSessions.mockResolvedValue(sessions);
    const store = useSessionStore();
    await store.loadAllSessions();
    expect(store.sessions).toHaveLength(2);
    expect(store.loading).toBe(false);
  });

  it("加载失败时应捕获异常并保持 loading=false", async () => {
    mockDb.getAllSessions.mockRejectedValue(new Error("DB error"));
    const store = useSessionStore();
    await store.loadAllSessions();
    expect(store.sessions).toHaveLength(0);
    expect(store.loading).toBe(false);
  });
});

// ============================================================
// addSession
// ============================================================
describe("sessionStore.addSession", () => {
  beforeEach(() => {
    mockDb.createSession.mockReset();
  });

  it("应创建会话并写入内存和事件", async () => {
    const input = {
      type: "work",
      duration: 1500,
      completed: true,
      startedAt: "2026-05-19 10:00:00",
      plan: "",
      completion: "",
      taskId: null,
    };
    const created = { id: "s-new", ...input };
    mockDb.createSession.mockResolvedValue(created);
    const store = useSessionStore();
    const result = await store.addSession(input as any);
    expect(result).toEqual(created);
    expect(store.sessions).toContainEqual(created);
    expect(mockRecordEvent).toHaveBeenCalledWith(
      "session.created",
      "s-new",
      created
    );
  });

  it("创建失败时应返回 null", async () => {
    mockDb.createSession.mockRejectedValue(new Error("fail"));
    const store = useSessionStore();
    const result = await store.addSession({} as any);
    expect(result).toBeNull();
  });
});

// ============================================================
// updateSession
// ============================================================
describe("sessionStore.updateSession", () => {
  beforeEach(() => {
    mockDb.updateSession.mockReset();
  });

  it("应更新会话并同步内存和事件", async () => {
    const existing = { id: "s1", type: "work", plan: "", completion: "" };
    const store = useSessionStore();
    store.sessions = [existing as any];
    const updated = {
      id: "s1",
      type: "work",
      plan: "new plan",
      completion: "",
    };
    mockDb.updateSession.mockResolvedValue(updated);
    const result = await store.updateSession("s1", { plan: "new plan" });
    expect(result).toEqual(updated);
    expect(store.sessions[0]).toEqual(updated);
    expect(mockRecordEvent).toHaveBeenCalledWith(
      "session.updated",
      "s1",
      updated
    );
  });

  it("更新返回 null 时不应修改内存或写事件", async () => {
    const store = useSessionStore();
    store.sessions = [{ id: "s1", type: "work" } as any];
    mockDb.updateSession.mockResolvedValue(null);
    const result = await store.updateSession("s1", { plan: "x" });
    expect(result).toBeNull();
    expect(mockRecordEvent).not.toHaveBeenCalled();
  });

  it("更新异常时应返回 null", async () => {
    mockDb.updateSession.mockRejectedValue(new Error("fail"));
    const store = useSessionStore();
    const result = await store.updateSession("s1", { plan: "x" });
    expect(result).toBeNull();
  });
});

// ============================================================
// getUnsyncedSessions
// ============================================================
describe("sessionStore.getUnsyncedSessions", () => {
  beforeEach(() => {
    mockDb.getUnsyncedSessions.mockReset();
  });

  it("应返回未同步会话", async () => {
    const unsynced = [{ id: "s1", synced: false }];
    mockDb.getUnsyncedSessions.mockResolvedValue(unsynced);
    const store = useSessionStore();
    const result = await store.getUnsyncedSessions();
    expect(result).toEqual(unsynced);
  });

  it("异常时应返回空数组", async () => {
    mockDb.getUnsyncedSessions.mockRejectedValue(new Error("fail"));
    const store = useSessionStore();
    const result = await store.getUnsyncedSessions();
    expect(result).toEqual([]);
  });
});

// ============================================================
// computed getters
// ============================================================
describe("sessionStore.computed getters", () => {
  it("todaySessions 应过滤今日会话", () => {
    const today = new Date().toISOString().slice(0, 10);
    const store = useSessionStore();
    store.sessions = [
      {
        id: "s1",
        startedAt: `${today} 10:00:00`,
        type: "work",
        completed: true,
      },
      {
        id: "s2",
        startedAt: "2025-01-01 10:00:00",
        type: "work",
        completed: true,
      },
    ] as any[];
    expect(store.todaySessions).toHaveLength(1);
    expect(store.todaySessions[0].id).toBe("s1");
  });

  it("todayPomodoros 应统计今日已完成 work", () => {
    const today = new Date().toISOString().slice(0, 10);
    const store = useSessionStore();
    store.sessions = [
      {
        id: "s1",
        startedAt: `${today} 10:00:00`,
        type: "work",
        completed: true,
      },
      {
        id: "s2",
        startedAt: `${today} 10:30:00`,
        type: "work",
        completed: false,
      },
      {
        id: "s3",
        startedAt: `${today} 11:00:00`,
        type: "short_break",
        completed: true,
      },
    ] as any[];
    expect(store.todayPomodoros).toBe(1);
  });

  it("getSessionsByDateRange 应返回范围内会话", () => {
    const store = useSessionStore();
    store.sessions = [
      { id: "s1", startedAt: "2026-05-10 10:00:00", type: "work" },
      { id: "s2", startedAt: "2026-05-15 10:00:00", type: "work" },
      { id: "s3", startedAt: "2026-05-20 10:00:00", type: "work" },
    ] as any[];
    const result = store.getSessionsByDateRange("2026-05-12", "2026-05-18");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("s2");
  });

  it("getSessionsByTask 应过滤指定任务", () => {
    const store = useSessionStore();
    store.sessions = [
      { id: "s1", taskId: "t1", type: "work" },
      { id: "s2", taskId: "t2", type: "work" },
      { id: "s3", taskId: "t1", type: "short_break" },
    ] as any[];
    const result = store.getSessionsByTask("t1");
    expect(result).toHaveLength(2);
  });
});
