// ============================================================
// PomodoroX - 数据库服务
// 使用 @tauri-apps/plugin-sql，带内存回退
// ============================================================

import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  Reflection,
  CreateReflectionInput,
  UpdateReflectionInput,
  Session,
  CreateSessionInput,
  SyncStatus,
} from '@/types'
import { generateId } from '@/utils/id'
import { formatDateTime } from '@/utils/format'
import { DB_FILENAME } from '@/utils/constants'
import { isTauriAvailable } from '@/utils/tauri'
import { get, set } from 'idb-keyval'

// ---- Tauri SQL 插件类型 ----
type SqlValue = string | number | null | Uint8Array

interface Database {
  execute(sql: string, bind?: SqlValue[]): Promise<number>
  select<T>(sql: string, bind?: SqlValue[]): Promise<T[]>
}

// ============================================================
// 内存回退存储
// ============================================================

class MemoryStore {
  private tasks = new Map<string, Task>()
  private reflections = new Map<string, Reflection>()
  private sessions = new Map<string, Session>()
  private syncLog: { id: string; entityType: string; entityId: string; syncedAt: string }[] = []

  /** IndexedDB Key 常量 */
  private static readonly STORAGE_KEY = 'pomodorox-memorystore'

  /** 自动保存标志 - init() 中根据环境设置 */
  private autoSaveEnabled = false

  /**
   * 序列化所有数据到 IndexedDB
   * 在每次创建/更新/删除操作后自动调用
   * 使用 idb-keyval（异步、更大容量、不阻塞主线程）
   */
  private async saveToLocalStorage(): Promise<void> {
    try {
      const data = {
        tasks: Array.from(this.tasks.entries()),
        reflections: Array.from(this.reflections.entries()),
        sessions: Array.from(this.sessions.entries()),
        syncLog: this.syncLog,
      }
      await set(MemoryStore.STORAGE_KEY, data)
    } catch (err) {
      console.warn('[MemoryStore] IndexedDB 写入失败:', err)
    }
  }

  /**
   * 从 IndexedDB 恢复数据
   * 在 init() 时调用
   */
  private async loadFromLocalStorage(): Promise<void> {
    try {
      const data = await get<{
        tasks: [string, Task][]
        reflections: [string, Reflection][]
        sessions: [string, Session][]
        syncLog: { id: string; entityType: string; entityId: string; syncedAt: string }[]
      }>(MemoryStore.STORAGE_KEY)
      if (!data) return
      if (data.tasks) this.tasks = new Map(data.tasks)
      if (data.reflections) this.reflections = new Map(data.reflections)
      if (data.sessions) this.sessions = new Map(data.sessions)
      if (data.syncLog) this.syncLog = data.syncLog
      console.log('[MemoryStore] 已从 IndexedDB 恢复数据')
    } catch (err) {
      // 兼容旧版 localStorage 数据：尝试从 localStorage 迁移
      try {
        const raw = (typeof localStorage !== 'undefined') ? localStorage.getItem(MemoryStore.STORAGE_KEY) : null
        if (raw) {
          const data = JSON.parse(raw)
          if (data.tasks) this.tasks = new Map(data.tasks)
          if (data.reflections) this.reflections = new Map(data.reflections)
          if (data.sessions) this.sessions = new Map(data.sessions)
          if (data.syncLog) this.syncLog = data.syncLog
          // 迁移到 IndexedDB 后删除旧数据
          localStorage.removeItem(MemoryStore.STORAGE_KEY)
          await this.saveToLocalStorage()
          console.log('[MemoryStore] 已从 localStorage 迁移数据到 IndexedDB')
        }
      } catch {
        console.warn('[MemoryStore] 数据恢复失败，使用空数据')
      }
    }
  }

  async init(): Promise<void> {
    await this.loadFromLocalStorage()
    // 非 Tauri 环境下启用 autoSave（浏览器/移动端 Web）
    if (!isTauriAvailable()) {
      this.autoSaveEnabled = true
    }
  }

