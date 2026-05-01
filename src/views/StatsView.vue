<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useTaskStore } from '@/stores/task'
import { useReflectionStore } from '@/stores/reflection'
import { db } from '@/services/database'
import { exportDailyReport, exportWeeklyReport } from '@/services/export'
import type { Session, Mood } from '@/types'
import { MOODS } from '@/utils/constants'
import {
  formatDate,
  formatMinutes,
  formatFriendlyDate,
  getToday,
  getThisWeek,
  getThisMonth,
} from '@/utils/format'

// ---- Stores ----
const taskStore = useTaskStore()
const reflectionStore = useReflectionStore()

// ---- 状态 ----
type DateRangeType = 'today' | 'week' | 'month' | 'custom'
const dateRangeType = ref<DateRangeType>('week')
const customStartDate = ref('')
const customEndDate = ref('')
const allSessions = ref<Session[]>([])
const isExporting = ref(false)
const chartsReady = ref(false)

// ---- 日期范围计算 ----

/** 获取日期范围 */
const dateRange = computed((): [string, string] => {
  switch (dateRangeType.value) {
    case 'today': {
      const today = getToday()
      return [today, today]
    }
    case 'week':
      return getThisWeek()
    case 'month':
      return getThisMonth()
    case 'custom':
      if (customStartDate.value && customEndDate.value) {
        return [customStartDate.value, customEndDate.value]
      }
      return getThisWeek()
    default:
      return getThisWeek()
  }
})

/** 日期范围显示文本 */
const dateRangeText = computed(() => {
  const [start, end] = dateRange.value
  if (start === end) return formatFriendlyDate(start)
  return `${formatFriendlyDate(start)} ~ ${formatFriendlyDate(end)}`
})

/** 上一个周期的日期范围 */
const prevDateRange = computed((): [string, string] => {
  const [start, end] = dateRange.value
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1
  const prevEnd = new Date(startDate.getTime() - 86400000)
  const prevStart = new Date(prevEnd.getTime() - (diffDays - 1) * 86400000)
  return [formatDate(prevStart), formatDate(prevEnd)]
})

// ---- 筛选数据 ----

/** 当前周期的已完成工作会话 */
const currentWorkSessions = computed(() => {
  const [start, end] = dateRange.value
  return allSessions.value.filter(
    (s) =>
      s.type === 'work' &&
      s.completed &&
      s.startedAt >= start &&
      s.startedAt <= end + ' 23:59:59'
  )
})

/** 上一个周期的已完成工作会话 */
const prevWorkSessions = computed(() => {
  const [start, end] = prevDateRange.value
  return allSessions.value.filter(
    (s) =>
      s.type === 'work' &&
      s.completed &&
      s.startedAt >= start &&
      s.startedAt <= end + ' 23:59:59'
  )
})

// ---- 统计卡片 ----

/** 总番茄钟数 */
const totalPomodoros = computed(() => currentWorkSessions.value.length)

/** 上周期番茄钟数（趋势对比） */
const prevPomodoros = computed(() => prevWorkSessions.value.length)

/** 番茄钟趋势 */
const pomodoroTrend = computed(() => {
  const diff = totalPomodoros.value - prevPomodoros.value
  if (diff > 0) return { direction: 'up' as const, value: diff }
  if (diff < 0) return { direction: 'down' as const, value: Math.abs(diff) }
  return { direction: 'same' as const, value: 0 }
})

/** 总专注时间（分钟） */
const totalFocusMinutes = computed(() =>
  currentWorkSessions.value.reduce((sum, s) => sum + Math.round(s.duration / 60), 0)
)

/** 总专注时间（小时） */
const totalFocusHours = computed(() => (totalFocusMinutes.value / 60).toFixed(1))

/** 连续天数 */
const streakDays = computed(() => {
  const today = new Date()
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = formatDate(d)
    const hasSession = allSessions.value.some(
      (s) =>
        s.type === 'work' &&
        s.completed &&
        s.startedAt.startsWith(dateStr)
    )
    if (hasSession) {
      streak++
    } else if (i > 0) {
      // 允许今天还没有完成，但之前不能断
      break
    }
  }
  return streak
})

