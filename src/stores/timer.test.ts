// ============================================================
// timer store 回归测试
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

// ---- hoisted mocks ----

const mockDb = vi.hoisted(() => ({
  transaction: vi.fn((fn) => fn()),
  createSession: vi.fn(),
  updateTask: vi.fn(),
  createSessionAndUpdateTask: vi.fn(),
}));
vi.mock("@/services/database", () => ({ db: mockDb }));

const mockRecordEvent = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
vi.mock("@/stores/sync", () => ({
  useSyncStore: () => ({ recordEvent: mockRecordEvent }),
}));

let capturedOnComplete: ((data: any) => void) | undefined;

const mockTimer = vi.hoisted(() => {
  const remaining = { value: 1500 };
  const isRunning = { value: false };
  const isPaused = { value: false };
  const sessionType = {
    value: "work" as "work" | "short_break" | "long_break" | "free",
  };
  const currentTaskId = { value: null as string | null };
  const currentTotalDuration = { value: 1500 };
  const currentSessionPlan = { value: "" };
  const sessionFastForwardCount = { value: 0 };
  const sessionFastForwardSeconds = { value: 0 };
  const formattedRemaining = { value: "25:00" };
  const progress = { value: 0 };
  const isWorkSession = { value: true };

  return {
    remaining,
    isRunning,
    isPaused,
    sessionType,
    currentTaskId,
    currentTotalDuration,
    currentSessionPlan,
    sessionFastForwardCount,
    sessionFastForwardSeconds,
    formattedRemaining,
    progress,
    isWorkSession,
    setSessionType: vi.fn(),
    setCurrentTaskId: vi.fn(),
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    reset: vi.fn(),
    skip: vi.fn(),
    initRemainingIfZero: vi.fn(),
    getTotalDuration: vi.fn().mockReturnValue(1500),
    doFastForward: vi.fn(),
  };
});

vi.mock("@/composables/useTimer", () => ({
  useTimer: vi.fn((options) => {
    capturedOnComplete = options.onComplete;
    return mockTimer;
  }),
}));

const mockSessions = vi.hoisted(() => ({ value: [] as any[] }));
const mockAddSession = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockLoadAllSessions = vi.hoisted(() =>
  vi.fn().mockResolvedValue(undefined)
);
const mockTodayPomodoros = vi.hoisted(() => ({ value: 3 }));

vi.mock("@/stores/session", () => ({
  useSessionStore: () => ({
    addSession: mockAddSession,
    loadAllSessions: mockLoadAllSessions,
    todayPomodoros: mockTodayPomodoros.value,
    sessions: mockSessions.value,
  }),
}));

const mockUpdateTask = vi.hoisted(() => vi.fn().mockResolvedValue(null));
const mockTasks = vi.hoisted(() => ({ value: [] as any[] }));

vi.mock("@/stores/task", () => ({
  useTaskStore: () => ({
    tasks: mockTasks.value,
    updateTask: mockUpdateTask,
  }),
}));

const mockUpdateSettings = vi.hoisted(() =>
  vi.fn().mockResolvedValue(undefined)
);
const mockCheckAndResetWeeklyQuota = vi.hoisted(() => vi.fn());
const mockSettings = vi.hoisted(() => ({
  value: {
    workDuration: 1500,
    shortBreakDuration: 300,
    longBreakDuration: 900,
    freeDuration: 1800,
    longBreakInterval: 4,
    autoStartBreak: false,
    autoStartPomodoro: false,
    weeklyFastForwardQuota: 10,
    weeklyFastForwardUsed: 0,
  },
}));

vi.mock("@/stores/settings", () => ({
  useSettingsStore: () => ({
    settings: mockSettings.value,
    updateSettings: mockUpdateSettings,
    checkAndResetWeeklyQuota: mockCheckAndResetWeeklyQuota,
  }),
}));

const { useTimerStore } = await import("./timer");

