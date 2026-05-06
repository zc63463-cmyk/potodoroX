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
  // 下列方法 useTaskStore 内部可能间接调用，留空 mock 防止崩溃
  getAllTasks: vi.fn().mockResolvedValue([]),
  upsertTask: vi.fn(),
  updateTask: vi.fn(),
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
    mockGetTaskById.mockReturnValue({
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
    expect(mockUpdateTask).toHaveBeenCalledWith("task-1", {
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
    expect(mockUpdateTask).not.toHaveBeenCalled();
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
    expect(mockUpdateTask).not.toHaveBeenCalled();
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
    expect(mockUpdateTask).not.toHaveBeenCalled();
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
    expect(mockUpdateTask).not.toHaveBeenCalled();
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
    expect(mockUpdateTask).toHaveBeenCalledWith("task-from-db", {
      actualPomodoros: 4,
    });
  });
});
