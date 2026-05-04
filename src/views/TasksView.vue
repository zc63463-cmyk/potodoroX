<script setup lang="ts">
// ============================================================
// PomodoroX - 任务管理视图
// 列表 / 看板 / 日历热力图 三种视图模式
// ============================================================

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTaskStore } from '@/stores/task'
import { useSessionStore } from '@/stores/session'
import { PRIORITIES, STATUSES } from '@/utils/constants'
import type { Task, TaskStatus, Priority, UpdateTaskInput, SortField, SortOrder } from '@/types'
import TaskDetailModal from '@/components/TaskDetailModal.vue'
import TaskFormModal from '@/components/TaskFormModal.vue'
import TaskDeleteConfirm from '@/components/TaskDeleteConfirm.vue'
import TaskListPanel from '@/components/TaskListPanel.vue'
import TaskKanbanPanel from '@/components/TaskKanbanPanel.vue'
import TaskCalendarPanel from '@/components/TaskCalendarPanel.vue'

// ---- Stores ----
const taskStore = useTaskStore()
const sessionStore = useSessionStore()

// ---- 视图模式 ----
type ViewMode = 'list' | 'kanban' | 'calendar'
const viewMode = ref<ViewMode>('list')

// ---- 模态框状态 ----
const showForm = ref(false)
const showDeleteConfirm = ref(false)
const editingTask = ref<Task | null>(null)
const deletingTaskId = ref<string | null>(null)

// ---- 任务详情弹窗状态 ----
const showTaskDetail = ref(false)
const selectedTaskForDetail = ref<Task | null>(null)
const detailInitialTab = ref<'plan' | 'completion' | 'sessions'>('plan')

// ---- 列表视图状态 ----
const statusFilter = ref<TaskStatus | 'all'>('all')
const priorityFilter = ref<Priority | ''>('')
const tagFilter = ref('')
const searchQuery = ref('')
const sortField = ref<SortField>('createdAt')
const sortOrder = ref<SortOrder>('desc')

// ---- 排序选项 ----
const sortOptions: { field: SortField; label: string }[] = [
  { field: 'createdAt', label: '创建时间' },
  { field: 'updatedAt', label: '更新时间' },
  { field: 'priority', label: '优先级' },
  { field: 'dueDate', label: '截止日期' },
  { field: 'title', label: '标题' },
]

// ---- 计算属性 ----

/** 委托给 taskStore 的筛选排序结果 */
const displayTasks = computed(() => taskStore.filteredTasks)

/** 同步本地筛选状态到 taskStore */
function syncFilterToStore() {
  taskStore.setFilter({
    status: statusFilter.value === 'all' ? undefined : statusFilter.value,
    priority: priorityFilter.value || undefined,
    tag: tagFilter.value || undefined,
    search: searchQuery.value.trim() || undefined,
  })
  taskStore.setSort(sortField.value, sortOrder.value)
}

// 监听筛选条件变化，同步到 store
watch([statusFilter, priorityFilter, tagFilter, searchQuery, sortField, sortOrder], () => {
  syncFilterToStore()
}, { immediate: true })

// ---- 方法 ----

/** 打开任务详情弹窗 */
function openTaskDetail(task: Task, tab?: 'plan' | 'completion' | 'sessions') {
  selectedTaskForDetail.value = task
  detailInitialTab.value = tab || 'plan'
  showTaskDetail.value = true
}

/** 关闭任务详情弹窗 */
function closeTaskDetail() {
  showTaskDetail.value = false
  selectedTaskForDetail.value = null
}

/** 处理任务详情更新 */
async function handleTaskUpdate(id: string, input: UpdateTaskInput) {
  await taskStore.updateTask(id, input)
  const refreshed = taskStore.getTaskById(id)
  if (refreshed) selectedTaskForDetail.value = refreshed
}

/** 打开新建表单 */
function openNewTask() {
  editingTask.value = null
  showForm.value = true
}

/** 打开编辑表单 */
function openEditTask(task: Task) {
  editingTask.value = task
  showForm.value = true
}

/** 关闭表单 */
function closeForm() {
  showForm.value = false
  editingTask.value = null
}

/** 处理表单创建 */
async function handleTaskCreate(input: Parameters<typeof taskStore.createTask>[0]) {
  await taskStore.createTask(input)
  closeForm()
}

