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
    plan: '1. 收集 Q2 数据\n2. 撰写初稿',
    completion: '初稿完成度 80%，数据部分需补充',
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
    plan: '1. 阅读 PR\n2. 检查代码规范',
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

import { isTaskActiveInRange, filterTasks } from '@/services/export'

describe('isTaskActiveInRange', () => {
  const start = new Date('2026-05-03T00:00:00')
  const end = new Date('2026-05-03T23:59:59')

  it('应包含 createdAt 在区间内的任务', () => {
    const task = { ...mockTasks[0], createdAt: '2026-05-03 09:00:00', updatedAt: '2026-05-03 09:00:00' }
    expect(isTaskActiveInRange(task, [], start, end)).toBe(true)
  })

  it('应包含 updatedAt 在区间内的任务', () => {
    const task = { ...mockTasks[0], createdAt: '2026-05-01 09:00:00', updatedAt: '2026-05-03 11:30:00' }
    expect(isTaskActiveInRange(task, [], start, end)).toBe(true)
  })

  it('应包含区间内有 session 的任务', () => {
    const task = { ...mockTasks[0], createdAt: '2026-05-01 09:00:00', updatedAt: '2026-05-01 09:00:00' }
    const sessions = [
      { ...mockSessions[0], taskId: '1', startedAt: '2026-05-03 09:00:00' },
    ] as Session[]
    expect(isTaskActiveInRange(task, sessions, start, end)).toBe(true)
  })

  it('不应包含区间内无活动的任务', () => {
    const task = { ...mockTasks[0], createdAt: '2026-04-01 09:00:00', updatedAt: '2026-04-01 09:00:00' }
    expect(isTaskActiveInRange(task, [], start, end)).toBe(false)
  })
})

describe('filterTasks', () => {
  const tasks = mockTasks.map((t) => ({ ...t }))

  it('status 筛选应生效', () => {
    const result = filterTasks(tasks, { status: 'done' })
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('done')
  })

  it('priority 筛选应生效', () => {
    const result = filterTasks(tasks, { priority: 'high' })
    expect(result).toHaveLength(1)
    expect(result[0].priority).toBe('high')
  })

  it('tags 筛选应生效', () => {
    const result = filterTasks(tasks, { tags: ['开发'] })
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('代码审查')
  })

  it('search 应匹配 plan 和 completion', () => {
    const enriched = tasks.map((t, i) =>
      i === 0
        ? { ...t, plan: '收集数据', completion: '初稿完成' }
        : { ...t, plan: '', completion: '' }
    )
    const result = filterTasks(enriched, { search: '初稿' })
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('完成项目报告')
  })

  it('组合筛选应生效', () => {
    const result = filterTasks(tasks, { status: 'done', priority: 'high' })
    expect(result).toHaveLength(1)
  })

  it('all 状态不过滤', () => {
    const result = filterTasks(tasks, { status: 'all' })
    expect(result).toHaveLength(2)
  })
})

describe('exportDailyReport plan/completion', () => {
  it('应包含任务规划内容', () => {
    const result = exportDailyReport('2026-05-03', mockTasks, [], mockSessions)
    expect(result).toContain('**规划：**')
    expect(result).toContain('收集 Q2 数据')
  })

  it('应包含任务总结内容', () => {
    const result = exportDailyReport('2026-05-03', mockTasks, [], mockSessions)
    expect(result).toContain('**总结：**')
    expect(result).toContain('初稿完成度 80%')
  })

  it('空 plan/completion 时不显示对应小节', () => {
    const tasks = mockTasks.map((t) => ({ ...t, plan: '', completion: '' }))
    const result = exportDailyReport('2026-05-03', tasks, [], mockSessions)
    expect(result).not.toContain('**规划：**')
    expect(result).not.toContain('**总结：**')
  })
})

describe('exportWeeklyReport plan/completion', () => {
  it('应包含任务规划内容', () => {
    const result = exportWeeklyReport('2026-05-03', '2026-05-03', mockTasks, [], mockSessions)
    expect(result).toContain('**规划：**')
    expect(result).toContain('收集 Q2 数据')
  })

  it('应包含任务总结内容', () => {
    const result = exportWeeklyReport('2026-05-03', '2026-05-03', mockTasks, [], mockSessions)
    expect(result).toContain('**总结：**')
    expect(result).toContain('初稿完成度 80%')
  })
})

import { exportAdvancedReport } from '@/services/export'

describe('exportAdvancedReport', () => {
  it('daily + markdown 应生成日报格式', () => {
    const result = exportAdvancedReport({
      type: 'daily',
      format: 'markdown',
      tasks: mockTasks,
      sessions: mockSessions,
      dateRange: { start: '2026-05-03', end: '2026-05-03' },
    })
    expect(result).toContain('PomodoroX 日报')
    expect(result).toContain('**规划：**')
  })

  it('weekly + markdown 应生成周报格式', () => {
    const result = exportAdvancedReport({
      type: 'weekly',
      format: 'markdown',
      tasks: mockTasks,
      sessions: mockSessions,
      dateRange: { start: '2026-05-03', end: '2026-05-03' },
    })
    expect(result).toContain('# 周报')
    expect(result).toContain('**总结：**')
  })

  it('task + csv 应生成 CSV 格式', () => {
    const result = exportAdvancedReport({
      type: 'task',
      format: 'csv',
      tasks: mockTasks,
    })
    expect(result).toContain('ID,Title,Status')
    expect(result).toContain('完成项目报告')
    expect(result.split('\n').length).toBeGreaterThan(2)
  })

  it('task + csv 应正确转义含逗号内容', () => {
    const tasks = [
      { ...mockTasks[0], title: '报告,含逗号' },
    ]
    const result = exportAdvancedReport({
      type: 'task',
      format: 'csv',
      tasks,
    })
    expect(result).toContain('"报告,含逗号"')
  })

  it('weekly + json 应生成合法 JSON', () => {
    const result = exportAdvancedReport({
      type: 'weekly',
      format: 'json',
      tasks: mockTasks,
      sessions: mockSessions,
      reflections: mockReflections,
      dateRange: { start: '2026-05-03', end: '2026-05-03' },
    })
    const parsed = JSON.parse(result)
    expect(parsed.meta.type).toBe('weekly')
    expect(parsed.summary).toBeDefined()
    expect(Array.isArray(parsed.tasks)).toBe(true)
  })
})
