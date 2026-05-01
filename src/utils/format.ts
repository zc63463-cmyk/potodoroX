// ============================================================
// PomodoroX - 时间格式化工具
// ============================================================

/**
 * 将秒数格式化为 MM:SS
 * @param seconds 总秒数
 * @returns 格式化后的时间字符串
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 将秒数格式化为 HH:MM:SS
 * @param seconds 总秒数
 * @returns 格式化后的时间字符串
 */
export function formatTimeWithHours(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 将分钟数格式化为可读字符串
 * @param minutes 分钟数
 * @returns 如 "1小时30分钟"
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`
  }
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hrs}小时`
  }
  return `${hrs}小时${mins}分钟`
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param date Date 对象或 ISO 字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm:ss
 * @param date Date 对象或 ISO 字符串
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const datePart = formatDate(d)
  const timePart = formatTimeOfDay(d)
  return `${datePart} ${timePart}`
}

/**
 * 格式化时间为 HH:mm:ss
 * @param date Date 对象
 * @returns 格式化后的时间字符串
 */
export function formatTimeOfDay(date: Date): string {
  const hrs = date.getHours().toString().padStart(2, '0')
  const mins = date.getMinutes().toString().padStart(2, '0')
  const secs = date.getSeconds().toString().padStart(2, '0')
  return `${hrs}:${mins}:${secs}`
}

/**
 * 获取相对时间描述
 * @param date Date 对象或 ISO 字符串
 * @returns 如 "3分钟前"、"2小时前"、"昨天"
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`
  return `${Math.floor(diffDays / 365)}年前`
}

/**
 * 格式化月份为 YYYY-MM
 * @param date Date 对象
 * @returns 格式化后的月份字符串
 */
export function formatMonth(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${year}-${month}`
}

/**
 * 获取友好日期显示
 * @param dateStr 日期字符串 (YYYY-MM-DD)
 * @returns 如 "今天"、"昨天"、"2024-01-15"
 */
export function formatFriendlyDate(dateStr: string): string {
  const today = formatDate(new Date())
  const yesterday = formatDate(new Date(Date.now() - 86400000))
  if (dateStr === today) return '今天'
  if (dateStr === yesterday) return '昨天'
  return dateStr
}

/**
 * 获取星期几的中文表示
 * @param date Date 对象或日期字符串
 * @returns 如 "星期一"
 */
export function getWeekdayName(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return weekdays[d.getDay()]
}

/**
 * 获取日期范围的显示文本
 * @param start 开始日期
 * @param end 结束日期
 * @returns 如 "2024-01-01 ~ 2024-01-07"
 */
export function formatDateRange(start: string, end: string): string {
  return `${start} ~ ${end}`
}

/**
 * 获取今天的日期字符串
 * @returns YYYY-MM-DD 格式的日期
 */
export function getToday(): string {
  return formatDate(new Date())
}

/**
 * 获取本周的起止日期
 * @returns [startDate, endDate] YYYY-MM-DD 格式
 */
export function getThisWeek(): [string, string] {
  const now = new Date()
  const dayOfWeek = now.getDay()
  // 以周一为起始
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return [formatDate(monday), formatDate(sunday)]
}

/**
 * 获取本月的起止日期
 * @returns [startDate, endDate] YYYY-MM-DD 格式
 */
export function getThisMonth(): [string, string] {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return [formatDate(firstDay), formatDate(lastDay)]
}
