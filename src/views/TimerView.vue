<script setup lang="ts">
// ============================================================
// PomodoroX - 计时器视图（主视图）
// 沉浸式番茄钟计时器，大气背景 + 环形进度 + 呼吸动画
// ============================================================

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTimerStore } from '@/stores/timer'
import { useTaskStore } from '@/stores/task'
import { useSettingsStore } from '@/stores/settings'
import { useNotification } from '@/composables/useNotification'
import { playFocusStart, playBreakStart, playSessionComplete, playSuccess } from '@/composables/useAudio'
import { TIMER_MODES } from '@/utils/constants'
import { formatMinutes, getWeekdayName, formatDate } from '@/utils/format'
import type { Task } from '@/types'

// ---- Stores ----
const timerStore = useTimerStore()
const taskStore = useTaskStore()
const settingsStore = useSettingsStore()

// ---- Composables ----
const { sendNotification, requestPermission } = useNotification()

// ---- 本地状态 ----
const showTaskSelector = ref(false)
const showCelebration = ref(false)
const celebrationParticles = ref<Array<{ id: number; x: number; y: number; size: number; delay: number; color: string }>>([])

// ---- 计算属性 ----

/** 当前任务 */
const currentTask = computed<Task | undefined>(() => {
  if (!timerStore.currentTaskId) return undefined
  return taskStore.getTaskById(timerStore.currentTaskId)
})

/** 当前任务名称 */
const currentTaskName = computed(() => currentTask.value?.title || '未选择任务')

/** 会话类型配置 */
const sessionConfig = computed(() => TIMER_MODES[timerStore.sessionType])

/** 会话类型中文标签 */
const sessionLabel = computed(() => sessionConfig.value.labelZh)

/** 会话类型颜色 */
const sessionColor = computed(() => sessionConfig.value.color)

/** 格式化剩余时间 */
const displayTime = computed(() => timerStore.formattedRemaining)

/** 进度百分比 0~100 */
const progressPercent = computed(() => timerStore.progress)

/** SVG 环形进度参数 */
const RING_RADIUS = 140
const RING_STROKE = 6
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
const ringDashoffset = computed(() => {
  const offset = RING_CIRCUMFERENCE - (progressPercent.value / 100) * RING_CIRCUMFERENCE
  return offset
})

/** 是否正在计时 */
const isActive = computed(() => timerStore.isRunning && !timerStore.isPaused)

/** 是否暂停 */
const isPausedState = computed(() => timerStore.isPaused)

/** 是否空闲（未开始/已重置） */
const isIdle = computed(() => !timerStore.isRunning && !timerStore.isPaused)

/** 今日日期 */
const todayDisplay = computed(() => {
  const now = new Date()
  return `${getWeekdayName(now)} ${formatDate(now)}`
})

/** 今日专注总时长（秒） */
const todayFocusSeconds = computed(() => {
  return timerStore.todaySessions
    .filter((s) => s.type === 'work' && s.completed)
    .reduce((sum, s) => sum + s.duration, 0)
})

/** 今日专注总时长（格式化） */
const todayFocusDisplay = computed(() => formatMinutes(Math.round(todayFocusSeconds.value / 60)))

/** 已完成番茄钟数 */
const completedCount = computed(() => timerStore.completedPomodoros)

/** 连续番茄钟计数 */
const streakCount = computed(() => timerStore.pomodoroStreak)

/** 长休息间隔 */
const longBreakInterval = computed(() => settingsStore.settings.longBreakInterval)

/** 可选任务列表（活跃任务） */
const selectableTasks = computed(() => taskStore.activeTasks)

/** 背景渐变样式 - 根据会话类型变化 */
const backgroundStyle = computed(() => {
  const type = timerStore.sessionType
  if (type === 'work') {
    return {
      background: `
        radial-gradient(ellipse at 20% 50%, rgba(88, 166, 255, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(136, 100, 255, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(88, 166, 255, 0.04) 0%, transparent 50%),
        var(--bg)
      `,
    }
  } else if (type === 'short_break') {
    return {
      background: `
        radial-gradient(ellipse at 30% 40%, rgba(63, 185, 80, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 60%, rgba(56, 211, 159, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 90%, rgba(63, 185, 80, 0.04) 0%, transparent 50%),
        var(--bg)
      `,
    }
  } else if (type === 'long_break') {
    return {
      background: `
        radial-gradient(ellipse at 25% 50%, rgba(240, 136, 62, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 75% 30%, rgba(255, 183, 77, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(240, 136, 62, 0.04) 0%, transparent 50%),
        var(--bg)
      `,
    }
  }
  return { background: 'var(--bg)' }
})