/** 任务完成率 */
const taskCompletionRate = computed(() => {
  const [start, end] = dateRange.value
  const relevantTasks = taskStore.tasks.filter(
    (t) => t.createdAt >= start && t.createdAt <= end + ' 23:59:59'
  )
  if (relevantTasks.length === 0) return 0
  const done = relevantTasks.filter((t) => t.status === 'done').length
  return Math.round((done / relevantTasks.length) * 100)
})

// ---- 图表数据 ----

/** 每日番茄钟数据（柱状图） */
const dailyPomodoroData = computed(() => {
  const [start, end] = dateRange.value
  const startDate = new Date(start)
  const endDate = new Date(end)
  const days: { date: string; label: string; count: number }[] = []

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = formatDate(d)
    const count = allSessions.value.filter(
      (s) =>
        s.type === 'work' &&
        s.completed &&
        s.startedAt.startsWith(dateStr)
    ).length
    days.push({
      date: dateStr,
      label: dateStr.slice(5), // MM-DD
      count,
    })
  }
  return days
})

/** 柱状图最大值 */
const barChartMax = computed(() => {
  const max = Math.max(...dailyPomodoroData.value.map((d) => d.count), 1)
  return Math.ceil(max * 1.2)
})

/** 按标签分布的时间（甜甜圈图） */
const tagTimeData = computed(() => {
  const tagMinutes = new Map<string, number>()
  currentWorkSessions.value.forEach((session) => {
    if (session.taskId) {
      const task = taskStore.tasks.find((t) => t.id === session.taskId)
      if (task && task.tags.length > 0) {
        const minutes = Math.round(session.duration / 60)
        task.tags.forEach((tag) => {
          tagMinutes.set(tag, (tagMinutes.get(tag) || 0) + minutes)
        })
      } else {
        tagMinutes.set('未标记', (tagMinutes.get('未标记') || 0) + Math.round(session.duration / 60))
      }
    } else {
      tagMinutes.set('未标记', (tagMinutes.get('未标记') || 0) + Math.round(session.duration / 60))
    }
  })

  const entries = Array.from(tagMinutes.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  const total = entries.reduce((sum, [, v]) => sum + v, 0)
  return entries.map(([tag, minutes]) => ({
    tag,
    minutes,
    percentage: total > 0 ? (minutes / total) * 100 : 0,
  }))
})

/** 甜甜圈图 SVG 参数 */
const donutSegments = computed(() => {
  const segments: { tag: string; color: string; offset: number; length: number }[] = []
  const colors = ['#58A6FF', '#3FB950', '#F0883E', '#A371F7', '#F85149', '#D29922', '#79C0FF', '#56D364']
  let cumulative = 0

  tagTimeData.value.forEach((item, i) => {
    segments.push({
      tag: item.tag,
      color: colors[i % colors.length],
      offset: cumulative,
      length: item.percentage,
    })
    cumulative += item.percentage
  })

  return segments
})

/** 心情趋势数据（折线图） */
const moodTrendData = computed(() => {
  const [start, end] = dateRange.value
  const startDate = new Date(start)
  const endDate = new Date(end)
  const moodMap: Record<Mood, number> = {
    great: 5,
    good: 4,
    normal: 3,
    bad: 2,
    terrible: 1,
  }

  const points: { date: string; label: string; mood: number; moodType: Mood | null }[] = []

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = formatDate(d)
    const reflection = reflectionStore.reflections.find((r) => r.date === dateStr)
    points.push({
      date: dateStr,
      label: dateStr.slice(5),
      mood: reflection ? moodMap[reflection.mood] : 0,
      moodType: reflection?.mood || null,
    })
  }
  return points
})

/** 折线图数据点 */
const moodLinePoints = computed(() => {
  const data = moodTrendData.value.filter((p) => p.mood > 0)
  if (data.length === 0) return []
  const width = 100
  const height = 80
  const padding = 5
  const usableWidth = width - padding * 2
  const usableHeight = height - padding * 2

  return data.map((p, i) => ({
    x: padding + (i / (data.length - 1)) * usableWidth,
    y: padding + usableHeight - ((p.mood - 1) / 4) * usableHeight,
    date: p.date,
    mood: p.mood,
    moodType: p.moodType,
  }))
})

/** 最佳专注时段数据（水平柱状图） */
const bestFocusHours = computed(() => {
  const hourCounts = new Map<number, number>()
  currentWorkSessions.value.forEach((session) => {
    const hour = new Date(session.startedAt).getHours()
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
  })

  return Array.from(hourCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([hour, count]) => ({
      hour,
      label: `${hour.toString().padStart(2, '0')}:00`,
      count,
    }))
    .sort((a, b) => a.hour - b.hour)
})

