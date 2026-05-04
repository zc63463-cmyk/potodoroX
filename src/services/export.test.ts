import { describe, it, expect } from 'vitest'
import { exportDailyReport, exportWeeklyReport } from '@/services/export'
import type { Task, Reflection, Session } from '@/types'

// ---- 测试数据 ----

const mockTasks: Task[] = [
  {
    id: '1',
    title: '完成项目报告',
    description: '撰写 Q2 季度项目总结报告',
    status: 'done',
    priority: 'high',
    estimatedPomodoros: 4,
    actualPomodoros: 3,
    tags: ['工作', '报告'],
    dueDate: '2026-05-03',
    plan: '',
    completion: '',
    createdAt: '2026-05-03 09:00:00',
    updatedAt: '2026-05-03 11:30:00',
    synced: false,
  },
  {
    id: '2',
    title: '代码审查',
    description: '',
    status: 'in_progress',
    priority: 'medium',
    estimatedPomodoros: 2,
    actualPomodoros: 1,
    tags: ['开发'],
    dueDate: null,
    plan: '',
    completion: '',
    createdAt: '2026-05-03 10:00:00',
    updatedAt: '2026-05-03 10:30:00',
    synced: false,
  },
]

const mockReflections: Reflection[] = [
  {
    id: 'r1',
    date: '2026-05-03',
    content: '今天效率不错，完成了报告撰写',
    mood: 'good',
    relatedTaskIds: ['1'],
    tags: ['工作'],
    createdAt: '2026-05-03 18:00:00',
    updatedAt: '2026-05-03 18:00:00',
    synced: false,
  },
]

const mockSessions: Session[] = [
  {
    id: 's1',
    taskId: '1',
    type: 'work',
    duration: 25 * 60,
    completed: true,
    startedAt: '2026-05-03 09:00:00',
    endedAt: '2026-05-03 09:25:00',
    plan: '',
    completion: '',
    synced: false,
  },
  {
    id: 's2',
    taskId: '1',
    type: 'work',
    duration: 25 * 60,
    completed: true,
    startedAt: '2026-05-03 09:30:00',
    endedAt: '2026-05-03 09:55:00',
    plan: '',
    completion: '',
    synced: false,
  },
  {
    id: 's3',
    taskId: null,
    type: 'short_break',
    duration: 5 * 60,
    completed: true,
    startedAt: '2026-05-03 09:25:00',
    endedAt: '2026-05-03 09:30:00',
    plan: '',
    completion: '',
    synced: false,
  },
]

describe('exportDailyReport', () => {
  it('应该生成包含标题的日报', () => {
    const result = exportDailyReport('2026-05-03', [], [], [])
    expect(result).toContain('- PomodoroX 日报')
  })

  it('应该包含概览统计', () => {
    const result = exportDailyReport('2026-05-03', mockTasks, mockReflections, mockSessions)
    expect(result).toContain('## 概览')
    expect(result).toContain('完成番茄钟')
    expect(result).toContain('2 个') // 2 个完成的 work sessions
    expect(result).toContain('专注时长')
  })

  it('应该包含完成的任务', () => {
    const result = exportDailyReport('2026-05-03', mockTasks, [], mockSessions)
    expect(result).toContain('完成任务')
    expect(result).toContain('1 个') // 1 个 done task
  })

  it('应该包含番茄钟记录', () => {
    const result = exportDailyReport('2026-05-03', mockTasks, [], mockSessions)
    expect(result).toContain('## 番茄钟记录')
  })

  it('应该包含反思内容', () => {
    const result = exportDailyReport('2026-05-03', [], mockReflections, mockSessions)
    expect(result).toContain('## 反思')
  })

  it('空数据时不崩溃', () => {
    const result = exportDailyReport('2026-05-03', [], [], [])
    expect(result).toContain('- PomodoroX 日报')
    expect(result).toContain('0 个')
  })
})

describe('exportWeeklyReport', () => {
  it('应该生成包含标题的周报', () => {
    const result = exportWeeklyReport('2026-04-27', '2026-05-03', [], [], [])
    expect(result).toContain('# 周报:')
  })

  it('应该包含日期范围', () => {
    const result = exportWeeklyReport('2026-04-27', '2026-05-03', [], [], [])
    expect(result).toContain('2026-04-27')
    expect(result).toContain('2026-05-03')
  })

  it('应该包含统计数据', () => {
    const result = exportWeeklyReport('2026-04-27', '2026-05-03', mockTasks, mockReflections, mockSessions)
    expect(result).toContain('## 本周概览')
    expect(result).toContain('完成番茄钟')
  })

  it('空数据时不崩溃', () => {
    const result = exportWeeklyReport('2026-04-27', '2026-05-03', [], [], [])
    expect(result).toContain('# 周报:')
  })
})
