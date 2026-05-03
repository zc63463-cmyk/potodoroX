<script setup lang="ts">
// ============================================================
// PomodoroX - 任务管理视图
// 列表 / 看板 / 日历热力图 三种视图模式
// ============================================================

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTaskStore } from '@/stores/task'
import { PRIORITIES, STATUSES, DEFAULT_TAGS } from '@/utils/constants'
import { formatDate, formatRelativeTime, formatFriendlyDate } from '@/utils/format'
import type { Task, TaskStatus, Priority, CreateTaskInput, UpdateTaskInput, SortField, SortOrder } from '@/types'

// ---- Stores ----
const taskStore = useTaskStore()

// ---- 视图模式 ----
type ViewMode = 'list' | 'kanban' | 'calendar'
const viewMode = ref<ViewMode>('list')

// ---- 模态框状态 ----
const showForm = ref(false)
const showDeleteConfirm = ref(false)
const editingTask = ref<Task | null>(null)
const deletingTaskId = ref<string | null>(null)

// ---- 列表视图状态 ----
const statusFilter = ref<TaskStatus | 'all'>('all')
const priorityFilter = ref<Priority | ''>('')
const tagFilter = ref('')
const searchQuery = ref('')
const sortField = ref<SortField>('createdAt')
const sortOrder = ref<SortOrder>('desc')
const expandedTaskId = ref<string | null>(null)
const inlineEditingId = ref<string | null>(null)
const inlineEditTitle = ref('')

// ---- 看板视图状态 ----
const kanbanColumns: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'todo', label: '待办', color: '#8B949E' },
  { status: 'in_progress', label: '进行中', color: '#58A6FF' },
  { status: 'done', label: '已完成', color: '#3FB950' },
  { status: 'archived', label: '已归档', color: '#484F58' },
]

// ---- 日历热力图状态 ----
const heatmapTooltip = ref<{ date: string; count: number; x: number; y: number } | null>(null)

// ---- 表单数据 ----
const form = ref({
  title: '',
  description: '',
  status: 'todo' as TaskStatus,
  priority: 'medium' as Priority,
  estimatedPomodoros: 1,
  tags: [] as string[],
  dueDate: '' as string,
})
const tagInput = ref('')
const formError = ref('')

// ---- 排序选项 ----
const sortOptions: { field: SortField; label: string }[] = [
  { field: 'createdAt', label: '创建时间' },
  { field: 'updatedAt', label: '更新时间' },
  { field: 'priority', label: '优先级' },
  { field: 'dueDate', label: '截止日期' },
  { field: 'title', label: '标题' },
]

// ---- 计算属性 ----

/** 根据本地筛选条件过滤任务 */
const displayTasks = computed(() => {
  let result = [...taskStore.tasks]

  // 状态筛选
  if (statusFilter.value !== 'all') {
    result = result.filter((t) => t.status === statusFilter.value)
  }

  // 优先级筛选
  if (priorityFilter.value) {
    result = result.filter((t) => t.priority === priorityFilter.value)
  }

  // 标签筛选
  if (tagFilter.value) {
    result = result.filter((t) => t.tags.includes(tagFilter.value))
  }

  // 搜索
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    )
  }

  // 排序
  result.sort((a, b) => {
    const field = sortField.value
    const order = sortOrder.value === 'asc' ? 1 : -1

    switch (field) {
      case 'priority': {
        const wA = PRIORITIES.find((p) => p.value === a.priority)?.weight ?? 0
        const wB = PRIORITIES.find((p) => p.value === b.priority)?.weight ?? 0
        return (wA - wB) * order
      }
      case 'dueDate': {
        const dA = a.dueDate || '9999-12-31'
        const dB = b.dueDate || '9999-12-31'
        return dA.localeCompare(dB) * order
      }
      case 'title':
        return a.title.localeCompare(b.title) * order
      case 'updatedAt':
        return a.updatedAt.localeCompare(b.updatedAt) * order
      case 'createdAt':
      default:
        return a.createdAt.localeCompare(b.createdAt) * order
    }
  })

  return result
})