  // ---- Tasks ----
  async createTask(input: CreateTaskInput): Promise<Task> {
    const now = formatDateTime(new Date())
    const task: Task = {
      id: generateId(),
      ...input,
      status: 'todo',
      actualPomodoros: 0,
      createdAt: now,
      updatedAt: now,
      synced: false,
    }
    this.tasks.set(task.id, task)
    if (this.autoSaveEnabled) await this.saveToLocalStorage()
    return task
  }

  async getTask(id: string): Promise<Task | null> {
    return this.tasks.get(id) ?? null
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values())
  }

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
    const existing = this.tasks.get(id)
    if (!existing) return null
    const updated: Task = {
      ...existing,
      ...input,
      id,
      createdAt: existing.createdAt,
      synced: false,
      updatedAt: formatDateTime(new Date()),
    }
    this.tasks.set(id, updated)
    if (this.autoSaveEnabled) await this.saveToLocalStorage()
    return updated
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = this.tasks.delete(id)
    if (this.autoSaveEnabled) await this.saveToLocalStorage()
    return result
  }

  async getTasksByDate(date: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (t) => t.createdAt.startsWith(date) || (t.dueDate && t.dueDate.startsWith(date))
    )
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter((t) => t.status === status)
  }

  async getUnsyncedTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter((t) => !t.synced)
  }

  async markTaskSynced(id: string): Promise<void> {
    const task = this.tasks.get(id)
    if (task) {
      task.synced = true
      this.tasks.set(id, task)
    }
    if (this.autoSaveEnabled) await this.saveToLocalStorage()
  }

  // ---- Reflections ----
  async createReflection(input: CreateReflectionInput): Promise<Reflection> {
    const now = formatDateTime(new Date())
    const reflection: Reflection = {
      id: generateId(),
      ...input,
      createdAt: now,
      updatedAt: now,
      synced: false,
    }
    this.reflections.set(reflection.id, reflection)
    if (this.autoSaveEnabled) await this.saveToLocalStorage()
    return reflection
  }

  async getReflection(id: string): Promise<Reflection | null> {
    return this.reflections.get(id) ?? null
  }

  async getAllReflections(): Promise<Reflection[]> {
    return Array.from(this.reflections.values())
  }

  async updateReflection(id: string, input: UpdateReflectionInput): Promise<Reflection | null> {
    const existing = this.reflections.get(id)
    if (!existing) return null
    const updated: Reflection = {
      ...existing,
      ...input,
      id,
      createdAt: existing.createdAt,
      synced: false,
      updatedAt: formatDateTime(new Date()),
    }
    this.reflections.set(id, updated)
    if (this.autoSaveEnabled) await this.saveToLocalStorage()
    return updated
  }

  async deleteReflection(id: string): Promise<boolean> {
    const result = this.reflections.delete(id)
    if (this.autoSaveEnabled) await this.saveToLocalStorage()
    return result
  }

  async getReflectionsByDateRange(start: string, end: string): Promise<Reflection[]> {
    return Array.from(this.reflections.values()).filter(
      (r) => r.date >= start && r.date <= end
    )
  }

  async getUnsyncedReflections(): Promise<Reflection[]> {
    return Array.from(this.reflections.values()).filter((r) => !r.synced)
  }

  async markReflectionSynced(id: string): Promise<void> {
    const r = this.reflections.get(id)
    if (r) {
      r.synced = true
      this.reflections.set(id, r)
    }
    if (this.autoSaveEnabled) await this.saveToLocalStorage()
  }

  // ---- Upsert（拉取合并用：保留原始 ID 和所有字段）----

  async upsertTask(task: Task): Promise<Task> {
    this.tasks.set(task.id, task)
    if (this.autoSaveEnabled) await this.saveToLocalStorage()
    return task
  }

  async upsertReflection(reflection: Reflection): Promise<Reflection> {
    this.reflections.set(reflection.id, reflection)
    if (this.autoSaveEnabled) await this.saveToLocalStorage()
    return reflection
  }

  async upsertSession(session: Session): Promise<Session> {
    this.sessions.set(session.id, session)
    if (this.autoSaveEnabled) await this.saveToLocalStorage()
    return session
  }

  // ---- Sessions ----
  async createSession(input: CreateSessionInput): Promise<Session> {
    const session: Session = {
      id: generateId(),
      ...input,
      endedAt: input.completed ? formatDateTime(new Date()) : null,
      synced: false,
    }
    this.sessions.set(session.id, session)
    if (this.autoSaveEnabled) await this.saveToLocalStorage()
    return session
  }

  async getSession(id: string): Promise<Session | null> {
    return this.sessions.get(id) ?? null
  }

  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values())
  }

  async updateSession(id: string, input: Partial<Session>): Promise<Session | null> {
    const existing = this.sessions.get(id)
    if (!existing) return null
    const updated: Session = { ...existing, ...input, id }
    this.sessions.set(id, updated)
    if (this.autoSaveEnabled) await this.saveToLocalStorage()
    return updated
  }

  async deleteSession(id: string): Promise<boolean> {
    const result = this.sessions.delete(id)
    if (this.autoSaveEnabled) await this.saveToLocalStorage()
    return result
  }

  async getSessionsByDateRange(start: string, end: string): Promise<Session[]> {
    const endDate = new Date(end + 'T23:59:59')
    const startDate = new Date(start + 'T00:00:00')
    return Array.from(this.sessions.values()).filter(
      (s) => {
        const d = new Date(s.startedAt)
        return d >= startDate && d <= endDate
      }
    )
  }

  async getSessionsByTask(taskId: string): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter((s) => s.taskId === taskId)
  }

  async getUnsyncedSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter((s) => !s.synced)
  }

  async markSessionSynced(id: string): Promise<void> {
    const s = this.sessions.get(id)
    if (s) {
      s.synced = true
      this.sessions.set(id, s)
    }
    if (this.autoSaveEnabled) await this.saveToLocalStorage()
  }

  // ---- Sync ----
  async getSyncStatus(): Promise<SyncStatus> {
    const pendingTasks = Array.from(this.tasks.values()).filter((t) => !t.synced).length
    const pendingReflections = Array.from(this.reflections.values()).filter((r) => !r.synced).length
    const pendingSessions = Array.from(this.sessions.values()).filter((s) => !s.synced).length
    const lastSync = this.syncLog.length > 0
      ? this.syncLog[this.syncLog.length - 1].syncedAt
      : null
    return {
      lastSyncAt: lastSync,
      pendingCount: pendingTasks + pendingReflections + pendingSessions,
      isSyncing: false,
    }
  }

  async recordSync(entityType: string, entityId: string): Promise<void> {
    this.syncLog.push({
      id: generateId(),
      entityType,
      entityId,
      syncedAt: formatDateTime(new Date()),
    })
  }

  async clearAll(): Promise<void> {
    this.tasks.clear()
    this.reflections.clear()
    this.sessions.clear()
    this.syncLog = []
    if (this.autoSaveEnabled) await this.saveToLocalStorage()
  }
}

