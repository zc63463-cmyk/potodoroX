// ============================================================
// sync store 回归测试
// ============================================================
//
// 覆盖路径 C 核心诉求：
// - recordEvent 离线时跳过同步
// - backgroundPull 离线时跳过同步
// - fullSyncAction 状态流转与错误处理
// - importRecords / exportFullBackup / importFullBackup
// - loadDbStats / clearAllData / exportAllData
//
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

// ---- hoisted mocks ----
const mockWriteEvent = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockGetUnpushedCount = vi.hoisted(() => vi.fn().mockResolvedValue(0));

const mockDb = vi.hoisted(() => ({
  getSyncStatus: vi
    .fn()
    .mockResolvedValue({ lastSyncAt: null, pendingCount: 0, isSyncing: false }),
  getAllTasks: vi.fn().mockResolvedValue([]),
  getAllReflections: vi.fn().mockResolvedValue([]),
  getAllSessions: vi.fn().mockResolvedValue([]),
  transaction: vi.fn((fn) => fn()),
  createTask: vi.fn(),
  createReflection: vi.fn(),
  createSession: vi.fn(),
  writeOutboxEvent: vi.fn().mockResolvedValue(undefined),
  getUnpushedOutboxEvents: vi.fn().mockResolvedValue([]),
  getAllTombstones: vi.fn().mockResolvedValue([]),
  clearAll: vi.fn().mockResolvedValue(undefined),
  upsertTask: vi.fn(),
  upsertReflection: vi.fn(),
  upsertSession: vi.fn(),
  upsertTombstones: vi.fn().mockResolvedValue(undefined),
}));

const mockSyncEvents = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    pushed: 0,
    pulled: 0,
    processed: 0,
    errors: 0,
  })
);
const mockIsOnline = vi.hoisted(() => vi.fn().mockReturnValue(true));
const mockIsConfiguredValue = vi.hoisted(() => ({ value: true }));

const mockSettingsStore = vi.hoisted(() => ({
  settings: { theme: "light", githubToken: "secret" } as any,
  _throw: false,
}));

vi.mock("@/services/outbox", async () => {
  const actual =
    await vi.importActual<typeof import("@/services/outbox")>(
      "@/services/outbox"
    );
  return {
    ...actual,
    writeEvent: mockWriteEvent,
    getUnpushedCount: mockGetUnpushedCount,
  };
});

vi.mock("@/services/database", () => ({ db: mockDb }));

vi.mock("@/composables/useWebDavSync", () => ({
  useWebDavSync: () => ({
    isConfigured: mockIsConfiguredValue,
    syncEvents: mockSyncEvents,
    lastSyncAt: { value: null },
    isSyncing: { value: false },
    syncError: { value: null },
  }),
}));

vi.mock("@/utils/network", () => ({
  isOnline: mockIsOnline,
}));

vi.mock("@/stores/settings", () => ({
  useSettingsStore: () => {
    if (mockSettingsStore._throw) throw new Error("not ready");
    return mockSettingsStore;
  },
}));

// 必须延迟导入，让 vi.mock 先生效
const { useSyncStore } = await import("./sync");

