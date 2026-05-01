// ============================================================
// PomodoroX - 常量定义
// ============================================================

import type { AppConfig, Mood, Priority, SessionType, TaskStatus, ThemeName, ViewName } from '@/types'

/** 默认应用配置 */
export const DEFAULT_CONFIG: AppConfig = {
  workDuration: 25 * 60,        // 25分钟（秒）
  shortBreakDuration: 5 * 60,   // 5分钟
  longBreakDuration: 15 * 60,   // 15分钟
  longBreakInterval: 4,          // 每4个番茄钟后长休息
  autoStartBreak: false,
  autoStartPomodoro: false,
  theme: 'dark-night',
  githubToken: '',
  githubRepo: 'pomodorox-data',
  githubOwner: '',
}

/** 计时器模式配置 */
export const TIMER_MODES: Record<SessionType, { label: string; labelZh: string; color: string }> = {
  work: { label: 'Focus', labelZh: '专注', color: '#58A6FF' },
  short_break: { label: 'Short Break', labelZh: '短休息', color: '#3FB950' },
  long_break: { label: 'Long Break', labelZh: '长休息', color: '#A371F7' },
  free: { label: 'Free Timer', labelZh: '自由计时', color: '#F0883E' },
}

/** 心情选项 */
export const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'great', label: '很棒', emoji: '😄' },
  { value: 'good', label: '不错', emoji: '🙂' },
  { value: 'normal', label: '一般', emoji: '😐' },
  { value: 'bad', label: '不好', emoji: '😔' },
  { value: 'terrible', label: '很差', emoji: '😢' },
]

/** 优先级选项 */
export const PRIORITIES: { value: Priority; label: string; color: string; weight: number }[] = [
  { value: 'low', label: '低', color: '#8B949E', weight: 0 },
  { value: 'medium', label: '中', color: '#58A6FF', weight: 1 },
  { value: 'high', label: '高', color: '#F0883E', weight: 2 },
  { value: 'urgent', label: '紧急', color: '#F85149', weight: 3 },
]

/** 任务状态选项 */
export const STATUSES: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'todo', label: '待办', color: '#8B949E' },
  { value: 'in_progress', label: '进行中', color: '#58A6FF' },
  { value: 'done', label: '已完成', color: '#3FB950' },
  { value: 'archived', label: '已归档', color: '#484F58' },
]

/** 视图配置 */
export const VIEWS: { name: ViewName; label: string; icon: string; shortcut: string }[] = [
  { name: 'timer', label: '计时器', icon: '⏱️', shortcut: 'Ctrl+1' },
  { name: 'tasks', label: '任务', icon: '📋', shortcut: 'Ctrl+2' },
  { name: 'reflections', label: '反思', icon: '💭', shortcut: 'Ctrl+3' },
  { name: 'stats', label: '统计', icon: '📊', shortcut: 'Ctrl+4' },
  { name: 'settings', label: '设置', icon: '⚙️', shortcut: 'Ctrl+5' },
]

/** 主题配置 */
export const THEMES: { name: ThemeName; label: string; description: string }[] = [
  { name: 'dark-night', label: '暗夜', description: '深色主题，适合夜间使用' },
  { name: 'morning-mist', label: '晨雾', description: '紫蓝色调，柔和护眼' },
  { name: 'daylight', label: '日光', description: '浅色主题，明亮清晰' },
  { name: 'custom', label: '自定义', description: '自定义主题配色' },
]

/** 主题颜色变量 */
export const THEME_COLORS: Record<ThemeName, { bg: string; accent: string; surface: string; text: string; border: string }> = {
  'dark-night': {
    bg: '#0D1117',
    accent: '#58A6FF',
    surface: '#161B22',
    text: '#C9D1D9',
    border: '#30363D',
  },
  'morning-mist': {
    bg: '#1A1A2E',
    accent: '#E94560',
    surface: '#16213E',
    text: '#E0E0E0',
    border: '#2A2A4A',
  },
  daylight: {
    bg: '#F8F9FA',
    accent: '#FF6B35',
    surface: '#FFFFFF',
    text: '#24292F',
    border: '#D0D7DE',
  },
  custom: {
    bg: '#0D1117',
    accent: '#58A6FF',
    surface: '#161B22',
    text: '#C9D1D9',
    border: '#30363D',
  },
}

/** 数据库文件名 */
export const DB_FILENAME = 'pomodorox.db'

/** Store 文件名 */
export const STORE_FILENAME = 'pomodorox-settings.json'

/** GitHub 同步目录 */
export const GITHUB_SYNC_DIR = 'pomodorox-sync'

/** 日期格式 */
export const DATE_FORMAT = {
  date: 'YYYY-MM-DD',
  datetime: 'YYYY-MM-DD HH:mm:ss',
  time: 'HH:mm:ss',
  month: 'YYYY-MM',
} as const

/** 计时器更新间隔（毫秒） */
export const TIMER_INTERVAL_MS = 100

/** 通知超时（毫秒） */
export const NOTIFICATION_TIMEOUT_MS = 3000

/** 常用标签 */
export const DEFAULT_TAGS = [
  '工作',
  '学习',
  '阅读',
  '运动',
  '创作',
  '会议',
  '个人',
  '健康',
]

/** 一天的毫秒数 */
export const DAY_MS = 24 * 60 * 60 * 1000

/** 一周的毫秒数 */
export const WEEK_MS = 7 * DAY_MS
