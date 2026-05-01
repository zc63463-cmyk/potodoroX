// ============================================================
// PomodoroX - 计时器 Store
// 使用时间戳方式处理计时，避免后台节流问题
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SessionType, Session } from '@/types'
import { db } from '@/services/database'
import { formatDateTime } from '@/utils/format'
import { generateId } from '@/utils/id'
import { TIMER_INTERVAL_MS } from '@/utils/constants'

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

  /** 今日会话历史 */
  const todaySessions = ref<Session[]>([])

  /** 连续番茄钟计数（用于判断长休息） */
  const pomodoroStreak = ref(0)

  // 内部状态
  /** 目标结束时间戳 */
  let targetEndTime = 0

  /** 计时器 interval ID */
  let timerInterval: ReturnType<typeof setInterval> | null = null

  /** 当前会话开始时间 */
  let sessionStartTime = ''

  /** 当前会话 ID */
  let currentSessionId: string | null = null

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
   */
  function getTotalDuration(): number {
    // 从 settings store 获取时长，避免循环依赖
    const settingsStr = localStorage.getItem('pomodorox-settings')
    let settings: Record<string, number> = {}
    if (settingsStr) {
      try {
        settings = JSON.parse(settingsStr)
      } catch {
        // 使用默认值
      }
    }

    switch (sessionType.value) {
      case 'work':
        return settings.workDuration || 25 * 60
      case 'short_break':
        return settings.shortBreakDuration || 5 * 60
      case 'long_break':
        return settings.longBreakDuration || 15 * 60
      case 'free':
        return remaining.value // 自由计时器使用当前值
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
    currentSessionId = generateId()
    targetEndTime = Date.now() + remaining.value * 1000
    isRunning.value = true
    isPaused.value = false

    // 启动定时检查
    timerInterval = setInterval(tick, TIMER_INTERVAL_MS)

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', onVisibilityChange)

    // 如果在 Tauri 环境中，通知 Rust 端
    notifyTauriTimerStart()
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
    notifyTauriTimerStart()
  }

  /**
   * 重置计时器
   */
  function reset() {
    stopTimer()
    remaining.value = getTotalDuration()
    isRunning.value = false
    isPaused.value = false
    currentSessionId = null
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
    stopTimer()

    const session: Session = {
      id: currentSessionId || generateId(),
      taskId: currentTaskId.value,
      type: sessionType.value,
      duration: getTotalDuration(),
      completed,
      startedAt: sessionStartTime || formatDateTime(new Date()),
      endedAt: formatDateTime(new Date()),
      synced: false,
    }

    // 保存会话到数据库
    try {
      await db.createSession({
        taskId: session.taskId,
        type: session.type,
        duration: session.duration,
        completed: session.completed,
        startedAt: session.startedAt,
      })

      // 如果是完成的工作会话，更新番茄钟计数
      if (completed && sessionType.value === 'work') {
        completedPomodoros.value++
        pomodoroStreak.value++

        // 更新任务的 actualPomodoros
        if (currentTaskId.value) {
          const task = await db.getTask(currentTaskId.value)
          if (task) {
            await db.updateTask(currentTaskId.value, {
              actualPomodoros: task.actualPomodoros + 1,
            })
          }
        }
      }

      // 添加到今日会话
      todaySessions.value.unshift(session)
    } catch (err) {
      console.error('[Timer] 保存会话失败:', err)
    }

    // 重置状态
    isRunning.value = false
    isPaused.value = false
    currentSessionId = null
    sessionStartTime = ''

    // 自动切换到下一个会话类型
    if (completed) {
      autoSwitchSession()
    } else {
      remaining.value = getTotalDuration()
    }
  }

  /**
   * 自动切换到下一个会话类型
   */
  function autoSwitchSession() {
    const settingsStr = localStorage.getItem('pomodorox-settings')
    let longBreakInterval = 4
    let autoStartBreak = false
    let autoStartPomodoro = false
    if (settingsStr) {
      try {
        const s = JSON.parse(settingsStr)
        longBreakInterval = s.longBreakInterval || 4
        autoStartBreak = s.autoStartBreak || false
        autoStartPomodoro = s.autoStartPomodoro || false
      } catch {
        // 使用默认值
      }
    }

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
   */
  async function loadTodaySessions(): Promise<void> {
    try {
      const today = new Date()
      const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
      const sessions = await db.getSessionsByDateRange(dateStr, dateStr)
      todaySessions.value = sessions
      completedPomodoros.value = sessions.filter(
        (s) => s.type === 'work' && s.completed
      ).length
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
    notifyTauriTimerStop()
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

  /**
   * 通知 Tauri Rust 端计时器开始
   */
  async function notifyTauriTimerStart() {
    try {
      if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
        const { invoke } = await import('@tauri-apps/api/core')
        await invoke('timer_tick', { remaining: remaining.value })
      }
    } catch {
      // Rust 端可能未实现，忽略
    }
  }

  /**
   * 通知 Tauri Rust 端计时器停止
   */
  async function notifyTauriTimerStop() {
    try {
      if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
        const { invoke } = await import('@tauri-apps/api/core')
        await invoke('timer_stop')
      }
    } catch {
      // 忽略
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
    todaySessions,
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
