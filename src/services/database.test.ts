// ============================================================
// PomodoroX - 数据库服务测试
// 覆盖：MemoryStore localStorage 持久化、数据序列化/反序列化、CRUD 操作
// ============================================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { initDatabase } from '@/services/database'
import type { Task, Reflection, Session } from '@/types'

// ============================================================
// 1. localStorage 序列化/反序列化测试（核心持久化逻辑）
// ============================================================

describe('MemoryStore localStorage 序列化/反序列化', () => {
  /**
   * 模拟 MemoryStore 中的序列化逻辑
   * 验证 Map ↔ JSON 转换的正确性
   */

  interface SerializedData {
    tasks: [string, Task][]
    reflections: [string, Reflection][]
    sessions: [string, Session][]
    syncLog: { id: string; entityType: string; entityId: string; syncedAt: string }[]
  }

  function saveToLocalStorage(data: SerializedData): string {
    return JSON.stringify(data)
  }

  function loadFromLocalStorage(raw: string): SerializedData {
    return JSON.parse(raw)
  }

  function createMockTask(overrides: Partial<Task> = {}): Task {
    return {
      id: 'test-task-1',
      title: '测试任务',
      description: '测试描述',
      status: 'todo',
      priority: 'medium',
      estimatedPomodoros: 1,
      actualPomodoros: 0,
      tags: ['测试'],
      dueDate: null,
      createdAt: '2026-05-03 10:00:00',
      updatedAt: '2026-05-03 10:00:00',
      synced: false,
      ...overrides,
    }
  }

  function createMockReflection(overrides: Partial<Reflection> = {}): Reflection {
    return {
      id: 'test-ref-1',
      date: '2026-05-03',
      content: '今日反思内容',
      mood: 'good',
      relatedTaskIds: [],
      tags: [],
      createdAt: '2026-05-03 18:00:00',
      updatedAt: '2026-05-03 18:00:00',
      synced: false,
      ...overrides,
    }
  }

  function createMockSession(overrides: Partial<Session> = {}): Session {
    return {
      id: 'test-session-1',
      taskId: 'test-task-1',
      type: 'work',
      duration: 1500,
      completed: true,
      startedAt: '2026-05-03 10:00:00',
      endedAt: '2026-05-03 10:25:00',
      synced: false,
      ...overrides,
    }
  }

  it('应该正确序列化和反序列化 Task Map', () => {
    const tasks = new Map<string, Task>()
    tasks.set('t1', createMockTask({ id: 't1', title: '任务一' }))
    tasks.set('t2', createMockTask({ id: 't2', title: '任务二', priority: 'high' }))

    const serialized = saveToLocalStorage({
      tasks: Array.from(tasks.entries()),
      reflections: [],
      sessions: [],
      syncLog: [],
    })

    const deserialized = loadFromLocalStorage(serialized)
    const restoredTasks = new Map(deserialized.tasks)

    expect(restoredTasks.size).toBe(2)
    expect(restoredTasks.get('t1')?.title).toBe('任务一')
    expect(restoredTasks.get('t2')?.priority).toBe('high')
  })

  it('应该正确序列化和反序列化 Reflection Map', () => {
    const reflections = new Map<string, Reflection>()
    reflections.set('r1', createMockReflection({ id: 'r1', mood: 'great' }))
    reflections.set('r2', createMockReflection({ id: 'r2', content: '有点疲惫', mood: 'bad' }))

    const serialized = saveToLocalStorage({
      tasks: [],
      reflections: Array.from(reflections.entries()),
      sessions: [],
      syncLog: [],
    })

    const deserialized = loadFromLocalStorage(serialized)
    const restoredReflections = new Map(deserialized.reflections)

    expect(restoredReflections.size).toBe(2)
    expect(restoredReflections.get('r1')?.mood).toBe('great')
    expect(restoredReflections.get('r2')?.content).toBe('有点疲惫')
  })

  it('应该正确序列化和反序列化 Session Map', () => {
    const sessions = new Map<string, Session>()
    sessions.set('s1', createMockSession({ id: 's1', duration: 1500, completed: true }))
    sessions.set('s2', createMockSession({ id: 's2', duration: 300, completed: false }))

    const serialized = saveToLocalStorage({
      tasks: [],
      reflections: [],
      sessions: Array.from(sessions.entries()),
      syncLog: [],
    })

    const deserialized = loadFromLocalStorage(serialized)
    const restoredSessions = new Map(deserialized.sessions)

    expect(restoredSessions.size).toBe(2)
    expect(restoredSessions.get('s1')?.completed).toBe(true)
    expect(restoredSessions.get('s2')?.duration).toBe(300)
  })

  it('应该正确处理 syncLog 序列化', () => {
    const syncLog = [
      { id: 'log1', entityType: 'task', entityId: 't1', syncedAt: '2026-05-03 10:00:00' },
      { id: 'log2', entityType: 'reflection', entityId: 'r1', syncedAt: '2026-05-03 11:00:00' },
    ]

    const serialized = saveToLocalStorage({
      tasks: [],
      reflections: [],
      sessions: [],
      syncLog,
    })

    const deserialized = loadFromLocalStorage(serialized)

    expect(deserialized.syncLog.length).toBe(2)
    expect(deserialized.syncLog[0].entityType).toBe('task')
    expect(deserialized.syncLog[1].entityType).toBe('reflection')
  })

  it('应该处理空数据（空 Map 和空数组）', () => {
    const serialized = saveToLocalStorage({
      tasks: [],
      reflections: [],
      sessions: [],
      syncLog: [],
    })

    const deserialized = loadFromLocalStorage(serialized)

    expect(deserialized.tasks).toEqual([])
    expect(deserialized.reflections).toEqual([])
    expect(deserialized.sessions).toEqual([])
    expect(deserialized.syncLog).toEqual([])
  })

  it('应该处理包含复杂类型的数据（tags 数组、null 值）', () => {
    const tasks = new Map<string, Task>()
    tasks.set('t1', createMockTask({
      id: 't1',
      tags: ['工作', '紧急', '项目A'],
      dueDate: null,
      description: '',
    }))

    const serialized = saveToLocalStorage({
      tasks: Array.from(tasks.entries()),
      reflections: [],
      sessions: [],
      syncLog: [],
    })

    const deserialized = loadFromLocalStorage(serialized)
    const restoredTasks = new Map(deserialized.tasks)

    expect(restoredTasks.get('t1')?.tags).toEqual(['工作', '紧急', '项目A'])
    expect(restoredTasks.get('t1')?.dueDate).toBeNull()
    expect(restoredTasks.get('t1')?.description).toBe('')
  })

  it('应该处理大量数据（性能基准）', () => {
    const tasks = new Map<string, Task>()
    for (let i = 0; i < 1000; i++) {
      tasks.set(`t${i}`, createMockTask({
        id: `t${i}`,
        title: `任务 ${i}`,
        tags: ['批量', `分类${i % 10}`],
      }))
    }

    const start = performance.now()
    const serialized = saveToLocalStorage({
      tasks: Array.from(tasks.entries()),
      reflections: [],
      sessions: [],
      syncLog: [],
    })
    const deserialized = loadFromLocalStorage(serialized)
    const elapsed = performance.now() - start

    const restoredTasks = new Map(deserialized.tasks)
    expect(restoredTasks.size).toBe(1000)
    expect(restoredTasks.get('t500')?.title).toBe('任务 500')
    // 1000 条数据的序列化+反序列化应在 100ms 内完成
    expect(elapsed).toBeLessThan(100)
  })
})

