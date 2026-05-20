// ============================================================
// task store 回归测试
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

const mockDb = vi.hoisted(() => ({
  getAllTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  getTasksByDate: vi.fn(),
  getTask: vi.fn(),
  upsertTask: vi.fn(),
}));

const mockRecordEvent = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockMarkTombstone = vi.hoisted(() =>
  vi.fn().mockResolvedValue(undefined)
);

vi.mock("@/services/database", () => ({ db: mockDb }));

vi.mock("@/stores/sync", () => ({
  useSyncStore: () => ({ recordEvent: mockRecordEvent }),
}));

vi.mock("@/services/outbox", () => ({
  markTombstone: mockMarkTombstone,
}));

const { useTaskStore } = await import("./task");

function createMockTask(
  overrides: Partial<ReturnType<typeof useTaskStore>["tasks"][number]> = {}
) {
  return {
    id: "task-1",
    title: "测试任务",
    description: "",
    status: "todo" as const,
    priority: "medium" as const,
    estimatedPomodoros: 1,
    actualPomodoros: 0,
    tags: ["工作"],
    dueDate: null,
    plan: "",
    completion: "",
    createdAt: "2026-05-01 10:00:00",
    updatedAt: "2026-05-01 10:00:00",
    synced: false,
    ...overrides,
  };
}

beforeEach(() => {
  setActivePinia(createPinia());
  mockDb.getAllTasks.mockReset();
  mockDb.createTask.mockReset();
  mockDb.updateTask.mockReset();
  mockDb.deleteTask.mockReset();
  mockDb.getTasksByDate.mockReset();
  mockRecordEvent.mockReset().mockResolvedValue(undefined);
  mockMarkTombstone.mockReset().mockResolvedValue(undefined);
});

// ============================================================
// loadTasks
// ============================================================
describe("loadTasks", () => {
  it("应正确加载任务列表", async () => {
    const tasks = [createMockTask({ id: "t1" }), createMockTask({ id: "t2" })];
    mockDb.getAllTasks.mockResolvedValue(tasks);
    const store = useTaskStore();
    await store.loadTasks();
    expect(store.tasks).toEqual(tasks);
    expect(store.loading).toBe(false);
  });

  it("加载失败时应捕获异常", async () => {
    mockDb.getAllTasks.mockRejectedValue(new Error("db error"));
    const store = useTaskStore();
    await store.loadTasks();
    expect(store.tasks).toEqual([]);
    expect(store.loading).toBe(false);
  });
});

// ============================================================
// createTask
// ============================================================
describe("createTask", () => {
  it("应创建任务并 prepend 到列表", async () => {
    const input = {
      title: "新任务",
      priority: "high",
      estimatedPomodoros: 2,
    } as Parameters<typeof mockDb.createTask>[0];
    const created = createMockTask({ id: "new-1", title: "新任务" });
    mockDb.createTask.mockResolvedValue(created);
    const store = useTaskStore();
    const result = await store.createTask(input);
    expect(result).toEqual(created);
    expect(store.tasks[0]).toEqual(created);
    expect(mockRecordEvent).toHaveBeenCalledWith(
      "task.created",
      "new-1",
      created
    );
  });

  it("创建失败时应返回 null", async () => {
    mockDb.createTask.mockRejectedValue(new Error("fail"));
    const store = useTaskStore();
    const result = await store.createTask({ title: "x" } as Parameters<
      typeof mockDb.createTask
    >[0]);
    expect(result).toBeNull();
  });
});

// ============================================================
// updateTask
// ============================================================
describe("updateTask", () => {
  it("应更新任务并同步本地列表", async () => {
    const existing = createMockTask({ id: "t1", title: "旧标题" });
    const updated = createMockTask({ id: "t1", title: "新标题" });
    mockDb.getAllTasks.mockResolvedValue([existing]);
    mockDb.updateTask.mockResolvedValue(updated);
    const store = useTaskStore();
    await store.loadTasks();
    const result = await store.updateTask("t1", { title: "新标题" });
    expect(result).toEqual(updated);
    expect(store.tasks[0].title).toBe("新标题");
    expect(mockRecordEvent).toHaveBeenCalledWith("task.updated", "t1", updated);
  });

  it("更新失败时应返回 null", async () => {
    mockDb.updateTask.mockRejectedValue(new Error("fail"));
    const store = useTaskStore();
    const result = await store.updateTask("t1", { title: "x" });
    expect(result).toBeNull();
  });

  it("找不到任务时列表不变", async () => {
    mockDb.updateTask.mockResolvedValue(null);
    const store = useTaskStore();
    const result = await store.updateTask("missing", { title: "x" });
    expect(result).toBeNull();
  });
});

