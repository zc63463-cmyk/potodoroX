// ============================================================
// PomodoroX - 同步 Store
// 统一同步门面：所有同步操作委托给 WebDAV 事件流
// ============================================================

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  SyncStatus,
  OutboxEventType,
  Task,
  Reflection,
  Session,
  AppConfig,
  CreateTaskInput,
  CreateReflectionInput,
  CreateSessionInput,
} from "@/types";
import type { OutboxEvent, TombstoneRecord } from "@/services/outbox";
import { db } from "@/services/database";
import * as outbox from "@/services/outbox";
import { useWebDavSync } from "@/composables/useWebDavSync";
import { isOnline } from "@/utils/network";
import { useSettingsStore } from "@/stores/settings";

/** 完整备份数据结构（v2 格式） */
export interface FullBackup {
  version: string;
  app: string;
  exportedAt: string;
  data: {
    tasks: Task[];
    reflections: Reflection[];
    sessions: Session[];
    outbox: OutboxEvent[];
    tombstones: TombstoneRecord[];
    settings: AppConfig | null;
    syncStatus: SyncStatus;
  };
}

export const useSyncStore = defineStore("sync", () => {
  const webDav = useWebDavSync();

  // ---- 状态 ----
  const isSyncing = ref(false);
  const syncStatus = ref<SyncStatus>({
    lastSyncAt: null,
    pendingCount: 0,
    isSyncing: false,
  });
  const syncError = ref<string | null>(null);
  const dbStats = ref({
    taskCount: 0,
    reflectionCount: 0,
    sessionCount: 0,
  });

  // ---- 串行锁（防止并发同步） ----
  let _syncLock: Promise<void> = Promise.resolve();

  function serialized<T>(fn: () => Promise<T>): Promise<T> {
    const prev = _syncLock;
    let release: () => void;
    _syncLock = new Promise((resolve) => {
      release = resolve;
    });
    return prev.then(() => fn()).finally(() => release!());
  }

  // ---- 计算属性 ----
  const pendingCount = computed(() => syncStatus.value.pendingCount);
  const lastSyncAt = computed(() => syncStatus.value.lastSyncAt);

  // ---- 方法 ----

  /**
   * 检查同步是否已配置（WebDAV）
   */
  function isConfigured(): boolean {
    return webDav.isConfigured.value;
  }

  /**
   * 检查是否有待同步的事件
   */
  async function hasPendingEvents(): Promise<boolean> {
    const count = await outbox.getUnpushedCount();
    return count > 0;
  }

  /**
   * 加载同步状态
   */
  async function loadSyncStatus(): Promise<void> {
    try {
      syncStatus.value = await db.getSyncStatus();
      const outboxCount = await outbox.getUnpushedCount();
      syncStatus.value.pendingCount = outboxCount;
    } catch (err) {
      console.error("[SyncStore] 加载同步状态失败:", err);
    }
  }

  // ============================================================
  // 完整同步：委托给 WebDAV 事件流
  // ============================================================

  /**
   * 执行完整同步（串行安全）
   * 委托给 WebDAV syncEvents：push 本地 outbox → pull 远程 → 消费
   */
  async function fullSyncAction(): Promise<{
    success: boolean;
    message: string;
  }> {
    return serialized(async () => {
      if (isSyncing.value) return { success: false, message: "正在同步中..." };
      if (!webDav.isConfigured.value) {
        return { success: false, message: "WebDAV 未配置" };
      }

      isSyncing.value = true;
      syncError.value = null;

      try {
        const result = await webDav.syncEvents();
        await loadSyncStatus();

        if (result.error) {
          syncError.value = result.error;
          return { success: false, message: result.error };
        }

        const parts: string[] = [];
        if (result.pushed > 0) parts.push(`推送 ${result.pushed} 个事件`);
        if (result.pulled > 0) parts.push(`拉取 ${result.pulled} 个事件`);
        if (result.processed > 0) parts.push(`处理 ${result.processed} 个`);
        if (result.errors > 0) parts.push(`失败 ${result.errors} 个`);
        const message = parts.length > 0 ? parts.join(", ") : "同步完成";

        return { success: result.errors === 0, message };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "同步失败";
        syncError.value = msg;
        return { success: false, message: msg };
      } finally {
        isSyncing.value = false;
      }
    });
  }

  // ============================================================
  // 记录事件并触发同步（由 Stores 在 CRUD 后调用）
  // ============================================================

  /**
   * 记录一条 outbox 事件，并在后台触发 WebDAV 同步
   *
   * 离线时跳过同步，事件保留在 outbox 中待恢复后自动推送。
   * 带错误隔离：outbox 写入失败不会抛异常，避免中断业务操作。
   */
  async function recordEvent(
    type: OutboxEventType,
    entityId: string,
    payload: unknown
  ): Promise<void> {
    try {
      await outbox.writeEvent(type, entityId, payload);
      await loadSyncStatus();

      if (webDav.isConfigured.value && isOnline()) {
        serialized(() => webDav.syncEvents()).catch(() => {});
      }
    } catch (err) {
      console.error(
        `[SyncStore] 同步事件写入失败（${type} ${entityId}）:`,
        err
      );
    }
  }

  /**
   * 后台拉取（由 App.vue 启动时 / visibilitychange / online 事件调用）
   *
   * 离线时直接跳过，避免无意义 HTTP 请求。
   */
  async function backgroundPull(): Promise<void> {
    if (!webDav.isConfigured.value || !isOnline()) return;
    return serialized(async () => {
      await webDav.syncEvents();
    });
  }

  // ============================================================
  // 以下方法保持与 SettingsView 的兼容
  // ============================================================

  async function loadDbStats(): Promise<void> {
    try {
      const [tasks, reflections, sessions] = await Promise.all([
        db.getAllTasks(),
        db.getAllReflections(),
        db.getAllSessions(),
      ]);
      dbStats.value = {
        taskCount: tasks.length,
        reflectionCount: reflections.length,
        sessionCount: sessions.length,
      };
    } catch (err) {
      console.error("[SyncStore] 加载数据库统计失败:", err);
    }
  }

  async function clearAllData(): Promise<void> {
    await db.clearAll();
    dbStats.value = { taskCount: 0, reflectionCount: 0, sessionCount: 0 };
  }

  async function importRecords(
    tasks: Array<{
      title: string;
      description: string;
      priority: string;
      estimatedPomodoros: number;
      tags: string[];
      dueDate: string | null;
    }>,
    reflections: Array<{
      date: string;
      content: string;
      mood: string;
      relatedTaskIds: string[];
      tags: string[];
    }>,
    sessions: Array<{
      taskId: string | null;
      type: string;
      duration: number;
      completed: boolean;
      startedAt: string;
    }>
  ): Promise<{
    taskCount: number;
    reflectionCount: number;
    sessionCount: number;
    outboxCount: number;
  }> {
    // 用事务包裹整个导入，避免崩溃后留下半填充数据库
    return db.transaction(async () => {
      let taskCount = 0;
      let reflectionCount = 0;
      let sessionCount = 0;
      let outboxCount = 0;

      for (const task of tasks) {
        if (!task.title) continue;
        const created = await db.createTask({
          plan: "",
          completion: "",
          ...task,
        } as CreateTaskInput);
        await outbox.writeEvent("task.created", created.id, created);
        taskCount++;
        outboxCount++;
      }
      for (const reflection of reflections) {
        if (!reflection.date) continue;
        const created = await db.createReflection(
          reflection as CreateReflectionInput
        );
        await outbox.writeEvent("reflection.created", created.id, created);
        reflectionCount++;
        outboxCount++;
      }
      for (const session of sessions) {
        if (!session.type || session.duration == null) continue;
        const created = await db.createSession({
          plan: "",
          completion: "",
          ...session,
        } as CreateSessionInput);
        await outbox.writeEvent("session.created", created.id, created);
        sessionCount++;
        outboxCount++;
      }

      return { taskCount, reflectionCount, sessionCount, outboxCount };
    });
  }

  async function exportAllData(): Promise<{
    tasks: any[];
    reflections: any[];
    sessions: any[];
  }> {
    const [tasks, reflections, sessions] = await Promise.all([
      db.getAllTasks(),
      db.getAllReflections(),
      db.getAllSessions(),
    ]);
    return { tasks, reflections, sessions };
  }

  // ============================================================
  // 完整备份导出/导入（v2 格式）
  // ============================================================

  /** 导出完整备份（含 outbox、墓碑、设置） */
  async function exportFullBackup(): Promise<FullBackup> {
    const [
      tasks,
      reflections,
      sessions,
      outboxEvents,
      tombstones,
      syncStatusData,
    ] = await Promise.all([
      db.getAllTasks(),
      db.getAllReflections(),
      db.getAllSessions(),
      db.getUnpushedOutboxEvents(),
      db.getAllTombstones(),
      db.getSyncStatus(),
    ]);

    // 从 Settings Store 读取设置（兼容 Tauri / Web）
    let settings: AppConfig | null = null;
    try {
      const settingsStore = useSettingsStore();
      if (settingsStore.settings) {
        const { githubToken: _, ...rest } = settingsStore.settings;
        settings = rest as AppConfig;
      }
    } catch {
      // Store 未就绪时回退到 localStorage
      try {
        const raw = localStorage.getItem("pomodorox-settings");
        if (raw) {
          const parsed = JSON.parse(raw) as AppConfig;
          const { githubToken: _, ...rest } = parsed;
          settings = rest as AppConfig;
        }
      } catch {
        // ignore
      }
    }

    return {
      version: "2.0",
      app: "PomodoroX",
      exportedAt: new Date().toISOString(),
      data: {
        tasks,
        reflections,
        sessions,
        outbox: outboxEvents,
        tombstones,
        settings,
        syncStatus: syncStatusData,
      },
    };
  }

  /** 导入完整备份 */
  async function importFullBackup(
    backup: FullBackup,
    mode: "overwrite" | "merge" = "overwrite"
  ): Promise<{
    taskCount: number;
    reflectionCount: number;
    sessionCount: number;
    outboxCount: number;
    tombstoneCount: number;
  }> {
    const counts = {
      taskCount: 0,
      reflectionCount: 0,
      sessionCount: 0,
      outboxCount: 0,
      tombstoneCount: 0,
    };

    // 先校验备份结构完整性，避免 clearAll 后才发现格式错误
    if (!backup || typeof backup !== "object" || backup.version !== "2.0") {
      throw new Error("无效的备份文件格式：缺少版本标识或结构不完整");
    }
    if (!backup.data || typeof backup.data !== "object") {
      throw new Error("无效的备份文件格式：缺少 data 字段");
    }
    const requiredArrays = [
      "tasks",
      "reflections",
      "sessions",
      "outbox",
      "tombstones",
    ];
    for (const key of requiredArrays) {
      if (!Array.isArray(backup.data[key as keyof typeof backup.data])) {
        throw new Error(`无效的备份文件格式：data.${key} 不是数组`);
      }
    }

    if (mode === "overwrite") {
      await db.clearAll();
    }

    // 用事务包裹所有数据库写入，确保原子性
    await db.transaction(async () => {
      // Tasks
      for (const task of backup.data.tasks) {
        if (mode === "overwrite") {
          await db.createTask(task as any);
        } else {
          await db.upsertTask(task);
        }
        counts.taskCount++;
      }

      // Reflections
      for (const reflection of backup.data.reflections) {
        if (mode === "overwrite") {
          await db.createReflection(reflection as any);
        } else {
          await db.upsertReflection(reflection);
        }
        counts.reflectionCount++;
      }

      // Sessions
      for (const session of backup.data.sessions) {
        if (mode === "overwrite") {
          await db.createSession(session as any);
        } else {
          await db.upsertSession(session as any);
        }
        counts.sessionCount++;
      }

      // Outbox（恢复未同步事件）
      for (const event of backup.data.outbox) {
        await db.writeOutboxEvent(event);
        counts.outboxCount++;
      }

      // Tombstones
      if (backup.data.tombstones?.length > 0) {
        await db.upsertTombstones(backup.data.tombstones);
        counts.tombstoneCount = backup.data.tombstones.length;
      }
    });

    // Settings（web 端直接写 localStorage，不在 db 事务内）
    if (backup.data.settings) {
      localStorage.setItem(
        "pomodorox-settings",
        JSON.stringify(backup.data.settings)
      );
    }

    return counts;
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
    // 方法
    isConfigured,
    hasPendingEvents,
    loadSyncStatus,
    fullSyncAction,
    // 事件记录
    recordEvent,
    backgroundPull,
    // 数据管理
    loadDbStats,
    clearAllData,
    importRecords,
    exportAllData,
    exportFullBackup,
    importFullBackup,
  };
});