/** 看板列任务 */
const kanbanTasks = computed(() => {
  const map: Record<TaskStatus, Task[]> = {
    todo: [],
    in_progress: [],
    done: [],
    archived: [],
  }
  taskStore.tasks.forEach((t) => {
    map[t.status].push(t)
  })
  return map
})

/** 日历热力图数据 - 最近 12 周 */
const heatmapData = computed(() => {
  const today = new Date()
  const days: { date: string; count: number; isFuture: boolean }[] = []

  // 从 12 周前的周日开始
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 83) // 12 * 7 - 1 = 83
  // 调整到周日
  const dayOfWeek = startDate.getDay()
  startDate.setDate(startDate.getDate() - dayOfWeek)

  // 构建番茄钟完成数映射
  const pomodoroMap = new Map<string, number>()
  taskStore.tasks.forEach((t) => {
    if (t.actualPomodoros > 0 && t.updatedAt) {
      const dateKey = t.updatedAt.substring(0, 10)
      pomodoroMap.set(dateKey, (pomodoroMap.get(dateKey) || 0) + t.actualPomodoros)
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

/** 获取优先级信息 */
function getPriorityInfo(priority: Priority) {
  return PRIORITIES.find((p) => p.value === priority) || PRIORITIES[1]
}

/** 获取状态信息 */
function getStatusInfo(status: TaskStatus) {
  return STATUSES.find((s) => s.value === status) || STATUSES[0]
}

/** 检查是否过期 */
function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  return dueDate < formatDate(new Date())
}

/** 检查是否即将到期（3天内） */
function isDueSoon(dueDate: string | null): boolean {
  if (!dueDate) return false
  const due = new Date(dueDate)
  const now = new Date()
  const diff = due.getTime() - now.getTime()
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000
}

// ---- 方法 ----

/** 打开新建表单 */
function openNewTask() {
  editingTask.value = null
  form.value = {
    title: '',
    description: '',
    status: statusFilter.value !== 'all' ? statusFilter.value : 'todo',
    priority: 'medium',
    estimatedPomodoros: 1,
    tags: [],
    dueDate: '',
  }
  tagInput.value = ''
  formError.value = ''
  showForm.value = true
}

/** 打开编辑表单 */
function openEditTask(task: Task) {
  editingTask.value = task
  form.value = {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    estimatedPomodoros: task.estimatedPomodoros,
    tags: [...task.tags],
    dueDate: task.dueDate || '',
  }
  tagInput.value = ''
  formError.value = ''
  showForm.value = true
}

/** 关闭表单 */
function closeForm() {
  showForm.value = false
  editingTask.value = null
}

/** 添加标签 */
function addTag() {
  const tag = tagInput.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
  }
  tagInput.value = ''
}

/** 移除标签 */
function removeTag(tag: string) {
  form.value.tags = form.value.tags.filter((t) => t !== tag)
}

/** 处理标签输入回车 */
function onTagInputKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    addTag()
  }
}

/** 保存任务 */
async function saveTask() {
  if (!form.value.title.trim()) {
    formError.value = '任务标题不能为空'
    return
  }

  const input: CreateTaskInput = {
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    priority: form.value.priority,
    estimatedPomodoros: form.value.estimatedPomodoros,
    tags: [...form.value.tags],
    dueDate: form.value.dueDate || null,
  }

  if (editingTask.value) {
    // 更新
    const updateInput: UpdateTaskInput = {
      ...input,
      status: form.value.status,
    }
    await taskStore.updateTask(editingTask.value.id, updateInput)
  } else {
    // 新建
    await taskStore.createTask(input)
  }

  closeForm()
}

/** 切换完成状态 */
async function toggleDone(task: Task) {
  const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done'
  await taskStore.updateTask(task.id, { status: newStatus })
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
    if (expandedTaskId.value === deletingTaskId.value) {
      expandedTaskId.value = null
    }
  }
  cancelDelete()
}

/** 展开/折叠任务 */
function toggleExpand(taskId: string) {
  expandedTaskId.value = expandedTaskId.value === taskId ? null : taskId
}

