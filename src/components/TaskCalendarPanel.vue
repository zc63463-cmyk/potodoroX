<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatDate } from '@/utils/format'
import { useSessionStore } from '@/stores/session'
import { useTaskStore } from '@/stores/task'
import type { Session } from '@/types'

const sessionStore = useSessionStore()
const taskStore = useTaskStore()

const CELL_SIZE = 11
const CELL_GAP = 3
const WEEKS_TO_SHOW = 53

const heatmapTooltip = ref<{ date: string; count: number; x: number; y: number } | null>(null)
const selectedDay = ref<{ date: string; count: number; sessions: Session[] } | null>(null)

/** 日历热力图数据 - 最近 53 周（GitHub 风格） */
const heatmapData = computed(() => {
  const today = new Date()
  const days: { date: string; count: number; isFuture: boolean }[] = []

  const endDate = new Date(today)
  endDate.setDate(today.getDate() + 1)

  const totalDays = WEEKS_TO_SHOW * 7

  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - totalDays)

  // 对齐到周日（GitHub 标准）
  const dayOfWeek = startDate.getDay()
  startDate.setDate(startDate.getDate() - dayOfWeek)

  const renderDays = totalDays + dayOfWeek

  const pomodoroMap = new Map<string, number>()
  sessionStore.sessions.forEach((s) => {
    if (s.completed && s.type === 'work' && s.startedAt) {
      const dateKey = s.startedAt.substring(0, 10)
      pomodoroMap.set(dateKey, (pomodoroMap.get(dateKey) || 0) + 1)
    }
  })

  for (let i = 0; i < renderDays; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    const dateStr = formatDate(d)
    const isFuture = d > today
    days.push({
      date: dateStr,
      count: isFuture ? 0 : (pomodoroMap.get(dateStr) || 0),
      isFuture,
    })
  }

  return days
})

/** 热力图周数据（按周分组） */
const heatmapWeeks = computed(() => {
  const weeks: typeof heatmapData.value[] = []
  for (let i = 0; i < heatmapData.value.length; i += 7) {
    weeks.push(heatmapData.value.slice(i, i + 7))
  }
  return weeks
})

/** 月份标签精确计算 —— 基于每个月首日在网格中的精确列位置 */
const monthLabels = computed(() => {
  const labels: { label: string; x: number }[] = []
  const seen = new Set<number>()

  heatmapData.value.forEach((day, dayIndex) => {
    const d = new Date(day.date + 'T00:00:00')
    const monthKey = d.getFullYear() * 12 + d.getMonth()

    if (!seen.has(monthKey)) {
      seen.add(monthKey)
      const weekIndex = Math.floor(dayIndex / 7)
      const x = weekIndex * (CELL_SIZE + CELL_GAP)

      labels.push({
        label: d.toLocaleDateString('zh-CN', { month: 'short' }),
        x,
      })
    }
  })

  // 防重叠：若相邻标签间距不足 50px，则丢弃后一个
  const MIN_GAP = 50
  const result: typeof labels = []
  labels.forEach((label) => {
    if (result.length === 0) {
      result.push(label)
    } else {
      const prev = result[result.length - 1]
      if (label.x - prev.x >= MIN_GAP) {
        result.push(label)
      }
    }
  })

  return result
})

/** 热力图统计 */
const heatmapStats = computed(() => {
  const total = heatmapData.value.reduce((s, d) => s + d.count, 0)
  const activeDays = heatmapData.value.filter((d) => d.count > 0).length
  const maxDay = Math.max(...heatmapData.value.map((d) => d.count), 0)
  const avgPerDay = activeDays > 0 ? (total / activeDays).toFixed(1) : '0'
  return { total, activeDays, maxDay, avgPerDay }
})

/** 5 级颜色 */
function getHeatColor(count: number): string {
  if (count === 0) return 'var(--border)'
  if (count <= 2) return 'rgba(88, 166, 255, 0.35)'
  if (count <= 5) return 'rgba(88, 166, 255, 0.55)'
  if (count <= 8) return 'rgba(88, 166, 255, 0.75)'
  return 'rgba(88, 166, 255, 0.95)'
}

function onHeatmapCellMouseEnter(e: MouseEvent, date: string, count: number) {
  const rect = (e.target as HTMLElement).getBoundingClientRect()
  heatmapTooltip.value = {
    date,
    count,
    x: rect.left + rect.width / 2,
    y: rect.top - 6,
  }
}

function onHeatmapCellMouseLeave() {
  heatmapTooltip.value = null
}

