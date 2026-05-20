// ============================================================
// PomodoroX - useTimer composable 单元测试
// 纯计时引擎：覆盖 start / pause / resume / tick / complete /
// skip / fastForward / reset / visibilitychange / initRemaining
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTimer } from "./useTimer";
import type { SessionType } from "@/types";

const DEFAULT_DURATION = 25 * 60; // 1500s

function setupTimer(opts: Partial<Parameters<typeof useTimer>[0]> = {}) {
  const onComplete = vi.fn();
  const timer = useTimer({
    getDuration: () => DEFAULT_DURATION,
    onComplete,
    ...opts,
  });
  return { timer, onComplete };
}

describe("useTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    vi.setSystemTime(new Date("2026-05-19T14:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ============================================================
  // 初始化与状态
  // ============================================================

  it("初始化状态正确", () => {
    const { timer, onComplete } = setupTimer();
    expect(timer.remaining.value).toBe(0);
    expect(timer.isRunning.value).toBe(false);
    expect(timer.isPaused.value).toBe(false);
    expect(timer.sessionType.value).toBe("work");
    expect(timer.currentTaskId.value).toBeNull();
    expect(timer.currentTotalDuration.value).toBe(0);
    expect(timer.currentSessionPlan.value).toBe("");
    expect(timer.sessionFastForwardCount.value).toBe(0);
    expect(timer.sessionFastForwardSeconds.value).toBe(0);
    expect(timer.progress.value).toBe(0);
    expect(timer.formattedRemaining.value).toBe("00:00");
    expect(timer.isWorkSession.value).toBe(true);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("setSessionType 改变类型并重置时长", () => {
    const { timer } = setupTimer();
    timer.setSessionType("short_break", "task-1");
    expect(timer.sessionType.value).toBe("short_break");
    expect(timer.currentTaskId.value).toBe("task-1");
    expect(timer.remaining.value).toBe(DEFAULT_DURATION);
    expect(timer.currentTotalDuration.value).toBe(DEFAULT_DURATION);
    expect(timer.isPaused.value).toBe(false);
  });

  it("setCurrentTaskId 更新关联任务", () => {
    const { timer } = setupTimer();
    timer.setCurrentTaskId("task-42");
    expect(timer.currentTaskId.value).toBe("task-42");
    timer.setCurrentTaskId(null);
    expect(timer.currentTaskId.value).toBeNull();
  });

  it("setPlan 更新规划文本", () => {
    const { timer } = setupTimer();
    timer.setPlan("完成代码审查");
    expect(timer.currentSessionPlan.value).toBe("完成代码审查");
  });

  it("getTotalDuration 根据 getDuration 回调返回", () => {
    const durations: Record<SessionType, number> = {
      work: 1500,
      short_break: 300,
      long_break: 900,
      free: 1800,
    };
    const { timer } = setupTimer({
      getDuration: (type) => durations[type],
    });
    expect(timer.getTotalDuration()).toBe(1500);
    timer.setSessionType("short_break");
    expect(timer.getTotalDuration()).toBe(300);
    timer.setSessionType("free");
    expect(timer.getTotalDuration()).toBe(1800);
  });

  // ============================================================
  // 启动与 tick
  // ============================================================

  it("start 启动计时并设置状态", () => {
    const { timer, onComplete } = setupTimer();
    timer.start();
    expect(timer.isRunning.value).toBe(true);
    expect(timer.isPaused.value).toBe(false);
    expect(timer.remaining.value).toBe(DEFAULT_DURATION);
    expect(timer.currentTotalDuration.value).toBe(DEFAULT_DURATION);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("start 支持自定义时长", () => {
    const { timer } = setupTimer();
    timer.start(300);
    expect(timer.remaining.value).toBe(300);
    expect(timer.currentTotalDuration.value).toBe(300);
  });

  it("start 支持传入 plan", () => {
    const { timer } = setupTimer();
    timer.start(undefined, "写测试用例");
    expect(timer.currentSessionPlan.value).toBe("写测试用例");
  });

  it("tick 每 100ms 递减 remaining", () => {
    const { timer } = setupTimer();
    timer.start();
    expect(timer.remaining.value).toBe(DEFAULT_DURATION);
    vi.advanceTimersByTime(100);
    expect(timer.remaining.value).toBeLessThan(DEFAULT_DURATION);
    expect(timer.remaining.value).toBeGreaterThan(0);
  });

  it("tick 最终触发 onComplete(completed=true)", () => {
    const { timer, onComplete } = setupTimer();
    timer.start();
    vi.advanceTimersByTime(DEFAULT_DURATION * 1000 + 200);
    expect(timer.isRunning.value).toBe(false);
    expect(timer.isPaused.value).toBe(false);
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        completed: true,
        sessionType: "work",
        taskId: null,
        currentTotalDuration: DEFAULT_DURATION,
        startedAt: "2026-05-19 14:00:00",
      })
    );
  });

  // ============================================================
  // 暂停与恢复
  // ============================================================

  it("pause 暂停计时并保留剩余时间", () => {
    const { timer } = setupTimer();
    timer.start();
    vi.advanceTimersByTime(5000);
    const remainingBeforePause = timer.remaining.value;
    timer.pause();
    expect(timer.isPaused.value).toBe(true);
    expect(timer.isRunning.value).toBe(false);
    // 暂停后时间不应再递减
    vi.advanceTimersByTime(10000);
    expect(timer.remaining.value).toBe(remainingBeforePause);
  });

  it("resume 恢复计时并重新计算 targetEndTime", () => {
    const { timer } = setupTimer();
    timer.start();
    vi.advanceTimersByTime(5000);
    timer.pause();
    const remainingAfterPause = timer.remaining.value;
    timer.resume();
    expect(timer.isPaused.value).toBe(false);
    expect(timer.isRunning.value).toBe(true);
    // 恢复后继续递减
    vi.advanceTimersByTime(5000);
    expect(timer.remaining.value).toBeLessThan(remainingAfterPause);
  });

  it("运行中重复调用 start 不生效", () => {
    const { timer, onComplete } = setupTimer();
    timer.start();
    const remainingAfterFirstStart = timer.remaining.value;
    timer.start(999);
    expect(timer.remaining.value).toBe(remainingAfterFirstStart);
    expect(timer.currentTotalDuration.value).toBe(DEFAULT_DURATION);
    expect(onComplete).not.toHaveBeenCalled();
  });

  // ============================================================
  // 重置与跳过
  // ============================================================

  it("reset 重置所有运行时状态", () => {
    const { timer, onComplete } = setupTimer();
    timer.start();
    vi.advanceTimersByTime(5000);
    timer.reset();
    expect(timer.isRunning.value).toBe(false);
    expect(timer.isPaused.value).toBe(false);
    expect(timer.remaining.value).toBe(DEFAULT_DURATION);
    expect(timer.currentTotalDuration.value).toBe(DEFAULT_DURATION);
    expect(timer.currentSessionPlan.value).toBe("");
    expect(timer.sessionFastForwardCount.value).toBe(0);
    expect(timer.sessionFastForwardSeconds.value).toBe(0);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("skip 触发 onComplete(completed=false) 并重置状态", () => {
    const { timer, onComplete } = setupTimer();
    timer.start();
    vi.advanceTimersByTime(5000);
    timer.skip();
    expect(timer.isRunning.value).toBe(false);
    expect(timer.isPaused.value).toBe(false);
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        completed: false,
        sessionType: "work",
        currentTotalDuration: DEFAULT_DURATION,
        sessionFastForwardSeconds: 0,
      })
    );
  });

  // ============================================================
  // 快进
  // ============================================================

  it("doFastForward 扣除指定秒数", () => {
    const { timer } = setupTimer();
    timer.start();
    const before = timer.remaining.value;
    timer.doFastForward(600);
    expect(timer.remaining.value).toBe(before - 600);
    expect(timer.sessionFastForwardCount.value).toBe(1);
    expect(timer.sessionFastForwardSeconds.value).toBe(600);
  });

  it("doFastForward 扣除量不超过 remaining", () => {
    const { timer, onComplete } = setupTimer();
    timer.start(100);
    timer.doFastForward(999);
    expect(timer.remaining.value).toBe(0);
    expect(timer.sessionFastForwardSeconds.value).toBe(100);
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ completed: true })
    );
  });

  it("doFastForward 导致完成触发 onComplete", () => {
    const { timer, onComplete } = setupTimer();
    timer.start();
    timer.doFastForward(DEFAULT_DURATION);
    expect(timer.isRunning.value).toBe(false);
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        completed: true,
        sessionFastForwardSeconds: DEFAULT_DURATION,
      })
    );
  });

  it("doFastForward 在暂停时更新 remaining 但不更新 targetEndTime", () => {
    const { timer } = setupTimer();
    timer.start();
    vi.advanceTimersByTime(5000);
    timer.pause();
    const remainingBefore = timer.remaining.value;
    timer.doFastForward(300);
    expect(timer.remaining.value).toBe(remainingBefore - 300);
    // 暂停状态保持不变
    expect(timer.isPaused.value).toBe(true);
    expect(timer.isRunning.value).toBe(false);
  });

  // ============================================================
  // 初始化辅助
  // ============================================================

  it("initRemainingIfZero 在 remaining=0 且未运行时初始化", () => {
    const { timer } = setupTimer();
    expect(timer.remaining.value).toBe(0);
    timer.initRemainingIfZero();
    expect(timer.remaining.value).toBe(DEFAULT_DURATION);
    expect(timer.currentTotalDuration.value).toBe(DEFAULT_DURATION);
  });

  it("initRemainingIfZero 在运行中不生效", () => {
    const { timer } = setupTimer();
    timer.start();
    timer.remaining.value = 0; // 强制设为 0（模拟极端边界）
    timer.initRemainingIfZero();
    expect(timer.remaining.value).toBe(0);
  });

  it("initRemainingIfZero 在 remaining>0 时不生效", () => {
    const { timer } = setupTimer();
    timer.start();
    timer.pause();
    const remainingBefore = timer.remaining.value;
    timer.initRemainingIfZero();
    expect(timer.remaining.value).toBe(remainingBefore);
  });

  // ============================================================
  // 进度与格式化
  // ============================================================

  it("progress 从 0 递增到 100", () => {
    const { timer } = setupTimer();
    timer.start(100);
    expect(timer.progress.value).toBe(0);
    vi.advanceTimersByTime(50 * 1000);
    expect(timer.progress.value).toBeCloseTo(50, 0);
    vi.advanceTimersByTime(50 * 1000 + 200);
    expect(timer.progress.value).toBe(100);
  });

  it("formattedRemaining 格式为 MM:SS", () => {
    const { timer } = setupTimer();
    timer.start(125);
    expect(timer.formattedRemaining.value).toBe("02:05");
    vi.advanceTimersByTime(65 * 1000);
    expect(timer.formattedRemaining.value).toBe("01:00");
  });

  it("isWorkSession 根据 sessionType 变化", () => {
    const { timer } = setupTimer();
    expect(timer.isWorkSession.value).toBe(true);
    timer.setSessionType("short_break");
    expect(timer.isWorkSession.value).toBe(false);
    timer.setSessionType("work");
    expect(timer.isWorkSession.value).toBe(true);
  });

  // ============================================================
  // 页面可见性
  // ============================================================

  it("visibilitychange 在页面重新可见时更新 remaining", () => {
    const { timer } = setupTimer();
    timer.start();
    vi.advanceTimersByTime(5000);
    const remainingBefore = timer.remaining.value;

    // 模拟页面隐藏
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
      writable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));

    // 后台经过 10 秒（tick 仍在 fake timers 中运行）
    vi.advanceTimersByTime(10000);

    // 模拟页面重新可见
    Object.defineProperty(document, "hidden", {
      value: false,
      configurable: true,
      writable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));

    // remaining 应该已经被更新（即使 fake timers 下 tick 也正常执行）
    expect(timer.remaining.value).toBeLessThan(remainingBefore);
    expect(timer.isRunning.value).toBe(true);
  });

  it("visibilitychange 在页面隐藏时不触发更新", () => {
    const { timer } = setupTimer();
    timer.start();
    vi.advanceTimersByTime(5000);
    const remainingBefore = timer.remaining.value;

    // 保持 hidden=true
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
      writable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));

    expect(timer.remaining.value).toBe(remainingBefore);
  });

  // ============================================================
  // 边界与防御
  // ============================================================

  it("pause 在未运行时不生效", () => {
    const { timer } = setupTimer();
    timer.pause();
    expect(timer.isPaused.value).toBe(false);
    expect(timer.isRunning.value).toBe(false);
  });

  it("pause 在已暂停时不生效", () => {
    const { timer } = setupTimer();
    timer.start();
    timer.pause();
    const remainingAfterPause = timer.remaining.value;
    timer.pause();
    expect(timer.remaining.value).toBe(remainingAfterPause);
  });

  it("resume 在未暂停时不生效", () => {
    const { timer } = setupTimer();
    timer.start();
    const remainingBefore = timer.remaining.value;
    timer.resume(); // 未暂停时调用 resume
    expect(timer.remaining.value).toBe(remainingBefore);
  });

  it("skip 在未运行时也触发 onComplete", () => {
    const { timer, onComplete } = setupTimer();
    timer.skip();
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ completed: false })
    );
  });
});