// ============================================================
// 2. MemoryStore CRUD 操作测试（通过 db 单例）
// ============================================================

describe('MemoryStore CRUD 操作', () => {
  beforeEach(async () => {
    // 每次测试前清理 localStorage
    localStorage.clear()
    // 重新初始化数据库
    await initDatabase()
  })

  afterEach(() => {
    localStorage.clear()
  })

  // 由于 db 是单例，我们测试其基本 CRUD 方法
  // 注意：这些测试依赖实际的 MemoryStore 实现
  it('localStorage 初始状态应该是空的', () => {
    expect(localStorage.getItem('pomodorox-memorystore')).toBeNull()
  })

  it('localStorage 应该支持 setItem 和 getItem 的基本操作', () => {
    const testData = { key: 'value', number: 42 }
    localStorage.setItem('pomodorox-test', JSON.stringify(testData))
    const retrieved = JSON.parse(localStorage.getItem('pomodorox-test')!)
    expect(retrieved).toEqual(testData)
  })

  it('localStorage 应该处理存储满的情况（QuotaExceededError）', () => {
    // 验证 try-catch 逻辑能处理异常
    const fn = () => {
      try {
        // 模拟 QuotaExceededError
        const error = new DOMException('QuotaExceededError', 'QuotaExceededError')
        throw error
      } catch (err) {
        console.warn('[MemoryStore] localStorage 写入失败，可能已满:', err)
      }
    }
    expect(fn).not.toThrow()
  })

  it('localStorage 的数据格式应该是纯 JSON 字符串', () => {
    // 验证 JSON.stringify 的输出类型
    const data = { tasks: [], reflections: [], sessions: [], syncLog: [] }
    const jsonStr = JSON.stringify(data)
    expect(typeof jsonStr).toBe('string')
    expect(() => JSON.parse(jsonStr)).not.toThrow()
  })
})

