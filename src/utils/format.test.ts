import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatDateTime,
  formatFriendlyDate,
  formatMinutes,
  getToday,
  getThisWeek,
  getThisMonth,
  getWeekdayName,
} from '@/utils/format'

describe('formatDate', () => {
  it('应该正确格式化日期为 YYYY-MM-DD', () => {
    const date = new Date(2026, 4, 3) // 2026-05-03
    expect(formatDate(date)).toBe('2026-05-03')
  })

  it('应该补零月份和日期', () => {
    const date = new Date(2026, 0, 5) // 2026-01-05
    expect(formatDate(date)).toBe('2026-01-05')
  })

  it('应该处理个位数月份和日期', () => {
    const date = new Date(2026, 10, 1) // 2026-11-01
    expect(formatDate(date)).toBe('2026-11-01')
  })
})

describe('formatDateTime', () => {
  it('应该返回 YYYY-MM-DD HH:mm:ss 格式', () => {
    const date = new Date(2026, 4, 3, 14, 30, 45)
    const result = formatDateTime(date)
    expect(result).toMatch(/^2026-05-03 \d{2}:\d{2}:\d{2}$/)
  })

  it('应该补零时分秒', () => {
    const date = new Date(2026, 4, 3, 1, 2, 3)
    const result = formatDateTime(date)
    expect(result).toContain('01:02:03')
  })
})

describe('formatFriendlyDate', () => {
  it('应该返回友好的日期格式', () => {
    const result = formatFriendlyDate('2026-05-03')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })
})

describe('formatMinutes', () => {
  it('应该格式化 0 分钟', () => {
    expect(formatMinutes(0)).toBe('0分钟')
  })

  it('应该格式化小于 60 分钟', () => {
    expect(formatMinutes(25)).toBe('25分钟')
  })

  it('应该格式化整小时', () => {
    expect(formatMinutes(60)).toBe('1小时')
  })

  it('应该格式化小时+分钟', () => {
    expect(formatMinutes(90)).toBe('1小时30分钟')
  })

  it('应该格式化多个小时', () => {
    expect(formatMinutes(150)).toBe('2小时30分钟')
  })
})

describe('getToday', () => {
  it('应该返回今天的日期字符串 YYYY-MM-DD', () => {
    const result = getToday()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('getThisWeek', () => {
  it('应该返回本周的起止日期', () => {
    const [start, end] = getThisWeek()
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(end).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    // 结束日期应该 >= 开始日期
    expect(end >= start).toBe(true)
  })
})

describe('getThisMonth', () => {
  it('应该返回本月的起止日期', () => {
    const [start, end] = getThisMonth()
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(end).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    // 开始日期应该是月初
    expect(start.endsWith('01')).toBe(true)
  })
})

describe('getWeekdayName', () => {
  it('应该返回中文星期名', () => {
    // 2026-05-03 是周日
    expect(getWeekdayName('2026-05-03')).toBe('星期日')
    // 2026-05-04 是周一
    expect(getWeekdayName('2026-05-04')).toBe('星期一')
    // 2026-05-08 是周五
    expect(getWeekdayName('2026-05-08')).toBe('星期五')
  })
})