// ============================================================
// deleteTask
// ============================================================
describe("deleteTask", () => {
  it("应删除任务并写 tombstone + 事件", async () => {
    const task = createMockTask({ id: "t-del" });
    mockDb.getAllTasks.mockResolvedValue([task]);
    mockDb.deleteTask.mockResolvedValue(true);
    const store = useTaskStore();
    await store.loadTasks();
    const ok = await store.deleteTask("t-del");
    expect(ok).toBe(true);
    expect(store.tasks).toHaveLength(0);
    expect(mockMarkTombstone).toHaveBeenCalledWith("task", "t-del");
    expect(mockRecordEvent).toHaveBeenCalledWith("task.deleted", "t-del", {
      id: "t-del",
    });
  });

  it("删除失败时应返回 false", async () => {
    mockDb.deleteTask.mockResolvedValue(false);
    const store = useTaskStore();
    const ok = await store.deleteTask("t1");
    expect(ok).toBe(false);
    expect(mockMarkTombstone).not.toHaveBeenCalled();
  });
});

// ============================================================
// getTaskById
// ============================================================
describe("getTaskById", () => {
  it("应返回指定任务", async () => {
    const tasks = [createMockTask({ id: "t1" }), createMockTask({ id: "t2" })];
    mockDb.getAllTasks.mockResolvedValue(tasks);
    const store = useTaskStore();
    await store.loadTasks();
    expect(store.getTaskById("t2")?.id).toBe("t2");
    expect(store.getTaskById("missing")).toBeUndefined();
  });
});

// ============================================================
// setFilter / clearFilter
// ============================================================
describe("filter", () => {
  it("setFilter 应合并筛选条件", () => {
    const store = useTaskStore();
    store.setFilter({ status: "todo" });
    expect(store.filter.status).toBe("todo");
    store.setFilter({ priority: "high" });
    expect(store.filter).toEqual({ status: "todo", priority: "high" });
  });

  it("clearFilter 应重置筛选", () => {
    const store = useTaskStore();
    store.setFilter({ status: "todo" });
    store.clearFilter();
    expect(store.filter).toEqual({});
  });
});

// ============================================================
// setSort
// ============================================================
describe("setSort", () => {
  it("应设置排序字段和方向", () => {
    const store = useTaskStore();
    store.setSort("title", "asc");
    expect(store.sort).toEqual({ field: "title", order: "asc" });
  });
});

// ============================================================
// toggleTaskStatus
// ============================================================
describe("toggleTaskStatus", () => {
  it("todo → in_progress", async () => {
    const task = createMockTask({ id: "t1", status: "todo" });
    mockDb.getAllTasks.mockResolvedValue([task]);
    mockDb.updateTask.mockImplementation((_id, input) =>
      Promise.resolve({ ...task, ...input, updatedAt: "2026-05-01 12:00:00" })
    );
    const store = useTaskStore();
    await store.loadTasks();
    await store.toggleTaskStatus("t1");
    expect(mockDb.updateTask).toHaveBeenCalledWith("t1", {
      status: "in_progress",
    });
  });

  it("in_progress → done", async () => {
    const task = createMockTask({ id: "t1", status: "in_progress" });
    mockDb.getAllTasks.mockResolvedValue([task]);
    mockDb.updateTask.mockImplementation((_id, input) =>
      Promise.resolve({ ...task, ...input, updatedAt: "2026-05-01 12:00:00" })
    );
    const store = useTaskStore();
    await store.loadTasks();
    await store.toggleTaskStatus("t1");
    expect(mockDb.updateTask).toHaveBeenCalledWith("t1", { status: "done" });
  });

  it("done → todo", async () => {
    const task = createMockTask({ id: "t1", status: "done" });
    mockDb.getAllTasks.mockResolvedValue([task]);
    mockDb.updateTask.mockImplementation((_id, input) =>
      Promise.resolve({ ...task, ...input, updatedAt: "2026-05-01 12:00:00" })
    );
    const store = useTaskStore();
    await store.loadTasks();
    await store.toggleTaskStatus("t1");
    expect(mockDb.updateTask).toHaveBeenCalledWith("t1", { status: "todo" });
  });

  it("archived → todo", async () => {
    const task = createMockTask({ id: "t1", status: "archived" });
    mockDb.getAllTasks.mockResolvedValue([task]);
    mockDb.updateTask.mockImplementation((_id, input) =>
      Promise.resolve({ ...task, ...input, updatedAt: "2026-05-01 12:00:00" })
    );
    const store = useTaskStore();
    await store.loadTasks();
    await store.toggleTaskStatus("t1");
    expect(mockDb.updateTask).toHaveBeenCalledWith("t1", { status: "todo" });
  });

  it("找不到任务时返回 null", async () => {
    const store = useTaskStore();
    const result = await store.toggleTaskStatus("missing");
    expect(result).toBeNull();
  });
});