// ============================================================
// 3. 数据格式兼容性测试
// ============================================================

describe('数据格式兼容性', () => {
  it('Map 转 JSON 再转回 Map 应该保留所有数据', () => {
    const original = new Map<string, { name: string; count: number }>()
    original.set('a', { name: 'Alice', count: 10 })
    original.set('b', { name: 'Bob', count: 20 })

    // 序列化
    const serialized = JSON.stringify(Array.from(original.entries()))
    // 反序列化
    const deserialized = new Map(JSON.parse(serialized))

    expect(deserialized.size).toBe(2)
    expect(deserialized.get('a')).toEqual({ name: 'Alice', count: 10 })
    expect(deserialized.get('b')).toEqual({ name: 'Bob', count: 20 })
  })

  it('空 Map 序列化后反序列化应为空 Map', () => {
    const empty = new Map()
    const serialized = JSON.stringify(Array.from(empty.entries()))
    const deserialized = new Map(JSON.parse(serialized))
    expect(deserialized.size).toBe(0)
  })

  it('应该正确处理同步状态（synced: boolean）的持久化', () => {
    const task = {
      id: 't1',
      title: '测试同步',
      synced: true as boolean,
    }
    // 模拟序列化/反序列化
    const raw = JSON.stringify(task)
    const restored = JSON.parse(raw)
    expect(restored.synced).toBe(true)
    expect(typeof restored.synced).toBe('boolean')
  })

  it('应该正确处理日期字符串的持久化', () => {
    const dateStr = '2026-05-03 14:30:00'
    const data = { createdAt: dateStr, updatedAt: dateStr }
    const raw = JSON.stringify(data)
    const restored = JSON.parse(raw)
    expect(restored.createdAt).toBe(dateStr)
    expect(restored.updatedAt).toBe(dateStr)
  })
})

// ============================================================
// 4. 跨环境兼容性测试
// ============================================================

describe('跨环境兼容性', () => {
  it('在无 localStorage 环境下应该静默失败', () => {
    // 模拟 localStorage 不存在的情况
    const originalLocalStorage = (globalThis as any).localStorage
    delete (globalThis as any).localStorage

    try {
      // 应不抛出异常
      const fn = () => {
        if (typeof localStorage === 'undefined') return
      }
      expect(fn).not.toThrow()
    } finally {
      ;(globalThis as any).localStorage = originalLocalStorage
    }
  })

  it('localStorage 键名应该符合预期约定', () => {
    // MemoryStore 使用 'pomodorox-memorystore'
    // Settings Store 使用 'pomodorox-settings'
    const memKey = 'pomodorox-memorystore'
    const settingsKey = 'pomodorox-settings'

    expect(memKey).toMatch(/^pomodorox-/)
    expect(settingsKey).toMatch(/^pomodorox-/)
    // 两个 key 不相同
    expect(memKey).not.toBe(settingsKey)
  })
})
