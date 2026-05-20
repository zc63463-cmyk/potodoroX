// ============================================================
// PomodoroX - 数据库服务
// 统一入口，内部自动选择 SQLite（Tauri）或 MemoryStore（浏览器）
// ============================================================

import { isTauriAvailable } from "@/utils/tauri";
import { MemoryStore } from "./database/memory-store";
import { SqliteDatabase } from "./database/sqlite-store";
import type { DatabaseService } from "./database/types";

// ---- 子模块 re-export ----
export { migrateMemoryData } from "./database/memory-store";
export { MemoryStore } from "./database/memory-store";
export { SqliteDatabase } from "./database/sqlite-store";
export type { DatabaseService, SqlValue, Database } from "./database/types";

// ---- 懒加载单例 ----

let dbInstance: DatabaseService | null = null;
let dbInitPromise: Promise<DatabaseService> | null = null;

async function createDatabase(): Promise<DatabaseService> {
  if (isTauriAvailable()) {
    try {
      const sqlDb = new SqliteDatabase();
      await sqlDb.init();
      if (import.meta.env.DEV) console.log("[DB] 使用 SQLite 数据库");
      return sqlDb;
    } catch (err) {
      console.warn("[DB] SQLite 初始化失败，回退到内存存储:", err);
    }
  }
  if (import.meta.env.DEV) console.log("[DB] 使用内存存储（开发模式）");
  const memStore = new MemoryStore();
  await memStore.init();
  return memStore;
}

function ensureDb(): Promise<DatabaseService> {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (!dbInitPromise) {
    dbInitPromise = createDatabase()
      .then((db) => {
        dbInstance = db;
        return db;
      })
      .catch((err) => {
        // 初始化失败时重置 promise，允许下次调用重试
        dbInitPromise = null;
        throw err;
      });
  }
  return dbInitPromise;
}

/**
 * 数据库服务单例
 * 所有方法都是异步的，首次调用时自动初始化
 */
