import { describe, it, expect, beforeEach, vi } from 'vitest'

/**
 * 模拟 idb-keyval（happy-dom 不支持 IndexedDB）
 * 使用内存 Map 替代
 */
const store = new Map<string, unknown>()
vi.mock('idb-keyval', () => ({
  get: vi.fn(async (key: string) => store.get(key) ?? undefined),
  set: vi.fn(async (key: string, value: unknown) => { store.set(key, value) }),
  keys: vi.fn(async () => Array.from(store.keys())),
  del: vi.fn(async (key: string) => { store.delete(key) }),
}))

// 导入被测模块（必须在 vi.mock 之后）
const outbox = await import('./outbox')

describe('Outbox 事件队列', () => {
  beforeEach(() => {
    store.clear()
  })

  it('writeEvent 应写入并返回事件', async () => {
    const event = await outbox.writeEvent('task.created', 'task-1', { id: 'task-1', title: '测试' })
    expect(event.eventId).toBeTruthy()
    expect(event.type).toBe('task.created')
    expect(event.entityId).toBe('task-1')
    expect(event.payload).toEqual({ id: 'task-1', title: '测试' })
    expect(event.timestamp).toBeTruthy()

    // 验证能从队列读出
    const events = await outbox.getUnpushedEvents()
    expect(events).toHaveLength(1)
    expect(events[0].eventId).toBe(event.eventId)
  })

  it('removePushedEvents 应删除已推送的事件', async () => {
    const e1 = await outbox.writeEvent('task.created', 'task-1', { id: 'task-1' })
    const e2 = await outbox.writeEvent('reflection.created', 'ref-1', { id: 'ref-1' })

    await outbox.removePushedEvents([e1.eventId])

    const remaining = await outbox.getUnpushedEvents()
    expect(remaining).toHaveLength(1)
    expect(remaining[0].eventId).toBe(e2.eventId)
  })

  it('getUnpushedEvents 应按时间戳升序排列', async () => {
    // 写入 3 个事件，验证排序
    const e1 = await outbox.writeEvent('task.created', 'task-1', {})
    await outbox.writeEvent('reflection.created', 'ref-1', {})
    await outbox.writeEvent('session.created', 'session-1', {})

    const events = await outbox.getUnpushedEvents()
    expect(events).toHaveLength(3)
    expect(events[0].eventId).toBe(e1.eventId)
  })
})

describe('Outbox 墓碑机制', () => {
  beforeEach(() => {
    store.clear()
  })

  it('markTombstone 应记录墓碑', async () => {
    await outbox.markTombstone('task', 'task-1', '2026-05-04T10:00:00.000Z')

    const tombstone = await outbox.getTombstone('task', 'task-1')
    expect(tombstone).not.toBeNull()
    expect(tombstone!.entityId).toBe('task-1')
    expect(tombstone!.deletedAt).toBe('2026-05-04T10:00:00.000Z')
  })

  it('removeTombstone 应清除墓碑', async () => {
    await outbox.markTombstone('task', 'task-1', '2026-05-04T10:00:00.000Z')
    await outbox.removeTombstone('task', 'task-1')

    const tombstone = await outbox.getTombstone('task', 'task-1')
    expect(tombstone).toBeNull()
  })

  it('getTombstone 应返回 null（未找到时）', async () => {
    const tombstone = await outbox.getTombstone('task', 'nonexistent')
    expect(tombstone).toBeNull()
  })
})