/** 进度环颜色 */
const ringColor = computed(() => sessionColor.value)

/** 进度环发光效果 */
const ringGlow = computed(() => {
  const color = sessionColor.value
  return `0 0 20px ${color}40, 0 0 40px ${color}20, 0 0 60px ${color}10`
})

// ---- 方法 ----

/** 开始/暂停切换 */
function toggleTimer() {
  if (timerStore.isRunning && !timerStore.isPaused) {
    // 暂停
    timerStore.pause()
  } else if (timerStore.isPaused) {
    // 恢复
    timerStore.resume()
  } else {
    // 开始
    timerStore.start()
    // 播放音效
    if (timerStore.isWorkSession) {
      playFocusStart()
    } else {
      playBreakStart()
    }
  }
}

/** 重置计时器 */
function resetTimer() {
  timerStore.reset()
}

/** 跳过当前会话 */
function skipSession() {
  timerStore.skip()
}

/** 选择任务 */
function selectTask(taskId: string | null) {
  timerStore.currentTaskId = taskId
  showTaskSelector.value = false
}

/** 切换任务选择器 */
function toggleTaskSelector() {
  showTaskSelector.value = !showTaskSelector.value
}

/** 触发庆祝动画 */
function triggerCelebration() {
  showCelebration.value = true
  // 生成粒子
  const colors = ['#58A6FF', '#3FB950', '#A371F7', '#F0883E', '#F85149', '#FFD700']
  celebrationParticles.value = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: (Math.random() - 0.5) * 300,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 0.5,
    color: colors[Math.floor(Math.random() * colors.length)],
  }))

  // 3秒后清除
  setTimeout(() => {
    showCelebration.value = false
    celebrationParticles.value = []
  }, 3000)
}

/** 处理会话完成 */
async function handleSessionComplete() {
  playSessionComplete()
  playSuccess()
  triggerCelebration()

  // 发送通知
  const title = timerStore.isWorkSession ? '番茄钟完成!' : '休息结束!'
  const body = timerStore.isWorkSession
    ? `太棒了！你完成了一个番茄钟 ${currentTask.value ? `- ${currentTask.value.title}` : ''}`
    : '休息结束，准备开始下一个番茄钟吧！'

  await sendNotification(title, body, {
    tag: 'pomodorox-timer',
    onClick: () => {
      window.focus()
    },
  })
}

/** 点击计时器中心 */
function onTimerCenterClick() {
  toggleTimer()
}

// ---- 监听器 ----

// 监听计时器完成
watch(
  () => timerStore.remaining,
  (newVal) => {
    if (newVal <= 0 && timerStore.todaySessions.length > 0) {
      const latestSession = timerStore.todaySessions[0]
      if (latestSession.completed) {
        handleSessionComplete()
      }
    }
  }
)

// 监听会话类型变化 - 更新页面标题
watch(
  () => timerStore.sessionType,
  (type) => {
    const label = TIMER_MODES[type]?.labelZh || '计时器'
    document.title = `${label} - PomodoroX`
  }
)

// 键盘快捷键 - Space 开始/暂停
function handleKeyDown(e: KeyboardEvent) {
  const target = e.target as HTMLElement
  const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
  if (isInput) return

  if (e.code === 'Space' && !e.ctrlKey && !e.metaKey) {
    e.preventDefault()
    toggleTimer()
  }
}

// 点击外部关闭任务选择器
function handleDocumentClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (showTaskSelector.value && !target.closest('.task-selector-container')) {
    showTaskSelector.value = false
  }
}

