// ============================================================
// PomodoroX - 计时器 Store
// 业务门面层：内部组合 useTimer 计时引擎，负责持久化与统计
// ============================================================

import { defineStore } from "pinia";
import { ref } from "vue";
import type { SessionType } from "@/types";
import { useSessionStore } from "@/stores/session";
import { useTaskStore } from "@/stores/task";
import { useSettingsStore } from "@/stores/settings";
import { useSyncStore } from "@/stores/sync";
import { db } from "@/services/database";
import { useTimer } from "@/composables/useTimer";
import type { TimerCompleteData } from "@/composables/useTimer";

export const useTimerStore = defineStore("timer", () => {
  // ---- 业务状态 ----
  /** 今日已完成番茄钟数 */
  const completedPomodoros = ref(0);

  /** 连续番茄钟计数（用于判断长休息） */
  const pomodoroStreak = ref(0);

  /**
   * 待显示的 Session 总结弹窗关联的 taskId
   * 仅在实际完成的 work session（且有任务上下文）后设置
   * TimerView 监听此值来显示总结弹窗，而非直接监听 isRunning
   */
  const pendingCompletionForTaskId = ref<string | null>(null);

  /** 是否正在完成会话（防止竞态） */
  const isCompleting = ref(false);

  // ---- 计时引擎 ----
  const timer = useTimer({
    getDuration: (type: SessionType) => {
      const settings = useSettingsStore().settings;
      switch (type) {
        case "work":
          return settings.workDuration || 25 * 60;
        case "short_break":
          return settings.shortBreakDuration || 5 * 60;
        case "long_break":
          return settings.longBreakDuration || 15 * 60;
        case "free":
          return settings.freeDuration || 30 * 60;
        default:
          return 25 * 60;
      }
    },
    onComplete: (data) => {
      handleTimerComplete(data);
    },
  });

  // ---- 计时引擎状态/方法透传 ----

  // 状态
  const remaining = timer.remaining;
  const isRunning = timer.isRunning;
  const isPaused = timer.isPaused;
  const sessionType = timer.sessionType;
  const currentTaskId = timer.currentTaskId;
  const currentTotalDuration = timer.currentTotalDuration;
  const currentSessionPlan = timer.currentSessionPlan;
  const sessionFastForwardCount = timer.sessionFastForwardCount;
  const sessionFastForwardSeconds = timer.sessionFastForwardSeconds;

  // 计算属性
  const formattedRemaining = timer.formattedRemaining;
  const progress = timer.progress;
  const isWorkSession = timer.isWorkSession;

  // 方法透传（纯计时逻辑，无需业务包装）
  const setSessionType = timer.setSessionType;
  const setCurrentTaskId = timer.setCurrentTaskId;
  const start = timer.start;
  const pause = timer.pause;
  const resume = timer.resume;
  const reset = timer.reset;
  const skip = timer.skip;
  const initRemainingIfZero = timer.initRemainingIfZero;
  const getTotalDuration = timer.getTotalDuration;

  /**
   * 计时完成后的业务处理（持久化 + 统计 + 自动切换）
   */
  async function handleTimerComplete(data: TimerCompleteData) {
    if (isCompleting.value) return;
    isCompleting.value = true;

    // 重置快进状态
    sessionFastForwardCount.value = 0;
    sessionFastForwardSeconds.value = 0;

    const actualDuration = Math.max(
      0,
      data.currentTotalDuration - data.sessionFastForwardSeconds
    );

    const sessionInput = {
      taskId: data.taskId,
      type: data.sessionType,
      duration: actualDuration,
      completed: data.completed,
      startedAt: data.startedAt,
      plan: data.plan,
      completion: "",
    };

    // 通过 SessionStore 保存会话
    try {
      const sessionStore = useSessionStore();
      const taskStore = useTaskStore();
      const syncStore = useSyncStore();

      // 如果是完成的工作会话且有关联任务，使用原子事务同时创建 session 和更新 task
      if (data.completed && data.sessionType === "work" && data.taskId) {
        const task = taskStore.tasks.find((t) => t.id === data.taskId);
        if (task) {
          const updates: Parameters<typeof taskStore.updateTask>[1] = {
            actualPomodoros: task.actualPomodoros + 1,
          };
          if (!task.plan && data.plan) {
            updates.plan = data.plan;
          }

          // 原子操作：session 创建 + task 更新下沉到 Service 层
          const { session, updatedTask } = await db.createSessionAndUpdateTask(
            sessionInput,
            data.taskId!,
            updates
          );

          // 内存状态同步（事务成功后）
          sessionStore.sessions.unshift(session);
          if (updatedTask) {
            const idx = taskStore.tasks.findIndex((t) => t.id === data.taskId);
            if (idx !== -1) {
              taskStore.tasks[idx] = updatedTask;
            }
            await syncStore.recordEvent(
              "task.updated",
              data.taskId,
              updatedTask
            );
          }
          await syncStore.recordEvent("session.created", session.id, session);

          completedPomodoros.value++;
          pomodoroStreak.value++;
        } else {
          // 任务在内存中不存在，退化为非原子操作
          await sessionStore.addSession(sessionInput);
          completedPomodoros.value++;
          pomodoroStreak.value++;
        }
      } else {
        await sessionStore.addSession(sessionInput);
        if (data.completed && data.sessionType === "work") {
          completedPomodoros.value++;
          pomodoroStreak.value++;
        }
      }
    } catch (err) {
      console.error("[Timer] 保存会话失败:", err);
    }

    // 设置总结弹窗标志：仅已完成的 work session（且有任务上下文）
    pendingCompletionForTaskId.value =
      data.completed && data.sessionType === "work" && data.taskId
        ? data.taskId
        : null;

    // 自动切换到下一个会话类型
    if (data.completed) {
      autoSwitchSession();
    } else {
      // 跳过：重置到默认时长
      timer.setSessionType(timer.sessionType.value);
    }

    isCompleting.value = false;
  }

  /**
   * 自动切换到下一个会话类型
   */
  function autoSwitchSession() {
    const settings = useSettingsStore().settings;
    const longBreakInterval = settings.longBreakInterval || 4;
    const autoStartBreak = settings.autoStartBreak || false;
    const autoStartPomodoro = settings.autoStartPomodoro || false;

    if (sessionType.value === "work") {
      // 工作完成后切换到休息
      if (pomodoroStreak.value >= longBreakInterval) {
        timer.setSessionType("long_break");
        pomodoroStreak.value = 0;
      } else {
        timer.setSessionType("short_break");
      }

      if (autoStartBreak) {
        timer.start();
      }
    } else if (sessionType.value === "free") {
      // 自由计时完成后不自动切换，重置到默认时长
      timer.setSessionType("free");
    } else {
      // 休息完成后切换到工作
      timer.setSessionType("work");

      if (autoStartPomodoro) {
        timer.start();
      }
    }
  }

  /**
   * 快进当前会话 10 分钟
   * @param force 是否强制跳过额度检查（用户确认后）
   * @returns { success: boolean; reason?: 'idle' | 'quota_exhausted' }
   */
  async function fastForward(force = false): Promise<{
    success: boolean;
    reason?: "idle" | "quota_exhausted";
  }> {
    if (!isRunning.value && !isPaused.value) {
      return { success: false, reason: "idle" };
    }

    // 检查免费额度（每 session 3 次）
    if (sessionFastForwardCount.value < 3) {
      timer.doFastForward(600);
      return { success: true };
    }

    // 检查并重置每周额度
    const settingsStore = useSettingsStore();
    settingsStore.checkAndResetWeeklyQuota();

    const quota = settingsStore.settings.weeklyFastForwardQuota || 10;
    const used = settingsStore.settings.weeklyFastForwardUsed || 0;

    if (used < quota) {
      await settingsStore.updateSettings({ weeklyFastForwardUsed: used + 1 });
      timer.doFastForward(600);
      return { success: true };
    }

    // 额度已用完
    if (force) {
      await settingsStore.updateSettings({ weeklyFastForwardUsed: used + 1 });
      timer.doFastForward(600);
      return { success: true };
    }

    return { success: false, reason: "quota_exhausted" };
  }

  /**
   * 加载今日会话数据
   * 委托给 SessionStore，同时更新本 store 的 completedPomodoros
   */
  async function loadTodaySessions(): Promise<void> {
    try {
      const sessionStore = useSessionStore();
      await sessionStore.loadAllSessions();
      completedPomodoros.value = sessionStore.todayPomodoros;
    } catch (err) {
      console.error("[Timer] 加载今日会话失败:", err);
    }
  }

  /**
   * 清除待显示的 Session 总结弹窗标志
   */
  function clearPendingCompletion() {
    pendingCompletionForTaskId.value = null;
  }

  return {
    // 状态
    remaining,
    isRunning,
    isPaused,
    sessionType,
    currentTaskId,
    completedPomodoros,
    pomodoroStreak,
    currentSessionPlan,
    pendingCompletionForTaskId,
    currentTotalDuration,
    sessionFastForwardCount,
    sessionFastForwardSeconds,
    // 计算属性
    formattedRemaining,
    progress,
    isWorkSession,
    // 方法
    setSessionType,
    start,
    pause,
    resume,
    reset,
    skip,
    fastForward,
    loadTodaySessions,
    getTotalDuration,
    setCurrentTaskId,
    clearPendingCompletion,
    initRemainingIfZero,
  };
});
