// ============================================================
// PomodoroX - 计时器引擎 Composable
// 纯计时逻辑，不依赖任何 Store，通过回调与外部通信
// ============================================================

import { ref, computed } from "vue";
import type { SessionType } from "@/types";
import { formatDateTime } from "@/utils/format";
import { TIMER_INTERVAL_MS } from "@/utils/constants";

/** 计时完成时向外传递的数据 */
export interface TimerCompleteData {
  /** 是否正常完成（false 表示被跳过） */
  completed: boolean;
  /** 当前会话类型 */
  sessionType: SessionType;
  /** 关联任务 ID */
  taskId: string | null;
  /** Session 规划文本 */
  plan: string;
  /** 会话开始时间 */
  startedAt: string;
  /** 本次 Session 设定的总时长（秒） */
  currentTotalDuration: number;
  /** 本次 Session 快进总秒数 */
  sessionFastForwardSeconds: number;
}

/** useTimer 选项 */
export interface UseTimerOptions {
  /** 根据 sessionType 获取时长（秒） */
  getDuration: (type: SessionType) => number;
  /** 计时完成回调（正常完成 / 跳过 / 快进导致完成） */
  onComplete?: (data: TimerCompleteData) => void;
}

export function useTimer(options: UseTimerOptions) {
  // ---- 响应式状态 ----
  /** 当前剩余秒数 */
  const remaining = ref(0);

  /** 是否正在运行 */
  const isRunning = ref(false);

  /** 是否暂停 */
  const isPaused = ref(false);

  /** 当前会话类型 */
  const sessionType = ref<SessionType>("work");

  /** 当前关联的任务 ID */
  const currentTaskId = ref<string | null>(null);

  /** 当前 Session 的总时长（用于进度计算） */
  const currentTotalDuration = ref(0);

  /** 当前 Session 的规划文本 */
  const currentSessionPlan = ref("");

  /** 当前 Session 已快进次数 */
  const sessionFastForwardCount = ref(0);

  /** 当前 Session 已快进秒数 */
  const sessionFastForwardSeconds = ref(0);

  // ---- 内部状态 ----
  /** 目标结束时间戳 */
  let targetEndTime = 0;

  /** 计时器 interval ID */
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  /** 当前会话开始时间 */
  let sessionStartTime = "";

  // ---- 计算属性 ----
  /** 格式化剩余时间 MM:SS */
  const formattedRemaining = computed(() => {
    const mins = Math.floor(remaining.value / 60);
    const secs = Math.floor(remaining.value % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  });

  /** 剩余时间百分比 */
  const progress = computed(() => {
    const total = currentTotalDuration.value || getTotalDuration();
    if (total <= 0) return 0;
    return Math.max(
      0,
      Math.min(100, ((total - remaining.value) / total) * 100)
    );
  });

  /** 是否是工作会话 */
  const isWorkSession = computed(() => sessionType.value === "work");

  // ---- 方法 ----

  /**
   * 获取当前会话类型的总时长
   */
  function getTotalDuration(): number {
    return options.getDuration(sessionType.value);
  }

  /**
   * 设置会话类型并重置计时器
   */
  function setSessionType(type: SessionType, taskId: string | null = null) {
    stopTimer();
    sessionType.value = type;
    currentTaskId.value = taskId;
    remaining.value = getTotalDuration();
    currentTotalDuration.value = getTotalDuration();
    isPaused.value = false;
    sessionFastForwardCount.value = 0;
    sessionFastForwardSeconds.value = 0;
  }

  /**
   * 设置当前关联的任务 ID
   */
  function setCurrentTaskId(taskId: string | null) {
    currentTaskId.value = taskId;
  }

  /**
   * 设置 Session 规划文本
   */
  function setPlan(plan: string) {
    currentSessionPlan.value = plan;
  }

  /**
   * 开始计时
   * @param duration 自定义时长（秒）
   * @param plan 本次 Session 的规划文本（可选）
   */
  function start(duration?: number, plan?: string) {
    if (isRunning.value) return;

    if (duration !== undefined) {
      remaining.value = duration;
      currentTotalDuration.value = duration;
    } else {
      currentTotalDuration.value = getTotalDuration();
    }

    currentSessionPlan.value = plan || "";
    sessionStartTime = formatDateTime(new Date());
    targetEndTime = Date.now() + remaining.value * 1000;
    sessionFastForwardCount.value = 0;
    sessionFastForwardSeconds.value = 0;
    isRunning.value = true;
    isPaused.value = false;

    // 启动定时检查
    timerInterval = setInterval(tick, TIMER_INTERVAL_MS);

    // 监听页面可见性变化
    document.addEventListener("visibilitychange", onVisibilityChange);

    // 监听页面关闭，防止 interval 泄漏
    window.addEventListener("beforeunload", onBeforeUnload);
  }

  /**
   * 暂停计时
   */
  function pause() {
    if (!isRunning.value || isPaused.value) return;

    isPaused.value = true;
    stopTimer();
    // 保存剩余时间
    remaining.value = Math.max(0, (targetEndTime - Date.now()) / 1000);
  }

  /**
   * 恢复计时
   */
  function resume() {
    if (!isPaused.value) return;

    isPaused.value = false;
    targetEndTime = Date.now() + remaining.value * 1000;
    isRunning.value = true;

    timerInterval = setInterval(tick, TIMER_INTERVAL_MS);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", onBeforeUnload);
  }

  /**
   * 重置计时器
   */
  function reset() {
    stopTimer();
    remaining.value = getTotalDuration();
    currentTotalDuration.value = getTotalDuration();
    isRunning.value = false;
    isPaused.value = false;
    sessionStartTime = "";
    sessionFastForwardCount.value = 0;
    sessionFastForwardSeconds.value = 0;
  }

  /**
   * 跳过当前会话
   */
  function skip() {
    sessionFastForwardCount.value = 0;
    sessionFastForwardSeconds.value = 0;
    stopTimer();
    options.onComplete?.({
      completed: false,
      sessionType: sessionType.value,
      taskId: currentTaskId.value,
      plan: currentSessionPlan.value,
      startedAt: sessionStartTime || formatDateTime(new Date()),
      currentTotalDuration: currentTotalDuration.value,
      sessionFastForwardSeconds: 0,
    });
  }

  /**
   * 快进当前会话（扣除指定秒数）
   * @param deduct 要扣除的秒数
   */
  function doFastForward(deduct: number) {
    const actualDeduct = Math.min(deduct, remaining.value);
    remaining.value = Math.max(0, remaining.value - actualDeduct);
    sessionFastForwardCount.value++;
    sessionFastForwardSeconds.value += actualDeduct;

    // 仅在运行中更新 targetEndTime；暂停时 resume() 会基于 remaining 重新计算
    if (isRunning.value && !isPaused.value) {
      targetEndTime = Math.max(Date.now(), targetEndTime - actualDeduct * 1000);
    }

    if (remaining.value <= 0) {
      stopTimer();
      isRunning.value = false;
      isPaused.value = false;
      options.onComplete?.({
        completed: true,
        sessionType: sessionType.value,
        taskId: currentTaskId.value,
        plan: currentSessionPlan.value,
        startedAt: sessionStartTime || formatDateTime(new Date()),
        currentTotalDuration: currentTotalDuration.value,
        sessionFastForwardSeconds: sessionFastForwardSeconds.value,
      });
    }
  }

  /**
   * 若 remaining 为 0 且未运行，初始化为默认时长
   */
  function initRemainingIfZero() {
    if (remaining.value <= 0 && !isRunning.value) {
      remaining.value = getTotalDuration();
      currentTotalDuration.value = getTotalDuration();
    }
  }

  // ---- 内部方法 ----

  /**
   * 定时器 tick
   */
  function tick() {
    if (!isRunning.value || isPaused.value) return;

    const now = Date.now();
    const newRemaining = Math.max(0, (targetEndTime - now) / 1000);
    remaining.value = newRemaining;

    if (newRemaining <= 0) {
      stopTimer();
      isRunning.value = false;
      isPaused.value = false;
      options.onComplete?.({
        completed: true,
        sessionType: sessionType.value,
        taskId: currentTaskId.value,
        plan: currentSessionPlan.value,
        startedAt: sessionStartTime || formatDateTime(new Date()),
        currentTotalDuration: currentTotalDuration.value,
        sessionFastForwardSeconds: sessionFastForwardSeconds.value,
      });
    }
  }

  /**
   * 页面关闭前清理
   */
  function onBeforeUnload() {
    stopTimer();
  }

  /**
   * 停止定时器
   */
  function stopTimer() {
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("beforeunload", onBeforeUnload);
  }

  /**
   * 页面可见性变化处理
   * 当页面从隐藏变为可见时，补偿节流导致的时间差
   */
  function onVisibilityChange() {
    if (!document.hidden && isRunning.value && !isPaused.value) {
      // 页面重新可见，立即更新剩余时间
      const now = Date.now();
      const newRemaining = Math.max(0, (targetEndTime - now) / 1000);
      remaining.value = newRemaining;

      if (newRemaining <= 0) {
        stopTimer();
        isRunning.value = false;
        isPaused.value = false;
        options.onComplete?.({
          completed: true,
          sessionType: sessionType.value,
          taskId: currentTaskId.value,
          plan: currentSessionPlan.value,
          startedAt: sessionStartTime || formatDateTime(new Date()),
          currentTotalDuration: currentTotalDuration.value,
          sessionFastForwardSeconds: sessionFastForwardSeconds.value,
        });
      }
    }
  }

  return {
    // 状态
    remaining,
    isRunning,
    isPaused,
    sessionType,
    currentTaskId,
    currentTotalDuration,
    currentSessionPlan,
    sessionFastForwardCount,
    sessionFastForwardSeconds,
    // 计算属性
    formattedRemaining,
    progress,
    isWorkSession,
    // 方法
    setSessionType,
    setCurrentTaskId,
    setPlan,
    start,
    pause,
    resume,
    reset,
    skip,
    doFastForward,
    initRemainingIfZero,
    getTotalDuration,
  };
}
