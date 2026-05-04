// ============================================================
// PomodoroX - 同步 Store
// Outbox 事件模型：写本地 → 写 outbox 事件 → 推 GitHub
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SyncStatus } from '@/types'
import { db } from '@/services/database'
import * as github from '@/services/github'
import * as outbox from '@/services/outbox'
import { consumeEvents } from '@/services/event-consumer'
import type { OutboxEventType } from '@/services/outbox'

export const useSyncStore = defineStore('sync', () => {
  // ---- 状态 ----
  /** 是否正在同步 */
  const isSyncing = ref(false)

  /** 同步状态信息 */
  const syncStatus = ref<SyncStatus>({
    lastSyncAt: null,
    pendingCount: 0,
    isSyncing: false,
  })

  /** 同步错误信息 */
  const syncError = ref<string | null>(null)

  /** 数据库统计 */
  const dbStats = ref({
    taskCount: 0,
    reflectionCount: 0,
    sessionCount: 0,
  })

  // ---- 串行锁（防止并发同步） ----
  let _syncLock: Promise<void> = Promise.resolve()

  /** 串行执行异步函数（保证同一时间只有一个同步操作） */
  function serialized<T>(fn: () => Promise<T>): Promise<T> {
    const prev = _syncLock
    let release: () => void
    _syncLock = new Promise((resolve) => { release = resolve })
    return prev.then(() => fn()).finally(() => release!())
  }

  // ---- 计算属性 ----
  const pendingCount = computed(() => syncStatus.value.pendingCount)
  const lastSyncAt = computed(() => syncStatus.value.lastSyncAt)

  // ---- 方法 ----

  /**
   * 认证 GitHub
   */
  function authenticate(token: string): void {
    github.authenticate(token)
  }

  /**
   * 设置 GitHub 仓库
   */
  function setRepo(owner: string, repo: string): void {
    github.setRepo(owner, repo)
  }

  /**
   * 检查 GitHub 是否已配置
   */
  function isConfigured(): boolean {
    return github.isConfigured()
  }

  /**
   * 检查是否有待同步的事件
   */
  async function hasPendingEvents(): Promise<boolean> {
    const count = await outbox.getUnpushedCount()
    return count > 0
  }

  /**
   * 加载同步状态
   */
  async function loadSyncStatus(): Promise<void> {
    try {
      syncStatus.value = await db.getSyncStatus()
      // 补充 outbox 待同步数量
      const outboxCount = await outbox.getUnpushedCount()
      syncStatus.value.pendingCount = outboxCount
    } catch (err) {
      console.error('[SyncStore] 加载同步状态失败:', err)
    }
  }

  /**
   * 获取待同步数量
   */
  async function getPendingCounts(): Promise<{ tasks: number; reflections: number; sessions: number }> {
    return { tasks: 0, reflections: 0, sessions: 0 } // outbox 模型不再按实体类型统计
  }

  // ============================================================
  // 推送：将本地 outbox 事件推送到 GitHub
  // ============================================================

  /**
   * 推送所有未推送的 outbox 事件到 GitHub
   * 分批推送（每批最多 10 个），循环直到 outbox 清空
   */
  async function syncPushEvents(): Promise<{ success: boolean; message: string }> {
    if (!github.isConfigured()) {
      return { success: false, message: 'GitHub 未配置' }
    }

    let totalPushed = 0
    let allSuccess = true
    const messages: string[] = []
    const BATCH_SIZE = 10

    while (true) {
      const events = await outbox.getUnpushedEvents()
      if (events.length === 0) break

      // 每批最多 BATCH_SIZE 个
      const batch = events.slice(0, BATCH_SIZE)
      const results = await github.pushEvents(batch)

      // 筛选成功推送的事件 ID
      const pushedIds: string[] = []
      for (let i = 0; i < results.length; i++) {
        if (results[i]?.success) {
          pushedIds.push(batch[i].eventId)
        } else {
          allSuccess = false
        }
      }

      // 从本地 outbox 删除已推送的事件
      if (pushedIds.length > 0) {
        await outbox.removePushedEvents(pushedIds)
        totalPushed += pushedIds.length
      }

      // 收集消息
      results.forEach(r => {
        if (r.message) messages.push(r.message)
      })

      // 如果有推送失败的，停止后续推送
      if (!allSuccess) break
    }

    await loadSyncStatus()

    if (totalPushed === 0 && messages.length === 0) {
      return { success: true, message: '没有事件需要推送' }
    }

    return {
      success: allSuccess,
      message: messages.length > 0 ? messages.join('; ') : `推送完成: ${totalPushed} 个事件`,
    }
  }

  // ============================================================
  // 拉取：从 GitHub 消费 outbox 事件
  // ============================================================

  /**
   * 拉取并消费远程 outbox 事件
   * 幂等安全：已处理的事件自动跳过
   */
  async function syncPullEvents(): Promise<{ success: boolean; message: string }> {
    if (!github.isConfigured()) {
      return { success: false, message: 'GitHub 未配置' }
    }

    const result = await consumeEvents()

    await loadSyncStatus()

    return {
      success: result.errors === 0,
      message: `拉取 ${result.pulled} 个事件, 处理 ${result.processed} 个, 失败 ${result.errors} 个`,
    }
  }

  // ============================================================
  // 完整同步：先推后拉
  // ============================================================

  /**
   * 执行完整同步（串行安全）
   * 1. 推送本地 outbox 事件到 GitHub
   * 2. 拉取并消费远程 outbox 事件
   */
  async function fullSyncAction(): Promise<{ success: boolean; message: string }> {
    return serialized(async () => {
      if (isSyncing.value) return { success: false, message: '正在同步中...' }

      isSyncing.value = true
      syncError.value = null

      try {
        // Step 1: 推送本地事件
        const pushResult = await syncPushEvents()

        // Step 2: 拉取远程事件
        const pullResult = await syncPullEvents()

        const success = pushResult.success && pullResult.success
        const parts = [pushResult.message, pullResult.message].filter(Boolean)
        return {
          success,
          message: parts.join(' | '),
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : '同步失败'
        syncError.value = msg
        return { success: false, message: msg }
      } finally {
        isSyncing.value = false
      }
    })
  }

  // ============================================================
  // 记录事件并触发同步（由 Stores 在 CRUD 后调用）
  // ============================================================

  /**
   * 记录一条 outbox 事件，并在后台触发同步
   * @param type 事件类型
   * @param entityId 实体 ID
   * @param payload 事件载荷（完整实体数据）
   */
  async function recordEvent(
    type: OutboxEventType,
    entityId: string,
    payload: unknown
  ): Promise<void> {
    // 优先写入本地 outbox（不依赖 GitHub 配置）
    // 即使 GitHub 未配置或离线，事件也不会丢失
    await outbox.writeEvent(type, entityId, payload)
    await loadSyncStatus()

    // GitHub 已配置时尝试推送
    if (github.isConfigured()) {
      serialized(() => syncPushEvents()).catch(() => {})
    }
  }

  /**
   * 后台拉取（由 App.vue 启动时调用）
   */
  async function backgroundPull(): Promise<void> {
    if (!github.isConfigured()) return
    return serialized(async () => {
      await syncPullEvents()
    })
  }

  // ============================================================
  // 以下方法保持与 SettingsView 的兼容
  // ============================================================

  /**
   * 加载数据库统计
   */
  async function loadDbStats(): Promise<void> {
    try {
      const [tasks, reflections, sessions] = await Promise.all([
        db.getAllTasks(),
        db.getAllReflections(),
        db.getAllSessions(),
      ])
      dbStats.value = {
        taskCount: tasks.length,
        reflectionCount: reflections.length,
        sessionCount: sessions.length,
      }
    } catch (err) {
      console.error('[SyncStore] 加载数据库统计失败:', err)
    }
  }

  /**
   * 清除所有数据
   */
  async function clearAllData(): Promise<void> {
    await db.clearAll()
    dbStats.value = { taskCount: 0, reflectionCount: 0, sessionCount: 0 }
  }

  /**
   * 导入数据（创建任务/反思/会话）
   */
  async function importRecords(
    tasks: Array<{ title: string; description: string; priority: string; estimatedPomodoros: number; tags: string[]; dueDate: string | null }>,
    reflections: Array<{ date: string; content: string; mood: string; relatedTaskIds: string[]; tags: string[] }>,
    sessions: Array<{ taskId: string | null; type: string; duration: number; completed: boolean; startedAt: string }>
  ): Promise<{ taskCount: number; reflectionCount: number; sessionCount: number }> {
    let taskCount = 0
    let reflectionCount = 0
    let sessionCount = 0

    for (const task of tasks) {
      await db.createTask(task as any)
      taskCount++
    }
    for (const reflection of reflections) {
      await db.createReflection(reflection as any)
      reflectionCount++
    }
    for (const session of sessions) {
      await db.createSession(session as any)
      sessionCount++
    }

    return { taskCount, reflectionCount, sessionCount }
  }

  /**
   * 导出数据（获取所有记录用于 JSON 导出）
   */
  async function exportAllData(): Promise<{
    tasks: any[]
    reflections: any[]
    sessions: any[]
  }> {
    const [tasks, reflections, sessions] = await Promise.all([
      db.getAllTasks(),
      db.getAllReflections(),
      db.getAllSessions(),
    ])
    return { tasks, reflections, sessions }
  }

  return {
    // 状态
    isSyncing,
    syncStatus,
    syncError,
    dbStats,
    // 计算属性
    pendingCount,
    lastSyncAt,
    // 方法（保持与 SettingsView 兼容）
    authenticate,
    setRepo,
    isConfigured,
    hasPendingEvents,
    loadSyncStatus,
    getPendingCounts,
    fullSyncAction,
    // 新方法
    recordEvent,
    backgroundPull,
    syncPushEvents,
    syncPullEvents,
    loadDbStats,
    clearAllData,
    importRecords,
    exportAllData,
  }
})
