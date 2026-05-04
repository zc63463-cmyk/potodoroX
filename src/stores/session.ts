// ============================================================
// PomodoroX - 会话 Store
// 统一管理 Session 数据，消除 View 层越层 db 访问
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Session, CreateSessionInput } from '@/types'
import { db } from '@/services/database'
import { formatDate } from '@/utils/format'
import { useSyncStore } from '@/stores/sync'

async function recordEvent(type: 'session.created', id: string, payload: unknown) {
  try {
    const syncStore = useSyncStore()
    await syncStore.recordEvent(type, id, payload)
  } catch (err) {
    console.error('[SessionStore] 同步事件写入失败（业务操作已成功）:', err)
  }
}

export const useSessionStore = defineStore('session', () => {
  // ---- 状态 ----
  /** 所有会话列表 */
  const sessions = ref<Session[]>([])

  /** 是否正在加载 */
  const loading = ref(false)

  // ---- 计算属性 ----

  /** 今日会话 */
  const todaySessions = computed(() => {
    const today = formatDate(new Date())
    return sessions.value.filter((s) => s.startedAt.startsWith(today))
  })

  /** 今日已完成番茄钟数 */
  const todayPomodoros = computed(() =>
    todaySessions.value.filter((s) => s.type === 'work' && s.completed).length
  )

  /** 指定日期范围的会话 */
  function getSessionsByDateRange(start: string, end: string): Session[] {
    const startDate = new Date(start + 'T00:00:00')
    const endDate = new Date(end + 'T23:59:59')
    return sessions.value.filter((s) => {
      const d = new Date(s.startedAt)
      return d >= startDate && d <= endDate
    })
  }

  /** 指定任务的会话 */
  function getSessionsByTask(taskId: string): Session[] {
    return sessions.value.filter((s) => s.taskId === taskId)
  }

  // ---- 方法 ----

  /**
   * 加载所有会话
   */
  async function loadAllSessions(): Promise<void> {
    loading.value = true
    try {
      sessions.value = await db.getAllSessions()
    } catch (err) {
      console.error('[SessionStore] 加载会话失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加新会话（替代直接调用 db.createSession）
   * 供 timerStore 调用，保持内存同步
   */
  async function addSession(input: CreateSessionInput): Promise<Session | null> {
    try {
      const session = await db.createSession(input)
      sessions.value.unshift(session)
      await recordEvent('session.created', session.id, session)
      return session
    } catch (err) {
      console.error('[SessionStore] 创建会话失败:', err)
      return null
    }
  }

  /**
   * 获取未同步的会话
   */
  async function getUnsyncedSessions(): Promise<Session[]> {
    try {
      return await db.getUnsyncedSessions()
    } catch (err) {
      console.error('[SessionStore] 获取未同步会话失败:', err)
      return []
    }
  }

  /**
   * 更新会话（用于补充 plan/completion 等）
   */
  async function updateSession(id: string, input: Partial<Session>): Promise<Session | null> {
    try {
      const updated = await db.updateSession(id, input)
      if (updated) {
        const index = sessions.value.findIndex((s) => s.id === id)
        if (index !== -1) {
          sessions.value[index] = updated
        }
      }
      return updated
    } catch (err) {
      console.error('[SessionStore] 更新会话失败:', err)
      return null
    }
  }

  return {
    // 状态
    sessions,
    loading,
    // 计算属性
    todaySessions,
    todayPomodoros,
    // 方法
    loadAllSessions,
    addSession,
    updateSession,
    getSessionsByDateRange,
    getSessionsByTask,
    getUnsyncedSessions,
  }
})
