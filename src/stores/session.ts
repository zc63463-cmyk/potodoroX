// ============================================================
// PomodoroX - 会话 Store
// 统一管理 Session 数据，消除 View 层越层 db 访问
// ============================================================

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Session, CreateSessionInput } from "@/types";
import { db } from "@/services/database";
import { formatDate } from "@/utils/format";
import { useSyncStore } from "@/stores/sync";
import { useTaskStore } from "@/stores/task";

export const useSessionStore = defineStore("session", () => {
  // 使用 SyncStore 的 recordEvent（已内置错误隔离）
  const syncStore = useSyncStore();
  const recordEvent = syncStore.recordEvent;
  // ---- 状态 ----
  /** 所有会话列表 */
  const sessions = ref<Session[]>([]);

  /** 是否正在加载 */
  const loading = ref(false);

  // ---- 计算属性 ----

  /** 今日会话 */
  const todaySessions = computed(() => {
    const today = formatDate(new Date());
    return sessions.value.filter((s) => s.startedAt.startsWith(today));
  });

  /** 今日已完成番茄钟数 */
  const todayPomodoros = computed(
    () =>
      todaySessions.value.filter((s) => s.type === "work" && s.completed).length
  );

  /** 指定日期范围的会话 */
  function getSessionsByDateRange(start: string, end: string): Session[] {
    const startDate = new Date(start + "T00:00:00");
    const endDate = new Date(end + "T23:59:59");
    return sessions.value.filter((s) => {
      const d = new Date(s.startedAt);
      return d >= startDate && d <= endDate;
    });
  }

  /** 指定任务的会话 */
  function getSessionsByTask(taskId: string): Session[] {
    return sessions.value.filter((s) => s.taskId === taskId);
  }

  // ---- 方法 ----

  /**
   * 加载所有会话
   */
  async function loadAllSessions(): Promise<void> {
    loading.value = true;
    try {
      sessions.value = await db.getAllSessions();
    } catch (err) {
      console.error("[SessionStore] 加载会话失败:", err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * 添加新会话（替代直接调用 db.createSession）
   * 供 timerStore 调用，保持内存同步
   */
  async function addSession(
    input: CreateSessionInput
  ): Promise<Session | null> {
    try {
      const session = await db.createSession(input);
      sessions.value.unshift(session);
      await recordEvent("session.created", session.id, session);
      return session;
    } catch (err) {
      console.error("[SessionStore] 创建会话失败:", err);
      return null;
    }
  }

  /**
   * 获取未同步的会话
   */
  async function getUnsyncedSessions(): Promise<Session[]> {
    try {
      return await db.getUnsyncedSessions();
    } catch (err) {
      console.error("[SessionStore] 获取未同步会话失败:", err);
      return [];
    }
  }

  /**
   * 更新会话（用于补充 plan/completion 等）
   */
  async function updateSession(
    id: string,
    input: Partial<Session>
  ): Promise<Session | null> {
    try {
      const updated = await db.updateSession(id, input);
      if (updated) {
        const index = sessions.value.findIndex((s) => s.id === id);
        if (index !== -1) {
          sessions.value[index] = updated;
        }
        await recordEvent("session.updated", id, updated);
      }
      return updated;
    } catch (err) {
      console.error("[SessionStore] 更新会话失败:", err);
      return null;
    }
  }

  /**
   * 删除会话
   * - 写 session.deleted 事件 + 墓碑（通过 consumer 联动）
   * - 若 session 是 work + completed 且关联了任务，则联动让 task.actualPomodoros - 1
   *   （会同时产生 task.updated 事件以保持多端一致）
   *
   * @returns 是否成功删除
   */
  async function deleteSession(id: string): Promise<boolean> {
    try {
      // 先从 db 读取以获得删除前的快照（taskId / completed / type）
      const target = await db.getSession(id);
      if (!target) return false;

      // 原子操作：task 计数回退 + session 删除在同一个事务中
      const ok = await db.transaction(async () => {
        if (target.type === "work" && target.completed && target.taskId) {
          const task = await db.getTask(target.taskId);
          if (task) {
            const next = Math.max(0, (task.actualPomodoros ?? 0) - 1);
            if (next !== task.actualPomodoros) {
              await db.updateTask(target.taskId, {
                actualPomodoros: next,
              });
            }
          }
        }
        return db.deleteSession(id);
      });

      if (!ok) return false;

      // 事务成功后同步内存状态
      const idx = sessions.value.findIndex((s) => s.id === id);
      if (idx !== -1) sessions.value.splice(idx, 1);

      // 同步 task store 内存状态（如果 task 在内存中）
      if (target.type === "work" && target.completed && target.taskId) {
        const taskStore = useTaskStore();
        const task = taskStore.getTaskById(target.taskId);
        if (task) {
          const next = Math.max(0, (task.actualPomodoros ?? 0) - 1);
          if (next !== task.actualPomodoros) {
            task.actualPomodoros = next;
          }
        }
      }

      await recordEvent("session.deleted", id, { id });
      return true;
    } catch (err) {
      console.error("[SessionStore] 删除会话失败:", err);
      return false;
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
    deleteSession,
    getSessionsByDateRange,
    getSessionsByTask,
    getUnsyncedSessions,
  };
});
