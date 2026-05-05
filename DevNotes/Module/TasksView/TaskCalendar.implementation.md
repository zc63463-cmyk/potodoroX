# TaskCalendar + TaskDetailModal 工程实现笔记

> **日期**: 2026-05-05
> **关联文档**: [功能迭代笔记](TaskCalendar.addition01.md)、[设计 Spec](../../specs/2026-05-05-session-list-grouping-design.md)

---

## 1. 改动文件总览

| 文件 | 改动类型 | 说明 |
|------|---------|------|
| `src/components/TaskCalendarPanel.vue` | 修改 | 每日详情改为居中 Modal、任务日汇总、自动滚动 |
| `src/components/TaskDetailModal.vue` | 修改 | sessions Tab 日期分组折叠 + session plan/completion 编辑 |
| `src/views/TasksView.vue` | 修改 | TaskCalendarPanel 添加 `@open-task-detail` 事件监听 |

---

## 2. TaskCalendarPanel.vue — 关键改动

### 2.1 自动滚动到最新数据

```typescript
onMounted(() => {
  const wrapper = document.querySelector('.heatmap-scroll-wrapper') as HTMLElement | null
  if (wrapper) {
    wrapper.scrollLeft = wrapper.scrollWidth
  }
})
```

**注意**: 使用 `document.querySelector` 直接操作 DOM，因为 `ref` 无法跨条件渲染提前获取。

### 2.2 每日详情改为居中 Modal

- `<Transition name="slide-up">` → `<Transition name="modal">`
- `.day-detail-overlay`: `align-items: flex-end` → `align-items: center`，背景加深到 `rgba(0,0,0,0.5)` + `blur(8px)`
- `.day-detail-panel`: 完整圆角 `var(--radius-lg)`、阴影升级、最大宽高限制、动画改为 `scale(0.96) translateY(10px)`

### 2.3 任务日汇总 (`dayTaskSummaries`)

```typescript
const dayTaskSummaries = computed(() => {
  if (!selectedDay.value) return []
  const map = new Map<string | null, DayTaskSummary>()
  for (const s of selectedDay.value.sessions) {
    const existing = map.get(s.taskId)
    if (existing) {
      existing.count++
      existing.totalDuration += s.duration || 0
    } else {
      map.set(s.taskId, { taskId: s.taskId, taskTitle: getTaskTitle(s.taskId), count: 1, totalDuration: s.duration || 0 })
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalDuration - a.totalDuration)
})
```

### 2.4 Emit 事件

```typescript
const emit = defineEmits<{
  (e: 'openTaskDetail', task: Task): void
}>()
```

无 taskId 的 session（自由计时）显示为"未关联任务"，不可点击。

---

## 3. TaskDetailModal.vue — 关键改动

### 3.1 Session 编辑状态

```typescript
const expandedSessionId = ref<string | null>(null)           // 单开模式：当前展开的 session
const sessionEdits = ref<Map<string, { plan: string; completion: string }>>(new Map())
const sessionSavingIds = ref<Set<string>>(new Set())           // 保存中状态
const sessionSaveTimeouts = ref<Map<string, ReturnType<typeof setTimeout>>>(new Map())
```

### 3.2 日期分组折叠 (`sessionGroups`)

```typescript
const sessionGroups = computed(() => {
  const groups = new Map<string, Session[]>()
  for (const s of taskSessions.value) {
    const date = s.startedAt.substring(0, 10)
    if (!groups.has(date)) groups.set(date, [])
    groups.get(date)!.push(s)
  }
  const arr = Array.from(groups.entries()).map(([date, sessions]) => ({
    date,
    sessions: sessions.sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    totalCount: sessions.length,
    totalDuration: sessions.reduce((sum, s) => sum + (s.duration || 0), 0),
  }))
  arr.sort((a, b) => b.date.localeCompare(a.date))
  return arr
})
```

### 3.3 默认展开最近 3 天

```typescript
watch(() => props.visible, (visible) => {
  if (visible) {
    activeTab.value = props.initialTab || 'plan'
    const groups = sessionGroups.value
    expandedDateGroups.value = new Set(groups.slice(0, 3).map((g) => g.date))
  } else {
    expandedSessionId.value = null
    expandedDateGroups.value.clear()
  }
})
```

### 3.4 自动保存机制

- 800ms debounce（与 task plan/completion 完全一致）
- `close()` 时 flush 所有 pending saves
- 保存状态提示："保存中..." / "有未保存的更改" / "已自动保存"

### 3.5 关闭时清理状态

```typescript
watch(() => props.task, (task) => {
  if (task) {
    planText.value = task.plan
    completionText.value = task.completion
  }
  expandedSessionId.value = null
  sessionEdits.value.clear()
  sessionSavingIds.value.clear()
  sessionSaveTimeouts.value.forEach((t) => clearTimeout(t))
  sessionSaveTimeouts.value.clear()
}, { immediate: true })
```

---

## 4. TasksView.vue — 事件连接

```vue
<TaskCalendarPanel
  v-else-if="viewMode === 'calendar'"
  key="calendar"
  @open-task-detail="(task: Task) => openTaskDetail(task, 'sessions')"
/>
```

---

## 5. CSS 新增样式

### TaskCalendarPanel
- `.task-summary-item` — 任务汇总条目卡片
- `.task-summary-title` / `.task-summary-meta`
- `.modal-enter-active` / `.modal-leave-active` — 居中 modal 动画

### TaskDetailModal
- `.session-date-group` — 日期分组容器
- `.date-group-header` / `.date-group-body` — 日期头部与展开体
- `.group-expand-icon` — 日期组展开指示器
- `.session-body` — session 展开编辑体（带动画）
- `.detail-textarea.compact` — 紧凑 textarea（min-height: 80px）
- `.session-hint` — session 级保存提示

---

## 6. 已知边界情况

| 场景 | 处理 |
|------|------|
| 自由计时（taskId 为 null） | 显示为"未关联任务"，不可点击 |
| 无 session 的任务 | 显示空状态提示 |
| Modal 关闭时未保存 | `close()` 立即 flush 所有 pending saves |
| task 切换 | 清空所有 session 编辑状态，防止数据错乱 |
| 日期组内单 session 展开 | 单开模式：一次只展开一个 session（跨日期组也适用） |

---

## 7. 依赖关系

- `sessionStore.updateSession()` — 已存在，无需改动
- `Task` / `Session` 类型定义 — `src/types/index.ts`，`plan`/`completion` 字段已存在
- `formatDate()` — `src/utils/format`，用于日期分组