/** 处理表单更新 */
async function handleFormUpdate(id: string, input: UpdateTaskInput) {
  await taskStore.updateTask(id, input)
  closeForm()
}

/** 切换完成状态 */
async function toggleDone(task: Task) {
  const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done'
  await taskStore.updateTask(task.id, { status: newStatus })

  // 获取最新引用，避免传入旧对象
  const refreshed = taskStore.getTaskById(task.id)
  if (!refreshed) return

  // 如果标记为完成且 completion 为空，打开详情弹窗提醒填写
  if (newStatus === 'done' && !refreshed.completion) {
    openTaskDetail(refreshed, 'completion')
  }
}

/** 确认删除 */
function confirmDelete(taskId: string) {
  deletingTaskId.value = taskId
  showDeleteConfirm.value = true
}

/** 取消删除 */
function cancelDelete() {
  deletingTaskId.value = null
  showDeleteConfirm.value = false
}

/** 执行删除 */
async function executeDelete() {
  if (deletingTaskId.value) {
    await taskStore.deleteTask(deletingTaskId.value)
  }
  cancelDelete()
}

/** 切换排序 */
function toggleSort(field: SortField) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = field === 'priority' ? 'desc' : 'desc'
  }
}

// ---- 键盘快捷键 ----
function handleKeyDown(e: KeyboardEvent) {
  const target = e.target as HTMLElement
  const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

  // N 键新建任务（非输入状态）
  if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !isInput) {
    e.preventDefault()
    openNewTask()
  }

}

// ---- 生命周期 ----
onMounted(async () => {
  await Promise.all([
    taskStore.loadTasks(),
    sessionStore.loadAllSessions(),
  ])
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="tasks-view">
    <!-- 背景装饰 -->
    <div class="tasks-bg">
      <div class="bg-orb bg-orb-1" />
      <div class="bg-orb bg-orb-2" />
    </div>

    <!-- 主内容 -->
    <div class="tasks-content">
      <!-- 顶部栏 -->
      <header class="tasks-header">
        <div class="header-left">
          <h1 class="page-title">任务管理</h1>
          <span class="task-count">{{ taskStore.stats.total }} 个任务</span>
        </div>
        <div class="header-right">
          <!-- 搜索框 -->
          <div class="search-box">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索任务..."
              class="search-input"
            />
            <button
              v-if="searchQuery"
              class="search-clear"
              @click="searchQuery = ''"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- 新建任务按钮 -->
          <button class="new-task-btn" @click="openNewTask">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>新建任务</span>
          </button>
        </div>
      </header>

      <!-- 视图切换 + 筛选栏 -->
      <div class="toolbar">
        <!-- 视图模式切换 -->
        <div class="view-tabs">
          <button
            v-for="mode in ([
              { key: 'list', label: '列表' },
              { key: 'kanban', label: '看板' },
              { key: 'calendar', label: '日历' },
            ] as const)"
            :key="mode.key"
            class="view-tab"
            :class="{ active: viewMode === mode.key }"
            @click="viewMode = mode.key"
          >
            <svg v-if="mode.key === 'list'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            <svg v-if="mode.key === 'kanban'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>
            </svg>
            <svg v-if="mode.key === 'calendar'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {{ mode.label }}
          </button>
        </div>

        <!-- 筛选控件 -->
        <div class="filter-bar">
          <!-- 状态筛选 -->
          <div class="filter-group">
            <button
              v-for="s in ([
                { value: 'all', label: '全部' },
                ...STATUSES,
              ] as const)"
              :key="s.value"
              class="filter-chip"
              :class="{ active: statusFilter === s.value }"
              @click="statusFilter = s.value"
            >
              {{ s.label }}
            </button>
          </div>

          <!-- 优先级筛选 -->
          <select
            v-model="priorityFilter"
            class="filter-select"
          >
            <option value="">全部优先级</option>
            <option v-for="p in PRIORITIES" :key="p.value" :value="p.value">
              {{ p.label }}
            </option>
          </select>

          <!-- 标签筛选 -->
          <select
            v-model="tagFilter"
            class="filter-select"
          >
            <option value="">全部标签</option>
            <option v-for="tag in taskStore.allTags" :key="tag" :value="tag">
              {{ tag }}
            </option>
          </select>

          <!-- 排序 -->
          <button
            v-for="opt in sortOptions"
            :key="opt.field"
            class="sort-btn"
            :class="{ active: sortField === opt.field }"
            @click="toggleSort(opt.field)"
          >
            {{ opt.label }}
            <svg
              v-if="sortField === opt.field"
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              :style="{ transform: sortOrder === 'asc' ? 'rotate(180deg)' : 'none' }"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 主内容区域 -->
      <div class="main-area">
        <!-- ==================== 列表视图 ==================== -->
        <Transition name="view-fade" mode="out-in">
          <TaskListPanel
            v-if="viewMode === 'list'"
            key="list"
            :tasks="displayTasks"
            :search-query="searchQuery"
            @toggle-done="toggleDone"
            @open-detail="openTaskDetail"
            @open-edit="openEditTask"
            @delete="confirmDelete"
            @create="openNewTask"
          />

          <TaskKanbanPanel
            v-else-if="viewMode === 'kanban'"
            key="kanban"
            :tasks="displayTasks"
            @open-edit="openEditTask"
            @open-detail="openTaskDetail"
          />

          <TaskCalendarPanel
            v-else-if="viewMode === 'calendar'"
            key="calendar"
          />
        </Transition>
      </div>
    </div>

    <!-- ==================== 任务表单弹窗 ==================== -->
    <TaskFormModal
      :visible="showForm"
      :editing-task="editingTask"
      :initial-status="statusFilter !== 'all' ? statusFilter : undefined"
      @create="handleTaskCreate"
      @update="handleFormUpdate"
      @cancel="closeForm"
    />

    <!-- ==================== 删除确认弹窗 ==================== -->
    <TaskDeleteConfirm
      :visible="showDeleteConfirm"
      :task-title="deletingTaskId ? taskStore.getTaskById(deletingTaskId)?.title : undefined"
      @confirm="executeDelete"
      @cancel="cancelDelete"
    />

    <!-- ==================== 任务详情弹窗 ==================== -->
    <TaskDetailModal
      :task="selectedTaskForDetail"
      :visible="showTaskDetail"
      :initial-tab="detailInitialTab"
      @close="closeTaskDetail"
      @update="handleTaskUpdate"
    />
  </div>
