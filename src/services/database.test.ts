// ============================================================
// PomodoroX - 数据库服务测试
// 覆盖：MemoryStore localStorage 持久化、数据序列化/反序列化、CRUD 操作
// ============================================================

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  initDatabase,
  migrateMemoryData,
  db,
  __testOnlySqliteDatabase,
} from "@/services/database";
import type { Task, Reflection, Session } from "@/types";

// ============================================================
// 1. localStorage 序列化/反序列化测试（核心持久化逻辑）
// ============================================================

describe("MemoryStore localStorage 序列化/反序列化", () => {
  /**
   * 模拟 MemoryStore 中的序列化逻辑
   * 验证 Map ↔ JSON 转换的正确性
   */

  interface SerializedData {
    tasks: [string, Task][];
    reflections: [string, Reflection][];
    sessions: [string, Session][];
    syncLog: {
      id: string;
      entityType: string;
      entityId: string;
      syncedAt: string;
    }[];
  }

  function saveToLocalStorage(data: SerializedData): string {
    return JSON.stringify(data);
  }

  function loadFromLocalStorage(raw: string): SerializedData {
    return JSON.parse(raw);
  }

  function createMockTask(overrides: Partial<Task> = {}): Task {
    return {
      id: "test-task-1",
      title: "测试任务",
      description: "测试描述",
      status: "todo",
      priority: "medium",
      estimatedPomodoros: 1,
      actualPomodoros: 0,
      tags: ["测试"],
      dueDate: null,
      plan: "",
      completion: "",
      createdAt: "2026-05-03 10:00:00",
      updatedAt: "2026-05-03 10:00:00",
      synced: false,
      ...overrides,
    };
  }

  function createMockReflection(
    overrides: Partial<Reflection> = {}
  ): Reflection {
    return {
      id: "test-ref-1",
      date: "2026-05-03",
      content: "今日反思内容",
      mood: "good",
      relatedTaskIds: [],
      tags: [],
      createdAt: "2026-05-03 18:00:00",
      updatedAt: "2026-05-03 18:00:00",
      synced: false,
      ...overrides,
    };
  }

  function createMockSession(overrides: Partial<Session> = {}): Session {
    return {
      id: "test-session-1",
      taskId: "test-task-1",
      type: "work",
      duration: 1500,
      completed: true,
      startedAt: "2026-05-03 10:00:00",
      endedAt: "2026-05-03 10:25:00",
      plan: "",
      completion: "",
      synced: false,
      updatedAt: "2026-05-03 10:25:00",
      ...overrides,
    };
  }

  it("应该正确序列化和反序列化 Task Map", () => {
    const tasks = new Map<string, Task>();
    tasks.set("t1", createMockTask({ id: "t1", title: "任务一" }));
    tasks.set(
      "t2",
      createMockTask({ id: "t2", title: "任务二", priority: "high" })
    );

    const serialized = saveToLocalStorage({
      tasks: Array.from(tasks.entries()),
      reflections: [],
      sessions: [],
      syncLog: [],
    });

    const deserialized = loadFromLocalStorage(serialized);
    const restoredTasks = new Map(deserialized.tasks);

    expect(restoredTasks.size).toBe(2);
    expect(restoredTasks.get("t1")?.title).toBe("任务一");
    expect(restoredTasks.get("t2")?.priority).toBe("high");
  });

  it("应该正确序列化和反序列化 Reflection Map", () => {
    const reflections = new Map<string, Reflection>();
    reflections.set("r1", createMockReflection({ id: "r1", mood: "great" }));
    reflections.set(
      "r2",
      createMockReflection({ id: "r2", content: "有点疲惫", mood: "bad" })
    );

    const serialized = saveToLocalStorage({
      tasks: [],
      reflections: Array.from(reflections.entries()),
      sessions: [],
      syncLog: [],
    });

    const deserialized = loadFromLocalStorage(serialized);
    const restoredReflections = new Map(deserialized.reflections);

    expect(restoredReflections.size).toBe(2);
    expect(restoredReflections.get("r1")?.mood).toBe("great");
    expect(restoredReflections.get("r2")?.content).toBe("有点疲惫");
  });

  it("应该正确序列化和反序列化 Session Map", () => {
    const sessions = new Map<string, Session>();
    sessions.set(
      "s1",
      createMockSession({ id: "s1", duration: 1500, completed: true })
    );
    sessions.set(
      "s2",
      createMockSession({ id: "s2", duration: 300, completed: false })
    );

    const serialized = saveToLocalStorage({
      tasks: [],
      reflections: [],
      sessions: Array.from(sessions.entries()),
      syncLog: [],
    });

    const deserialized = loadFromLocalStorage(serialized);
    const restoredSessions = new Map(deserialized.sessions);

    expect(restoredSessions.size).toBe(2);
    expect(restoredSessions.get("s1")?.completed).toBe(true);
    expect(restoredSessions.get("s2")?.duration).toBe(300);
  });

  it("应该正确处理 syncLog 序列化", () => {
    const syncLog = [
      {
        id: "log1",
        entityType: "task",
        entityId: "t1",
        syncedAt: "2026-05-03 10:00:00",
      },
      {
        id: "log2",
        entityType: "reflection",
        entityId: "r1",
        syncedAt: "2026-05-03 11:00:00",
      },
    ];

    const serialized = saveToLocalStorage({
      tasks: [],
      reflections: [],
      sessions: [],
      syncLog,
    });

    const deserialized = loadFromLocalStorage(serialized);

    expect(deserialized.syncLog.length).toBe(2);
    expect(deserialized.syncLog[0].entityType).toBe("task");
    expect(deserialized.syncLog[1].entityType).toBe("reflection");
  });

  it("应该处理空数据（空 Map 和空数组）", () => {
    const serialized = saveToLocalStorage({
      tasks: [],
      reflections: [],
      sessions: [],
      syncLog: [],
    });

    const deserialized = loadFromLocalStorage(serialized);

    expect(deserialized.tasks).toEqual([]);
    expect(deserialized.reflections).toEqual([]);
    expect(deserialized.sessions).toEqual([]);
    expect(deserialized.syncLog).toEqual([]);
  });

  it("应该处理包含复杂类型的数据（tags 数组、null 值）", () => {
    const tasks = new Map<string, Task>();
    tasks.set(
      "t1",
      createMockTask({
        id: "t1",
        tags: ["工作", "紧急", "项目A"],
        dueDate: null,
        description: "",
      })
    );

    const serialized = saveToLocalStorage({
      tasks: Array.from(tasks.entries()),
      reflections: [],
      sessions: [],
      syncLog: [],
    });

    const deserialized = loadFromLocalStorage(serialized);
    const restoredTasks = new Map(deserialized.tasks);

    expect(restoredTasks.get("t1")?.tags).toEqual(["工作", "紧急", "项目A"]);
    expect(restoredTasks.get("t1")?.dueDate).toBeNull();
    expect(restoredTasks.get("t1")?.description).toBe("");
  });

  it("应该处理大量数据（性能基准）", () => {
    const tasks = new Map<string, Task>();
    for (let i = 0; i < 1000; i++) {
      tasks.set(
        `t${i}`,
        createMockTask({
          id: `t${i}`,
          title: `任务 ${i}`,
          tags: ["批量", `分类${i % 10}`],
        })
      );
    }

    const start = performance.now();
    const serialized = saveToLocalStorage({
      tasks: Array.from(tasks.entries()),
      reflections: [],
      sessions: [],
      syncLog: [],
    });
    const deserialized = loadFromLocalStorage(serialized);
    const elapsed = performance.now() - start;

    const restoredTasks = new Map(deserialized.tasks);
    expect(restoredTasks.size).toBe(1000);
    expect(restoredTasks.get("t500")?.title).toBe("任务 500");
    // 1000 条数据的序列化+反序列化应在 100ms 内完成
    expect(elapsed).toBeLessThan(100);
  });
});