// ============================================================
// archiveTask
// ============================================================
describe("archiveTask", () => {
  it("应归档任务", async () => {
    const task = createMockTask({ id: "t1", status: "done" });
    mockDb.getAllTasks.mockResolvedValue([task]);
    mockDb.updateTask.mockImplementation((_id, input) =>
      Promise.resolve({ ...task, ...input })
    );
    const store = useTaskStore();
    await store.loadTasks();
    await store.archiveTask("t1");
    expect(mockDb.updateTask).toHaveBeenCalledWith("t1", {
      status: "archived",
    });
  });
});

// ============================================================
// getTasksByDate
// ============================================================
describe("getTasksByDate", () => {
  it("应返回指定日期的任务", async () => {
    const tasks = [createMockTask({ id: "t1" })];
    mockDb.getTasksByDate.mockResolvedValue(tasks);
    const store = useTaskStore();
    const result = await store.getTasksByDate("2026-05-01");
    expect(result).toEqual(tasks);
  });

  it("失败时返回空数组", async () => {
    mockDb.getTasksByDate.mockRejectedValue(new Error("fail"));
    const store = useTaskStore();
    const result = await store.getTasksByDate("2026-05-01");
    expect(result).toEqual([]);
  });
});

// ============================================================
// 计算属性
// ============================================================
describe("computed", () => {
  function seed(store: ReturnType<typeof useTaskStore>) {
    store.tasks = [
      createMockTask({
        id: "t1",
        status: "todo",
        priority: "low",
        tags: ["A"],
        estimatedPomodoros: 1,
        actualPomodoros: 0,
      }),
      createMockTask({
        id: "t2",
        status: "in_progress",
        priority: "high",
        tags: ["B"],
        estimatedPomodoros: 2,
        actualPomodoros: 1,
      }),
      createMockTask({
        id: "t3",
        status: "done",
        priority: "urgent",
        tags: ["A", "C"],
        estimatedPomodoros: 3,
        actualPomodoros: 2,
      }),
      createMockTask({
        id: "t4",
        status: "archived",
        priority: "medium",
        tags: [],
        estimatedPomodoros: 0,
        actualPomodoros: 0,
      }),
    ];
  }

  it("stats 应正确统计", () => {
    const store = useTaskStore();
    seed(store);
    expect(store.stats).toEqual({
      total: 4,
      todo: 1,
      inProgress: 1,
      done: 1,
      archived: 1,
      totalEstimated: 6,
      totalActual: 3,
    });
  });

  it("allTags 应返回排序后的唯一标签", () => {
    const store = useTaskStore();
    seed(store);
    expect(store.allTags).toEqual(["A", "B", "C"]);
  });

  it("activeTasks 应排除归档", () => {
    const store = useTaskStore();
    seed(store);
    expect(store.activeTasks).toHaveLength(3);
    expect(
      store.activeTasks.find((t) => t.status === "archived")
    ).toBeUndefined();
  });

  it("inProgressTasks 应仅返回 in_progress", () => {
    const store = useTaskStore();
    seed(store);
    expect(store.inProgressTasks).toHaveLength(1);
    expect(store.inProgressTasks[0].id).toBe("t2");
  });

  it("filteredTasks 应按状态筛选", () => {
    const store = useTaskStore();
    seed(store);
    store.setFilter({ status: "todo" });
    expect(store.filteredTasks).toHaveLength(1);
    expect(store.filteredTasks[0].id).toBe("t1");
  });

  it("filteredTasks 应按优先级筛选", () => {
    const store = useTaskStore();
    seed(store);
    store.setFilter({ priority: "high" });
    expect(store.filteredTasks).toHaveLength(1);
    expect(store.filteredTasks[0].id).toBe("t2");
  });

  it("filteredTasks 应按标签筛选", () => {
    const store = useTaskStore();
    seed(store);
    store.setFilter({ tag: "A" });
    expect(store.filteredTasks).toHaveLength(2);
  });

  it("filteredTasks 应按搜索关键词筛选", () => {
    const store = useTaskStore();
    seed(store);
    store.tasks[0].title = "hello world";
    store.setFilter({ search: "hello" });
    expect(store.filteredTasks).toHaveLength(1);
    expect(store.filteredTasks[0].id).toBe("t1");
  });

  it("filteredTasks 应按日期范围筛选", () => {
    const store = useTaskStore();
    seed(store);
    store.tasks[0].createdAt = "2026-05-10 10:00:00";
    store.tasks[1].createdAt = "2026-05-15 10:00:00";
    store.tasks[2].createdAt = "2026-05-20 10:00:00";
    store.setFilter({ dateFrom: "2026-05-10", dateTo: "2026-05-15" });
    expect(store.filteredTasks).toHaveLength(2);
  });

  it("filteredTasks 默认排除归档", () => {
    const store = useTaskStore();
    seed(store);
    store.clearFilter();
    expect(
      store.filteredTasks.find((t) => t.status === "archived")
    ).toBeUndefined();
  });

  it("filteredTasks 明确筛选 archived 时包含归档", () => {
    const store = useTaskStore();
    seed(store);
    store.setFilter({ status: "archived" });
    expect(store.filteredTasks).toHaveLength(1);
    expect(store.filteredTasks[0].id).toBe("t4");
  });

  it("filteredTasks 应按优先级排序", () => {
    const store = useTaskStore();
    seed(store);
    store.clearFilter();
    store.setSort("priority", "asc");
    // t4 is archived and excluded by default
    expect(store.filteredTasks.map((t) => t.id)).toEqual(["t1", "t2", "t3"]);
  });

  it("filteredTasks 应按标题排序", () => {
    const store = useTaskStore();
    seed(store);
    store.tasks[0].title = "Zebra";
    store.tasks[1].title = "Apple";
    store.tasks[2].title = "Mango";
    store.setSort("title", "asc");
    expect(store.filteredTasks.map((t) => t.id)).toEqual(["t2", "t3", "t1"]);
  });

  it("filteredTasks 应按 dueDate 排序（null 视为最大）", () => {
    const store = useTaskStore();
    seed(store);
    store.tasks[0].dueDate = "2026-05-20";
    store.tasks[1].dueDate = null;
    store.tasks[2].dueDate = "2026-05-10";
    store.setSort("dueDate", "asc");
    // t2=null -> 9999-12-31 (largest), t3=2026-05-10, t1=2026-05-20
    expect(store.filteredTasks.map((t) => t.id)).toEqual(["t3", "t1", "t2"]);
  });

  it("filteredTasks 应按 createdAt 排序", () => {
    const store = useTaskStore();
    seed(store);
    store.tasks[0].createdAt = "2026-05-03 10:00:00";
    store.tasks[1].createdAt = "2026-05-01 10:00:00";
    store.tasks[2].createdAt = "2026-05-02 10:00:00";
    store.setSort("createdAt", "asc");
    // t2=2026-05-01, t3=2026-05-02, t1=2026-05-03
    expect(store.filteredTasks.map((t) => t.id)).toEqual(["t2", "t3", "t1"]);
  });

  it("filteredTasks 应按 updatedAt 排序", () => {
    const store = useTaskStore();
    seed(store);
    store.tasks[0].updatedAt = "2026-05-03 10:00:00";
    store.tasks[1].updatedAt = "2026-05-01 10:00:00";
    store.tasks[2].updatedAt = "2026-05-02 10:00:00";
    store.setSort("updatedAt", "desc");
    expect(store.filteredTasks.map((t) => t.id)).toEqual(["t1", "t3", "t2"]);
  });
});