/** 双击进入内联编辑 */
function startInlineEdit(task: Task) {
  inlineEditingId.value = task.id
  inlineEditTitle.value = task.title
}

/** 保存内联编辑 */
async function saveInlineEdit(task: Task) {
  const newTitle = inlineEditTitle.value.trim()
  if (newTitle && newTitle !== task.title) {
    await taskStore.updateTask(task.id, { title: newTitle })
  }
  inlineEditingId.value = null
}

/** 取消内联编辑 */
function cancelInlineEdit() {
  inlineEditingId.value = null
}

/** 内联编辑按键处理 */
function onInlineEditKeydown(e: KeyboardEvent, task: Task) {
  if (e.key === 'Enter') {
    e.preventDefault()
    saveInlineEdit(task)
  } else if (e.key === 'Escape') {
    cancelInlineEdit()
  }
}

/** 看板中移动任务到另一列 */
async function moveTask(task: Task, newStatus: TaskStatus) {
  if (task.status !== newStatus) {
    await taskStore.updateTask(task.id, { status: newStatus })
  }
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

/** 快速选择默认标签 */
function selectDefaultTag(tag: string) {
  if (!form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
  }
}

// ---- 键盘快捷键 ----
function handleKeyDown(e: KeyboardEvent) {
  const target = e.target as HTMLElement
  const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

  // N 键新建任务（非输入状态）
  if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !isInput && !showForm.value) {
    e.preventDefault()
    openNewTask()
  }

  // Escape 关闭模态框
  if (e.key === 'Escape') {
    if (showDeleteConfirm.value) {
      cancelDelete()
    } else if (showForm.value) {
      closeForm()
    }
  }
}

