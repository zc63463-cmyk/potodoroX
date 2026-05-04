<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatDate } from '@/utils/format'
import { useSessionStore } from '@/stores/session'

const sessionStore = useSessionStore()

const heatmapTooltip = ref<{ date: string; count: number; x: number; y: number } | null>(null)

/** 日历热力图数据 - 最近 12 周 */
const heatmapData = computed(() => {
  const today = new Date()
  const days: { date: string; count: number; isFuture: boolean }[] = []

  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 83)
  const dayOfWeek = startDate.getDay()
  startDate.setDate(startDate.getDate() - dayOfWeek)

  const pomodoroMap = new Map<string, number>()
  sessionStore.sessions.forEach((s) => {
    if (s.completed && s.type === 'work' && s.startedAt) {
      const dateKey = s.startedAt.substring(0, 10)
      pomodoroMap.set(dateKey, (pomodoroMap.get(dateKey) || 0) + 1)
    }
  })

  for (let i = 0; i < 91; i++) {
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

/** 热力图统计 */
const heatmapStats = computed(() => {
  const total = heatmapData.value.reduce((s, d) => s + d.count, 0)
  const activeDays = heatmapData.value.filter((d) => d.count > 0).length
  const maxDay = Math.max(...heatmapData.value.map((d) => d.count), 0)
  const avgPerDay = activeDays > 0 ? (total / activeDays).toFixed(1) : '0'
  return { total, activeDays, maxDay, avgPerDay }
})

/** 热力图颜色等级 */
function getHeatColor(count: number): string {
  if (count === 0) return 'var(--border)'
  if (count <= 2) return 'rgba(88, 166, 255, 0.3)'
  if (count <= 4) return 'rgba(88, 166, 255, 0.55)'
  return 'rgba(88, 166, 255, 0.85)'
}

/** 热力图鼠标事件 */
function onHeatmapCellMouseEnter(e: MouseEvent, date: string, count: number) {
  const rect = (e.target as HTMLElement).getBoundingClientRect()
  heatmapTooltip.value = {
    date,
    count,
    x: rect.left + rect.width / 2,
    y: rect.top - 8,
  }
}

function onHeatmapCellMouseLeave() {
  heatmapTooltip.value = null
}
</script>

<template>
  <div class="calendar-view">
    <div class="heatmap-container">
      <!-- 月份标签 -->
      <div class="heatmap-months">
        <span
          v-for="(week, wi) in heatmapWeeks"
          :key="'month-' + wi"
          class="heatmap-month-label"
          :style="{ left: wi * 15 + 'px' }"
        >
          {{ week.length > 0 ? new Date(week[0].date + 'T00:00:00').toLocaleDateString('zh-CN', { month: 'short' }) : '' }}
        </span>
      </div>

      <!-- 热力图网格 -->
      <div class="heatmap-grid">
        <!-- 星期标签 -->
        <div class="heatmap-day-labels">
          <span class="day-label" style="line-height: 15px; height: 15px;" />
          <span class="day-label">一</span>
          <span class="day-label">三</span>
          <span class="day-label">五</span>
        </div>

        <!-- 网格 -->
        <div class="heatmap-cells">
          <div
            v-for="week in heatmapWeeks"
            :key="'week-' + week[0]?.date"
            class="heatmap-week"
          >
            <div
              v-for="day in week"
              :key="day.date"
              class="heatmap-cell"
              :class="{ future: day.isFuture }"
              :style="{ backgroundColor: day.isFuture ? 'transparent' : getHeatColor(day.count) }"
              @mouseenter="onHeatmapCellMouseEnter($event, day.date, day.count)"
              @mouseleave="onHeatmapCellMouseLeave"
            />
          </div>
        </div>
      </div>

      <!-- 图例 -->
      <div class="heatmap-legend">
        <span class="legend-label">少</span>
        <div class="legend-cells">
          <div class="legend-cell" style="background-color: var(--border)" />
          <div class="legend-cell" style="background-color: rgba(88, 166, 255, 0.3)" />
          <div class="legend-cell" style="background-color: rgba(88, 166, 255, 0.55)" />
          <div class="legend-cell" style="background-color: rgba(88, 166, 255, 0.85)" />
        </div>
        <span class="legend-label">多</span>
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
  </div>
</template>

<style scoped>
.calendar-view {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.heatmap-container {
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  padding: 24px;
  overflow-x: auto;
}

.heatmap-months {
  position: relative;
  height: 20px;
  margin-bottom: 8px;
}

.heatmap-month-label {
  position: absolute;
  font-size: 0.7rem;
  color: var(--text-tertiary);
}

.heatmap-grid {
  display: flex;
  gap: 0;
}

.heatmap-day-labels {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-right: 4px;
}

.day-label {
  font-size: 0.6rem;
  color: var(--text-tertiary);
  height: 15px;
  line-height: 15px;
  text-align: right;
  width: 14px;
}

.heatmap-cells {
  display: flex;
  gap: 3px;
}

.heatmap-week {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.heatmap-cell {
  width: 15px;
  height: 15px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s ease;
  outline: 1px solid rgba(255, 255, 255, 0.04);
}

.heatmap-cell:hover {
  outline: 2px solid var(--accent);
  transform: scale(1.2);
}

.heatmap-cell.future {
  outline: 1px dashed var(--glass-border);
  cursor: default;
}

.heatmap-cell.future:hover {
  outline: 1px dashed var(--glass-border);
  transform: none;
}

/* ---- 图例 ---- */
.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 12px;
  font-size: 0.7rem;
  color: var(--text-tertiary);
}

.legend-cells {
  display: flex;
  gap: 2px;
}

.legend-cell {
  width: 15px;
  height: 15px;
  border-radius: 3px;
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
}

.tooltip-date {
  font-size: 0.7rem;
  color: var(--text-tertiary);
}

/* Tooltip */
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

@media (max-width: 1024px) {
  .heatmap-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