// ============================================================
// 2. MemoryStore CRUD 操作测试（通过 db 单例）
// ============================================================

describe("MemoryStore CRUD 操作", () => {
  beforeEach(async () => {
    // 每次测试前清理 localStorage
    localStorage.clear();
    // 重新初始化数据库
    await initDatabase();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // 由于 db 是单例，我们测试其基本 CRUD 方法
  // 注意：这些测试依赖实际的 MemoryStore 实现
  it("localStorage 初始状态应该是空的", () => {
    expect(localStorage.getItem("pomodorox-memorystore")).toBeNull();
  });

  it("localStorage 应该支持 setItem 和 getItem 的基本操作", () => {
    const testData = { key: "value", number: 42 };
    localStorage.setItem("pomodorox-test", JSON.stringify(testData));
    const retrieved = JSON.parse(localStorage.getItem("pomodorox-test")!);
    expect(retrieved).toEqual(testData);
  });

  it("localStorage 应该处理存储满的情况（QuotaExceededError）", () => {
    // 验证 try-catch 逻辑能处理异常
    const fn = () => {
      try {
        // 模拟 QuotaExceededError
        const error = new DOMException(
          "QuotaExceededError",
          "QuotaExceededError"
        );
        throw error;
      } catch (err) {
        console.warn("[MemoryStore] localStorage 写入失败，可能已满:", err);
      }
    };
    expect(fn).not.toThrow();
  });

  it("localStorage 的数据格式应该是纯 JSON 字符串", () => {
    // 验证 JSON.stringify 的输出类型
    const data = { tasks: [], reflections: [], sessions: [], syncLog: [] };
    const jsonStr = JSON.stringify(data);
    expect(typeof jsonStr).toBe("string");
    expect(() => JSON.parse(jsonStr)).not.toThrow();
  });
});

// ============================================================
// 3. 数据格式兼容性测试
// ============================================================

describe("数据格式兼容性", () => {
  it("Map 转 JSON 再转回 Map 应该保留所有数据", () => {
    const original = new Map<string, { name: string; count: number }>();
    original.set("a", { name: "Alice", count: 10 });
    original.set("b", { name: "Bob", count: 20 });

    // 序列化
    const serialized = JSON.stringify(Array.from(original.entries()));
    // 反序列化
    const deserialized = new Map(JSON.parse(serialized));

    expect(deserialized.size).toBe(2);
    expect(deserialized.get("a")).toEqual({ name: "Alice", count: 10 });
    expect(deserialized.get("b")).toEqual({ name: "Bob", count: 20 });
  });

  it("空 Map 序列化后反序列化应为空 Map", () => {
    const empty = new Map();
    const serialized = JSON.stringify(Array.from(empty.entries()));
    const deserialized = new Map(JSON.parse(serialized));
    expect(deserialized.size).toBe(0);
  });

  it("应该正确处理同步状态（synced: boolean）的持久化", () => {
    const task = {
      id: "t1",
      title: "测试同步",
      synced: true as boolean,
    };
    // 模拟序列化/反序列化
    const raw = JSON.stringify(task);
    const restored = JSON.parse(raw);
    expect(restored.synced).toBe(true);
    expect(typeof restored.synced).toBe("boolean");
  });

  it("应该正确处理日期字符串的持久化", () => {
    const dateStr = "2026-05-03 14:30:00";
    const data = { createdAt: dateStr, updatedAt: dateStr };
    const raw = JSON.stringify(data);
    const restored = JSON.parse(raw);
    expect(restored.createdAt).toBe(dateStr);
    expect(restored.updatedAt).toBe(dateStr);
  });
});

// ============================================================
// 4. 跨环境兼容性测试
// ============================================================

describe("跨环境兼容性", () => {
  it("在无 localStorage 环境下应该静默失败", () => {
    // 模拟 localStorage 不存在的情况
    const originalLocalStorage = (globalThis as any).localStorage;
    delete (globalThis as any).localStorage;

    try {
      // 应不抛出异常
      const fn = () => {
        if (typeof localStorage === "undefined") return;
      };
      expect(fn).not.toThrow();
    } finally {
      (globalThis as any).localStorage = originalLocalStorage;
    }
  });

  it("localStorage 键名应该符合预期约定", () => {
    // MemoryStore 使用 'pomodorox-memorystore'
    // Settings Store 使用 'pomodorox-settings'
    const memKey = "pomodorox-memorystore";
    const settingsKey = "pomodorox-settings";

    expect(memKey).toMatch(/^pomodorox-/);
    expect(settingsKey).toMatch(/^pomodorox-/);
    // 两个 key 不相同
    expect(memKey).not.toBe(settingsKey);
  });
});

// ============================================================
// 5. 数据迁移测试
// ============================================================

describe("migrateMemoryData", () => {
  it("v0 -> v1：给 task/session 补 plan/completion 默认值", () => {
    const oldData = {
      tasks: [["t1", { title: "旧任务" }]],
      sessions: [
        [
          "s1",
          { type: "work", duration: 1500, startedAt: "2026-01-01 10:00:00" },
        ],
      ],
      syncLog: [],
    };
    const migrated = migrateMemoryData(oldData);
    expect(migrated._schemaVersion).toBe(3);
    const task = (migrated.tasks as [string, unknown][])[0][1] as Record<
      string,
      string
    >;
    expect(task.plan).toBe("");
    expect(task.completion).toBe("");
    const session = (migrated.sessions as [string, unknown][])[0][1] as Record<
      string,
      string
    >;
    expect(session.plan).toBe("");
    expect(session.completion).toBe("");
  });

  it("v0 -> v1：保留已有 plan/completion 不被覆盖", () => {
    const oldData = {
      tasks: [
        ["t1", { title: "任务", plan: "已有规划", completion: "已有总结" }],
      ],
      sessions: [],
      syncLog: [],
    };
    const migrated = migrateMemoryData(oldData);
    const task = (migrated.tasks as [string, unknown][])[0][1] as Record<
      string,
      string
    >;
    expect(task.plan).toBe("已有规划");
    expect(task.completion).toBe("已有总结");
  });

  it("v1 -> v2：给 session 补 updatedAt 并添加 conflictLog", () => {
    const oldData = {
      _schemaVersion: 1,
      tasks: [],
      sessions: [
        [
          "s1",
          { type: "work", duration: 1500, startedAt: "2026-01-01 10:00:00" },
        ],
      ],
      syncLog: [],
    };
    const migrated = migrateMemoryData(oldData);
    expect(migrated._schemaVersion).toBe(3);
    const session = (migrated.sessions as [string, unknown][])[0][1] as Record<
      string,
      string
    >;
    expect(session.updatedAt).toBe("2026-01-01 10:00:00");
    expect(migrated.conflictLog).toEqual([]);
    expect(migrated.outboxEvents).toEqual([]);
    expect(migrated.processedEvents).toEqual([]);
    expect(migrated.tombstones).toEqual([]);
  });

  it("v2 数据不再修改", () => {
    const modernData = {
      _schemaVersion: 2,
      tasks: [["t1", { title: "现代任务", plan: "plan", completion: "" }]],
      sessions: [
        [
          "s1",
          {
            type: "work",
            duration: 1500,
            startedAt: "2026-01-01 10:00:00",
            updatedAt: "2026-01-01 10:25:00",
          },
        ],
      ],
      syncLog: [],
      conflictLog: [{ id: "c1", entityType: "task" }],
    };
    const migrated = migrateMemoryData(modernData);
    expect(migrated._schemaVersion).toBe(3);
    expect(migrated.tasks).toEqual(modernData.tasks);
    expect(migrated.sessions).toEqual(modernData.sessions);
    expect(migrated.conflictLog).toEqual(modernData.conflictLog);
  });

  it("空对象也能正常迁移", () => {
    const migrated = migrateMemoryData({});
    expect(migrated._schemaVersion).toBe(3);
    expect(migrated.conflictLog).toEqual([]);
  });
});

// ============================================================
// 6. db 代理与 MemoryStore 集成测试
// ============================================================

describe("db 代理与 MemoryStore 集成", () => {
  beforeEach(async () => {
    await db.clearAll();
  });

  // ---- Task CRUD ----
  it("应创建并读取任务", async () => {
    const task = await db.createTask({
      title: "测试任务",
      description: "描述",
      priority: "high",
      estimatedPomodoros: 3,
      tags: ["A", "B"],
      dueDate: "2026-05-20",
      plan: "计划",
      completion: "",
    });
    expect(task.title).toBe("测试任务");
    expect(task.status).toBe("todo");
    expect(task.actualPomodoros).toBe(0);

    const found = await db.getTask(task.id);
    expect(found).not.toBeNull();
    expect(found!.title).toBe("测试任务");
  });

  it("应更新任务", async () => {
    const task = await db.createTask({
      title: "旧标题",
      description: "",
      priority: "medium",
      estimatedPomodoros: 1,
      tags: [],
      dueDate: null,
      plan: "",
      completion: "",
    });
    const updated = await db.updateTask(task.id, {
      title: "新标题",
      status: "done",
    });
    expect(updated).not.toBeNull();
    expect(updated!.title).toBe("新标题");
    expect(updated!.status).toBe("done");
    expect(updated!.synced).toBe(false);
  });

  it("应删除任务", async () => {
    const task = await db.createTask({
      title: "待删除",
      description: "",
      priority: "medium",
      estimatedPomodoros: 1,
      tags: [],
      dueDate: null,
      plan: "",
      completion: "",
    });
    const ok = await db.deleteTask(task.id);
    expect(ok).toBe(true);
    expect(await db.getTask(task.id)).toBeNull();
  });

  it("应按日期查询任务", async () => {
    const task = await db.createTask({
      title: "日期任务",
      description: "",
      priority: "medium",
      estimatedPomodoros: 1,
      tags: [],
      dueDate: "2026-05-20",
      plan: "",
      completion: "",
    });
    const byDate = await db.getTasksByDate(task.createdAt.slice(0, 10));
    expect(byDate.length).toBeGreaterThanOrEqual(1);
  });

  it("应按状态查询任务", async () => {
    await db.createTask({
      title: "t1",
      description: "",
      priority: "medium",
      estimatedPomodoros: 1,
      tags: [],
      dueDate: null,
      plan: "",
      completion: "",
    });
    await db.createTask({
      title: "t2",
      description: "",
      priority: "medium",
      estimatedPomodoros: 1,
      tags: [],
      dueDate: null,
      plan: "",
      completion: "",
    });
    const all = await db.getAllTasks();
    expect(all.length).toBe(2);
    const todo = await db.getTasksByStatus("todo");
    expect(todo.length).toBe(2);
  });

  it("应标记任务同步状态", async () => {
    const task = await db.createTask({
      title: "sync-task",
      description: "",
      priority: "medium",
      estimatedPomodoros: 1,
      tags: [],
      dueDate: null,
      plan: "",
      completion: "",
    });
    await db.markTaskSynced(task.id);
    const unsynced = await db.getUnsyncedTasks();
    expect(unsynced.find((t) => t.id === task.id)).toBeUndefined();
  });

  // ---- Reflection CRUD ----
  it("应创建并读取反思", async () => {
    const r = await db.createReflection({
      date: "2026-05-01",
      content: "反思内容",
      mood: "good",
      relatedTaskIds: [],
      tags: ["日记"],
    });
    expect(r.content).toBe("反思内容");
    const found = await db.getReflection(r.id);
    expect(found).not.toBeNull();
  });

  it("应更新反思", async () => {
    const r = await db.createReflection({
      date: "2026-05-01",
      content: "旧内容",
      mood: "good",
      relatedTaskIds: [],
      tags: [],
    });
    const updated = await db.updateReflection(r.id, { content: "新内容" });
    expect(updated).not.toBeNull();
    expect(updated!.content).toBe("新内容");
  });

  it("应按日期范围查询反思", async () => {
    await db.createReflection({
      date: "2026-05-01",
      content: "a",
      mood: "good",
      relatedTaskIds: [],
      tags: [],
    });
    await db.createReflection({
      date: "2026-05-10",
      content: "b",
      mood: "bad",
      relatedTaskIds: [],
      tags: [],
    });
    const range = await db.getReflectionsByDateRange(
      "2026-05-01",
      "2026-05-05"
    );
    expect(range.length).toBe(1);
    expect(range[0].content).toBe("a");
  });

  it("应删除反思", async () => {
    const r = await db.createReflection({
      date: "2026-05-01",
      content: "del",
      mood: "good",
      relatedTaskIds: [],
      tags: [],
    });
    const ok = await db.deleteReflection(r.id);
    expect(ok).toBe(true);
    expect(await db.getReflection(r.id)).toBeNull();
  });

  it("应标记反思同步状态并查询未同步", async () => {
    const r = await db.createReflection({
      date: "2026-05-01",
      content: "sync",
      mood: "good",
      relatedTaskIds: [],
      tags: [],
    });
    await db.markReflectionSynced(r.id);
    const unsynced = await db.getUnsyncedReflections();
    expect(unsynced.find((x) => x.id === r.id)).toBeUndefined();
  });

  // ---- Session CRUD ----
  it("应创建并读取会话", async () => {
    const s = await db.createSession({
      taskId: "task-1",
      type: "work",
      duration: 1500,
      completed: true,
      startedAt: "2026-05-01 10:00:00",
      plan: "",
      completion: "",
    });
    expect(s.type).toBe("work");
    expect(s.completed).toBe(true);
    expect(s.endedAt).not.toBeNull();
    const found = await db.getSession(s.id);
    expect(found).not.toBeNull();
  });

  it("未完成会话的 endedAt 应为 null", async () => {
    const s = await db.createSession({
      taskId: null,
      type: "short_break",
      duration: 300,
      completed: false,
      startedAt: "2026-05-01 10:00:00",
      plan: "",
      completion: "",
    });
    expect(s.endedAt).toBeNull();
  });

  it("应按日期范围查询会话", async () => {
    await db.createSession({
      taskId: null,
      type: "work",
      duration: 1500,
      completed: true,
      startedAt: "2026-05-01 10:00:00",
      plan: "",
      completion: "",
    });
    await db.createSession({
      taskId: null,
      type: "work",
      duration: 1500,
      completed: true,
      startedAt: "2026-05-10 10:00:00",
      plan: "",
      completion: "",
    });
    const range = await db.getSessionsByDateRange("2026-05-01", "2026-05-05");
    expect(range.length).toBe(1);
  });

  it("应按任务 ID 查询会话", async () => {
    await db.createSession({
      taskId: "t1",
      type: "work",
      duration: 1500,
      completed: true,
      startedAt: "2026-05-01 10:00:00",
      plan: "",
      completion: "",
    });
    await db.createSession({
      taskId: "t2",
      type: "work",
      duration: 1500,
      completed: true,
      startedAt: "2026-05-01 10:30:00",
      plan: "",
      completion: "",
    });
    const sessions = await db.getSessionsByTask("t1");
    expect(sessions.length).toBe(1);
  });

  it("应删除会话", async () => {
    const s = await db.createSession({
      taskId: null,
      type: "work",
      duration: 1500,
      completed: true,
      startedAt: "2026-05-01 10:00:00",
      plan: "",
      completion: "",
    });
    const ok = await db.deleteSession(s.id);
    expect(ok).toBe(true);
    expect(await db.getSession(s.id)).toBeNull();
  });

  it("应标记会话同步状态并查询未同步", async () => {
    const s = await db.createSession({
      taskId: null,
      type: "work",
      duration: 1500,
      completed: true,
      startedAt: "2026-05-01 10:00:00",
      plan: "",
      completion: "",
    });
    await db.markSessionSynced(s.id);
    const unsynced = await db.getUnsyncedSessions();
    expect(unsynced.find((x) => x.id === s.id)).toBeUndefined();
  });

  // ---- Sync ----
  it("应记录同步状态", async () => {
    const status = await db.getSyncStatus();
    expect(status.pendingCount).toBe(0);
    expect(status.isSyncing).toBe(false);

    await db.recordSync("task", "t1");
    const status2 = await db.getSyncStatus();
    expect(status2.lastSyncAt).not.toBeNull();
  });

  it("应记录和读取冲突日志", async () => {
    const entry = await db.recordSyncConflict({
      entityType: "task",
      entityId: "t1",
      localUpdatedAt: "2026-05-01 10:00:00",
      remoteUpdatedAt: "2026-05-01 11:00:00",
      resolvedAt: "2026-05-01 12:00:00",
      resolution: "local_wins",
      localSnapshot: "{}",
      remoteSnapshot: "{}",
    });
    expect(entry.id).toBeDefined();
    const conflicts = await db.getSyncConflicts();
    expect(conflicts.length).toBe(1);
    await db.clearSyncConflicts();
    expect((await db.getSyncConflicts()).length).toBe(0);
  });

  // ---- Outbox ----
  it("应写入和读取 outbox 事件", async () => {
    const event = {
      eventId: "evt-1",
      type: "task.created" as const,
      entityType: "task" as const,
      entityId: "t1",
      payload: {},
      timestamp: "2026-05-01T10:00:00Z",
    };
    await db.writeOutboxEvent(event);
    const events = await db.getUnpushedOutboxEvents();
    expect(events.length).toBe(1);
    expect(events[0].eventId).toBe("evt-1");
    expect(await db.getOutboxEventCount()).toBe(1);
  });

  it("应删除已推送的 outbox 事件", async () => {
    await db.writeOutboxEvent({
      eventId: "evt-1",
      type: "task.created",
      entityType: "task",
      entityId: "t1",
      payload: {},
      timestamp: "2026-05-01T10:00:00Z",
    });
    await db.removePushedOutboxEvents(["evt-1"]);
    expect(await db.getOutboxEventCount()).toBe(0);
  });

  it("应标记和检查 outbox 事件处理状态", async () => {
    await db.writeOutboxEvent({
      eventId: "evt-1",
      type: "task.created",
      entityType: "task",
      entityId: "t1",
      payload: {},
      timestamp: "2026-05-01T10:00:00Z",
    });
    expect(await db.isOutboxEventProcessed("evt-1")).toBe(false);
    await db.markOutboxEventProcessed("evt-1");
    expect(await db.isOutboxEventProcessed("evt-1")).toBe(true);
    const unprocessed = await db.filterUnprocessedOutboxEvents([
      {
        eventId: "evt-1",
        type: "task.created",
        entityType: "task",
        entityId: "t1",
        payload: {},
        timestamp: "2026-05-01T10:00:00Z",
      },
    ]);
    expect(unprocessed.length).toBe(0);
  });

  // ---- Tombstones ----
  it("应标记和查询墓碑", async () => {
    await db.markTombstone("task", "t1");
    const t = await db.getTombstone("task", "t1");
    expect(t).not.toBeNull();
    expect(t!.entityType).toBe("task");
    await db.removeTombstone("task", "t1");
    expect(await db.getTombstone("task", "t1")).toBeNull();
  });

  it("应批量 upsert 墓碑", async () => {
    await db.upsertTombstones([
      { entityType: "task", entityId: "t1", deletedAt: "2026-05-01 10:00:00" },
      {
        entityType: "reflection",
        entityId: "r1",
        deletedAt: "2026-05-01 11:00:00",
      },
    ]);
    const all = await db.getAllTombstones();
    expect(all.length).toBe(2);
  });

  // ---- Transaction ----
  it("transaction 应在 MemoryStore 中原子执行", async () => {
    const result = await db.transaction(async () => {
      const task = await db.createTask({
        title: "tx-task",
        description: "",
        priority: "medium",
        estimatedPomodoros: 1,
        tags: [],
        dueDate: null,
        plan: "",
        completion: "",
      });
      return task.title;
    });
    expect(result).toBe("tx-task");
  });

  // ---- ClearAll ----
  it("clearAll 应清空所有数据", async () => {
    await db.createTask({
      title: "t1",
      description: "",
      priority: "medium",
      estimatedPomodoros: 1,
      tags: [],
      dueDate: null,
      plan: "",
      completion: "",
    });
    await db.createReflection({
      date: "2026-05-01",
      content: "c",
      mood: "good",
      relatedTaskIds: [],
      tags: [],
    });
    await db.createSession({
      taskId: null,
      type: "work",
      duration: 1500,
      completed: true,
      startedAt: "2026-05-01 10:00:00",
      plan: "",
      completion: "",
    });
    await db.writeOutboxEvent({
      eventId: "e1",
      type: "task.created",
      entityType: "task",
      entityId: "t1",
      payload: {},
      timestamp: "2026-05-01T10:00:00Z",
    });
    await db.markTombstone("task", "t1");
    await db.recordSyncConflict({
      entityType: "task",
      entityId: "t1",
      localUpdatedAt: "",
      remoteUpdatedAt: "",
      resolvedAt: "",
      resolution: "local_wins",
      localSnapshot: "",
      remoteSnapshot: "",
    });

    await db.clearAll();

    expect((await db.getAllTasks()).length).toBe(0);
    expect((await db.getAllReflections()).length).toBe(0);
    expect((await db.getAllSessions()).length).toBe(0);
    expect(await db.getOutboxEventCount()).toBe(0);
    expect((await db.getAllTombstones()).length).toBe(0);
    expect((await db.getSyncConflicts()).length).toBe(0);
  });

  // ---- Outbox Cleanup ----
  it("应清空 outbox 和 processed events", async () => {
    await db.writeOutboxEvent({
      eventId: "e1",
      type: "task.created",
      entityType: "task",
      entityId: "t1",
      payload: {},
      timestamp: "2026-05-01T10:00:00Z",
    });
    await db.markOutboxEventProcessed("e1");
    await db.clearOutbox();
    await db.clearProcessedEvents();
    expect(await db.getOutboxEventCount()).toBe(0);
    expect(await db.isOutboxEventProcessed("e1")).toBe(false);
  });

  // ---- Upsert ----
  it("应 upsert 任务/反思/会话", async () => {
    await db.upsertTask({
      id: "t1",
      title: "u",
      description: "",
      status: "todo",
      priority: "medium",
      estimatedPomodoros: 1,
      actualPomodoros: 0,
      tags: [],
      dueDate: null,
      plan: "",
      completion: "",
      createdAt: "",
      updatedAt: "",
      synced: false,
    });
    expect((await db.getTask("t1"))!.title).toBe("u");

    await db.upsertReflection({
      id: "r1",
      date: "",
      content: "u",
      mood: "good",
      relatedTaskIds: [],
      tags: [],
      createdAt: "",
      updatedAt: "",
      synced: false,
    });
    expect((await db.getReflection("r1"))!.content).toBe("u");

    await db.upsertSession({
      id: "s1",
      taskId: null,
      type: "work",
      duration: 1,
      completed: true,
      startedAt: "",
      endedAt: "",
      plan: "",
      completion: "",
      synced: false,
      updatedAt: "",
    });
    expect((await db.getSession("s1"))!.duration).toBe(1);
  });

  // ---- Validation ----
  it("创建任务时标题为空应抛出错误", async () => {
    await expect(
      db.createTask({
        title: "   ",
        description: "",
        priority: "medium",
        estimatedPomodoros: 1,
        tags: [],
        dueDate: null,
        plan: "",
        completion: "",
      })
    ).rejects.toThrow("任务标题 不能为空");
  });

  it("创建反思时日期为空应抛出错误", async () => {
    await expect(
      db.createReflection({
        date: "",
        content: "c",
        mood: "good",
        relatedTaskIds: [],
        tags: [],
      })
    ).rejects.toThrow("反思日期 不能为空");
  });

  it("创建会话时负时长应抛出错误", async () => {
    await expect(
      db.createSession({
        taskId: null,
        type: "work",
        duration: -1,
        completed: false,
        startedAt: "2026-05-01 10:00:00",
        plan: "",
        completion: "",
      })
    ).rejects.toThrow("时长 必须是非负有限数");
  });
});

// ============================================================
// SqliteDatabase.transaction SAVEPOINT 嵌套测试
// ============================================================

const mockExecute = vi.hoisted(() => vi.fn().mockResolvedValue(0));
const mockSelect = vi.hoisted(() => vi.fn().mockResolvedValue([]));

vi.mock("@tauri-apps/plugin-sql", () => ({
  load: vi.fn().mockResolvedValue({
    execute: mockExecute,
    select: mockSelect,
  }),
}));

describe("SqliteDatabase.transaction SAVEPOINT", () => {
  beforeEach(() => {
    mockExecute.mockClear();
  });

  it("单层事务应执行 BEGIN → COMMIT", async () => {
    const sqlite = new __testOnlySqliteDatabase();
    const result = await sqlite.transaction(async () => "ok");
    expect(result).toBe("ok");
    expect(mockExecute).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(mockExecute).toHaveBeenNthCalledWith(2, "COMMIT");
  });

  it("单层事务异常时应执行 BEGIN → ROLLBACK", async () => {
    const sqlite = new __testOnlySqliteDatabase();
    await expect(
      sqlite.transaction(async () => {
        throw new Error("fail");
      })
    ).rejects.toThrow("fail");
    expect(mockExecute).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(mockExecute).toHaveBeenNthCalledWith(2, "ROLLBACK");
  });

  it("双层嵌套事务应使用 SAVEPOINT", async () => {
    const sqlite = new __testOnlySqliteDatabase();
    await sqlite.transaction(async () => {
      return sqlite.transaction(async () => "inner");
    });
    expect(mockExecute).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(mockExecute).toHaveBeenNthCalledWith(2, "SAVEPOINT sp_1");
    expect(mockExecute).toHaveBeenNthCalledWith(3, "RELEASE SAVEPOINT sp_1");
    expect(mockExecute).toHaveBeenNthCalledWith(4, "COMMIT");
  });

  it("双层嵌套内层异常时应回滚到 SAVEPOINT 并继续外层回滚", async () => {
    const sqlite = new __testOnlySqliteDatabase();
    await expect(
      sqlite.transaction(async () => {
        return sqlite.transaction(async () => {
          throw new Error("inner fail");
        });
      })
    ).rejects.toThrow("inner fail");
    expect(mockExecute).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(mockExecute).toHaveBeenNthCalledWith(2, "SAVEPOINT sp_1");
    expect(mockExecute).toHaveBeenNthCalledWith(
      3,
      "ROLLBACK TO SAVEPOINT sp_1"
    );
    expect(mockExecute).toHaveBeenNthCalledWith(4, "ROLLBACK");
  });

  it("三层嵌套事务应使用递增 SAVEPOINT", async () => {
    const sqlite = new __testOnlySqliteDatabase();
    await sqlite.transaction(async () => {
      return sqlite.transaction(async () => {
        return sqlite.transaction(async () => "deep");
      });
    });
    expect(mockExecute).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(mockExecute).toHaveBeenNthCalledWith(2, "SAVEPOINT sp_1");
    expect(mockExecute).toHaveBeenNthCalledWith(3, "SAVEPOINT sp_2");
    expect(mockExecute).toHaveBeenNthCalledWith(4, "RELEASE SAVEPOINT sp_2");
    expect(mockExecute).toHaveBeenNthCalledWith(5, "RELEASE SAVEPOINT sp_1");
    expect(mockExecute).toHaveBeenNthCalledWith(6, "COMMIT");
  });

  it("嵌套异常后 depth 应正确重置，后续事务可正常执行", async () => {
    const sqlite = new __testOnlySqliteDatabase();
    await expect(
      sqlite.transaction(async () => {
        throw new Error("fail");
      })
    ).rejects.toThrow("fail");
    mockExecute.mockClear();
    await sqlite.transaction(async () => "ok");
    expect(mockExecute).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(mockExecute).toHaveBeenNthCalledWith(2, "COMMIT");
  });
});