describe("sync store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockWriteEvent.mockClear();
    mockSyncEvents.mockClear();
    mockIsOnline.mockReturnValue(true);
    mockIsConfiguredValue.value = true;
    mockSettingsStore._throw = false;
    mockSettingsStore.settings = { theme: "light", githubToken: "secret" };
    Object.values(mockDb).forEach((m: any) => {
      if (typeof m.mockClear === "function") m.mockClear();
    });
    mockDb.getSyncStatus.mockResolvedValue({
      lastSyncAt: null,
      pendingCount: 0,
      isSyncing: false,
    });
    mockDb.getAllTasks.mockResolvedValue([]);
    mockDb.getAllReflections.mockResolvedValue([]);
    mockDb.getAllSessions.mockResolvedValue([]);
    mockDb.transaction.mockImplementation((fn) => fn());
    mockDb.getUnpushedOutboxEvents.mockResolvedValue([]);
    mockDb.getAllTombstones.mockResolvedValue([]);
    mockDb.clearAll.mockResolvedValue(undefined);
    mockDb.writeOutboxEvent.mockResolvedValue(undefined);
    mockDb.upsertTombstones.mockResolvedValue(undefined);
    localStorage.clear();
  });

  // ============================================================
  // recordEvent
  // ============================================================
  describe("recordEvent", () => {
    it("在线且已配置时，写入 outbox 并触发后台同步", async () => {
      const store = useSyncStore();
      mockWriteEvent.mockResolvedValueOnce({
        eventId: "evt-1",
        type: "task.created",
        entityType: "task",
        entityId: "t1",
        payload: {},
        timestamp: new Date().toISOString(),
      });

      await store.recordEvent("task.created", "t1", { title: "Test" });

      expect(mockWriteEvent).toHaveBeenCalledTimes(1);
      // 触发同步是 fire-and-forget，需要等待下一个 tick
      await new Promise((r) => setTimeout(r, 50));
      expect(mockSyncEvents).toHaveBeenCalledTimes(1);
    });

    it("离线时写入 outbox 但不触发同步", async () => {
      mockIsOnline.mockReturnValue(false);
      const store = useSyncStore();

      await store.recordEvent("task.created", "t1", { title: "Test" });

      expect(mockWriteEvent).toHaveBeenCalledTimes(1);
      await new Promise((r) => setTimeout(r, 50));
      expect(mockSyncEvents).not.toHaveBeenCalled();
    });

    it("未配置 WebDAV 时写入 outbox 但不触发同步", async () => {
      mockIsConfiguredValue.value = false;
      const store = useSyncStore();

      await store.recordEvent("task.created", "t1", { title: "Test" });

      expect(mockWriteEvent).toHaveBeenCalledTimes(1);
      await new Promise((r) => setTimeout(r, 50));
      expect(mockSyncEvents).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // backgroundPull
  // ============================================================
  describe("backgroundPull", () => {
    it("在线且已配置时触发同步", async () => {
      const store = useSyncStore();
      await store.backgroundPull();
      expect(mockSyncEvents).toHaveBeenCalledTimes(1);
    });

    it("离线时直接返回，不触发同步", async () => {
      mockIsOnline.mockReturnValue(false);
      const store = useSyncStore();
      await store.backgroundPull();
      expect(mockSyncEvents).not.toHaveBeenCalled();
    });

    it("未配置 WebDAV 时直接返回，不触发同步", async () => {
      mockIsConfiguredValue.value = false;
      const store = useSyncStore();
      await store.backgroundPull();
      expect(mockSyncEvents).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // fullSyncAction
  // ============================================================
  describe("fullSyncAction", () => {
    it("syncEvents 成功时返回正确消息", async () => {
      mockSyncEvents.mockResolvedValueOnce({
        pushed: 2,
        pulled: 3,
        processed: 3,
        errors: 0,
      });
      const store = useSyncStore();
      const result = await store.fullSyncAction();

      expect(result.success).toBe(true);
      expect(result.message).toContain("推送 2 个事件");
      expect(result.message).toContain("拉取 3 个事件");
      expect(result.message).toContain("处理 3 个");
    });

    it("syncEvents 返回 error 时同步失败", async () => {
      mockSyncEvents.mockResolvedValueOnce({
        pushed: 0,
        pulled: 0,
        processed: 0,
        errors: 1,
        error: "网络超时",
      });
      const store = useSyncStore();
      const result = await store.fullSyncAction();

      expect(result.success).toBe(false);
      expect(result.message).toBe("网络超时");
      expect(store.syncError).toBe("网络超时");
    });

    it("未配置 WebDAV 时直接拒绝", async () => {
      mockIsConfiguredValue.value = false;
      const store = useSyncStore();
      const result = await store.fullSyncAction();

      expect(result.success).toBe(false);
      expect(result.message).toBe("WebDAV 未配置");
    });

    it("空结果时返回 '同步完成'", async () => {
      mockSyncEvents.mockResolvedValueOnce({
        pushed: 0,
        pulled: 0,
        processed: 0,
        errors: 0,
      });
      const store = useSyncStore();
      const result = await store.fullSyncAction();

      expect(result.success).toBe(true);
      expect(result.message).toBe("同步完成");
    });

    it("syncEvents 抛异常时返回错误消息", async () => {
      mockSyncEvents.mockRejectedValueOnce(new Error("连接被拒绝"));
      const store = useSyncStore();
      const result = await store.fullSyncAction();

      expect(result.success).toBe(false);
      expect(result.message).toBe("连接被拒绝");
      expect(store.syncError).toBe("连接被拒绝");
    });
  });

  // ============================================================
  // loadDbStats / clearAllData / exportAllData
  // ============================================================
  describe("loadDbStats", () => {
    it("应统计任务、反思和会话数量", async () => {
      mockDb.getAllTasks.mockResolvedValue([{ id: "t1" }, { id: "t2" }]);
      mockDb.getAllReflections.mockResolvedValue([{ id: "r1" }]);
      mockDb.getAllSessions.mockResolvedValue([
        { id: "s1" },
        { id: "s2" },
        { id: "s3" },
      ]);
      const store = useSyncStore();
      await store.loadDbStats();
      expect(store.dbStats.taskCount).toBe(2);
      expect(store.dbStats.reflectionCount).toBe(1);
      expect(store.dbStats.sessionCount).toBe(3);
    });

    it("异常时应保持默认值", async () => {
      mockDb.getAllTasks.mockRejectedValue(new Error("fail"));
      const store = useSyncStore();
      await store.loadDbStats();
      expect(store.dbStats.taskCount).toBe(0);
    });
  });

  describe("clearAllData", () => {
    it("应清空数据库并归零统计", async () => {
      const store = useSyncStore();
      store.dbStats = { taskCount: 5, reflectionCount: 3, sessionCount: 2 };
      await store.clearAllData();
      expect(mockDb.clearAll).toHaveBeenCalled();
      expect(store.dbStats).toEqual({
        taskCount: 0,
        reflectionCount: 0,
        sessionCount: 0,
      });
    });
  });

  describe("exportAllData", () => {
    it("应返回所有数据", async () => {
      mockDb.getAllTasks.mockResolvedValue([{ id: "t1" }]);
      mockDb.getAllReflections.mockResolvedValue([{ id: "r1" }]);
      mockDb.getAllSessions.mockResolvedValue([{ id: "s1" }]);
      const store = useSyncStore();
      const result = await store.exportAllData();
      expect(result.tasks).toHaveLength(1);
      expect(result.reflections).toHaveLength(1);
      expect(result.sessions).toHaveLength(1);
    });
  });

  // ============================================================
  // importRecords
  // ============================================================
  describe("importRecords", () => {
    beforeEach(() => {
      mockDb.createTask.mockReset();
      mockDb.createReflection.mockReset();
      mockDb.createSession.mockReset();
    });

    it("应导入有效任务、反思和会话", async () => {
      mockDb.createTask.mockResolvedValue({ id: "t1" });
      mockDb.createReflection.mockResolvedValue({ id: "r1" });
      mockDb.createSession.mockResolvedValue({ id: "s1" });

      const store = useSyncStore();
      const result = await store.importRecords(
        [
          {
            title: "Task 1",
            description: "",
            priority: "high",
            estimatedPomodoros: 1,
            tags: [],
            dueDate: null,
          },
        ],
        [
          {
            date: "2026-05-19",
            content: "Good",
            mood: "happy",
            relatedTaskIds: [],
            tags: [],
          },
        ],
        [
          {
            taskId: null,
            type: "work",
            duration: 1500,
            completed: true,
            startedAt: "2026-05-19 10:00:00",
          },
        ]
      );

      expect(result.taskCount).toBe(1);
      expect(result.reflectionCount).toBe(1);
      expect(result.sessionCount).toBe(1);
      expect(result.outboxCount).toBe(3);
      expect(mockDb.createTask).toHaveBeenCalledTimes(1);
      expect(mockDb.createReflection).toHaveBeenCalledTimes(1);
      expect(mockDb.createSession).toHaveBeenCalledTimes(1);
    });

    it("应跳过无效数据", async () => {
      mockDb.createTask.mockResolvedValue({ id: "t1" });
      mockDb.createReflection.mockResolvedValue({ id: "r1" });
      mockDb.createSession.mockResolvedValue({ id: "s1" });

      const store = useSyncStore();
      const result = await store.importRecords(
        [
          {
            title: "",
            description: "",
            priority: "high",
            estimatedPomodoros: 1,
            tags: [],
            dueDate: null,
          },
        ],
        [{ date: "", content: "", mood: "", relatedTaskIds: [], tags: [] }],
        [
          {
            taskId: null,
            type: "",
            duration: null as any,
            completed: false,
            startedAt: "",
          },
        ]
      );

      expect(result.taskCount).toBe(0);
      expect(result.reflectionCount).toBe(0);
      expect(result.sessionCount).toBe(0);
      expect(mockDb.createTask).not.toHaveBeenCalled();
      expect(mockDb.createReflection).not.toHaveBeenCalled();
      expect(mockDb.createSession).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // exportFullBackup / importFullBackup
  // ============================================================
  describe("exportFullBackup", () => {
    it("应导出完整 v2 备份结构", async () => {
      mockDb.getAllTasks.mockResolvedValue([{ id: "t1" }]);
      mockDb.getAllReflections.mockResolvedValue([{ id: "r1" }]);
      mockDb.getAllSessions.mockResolvedValue([{ id: "s1" }]);
      mockDb.getUnpushedOutboxEvents.mockResolvedValue([{ id: "o1" }]);
      mockDb.getAllTombstones.mockResolvedValue([{ id: "ts1" }]);
      mockDb.getSyncStatus.mockResolvedValue({
        lastSyncAt: "2026-05-19",
        pendingCount: 0,
        isSyncing: false,
      });

      const store = useSyncStore();
      const backup = await store.exportFullBackup();

      expect(backup.version).toBe("2.0");
      expect(backup.app).toBe("PomodoroX");
      expect(backup.data.tasks).toHaveLength(1);
      expect(backup.data.reflections).toHaveLength(1);
      expect(backup.data.sessions).toHaveLength(1);
      expect(backup.data.outbox).toHaveLength(1);
      expect(backup.data.tombstones).toHaveLength(1);
      expect(backup.data.settings).toBeDefined();
      expect(backup.data.syncStatus).toBeDefined();
    });

    it("Store 未就绪时应回退到 localStorage", async () => {
      mockSettingsStore._throw = true;
      localStorage.setItem(
        "pomodorox-settings",
        JSON.stringify({ theme: "dark" })
      );
      mockDb.getAllTasks.mockResolvedValue([]);
      mockDb.getAllReflections.mockResolvedValue([]);
      mockDb.getAllSessions.mockResolvedValue([]);
      mockDb.getUnpushedOutboxEvents.mockResolvedValue([]);
      mockDb.getAllTombstones.mockResolvedValue([]);
      mockDb.getSyncStatus.mockResolvedValue({
        lastSyncAt: null,
        pendingCount: 0,
        isSyncing: false,
      });

      const store = useSyncStore();
      const backup = await store.exportFullBackup();
      expect(backup.data.settings).toEqual({ theme: "dark" });
    });
  });

  describe("importFullBackup", () => {
    const makeBackup = () => ({
      version: "2.0",
      app: "PomodoroX",
      exportedAt: new Date().toISOString(),
      data: {
        tasks: [{ id: "t1", title: "Task" }],
        reflections: [{ id: "r1", date: "2026-05-19" }],
        sessions: [{ id: "s1", type: "work" }],
        outbox: [{ id: "o1" }],
        tombstones: [{ id: "ts1" }],
        settings: { theme: "dark" },
        syncStatus: { lastSyncAt: null, pendingCount: 0, isSyncing: false },
      },
    });

    it("overwrite 模式应清空数据库并导入", async () => {
      const store = useSyncStore();
      const result = await store.importFullBackup(
        makeBackup() as any,
        "overwrite"
      );

      expect(mockDb.clearAll).toHaveBeenCalled();
      expect(mockDb.createTask).toHaveBeenCalled();
      expect(mockDb.createReflection).toHaveBeenCalled();
      expect(mockDb.createSession).toHaveBeenCalled();
      expect(mockDb.writeOutboxEvent).toHaveBeenCalledTimes(1);
      expect(mockDb.upsertTombstones).toHaveBeenCalledTimes(1);
      expect(result.taskCount).toBe(1);
      expect(result.tombstoneCount).toBe(1);
      expect(localStorage.getItem("pomodorox-settings")).toBe(
        JSON.stringify({ theme: "dark" })
      );
    });

    it("merge 模式应使用 upsert", async () => {
      const store = useSyncStore();
      const result = await store.importFullBackup(makeBackup() as any, "merge");

      expect(mockDb.clearAll).not.toHaveBeenCalled();
      expect(mockDb.upsertTask).toHaveBeenCalled();
      expect(mockDb.upsertReflection).toHaveBeenCalled();
      expect(mockDb.upsertSession).toHaveBeenCalled();
      expect(result.taskCount).toBe(1);
    });

    it("缺少 version 时应抛异常", async () => {
      const store = useSyncStore();
      await expect(store.importFullBackup({} as any)).rejects.toThrow(
        "无效的备份文件格式"
      );
    });

    it("version 不匹配时应抛异常", async () => {
      const store = useSyncStore();
      await expect(
        store.importFullBackup({ version: "1.0" } as any)
      ).rejects.toThrow("无效的备份文件格式");
    });

    it("缺少 data 时应抛异常", async () => {
      const store = useSyncStore();
      await expect(
        store.importFullBackup({ version: "2.0" } as any)
      ).rejects.toThrow("缺少 data 字段");
    });

    it("data 字段类型错误时应抛异常", async () => {
      const store = useSyncStore();
      const backup = {
        version: "2.0",
        data: {
          tasks: [],
          reflections: [],
          sessions: [],
          outbox: [],
          tombstones: "not-array",
        },
      };
      await expect(store.importFullBackup(backup as any)).rejects.toThrow(
        "data.tombstones 不是数组"
      );
    });
  });
});
