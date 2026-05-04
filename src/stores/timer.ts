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

  // 内部状态
  /** 目标结束时间戳 */
  let targetEndTime = 0

  /** 计时器 interval ID */
  let timerInterval: ReturnType<typeof setInterval> | null = null

  /** 当前会话开始时间 */
  let sessionStartTime = ''

  /** 是否正在完成会话（防止竞态） */
  let isCompleting = false

  // ---- 计算属性 ----
  /** 格式化剩余时间 MM:SS */
  const formattedRemaining = computed(() => {
    const mins = Math.floor(remaining.value / 60)
    const secs = Math.floor(remaining.value % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  })

  /** 剩余时间百分比 */
  const progress = computed(() => {
    const total = getTotalDuration()
    if (total <= 0) return 0
    return Math.max(0, Math.min(100, ((total - remaining.value) / total) * 100))
  })

  /** 是否是工作会话 */
  const isWorkSession = computed(() => sessionType.value === 'work')

  // ---- 方法 ----

  /**
   * 获取当前会话类型的总时长
   * 通过延迟调用 settingsStore 获取，保持响应式
   */
  function getTotalDuration(): number {
    // 延迟调用避免模块级循环依赖
    const settingsStore = useSettingsStore()
    const settings = settingsStore.settings

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
    isPaused.value = false
  }

  /**
   * 开始计时
   */
  function start(duration?: number) {
    if (isRunning.value) return

    if (duration !== undefined) {
      remaining.value = duration
    }

    sessionStartTime = formatDateTime(new Date())
    targetEndTime = Date.now() + remaining.value * 1000
    isRunning.value = true
    isPaused.value = false

    // 启动定时检查
    timerInterval = setInterval(tick, TIMER_INTERVAL_MS)

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', onVisibilityChange)
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
  }

  /**
   * 重置计时器
   */
  function reset() {
    stopTimer()
    remaining.value = getTotalDuration()
    isRunning.value = false
    isPaused.value = false
    sessionStartTime = ''
  }

  /**
   * 跳过当前会话
   */
  function skip() {
    completeSession(false)
  }

  /**
   * 完成当前会话
   */
  async function completeSession(completed = true) {
    if (isCompleting) return
    isCompleting = true

    stopTimer()

    const sessionInput = {
      taskId: currentTaskId.value,
      type: sessionType.value,
      duration: getTotalDuration(),
      completed,
      startedAt: sessionStartTime || formatDateTime(new Date()),
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
    } catch (err) {
      console.error('[Timer] 保存会话失败:', err)
    }

    // 重置状态
    isRunning.value = false
    isPaused.value = false
    sessionStartTime = ''

    // 自动切换到下一个会话类型
    if (completed) {
      autoSwitchSession()
    } else {
      remaining.value = getTotalDuration()
    }

    isCompleting = false
  }

  /**
   * 自动切换到下一个会话类型
   */
  function autoSwitchSession() {
    const settingsStore = useSettingsStore()
    const longBreakInterval = settingsStore.settings.longBreakInterval || 4
    const autoStartBreak = settingsStore.settings.autoStartBreak || false
    const autoStartPomodoro = settingsStore.settings.autoStartPomodoro || false

    if (sessionType.value === 'work') {
      // 工作完成后切换到休息
      if (pomodoroStreak.value >= longBreakInterval) {
        sessionType.value = 'long_break'
        pomodoroStreak.value = 0
      } else {
        sessionType.value = 'short_break'
      }
      remaining.value = getTotalDuration()

      if (autoStartBreak) {
        start()
      }
    } else if (sessionType.value === 'free') {
      // 自由计时完成后不自动切换，重置到默认时长
      remaining.value = getTotalDuration()
    } else {
      // 休息完成后切换到工作
      sessionType.value = 'work'
      remaining.value = getTotalDuration()

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
    if (!isRunning.value || isPaused.value) return

    const now = Date.now()
    const newRemaining = Math.max(0, (targetEndTime - now) / 1000)
    remaining.value = newRemaining

    if (newRemaining <= 0) {
      completeSession(true)
    }
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
  }

  /**
   * 页面可见性变化处理
   * 当页面从隐藏变为可见时，补偿节流导致的时间差
   */
  function onVisibilityChange() {
    if (!document.hidden && isRunning.value && !isPaused.value) {
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
    completeSession,
    loadTodaySessions,
    getTotalDuration,
  }
})
