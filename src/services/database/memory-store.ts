// ============================================================
// PomodoroX - 内存回退存储 (MemoryStore)
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
  ConflictLogEntry,
  OutboxEvent,
  TombstoneRecord,
} from "@/types";
import { generateId } from "@/utils/id";
import { formatDateTime } from "@/utils/format";
import { SCHEMA_VERSION } from "@/utils/constants";
import { isTauriAvailable } from "@/utils/tauri";
import { get, set } from "idb-keyval";
import {
  validateCreateTaskInput,
  validateCreateReflectionInput,
  validateCreateSessionInput,
} from "./validation";

// ============================================================
// 内存数据迁移
// ============================================================

/**
 * 迁移 MemoryStore 的序列化数据
 * 根据 _schemaVersion 字段，逐级升级到最新版本
 */
export function migrateMemoryData(
  data: Record<string, unknown>
): Record<string, unknown> {
  let version = (data._schemaVersion as number) ?? 0;

  if (version < 1) {
    // v0 -> v1：给 task/session 加 plan/completion 默认值
    if (data.tasks) {
      data.tasks = (data.tasks as [string, unknown][]).map(([id, t]) => [
        id,
        {
          ...(t as Record<string, unknown>),
          plan: (t as Record<string, string>).plan ?? "",
          completion: (t as Record<string, string>).completion ?? "",
        },
      ]);
    }
    if (data.sessions) {
      data.sessions = (data.sessions as [string, unknown][]).map(([id, s]) => [
        id,
        {
          ...(s as Record<string, unknown>),
          plan: (s as Record<string, string>).plan ?? "",
          completion: (s as Record<string, string>).completion ?? "",
        },
      ]);
    }
    version = 1;
  }

  if (version < 2) {
    // v1 -> v2：给 session 补 updated_at；确保 conflictLog 存在
    if (data.sessions) {
      data.sessions = (data.sessions as [string, unknown][]).map(([id, s]) => {
        const sess = s as Record<string, string>;
        return [
          id,
          {
            ...sess,
            updatedAt:
              sess.updatedAt ??
              sess.endedAt ??
              sess.startedAt ??
              formatDateTime(new Date()),
          },
        ];
      });
    }
    if (!data.conflictLog) data.conflictLog = [];
    version = 2;
  }

  if (version < 3) {
    // v2 -> v3：添加 outbox 和 tombstone 存储（从独立 IndexedDB 迁移到统一存储）
    if (!data.outboxEvents) data.outboxEvents = [];
    if (!data.processedEvents) data.processedEvents = [];
    if (!data.tombstones) data.tombstones = [];
    version = 3;
  }

  data._schemaVersion = version;
  return data;
}

// ============================================================
// 内存回退存储
// ============================================================

export class MemoryStore {
  private tasks = new Map<string, Task>();
  private reflections = new Map<string, Reflection>();
  private sessions = new Map<string, Session>();
  private syncLog: {
    id: string;
    entityType: string;
    entityId: string;
    syncedAt: string;
  }[] = [];
  private conflictLog: ConflictLogEntry[] = [];
  private outboxEvents = new Map<string, OutboxEvent>();
  private processedEvents = new Map<string, string>(); // eventId -> processedAt
  private tombstones = new Map<string, TombstoneRecord>(); // "entityType:entityId" -> record

  /** IndexedDB Key 常量 */
  private static readonly STORAGE_KEY = "pomodorox-memorystore";

  /** 自动保存标志 - init() 中根据环境设置 */
  private autoSaveEnabled = false;

  /** 序列化保存 Promise，防止并发 save 竞态覆盖 */
  private savePromise: Promise<void> | null = null;

  /**
   * 序列化所有数据到 IndexedDB
   * 在每次创建/更新/删除操作后自动调用
   * 使用 idb-keyval（异步、更大容量、不阻塞主线程）
   */
  private async saveToIndexedDB(): Promise<void> {
    // 如果已有保存正在进行，等待它完成后再执行新保存
    if (this.savePromise) {
      await this.savePromise.catch(() => {});
    }
    this.savePromise = this._doSaveToIndexedDB();
    return this.savePromise;
  }

  private async _doSaveToIndexedDB(): Promise<void> {
    try {
      const data = {
        _schemaVersion: SCHEMA_VERSION,
        tasks: Array.from(this.tasks.entries()),
        reflections: Array.from(this.reflections.entries()),
        sessions: Array.from(this.sessions.entries()),
        syncLog: this.syncLog,
        conflictLog: this.conflictLog,
        outboxEvents: Array.from(this.outboxEvents.entries()),
        processedEvents: Array.from(this.processedEvents.entries()),
        tombstones: Array.from(this.tombstones.entries()),
      };
      // 净化数据：移除 Vue Proxy 等不可克隆对象，防止 DataCloneError
      const sanitized = JSON.parse(JSON.stringify(data));
      await set(MemoryStore.STORAGE_KEY, sanitized);
    } catch (err) {
      console.warn("[MemoryStore] IndexedDB 写入失败:", err);
    }
  }

