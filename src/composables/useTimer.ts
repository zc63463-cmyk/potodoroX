// ============================================================
// PomodoroX - 计时器 Composable
// 基于时间戳的计时方案，处理后台节流
//
// ⚠️ 已废弃：请使用 useTimerStore (stores/timer.ts) 代替
// 本 composable 仅保留作为参考，不在任何视图中使用
// ============================================================

import { ref, computed, onUnmounted } from 'vue'
import type { SessionType } from '@/types'
import { TIMER_INTERVAL_MS } from '@/utils/constants'
import { playFocusStart, playBreakStart, playSessionComplete } from './useAudio'

export function useTimer() {
  // ---- 响应式状态 ----
  /** 剩余秒数 */
  const remaining = ref(0)

  /** 是否正在运行 */
  const isRunning = ref(false)

  /** 是否暂停 */
  const isPaused = ref(false)

  /** 当前会话类型 */
  const sessionType = ref<SessionType>('work')

  /** 当前关联的任务 ID */
  const currentTaskId = ref<string | null>(null)

  /** 完成回调 */
  let onComplete: (() => void) | null = null

  // ---- 内部状态 ----
  /** 目标结束时间戳（毫秒） */
  let targetEndTime = 0

  /** 计时器 interval */
  let timerInterval: ReturnType<typeof setInterval> | null = null

  // ---- 计算属性 ----

  /** 格式化剩余时间 MM:SS */
  const formattedRemaining = computed(() => {
    const totalSeconds = Math.ceil(remaining.value)
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  })

  /** 剩余秒数（整数） */
  const remainingSeconds = computed(() => Math.ceil(remaining.value))

  /** 是否已完成 */
  const isCompleted = computed(() => remaining.value <= 0 && !isRunning.value)

  // ---- 方法 ----

  /**
   * 开始计时
   * @param durationSeconds 计时时长（秒）
   * @param type 会话类型
   * @param taskId 关联任务 ID
   * @param completeCallback 完成回调
   */
  function start(
    durationSeconds: number,
    type: SessionType = 'work',
    taskId: string | null = null,
    completeCallback?: () => void
  ) {
    // 先停止之前的计时
    stop()

    remaining.value = durationSeconds
    sessionType.value = type
    currentTaskId.value = taskId
    isRunning.value = true
    isPaused.value = false
    if (completeCallback) {
      onComplete = completeCallback
    }

    // 计算目标结束时间
    targetEndTime = Date.now() + durationSeconds * 1000

    // 播放开始音效
    if (type === 'work') {
      playFocusStart()
    } else {
      playBreakStart()
    }

    // 启动定时器
    timerInterval = setInterval(tick, TIMER_INTERVAL_MS)

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  /**
   * 暂停计时
   */
  function pause() {
    if (!isRunning.value || isPaused.value) return

    isPaused.value = true
    isRunning.value = false

    // 保存当前剩余时间
    remaining.value = Math.max(0, (targetEndTime - Date.now()) / 1000)

    // 停止定时器
    if (timerInterval !== null) {
      clearInterval(timerInterval)
      timerInterval = null
    }

    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }

  /**
   * 恢复计时
   */
  function resume() {
    if (!isPaused.value) return

    isPaused.value = false
    isRunning.value = true

    // 重新计算目标结束时间
    targetEndTime = Date.now() + remaining.value * 1000

    // 重新启动定时器
    timerInterval = setInterval(tick, TIMER_INTERVAL_MS)

    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  /**
   * 重置计时器
   */
  function reset() {
    stop()
    remaining.value = 0
    isPaused.value = false
    currentTaskId.value = null
    onComplete = null
  }

  /**
   * 设置剩余时间（不启动计时）
   */
  function setRemaining(seconds: number) {
    remaining.value = seconds
  }

  // ---- 内部方法 ----

  /**
   * 定时器 tick
   */
  function tick() {
    if (!isRunning.value) return

    const now = Date.now()
    const newRemaining = Math.max(0, (targetEndTime - now) / 1000)
    remaining.value = newRemaining

    // 检查是否完成
    if (newRemaining <= 0) {
      handleComplete()
    }
  }

  /**
   * 处理计时完成
   */
  function handleComplete() {
    stop()
    remaining.value = 0
    playSessionComplete()

    if (onComplete) {
      onComplete()
    }
  }

  /**
   * 停止计时器
   */
  function stop() {
    if (timerInterval !== null) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    isRunning.value = false
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }

  /**
   * 页面可见性变化处理
   * 当页面从后台恢复时，补偿浏览器节流导致的时间差
   */
  function handleVisibilityChange() {
    if (!document.hidden && isRunning.value) {
      // 页面重新可见，立即更新剩余时间
      const now = Date.now()
      const newRemaining = Math.max(0, (targetEndTime - now) / 1000)
      remaining.value = newRemaining

      if (newRemaining <= 0) {
        handleComplete()
      }
    }
  }

  // ---- 清理 ----
  onUnmounted(() => {
    stop()
  })

  return {
    // 状态
    remaining,
    isRunning,
    isPaused,
    sessionType,
    currentTaskId,
    // 计算属性
    formattedRemaining,
    remainingSeconds,
    isCompleted,
    // 方法
    start,
    pause,
    resume,
    reset,
    setRemaining,
  }
}
