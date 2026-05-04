// ============================================================
// PomodoroX - 计时器 Store
// 使用时间戳方式处理计时，避免后台节流问题
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SessionType } from '@/types'
import { useSessionStore } from '@/stores/session'
import { useTaskStore } from '@/stores/task'
import { formatDateTime } from '@/utils/format'
import { TIMER_INTERVAL_MS } from '@/utils/constants'
import { useSettingsStore } from '@/stores/settings'

export const useTimerStore = defineStore('timer', () => {
  // ---- 状态 ----
  /** 当前剩余秒数 */
  const remaining = ref(0)

  /** 是否正在运行 */
  const isRunning = ref(false)

  /** 是否暂停 */
  const isPaused = ref(false)

  /** 当前会话类型 */
  const sessionType = ref<SessionType>('work')

  /** 当前关联的任务 ID */
  const currentTaskId = ref<string | null>(null)

  /** 今日已完成番茄钟数 */
  const completedPomodoros = ref(0)

  /** 连续番茄钟计数（用于判断长休息） */
  const pomodoroStreak = ref(0)

  /** 当前 Session 的总时长（用于进度计算，支持自由模式自定义时长） */
  const currentTotalDuration = ref(0)

  /** 当前 Session 已快进次数 */
  const sessionFastForwardCount = ref(0)

  /** 当前 Session 已快进秒数 */
  const sessionFastForwardSeconds = ref(0)

  // 内部状态
  /** 目标结束时间戳 */
  let targetEndTime = 0

  /** 计时器 interval ID */
  let timerInterval: ReturnType<typeof setInterval> | null = null

  /** 当前会话开始时间 */
  let sessionStartTime = ''

  /** 是否正在完成会话（防止竞态） */
  let isCompleting = false

  /** 当前 Session 的规划文本（临时状态，不持久化） */
  const currentSessionPlan = ref('')

  /**
   * 待显示的 Session 总结弹窗关联的 taskId
   * 仅在实际完成的 work session（且有任务上下文）后设置
   * TimerView 监听此值来显示总结弹窗，而非直接监听 isRunning
   */
  const pendingCompletionForTaskId = ref<string | null>(null)

  // ---- 计算属性 ----
  /** 格式化剩余时间 MM:SS */
  const formattedRemaining = computed(() => {
    const mins = Math.floor(remaining.value / 60)
    const secs = Math.floor(remaining.value % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  })

  /** 剩余时间百分比 */
  const progress = computed(() => {
    const total = currentTotalDuration.value || getTotalDuration()
    if (total <= 0) return 0
    return Math.max(0, Math.min(100, ((total - remaining.value) / total) * 100))
  })

  /** 是否是工作会话 */
  const isWorkSession = computed(() => sessionType.value === 'work')

  // ---- 方法 ----

  /** Settings store 实例（在 store 初始化后设置，避免循环依赖检测误报） */
  let _settingsStore: ReturnType<typeof useSettingsStore> | null = null

  function getSettingsStore() {
    if (!_settingsStore) {
      _settingsStore = useSettingsStore()
    }
    return _settingsStore
  }

  /**
   * 获取当前会话类型的总时长
   */
  function getTotalDuration(): number {
    const settings = getSettingsStore().settings

    switch (sessionType.value) {
      case 'work':
        return settings.workDuration || 25 * 60
      case 'short_break':
        return settings.shortBreakDuration || 5 * 60
      case 'long_break':
        return settings.longBreakDuration || 15 * 60
      case 'free':
        return settings.freeDuration || 30 * 60
      default:
        return 25 * 60
    }
  }

  /**
   * 设置会话类型并重置计时器
   */
  function setSessionType(type: SessionType, taskId: string | null = null) {
    stopTimer()
    sessionType.value = type
    currentTaskId.value = taskId
    remaining.value = getTotalDuration()
    currentTotalDuration.value = getTotalDuration()
    isPaused.value = false
    sessionFastForwardCount.value = 0
    sessionFastForwardSeconds.value = 0
  }

  /**
   * 开始计时
   * @param duration 自定义时长（秒）
   * @param plan 本次 Session 的规划文本（可选）
   */
  function start(duration?: number, plan?: string) {
    if (isRunning.value) return

    if (duration !== undefined) {
      remaining.value = duration
      currentTotalDuration.value = duration
    } else {
      currentTotalDuration.value = getTotalDuration()
    }

    currentSessionPlan.value = plan || ''
    sessionStartTime = formatDateTime(new Date())
    targetEndTime = Date.now() + remaining.value * 1000
    sessionFastForwardCount.value = 0
    sessionFastForwardSeconds.value = 0
    isRunning.value = true
    isPaused.value = false

    // 启动定时检查
    timerInterval = setInterval(tick, TIMER_INTERVAL_MS)

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', onVisibilityChange)

    // 监听页面关闭，防止 interval 泄漏
    window.addEventListener('beforeunload', onBeforeUnload)
  }

  /**
   * 暂停计时
   */
  function pause() {
    if (!isRunning.value || isPaused.value) return

    isPaused.value = true
    stopTimer()
    // 保存剩余时间
    remaining.value = Math.max(0, (targetEndTime - Date.now()) / 1000)
  }

  /**
   * 恢复计时
   */
  function resume() {
    if (!isPaused.value) return

    isPaused.value = false
    targetEndTime = Date.now() + remaining.value * 1000
    isRunning.value = true

    timerInterval = setInterval(tick, TIMER_INTERVAL_MS)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('beforeunload', onBeforeUnload)
  }

  /**
   * 重置计时器
   */
  function reset() {
    stopTimer()
    remaining.value = getTotalDuration()
    currentTotalDuration.value = getTotalDuration()
    isRunning.value = false
    isPaused.value = false
    sessionStartTime = ''
    pendingCompletionForTaskId.value = null
    sessionFastForwardCount.value = 0
    sessionFastForwardSeconds.value = 0
  }

  /**
   * 跳过当前会话
   */
  function skip() {
    sessionFastForwardCount.value = 0
    sessionFastForwardSeconds.value = 0
    completeSession(false)
  }

  /**
   * 设置当前关联的任务 ID（通过 action 修改，启用 DevTools 追踪）
   */
  function setCurrentTaskId(taskId: string | null) {
    currentTaskId.value = taskId
  }

  /**
   * 清除待显示的 Session 总结弹窗标志
   */
  function clearPendingCompletion() {
    pendingCompletionForTaskId.value = null
  }

  /**
   * 若 remaining 为 0 且未运行，初始化为默认时长
   */
  function initRemainingIfZero() {
    if (remaining.value <= 0 && !isRunning.value) {
      remaining.value = getTotalDuration()
      currentTotalDuration.value = getTotalDuration()
    }
  }

  /**
   * 快进当前会话 10 分钟
   * @param force 是否强制跳过额度检查（用户确认后）
   * @returns { success: boolean; reason?: 'idle' | 'quota_exhausted' }
   */
  function fastForward(force = false): { success: boolean; reason?: 'idle' | 'quota_exhausted' } {
    if (!isRunning.value && !isPaused.value) {
      return { success: false, reason: 'idle' }
    }

    // 检查免费额度（每 session 3 次）
    if (sessionFastForwardCount.value < 3) {
      doFastForward()
      return { success: true }
    }

    // 检查并重置每周额度
    const settingsStore = getSettingsStore()
    settingsStore.checkAndResetWeeklyQuota()

    const quota = settingsStore.settings.weeklyFastForwardQuota || 10
    const used = settingsStore.settings.weeklyFastForwardUsed || 0

    if (used < quota) {
      settingsStore.settings.weeklyFastForwardUsed = used + 1
      doFastForward()
      return { success: true }
    }

    // 额度已用完
    if (force) {
      settingsStore.settings.weeklyFastForwardUsed = used + 1
      doFastForward()
      return { success: true }
    }

    return { success: false, reason: 'quota_exhausted' }
  }

  /**
   * 执行快进操作（内部）
   */
  function doFastForward() {
    const deduct = Math.min(600, remaining.value)
    remaining.value = Math.max(0, remaining.value - deduct)
    sessionFastForwardCount.value++
    sessionFastForwardSeconds.value += deduct

    // 仅在运行中更新 targetEndTime；暂停时 resume() 会基于 remaining 重新计算
    if (isRunning.value && !isPaused.value) {
      targetEndTime = Math.max(Date.now(), targetEndTime - deduct * 1000)
    }

    if (remaining.value <= 0) {
      completeSession(true)
    }
  }

  /**
   * 完成当前会话
   */
  async function completeSession(completed = true) {
    if (isCompleting) return
    isCompleting = true

    stopTimer()

    const actualDuration = Math.max(0, currentTotalDuration.value - sessionFastForwardSeconds.value)

    const sessionInput = {
      taskId: currentTaskId.value,
      type: sessionType.value,
      duration: actualDuration,
      completed,
      startedAt: sessionStartTime || formatDateTime(new Date()),
      plan: currentSessionPlan.value,
      completion: '',
    }

    // 通过 SessionStore 保存会话
    try {
      const sessionStore = useSessionStore()
      await sessionStore.addSession(sessionInput)

      // 如果是完成的工作会话，更新番茄钟计数
      if (completed && sessionType.value === 'work') {
        completedPomodoros.value++
        pomodoroStreak.value++

        // 更新任务的 actualPomodoros（通过 taskStore 保持内存同步）
        if (currentTaskId.value) {
          const taskStore = useTaskStore()
          const task = taskStore.tasks.find(t => t.id === currentTaskId.value)
          if (task) {
            await taskStore.updateTask(currentTaskId.value, {
              actualPomodoros: task.actualPomodoros + 1,
            })
          }
        }
      }

      // 自动同步：如果任务 plan 为空，且本次 session 有 plan，则复制到任务
      if (currentTaskId.value && currentSessionPlan.value) {
        const taskStore = useTaskStore()
        const task = taskStore.getTaskById(currentTaskId.value)
        if (task && !task.plan) {
          await taskStore.updateTask(currentTaskId.value, { plan: currentSessionPlan.value })
        }
      }
    } catch (err) {
      console.error('[Timer] 保存会话失败:', err)
    }

    // 重置状态
    isRunning.value = false
    isPaused.value = false
    sessionStartTime = ''
    currentSessionPlan.value = ''
    sessionFastForwardCount.value = 0
    sessionFastForwardSeconds.value = 0

    // 设置总结弹窗标志：仅已完成的 work session（且有任务上下文）
    pendingCompletionForTaskId.value = completed && sessionType.value === 'work' && currentTaskId.value
      ? currentTaskId.value
      : null

    // 自动切换到下一个会话类型
    if (completed) {
      autoSwitchSession()
    } else {
      remaining.value = getTotalDuration()
      currentTotalDuration.value = getTotalDuration()
    }

    isCompleting = false
  }

  /**
   * 自动切换到下一个会话类型
   */
  function autoSwitchSession() {
    const settings = getSettingsStore().settings
    const longBreakInterval = settings.longBreakInterval || 4
    const autoStartBreak = settings.autoStartBreak || false
    const autoStartPomodoro = settings.autoStartPomodoro || false

    if (sessionType.value === 'work') {
      // 工作完成后切换到休息
      if (pomodoroStreak.value >= longBreakInterval) {
        sessionType.value = 'long_break'
        pomodoroStreak.value = 0
      } else {
        sessionType.value = 'short_break'
      }
      remaining.value = getTotalDuration()
      currentTotalDuration.value = getTotalDuration()

      if (autoStartBreak) {
        start()
      }
    } else if (sessionType.value === 'free') {
      // 自由计时完成后不自动切换，重置到默认时长
      remaining.value = getTotalDuration()
      currentTotalDuration.value = getTotalDuration()
    } else {
      // 休息完成后切换到工作
      sessionType.value = 'work'
      remaining.value = getTotalDuration()
      currentTotalDuration.value = getTotalDuration()

      if (autoStartPomodoro) {
        start()
      }
    }
  }

  /**
   * 加载今日会话数据
   * 委托给 SessionStore，同时更新本 store 的 completedPomodoros
   */
  async function loadTodaySessions(): Promise<void> {
    try {
      const sessionStore = useSessionStore()
      await sessionStore.loadAllSessions()
      completedPomodoros.value = sessionStore.todayPomodoros
    } catch (err) {
      console.error('[Timer] 加载今日会话失败:', err)
    }
  }

  // ---- 内部方法 ----

  /**
   * 定时器 tick
   */
  function tick() {
    if (!isRunning.value || isPaused.value || isCompleting) return

    const now = Date.now()
    const newRemaining = Math.max(0, (targetEndTime - now) / 1000)
    remaining.value = newRemaining

    if (newRemaining <= 0) {
      completeSession(true)
    }
  }

  /**
   * 页面关闭前清理
   */
  function onBeforeUnload() {
    stopTimer()
  }

  /**
   * 停止定时器
   */
  function stopTimer() {
    if (timerInterval !== null) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.removeEventListener('beforeunload', onBeforeUnload)
  }

  /**
   * 页面可见性变化处理
   * 当页面从隐藏变为可见时，补偿节流导致的时间差
   */
  function onVisibilityChange() {
    if (!document.hidden && isRunning.value && !isPaused.value && !isCompleting) {
      // 页面重新可见，立即更新剩余时间
      const now = Date.now()
      const newRemaining = Math.max(0, (targetEndTime - now) / 1000)
      remaining.value = newRemaining

      if (newRemaining <= 0) {
        completeSession(true)
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
    completeSession,
    loadTodaySessions,
    getTotalDuration,
    setCurrentTaskId,
    clearPendingCompletion,
    initRemainingIfZero,
  }
})