// ---- 生命周期 ----
onMounted(async () => {
  await taskStore.loadTasks()
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
          <div v-if="viewMode === 'list'" key="list" class="list-view">
            <!-- 空状态 -->
            <div v-if="displayTasks.length === 0" class="empty-state">
              <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <p class="empty-title">暂无任务</p>
              <p class="empty-desc">{{ searchQuery ? '没有匹配的搜索结果' : '点击「新建任务」或按 N 键创建第一个任务' }}</p>
              <button v-if="!searchQuery" class="empty-action" @click="openNewTask">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                新建任务
              </button>
            </div>

            <!-- 任务列表 -->
            <div v-else class="task-list">
              <TransitionGroup name="task-item">
                <div
                  v-for="task in displayTasks"
                  :key="task.id"
                  class="task-card"
                  :class="{
                    expanded: expandedTaskId === task.id,
                    done: task.status === 'done',
                    overdue: isOverdue(task.dueDate) && task.status !== 'done',
                  }"
                >
                  <!-- 任务主行 -->
                  <div class="task-row" @click="toggleExpand(task.id)">
                    <!-- 复选框 -->
                    <button
                      class="task-checkbox"
                      :class="{ checked: task.status === 'done' }"
                      @click.stop="toggleDone(task)"
                      :title="task.status === 'done' ? '标记为未完成' : '标记为完成'"
                    >
                      <svg v-if="task.status === 'done'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </button>

                    <!-- 标题 -->
                    <div class="task-title-area" @dblclick.stop="startInlineEdit(task)">
                      <!-- 内联编辑模式 -->
                      <input
                        v-if="inlineEditingId === task.id"
                        v-model="inlineEditTitle"
                        class="inline-edit-input"
                        @blur="saveInlineEdit(task)"
                        @keydown="onInlineEditKeydown($event, task)"
                        @click.stop
                        ref="inlineEditInput"
                      />
                      <!-- 显示模式 -->
                      <span v-else class="task-title" :class="{ 'line-through opacity-50': task.status === 'done' }">
                        {{ task.title }}
                      </span>
                    </div>

                    <!-- 优先级徽章 -->
                    <span
                      class="priority-badge"
                      :style="{ backgroundColor: getPriorityInfo(task.priority).color + '20', color: getPriorityInfo(task.priority).color }"
                    >
                      {{ getPriorityInfo(task.priority).label }}
                    </span>

                    <!-- 标签 -->
                    <div class="task-tags">
                      <span v-for="tag in task.tags.slice(0, 2)" :key="tag" class="tag-chip">
                        {{ tag }}
                      </span>
                      <span v-if="task.tags.length > 2" class="tag-more">
                        +{{ task.tags.length - 2 }}
                      </span>
                    </div>

                    <!-- 番茄数 -->
                    <span v-if="task.actualPomodoros > 0 || task.estimatedPomodoros > 0" class="pomodoro-count">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
                        <circle cx="12" cy="13" r="9" fill="#F85149" opacity="0.8"/>
                        <rect x="9" y="1" width="6" height="4" rx="1" fill="#3FB950" opacity="0.7"/>
                        <path d="M12 7v3M9 10l3 3 3-3" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                      </svg>
                      {{ task.actualPomodoros }}/{{ task.estimatedPomodoros }}
                    </span>

                    <!-- 截止日期 -->
                    <span
                      v-if="task.dueDate"
                      class="due-date"
                      :class="{
                        overdue: isOverdue(task.dueDate) && task.status !== 'done',
                        'due-soon': isDueSoon(task.dueDate) && task.status !== 'done',
                      }"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      {{ formatFriendlyDate(task.dueDate) }}
                    </span>

                    <!-- 操作按钮 -->
                    <div class="task-actions">
                      <button class="action-btn" title="编辑" @click.stop="openEditTask(task)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button class="action-btn delete-btn" title="删除" @click.stop="confirmDelete(task.id)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- 展开详情 -->
                  <Transition name="expand">
                    <div v-if="expandedTaskId === task.id" class="task-detail">
                      <div class="detail-section">
                        <div class="detail-label">状态</div>
                        <span class="status-badge" :style="{ color: getStatusInfo(task.status).color, backgroundColor: getStatusInfo(task.status).color + '15' }">
                          {{ getStatusInfo(task.status).label }}
                        </span>
                      </div>
                      <div class="detail-section">
                        <div class="detail-label">描述</div>
                        <p class="detail-desc">{{ task.description || '暂无描述' }}</p>
                      </div>
                      <div v-if="task.tags.length > 0" class="detail-section">
                        <div class="detail-label">标签</div>
                        <div class="detail-tags">
                          <span v-for="tag in task.tags" :key="tag" class="tag-chip">{{ tag }}</span>
                        </div>
                      </div>
                      <div class="detail-meta">
                        <span>创建于 {{ formatRelativeTime(task.createdAt) }}</span>
                        <span>更新于 {{ formatRelativeTime(task.updatedAt) }}</span>
                      </div>
                    </div>
                  </Transition>
                </div>
              </TransitionGroup>
            </div>
          </div>

          <!-- ==================== 看板视图 ==================== -->
          <div v-else-if="viewMode === 'kanban'" key="kanban" class="kanban-view">
            <div class="kanban-board">
              <div
                v-for="col in kanbanColumns"
                :key="col.status"
                class="kanban-column"
              >
                <!-- 列头 -->
                <div class="column-header" :style="{ borderTopColor: col.color }">
                  <div class="column-title-row">
                    <span class="column-dot" :style="{ backgroundColor: col.color }" />
                    <span class="column-title">{{ col.label }}</span>
                    <span class="column-count">{{ kanbanTasks[col.status].length }}</span>
                  </div>
                </div>

                <!-- 列内容 -->
                <div class="column-body">
                  <!-- 空列 -->
                  <div v-if="kanbanTasks[col.status].length === 0" class="column-empty">
                    暂无任务
                  </div>

                  <!-- 任务卡片 -->
                  <TransitionGroup name="kanban-card">
                    <div
                      v-for="task in kanbanTasks[col.status]"
                      :key="task.id"
                      class="kanban-task-card"
                      @click="openEditTask(task)"
                    >
                      <div class="kanban-card-header">
                        <span
                          class="kanban-priority-dot"
                          :style="{ backgroundColor: getPriorityInfo(task.priority).color }"
                          :title="getPriorityInfo(task.priority).label"
                        />
                        <span class="kanban-card-title" :class="{ 'line-through opacity-50': task.status === 'done' }">
                          {{ task.title }}
                        </span>
                      </div>

                      <div class="kanban-card-footer">
                        <!-- 标签 -->
                        <div v-if="task.tags.length > 0" class="kanban-card-tags">
                          <span v-for="tag in task.tags.slice(0, 2)" :key="tag" class="tag-chip small">
                            {{ tag }}
                          </span>
                        </div>

                        <!-- 番茄数 -->
                        <span class="kanban-pomodoro">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
                            <circle cx="12" cy="13" r="9" fill="#F85149" opacity="0.8"/>
                            <rect x="9" y="1" width="6" height="4" rx="1" fill="#3FB950" opacity="0.7"/>
                          </svg>
                          {{ task.actualPomodoros }}/{{ task.estimatedPomodoros }}
                        </span>
                      </div>

                      <!-- 截止日期 -->
                      <div v-if="task.dueDate" class="kanban-card-due">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {{ formatFriendlyDate(task.dueDate) }}
                      </div>

                      <!-- 快速操作 -->
                      <div class="kanban-card-actions">
                        <button
                          v-for="targetCol in kanbanColumns.filter(c => c.status !== col.status)"
                          :key="targetCol.status"
                          class="kanban-move-btn"
                          :title="'移动到 ' + targetCol.label"
                          @click.stop="moveTask(task, targetCol.status)"
                        >
                          {{ targetCol.label }}
                        </button>
                      </div>
                    </div>
                  </TransitionGroup>
                </div>
              </div>
            </div>
          </div>

          <!-- ==================== 日历热力图视图 ==================== -->
          <div v-else-if="viewMode === 'calendar'" key="calendar" class="calendar-view">
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
        </Transition>
      </div>
    </div>

    <!-- ==================== 任务表单模态框 ==================== -->
    <Transition name="modal">
      <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
        <div class="modal-panel">
          <!-- 模态框头部 -->
          <div class="modal-header">
            <h2 class="modal-title">{{ editingTask ? '编辑任务' : '新建任务' }}</h2>
            <button class="modal-close" @click="closeForm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- 表单内容 -->
          <div class="modal-body">
            <!-- 错误提示 -->
            <div v-if="formError" class="form-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ formError }}
            </div>

            <!-- 标题 -->
            <div class="form-group">
              <label class="form-label">
                标题 <span class="required">*</span>
              </label>
              <input
                v-model="form.title"
                type="text"
                class="form-input"
                placeholder="输入任务标题..."
                maxlength="200"
                @keydown.enter="saveTask"
              />
            </div>

            <!-- 描述 -->
            <div class="form-group">
              <label class="form-label">描述</label>
              <textarea
                v-model="form.description"
                class="form-textarea"
                placeholder="添加任务描述（支持 Markdown）..."
                rows="4"
              />
            </div>

            <!-- 状态 & 优先级 -->
            <div class="form-row">
              <div class="form-group half">
                <label class="form-label">状态</label>
                <select v-model="form.status" class="form-select">
                  <option v-for="s in STATUSES" :key="s.value" :value="s.value">
                    {{ s.label }}
                  </option>
                </select>
              </div>
              <div class="form-group half">
                <label class="form-label">优先级</label>
                <select v-model="form.priority" class="form-select">
                  <option v-for="p in PRIORITIES" :key="p.value" :value="p.value">
                    {{ p.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- 预估番茄数 & 截止日期 -->
            <div class="form-row">
              <div class="form-group half">
                <label class="form-label">预估番茄数</label>
                <input
                  v-model.number="form.estimatedPomodoros"
                  type="number"
                  class="form-input"
                  min="1"
                  max="20"
                />
              </div>
              <div class="form-group half">
                <label class="form-label">截止日期</label>
                <input
                  v-model="form.dueDate"
                  type="date"
                  class="form-input"
                />
              </div>
            </div>

            <!-- 标签 -->
            <div class="form-group">
              <label class="form-label">标签</label>
              <div class="tags-input-area">
                <div class="tags-chips">
                  <span
                    v-for="tag in form.tags"
                    :key="tag"
                    class="tag-chip editable"
                  >
                    {{ tag }}
                    <button class="tag-remove" @click="removeTag(tag)">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </span>
                  <input
                    v-model="tagInput"
                    type="text"
                    class="tag-input"
                    placeholder="输入标签后回车..."
                    @keydown="onTagInputKeydown"
                  />
                </div>
                <!-- 快速标签 -->
                <div class="quick-tags">
                  <span class="quick-tags-label">快速添加：</span>
                  <button
                    v-for="tag in DEFAULT_TAGS.filter(t => !form.tags.includes(t))"
                    :key="tag"
                    class="quick-tag-btn"
                    @click="selectDefaultTag(tag)"
                  >
                    + {{ tag }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 模态框底部 -->
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeForm">取消</button>
            <button class="btn btn-primary" @click="saveTask">
              {{ editingTask ? '保存修改' : '创建任务' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ==================== 删除确认模态框 ==================== -->
    <Transition name="modal">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDelete">
        <div class="modal-panel small">
          <div class="modal-header">
            <h2 class="modal-title">确认删除</h2>
            <button class="modal-close" @click="cancelDelete">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="delete-message">确定要删除这个任务吗？此操作无法撤销。</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="cancelDelete">取消</button>
            <button class="btn btn-danger" @click="executeDelete">删除</button>
          </div>
        </div>
      </div>
    </Transition>
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
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.4;
  pointer-events: none;
}

.bg-orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(88, 166, 255, 0.1) 0%, transparent 70%);
  top: -20%;
  right: -10%;
  animation: orb-drift-1 25s ease-in-out infinite;
}

.bg-orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(136, 100, 255, 0.08) 0%, transparent 70%);
  bottom: -10%;
  left: -5%;
  animation: orb-drift-2 30s ease-in-out infinite;
}