beforeEach(() => {
  setActivePinia(createPinia());
  mockTimer.remaining.value = 1500;
  mockTimer.isRunning.value = false;
  mockTimer.isPaused.value = false;
  mockTimer.sessionType.value = "work";
  mockTimer.currentTaskId.value = null;
  mockTimer.currentTotalDuration.value = 1500;
  mockTimer.currentSessionPlan.value = "";
  mockTimer.sessionFastForwardCount.value = 0;
  mockTimer.sessionFastForwardSeconds.value = 0;
  mockTimer.setSessionType.mockClear();
  mockTimer.start.mockClear();
  mockTimer.doFastForward.mockClear();
  mockAddSession.mockClear().mockResolvedValue(undefined);
  mockUpdateTask.mockClear().mockResolvedValue(null);
  mockUpdateSettings.mockClear().mockResolvedValue(undefined);
  mockCheckAndResetWeeklyQuota.mockClear();
  mockSettings.value.weeklyFastForwardUsed = 0;
  mockSettings.value.autoStartBreak = false;
  mockSettings.value.autoStartPomodoro = false;
  mockTasks.value = [];
  mockSessions.value = [];
  mockDb.transaction.mockClear().mockImplementation((fn) => fn());
  mockDb.createSession.mockClear();
  mockDb.updateTask.mockClear();
  mockDb.createSessionAndUpdateTask.mockClear();
  mockRecordEvent.mockClear().mockResolvedValue(undefined);
  capturedOnComplete = undefined;
});

/** 触发计时完成回调并等待异步操作结束 */
async function triggerComplete(
  data: Parameters<NonNullable<typeof capturedOnComplete>>[0]
) {
  capturedOnComplete?.(data);
  // 等待微任务队列清空（mocked async 操作）
  await new Promise((r) => setTimeout(r, 0));
}