  /**
   * 从 IndexedDB 恢复数据
   * 在 init() 时调用
   */
  private async loadFromIndexedDB(): Promise<void> {
    try {
      const data = await get<{
        _schemaVersion?: number;
        tasks: [string, Task][];
        reflections: [string, Reflection][];
        sessions: [string, Session][];
        syncLog: {
          id: string;
          entityType: string;
          entityId: string;
          syncedAt: string;
        }[];
        conflictLog?: ConflictLogEntry[];
        outboxEvents?: [string, OutboxEvent][];
        processedEvents?: [string, string][];
        tombstones?: [string, TombstoneRecord][];
      }>(MemoryStore.STORAGE_KEY);
      if (!data) return;
      const migrated = migrateMemoryData(data as Record<string, unknown>);
      if (migrated.tasks)
        this.tasks = new Map(migrated.tasks as [string, Task][]);
      if (migrated.reflections)
        this.reflections = new Map(
          migrated.reflections as [string, Reflection][]
        );
      if (migrated.sessions)
        this.sessions = new Map(migrated.sessions as [string, Session][]);
      if (migrated.syncLog)
        this.syncLog = migrated.syncLog as {
          id: string;
          entityType: string;
          entityId: string;
          syncedAt: string;
        }[];
      if (migrated.conflictLog)
        this.conflictLog = migrated.conflictLog as ConflictLogEntry[];
      if (migrated.outboxEvents)
        this.outboxEvents = new Map(
          migrated.outboxEvents as [string, OutboxEvent][]
        );
      if (migrated.processedEvents)
        this.processedEvents = new Map(
          migrated.processedEvents as [string, string][]
        );
      if (migrated.tombstones)
        this.tombstones = new Map(
          migrated.tombstones as [string, TombstoneRecord][]
        );
      if (import.meta.env.DEV)
        console.log("[MemoryStore] 已从 IndexedDB 恢复数据");
    } catch {
      // 兼容旧版 localStorage 数据：尝试从 localStorage 迁移
      try {
        const raw =
          typeof localStorage !== "undefined"
            ? localStorage.getItem(MemoryStore.STORAGE_KEY)
            : null;
        if (raw) {
          const data = JSON.parse(raw);
          const migrated = migrateMemoryData(data);
          if (migrated.tasks)
            this.tasks = new Map(migrated.tasks as [string, Task][]);
          if (migrated.reflections)
            this.reflections = new Map(
              migrated.reflections as [string, Reflection][]
            );
          if (migrated.sessions)
            this.sessions = new Map(migrated.sessions as [string, Session][]);
          if (migrated.syncLog)
            this.syncLog = migrated.syncLog as {
              id: string;
              entityType: string;
              entityId: string;
              syncedAt: string;
            }[];
          if (migrated.conflictLog)
            this.conflictLog = migrated.conflictLog as ConflictLogEntry[];
          if (migrated.outboxEvents)
            this.outboxEvents = new Map(
              migrated.outboxEvents as [string, OutboxEvent][]
            );
          if (migrated.processedEvents)
            this.processedEvents = new Map(
              migrated.processedEvents as [string, string][]
            );
          if (migrated.tombstones)
            this.tombstones = new Map(
              migrated.tombstones as [string, TombstoneRecord][]
            );
          // 迁移到 IndexedDB 后删除旧数据
          localStorage.removeItem(MemoryStore.STORAGE_KEY);
          await this.saveToIndexedDB();
          if (import.meta.env.DEV)
            console.log("[MemoryStore] 已从 localStorage 迁移数据到 IndexedDB");
        }
      } catch {
        console.warn("[MemoryStore] 数据恢复失败，使用空数据");
      }
    }
  }

  async init(): Promise<void> {
    await this.loadFromIndexedDB();
    // 非 Tauri 环境下启用 autoSave（浏览器/移动端 Web）
    if (!isTauriAvailable()) {
      this.autoSaveEnabled = true;
    }
  }