/** 最佳专注时段最大值 */
const focusHourMax = computed(() => {
  const max = Math.max(...bestFocusHours.value.map((h) => h.count), 1)
  return Math.ceil(max * 1.2)
})

// ---- 最近会话 ----

/** 最近完成的会话 */
const recentSessions = computed(() => {
  return allSessions.value
    .filter((s) => s.completed)
    .slice(0, 15)
    .map((s) => {
      const task = s.taskId ? taskStore.tasks.find((t) => t.id === s.taskId) : null
      return {
        ...s,
        taskTitle: task?.title || '自由专注',
      }
    })
})

// ---- 方法 ----

/** 切换日期范围 */
function setDateRange(type: DateRangeType) {
  dateRangeType.value = type
}

/** 导出报告 */
async function exportReport() {
  isExporting.value = true
  try {
    const [start, end] = dateRange.value
    const tasksInRange = taskStore.tasks.filter(
      (t) => t.createdAt >= start && t.createdAt <= end + ' 23:59:59'
    )
    const reflectionsInRange = reflectionStore.reflections.filter(
      (r) => r.date >= start && r.date <= end
    )
    const sessionsInRange = currentWorkSessions.value

    let markdown: string
    if (start === end) {
      markdown = exportDailyReport(start, tasksInRange, reflectionsInRange, sessionsInRange)
    } else {
      markdown = exportWeeklyReport(start, end, tasksInRange, reflectionsInRange, sessionsInRange)
    }

    // 下载文件
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pomodorox-report-${start}${start !== end ? `-${end}` : ''}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('导出报告失败:', err)
  } finally {
    isExporting.value = false
  }
}

/** 获取心情 emoji */
function getMoodEmoji(mood: Mood | null): string {
  if (!mood) return '-'
  return MOODS.find((m) => m.value === mood)?.emoji || '-'
}

/** 获取心情颜色 */
function getMoodColor(mood: Mood | null): string {
  const colorMap: Record<string, string> = {
    great: '#3FB950',
    good: '#58A6FF',
    normal: '#D29922',
    bad: '#F0883E',
    terrible: '#F85149',
  }
  return mood ? colorMap[mood] || '#8B949E' : '#8B949E'
}

/** 触发图表动画 */
function triggerChartAnimation() {
  chartsReady.value = false
  nextTick(() => {
    requestAnimationFrame(() => {
      chartsReady.value = true
    })
  })
}

// ---- 初始化 ----
onMounted(async () => {
  await Promise.all([
    taskStore.loadTasks(),
    reflectionStore.loadReflections(),
  ])
  allSessions.value = await db.getAllSessions()
  triggerChartAnimation()
})
</script>