</template>

<style scoped>
/* ============================================================
   TasksView - Focus Flow Design System
   玻璃拟态 + 动态背景 + 现代交互
   ============================================================ */

/* ---- 主容器 ---- */
.tasks-view {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ---- 背景装饰 ---- */
.tasks-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.bg-orb {
  opacity: 0.4;
}

.bg-orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(88, 166, 255, 0.1) 0%, transparent 70%);
  top: -20%;
  right: -10%;
  animation: orb-drift-tasks-1 25s ease-in-out infinite;
}

.bg-orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(136, 100, 255, 0.08) 0%, transparent 70%);
  bottom: -10%;
  left: -5%;
  animation: orb-drift-tasks-2 30s ease-in-out infinite;
}

@keyframes orb-drift-tasks-1 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-40px, 30px); }
}

@keyframes orb-drift-tasks-2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -20px); }
}

/* ---- 主内容 ---- */
.tasks-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ---- 顶部栏 ---- */
.tasks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  flex-shrink: 0;
  margin: 16px 28px 8px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.page-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
}

.task-count {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ---- 搜索框 ---- */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: var(--text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 220px;
  padding: 7px 32px 7px 32px;
  font-size: 0.85rem;
  border-radius: var(--radius-lg);
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  color: var(--text);
  transition: all var(--transition-fast);
}

.search-input:focus {
  width: 280px;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--active-bg), 0 0 15px var(--accent-glow);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-clear {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 4px;
  transition: all var(--transition-fast);
}

.search-clear:hover {
  color: var(--text);
  background: var(--hover-bg);
}

/* ---- 新建任务按钮 ---- */
.new-task-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-lg);
  border: none;
  background: var(--accent);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  box-shadow: 0 0 15px var(--accent-glow);
}

.new-task-btn:hover {
  filter: brightness(1.15);
  box-shadow: 0 0 25px var(--accent-glow), 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.new-task-btn:active {
  transform: translateY(0);
}

/* ---- 工具栏 ---- */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  flex-shrink: 0;
  gap: 16px;
  flex-wrap: wrap;
  margin: 0 28px 12px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
}

/* ---- 视图切换标签 ---- */
.view-tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  background: var(--glass-bg);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