  /** 内存存储事务（内存操作本身原子，直接执行） */
  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    return fn();
  }

  // ---- Tasks ----
  async createTask(input: CreateTaskInput): Promise<Task> {
    validateCreateTaskInput(input);
    const now = formatDateTime(new Date());
    const task: Task = {
      id: generateId(),
      ...input,
      status: "todo",
      actualPomodoros: 0,
      plan: input.plan ?? "",
      completion: input.completion ?? "",
      createdAt: now,
      updatedAt: now,
      synced: false,
    };
    this.tasks.set(task.id, task);
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
    return task;
  }

  async getTask(id: string): Promise<Task | null> {
    return this.tasks.get(id) ?? null;
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
    const existing = this.tasks.get(id);
    if (!existing) return null;
    const updated: Task = {
      ...existing,
      ...input,
      id,
      createdAt: existing.createdAt,
      synced: false,
      updatedAt: formatDateTime(new Date()),
    };
    this.tasks.set(id, updated);
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
    return updated;
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = this.tasks.delete(id);
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
    return result;
  }

  async getTasksByDate(date: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (t) =>
        t.createdAt.startsWith(date) ||
        (t.dueDate && t.dueDate.startsWith(date))
    );
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter((t) => t.status === status);
  }

  async getUnsyncedTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter((t) => !t.synced);
  }

  async markTaskSynced(id: string): Promise<void> {
    const task = this.tasks.get(id);
    if (task) {
      task.synced = true;
      this.tasks.set(id, task);
    }
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
  }

  // ---- Reflections ----
  async createReflection(input: CreateReflectionInput): Promise<Reflection> {
    validateCreateReflectionInput(input);
    const now = formatDateTime(new Date());
    const reflection: Reflection = {
      id: generateId(),
      ...input,
      createdAt: now,
      updatedAt: now,
      synced: false,
    };
    this.reflections.set(reflection.id, reflection);
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
    return reflection;
  }

  async getReflection(id: string): Promise<Reflection | null> {
    return this.reflections.get(id) ?? null;
  }

  async getAllReflections(): Promise<Reflection[]> {
    return Array.from(this.reflections.values());
  }

  async updateReflection(
    id: string,
    input: UpdateReflectionInput
  ): Promise<Reflection | null> {
    const existing = this.reflections.get(id);
    if (!existing) return null;
    const updated: Reflection = {
      ...existing,
      ...input,
      id,
      createdAt: existing.createdAt,
      synced: false,
      updatedAt: formatDateTime(new Date()),
    };
    this.reflections.set(id, updated);
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
    return updated;
  }

  async deleteReflection(id: string): Promise<boolean> {
    const result = this.reflections.delete(id);
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
    return result;
  }

  async getReflectionsByDateRange(
    start: string,
    end: string
  ): Promise<Reflection[]> {
    return Array.from(this.reflections.values()).filter(
      (r) => r.date >= start && r.date <= end
    );
  }

  async getUnsyncedReflections(): Promise<Reflection[]> {
    return Array.from(this.reflections.values()).filter((r) => !r.synced);
  }

  async markReflectionSynced(id: string): Promise<void> {
    const r = this.reflections.get(id);
    if (r) {
      r.synced = true;
      this.reflections.set(id, r);
    }
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
  }

  // ---- Upsert（拉取合并用：保留原始 ID 和所有字段）----

  async upsertTask(task: Task): Promise<Task> {
    this.tasks.set(task.id, task);
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
    return task;
  }

  async upsertReflection(reflection: Reflection): Promise<Reflection> {
    this.reflections.set(reflection.id, reflection);
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
    return reflection;
  }

  async upsertSession(session: Session): Promise<Session> {
    this.sessions.set(session.id, session);
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
    return session;
  }

  // ---- Sessions ----
  async createSession(input: CreateSessionInput): Promise<Session> {
    validateCreateSessionInput(input);
    const now = formatDateTime(new Date());
    const session: Session = {
      id: generateId(),
      ...input,
      endedAt: input.completed ? now : null,
      plan: input.plan ?? "",
      completion: input.completion ?? "",
      synced: false,
      updatedAt: now,
    };
    this.sessions.set(session.id, session);
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
    return session;
  }

  async createSessionAndUpdateTask(
    sessionInput: CreateSessionInput,
    taskId: string,
    updates: UpdateTaskInput
  ): Promise<{ session: Session; updatedTask: Task | null }> {
    return this.transaction(async () => {
      const session = await this.createSession(sessionInput);
      const updatedTask = await this.updateTask(taskId, updates);
      return { session, updatedTask };
    });
  }

  async getSession(id: string): Promise<Session | null> {
    return this.sessions.get(id) ?? null;
  }

  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }

  async updateSession(
    id: string,
    input: Partial<Session>
  ): Promise<Session | null> {
    const existing = this.sessions.get(id);
    if (!existing) return null;
    const updated: Session = {
      ...existing,
      ...input,
      id,
      updatedAt: formatDateTime(new Date()),
    };
    this.sessions.set(id, updated);
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
    return updated;
  }

  async deleteSession(id: string): Promise<boolean> {
    const result = this.sessions.delete(id);
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
    return result;
  }

  async getSessionsByDateRange(start: string, end: string): Promise<Session[]> {
    const endDate = new Date(end + "T23:59:59");
    const startDate = new Date(start + "T00:00:00");
    return Array.from(this.sessions.values()).filter((s) => {
      const d = new Date(s.startedAt);
      return d >= startDate && d <= endDate;
    });
  }

  async getSessionsByTask(taskId: string): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(
      (s) => s.taskId === taskId
    );
  }

  async getUnsyncedSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter((s) => !s.synced);
  }

  async markSessionSynced(id: string): Promise<void> {
    const s = this.sessions.get(id);
    if (s) {
      s.synced = true;
      this.sessions.set(id, s);
    }
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
  }

  // ---- Sync ----
  async getSyncStatus(): Promise<SyncStatus> {
    const pendingTasks = Array.from(this.tasks.values()).filter(
      (t) => !t.synced
    ).length;
    const pendingReflections = Array.from(this.reflections.values()).filter(
      (r) => !r.synced
    ).length;
    const pendingSessions = Array.from(this.sessions.values()).filter(
      (s) => !s.synced
    ).length;
    const lastSync =
      this.syncLog.length > 0
        ? this.syncLog[this.syncLog.length - 1].syncedAt
        : null;
    return {
      lastSyncAt: lastSync,
      pendingCount: pendingTasks + pendingReflections + pendingSessions,
      isSyncing: false,
    };
  }

  async recordSync(entityType: string, entityId: string): Promise<void> {
    this.syncLog.push({
      id: generateId(),
      entityType,
      entityId,
      syncedAt: formatDateTime(new Date()),
    });
  }

  async recordSyncConflict(
    entry: Omit<ConflictLogEntry, "id">
  ): Promise<ConflictLogEntry> {
    const id = generateId();
    const full: ConflictLogEntry = { ...entry, id };
    this.conflictLog.push(full);
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
    return full;
  }

  async getSyncConflicts(): Promise<ConflictLogEntry[]> {
    return [...this.conflictLog];
  }

  async clearSyncConflicts(): Promise<void> {
    this.conflictLog = [];
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
  }

  async clearAll(): Promise<void> {
    this.tasks.clear();
    this.reflections.clear();
    this.sessions.clear();
    this.syncLog = [];
    this.conflictLog = [];
    this.outboxEvents.clear();
    this.processedEvents.clear();
    this.tombstones.clear();
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
  }

  // ---- Outbox ----
  async writeOutboxEvent(event: OutboxEvent): Promise<void> {
    this.outboxEvents.set(event.eventId, event);
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
  }

  async getUnpushedOutboxEvents(): Promise<OutboxEvent[]> {
    const events = Array.from(this.outboxEvents.values());
    events.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    return events;
  }

  async removePushedOutboxEvents(eventIds: string[]): Promise<void> {
    for (const id of eventIds) {
      this.outboxEvents.delete(id);
    }
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
  }

  async getOutboxEventCount(): Promise<number> {
    return this.outboxEvents.size;
  }

  async markOutboxEventProcessed(eventId: string): Promise<void> {
    this.processedEvents.set(eventId, formatDateTime(new Date()));
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
  }

  async isOutboxEventProcessed(eventId: string): Promise<boolean> {
    return this.processedEvents.has(eventId);
  }

  async filterUnprocessedOutboxEvents(
    events: OutboxEvent[]
  ): Promise<OutboxEvent[]> {
    return events.filter((e) => !this.processedEvents.has(e.eventId));
  }

  // ---- Tombstones ----
  async markTombstone(
    entityType: string,
    entityId: string,
    deletedAt?: string
  ): Promise<void> {
    const record: TombstoneRecord = {
      entityId,
      entityType,
      deletedAt: deletedAt ?? formatDateTime(new Date()),
    };
    this.tombstones.set(`${entityType}:${entityId}`, record);
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
  }

  async getTombstone(
    entityType: string,
    entityId: string
  ): Promise<TombstoneRecord | null> {
    return this.tombstones.get(`${entityType}:${entityId}`) ?? null;
  }

  async removeTombstone(entityType: string, entityId: string): Promise<void> {
    this.tombstones.delete(`${entityType}:${entityId}`);
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
  }

  async getAllTombstones(): Promise<TombstoneRecord[]> {
    return Array.from(this.tombstones.values());
  }

  async upsertTombstones(tombstones: TombstoneRecord[]): Promise<void> {
    for (const t of tombstones) {
      this.tombstones.set(`${t.entityType}:${t.entityId}`, t);
    }
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
  }

  // ---- Outbox Cleanup ----
  async clearOutbox(): Promise<void> {
    this.outboxEvents.clear();
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
  }

  async clearProcessedEvents(): Promise<void> {
    this.processedEvents.clear();
    if (this.autoSaveEnabled) await this.saveToIndexedDB();
  }
}
