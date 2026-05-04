// ============================================================
// PomodoroX - 类型定义
// ============================================================

/** 任务优先级 */
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

/** 任务状态 */
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'archived'

/** 心情 */
export type Mood = 'great' | 'good' | 'normal' | 'bad' | 'terrible'

/** 会话类型 */
export type SessionType = 'work' | 'short_break' | 'long_break' | 'free'

/** 视图类型 */
export type ViewName = 'timer' | 'tasks' | 'reflections' | 'stats' | 'settings'

/** 主题类型 */
export type ThemeName = 'dark-night' | 'morning-mist' | 'daylight' | 'custom'

/** 任务实体 */
export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  estimatedPomodoros: number
  actualPomodoros: number
  tags: string[]
  dueDate: string | null
  plan: string
  completion: string
  createdAt: string
  updatedAt: string
  synced: boolean
}

/** 新建任务（不含自动生成字段） */
export type CreateTaskInput = Pick<Task, 'title' | 'description' | 'priority' | 'estimatedPomodoros' | 'tags' | 'dueDate' | 'plan' | 'completion'>

/** 更新任务（部分字段） */
export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdAt' | 'synced'>>

/** 反思实体 */
export interface Reflection {
  id: string
  date: string
  content: string
  mood: Mood
  relatedTaskIds: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
  synced: boolean
}

/** 新建反思 */
export type CreateReflectionInput = Pick<Reflection, 'date' | 'content' | 'mood' | 'relatedTaskIds' | 'tags'>

/** 更新反思 */
export type UpdateReflectionInput = Partial<Omit<Reflection, 'id' | 'createdAt' | 'synced'>>

/** 番茄钟会话实体 */
export interface Session {
  id: string
  taskId: string | null
  type: SessionType
  duration: number
  completed: boolean
  startedAt: string
  endedAt: string | null
  plan: string
  completion: string
  synced: boolean
}

/** 新建会话 */
export type CreateSessionInput = Pick<Session, 'taskId' | 'type' | 'duration' | 'completed' | 'startedAt' | 'plan' | 'completion'>

/** 应用配置 */
export interface AppConfig {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  freeDuration: number
  longBreakInterval: number
  autoStartBreak: boolean
  autoStartPomodoro: boolean
  theme: ThemeName
  githubToken: string
  githubRepo: string
  githubOwner: string
  weeklyFastForwardQuota: number
  weeklyFastForwardUsed: number
  weeklyFastForwardResetAt: string
}

/** 同步状态 */
export interface SyncStatus {
  lastSyncAt: string | null
  pendingCount: number
  isSyncing: boolean
}

/** 任务筛选条件 */
export interface TaskFilter {
  status?: TaskStatus
  priority?: Priority
  tag?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

/** 反思筛选条件 */
export interface ReflectionFilter {
  dateFrom?: string
  dateTo?: string
  mood?: Mood
  tag?: string
}

/** 任务统计 */
export interface TaskStats {
  total: number
  todo: number
  inProgress: number
  done: number
  archived: number
  totalEstimated: number
  totalActual: number
}

/** 排序选项 */
export type SortField = 'createdAt' | 'updatedAt' | 'priority' | 'dueDate' | 'title'
export type SortOrder = 'asc' | 'desc'

export interface SortOption {
  field: SortField
  order: SortOrder
}

/** Toast 通知类型 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'