// ============================================================
// handleTimerComplete
// ============================================================
describe("handleTimerComplete", () => {
  it("work+completed+taskId 应使用原子事务并同步内存", async () => {
    mockTasks.value = [{ id: "task-1", actualPomodoros: 2, plan: "" }];
    mockDb.createSessionAndUpdateTask.mockResolvedValue({
      session: {
        id: "sess-1",
        taskId: "task-1",
        type: "work",
      },
      updatedTask: {
        id: "task-1",
        actualPomodoros: 3,
        plan: "plan text",
      },
    });

    const store = useTimerStore();
    mockTimer.sessionType.value = "work";

    await triggerComplete({
      completed: true,
      sessionType: "work",
      taskId: "task-1",
      currentTotalDuration: 1500,
      sessionFastForwardSeconds: 0,
      startedAt: "2026-05-19 10:00:00",
      plan: "plan text",
    });

    expect(mockDb.createSessionAndUpdateTask).toHaveBeenCalled();
    expect(mockRecordEvent).toHaveBeenCalledWith(
      "session.created",
      "sess-1",
      expect.any(Object)
    );
    expect(mockRecordEvent).toHaveBeenCalledWith(
      "task.updated",
      "task-1",
      expect.any(Object)
    );
    expect(mockSessions.value).toHaveLength(1);
    expect(mockTasks.value[0].actualPomodoros).toBe(3);
    expect(store.completedPomodoros).toBe(1);
    expect(store.pomodoroStreak).toBe(1);
  });

  it("free+completed+taskId 应使用原子事务并同步内存", async () => {
    mockTasks.value = [{ id: "task-1", actualPomodoros: 2, plan: "" }];
    mockDb.createSessionAndUpdateTask.mockResolvedValue({
      session: {
        id: "sess-free",
        taskId: "task-1",
        type: "free",
      },
      updatedTask: { id: "task-1", actualPomodoros: 3, plan: "" },
    });
    const store = useTimerStore();
    mockTimer.sessionType.value = "free";

    await triggerComplete({
      completed: true,
      sessionType: "free",
      taskId: "task-1",
      currentTotalDuration: 1800,
      sessionFastForwardSeconds: 0,
      startedAt: "2026-05-19 10:00:00",
      plan: "自由时段规划",
    });

    expect(mockDb.createSessionAndUpdateTask).toHaveBeenCalled();
    expect(mockRecordEvent).toHaveBeenCalledWith(
      "session.created",
      "sess-free",
      expect.any(Object)
    );
    expect(mockRecordEvent).toHaveBeenCalledWith(
      "task.updated",
      "task-1",
      expect.any(Object)
    );
    expect(mockSessions.value).toHaveLength(1);
    expect(mockTasks.value[0].actualPomodoros).toBe(3);
    expect(store.completedPomodoros).toBe(1);
    expect(store.pomodoroStreak).toBe(1);
  });

  it("task 不在内存中时应退化为 addSession", async () => {
    mockTasks.value = [];
    const store = useTimerStore();
    mockTimer.sessionType.value = "work";

    await triggerComplete({
      completed: true,
      sessionType: "work",
      taskId: "task-1",
      currentTotalDuration: 1500,
      sessionFastForwardSeconds: 0,
      startedAt: "2026-05-19 10:00:00",
      plan: "",
    });

    expect(mockAddSession).toHaveBeenCalled();
    expect(mockDb.createSessionAndUpdateTask).not.toHaveBeenCalled();
    expect(store.completedPomodoros).toBe(1);
  });

  it("break session 完成时只创建 session 不增加计数", async () => {
    mockTimer.sessionType.value = "short_break";
    const store = useTimerStore();

    await triggerComplete({
      completed: true,
      sessionType: "short_break",
      taskId: null,
      currentTotalDuration: 300,
      sessionFastForwardSeconds: 0,
      startedAt: "2026-05-19 10:00:00",
      plan: "",
    });

    expect(mockAddSession).toHaveBeenCalled();
    expect(store.completedPomodoros).toBe(0);
    expect(store.pomodoroStreak).toBe(0);
  });

  it("work 完成但无 taskId 时应增加计数", async () => {
    mockTimer.sessionType.value = "work";
    const store = useTimerStore();

    await triggerComplete({
      completed: true,
      sessionType: "work",
      taskId: null,
      currentTotalDuration: 1500,
      sessionFastForwardSeconds: 0,
      startedAt: "2026-05-19 10:00:00",
      plan: "",
    });

    expect(mockAddSession).toHaveBeenCalled();
    expect(store.completedPomodoros).toBe(1);
    expect(store.pomodoroStreak).toBe(1);
  });

  it("skip (completed=false) 时应创建 session 但不增加计数", async () => {
    mockTimer.sessionType.value = "work";
    const store = useTimerStore();

    await triggerComplete({
      completed: false,
      sessionType: "work",
      taskId: null,
      currentTotalDuration: 1500,
      sessionFastForwardSeconds: 0,
      startedAt: "2026-05-19 10:00:00",
      plan: "",
    });

    expect(mockAddSession).toHaveBeenCalled();
    expect(store.completedPomodoros).toBe(0);
    expect(mockTimer.setSessionType).toHaveBeenCalledWith("work");
  });

  it("db.createSessionAndUpdateTask 异常时应捕获错误", async () => {
    mockTasks.value = [{ id: "task-1", actualPomodoros: 2, plan: "" }];
    mockDb.createSessionAndUpdateTask.mockRejectedValue(new Error("db fail"));
    const store = useTimerStore();
    mockTimer.sessionType.value = "work";

    await triggerComplete({
      completed: true,
      sessionType: "work",
      taskId: "task-1",
      currentTotalDuration: 1500,
      sessionFastForwardSeconds: 0,
      startedAt: "2026-05-19 10:00:00",
      plan: "",
    });

    expect(store.completedPomodoros).toBe(0);
  });

  it("应重置快进状态", async () => {
    mockTimer.sessionFastForwardCount.value = 2;
    mockTimer.sessionFastForwardSeconds.value = 120;
    useTimerStore();

    await triggerComplete({
      completed: true,
      sessionType: "work",
      taskId: null,
      currentTotalDuration: 1500,
      sessionFastForwardSeconds: 120,
      startedAt: "2026-05-19 10:00:00",
      plan: "",
    });

    expect(mockTimer.sessionFastForwardCount.value).toBe(0);
    expect(mockTimer.sessionFastForwardSeconds.value).toBe(0);
  });

  it("pendingCompletionForTaskId 仅对 completed work+taskId 设置", async () => {
    mockTimer.sessionType.value = "work";
    const store = useTimerStore();

    await triggerComplete({
      completed: true,
      sessionType: "work",
      taskId: "task-1",
      currentTotalDuration: 1500,
      sessionFastForwardSeconds: 0,
      startedAt: "2026-05-19 10:00:00",
      plan: "",
    });
    expect(store.pendingCompletionForTaskId).toBe("task-1");

    store.clearPendingCompletion();
    await triggerComplete({
      completed: true,
      sessionType: "short_break",
      taskId: "task-1",
      currentTotalDuration: 300,
      sessionFastForwardSeconds: 0,
      startedAt: "2026-05-19 10:00:00",
      plan: "",
    });
    expect(store.pendingCompletionForTaskId).toBeNull();

    store.clearPendingCompletion();
    await triggerComplete({
      completed: false,
      sessionType: "work",
      taskId: "task-1",
      currentTotalDuration: 1500,
      sessionFastForwardSeconds: 0,
      startedAt: "2026-05-19 10:00:00",
      plan: "",
    });
    expect(store.pendingCompletionForTaskId).toBeNull();
  });
});

