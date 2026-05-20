// ============================================================
// PomodoroX - SQLite 数据库服务 (SqliteDatabase)
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
import { DB_FILENAME } from "@/utils/constants";
import { safeJsonParse } from "./validation";
import {
  validateCreateTaskInput,
  validateCreateReflectionInput,
  validateCreateSessionInput,
} from "./validation";
import type { SqlValue, Database } from "./types";

export class SqliteDatabase {
  private db: Database | null = null;
  private initialized = false;

  private async getDb(): Promise<Database> {
    if (this.db) return this.db;
    // 动态导入 Tauri SQL 插件
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plugin = (await import("@tauri-apps/plugin-sql")) as any;
    this.db = (await plugin.load(`sqlite:${DB_FILENAME}`)) as Database;
    return this.db;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      const db = await this.getDb();
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
      `);
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
      `);
      await db.execute(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          task_id TEXT,
          type TEXT NOT NULL,
          duration INTEGER NOT NULL,
          completed INTEGER DEFAULT 0,
          started_at TEXT NOT NULL,
          ended_at TEXT,
          updated_at TEXT,
          synced INTEGER DEFAULT 0
        )
      `);
      await db.execute(`
        CREATE TABLE IF NOT EXISTS sync_log (
          id TEXT PRIMARY KEY,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          synced_at TEXT NOT NULL
        )
      `);
      await db.execute(`
        CREATE TABLE IF NOT EXISTS conflict_log (
          id TEXT PRIMARY KEY,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          local_updated_at TEXT NOT NULL,
          remote_updated_at TEXT NOT NULL,
          resolved_at TEXT NOT NULL,
          resolution TEXT NOT NULL,
          local_snapshot TEXT NOT NULL,
          remote_snapshot TEXT NOT NULL
        )
      `);
      await db.execute(`
        CREATE TABLE IF NOT EXISTS outbox_events (
          event_id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          payload TEXT NOT NULL,
          timestamp TEXT NOT NULL
        )
      `);
      await db.execute(`
        CREATE TABLE IF NOT EXISTS processed_events (
          event_id TEXT PRIMARY KEY,
          processed_at TEXT NOT NULL
        )
      `);
      await db.execute(`
        CREATE TABLE IF NOT EXISTS tombstones (
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          deleted_at TEXT NOT NULL,
          PRIMARY KEY (entity_type, entity_id)
        )
      `);
      // 执行迁移（新增字段等）
      await this.runMigrations();

      this.initialized = true;
    } catch (err) {
      console.error("数据库初始化失败:", err);
      throw err;
    }
  }

  /**
   * 运行数据库迁移
   * 版本号驱动 + PRAGMA 兜底检测，保证安全升级
   */
  private async runMigrations(): Promise<void> {
    const db = await this.getDb();

    // 1. 创建 schema_version 表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS schema_version (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        version INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT ''
      )
    `);

    // 2. 读取当前版本
    const rows = await db.select<{ version: number }>(
      `SELECT version FROM schema_version WHERE id = 1`
    );
    let currentVersion = rows[0]?.version ?? 0;

    // 3. 版本号驱动迁移
    if (currentVersion < 1) {
      // v1 是初始建表，已在 init() 的 CREATE TABLE IF NOT EXISTS 中完成
      currentVersion = 1;
    }

    if (currentVersion < 2) {
      await this.runV2Migrations(db);
      currentVersion = 2;
    }

    if (currentVersion < 3) {
      // v3：新增 outbox_events / processed_events / tombstones 表
      // 表已在 init() 中通过 CREATE TABLE IF NOT EXISTS 创建
      currentVersion = 3;
    }

    // 4. 写入版本号
    await db.execute(
      `INSERT OR REPLACE INTO schema_version (id, version, updated_at) VALUES (1, ?, ?)`,
      [currentVersion, formatDateTime(new Date())]
    );

    if (import.meta.env.DEV)
      console.log(`[DB] Schema 版本: v${currentVersion}`);
  }

  /** 当前事务嵌套深度（SAVEPOINT 支持） */
  private txDepth = 0;

  /**
   * 执行事务（BEGIN / COMMIT / ROLLBACK）
   * 支持嵌套 SAVEPOINT，内层事务失败只回滚到当前 SAVEPOINT，不影响外层。
   */
  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    const db = await this.getDb();
    const depth = this.txDepth;
    this.txDepth++;

    if (depth === 0) {
      await db.execute("BEGIN");
    } else {
      await db.execute(`SAVEPOINT sp_${depth}`);
    }

    try {
      const result = await fn();
      if (depth === 0) {
        await db.execute("COMMIT");
      } else {
        await db.execute(`RELEASE SAVEPOINT sp_${depth}`);
      }
      this.txDepth = depth;
      return result;
    } catch (err) {
      if (depth === 0) {
        await db.execute("ROLLBACK").catch(() => {});
      } else {
        await db.execute(`ROLLBACK TO SAVEPOINT sp_${depth}`).catch(() => {});
      }
      this.txDepth = depth;
      throw err;
    }
  }

  /**
   * v2 迁移：新增 plan / completion / updated_at 字段
   */
  private async runV2Migrations(db: Database): Promise<void> {
    // 表名白名单，防止 SQL 注入
    const VALID_TABLES = new Set([
      "tasks",
      "reflections",
      "sessions",
      "outbox_events",
      "processed_events",
      "tombstones",
      "sync_log",
      "conflict_log",
    ]);
    const columnExists = async (
      table: string,
      column: string
    ): Promise<boolean> => {
      if (!VALID_TABLES.has(table)) {
        throw new Error(`Invalid table name: ${table}`);
      }
      const cols = (await db.select(`PRAGMA table_info(${table})`)) as Array<{
        name: string;
      }>;
      return cols.some((c) => c.name === column);
    };

    if (!(await columnExists("tasks", "plan"))) {
      await db.execute(`ALTER TABLE tasks ADD COLUMN plan TEXT DEFAULT ''`);
    }
    if (!(await columnExists("tasks", "completion"))) {
      await db.execute(
        `ALTER TABLE tasks ADD COLUMN completion TEXT DEFAULT ''`
      );
    }
    if (!(await columnExists("sessions", "plan"))) {
      await db.execute(`ALTER TABLE sessions ADD COLUMN plan TEXT DEFAULT ''`);
    }
    if (!(await columnExists("sessions", "completion"))) {
      await db.execute(
        `ALTER TABLE sessions ADD COLUMN completion TEXT DEFAULT ''`
      );
    }
    if (!(await columnExists("sessions", "updated_at"))) {
      await db.execute(`ALTER TABLE sessions ADD COLUMN updated_at TEXT`);
      await db.execute(
        `UPDATE sessions SET updated_at = COALESCE(ended_at, started_at) WHERE updated_at IS NULL`
      );
    }
  }

  // ---- 辅助方法：执行查询并返回行数组 ----
  private async queryRows(
    sql: string,
    bind?: SqlValue[]
  ): Promise<Record<string, SqlValue>[]> {
    const db = await this.getDb();
    const raw = await db.select<unknown>(sql, bind);
    if (!Array.isArray(raw)) {
      console.warn(`[DB] 查询返回非数组结果: ${sql.slice(0, 100)}`);
      return [];
    }
    return raw as Record<string, SqlValue>[];
  }

  private rowToTask(row: Record<string, SqlValue>): Task {
    return {
      id: row.id as string,
      title: row.title as string,
      description: row.description as string,
      status: row.status as Task["status"],
      priority: row.priority as Task["priority"],
      estimatedPomodoros: row.estimated_pomodoros as number,
      actualPomodoros: row.actual_pomodoros as number,
      tags: safeJsonParse(row.tags as string, []),
      dueDate: row.due_date as string | null,
      plan: (row.plan as string) ?? "",
      completion: (row.completion as string) ?? "",
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      synced: Boolean(row.synced),
    };
  }

  private rowToReflection(row: Record<string, SqlValue>): Reflection {
    return {
      id: row.id as string,
      date: row.date as string,
      content: row.content as string,
      mood: row.mood as Reflection["mood"],
      relatedTaskIds: safeJsonParse(row.related_task_ids as string, []),
      tags: safeJsonParse(row.tags as string, []),
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      synced: Boolean(row.synced),
    };
  }

  private rowToSession(row: Record<string, SqlValue>): Session {
    const session: Session = {
      id: row.id as string,
      taskId: row.task_id as string | null,
      type: row.type as Session["type"],
      duration: row.duration as number,
      completed: Boolean(row.completed),
      startedAt: row.started_at as string,
      endedAt: row.ended_at as string | null,
      plan: (row.plan as string) ?? "",
      completion: (row.completion as string) ?? "",
      synced: Boolean(row.synced),
      updatedAt:
        (row.updated_at as string) ??
        (row.ended_at as string | null) ??
        (row.started_at as string),
    };
    return session;
  }

  // ---- Tasks ----
  async createTask(input: CreateTaskInput): Promise<Task> {
    validateCreateTaskInput(input);
    const db = await this.getDb();
    const id = generateId();
    const now = formatDateTime(new Date());
    const plan = input.plan ?? "";
    const completion = input.completion ?? "";
    await db.execute(
      `INSERT INTO tasks (id, title, description, status, priority, estimated_pomodoros, actual_pomodoros, tags, due_date, plan, completion, created_at, updated_at, synced)
       VALUES (?, ?, ?, 'todo', ?, ?, 0, ?, ?, ?, ?, ?, ?, 0)`,
      [
        id,
        input.title,
        input.description,
        input.priority,
        input.estimatedPomodoros,
        JSON.stringify(input.tags),
        input.dueDate,
        plan,
        completion,
        now,
        now,
      ]
    );
    return {
      id,
      title: input.title,
      description: input.description,
      status: "todo",
      priority: input.priority,
      estimatedPomodoros: input.estimatedPomodoros,
      actualPomodoros: 0,
      tags: input.tags,
      dueDate: input.dueDate,
      plan,
      completion,
      createdAt: now,
      updatedAt: now,
      synced: false,
    };
  }

  async getTask(id: string): Promise<Task | null> {
    const rows = await this.queryRows("SELECT * FROM tasks WHERE id = ?", [id]);
    return rows.length > 0 ? this.rowToTask(rows[0]) : null;
  }

  async getAllTasks(): Promise<Task[]> {
    const rows = await this.queryRows(
      "SELECT * FROM tasks ORDER BY created_at DESC"
    );
    return rows.map((r) => this.rowToTask(r));
  }

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
    const existing = await this.getTask(id);
    if (!existing) return null;

    const db = await this.getDb();
    const now = formatDateTime(new Date());
    const title = input.title ?? existing.title;
    const description = input.description ?? existing.description;
    const status = input.status ?? existing.status;
    const priority = input.priority ?? existing.priority;
    const estimatedPomodoros =
      input.estimatedPomodoros ?? existing.estimatedPomodoros;
    const actualPomodoros = input.actualPomodoros ?? existing.actualPomodoros;
    const tags = input.tags ?? existing.tags;
    const dueDate =
      input.dueDate !== undefined ? input.dueDate : existing.dueDate;
    const plan = input.plan !== undefined ? input.plan : existing.plan;
    const completion =
      input.completion !== undefined ? input.completion : existing.completion;

    await db.execute(
      `UPDATE tasks SET title=?, description=?, status=?, priority=?, estimated_pomodoros=?, actual_pomodoros=?, tags=?, due_date=?, plan=?, completion=?, updated_at=?, synced=0
       WHERE id=?`,
      [
        title,
        description,
        status,
        priority,
        estimatedPomodoros,
        actualPomodoros,
        JSON.stringify(tags),
        dueDate,
        plan,
        completion,
        now,
        id,
      ]
    );

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
      plan,
      completion,
      updatedAt: now,
      synced: false,
    };
  }

  async deleteTask(id: string): Promise<boolean> {
    const db = await this.getDb();
    const result = await db.execute("DELETE FROM tasks WHERE id = ?", [id]);
    return result > 0;
  }

  async getTasksByDate(date: string): Promise<Task[]> {
    const rows = await this.queryRows(
      `SELECT * FROM tasks WHERE DATE(created_at) = ? OR (due_date IS NOT NULL AND DATE(due_date) = ?) ORDER BY created_at DESC`,
      [date, date]
    );
    return rows.map((r) => this.rowToTask(r));
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    const rows = await this.queryRows(
      "SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC",
      [status]
    );
    return rows.map((r) => this.rowToTask(r));
  }

  async getUnsyncedTasks(): Promise<Task[]> {
    const rows = await this.queryRows("SELECT * FROM tasks WHERE synced = 0");
    return rows.map((r) => this.rowToTask(r));
  }

  async markTaskSynced(id: string): Promise<void> {
    const db = await this.getDb();
    await db.execute("UPDATE tasks SET synced = 1 WHERE id = ?", [id]);
  }

  // ---- Reflections ----
  async createReflection(input: CreateReflectionInput): Promise<Reflection> {
    validateCreateReflectionInput(input);
    const db = await this.getDb();
    const id = generateId();
    const now = formatDateTime(new Date());
    await db.execute(
      `INSERT INTO reflections (id, date, content, mood, related_task_ids, tags, created_at, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        id,
        input.date,
        input.content,
        input.mood,
        JSON.stringify(input.relatedTaskIds),
        JSON.stringify(input.tags),
        now,
        now,
      ]
    );
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
    };
  }

  async getReflection(id: string): Promise<Reflection | null> {
    const rows = await this.queryRows(
      "SELECT * FROM reflections WHERE id = ?",
      [id]
    );
    return rows.length > 0 ? this.rowToReflection(rows[0]) : null;
  }

  async getAllReflections(): Promise<Reflection[]> {
    const rows = await this.queryRows(
      "SELECT * FROM reflections ORDER BY date DESC, created_at DESC"
    );
    return rows.map((r) => this.rowToReflection(r));
  }

  async updateReflection(
    id: string,
    input: UpdateReflectionInput
  ): Promise<Reflection | null> {
    const existing = await this.getReflection(id);
    if (!existing) return null;

    const db = await this.getDb();
    const now = formatDateTime(new Date());
    const date = input.date ?? existing.date;
    const content = input.content ?? existing.content;
    const mood = input.mood ?? existing.mood;
    const relatedTaskIds = input.relatedTaskIds ?? existing.relatedTaskIds;
    const tags = input.tags ?? existing.tags;

    await db.execute(
      `UPDATE reflections SET date=?, content=?, mood=?, related_task_ids=?, tags=?, updated_at=?, synced=0
       WHERE id=?`,
      [
        date,
        content,
        mood,
        JSON.stringify(relatedTaskIds),
        JSON.stringify(tags),
        now,
        id,
      ]
    );

    return {
      ...existing,
      date,
      content,
      mood,
      relatedTaskIds,
      tags,
      updatedAt: now,
      synced: false,
    };
  }

  async deleteReflection(id: string): Promise<boolean> {
    const db = await this.getDb();
    const result = await db.execute("DELETE FROM reflections WHERE id = ?", [
      id,
    ]);
    return result > 0;
  }

  async getReflectionsByDateRange(
    start: string,
    end: string
  ): Promise<Reflection[]> {
    const rows = await this.queryRows(
      "SELECT * FROM reflections WHERE date >= ? AND date <= ? ORDER BY date DESC, created_at DESC",
      [start, end]
    );
    return rows.map((r) => this.rowToReflection(r));
  }

  async getUnsyncedReflections(): Promise<Reflection[]> {
    const rows = await this.queryRows(
      "SELECT * FROM reflections WHERE synced = 0"
    );
    return rows.map((r) => this.rowToReflection(r));
  }

  async markReflectionSynced(id: string): Promise<void> {
    const db = await this.getDb();
    await db.execute("UPDATE reflections SET synced = 1 WHERE id = ?", [id]);
  }

  // ---- Upsert（拉取合并用：INSERT OR REPLACE 保留原始数据）----

  async upsertTask(task: Task): Promise<Task> {
    const db = await this.getDb();
    await db.execute(
      `INSERT OR REPLACE INTO tasks (id, title, description, status, priority, estimated_pomodoros, actual_pomodoros, tags, due_date, plan, completion, created_at, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.title,
        task.description,
        task.status,
        task.priority,
        task.estimatedPomodoros,
        task.actualPomodoros,
        JSON.stringify(task.tags),
        task.dueDate,
        task.plan,
        task.completion,
        task.createdAt,
        task.updatedAt,
        task.synced ? 1 : 0,
      ]
    );
    return task;
  }

  async upsertReflection(reflection: Reflection): Promise<Reflection> {
    const db = await this.getDb();
    await db.execute(
      `INSERT OR REPLACE INTO reflections (id, date, content, mood, related_task_ids, tags, created_at, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reflection.id,
        reflection.date,
        reflection.content,
        reflection.mood,
        JSON.stringify(reflection.relatedTaskIds),
        JSON.stringify(reflection.tags),
        reflection.createdAt,
        reflection.updatedAt,
        reflection.synced ? 1 : 0,
      ]
    );
    return reflection;
  }

  async upsertSession(session: Session): Promise<Session> {
    const db = await this.getDb();
    const updatedAt =
      session.updatedAt ??
      session.endedAt ??
      session.startedAt ??
      formatDateTime(new Date());
    await db.execute(
      `INSERT OR REPLACE INTO sessions (id, task_id, type, duration, completed, started_at, ended_at, plan, completion, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session.id,
        session.taskId,
        session.type,
        session.duration,
        session.completed ? 1 : 0,
        session.startedAt,
        session.endedAt,
        session.plan,
        session.completion,
        updatedAt,
        session.synced ? 1 : 0,
      ]
    );
    return { ...session, updatedAt };
  }

  // ---- Sessions ----
  async createSession(input: CreateSessionInput): Promise<Session> {
    validateCreateSessionInput(input);
    const db = await this.getDb();
    const id = generateId();
    const now = formatDateTime(new Date());
    const endedAt = input.completed ? now : null;
    const plan = input.plan ?? "";
    const completion = input.completion ?? "";
    await db.execute(
      `INSERT INTO sessions (id, task_id, type, duration, completed, started_at, ended_at, plan, completion, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        id,
        input.taskId,
        input.type,
        input.duration,
        input.completed ? 1 : 0,
        input.startedAt,
        endedAt,
        plan,
        completion,
        now,
      ]
    );
    return {
      id,
      taskId: input.taskId,
      type: input.type,
      duration: input.duration,
      completed: input.completed,
      startedAt: input.startedAt,
      endedAt,
      plan,
      completion,
      synced: false,
      updatedAt: now,
    };
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
    const rows = await this.queryRows("SELECT * FROM sessions WHERE id = ?", [
      id,
    ]);
    return rows.length > 0 ? this.rowToSession(rows[0]) : null;
  }

  async getAllSessions(): Promise<Session[]> {
    const rows = await this.queryRows(
      "SELECT * FROM sessions ORDER BY started_at DESC"
    );
    return rows.map((r) => this.rowToSession(r));
  }

  async updateSession(
    id: string,
    input: Partial<Session>
  ): Promise<Session | null> {
    const existing = await this.getSession(id);
    if (!existing) return null;

    const db = await this.getDb();
    const completed = input.completed ?? existing.completed;
    const endedAt =
      input.endedAt !== undefined ? input.endedAt : existing.endedAt;
    const plan = input.plan !== undefined ? input.plan : existing.plan;
    const completion =
      input.completion !== undefined ? input.completion : existing.completion;

    const now = formatDateTime(new Date());
    await db.execute(
      "UPDATE sessions SET completed=?, ended_at=?, plan=?, completion=?, updated_at=? WHERE id=?",
      [completed ? 1 : 0, endedAt, plan, completion, now, id]
    );

    return {
      ...existing,
      completed,
      endedAt,
      plan,
      completion,
      updatedAt: now,
    };
  }

  async deleteSession(id: string): Promise<boolean> {
    const db = await this.getDb();
    const result = await db.execute("DELETE FROM sessions WHERE id = ?", [id]);
    return result > 0;
  }

  async getSessionsByDateRange(start: string, end: string): Promise<Session[]> {
    const rows = await this.queryRows(
      "SELECT * FROM sessions WHERE DATE(started_at) >= ? AND DATE(started_at) <= ? ORDER BY started_at DESC",
      [start, end]
    );
    return rows.map((r) => this.rowToSession(r));
  }

  async getSessionsByTask(taskId: string): Promise<Session[]> {
    const rows = await this.queryRows(
      "SELECT * FROM sessions WHERE task_id = ? ORDER BY started_at DESC",
      [taskId]
    );
    return rows.map((r) => this.rowToSession(r));
  }

  async getUnsyncedSessions(): Promise<Session[]> {
    const rows = await this.queryRows(
      "SELECT * FROM sessions WHERE synced = 0"
    );
    return rows.map((r) => this.rowToSession(r));
  }

  async markSessionSynced(id: string): Promise<void> {
    const db = await this.getDb();
    await db.execute("UPDATE sessions SET synced = 1 WHERE id = ?", [id]);
  }

  // ---- Sync ----
  async getSyncStatus(): Promise<SyncStatus> {
    const taskRows = await this.queryRows(
      "SELECT COUNT(*) as count FROM tasks WHERE synced = 0"
    );
    const reflectionRows = await this.queryRows(
      "SELECT COUNT(*) as count FROM reflections WHERE synced = 0"
    );
    const sessionRows = await this.queryRows(
      "SELECT COUNT(*) as count FROM sessions WHERE synced = 0"
    );
    const syncLogRows = await this.queryRows(
      "SELECT synced_at FROM sync_log ORDER BY synced_at DESC LIMIT 1"
    );

    return {
      lastSyncAt:
        syncLogRows.length > 0 ? (syncLogRows[0].synced_at as string) : null,
      pendingCount:
        (taskRows[0].count as number) +
        (reflectionRows[0].count as number) +
        (sessionRows[0].count as number),
      isSyncing: false,
    };
  }

  async recordSync(entityType: string, entityId: string): Promise<void> {
    const db = await this.getDb();
    const id = generateId();
    const now = formatDateTime(new Date());
    await db.execute(
      "INSERT INTO sync_log (id, entity_type, entity_id, synced_at) VALUES (?, ?, ?, ?)",
      [id, entityType, entityId, now]
    );
  }

  async recordSyncConflict(
    entry: Omit<ConflictLogEntry, "id">
  ): Promise<ConflictLogEntry> {
    const db = await this.getDb();
    const id = generateId();
    await db.execute(
      `INSERT INTO conflict_log (id, entity_type, entity_id, local_updated_at, remote_updated_at, resolved_at, resolution, local_snapshot, remote_snapshot)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        entry.entityType,
        entry.entityId,
        entry.localUpdatedAt,
        entry.remoteUpdatedAt,
        entry.resolvedAt,
        entry.resolution,
        entry.localSnapshot,
        entry.remoteSnapshot,
      ]
    );
    return { ...entry, id };
  }

  async getSyncConflicts(): Promise<ConflictLogEntry[]> {
    const rows = await this.queryRows(
      "SELECT * FROM conflict_log ORDER BY resolved_at DESC"
    );
    return rows.map((r) => ({
      id: r.id as string,
      entityType: r.entity_type as ConflictLogEntry["entityType"],
      entityId: r.entity_id as string,
      localUpdatedAt: r.local_updated_at as string,
      remoteUpdatedAt: r.remote_updated_at as string,
      resolvedAt: r.resolved_at as string,
      resolution: r.resolution as ConflictLogEntry["resolution"],
      localSnapshot: r.local_snapshot as string,
      remoteSnapshot: r.remote_snapshot as string,
    }));
  }

  async clearSyncConflicts(): Promise<void> {
    const db = await this.getDb();
    await db.execute("DELETE FROM conflict_log");
  }

  // ---- Outbox ----
  async writeOutboxEvent(event: OutboxEvent): Promise<void> {
    const db = await this.getDb();
    await db.execute(
      `INSERT OR REPLACE INTO outbox_events (event_id, type, entity_type, entity_id, payload, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        event.eventId,
        event.type,
        event.entityType,
        event.entityId,
        JSON.stringify(event.payload),
        event.timestamp,
      ]
    );
  }

  async getUnpushedOutboxEvents(): Promise<OutboxEvent[]> {
    const rows = await this.queryRows(
      "SELECT * FROM outbox_events ORDER BY timestamp ASC"
    );
    return rows.map((r) => ({
      eventId: r.event_id as string,
      type: r.type as OutboxEvent["type"],
      entityType: r.entity_type as string,
      entityId: r.entity_id as string,
      payload: safeJsonParse(r.payload as string, {}),
      timestamp: r.timestamp as string,
    }));
  }

  async removePushedOutboxEvents(eventIds: string[]): Promise<void> {
    if (eventIds.length === 0) return;
    const db = await this.getDb();
    // SQLite 参数上限约 999，分批处理
    const BATCH = 500;
    for (let i = 0; i < eventIds.length; i += BATCH) {
      const batch = eventIds.slice(i, i + BATCH);
      const placeholders = batch.map(() => "?").join(",");
      await db.execute(
        `DELETE FROM outbox_events WHERE event_id IN (${placeholders})`,
        batch
      );
    }
  }

  async getOutboxEventCount(): Promise<number> {
    const rows = await this.queryRows(
      "SELECT COUNT(*) as count FROM outbox_events"
    );
    return (rows[0]?.count as number) ?? 0;
  }

  async markOutboxEventProcessed(eventId: string): Promise<void> {
    const db = await this.getDb();
    await db.execute(
      `INSERT OR REPLACE INTO processed_events (event_id, processed_at) VALUES (?, ?)`,
      [eventId, formatDateTime(new Date())]
    );
  }

  async isOutboxEventProcessed(eventId: string): Promise<boolean> {
    const rows = await this.queryRows(
      "SELECT 1 FROM processed_events WHERE event_id = ?",
      [eventId]
    );
    return rows.length > 0;
  }

  async filterUnprocessedOutboxEvents(
    events: OutboxEvent[]
  ): Promise<OutboxEvent[]> {
    if (events.length === 0) return [];
    // SQLite 不支持大量 IN 参数，分批处理
    const BATCH = 100;
    const processed = new Set<string>();
    for (let i = 0; i < events.length; i += BATCH) {
      const batch = events.slice(i, i + BATCH);
      const placeholders = batch.map(() => "?").join(",");
      const rows = await this.queryRows(
        `SELECT event_id FROM processed_events WHERE event_id IN (${placeholders})`,
        batch.map((e) => e.eventId)
      );
      for (const r of rows) {
        processed.add(r.event_id as string);
      }
    }
    return events.filter((e) => !processed.has(e.eventId));
  }

  // ---- Tombstones ----
  async markTombstone(
    entityType: string,
    entityId: string,
    deletedAt?: string
  ): Promise<void> {
    const db = await this.getDb();
    await db.execute(
      `INSERT OR REPLACE INTO tombstones (entity_type, entity_id, deleted_at) VALUES (?, ?, ?)`,
      [entityType, entityId, deletedAt ?? formatDateTime(new Date())]
    );
  }

  async getTombstone(
    entityType: string,
    entityId: string
  ): Promise<TombstoneRecord | null> {
    const rows = await this.queryRows(
      "SELECT * FROM tombstones WHERE entity_type = ? AND entity_id = ?",
      [entityType, entityId]
    );
    if (rows.length === 0) return null;
    return {
      entityType: rows[0].entity_type as string,
      entityId: rows[0].entity_id as string,
      deletedAt: rows[0].deleted_at as string,
    };
  }

  async removeTombstone(entityType: string, entityId: string): Promise<void> {
    const db = await this.getDb();
    await db.execute(
      "DELETE FROM tombstones WHERE entity_type = ? AND entity_id = ?",
      [entityType, entityId]
    );
  }

  async getAllTombstones(): Promise<TombstoneRecord[]> {
    const rows = await this.queryRows("SELECT * FROM tombstones");
    return rows.map((r) => ({
      entityType: r.entity_type as string,
      entityId: r.entity_id as string,
      deletedAt: r.deleted_at as string,
    }));
  }

  async upsertTombstones(tombstones: TombstoneRecord[]): Promise<void> {
    if (tombstones.length === 0) return;
    const db = await this.getDb();
    // SQLite 参数上限约 999，每批 300 条（3 参数/条 = 900 参数）
    const BATCH = 300;
    for (let i = 0; i < tombstones.length; i += BATCH) {
      const batch = tombstones.slice(i, i + BATCH);
      const values = batch.map(() => "(?, ?, ?)").join(",");
      const params = batch.flatMap((t) => [
        t.entityType,
        t.entityId,
        t.deletedAt,
      ]);
      await db.execute(
        `INSERT OR REPLACE INTO tombstones (entity_type, entity_id, deleted_at) VALUES ${values}`,
        params
      );
    }
  }

  // ---- Outbox Cleanup ----
  async clearOutbox(): Promise<void> {
    const db = await this.getDb();
    await db.execute("DELETE FROM outbox_events");
  }

  async clearProcessedEvents(): Promise<void> {
    const db = await this.getDb();
    await db.execute("DELETE FROM processed_events");
  }

  async clearAll(): Promise<void> {
    await this.transaction(async () => {
      const db = await this.getDb();
      await db.execute("DELETE FROM sessions");
      await db.execute("DELETE FROM reflections");
      await db.execute("DELETE FROM tasks");
      await db.execute("DELETE FROM sync_log");
      await db.execute("DELETE FROM conflict_log");
      await db.execute("DELETE FROM outbox_events");
      await db.execute("DELETE FROM processed_events");
      await db.execute("DELETE FROM tombstones");
    });
  }
}