@keyframes orb-drift-1 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-40px, 30px); }
}

@keyframes orb-drift-2 {
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
  padding: 0 28px 28px;
}

/* ==================== 列表视图 ==================== */
.list-view {
  min-height: 100%;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ---- 任务卡片 ---- */
.task-card {
  background: var(--glass-bg);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  transition: all var(--transition-fast);
  overflow: hidden;
}

.task-card:hover {
  border-color: var(--accent-dim);
  box-shadow: 0 0 20px var(--accent-glow), var(--glass-shadow);
}

.task-card.expanded {
  border-color: var(--accent);
  box-shadow: 0 0 24px var(--accent-glow), var(--glass-shadow);
}

.task-card.done {
  opacity: 0.7;
}

.task-card.overdue {
  border-left: 3px solid var(--danger);
}

/* ---- 任务主行 ---- */
.task-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.task-row:hover {
  background: var(--hover-bg);
}

/* ---- 复选框 ---- */
.task-checkbox {
  width: 20px;
  height: 20px;
  min-width: 20px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  color: transparent;
}

.task-checkbox:hover {
  border-color: var(--accent);
  background: var(--active-bg);
}

.task-checkbox.checked {
  border-color: var(--success);
  background: var(--success);
  color: white;
}

/* ---- 标题区域 ---- */
.task-title-area {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 0.9rem;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.inline-edit-input {
  width: 100%;
  padding: 4px 8px;
  font-size: 0.9rem;
  border-radius: var(--radius-md);
  background: var(--bg);
  border: 1px solid var(--accent);
  color: var(--text);
  outline: none;
  box-shadow: 0 0 0 3px var(--active-bg);
}

/* ---- 优先级徽章 ---- */
.priority-badge {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ---- 标签 ---- */
.task-tags {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
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

.tag-chip.editable {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px 2px 8px;
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.tag-remove:hover {
  color: var(--danger);
  background: color-mix(in srgb, var(--danger) 15%, transparent);
}

.tag-more {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  white-space: nowrap;
}

/* ---- 番茄数 ---- */
.pomodoro-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ---- 截止日期 ---- */
.due-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}

.due-date.overdue {
  color: var(--danger);
}

.due-date.due-soon {
  color: var(--warning);
}

/* ---- 操作按钮 ---- */
.task-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity var(--transition-fast);
  flex-shrink: 0;
}

.task-card:hover .task-actions,
.task-card.expanded .task-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--hover-bg);
  color: var(--text);
}

.action-btn.delete-btn:hover {
  background: color-mix(in srgb, var(--danger) 15%, transparent);
  color: var(--danger);
}

/* ---- 展开详情 ---- */
.task-detail {
  padding: 0 16px 16px 48px;
  border-top: 1px solid var(--glass-border);
  animation: expand-in 0.2s ease-out;
}

@keyframes expand-in {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 300px;
  }
}