// ---- 生命周期 ----
onMounted(async () => {
  // 加载今日数据
  await timerStore.loadTodaySessions()
  await taskStore.loadTasks()

  // 如果计时器未初始化（remaining 为 0），设置默认时长
  if (timerStore.remaining <= 0 && !timerStore.isRunning) {
    timerStore.remaining = timerStore.getTotalDuration()
  }

  // 请求通知权限
  await requestPermission()

  // 注册键盘事件
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<template>
  <div
    class="timer-view"
    :style="backgroundStyle"
  >
    <!-- 动态背景层 -->
    <div class="timer-bg-layer" :class="`session-${timerStore.sessionType}`">
      <div class="bg-orb bg-orb-1" />
      <div class="bg-orb bg-orb-2" />
      <div class="bg-orb bg-orb-3" />
    </div>

    <!-- 庆祝粒子 -->
    <Transition name="celebration">
      <div v-if="showCelebration" class="celebration-overlay">
        <div
          v-for="p in celebrationParticles"
          :key="p.id"
          class="celebration-particle"
          :style="{
            transform: `translate(${p.x}px, ${p.y}px)`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            backgroundColor: p.color,
          }"
        />
      </div>
    </Transition>

    <!-- 主内容 -->
    <div class="timer-content">
      <!-- 顶部栏 -->
      <header class="timer-header">
        <div class="header-left">
          <div class="task-selector-container">
            <button
              class="current-task-btn"
              @click.stop="toggleTaskSelector"
            >
              <span class="task-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3h10v1H3V3zm0 4h7v1H3V7zm0 4h10v1H3v-1z" fill="currentColor" opacity="0.7"/>
                </svg>
              </span>
              <span class="task-name">{{ currentTaskName }}</span>
              <svg class="chevron-icon" :class="{ open: showTaskSelector }" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <!-- 任务下拉选择 -->
            <Transition name="dropdown">
              <div v-if="showTaskSelector" class="task-dropdown" @click.stop>
                <div class="dropdown-header">选择任务</div>
                <button
                  class="dropdown-item"
                  :class="{ active: timerStore.currentTaskId === null }"
                  @click="selectTask(null)"
                >
                  <span class="item-indicator" />
                  <span>无任务</span>
                </button>
                <div class="dropdown-divider" />
                <button
                  v-for="task in selectableTasks"
                  :key="task.id"
                  class="dropdown-item"
                  :class="{ active: timerStore.currentTaskId === task.id }"
                  @click="selectTask(task.id)"
                >
                  <span
                    class="item-indicator"
                    :style="{ backgroundColor: task.status === 'in_progress' ? '#58A6FF' : 'transparent' }"
                  />
                  <span class="item-title">{{ task.title }}</span>
                  <span class="item-meta">
                    {{ task.actualPomodoros }}/{{ task.estimatedPomodoros }}
                  </span>
                </button>
                <div v-if="selectableTasks.length === 0" class="dropdown-empty">
                  暂无任务，去添加一个吧
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <div class="header-right">
          <span class="date-display">{{ todayDisplay }}</span>
        </div>
      </header>

      <!-- 中央计时器 -->
      <div class="timer-center">
        <!-- 会话类型标签 -->
        <div class="session-label-wrapper">
          <span
            class="session-label"
            :style="{ color: sessionColor }"
          >
            {{ sessionLabel }}
          </span>
        </div>

        <!-- 环形进度 + 时间显示 -->
        <div
          class="timer-ring-container"
          :class="{
            breathing: isActive,
            paused: isPausedState,
          }"
          @click="onTimerCenterClick"
        >
          <!-- SVG 环形进度 -->
          <svg
            class="timer-ring-svg"
            :width="RING_RADIUS * 2 + RING_STROKE * 2 + 40"
            :height="RING_RADIUS * 2 + RING_STROKE * 2 + 40"
            viewBox="0 0 340 340"
          >
            <!-- 背景环 -->
            <circle
              cx="170"
              cy="170"
              :r="RING_RADIUS"
              fill="none"
              :stroke="sessionColor"
              stroke-opacity="0.08"
              :stroke-width="RING_STROKE"
            />

            <!-- 进度环 -->
            <circle
              cx="170"
              cy="170"
              :r="RING_RADIUS"
              fill="none"
              :stroke="ringColor"
              :stroke-width="RING_STROKE"
              stroke-linecap="round"
              :stroke-dasharray="RING_CIRCUMFERENCE"
              :stroke-dashoffset="ringDashoffset"
              class="progress-ring"
              :style="{ filter: isActive ? ringGlow : 'none' }"
              transform="rotate(-90 170 170)"
            />

            <!-- 刻度点（12个） -->
            <g v-for="i in 12" :key="'tick-' + i">
              <circle
                :cx="170 + (RING_RADIUS + 16) * Math.cos(((i - 1) * 30 - 90) * Math.PI / 180)"
                :cy="170 + (RING_RADIUS + 16) * Math.sin(((i - 1) * 30 - 90) * Math.PI / 180)"
                r="1.5"
                :fill="sessionColor"
                :fill-opacity="i % 3 === 0 ? 0.4 : 0.15"
              />
            </g>
          </svg>

          <!-- 中心内容 -->
          <div class="timer-center-content">
            <div class="timer-digits" :style="{ color: sessionColor }">
              {{ displayTime }}
            </div>
            <div v-if="isPausedState" class="timer-status-badge paused-badge">
              已暂停
            </div>
            <div v-else-if="isIdle" class="timer-status-hint">
              按空格键开始
            </div>
          </div>
        </div>

        <!-- 番茄钟计数指示器 -->
        <div class="pomodoro-indicators">
          <template v-for="i in longBreakInterval" :key="'pomo-' + i">
            <span
              class="pomodoro-dot"
              :class="{
                filled: i <= streakCount,
                current: i === streakCount + 1 && timerStore.isWorkSession,
              }"
              :style="{
                backgroundColor: i <= streakCount ? sessionColor : undefined,
                borderColor: i <= streakCount ? sessionColor : undefined,
              }"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity="0.3"/>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" opacity="0.7"/>
              </svg>
            </span>
          </template>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="timer-controls">
        <!-- 重置按钮 -->
        <button
          class="control-btn secondary-btn"
          :disabled="isIdle"
          title="重置 (Ctrl+R)"
          @click="resetTimer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
        </button>

        <!-- 开始/暂停 主按钮 -->
        <button
          class="control-btn primary-btn"
          :style="{
            '--btn-color': sessionColor,
            '--btn-glow': `${sessionColor}40`,
          }"
          @click="toggleTimer"
        >
          <!-- 暂停图标 -->
          <svg v-if="isActive" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1"/>
            <rect x="14" y="4" width="4" height="16" rx="1"/>
          </svg>
          <!-- 播放图标 -->
          <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>

        <!-- 跳过按钮 -->
        <button
          class="control-btn secondary-btn"
          :disabled="isIdle"
          title="跳过当前会话"
          @click="skipSession"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" stroke="none"/>
            <line x1="19" y1="5" x2="19" y2="19"/>
          </svg>
        </button>
      </div>

      <!-- 底部统计 -->
      <footer class="timer-footer">
        <div class="stat-item">
          <div class="stat-value" :style="{ color: sessionColor }">{{ completedCount }}</div>
          <div class="stat-label">今日番茄</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-value">{{ todayFocusDisplay }}</div>
          <div class="stat-label">专注时长</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-value">{{ streakCount }}/{{ longBreakInterval }}</div>
          <div class="stat-label">连续进度</div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================
   TimerView - 沉浸式计时器视图
   ============================================================ */