<template>
  <div class="stats-view">
    <!-- 顶部栏 -->
    <header class="stats-header">
      <div class="header-left">
        <h1 class="page-title">数据统计</h1>
      </div>

      <div class="header-center">
        <div class="date-range-selector">
          <button
            v-for="option in [
              { type: 'today' as DateRangeType, label: '今天' },
              { type: 'week' as DateRangeType, label: '本周' },
              { type: 'month' as DateRangeType, label: '本月' },
              { type: 'custom' as DateRangeType, label: '自定义' },
            ]"
            :key="option.type"
            class="range-btn"
            :class="{ active: dateRangeType === option.type }"
            @click="setDateRange(option.type)"
          >
            {{ option.label }}
          </button>
        </div>

        <div v-if="dateRangeType === 'custom'" class="custom-range">
          <input type="date" v-model="customStartDate" class="date-input" />
          <span class="range-separator">~</span>
          <input type="date" v-model="customEndDate" class="date-input" />
        </div>
      </div>

      <div class="header-right">
        <span class="range-text">{{ dateRangeText }}</span>
      </div>
    </header>

    <!-- 主内容 -->
    <div class="stats-body">
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <!-- 总番茄钟 -->
        <div class="stat-card">
          <div class="stat-card-icon" style="background: rgba(88, 166, 255, 0.15); color: #58A6FF;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="stat-card-content">
            <span class="stat-value">{{ totalPomodoros }}</span>
            <span class="stat-label">总番茄钟</span>
          </div>
          <div class="stat-trend" :class="pomodoroTrend.direction">
            <svg v-if="pomodoroTrend.direction === 'up'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
            <svg v-else-if="pomodoroTrend.direction === 'down'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
            <span v-if="pomodoroTrend.direction !== 'same'">{{ pomodoroTrend.value }}</span>
          </div>
        </div>

        <!-- 总专注时间 -->
        <div class="stat-card">
          <div class="stat-card-icon" style="background: rgba(163, 113, 247, 0.15); color: #A371F7;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div class="stat-card-content">
            <span class="stat-value">{{ totalFocusHours }}h</span>
            <span class="stat-label">专注时长</span>
          </div>
        </div>

        <!-- 连续天数 -->
        <div class="stat-card">
          <div class="stat-card-icon" style="background: rgba(63, 185, 80, 0.15); color: #3FB950;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </div>
          <div class="stat-card-content">
            <span class="stat-value">{{ streakDays }}</span>
            <span class="stat-label">连续天数</span>
          </div>
        </div>

        <!-- 任务完成率 -->
        <div class="stat-card">
          <div class="stat-card-icon" style="background: rgba(240, 136, 62, 0.15); color: #F0883E;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="stat-card-content">
            <span class="stat-value">{{ taskCompletionRate }}%</span>
            <span class="stat-label">完成率</span>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-grid">
        <!-- 番茄钟趋势（柱状图） -->
        <div class="chart-card">
          <h3 class="chart-title">番茄钟趋势</h3>
          <div class="chart-body bar-chart">
            <div v-if="dailyPomodoroData.length === 0" class="chart-empty">暂无数据</div>
            <template v-else>
              <div class="bar-chart-area">
                <div class="bar-chart-y-axis">
                  <span v-for="i in 5" :key="i" class="y-label">
                    {{ Math.round((barChartMax / 5) * (5 - i + 1)) }}
                  </span>
                </div>
                <div class="bar-chart-bars">
                  <div
                    v-for="day in dailyPomodoroData"
                    :key="day.date"
                    class="bar-group"
                  >
                    <div class="bar-wrapper">
                      <div
                        class="bar-fill"
                        :class="{ animated: chartsReady }"
                        :style="{
                          height: barChartMax > 0 ? `${(day.count / barChartMax) * 100}%` : '0%',
                        }"
                        :title="`${day.label}: ${day.count} 个番茄钟`"
                      />
                    </div>
                    <span class="bar-label">{{ day.label }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- 时间分布（甜甜圈图） -->
        <div class="chart-card">
          <h3 class="chart-title">时间分布</h3>
          <div class="chart-body donut-chart">
            <div v-if="tagTimeData.length === 0" class="chart-empty">暂无数据</div>
            <template v-else>
              <div class="donut-container">
                <svg viewBox="0 0 100 100" class="donut-svg">
                  <!-- 背景圆 -->
                  <circle
                    cx="50" cy="50" r="35"
                    fill="none"
                    stroke="var(--border)"
                    stroke-width="12"
                  />
                  <!-- 数据段 -->
                  <circle
                    v-for="(seg, i) in donutSegments"
                    :key="i"
                    cx="50" cy="50" r="35"
                    fill="none"
                    :stroke="seg.color"
                    stroke-width="12"
                    :stroke-dasharray="`${seg.length * 2.199} ${219.9 - seg.length * 2.199}`"
                    :stroke-dashoffset="`${-(seg.offset * 2.199) + 54.975}`"
                    stroke-linecap="butt"
                    class="donut-segment"
                    :class="{ animated: chartsReady }"
                  />
                </svg>
                <div class="donut-center">
                  <span class="donut-total">{{ formatMinutes(totalFocusMinutes) }}</span>
                  <span class="donut-label">总专注</span>
                </div>
              </div>
              <div class="donut-legend">
                <div
                  v-for="item in tagTimeData"
                  :key="item.tag"
                  class="legend-item"
                >
                  <span class="legend-dot" :style="{ background: donutSegments.find(s => s.tag === item.tag)?.color }" />
                  <span class="legend-label">{{ item.tag }}</span>
                  <span class="legend-value">{{ item.percentage.toFixed(0) }}%</span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- 心情趋势（折线图） -->
        <div class="chart-card">
          <h3 class="chart-title">心情趋势</h3>
          <div class="chart-body line-chart">
            <div v-if="moodLinePoints.length < 2" class="chart-empty">需要至少2天的反思数据</div>
            <template v-else>
              <div class="line-chart-area">
                <div class="line-chart-y-axis">
                  <span v-for="m in MOODS.slice().reverse()" :key="m.value" class="y-label-mood">
                    {{ m.emoji }}
                  </span>
                </div>
                <svg viewBox="0 0 100 80" class="line-chart-svg" preserveAspectRatio="none">
                  <!-- 网格线 -->
                  <line v-for="i in 5" :key="i"
                    :x1="5" :y1="5 + (i - 1) * 17.5"
                    :x2="95" :y2="5 + (i - 1) * 17.5"
                    stroke="var(--border)" stroke-width="0.3" stroke-dasharray="2 2"
                  />
                  <!-- 折线 -->
                  <polyline
                    :points="moodLinePoints.map(p => `${p.x},${p.y}`).join(' ')"
                    fill="none"
                    stroke="var(--accent)"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="mood-line"
                    :class="{ animated: chartsReady }"
                  />
                  <!-- 数据点 -->
                  <circle
                    v-for="(p, i) in moodLinePoints"
                    :key="i"
                    :cx="p.x" :cy="p.y" r="2"
                    :fill="getMoodColor(p.moodType)"
                    stroke="var(--surface)"
                    stroke-width="1"
                  >
                    <title>{{ p.date }}: {{ getMoodEmoji(p.moodType) }}</title>
                  </circle>
                </svg>
              </div>
            </template>
          </div>
        </div>

        <!-- 最佳专注时段（水平柱状图） -->
        <div class="chart-card">
          <h3 class="chart-title">最佳专注时段</h3>
          <div class="chart-body h-bar-chart">
            <div v-if="bestFocusHours.length === 0" class="chart-empty">暂无数据</div>
            <template v-else>
              <div class="h-bar-list">
                <div
                  v-for="item in bestFocusHours"
                  :key="item.hour"
                  class="h-bar-row"
                >
                  <span class="h-bar-label">{{ item.label }}</span>
                  <div class="h-bar-track">
                    <div
                      class="h-bar-fill"
                      :class="{ animated: chartsReady }"
                      :style="{
                        width: focusHourMax > 0 ? `${(item.count / focusHourMax) * 100}%` : '0%',
                      }"
                    />
                  </div>
                  <span class="h-bar-value">{{ item.count }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 底部区域 -->
      <div class="bottom-section">
        <!-- 最近会话 -->
        <div class="recent-sessions">
          <h3 class="section-title">最近会话</h3>
          <div class="sessions-list">
            <div v-if="recentSessions.length === 0" class="chart-empty">暂无会话记录</div>
            <div
              v-for="session in recentSessions"
              :key="session.id"
              class="session-item"
            >
              <div class="session-icon" :class="session.type">
                <svg v-if="session.type === 'work'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <div class="session-info">
                <span class="session-task">{{ session.taskTitle }}</span>
                <span class="session-time">{{ session.startedAt }}</span>
              </div>
              <span class="session-duration">{{ formatMinutes(Math.round(session.duration / 60)) }}</span>
            </div>
          </div>
        </div>

        <!-- 导出 -->
        <div class="export-section">
          <button
            class="btn-export"
            :disabled="isExporting"
            @click="exportReport"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>{{ isExporting ? '导出中...' : '导出报告' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ---- 顶部栏 ---- */
.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  flex-shrink: 0;
  gap: 16px;
}

.page-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text);
}