.detail-section {
  margin-top: 12px;
}

.detail-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.detail-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.6;
  white-space: pre-wrap;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.detail-meta {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--glass-border);
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

/* ==================== 看板视图 ==================== */
.kanban-view {
  min-height: 100%;
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  min-height: 500px;
}

.kanban-column {
  display: flex;
  flex-direction: column;
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  overflow: hidden;
}

.column-header {
  padding: 14px 16px;
  border-top: 3px solid;
  background: color-mix(in srgb, var(--glass-bg) 60%, transparent);
  backdrop-filter: blur(8px);
  flex-shrink: 0;
}

.column-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.column-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
}

.column-count {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  background: var(--hover-bg);
  padding: 1px 7px;
  border-radius: 10px;
  margin-left: auto;
}

.column-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.column-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  font-size: 0.8rem;
  color: var(--text-tertiary);
  text-align: center;
}

/* ---- 看板任务卡片 ---- */
.kanban-task-card {
  padding: 12px;
  background: var(--glass-bg);
  backdrop-filter: blur(8px) saturate(140%);
  -webkit-backdrop-filter: blur(8px) saturate(140%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.kanban-task-card:hover {
  border-color: var(--accent-dim);
  box-shadow: 0 0 16px var(--accent-glow), var(--glass-shadow);
  transform: translateY(-2px);
}

.kanban-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.kanban-priority-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.kanban-card-title {
  font-size: 0.85rem;
  color: var(--text);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kanban-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  gap: 8px;
}

.kanban-card-tags {
  display: flex;
  gap: 4px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.kanban-pomodoro {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.7rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.kanban-card-due {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 0.7rem;
  color: var(--text-tertiary);
}

.kanban-card-actions {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--glass-border);
  flex-wrap: wrap;
}

.kanban-move-btn {
  padding: 2px 8px;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-tertiary);
  font-size: 0.65rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.kanban-move-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--active-bg);
  box-shadow: 0 0 8px var(--accent-glow);
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

.tooltip-date {
  display: block;
  color: var(--text-tertiary);
  font-size: 0.65rem;
  margin-top: 2px;
}

/* ---- 统计摘要 ---- */
.heatmap-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-card {
  background: var(--glass-bg);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  padding: 16px;
  text-align: center;
  transition: all var(--transition-fast);
}

.stat-card:hover {
  border-color: var(--accent-dim);
  transform: translateY(-2px);
  box-shadow: 0 0 20px var(--accent-glow), var(--glass-shadow);
}

.stat-card .stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.stat-card .stat-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 4px;
}

/* ==================== 空状态 ==================== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-state.small {
  padding: 40px 20px;
}

.empty-icon {
  margin-bottom: 16px;
  color: var(--text-tertiary);
}

.empty-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin-bottom: 20px;
}

.empty-action {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.empty-action:hover {
  background: var(--accent);
  color: white;
  box-shadow: 0 0 20px var(--accent-glow);
}

/* ==================== 模态框 ==================== */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 20px;
}