/* ---- 主容器 ---- */
.timer-view {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background 1.5s ease;
}

/* ---- 动态背景层 ---- */
.timer-bg-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  transition: background 2s ease, opacity 2s ease;
}

/* 工作模式 - 蓝紫色调 */
.session-work .bg-orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(88, 166, 255, 0.12) 0%, transparent 70%);
  top: -10%;
  left: -5%;
  animation: orb-float-1 20s ease-in-out infinite;
}

.session-work .bg-orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(136, 100, 255, 0.1) 0%, transparent 70%);
  bottom: -5%;
  right: -5%;
  animation: orb-float-2 25s ease-in-out infinite;
}

.session-work .bg-orb-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(88, 166, 255, 0.06) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: orb-float-3 18s ease-in-out infinite;
}

/* 短休息 - 青绿色调 */
.session-short_break .bg-orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(63, 185, 80, 0.12) 0%, transparent 70%);
  top: -10%;
  left: -5%;
  animation: orb-float-1 22s ease-in-out infinite;
}

.session-short_break .bg-orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(56, 211, 159, 0.1) 0%, transparent 70%);
  bottom: -5%;
  right: -5%;
  animation: orb-float-2 20s ease-in-out infinite;
}

.session-short_break .bg-orb-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(63, 185, 80, 0.06) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: orb-float-3 16s ease-in-out infinite;
}