.view-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.view-tab:hover {
  color: var(--text);
  background: var(--hover-bg);
}

.view-tab.active {
  color: white;
  background: var(--accent);
  box-shadow: 0 0 12px var(--accent-glow);
}

/* ---- 筛选栏 ---- */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  background: var(--glass-bg);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

.filter-chip {
  padding: 4px 10px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.filter-chip:hover {
  color: var(--text);
  background: var(--hover-bg);
}

.filter-chip.active {
  color: var(--accent);
  background: var(--active-bg);
  font-weight: 600;
  box-shadow: 0 0 8px var(--accent-glow);
}

.filter-select {
  padding: 5px 10px;
  font-size: 0.75rem;
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  outline: none;
}

.filter-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 8px var(--accent-glow);
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-tertiary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.sort-btn:hover {
  color: var(--text);
  background: var(--hover-bg);
}

.sort-btn.active {
  color: var(--accent);
}

.sort-btn svg {
  transition: transform var(--transition-fast);
}

/* ---- 主内容区域 ---- */
.main-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 28px 80px;
}

.tag-chip {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  background: var(--active-bg);
  color: var(--accent);
  white-space: nowrap;
}

.tag-chip.small {
  padding: 1px 6px;
  font-size: 0.65rem;
}

/* ==================== 日历热力图视图 ==================== */
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
  margin-right: 8px;
  flex-shrink: 0;
}

.day-label {
  width: 20px;
  height: 15px;
  font-size: 0.65rem;
  color: var(--text-tertiary);
  text-align: right;
  line-height: 15px;
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
  transition: all var(--transition-fast);
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
}

.legend-label {
  font-size: 0.7rem;
  color: var(--text-tertiary);
}

.legend-cells {
  display: flex;
  gap: 3px;
  margin: 0 4px;
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
  background: var(--glass-bg);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  color: var(--text);
  white-space: nowrap;
  pointer-events: none;
  transform: translate(-50%, -100%);
  box-shadow: var(--glass-shadow);
}

/* ==================== 过渡动画 ==================== */

/* 视图切换 */
.view-fade-enter-active {
  transition: opacity var(--transition-normal), transform var(--transition-normal);
}

.view-fade-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.view-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.view-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .tasks-header {
    padding: 12px 16px;
    margin: 12px 20px 8px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-right {
    width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .search-input:focus {
    width: 100%;
  }

  .new-task-btn {
    flex: 1;
    justify-content: center;
  }

  .toolbar {
    padding: 8px 12px;
    margin: 0 20px 8px;
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-bar {
    width: 100%;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 4px;
  }

  .main-area {
    padding: 0 20px 20px;
  }

}

@media (max-width: 480px) {
  .view-tabs {
    width: 100%;
  }

  .view-tab {
    flex: 1;
    justify-content: center;
    padding: 6px 8px;
  }

  .filter-group {
    overflow-x: auto;
  }

  .sort-btn span {
    display: none;
  }
}

/* ---- 移动端响应式 ---- */
@media (max-width: 640px) {
  .tasks-container {
    padding-bottom: 60px; /* 避免 FAB 遮挡 */
  }

  .board-columns {
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
  }

  .board-column {
    min-height: auto;
  }

  .fab-button {
    display: flex;
    position: fixed;
    bottom: calc(64px + env(safe-area-inset-bottom, 0px));
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--accent);
    color: #fff;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px var(--accent-glow);
    z-index: 40;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .fab-button:active {
    transform: scale(0.95);
  }

  .task-form-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .task-form-panel {
    width: 100%;
    max-width: 100vw;
    border-radius: 16px 16px 0 0;
    max-height: 85vh;
    overflow-y: auto;
    margin: 0;
    padding: 20px;
    padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
  }

  .form-row {
    flex-direction: column;
    gap: 8px;
  }

  .view-tab-label {
    font-size: 0.75rem;
  }

  .calendar-grid {
    gap: 2px;
  }

  .calendar-cell {
    font-size: 0.7rem;
    min-height: 32px;
  }

  .task-item {
    min-height: 44px;
    padding: 10px 12px;
  }

  .empty-state {
    padding: 40px 16px;
  }

  .empty-title {
    font-size: 0.95rem;
  }

  .empty-desc {
    font-size: 0.8rem;
  }

  .empty-action {
    width: 100%;
    justify-content: center;
    min-height: 44px;
  }
}

</style>