.header-center {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-range-selector {
  display: flex;
  gap: 4px;
  background: var(--bg);
  border-radius: 8px;
  padding: 3px;
}

.range-btn {
  padding: 6px 14px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.range-btn:hover {
  color: var(--text);
}

.range-btn.active {
  background: var(--accent);
  color: #fff;
}

.custom-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-input {
  padding: 6px 10px;
  font-size: 0.8rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
}

.range-separator {
  color: var(--text-tertiary);
  font-size: 0.8rem;
}

.range-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* ---- 主内容 ---- */
.stats-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ---- 统计卡片 ---- */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  flex-shrink: 0;
}

.stat-card-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.stat-trend.up {
  color: #3FB950;
  background: rgba(63, 185, 80, 0.12);
}

.stat-trend.down {
  color: #F85149;
  background: rgba(248, 81, 73, 0.12);
}

.stat-trend.same {
  color: var(--text-tertiary);
  background: var(--hover-bg);
}

/* ---- 图表网格 ---- */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.chart-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.chart-title {
  padding: 14px 18px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  border-bottom: 1px solid var(--border);
}

.chart-body {
  padding: 18px;
  min-height: 200px;
}

.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 160px;
  color: var(--text-tertiary);
  font-size: 0.85rem;
}

/* ---- 柱状图 ---- */
.bar-chart-area {
  display: flex;
  height: 180px;
  gap: 8px;
}