// ============================================================
// SQL 数据库服务
// ============================================================

class SqliteDatabase {
  private db: Database | null = null
  private initialized = false

  private async getDb(): Promise<Database> {
    if (this.db) return this.db
    // 动态导入 Tauri SQL 插件
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plugin = await import('@tauri-apps/plugin-sql') as any
    this.db = await plugin.load(`sqlite:${DB_FILENAME}`) as Database
    return this.db
  }

  async init(): Promise<void> {
    if (this.initialized) return
    try {
      const db = await this.getDb()
      await db.execute(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT DEFAULT '',
          status TEXT NOT NULL DEFAULT 'todo',
          priority TEXT NOT NULL DEFAULT 'medium',
          estimated_pomodoros INTEGER DEFAULT 1,
          actual_pomodoros INTEGER DEFAULT 0,
          tags TEXT DEFAULT '[]',
          due_date TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          synced INTEGER DEFAULT 0
        )
      `)
      await db.execute(`
        CREATE TABLE IF NOT EXISTS reflections (
          id TEXT PRIMARY KEY,
          date TEXT NOT NULL,
          content TEXT NOT NULL,
          mood TEXT NOT NULL DEFAULT 'normal',
          related_task_ids TEXT DEFAULT '[]',
          tags TEXT DEFAULT '[]',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          synced INTEGER DEFAULT 0
        )
      `)
      await db.execute(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          task_id TEXT,
          type TEXT NOT NULL,
          duration INTEGER NOT NULL,
          completed INTEGER DEFAULT 0,
          started_at TEXT NOT NULL,
          ended_at TEXT,
          synced INTEGER DEFAULT 0
        )
      `)
      await db.execute(`
        CREATE TABLE IF NOT EXISTS sync_log (
          id TEXT PRIMARY KEY,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          synced_at TEXT NOT NULL
        )
      `)
      this.initialized = true
    } catch (err) {
      console.error('数据库初始化失败:', err)
      throw err
    }
  }

  // ---- 辅助方法：执行查询并返回行数组 ----
  private async queryRows(sql: string, bind?: SqlValue[]): Promise<Record<string, SqlValue>[]> {
    const db = await this.getDb()
    return db.select<Record<string, SqlValue>[]>(sql, bind) as unknown as Record<string, SqlValue>[]
  }

  private rowToTask(row: Record<string, SqlValue>): Task {
    return {
      id: row.id as string,
      title: row.title as string,
      description: row.description as string,
      status: row.status as Task['status'],
      priority: row.priority as Task['priority'],
      estimatedPomodoros: row.estimated_pomodoros as number,
      actualPomodoros: row.actual_pomodoros as number,
      tags: JSON.parse(row.tags as string),
      dueDate: row.due_date as string | null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      synced: Boolean(row.synced),
    }
  }

  private rowToReflection(row: Record<string, SqlValue>): Reflection {
    return {
      id: row.id as string,
      date: row.date as string,
      content: row.content as string,
      mood: row.mood as Reflection['mood'],
      relatedTaskIds: JSON.parse(row.related_task_ids as string),
      tags: JSON.parse(row.tags as string),
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      synced: Boolean(row.synced),
    }
  }

  private rowToSession(row: Record<string, SqlValue>): Session {
    return {
      id: row.id as string,
      taskId: row.task_id as string | null,
      type: row.type as Session['type'],
      duration: row.duration as number,
      completed: Boolean(row.completed),
      startedAt: row.started_at as string,
      endedAt: row.ended_at as string | null,
      synced: Boolean(row.synced),
    }
  }

  // ---- Tasks ----
  async createTask(input: CreateTaskInput): Promise<Task> {
    const db = await this.getDb()
    const id = generateId()
    const now = formatDateTime(new Date())
    await db.execute(
      `INSERT INTO tasks (id, title, description, status, priority, estimated_pomodoros, actual_pomodoros, tags, due_date, created_at, updated_at, synced)
       VALUES (?, ?, ?, 'todo', ?, ?, 0, ?, ?, ?, ?, 0)`,
      [id, input.title, input.description, input.priority, input.estimatedPomodoros, JSON.stringify(input.tags), input.dueDate, now, now]
    )
    return {
      id,
      title: input.title,
      description: input.description,
      status: 'todo',
      priority: input.priority,
      estimatedPomodoros: input.estimatedPomodoros,
      actualPomodoros: 0,
      tags: input.tags,
      dueDate: input.dueDate,
      createdAt: now,
      updatedAt: now,
      synced: false,
    }
  }

  async getTask(id: string): Promise<Task | null> {
    const rows = await this.queryRows('SELECT * FROM tasks WHERE id = ?', [id])
    return rows.length > 0 ? this.rowToTask(rows[0]) : null
  }

  async getAllTasks(): Promise<Task[]> {
    const rows = await this.queryRows('SELECT * FROM tasks ORDER BY created_at DESC')
    return rows.map((r) => this.rowToTask(r))
  }

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
    const existing = await this.getTask(id)
    if (!existing) return null

    const db = await this.getDb()
    const now = formatDateTime(new Date())
    const title = input.title ?? existing.title
    const description = input.description ?? existing.description
    const status = input.status ?? existing.status
    const priority = input.priority ?? existing.priority
    const estimatedPomodoros = input.estimatedPomodoros ?? existing.estimatedPomodoros
    const actualPomodoros = input.actualPomodoros ?? existing.actualPomodoros
    const tags = input.tags ?? existing.tags
    const dueDate = input.dueDate !== undefined ? input.dueDate : existing.dueDate

    await db.execute(
      `UPDATE tasks SET title=?, description=?, status=?, priority=?, estimated_pomodoros=?, actual_pomodoros=?, tags=?, due_date=?, updated_at=?, synced=0
       WHERE id=?`,
      [title, description, status, priority, estimatedPomodoros, actualPomodoros, JSON.stringify(tags), dueDate, now, id]
    )

    return {
      ...existing,
      title,
      description,
      status,
      priority,
      estimatedPomodoros,
      actualPomodoros,
      tags,
      dueDate,
      updatedAt: now,
      synced: false,
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    const db = await this.getDb()
    const result = await db.execute('DELETE FROM tasks WHERE id = ?', [id])
    return result > 0
  }

  async getTasksByDate(date: string): Promise<Task[]> {
    const rows = await this.queryRows(
      `SELECT * FROM tasks WHERE DATE(created_at) = ? OR (due_date IS NOT NULL AND DATE(due_date) = ?) ORDER BY created_at DESC`,
      [date, date]
    )
    return rows.map((r) => this.rowToTask(r))
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    const rows = await this.queryRows(
      'SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC',
      [status]
    )
    return rows.map((r) => this.rowToTask(r))
  }

  async getUnsyncedTasks(): Promise<Task[]> {
    const rows = await this.queryRows('SELECT * FROM tasks WHERE synced = 0')
    return rows.map((r) => this.rowToTask(r))
  }

  async markTaskSynced(id: string): Promise<void> {
    const db = await this.getDb()
    await db.execute('UPDATE tasks SET synced = 1 WHERE id = ?', [id])
  }

  // ---- Reflections ----
  async createReflection(input: CreateReflectionInput): Promise<Reflection> {
    const db = await this.getDb()
    const id = generateId()
    const now = formatDateTime(new Date())
    await db.execute(
      `INSERT INTO reflections (id, date, content, mood, related_task_ids, tags, created_at, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [id, input.date, input.content, input.mood, JSON.stringify(input.relatedTaskIds), JSON.stringify(input.tags), now, now]
    )
    return {
      id,
      date: input.date,
      content: input.content,
      mood: input.mood,
      relatedTaskIds: input.relatedTaskIds,
      tags: input.tags,
      createdAt: now,
      updatedAt: now,
      synced: false,
    }
  }

  async getReflection(id: string): Promise<Reflection | null> {
    const rows = await this.queryRows('SELECT * FROM reflections WHERE id = ?', [id])
    return rows.length > 0 ? this.rowToReflection(rows[0]) : null
  }

  async getAllReflections(): Promise<Reflection[]> {
    const rows = await this.queryRows('SELECT * FROM reflections ORDER BY date DESC, created_at DESC')
    return rows.map((r) => this.rowToReflection(r))
  }

  async updateReflection(id: string, input: UpdateReflectionInput): Promise<Reflection | null> {
    const existing = await this.getReflection(id)
    if (!existing) return null

    const db = await this.getDb()
    const now = formatDateTime(new Date())
    const date = input.date ?? existing.date
    const content = input.content ?? existing.content
    const mood = input.mood ?? existing.mood
    const relatedTaskIds = input.relatedTaskIds ?? existing.relatedTaskIds
    const tags = input.tags ?? existing.tags

    await db.execute(
      `UPDATE reflections SET date=?, content=?, mood=?, related_task_ids=?, tags=?, updated_at=?, synced=0
       WHERE id=?`,
      [date, content, mood, JSON.stringify(relatedTaskIds), JSON.stringify(tags), now, id]
    )

    return {
      ...existing,
      date,
      content,
      mood,
      relatedTaskIds,
      tags,
      updatedAt: now,
      synced: false,
    }
  }

  async deleteReflection(id: string): Promise<boolean> {
    const db = await this.getDb()
    const result = await db.execute('DELETE FROM reflections WHERE id = ?', [id])
    return result > 0
  }

  async getReflectionsByDateRange(start: string, end: string): Promise<Reflection[]> {
    const rows = await this.queryRows(
      'SELECT * FROM reflections WHERE date >= ? AND date <= ? ORDER BY date DESC, created_at DESC',
      [start, end]
    )
    return rows.map((r) => this.rowToReflection(r))
  }

  async getUnsyncedReflections(): Promise<Reflection[]> {
    const rows = await this.queryRows('SELECT * FROM reflections WHERE synced = 0')
    return rows.map((r) => this.rowToReflection(r))
  }

  async markReflectionSynced(id: string): Promise<void> {
    const db = await this.getDb()
    await db.execute('UPDATE reflections SET synced = 1 WHERE id = ?', [id])
  }

  // ---- Upsert（拉取合并用：INSERT OR REPLACE 保留原始数据）----

  async upsertTask(task: Task): Promise<Task> {
    const db = await this.getDb()
    await db.execute(
      `INSERT OR REPLACE INTO tasks (id, title, description, status, priority, estimated_pomodoros, actual_pomodoros, tags, due_date, created_at, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [task.id, task.title, task.description, task.status, task.priority, task.estimatedPomodoros, task.actualPomodoros, JSON.stringify(task.tags), task.dueDate, task.createdAt, task.updatedAt, task.synced ? 1 : 0]
    )
    return task
  }

  async upsertReflection(reflection: Reflection): Promise<Reflection> {
    const db = await this.getDb()
    await db.execute(
      `INSERT OR REPLACE INTO reflections (id, date, content, mood, related_task_ids, tags, created_at, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reflection.id, reflection.date, reflection.content, reflection.mood, JSON.stringify(reflection.relatedTaskIds), JSON.stringify(reflection.tags), reflection.createdAt, reflection.updatedAt, reflection.synced ? 1 : 0]
    )
    return reflection
  }

  async upsertSession(session: Session): Promise<Session> {
    const db = await this.getDb()
    await db.execute(
      `INSERT OR REPLACE INTO sessions (id, task_id, type, duration, completed, started_at, ended_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [session.id, session.taskId, session.type, session.duration, session.completed ? 1 : 0, session.startedAt, session.endedAt, session.synced ? 1 : 0]
    )
    return session
  }

  // ---- Sessions ----
  async createSession(input: CreateSessionInput): Promise<Session> {
    const db = await this.getDb()
    const id = generateId()
    const endedAt = input.completed ? formatDateTime(new Date()) : null
    await db.execute(
      `INSERT INTO sessions (id, task_id, type, duration, completed, started_at, ended_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [id, input.taskId, input.type, input.duration, input.completed ? 1 : 0, input.startedAt, endedAt]
    )
    return {
      id,
      taskId: input.taskId,
      type: input.type,
      duration: input.duration,
      completed: input.completed,
      startedAt: input.startedAt,
      endedAt,
      synced: false,
    }
  }

  async getSession(id: string): Promise<Session | null> {
    const rows = await this.queryRows('SELECT * FROM sessions WHERE id = ?', [id])
    return rows.length > 0 ? this.rowToSession(rows[0]) : null
  }

  async getAllSessions(): Promise<Session[]> {
    const rows = await this.queryRows('SELECT * FROM sessions ORDER BY started_at DESC')
    return rows.map((r) => this.rowToSession(r))
  }

  async updateSession(id: string, input: Partial<Session>): Promise<Session | null> {
    const existing = await this.getSession(id)
    if (!existing) return null

    const db = await this.getDb()
    const completed = input.completed ?? existing.completed
    const endedAt = input.endedAt !== undefined ? input.endedAt : existing.endedAt

    await db.execute(
      'UPDATE sessions SET completed=?, ended_at=? WHERE id=?',
      [completed ? 1 : 0, endedAt, id]
    )

    return { ...existing, completed, endedAt }
  }

  async deleteSession(id: string): Promise<boolean> {
    const db = await this.getDb()
    const result = await db.execute('DELETE FROM sessions WHERE id = ?', [id])
    return result > 0
  }

  async getSessionsByDateRange(start: string, end: string): Promise<Session[]> {
    const rows = await this.queryRows(
      'SELECT * FROM sessions WHERE DATE(started_at) >= ? AND DATE(started_at) <= ? ORDER BY started_at DESC',
      [start, end]
    )
    return rows.map((r) => this.rowToSession(r))
  }

  async getSessionsByTask(taskId: string): Promise<Session[]> {
    const rows = await this.queryRows(
      'SELECT * FROM sessions WHERE task_id = ? ORDER BY started_at DESC',
      [taskId]
    )
    return rows.map((r) => this.rowToSession(r))
  }

  async getUnsyncedSessions(): Promise<Session[]> {
    const rows = await this.queryRows('SELECT * FROM sessions WHERE synced = 0')
    return rows.map((r) => this.rowToSession(r))
  }

  async markSessionSynced(id: string): Promise<void> {
    const db = await this.getDb()
    await db.execute('UPDATE sessions SET synced = 1 WHERE id = ?', [id])
  }

  // ---- Sync ----
  async getSyncStatus(): Promise<SyncStatus> {
    const taskRows = await this.queryRows('SELECT COUNT(*) as count FROM tasks WHERE synced = 0')
    const reflectionRows = await this.queryRows('SELECT COUNT(*) as count FROM reflections WHERE synced = 0')
    const sessionRows = await this.queryRows('SELECT COUNT(*) as count FROM sessions WHERE synced = 0')
    const syncLogRows = await this.queryRows(
      'SELECT synced_at FROM sync_log ORDER BY synced_at DESC LIMIT 1'
    )

    return {
      lastSyncAt: syncLogRows.length > 0 ? (syncLogRows[0].synced_at as string) : null,
      pendingCount: (taskRows[0].count as number) + (reflectionRows[0].count as number) + (sessionRows[0].count as number),
      isSyncing: false,
    }
  }

  async recordSync(entityType: string, entityId: string): Promise<void> {
    const db = await this.getDb()
    const id = generateId()
    const now = formatDateTime(new Date())
    await db.execute(
      'INSERT INTO sync_log (id, entity_type, entity_id, synced_at) VALUES (?, ?, ?, ?)',
      [id, entityType, entityId, now]
    )
  }

  async clearAll(): Promise<void> {
    const db = await this.getDb()
    await db.execute('DELETE FROM sessions')
    await db.execute('DELETE FROM reflections')
    await db.execute('DELETE FROM tasks')
    await db.execute('DELETE FROM sync_log')
  }
}

// ============================================================
// 统一数据库接口
// ============================================================

interface DatabaseService {
  init(): Promise<void>
  createTask(input: CreateTaskInput): Promise<Task>
  getTask(id: string): Promise<Task | null>
  getAllTasks(): Promise<Task[]>
  updateTask(id: string, input: UpdateTaskInput): Promise<Task | null>
  deleteTask(id: string): Promise<boolean>
  getTasksByDate(date: string): Promise<Task[]>
  getTasksByStatus(status: string): Promise<Task[]>
  getUnsyncedTasks(): Promise<Task[]>
  markTaskSynced(id: string): Promise<void>
  createReflection(input: CreateReflectionInput): Promise<Reflection>
  getReflection(id: string): Promise<Reflection | null>
  getAllReflections(): Promise<Reflection[]>
  updateReflection(id: string, input: UpdateReflectionInput): Promise<Reflection | null>
  deleteReflection(id: string): Promise<boolean>
  getReflectionsByDateRange(start: string, end: string): Promise<Reflection[]>
  getUnsyncedReflections(): Promise<Reflection[]>
  markReflectionSynced(id: string): Promise<void>
  upsertTask(task: Task): Promise<Task>
  upsertReflection(reflection: Reflection): Promise<Reflection>
  upsertSession(session: Session): Promise<Session>
  createSession(input: CreateSessionInput): Promise<Session>
  getSession(id: string): Promise<Session | null>
  getAllSessions(): Promise<Session[]>
  updateSession(id: string, input: Partial<Session>): Promise<Session | null>
  deleteSession(id: string): Promise<boolean>
  getSessionsByDateRange(start: string, end: string): Promise<Session[]>
  getSessionsByTask(taskId: string): Promise<Session[]>
  getUnsyncedSessions(): Promise<Session[]>
  markSessionSynced(id: string): Promise<void>
  getSyncStatus(): Promise<SyncStatus>
  recordSync(entityType: string, entityId: string): Promise<void>
  clearAll(): Promise<void>
}

// ============================================================
// 创建数据库实例（懒加载单例）
// ============================================================

let dbInstance: DatabaseService | null = null
let dbInitPromise: Promise<DatabaseService> | null = null

async function createDatabase(): Promise<DatabaseService> {
  if (isTauriAvailable()) {
    try {
      const sqlDb = new SqliteDatabase()
      await sqlDb.init()
      console.log('[DB] 使用 SQLite 数据库')
      return sqlDb
    } catch (err) {
      console.warn('[DB] SQLite 初始化失败，回退到内存存储:', err)
    }
  }
  console.log('[DB] 使用内存存储（开发模式）')
  const memStore = new MemoryStore()
  await memStore.init()
  return memStore
}

function ensureDb(): Promise<DatabaseService> {
  if (dbInstance) return Promise.resolve(dbInstance)
  if (!dbInitPromise) {
    dbInitPromise = createDatabase().then((db) => {
      dbInstance = db
      return db
    })
  }
  return dbInitPromise
}

/**
 * 数据库服务单例
 * 所有方法都是异步的，首次调用时自动初始化
 */
export const db: DatabaseService = {
  init: () => ensureDb().then((d) => d.init()),
  createTask: (input) => ensureDb().then((d) => d.createTask(input)),
  getTask: (id) => ensureDb().then((d) => d.getTask(id)),
  getAllTasks: () => ensureDb().then((d) => d.getAllTasks()),
  updateTask: (id, input) => ensureDb().then((d) => d.updateTask(id, input)),
  deleteTask: (id) => ensureDb().then((d) => d.deleteTask(id)),
  getTasksByDate: (date) => ensureDb().then((d) => d.getTasksByDate(date)),
  getTasksByStatus: (status) => ensureDb().then((d) => d.getTasksByStatus(status)),
  getUnsyncedTasks: () => ensureDb().then((d) => d.getUnsyncedTasks()),
  markTaskSynced: (id) => ensureDb().then((d) => d.markTaskSynced(id)),
  createReflection: (input) => ensureDb().then((d) => d.createReflection(input)),
  getReflection: (id) => ensureDb().then((d) => d.getReflection(id)),
  getAllReflections: () => ensureDb().then((d) => d.getAllReflections()),
  updateReflection: (id, input) => ensureDb().then((d) => d.updateReflection(id, input)),
  deleteReflection: (id) => ensureDb().then((d) => d.deleteReflection(id)),
  getReflectionsByDateRange: (start, end) => ensureDb().then((d) => d.getReflectionsByDateRange(start, end)),
  getUnsyncedReflections: () => ensureDb().then((d) => d.getUnsyncedReflections()),
  markReflectionSynced: (id) => ensureDb().then((d) => d.markReflectionSynced(id)),
  upsertTask: (task) => ensureDb().then((d) => d.upsertTask(task)),
  upsertReflection: (reflection) => ensureDb().then((d) => d.upsertReflection(reflection)),
  upsertSession: (session) => ensureDb().then((d) => d.upsertSession(session)),
  createSession: (input) => ensureDb().then((d) => d.createSession(input)),
  getSession: (id) => ensureDb().then((d) => d.getSession(id)),
  getAllSessions: () => ensureDb().then((d) => d.getAllSessions()),
  updateSession: (id, input) => ensureDb().then((d) => d.updateSession(id, input)),
  deleteSession: (id) => ensureDb().then((d) => d.deleteSession(id)),
  getSessionsByDateRange: (start, end) => ensureDb().then((d) => d.getSessionsByDateRange(start, end)),
  getSessionsByTask: (taskId) => ensureDb().then((d) => d.getSessionsByTask(taskId)),
  getUnsyncedSessions: () => ensureDb().then((d) => d.getUnsyncedSessions()),
  markSessionSynced: (id) => ensureDb().then((d) => d.markSessionSynced(id)),
  getSyncStatus: () => ensureDb().then((d) => d.getSyncStatus()),
  recordSync: (entityType, entityId) => ensureDb().then((d) => d.recordSync(entityType, entityId)),
  clearAll: () => ensureDb().then((d) => d.clearAll()),
}

/** 手动初始化数据库（可选，访问时会自动初始化） */
export async function initDatabase(): Promise<void> {
  const instance = await ensureDb()
  await instance.init()
}