/* 长休息 - 暖琥珀色调 */
.session-long_break .bg-orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(240, 136, 62, 0.12) 0%, transparent 70%);
  top: -10%;
  left: -5%;
  animation: orb-float-1 24s ease-in-out infinite;
}

.session-long_break .bg-orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 183, 77, 0.1) 0%, transparent 70%);
  bottom: -5%;
  right: -5%;
  animation: orb-float-2 22s ease-in-out infinite;
}

.session-long_break .bg-orb-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(240, 136, 62, 0.06) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: orb-float-3 20s ease-in-out infinite;
}

/* 自由计时 - 橙色调 */
.session-free .bg-orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(240, 136, 62, 0.12) 0%, transparent 70%);
  top: -10%;
  left: -5%;
  animation: orb-float-1 20s ease-in-out infinite;
}

.session-free .bg-orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(248, 81, 73, 0.08) 0%, transparent 70%);
  bottom: -5%;
  right: -5%;
  animation: orb-float-2 25s ease-in-out infinite;
}

.session-free .bg-orb-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(240, 136, 62, 0.06) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: orb-float-3 18s ease-in-out infinite;
}

@keyframes orb-float-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

@keyframes orb-float-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-30px, 40px) scale(1.05); }
  66% { transform: translate(30px, -20px) scale(0.9); }
}

@keyframes orb-float-3 {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
}

/* ---- 主内容 ---- */
.timer-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 24px 32px;
  gap: 0;
}

/* ---- 顶部栏 ---- */
.timer-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.date-display {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  letter-spacing: 0.02em;
}

/* ---- 任务选择器 ---- */
.task-selector-container {
  position: relative;
}

.current-task-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  max-width: 280px;
}

.current-task-btn:hover {
  border-color: var(--accent);
  color: var(--text);
  background: var(--hover-bg);
}

.task-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  opacity: 0.6;
}

.task-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron-icon {
  flex-shrink: 0;
  opacity: 0.5;
  transition: transform 0.3s ease;
}

.chevron-icon.open {
  transform: rotate(180deg);
}

/* 任务下拉菜单 */
.task-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 300px;
  max-width: 400px;
  max-height: 360px;
  overflow-y: auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  z-index: 100;
  padding: 6px;
}

.dropdown-header {
  padding: 10px 12px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
  text-align: left;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: var(--hover-bg);
  color: var(--text);
}

.dropdown-item.active {
  background: var(--active-bg);
  color: var(--accent);
}

.item-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1.5px solid var(--text-tertiary);
  transition: all 0.2s ease;
}

.item-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.dropdown-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 8px;
}

.dropdown-empty {
  padding: 20px 12px;
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

/* ---- 中央计时器区域 ---- */
.timer-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  flex: 1;
  justify-content: center;
}

/* 会话类型标签 */
.session-label-wrapper {
  margin-bottom: 8px;
}

.session-label {
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: color 0.5s ease;
  opacity: 0.8;
}

/* ---- 环形进度容器 ---- */
.timer-ring-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

.timer-ring-container:hover {
  transform: scale(1.01);
}

.timer-ring-container:active {
  transform: scale(0.99);
}

/* 呼吸动画 - 运行中 */
.timer-ring-container.breathing {
  animation: timer-breathe 4s ease-in-out infinite;
}

@keyframes timer-breathe {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.015);
  }
}

/* 暂停状态 - 微弱闪烁 */
.timer-ring-container.paused {
  animation: timer-paused-pulse 2s ease-in-out infinite;
}

@keyframes timer-paused-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.85;
  }
}

/* SVG 进度环 */
.timer-ring-svg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.progress-ring {
  transition: stroke-dashoffset 0.5s ease, stroke 0.5s ease;
  filter: none;
  transition: stroke-dashoffset 0.3s linear, stroke 0.5s ease, filter 0.5s ease;
}

