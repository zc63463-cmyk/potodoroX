/**
 * TimerView 冒烟测试
 * 验证主计时器视图能成功挂载且关键 UI 元素存在
 *
 * 注意：mock store 返回纯值（Pinia 自动化 ref unwrap，mock 需手动模拟）
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { ref } from "vue";

// ============================================================
// Mock 外部依赖
// ============================================================

vi.mock("@/composables/useAudio", () => ({
  playFocusStart: vi.fn(),
  playBreakStart: vi.fn(),
  playSessionComplete: vi.fn(),
  playSuccess: vi.fn(),
  setVolume: vi.fn(),
  generateTone: vi.fn(),
  playTick: vi.fn(),
  playError: vi.fn(),
  useAudio: vi.fn(),
}));

vi.mock("@/composables/useNotification", () => ({
  requestPermission: vi.fn(),
  sendNotification: vi.fn(),
  useNotification: vi.fn(() => ({
    permissionState: ref("granted"),
    requestPermission: vi.fn(),
    sendNotification: vi.fn(),
  })),
}));

vi.mock("animejs", () => ({
  animate: vi.fn(() => ({
    finished: Promise.resolve(),
    pause: vi.fn(),
    play: vi.fn(),
    restart: vi.fn(),
    reverse: vi.fn(),
    seek: vi.fn(),
  })),
  spring: vi.fn(),
  stagger: vi.fn((x: number) => x),
  timeline: vi.fn(() => ({
    add: vi.fn().mockReturnThis(),
    finished: Promise.resolve(),
  })),
}));

vi.mock("@/components/shared/GooeyNav.vue", () => ({
  default: {
    name: "GooeyNavStub",
    template: '<div class="gooey-nav-stub" />',
    props: ["items", "modelValue"],
    emits: ["update:modelValue"],
  },
}));

vi.mock("@/components/timer/MagicRings.vue", () => ({
  default: {
    name: "MagicRingsStub",
    template: '<div class="magic-rings-stub" />',
  },
}));

// ============================================================
// Mock Stores — 纯值（模拟 Pinia auto-unwrap）
// ============================================================

const mockSetDuration = vi.fn();

vi.mock("@/stores/timer", () => ({
  useTimerStore: vi.fn(() => ({
    remaining: 1500,
    isRunning: false,
    isPaused: false,
    sessionType: "work",
    currentTaskId: null,
    currentTotalDuration: 1500,
    currentSessionPlan: "",
    sessionFastForwardCount: 0,
    sessionFastForwardSeconds: 0,
    completedPomodoros: 0,
    pomodoroStreak: 0,
    pendingCompletionForTaskId: null,
    formattedRemaining: "25:00",
    progress: 1,
    isWorkSession: true,
    setSessionType: vi.fn(),
    setDuration: mockSetDuration,
    setCurrentTaskId: vi.fn(),
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    reset: vi.fn(),
    skip: vi.fn(),
    fastForward: vi.fn().mockResolvedValue({ success: true }),
    loadTodaySessions: vi.fn().mockResolvedValue(undefined),
    getTotalDuration: vi.fn(() => 1500),
    clearPendingCompletion: vi.fn(),
    initRemainingIfZero: vi.fn(),
  })),
}));

vi.mock("@/stores/task", () => ({
  useTaskStore: vi.fn(() => ({
    tasks: [],
    filteredTasks: [],
    getTaskById: vi.fn(() => undefined),
    stats: { total: 0, todo: 0, in_progress: 0, done: 0 },
    setFilter: vi.fn(),
    setSort: vi.fn(),
    updateTask: vi.fn(),
    createTask: vi.fn(),
    deleteTask: vi.fn(),
    loadTasks: vi.fn().mockResolvedValue(undefined),
    loadTask: vi.fn().mockResolvedValue(undefined),
  })),
}));

const mockUpdateSetting = vi.fn();

vi.mock("@/stores/settings", () => ({
  useSettingsStore: vi.fn(() => ({
    settings: {
      workDuration: 25 * 60,
      shortBreakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
      freeDuration: 30 * 60,
      longBreakInterval: 4,
      autoStartBreak: false,
      autoStartPomodoro: false,
      weeklyFastForwardQuota: 10,
      weeklyFastForwardUsed: 0,
      focusMusic: false,
      soundEnabled: true,
      volume: 0.5,
      theme: "dark",
      language: "zh",
    },
    updateSettings: vi.fn(),
    updateSetting: mockUpdateSetting,
    checkAndResetWeeklyQuota: vi.fn(),
    loadSettings: vi.fn(),
  })),
}));

const mockSessionStore = {
  sessions: [] as any[],
  todaySessions: [] as any[],
  todayPomodoros: 0,
  loadAllSessions: vi.fn().mockResolvedValue(undefined),
  addSession: vi.fn().mockResolvedValue({ id: "s1" }),
};

vi.mock("@/stores/session", () => ({
  useSessionStore: vi.fn(() => mockSessionStore),
}));

vi.mock("@/stores/app", () => ({
  useAppStore: vi.fn(() => ({
    currentView: "timer",
    isOnline: true,
    syncStatus: { pendingCount: 0, lastSyncAt: null },
    navigate: vi.fn(),
    toggleOnline: vi.fn(),
  })),
}));

// ============================================================
// 测试
// ============================================================

describe("TimerView 冒烟测试", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockSessionStore.sessions = [];
    mockSessionStore.todaySessions = [];
    mockSessionStore.todayPomodoros = 0;
    mockSetDuration.mockClear();
    mockUpdateSetting.mockClear();
  });

  it("组件能成功挂载且不崩溃", async () => {
    const TimerView = (await import("./TimerView.vue")).default;
    const wrapper = mount(TimerView, {
      global: { stubs: { MagicRings: true } },
    });

    expect(wrapper.html()).toBeTruthy();
    expect(wrapper.html().length).toBeGreaterThan(100);
  });

  it("应该显示默认任务名「未选择任务」", async () => {
    const TimerView = (await import("./TimerView.vue")).default;
    const wrapper = mount(TimerView, {
      global: { stubs: { MagicRings: true } },
    });

    expect(wrapper.text()).toContain("未选择任务");
  });

  it("应该渲染计时器模式切换组件 GooeyNav", async () => {
    const TimerView = (await import("./TimerView.vue")).default;
    const wrapper = mount(TimerView, {
      global: { stubs: { MagicRings: true } },
    });

    expect(wrapper.html()).toContain("gooey-nav-stub");
  });

  it("应该包含 .timer-content 容器", async () => {
    const TimerView = (await import("./TimerView.vue")).default;
    const wrapper = mount(TimerView, {
      global: { stubs: { MagicRings: true } },
    });

    expect(wrapper.find(".timer-content").exists()).toBe(true);
  });

  it("应该渲染魔力光环 stub", async () => {
    const TimerView = (await import("./TimerView.vue")).default;
    const wrapper = mount(TimerView, {
      global: { stubs: { MagicRings: true } },
    });

    expect(wrapper.html()).toContain("magic-rings-stub");
  });

  it("自由计时应计入专注时长统计", async () => {
    mockSessionStore.todaySessions = [
      { id: "s1", type: "free", completed: true, duration: 1800 },
    ];
    const TimerView = (await import("./TimerView.vue")).default;
    const wrapper = mount(TimerView, {
      global: { stubs: { MagicRings: true } },
    });

    expect(wrapper.text()).toContain("30分钟");
    expect(wrapper.text()).toContain("专注时长");
  });

  it("work 模式 idle 态应显示 45/60/90/120 四挡按钮", async () => {
    const TimerView = (await import("./TimerView.vue")).default;
    const wrapper = mount(TimerView, {
      global: { stubs: { MagicRings: true } },
    });

    expect(wrapper.find(".work-duration-selector").exists()).toBe(true);
    expect(wrapper.text()).toContain("45");
    expect(wrapper.text()).toContain("60");
    expect(wrapper.text()).toContain("90");
    expect(wrapper.text()).toContain("120");
  });

  it("点击专注时长按钮应更新设置和当前时长", async () => {
    const TimerView = (await import("./TimerView.vue")).default;
    const wrapper = mount(TimerView, {
      global: { stubs: { MagicRings: true } },
    });

    const btn60 = wrapper
      .findAll(".work-duration-btn")
      .find((b) => b.text().includes("60"));
    expect(btn60).toBeDefined();
    await btn60!.trigger("click");

    expect(mockUpdateSetting).toHaveBeenCalledWith("workDuration", 3600);
    expect(mockSetDuration).toHaveBeenCalledWith(3600);
  });
});
