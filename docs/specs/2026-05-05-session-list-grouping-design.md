# Session 列表分组与每日详情汇总设计

> **日期**: 2026-05-05
> **组件**: `TaskCalendarPanel.vue`, `TaskDetailModal.vue`
> **类型**: 功能增强

## 背景

当前存在两个问题：
1. **每日详情 Modal 展示粒度太细**：同一任务在同一天产生多个 session，逐条列出导致重复点击（点击任何一个 session 都进入同一个 TaskDetailModal）。
2. **TaskDetailModal sessions Tab 列表无限增长**：长期任务历经数月会产生数百条 session，无分组、无折叠，浏览和编辑负担极大。

## 目标

1. **每日详情 Modal 按任务汇总**：将当天的 session 按任务聚合，一行展示该任务当日总次数和总时长，点击后打开对应任务的 TaskDetailModal。
2. **TaskDetailModal sessions Tab 按日期分组折叠**：将 session 列表按日期分组，默认折叠历史日期、展开最近日期，解决长列表的信息维护问题。

---

## 方案一：每日详情 Modal — 任务日汇总

### 改动文件
`src/components/TaskCalendarPanel.vue`

### 数据结构
```typescript
interface DayTaskSummary {
  taskId: string | null
  taskTitle: string
  sessionCount: number
  totalDurationSeconds: number
}
```

### 交互
- 将 `selectedDay.sessions`（session[]）在 UI 层聚合成 `DayTaskSummary[]`
- 每个条目展示：`任务标题`、`sessionCount` 次、`totalDurationSeconds` 总时长
- 点击条目 → `emit('openTaskDetail', task)`（复用现有 handler）
- 无 taskId 的 session（自由计时）归为一组，标题显示"自由计时"，同样可点击（但可能无对应 task，需处理）

### 视觉
```
┌─────────────────────────────────────────┐
│  2026-05-04          2 个番茄钟    ×   │
├─────────────────────────────────────────┤
│  PomodoroX开发      2次 · 4分钟      → │
│  另一个任务         1次 · 25分钟     → │
│  自由计时           1次 · 10分钟     → │
└─────────────────────────────────────────┘
```

---

## 方案二：TaskDetailModal sessions Tab — 日期分组折叠

### 改动文件
`src/components/TaskDetailModal.vue`

### 数据结构
```typescript
interface SessionDateGroup {
  date: string          // YYYY-MM-DD
  sessions: Session[]
  totalCount: number
  totalDurationSeconds: number
}
```

### 状态
```typescript
const expandedDateGroups = ref<Set<string>>(new Set()) // 哪些日期组是展开的
```

### 交互
- 计算属性将 `taskSessions` 按 `startedAt` 日期分组，生成 `SessionDateGroup[]`
- 按日期降序排列（最新的在上面）
- **默认展开最近 3 个日期组**，其余折叠
- 点击日期头部 → 展开/折叠该日期下的所有 session
- 展开后，内部 session 保持当前的可折叠编辑卡片交互（单 session 展开编辑）

### 视觉
```
▼ 2026-05-04 (2次 · 34分钟)
  ├─ 23:08  PomodoroX开发  0分钟
  └─ 23:03  PomodoroX开发  4分钟  [可展开编辑]

▶ 2026-05-03 (5次 · 125分钟)
▶ 2026-05-02 (3次 · 75分钟)
▶ 2026-04-28 (4次 · 100分钟)
```

### 单 session 编辑
- 与现有实现一致：展开单个 session 后显示 plan/completion textarea
- 800ms debounce 自动保存
- 单开模式：一次只展开一个 session（即使在不同日期组内）

---

## 数据流

```
TaskCalendarPanel (每日详情)
  selectedDay.sessions
    → groupBy taskId
    → DayTaskSummary[]
    → 渲染为任务汇总列表
    → 点击 → emit('openTaskDetail', task)

TaskDetailModal (专注记录 Tab)
  taskSessions (该任务全部历史)
    → groupBy date (startedAt)
    → SessionDateGroup[] (降序)
    → 渲染为日期分组列表
    → 展开日期组 → 内部 session 列表
    → 点击 session 头部 → 展开该 session 编辑区
```

---

## 范围

仅修改以下两个文件，无其他文件变更：
- `src/components/TaskCalendarPanel.vue` — 每日详情 Modal UI 改为任务汇总
- `src/components/TaskDetailModal.vue` — sessions Tab 增加日期分组折叠

---

## 边界情况

- **自由计时 session（taskId 为 null）**：在每日详情中归为一组，点击不触发任何跳转（或提示"无关联任务"）
- **无 session 的任务**：保持现有空状态提示
- **单日大量 session**：日期组展开后内部仍用 scroll，不影响 Modal 整体高度