// ============================================================
// autoSwitchSession
// ============================================================
describe("autoSwitchSession", () => {
  it("work 完成后应切换到 short_break", async () => {
    mockTimer.sessionType.value = "work";
    const store = useTimerStore();
    store.pomodoroStreak = 0;

    await triggerComplete({
      completed: true,
      sessionType: "work",
      taskId: null,
      currentTotalDuration: 1500,
      sessionFastForwardSeconds: 0,
      startedAt: "2026-05-19 10:00:00",
      plan: "",
    });

    expect(mockTimer.setSessionType).toHaveBeenCalledWith("short_break");
  });

  it("work 完成且 streak 达到阈值时应切换到 long_break 并重置 streak", async () => {
    mockTimer.sessionType.value = "work";
    mockSettings.value.longBreakInterval = 4;
    const store = useTimerStore();
    store.pomodoroStreak = 3;

    await triggerComplete({
      completed: true,
      sessionType: "work",
      taskId: null,
      currentTotalDuration: 1500,
      sessionFastForwardSeconds: 0,
      startedAt: "2026-05-19 10:00:00",
      plan: "",
    });

    expect(mockTimer.setSessionType).toHaveBeenCalledWith("long_break");
    expect(store.pomodoroStreak).toBe(0);
  });

  it("autoStartBreak 为 true 时应自动启动休息", async () => {
    mockSettings.value.autoStartBreak = true;
    mockTimer.sessionType.value = "work";
    useTimerStore();

    await triggerComplete({
      completed: true,
      sessionType: "work",
      taskId: null,
      currentTotalDuration: 1500,
      sessionFastForwardSeconds: 0,
      startedAt: "2026-05-19 10:00:00",
      plan: "",
    });

    expect(mockTimer.start).toHaveBeenCalled();
  });

  it("休息完成后应切换到 work", async () => {
    mockTimer.sessionType.value = "short_break";
    useTimerStore();

    await triggerComplete({
      completed: true,
      sessionType: "short_break",
      taskId: null,
      currentTotalDuration: 300,
      sessionFastForwardSeconds: 0,
      startedAt: "2026-05-19 10:00:00",
      plan: "",
    });

    expect(mockTimer.setSessionType).toHaveBeenCalledWith("work");
  });

  it("autoStartPomodoro 为 true 时应自动启动工作", async () => {
    mockSettings.value.autoStartPomodoro = true;
    mockTimer.sessionType.value = "short_break";
    useTimerStore();

    await triggerComplete({
      completed: true,
      sessionType: "short_break",
      taskId: null,
      currentTotalDuration: 300,
      sessionFastForwardSeconds: 0,
      startedAt: "2026-05-19 10:00:00",
      plan: "",
    });

    expect(mockTimer.setSessionType).toHaveBeenCalledWith("work");
    expect(mockTimer.start).toHaveBeenCalled();
  });

  it("free 完成后应保持 free", async () => {
    mockTimer.sessionType.value = "free";
    useTimerStore();

    await triggerComplete({
      completed: true,
      sessionType: "free",
      taskId: null,
      currentTotalDuration: 1800,
      sessionFastForwardSeconds: 0,
      startedAt: "2026-05-19 10:00:00",
      plan: "",
    });

    expect(mockTimer.setSessionType).toHaveBeenCalledWith("free");
  });
});