.modal-panel {
  width: 100%;
  max-width: 560px;
  max-height: 85vh;
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--glass-shadow), 0 20px 60px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.modal-panel.small {
  max-width: 400px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--glass-border);
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background: var(--hover-bg);
  color: var(--text);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--glass-border);
  flex-shrink: 0;
}

/* ---- 表单 ---- */
.form-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: color-mix(in srgb, var(--danger) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--danger) 30%, transparent);
  border-radius: var(--radius-lg);
  color: var(--danger);
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group.half {
  flex: 1;
  min-width: 0;
}

.form-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.required {
  color: var(--danger);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  font-size: 0.85rem;
  border-radius: var(--radius-lg);
  background: var(--bg);
  border: 1px solid var(--glass-border);
  color: var(--text);
  outline: none;
  transition: all var(--transition-fast);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--active-bg), 0 0 15px var(--accent-glow);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.6;
  font-family: inherit;
}

.form-row {
  display: flex;
  gap: 16px;
}

/* ---- 标签输入 ---- */
.tags-input-area {
  width: 100%;
}

.tags-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px 8px;
  background: var(--bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  min-height: 38px;
  align-items: center;
  transition: all var(--transition-fast);
}

.tags-chips:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--active-bg), 0 0 15px var(--accent-glow);
}