export const db: DatabaseService = {
  init: () => ensureDb().then((d) => d.init()),
  transaction: (fn) => ensureDb().then((d) => d.transaction(fn)),
  createTask: (input) => ensureDb().then((d) => d.createTask(input)),
  getTask: (id) => ensureDb().then((d) => d.getTask(id)),
  getAllTasks: () => ensureDb().then((d) => d.getAllTasks()),
  updateTask: (id, input) => ensureDb().then((d) => d.updateTask(id, input)),
  deleteTask: (id) => ensureDb().then((d) => d.deleteTask(id)),
  getTasksByDate: (date) => ensureDb().then((d) => d.getTasksByDate(date)),
  getTasksByStatus: (status) =>
    ensureDb().then((d) => d.getTasksByStatus(status)),
  getUnsyncedTasks: () => ensureDb().then((d) => d.getUnsyncedTasks()),
  markTaskSynced: (id) => ensureDb().then((d) => d.markTaskSynced(id)),
  createReflection: (input) =>
    ensureDb().then((d) => d.createReflection(input)),
  getReflection: (id) => ensureDb().then((d) => d.getReflection(id)),
  getAllReflections: () => ensureDb().then((d) => d.getAllReflections()),
  updateReflection: (id, input) =>
    ensureDb().then((d) => d.updateReflection(id, input)),
  deleteReflection: (id) => ensureDb().then((d) => d.deleteReflection(id)),
  getReflectionsByDateRange: (start, end) =>
    ensureDb().then((d) => d.getReflectionsByDateRange(start, end)),
  getUnsyncedReflections: () =>
    ensureDb().then((d) => d.getUnsyncedReflections()),
  markReflectionSynced: (id) =>
    ensureDb().then((d) => d.markReflectionSynced(id)),
  upsertTask: (task) => ensureDb().then((d) => d.upsertTask(task)),
  upsertReflection: (reflection) =>
    ensureDb().then((d) => d.upsertReflection(reflection)),
  upsertSession: (session) => ensureDb().then((d) => d.upsertSession(session)),
  createSession: (input) => ensureDb().then((d) => d.createSession(input)),
  createSessionAndUpdateTask: (sessionInput, taskId, updates) =>
    ensureDb().then((d) =>
      d.createSessionAndUpdateTask(sessionInput, taskId, updates)
    ),
  getSession: (id) => ensureDb().then((d) => d.getSession(id)),
  getAllSessions: () => ensureDb().then((d) => d.getAllSessions()),
  updateSession: (id, input) =>
    ensureDb().then((d) => d.updateSession(id, input)),
  deleteSession: (id) => ensureDb().then((d) => d.deleteSession(id)),
  getSessionsByDateRange: (start, end) =>
    ensureDb().then((d) => d.getSessionsByDateRange(start, end)),
  getSessionsByTask: (taskId) =>
    ensureDb().then((d) => d.getSessionsByTask(taskId)),
  getUnsyncedSessions: () => ensureDb().then((d) => d.getUnsyncedSessions()),
  markSessionSynced: (id) => ensureDb().then((d) => d.markSessionSynced(id)),
  getSyncStatus: () => ensureDb().then((d) => d.getSyncStatus()),
  recordSync: (entityType, entityId) =>
    ensureDb().then((d) => d.recordSync(entityType, entityId)),
  recordSyncConflict: (entry) =>
    ensureDb().then((d) => d.recordSyncConflict(entry)),
  getSyncConflicts: () => ensureDb().then((d) => d.getSyncConflicts()),
  clearSyncConflicts: () => ensureDb().then((d) => d.clearSyncConflicts()),
  clearAll: () => ensureDb().then((d) => d.clearAll()),

  // ---- Outbox ----
  writeOutboxEvent: (event) =>
    ensureDb().then((d) => d.writeOutboxEvent(event)),
  getUnpushedOutboxEvents: () =>
    ensureDb().then((d) => d.getUnpushedOutboxEvents()),
  removePushedOutboxEvents: (eventIds) =>
    ensureDb().then((d) => d.removePushedOutboxEvents(eventIds)),
  getOutboxEventCount: () => ensureDb().then((d) => d.getOutboxEventCount()),
  markOutboxEventProcessed: (eventId) =>
    ensureDb().then((d) => d.markOutboxEventProcessed(eventId)),
  isOutboxEventProcessed: (eventId) =>
    ensureDb().then((d) => d.isOutboxEventProcessed(eventId)),
  filterUnprocessedOutboxEvents: (events) =>
    ensureDb().then((d) => d.filterUnprocessedOutboxEvents(events)),

  // ---- Tombstones ----
  markTombstone: (entityType, entityId, deletedAt) =>
    ensureDb().then((d) => d.markTombstone(entityType, entityId, deletedAt)),
  getTombstone: (entityType, entityId) =>
    ensureDb().then((d) => d.getTombstone(entityType, entityId)),
  removeTombstone: (entityType, entityId) =>
    ensureDb().then((d) => d.removeTombstone(entityType, entityId)),
  getAllTombstones: () => ensureDb().then((d) => d.getAllTombstones()),
  upsertTombstones: (tombstones) =>
    ensureDb().then((d) => d.upsertTombstones(tombstones)),

  // ---- Outbox Cleanup ----
  clearOutbox: () => ensureDb().then((d) => d.clearOutbox()),
  clearProcessedEvents: () => ensureDb().then((d) => d.clearProcessedEvents()),
};

/** 手动初始化数据库（可选，访问时会自动初始化） */
export async function initDatabase(): Promise<void> {
  const instance = await ensureDb();
  await instance.init();
}

// ---- 测试钩子（仅测试使用） ----
export function __testOnlyResetDb(): void {
  dbInstance = null;
  dbInitPromise = null;
}

export const __testOnlySqliteDatabase = SqliteDatabase;
