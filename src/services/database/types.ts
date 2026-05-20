// ============================================================
// PomodoroX - 数据库类型定义
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

// ---- Tauri SQL 插件类型 ----

export type SqlValue = string | number | null | Uint8Array;

export interface Database {
  execute(sql: string, bind?: SqlValue[]): Promise<number>;
  select<T>(sql: string, bind?: SqlValue[]): Promise<T[]>;
}

// ---- 统一数据库服务接口 ----

export interface DatabaseService {
  init(): Promise<void>;
  /** 执行事务 */
  transaction<T>(fn: () => Promise<T>): Promise<T>;
  createTask(input: CreateTaskInput): Promise<Task>;
  getTask(id: string): Promise<Task | null>;
  getAllTasks(): Promise<Task[]>;
  updateTask(id: string, input: UpdateTaskInput): Promise<Task | null>;
  deleteTask(id: string): Promise<boolean>;
  getTasksByDate(date: string): Promise<Task[]>;
  getTasksByStatus(status: string): Promise<Task[]>;
  getUnsyncedTasks(): Promise<Task[]>;
  markTaskSynced(id: string): Promise<void>;
  createReflection(input: CreateReflectionInput): Promise<Reflection>;
  getReflection(id: string): Promise<Reflection | null>;
  getAllReflections(): Promise<Reflection[]>;
  updateReflection(
    id: string,
    input: UpdateReflectionInput
  ): Promise<Reflection | null>;
  deleteReflection(id: string): Promise<boolean>;
  getReflectionsByDateRange(start: string, end: string): Promise<Reflection[]>;
  getUnsyncedReflections(): Promise<Reflection[]>;
  markReflectionSynced(id: string): Promise<void>;
  upsertTask(task: Task): Promise<Task>;
  upsertReflection(reflection: Reflection): Promise<Reflection>;
  upsertSession(session: Session): Promise<Session>;
  createSession(input: CreateSessionInput): Promise<Session>;
  getSession(id: string): Promise<Session | null>;
  getAllSessions(): Promise<Session[]>;
  updateSession(id: string, input: Partial<Session>): Promise<Session | null>;
  deleteSession(id: string): Promise<boolean>;
  getSessionsByDateRange(start: string, end: string): Promise<Session[]>;
  getSessionsByTask(taskId: string): Promise<Session[]>;
  getUnsyncedSessions(): Promise<Session[]>;
  markSessionSynced(id: string): Promise<void>;
  getSyncStatus(): Promise<SyncStatus>;
  recordSync(entityType: string, entityId: string): Promise<void>;
  recordSyncConflict(
    entry: Omit<ConflictLogEntry, "id">
  ): Promise<ConflictLogEntry>;
  getSyncConflicts(): Promise<ConflictLogEntry[]>;
  clearSyncConflicts(): Promise<void>;
  clearAll(): Promise<void>;

  // ---- Outbox ----
  writeOutboxEvent(event: OutboxEvent): Promise<void>;
  getUnpushedOutboxEvents(): Promise<OutboxEvent[]>;
  removePushedOutboxEvents(eventIds: string[]): Promise<void>;
  getOutboxEventCount(): Promise<number>;
  markOutboxEventProcessed(eventId: string): Promise<void>;
  isOutboxEventProcessed(eventId: string): Promise<boolean>;
  filterUnprocessedOutboxEvents(events: OutboxEvent[]): Promise<OutboxEvent[]>;

  // ---- Tombstones ----
  markTombstone(
    entityType: string,
    entityId: string,
    deletedAt?: string
  ): Promise<void>;
  getTombstone(
    entityType: string,
    entityId: string
  ): Promise<TombstoneRecord | null>;
  removeTombstone(entityType: string, entityId: string): Promise<void>;
  getAllTombstones(): Promise<TombstoneRecord[]>;
  upsertTombstones(tombstones: TombstoneRecord[]): Promise<void>;

  // ---- Outbox Cleanup ----
  clearOutbox(): Promise<void>;
  clearProcessedEvents(): Promise<void>;
}