// ============================================================
// fastForward
// ============================================================
describe("fastForward", () => {
  it("空闲时应返回 idle", async () => {
    const store = useTimerStore();
    const result = await store.fastForward();
    expect(result.success).toBe(false);
    expect(result.reason).toBe("idle");
  });

  it("在免费额度内应成功", async () => {
    const store = useTimerStore();
    mockTimer.isRunning.value = true;
    mockTimer.sessionFastForwardCount.value = 0;
    const result = await store.fastForward();
    expect(result.success).toBe(true);
    expect(mockTimer.doFastForward).toHaveBeenCalledWith(600);
  });

  it("超出免费额度但周额度足够时应成功", async () => {
    const store = useTimerStore();
    mockTimer.isRunning.value = true;
    mockTimer.sessionFastForwardCount.value = 3;
    mockSettings.value.weeklyFastForwardUsed = 2;
    mockSettings.value.weeklyFastForwardQuota = 10;
    const result = await store.fastForward();
    expect(result.success).toBe(true);
    expect(mockUpdateSettings).toHaveBeenCalledWith({
      weeklyFastForwardUsed: 3,
    });
  });

  it("额度用尽时应返回 quota_exhausted", async () => {
    const store = useTimerStore();
    mockTimer.isRunning.value = true;
    mockTimer.sessionFastForwardCount.value = 3;
    mockSettings.value.weeklyFastForwardUsed = 10;
    mockSettings.value.weeklyFastForwardQuota = 10;
    const result = await store.fastForward();
    expect(result.success).toBe(false);
    expect(result.reason).toBe("quota_exhausted");
  });

  it("force 时忽略额度检查", async () => {
    const store = useTimerStore();
    mockTimer.isRunning.value = true;
    mockTimer.sessionFastForwardCount.value = 3;
    mockSettings.value.weeklyFastForwardUsed = 10;
    mockSettings.value.weeklyFastForwardQuota = 10;
    const result = await store.fastForward(true);
    expect(result.success).toBe(true);
    expect(mockUpdateSettings).toHaveBeenCalledWith({
      weeklyFastForwardUsed: 11,
    });
  });
});

// ============================================================
// loadTodaySessions
// ============================================================
describe("loadTodaySessions", () => {
  it("应加载今日会话并更新计数", async () => {
    mockTodayPomodoros.value = 5;
    const store = useTimerStore();
    await store.loadTodaySessions();
    expect(mockLoadAllSessions).toHaveBeenCalled();
    expect(store.completedPomodoros).toBe(5);
  });
});

// ============================================================
// clearPendingCompletion
// ============================================================
describe("clearPendingCompletion", () => {
  it("应清除 pendingCompletionForTaskId", () => {
    const store = useTimerStore();
    store.pendingCompletionForTaskId = "task-1";
    store.clearPendingCompletion();
    expect(store.pendingCompletionForTaskId).toBeNull();
  });
});

// ============================================================
// setDuration
// ============================================================
describe("setDuration", () => {
  it("应直接设置 remaining 和 currentTotalDuration", () => {
    const store = useTimerStore();
    store.setDuration(2700);
    expect(mockTimer.remaining.value).toBe(2700);
    expect(mockTimer.currentTotalDuration.value).toBe(2700);
  });
});

// ============================================================
// 计时引擎透传
// ============================================================
describe("计时引擎方法透传", () => {
  it("应透传给 mockTimer", () => {
    const store = useTimerStore();
    store.setSessionType("short_break");
    expect(mockTimer.setSessionType).toHaveBeenCalledWith("short_break");

    store.start();
    expect(mockTimer.start).toHaveBeenCalled();

    store.pause();
    expect(mockTimer.pause).toHaveBeenCalled();

    store.reset();
    expect(mockTimer.reset).toHaveBeenCalled();

    store.skip();
    expect(mockTimer.skip).toHaveBeenCalled();
  });
});