/* 中心内容 */
.timer-center-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 260px;
  height: 260px;
  justify-content: center;
}

.timer-digits {
  font-size: 4.5rem;
  font-weight: 200;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  transition: color 0.5s ease;
  user-select: none;
}

.timer-status-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.05em;
}

.paused-badge {
  color: var(--text-secondary);
  background: var(--hover-bg);
  border: 1px solid var(--border);
  animation: badge-pulse 2s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.timer-status-hint {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  letter-spacing: 0.03em;
}

/* ---- 番茄钟计数指示器 ---- */
.pomodoro-indicators {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.pomodoro-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--border);
  background: transparent;
  color: var(--text-tertiary);
  transition: all 0.4s ease;
  opacity: 0.4;
}

.pomodoro-dot.filled {
  opacity: 1;
  border-color: transparent;
  color: white;
  box-shadow: 0 0 8px var(--btn-color, rgba(88, 166, 255, 0.3));
}

.pomodoro-dot.current {
  opacity: 0.7;
  border-style: dashed;
}

/* ---- 控制按钮 ---- */
.timer-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 12px;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

.secondary-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--surface);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.secondary-btn:hover:not(:disabled) {
  background: var(--hover-bg);
  color: var(--text);
  border-color: var(--text-tertiary);
  transform: scale(1.05);
}

.secondary-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.secondary-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.primary-btn {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--btn-color, var(--accent));
  color: white;
  box-shadow:
    0 4px 16px var(--btn-glow, rgba(88, 166, 255, 0.25)),
    0 0 0 0 var(--btn-glow, rgba(88, 166, 255, 0.25));
  transition: all 0.3s ease;
}

.primary-btn:hover {
  transform: scale(1.08);
  box-shadow:
    0 6px 24px var(--btn-glow, rgba(88, 166, 255, 0.35)),
    0 0 0 4px var(--btn-glow, rgba(88, 166, 255, 0.1));
}

.primary-btn:active {
  transform: scale(0.95);
  box-shadow:
    0 2px 8px var(--btn-glow, rgba(88, 166, 255, 0.2)),
    0 0 0 0 var(--btn-glow, rgba(88, 166, 255, 0.2));
}

/* 运行中主按钮脉冲 */
.primary-btn:active {
  animation: none;
}

/* ---- 底部统计 ---- */
.timer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 24px 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--text);
  transition: color 0.5s ease;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  letter-spacing: 0.03em;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: var(--border);
}

/* ---- 庆祝动画 ---- */
.celebration-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.celebration-particle {
  position: absolute;
  border-radius: 50%;
  animation: particle-burst 1.5s ease-out forwards;
  opacity: 0;
}

@keyframes particle-burst {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
    transform: translate(var(--tx, 0), var(--ty, -100px)) scale(0);
  }
}

/* ---- 过渡动画 ---- */
.celebration-enter-active {
  transition: opacity 0.3s ease;
}

.celebration-leave-active {
  transition: opacity 0.5s ease;
}

.celebration-enter-from,
.celebration-leave-to {
  opacity: 0;
}

.dropdown-enter-active {
  transition: all 0.25s ease;
}

.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

/* ---- 响应式 ---- */
@media (max-width: 640px) {
  .timer-content {
    padding: 16px 20px;
  }

  .timer-header {
    padding: 16px 20px;
  }

  .current-task-btn {
    max-width: 180px;
    font-size: 0.8rem;
    padding: 6px 10px;
  }

  .task-dropdown {
    min-width: 260px;
    max-width: 300px;
  }

  .timer-digits {
    font-size: 3.5rem;
  }

  .timer-center-content {
    width: 200px;
    height: 200px;
  }

  .primary-btn {
    width: 64px;
    height: 64px;
  }

  .secondary-btn {
    width: 44px;
    height: 44px;
  }

  .timer-footer {
    gap: 20px;
    padding: 20px;
  }

  .stat-value {
    font-size: 1rem;
  }

  .pomodoro-indicators {
    gap: 8px;
  }

  .pomodoro-dot {
    width: 24px;
    height: 24px;
  }
}

@media (max-width: 380px) {
  .timer-digits {
    font-size: 2.8rem;
  }

  .timer-center-content {
    width: 160px;
    height: 160px;
  }
}
</style>