.tag-input {
  flex: 1;
  min-width: 100px;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 0.85rem;
  outline: none;
  padding: 2px 4px;
}

.tag-input::placeholder {
  color: var(--text-tertiary);
}

.quick-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.quick-tags-label {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  margin-right: 4px;
}

.quick-tag-btn {
  padding: 2px 8px;
  border: 1px dashed var(--glass-border);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-tertiary);
  font-size: 0.7rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.quick-tag-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  border-style: solid;
  background: var(--active-bg);
  box-shadow: 0 0 8px var(--accent-glow);
}

/* ---- 按钮 ---- */
.btn {
  padding: 8px 20px;
  border-radius: var(--radius-lg);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.btn-secondary {
  background: var(--bg);
  color: var(--text-secondary);
  border: 1px solid var(--glass-border);
}

.btn-secondary:hover {
  background: var(--hover-bg);
  color: var(--text);
  border-color: var(--text-tertiary);
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.btn-primary:hover {
  filter: brightness(1.1);
  box-shadow: 0 0 20px var(--accent-glow), 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-danger {
  background: var(--danger);
  color: white;
}

.btn-danger:hover {
  filter: brightness(1.1);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--danger) 30%, transparent);
}

.delete-message {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
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

/* 任务列表项 */
.task-item-enter-active {
  transition: all var(--transition-normal);
}

.task-item-leave-active {
  transition: all var(--transition-fast);
}

.task-item-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.task-item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.task-item-move {
  transition: transform var(--transition-normal);
}

/* 看板卡片 */
.kanban-card-enter-active {
  transition: all var(--transition-normal);
}

.kanban-card-leave-active {
  transition: all var(--transition-fast);
}

.kanban-card-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.kanban-card-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 展开动画 */
.expand-enter-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

/* 模态框 */
.modal-enter-active {
  transition: opacity var(--transition-normal);
}

.modal-leave-active {
  transition: opacity var(--transition-fast);
}

.modal-enter-active .modal-panel {
  transition: all var(--transition-spring);
}

.modal-leave-active .modal-panel {
  transition: all var(--transition-fast);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-panel {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.modal-leave-to .modal-panel {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
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

/* ==================== 响应式 ==================== */
@media (max-width: 1024px) {
  .kanban-board {
    grid-template-columns: repeat(2, 1fr);
  }

  .heatmap-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

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

  .kanban-board {
    grid-template-columns: 1fr;
  }

  .task-row {
    flex-wrap: wrap;
    gap: 8px;
  }

  .task-actions {
    opacity: 1;
  }

  .task-tags,
  .pomodoro-count,
  .due-date {
    display: none;
  }

  .task-card.expanded .task-tags,
  .task-card.expanded .pomodoro-count,
  .task-card.expanded .due-date {
    display: flex;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .modal-panel {
    max-height: 90vh;
    margin: 10px;
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
</style>