function onCellClick(date: string, count: number) {
  const sessions = sessionStore.sessions.filter((s) => {
    return s.completed && s.type === 'work' && s.startedAt && s.startedAt.startsWith(date)
  })
  selectedDay.value = { date, count, sessions }
}

function closeDetail() {
  selectedDay.value = null
}

function formatTime(iso: string): string {
  return iso.substring(11, 16)
}

function getTaskTitle(taskId: string | null | undefined): string {
  if (!taskId) return '未关联任务'
  return taskStore.getTaskById(taskId)?.title || '未知任务'
}
</script>

<template>
  <div class="calendar-view">
    <div class="heatmap-scroll-wrapper">
      <div class="heatmap-inner">
        <!-- 月份标签（精确对齐到列） -->
        <div class="heatmap-months">
          <span
            v-for="m in monthLabels"
            :key="m.label + m.x"
            class="heatmap-month-label"
            :style="{ transform: `translateX(${m.x}px)` }"
          >
            {{ m.label }}
          </span>
        </div>

        <!-- 热力图网格 -->
        <div class="heatmap-grid">
          <!-- 星期标签 -->
          <div class="heatmap-day-labels">
            <span class="day-label-spacer" />
            <span class="day-label">一</span>
            <span class="day-label-spacer" />
            <span class="day-label">三</span>
            <span class="day-label-spacer" />
            <span class="day-label">五</span>
            <span class="day-label-spacer" />
          </div>

          <!-- 网格主体 -->
          <div class="heatmap-weeks">
            <div
              v-for="week in heatmapWeeks"
              :key="'week-' + week[0]?.date"
              class="heatmap-week"
            >
              <div
                v-for="day in week"
                :key="day.date"
                class="heatmap-cell"
                :class="{
                  future: day.isFuture,
                  active: !day.isFuture && day.count > 0,
                  selected: selectedDay?.date === day.date,
                }"
                :style="{ backgroundColor: day.isFuture ? 'transparent' : getHeatColor(day.count) }"
                @mouseenter="onHeatmapCellMouseEnter($event, day.date, day.count)"
                @mouseleave="onHeatmapCellMouseLeave"
                @click="!day.isFuture && onCellClick(day.date, day.count)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="heatmap-legend">
      <span class="legend-label">少</span>
      <div class="legend-cells">
        <div class="legend-cell" style="background-color: var(--border)" />
        <div class="legend-cell" style="background-color: rgba(88, 166, 255, 0.35)" />
        <div class="legend-cell" style="background-color: rgba(88, 166, 255, 0.55)" />
        <div class="legend-cell" style="background-color: rgba(88, 166, 255, 0.75)" />
        <div class="legend-cell" style="background-color: rgba(88, 166, 255, 0.95)" />
      </div>
      <span class="legend-label">多</span>
    </div>

    <!-- 统计摘要 -->
    <div class="heatmap-stats">
      <div class="stat-card">
        <div class="stat-value">{{ heatmapStats.total }}</div>
        <div class="stat-label">总番茄钟数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ heatmapStats.activeDays }}</div>
        <div class="stat-label">活跃天数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ heatmapStats.avgPerDay }}</div>
        <div class="stat-label">日均番茄钟</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ heatmapStats.maxDay }}</div>
        <div class="stat-label">单日最高</div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="heatmapStats.total === 0" class="empty-state small">
      <p class="empty-desc">完成番茄钟后，这里将展示你的专注热力图</p>
    </div>

    <!-- Tooltip -->
    <Teleport to="body">
      <Transition name="tooltip">
        <div
          v-if="heatmapTooltip"
          class="heatmap-tooltip"
          :style="{ left: heatmapTooltip.x + 'px', top: heatmapTooltip.y + 'px' }"
        >
          <strong>{{ heatmapTooltip.count }}</strong> 个番茄钟
          <span class="tooltip-date">{{ heatmapTooltip.date }}</span>
        </div>
      </Transition>
    </Teleport>

    <!-- 当日详情面板 -->
    <Transition name="slide-up">
      <div
        v-if="selectedDay"
        class="day-detail-overlay"
        @click.self="closeDetail"
      >
        <div class="day-detail-panel">
          <div class="detail-header">
            <div class="detail-title">
              <h4>{{ selectedDay.date }}</h4>
              <span class="detail-badge">{{ selectedDay.count }} 个番茄钟</span>
            </div>
            <button class="detail-close" @click="closeDetail">×</button>
          </div>
          <div class="detail-body">
            <div v-if="selectedDay.sessions.length === 0" class="detail-empty">
              该日暂无专注记录
            </div>
            <div v-else class="detail-sessions">
              <div
                v-for="s in selectedDay.sessions"
                :key="s.id"
                class="session-item"
              >
                <span class="session-time">{{ formatTime(s.startedAt) }}</span>
                <span class="session-task">{{ getTaskTitle(s.taskId) }}</span>
                <span class="session-duration">{{ Math.round((s.duration || 0) / 60) }} 分钟</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.calendar-view {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ---- 滚动容器 ---- */
.heatmap-scroll-wrapper {
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  padding: 20px 16px;
  overflow-x: auto;
  overflow-y: hidden;
}

.heatmap-inner {
  min-width: max-content;
}

/* ---- 月份标签 ---- */
.heatmap-months {
  position: relative;
  height: 20px;
  margin-bottom: 8px;
  margin-left: 36px;
}

.heatmap-month-label {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.7rem;
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
  line-height: 20px;
}

/* ---- 热力图网格 ---- */
.heatmap-grid {
  display: flex;
  gap: 0;
  align-items: flex-start;
}

/* 星期标签 */
.heatmap-day-labels {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-right: 4px;
  flex-shrink: 0;
}

.day-label {
  font-size: 0.6rem;
  color: var(--text-tertiary);
  height: 11px;
  line-height: 11px;
  text-align: right;
  width: 32px;
  user-select: none;
}

.day-label-spacer {
  height: 11px;
  width: 32px;
  flex-shrink: 0;
}

/* 周列 */
.heatmap-weeks {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
}

.heatmap-week {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* 单元格 */
.heatmap-cell {
  width: 11px;
  height: 11px;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.12s ease;
  outline: 1px solid rgba(255, 255, 255, 0.04);
}

.heatmap-cell:hover {
  outline: 2px solid var(--accent);
  transform: scale(1.25);
  z-index: 1;
}

.heatmap-cell.future {
  outline: 1px dashed var(--glass-border);
  cursor: default;
}

.heatmap-cell.future:hover {
  outline: 1px dashed var(--glass-border);
  transform: none;
}

.heatmap-cell.selected {
  outline: 2px solid var(--accent);
  transform: scale(1.15);
}

/* ---- 图例 ---- */
.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.legend-cells {
  display: flex;
  gap: 3px;
}

.legend-cell {
  width: 11px;
  height: 11px;
  border-radius: 2px;
}

/* ---- Tooltip ---- */
.heatmap-tooltip {
  position: fixed;
  z-index: 1000;
  padding: 6px 10px;
  background: var(--bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  font-size: 0.8rem;
  color: var(--text);
  transform: translate(-50%, -100%);
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  pointer-events: none;
}

.tooltip-date {
  font-size: 0.7rem;
  color: var(--text-tertiary);
}

.tooltip-enter-active {
  transition: opacity var(--transition-fast);
}

.tooltip-leave-active {
  transition: opacity 0.1s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}

/* ---- 统计摘要 ---- */
.heatmap-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-card {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 6px;
}

/* ---- 空状态 ---- */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 20px;
  text-align: center;
  color: var(--text-tertiary);
}

.empty-state.small {
  padding: 40px 20px;
}

.empty-desc {
  font-size: 0.85rem;
  line-height: 1.5;
}

/* ---- 当日详情面板 ---- */
.day-detail-overlay {
  position: fixed;
  inset: 0;
  z-index: 900;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.day-detail-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 560px;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--glass-border);
  flex-shrink: 0;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-title h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.detail-badge {
  font-size: 0.75rem;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--accent-dim);
  color: var(--accent);
  font-weight: 500;
}

.detail-close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.detail-close:hover {
  background: var(--glass-border);
  color: var(--text);
}

.detail-body {
  padding: 12px 20px 20px;
  overflow-y: auto;
}

.detail-empty {
  text-align: center;
  color: var(--text-tertiary);
  font-size: 0.85rem;
  padding: 24px 0;
}

.detail-sessions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
}

.session-time {
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
  min-width: 44px;
}

.session-task {
  flex: 1;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-duration {
  color: var(--text-tertiary);
  font-size: 0.8rem;
}

/* 滑入动画 */
.slide-up-enter-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}

.slide-up-leave-active {
  transition: transform 0.2s ease-in, opacity 0.15s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* 响应式 */
@media (max-width: 1024px) {
  .heatmap-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .day-detail-panel {
    max-width: 100%;
  }
}
</style>