.bar-chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 8px;
  flex-shrink: 0;
}

.y-label {
  font-size: 0.65rem;
  color: var(--text-tertiary);
  text-align: right;
  min-width: 20px;
}

.bar-chart-bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 4px;
  padding-bottom: 20px;
  position: relative;
}

.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
  min-width: 0;
}

.bar-wrapper {
  width: 100%;
  max-width: 32px;
  height: calc(100% - 20px);
  display: flex;
  align-items: flex-end;
  border-radius: 4px 4px 0 0;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  background: var(--accent);
  border-radius: 4px 4px 0 0;
  min-height: 0;
  transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bar-fill.animated {
  /* height transition applied via style */
}

.bar-fill:hover {
  opacity: 0.8;
}

.bar-label {
  font-size: 0.6rem;
  color: var(--text-tertiary);
  margin-top: 6px;
  white-space: nowrap;
}

/* ---- 甜甜圈图 ---- */
.donut-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.donut-container {
  position: relative;
  width: 160px;
  height: 160px;
}

.donut-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.donut-segment {
  transition: stroke-dasharray 0.8s ease-out, stroke-dashoffset 0.8s ease-out;
}

.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.donut-total {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
}

.donut-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.donut-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-label {
  color: var(--text-secondary);
}

.legend-value {
  color: var(--text-tertiary);
  font-weight: 500;
}

/* ---- 折线图 ---- */
.line-chart-area {
  display: flex;
  height: 180px;
  gap: 8px;
}

.line-chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 4px;
  flex-shrink: 0;
}

.y-label-mood {
  font-size: 0.8rem;
  line-height: 1;
}

.line-chart-svg {
  flex: 1;
  min-height: 0;
}

.mood-line {
  stroke-dasharray: 500;
  stroke-dashoffset: 500;
  transition: stroke-dashoffset 1s ease-out;
}

.mood-line.animated {
  stroke-dashoffset: 0;
}

/* ---- 水平柱状图 ---- */
.h-bar-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.h-bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.h-bar-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  width: 44px;
  flex-shrink: 0;
  text-align: right;
}

.h-bar-track {
  flex: 1;
  height: 18px;
  background: var(--bg);
  border-radius: 4px;
  overflow: hidden;
}

.h-bar-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-width: 0;
}

.h-bar-value {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  width: 24px;
  flex-shrink: 0;
}

/* ---- 底部区域 ---- */
.bottom-section {
  display: flex;
  gap: 24px;
}

.recent-sessions {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.section-title {
  padding: 14px 18px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  border-bottom: 1px solid var(--border);
}

.sessions-list {
  max-height: 300px;
  overflow-y: auto;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  border-bottom: 1px solid var(--border);
  transition: background 0.2s ease;
}

.session-item:last-child {
  border-bottom: none;
}

.session-item:hover {
  background: var(--hover-bg);
}

.session-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  flex-shrink: 0;
}

.session-icon.work {
  background: rgba(88, 166, 255, 0.15);
  color: #58A6FF;
}

.session-icon.short_break,
.session-icon.long_break {
  background: rgba(63, 185, 80, 0.15);
  color: #3FB950;
}

.session-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.session-task {
  font-size: 0.85rem;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-time {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.session-duration {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
  flex-shrink: 0;
}

/* ---- 导出按钮 ---- */
.export-section {
  display: flex;
  align-items: flex-start;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-export:hover:not(:disabled) {
  background: var(--active-bg);
  transform: translateY(-1px);
}

.btn-export:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ---- 响应式 ---- */
@media (max-width: 1100px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .stats-header {
    flex-wrap: wrap;
    padding: 12px 16px;
  }

  .stats-body {
    padding: 16px;
  }

  .bottom-section {
    flex-direction: column;
  }
}
</style>
