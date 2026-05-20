// ============================================================
// PomodoroX - 任务 Store
// ============================================================

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilter,
  TaskStats,
  SortOption,
  SortField,
  SortOrder,
} from "@/types";
import { db } from "@/services/database";
import { PRIORITIES } from "@/utils/constants";
import { useSyncStore } from "@/stores/sync";
import { markTombstone } from "@/services/outbox";

export const useTaskStore = defineStore("task", () => {
  // 使用 SyncStore 的 recordEvent（已内置错误隔离）
  const syncStore = useSyncStore();
  const recordEvent = syncStore.recordEvent;
  // ---- 状态 ----
  /** 所有任务列表 */
  const tasks = ref<Task[]>([]);

  /** 当前筛选条件 */
  const filter = ref<TaskFilter>({});

  /** 排序选项 */
  const sort = ref<SortOption>({ field: "createdAt", order: "desc" });

  /** 是否正在加载 */
  const loading = ref(false);

  // ---- 计算属性 ----

  /** 筛选并排序后的任务列表 */
  const filteredTasks = computed(() => {
    let result = [...tasks.value];

    // 应用筛选
    if (filter.value.status) {
      result = result.filter((t) => t.status === filter.value.status);
    }
    if (filter.value.priority) {
      result = result.filter((t) => t.priority === filter.value.priority);
    }
    if (filter.value.tag) {
      result = result.filter((t) => t.tags.includes(filter.value.tag!));
    }
    if (filter.value.search) {
      const search = filter.value.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search)
      );
    }
    if (filter.value.dateFrom) {
      result = result.filter((t) => t.createdAt >= filter.value.dateFrom!);
    }
    if (filter.value.dateTo) {
      result = result.filter(
        (t) => t.createdAt <= filter.value.dateTo! + " 23:59:59"
      );
    }

    // 排除已归档（除非明确筛选）
    if (filter.value.status !== "archived") {
      result = result.filter((t) => t.status !== "archived");
    }

    // 应用排序
    result.sort((a, b) => {
      const field = sort.value.field;
      const order = sort.value.order === "asc" ? 1 : -1;

      switch (field) {
        case "priority": {
          const weightA =
            PRIORITIES.find((p) => p.value === a.priority)?.weight ?? 0;
          const weightB =
            PRIORITIES.find((p) => p.value === b.priority)?.weight ?? 0;
          return (weightA - weightB) * order;
        }
        case "dueDate": {
          const dateA = a.dueDate || "9999-12-31";
          const dateB = b.dueDate || "9999-12-31";
          return dateA.localeCompare(dateB) * order;
        }
        case "title":
          return a.title.localeCompare(b.title) * order;
        case "updatedAt":
          return a.updatedAt.localeCompare(b.updatedAt) * order;
        case "createdAt":
        default:
          return a.createdAt.localeCompare(b.createdAt) * order;
      }
    });

    return result;
  });

  /** 任务统计 */
  const stats = computed((): TaskStats => {
    const all = tasks.value;
    return {
      total: all.length,
      todo: all.filter((t) => t.status === "todo").length,
      inProgress: all.filter((t) => t.status === "in_progress").length,
      done: all.filter((t) => t.status === "done").length,
      archived: all.filter((t) => t.status === "archived").length,
      totalEstimated: all.reduce((sum, t) => sum + t.estimatedPomodoros, 0),
      totalActual: all.reduce((sum, t) => sum + t.actualPomodoros, 0),
    };
  });

  /** 所有唯一标签 */
  const allTags = computed(() => {
    const tags = new Set<string>();
    tasks.value.forEach((t) => t.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  });

  /** 活跃任务（非归档） */
  const activeTasks = computed(() =>
    tasks.value.filter((t) => t.status !== "archived")
  );

  /** 进行中的任务 */
  const inProgressTasks = computed(() =>
    tasks.value.filter((t) => t.status === "in_progress")
  );

  // ---- 方法 ----

  /**
   * 加载所有任务
   */
  async function loadTasks(): Promise<void> {
    loading.value = true;
    try {
      tasks.value = await db.getAllTasks();
    } catch (err) {
      console.error("[TaskStore] 加载任务失败:", err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * 创建新任务
   */
  async function createTask(input: CreateTaskInput): Promise<Task | null> {
    try {
      const task = await db.createTask(input);
      tasks.value.unshift(task);
      await recordEvent("task.created", task.id, task);
      return task;
    } catch (err) {
      console.error("[TaskStore] 创建任务失败:", err);
      return null;
    }
  }

  /**
   * 更新任务
   */
  async function updateTask(
    id: string,
    input: UpdateTaskInput
  ): Promise<Task | null> {
    try {
      const updated = await db.updateTask(id, input);
      if (updated) {
        const index = tasks.value.findIndex((t) => t.id === id);
        if (index !== -1) {
          tasks.value[index] = updated;
        }
        await recordEvent("task.updated", id, updated);
      }
      return updated;
    } catch (err) {
      console.error("[TaskStore] 更新任务失败:", err);
      return null;
    }
  }

  /**
   * 删除任务
   */
  async function deleteTask(id: string): Promise<boolean> {
    try {
      const success = await db.deleteTask(id);
      if (success) {
        tasks.value = tasks.value.filter((t) => t.id !== id);
        await markTombstone("task", id);
        await recordEvent("task.deleted", id, { id });
      }
      return success;
    } catch (err) {
      console.error("[TaskStore] 删除任务失败:", err);
      return false;
    }
  }

  /**
   * 根据 ID 获取任务
   */
  function getTaskById(id: string): Task | undefined {
    return tasks.value.find((t) => t.id === id);
  }

  /**
   * 设置筛选条件
   */
  function setFilter(newFilter: Partial<TaskFilter>): void {
    filter.value = { ...filter.value, ...newFilter };
  }

  /**
   * 清除筛选条件
   */
  function clearFilter(): void {
    filter.value = {};
  }

  /**
   * 设置排序
   */
  function setSort(field: SortField, order: SortOrder = "desc"): void {
    sort.value = { field, order };
  }

  /**
   * 快速切换任务状态
   */
  async function toggleTaskStatus(id: string): Promise<Task | null> {
    const task = tasks.value.find((t) => t.id === id);
    if (!task) return null;

    const statusFlow: Record<string, string> = {
      todo: "in_progress",
      in_progress: "done",
      done: "todo",
      archived: "todo",
    };

    const newStatus = statusFlow[task.status] || "todo";
    return updateTask(id, { status: newStatus as Task["status"] });
  }

  /**
   * 归档任务
   */
  async function archiveTask(id: string): Promise<Task | null> {
    return updateTask(id, { status: "archived" });
  }

  /**
   * 获取指定日期的任务
   */
  async function getTasksByDate(date: string): Promise<Task[]> {
    try {
      return await db.getTasksByDate(date);
    } catch (err) {
      console.error("[TaskStore] 获取日期任务失败:", err);
      return [];
    }
  }

  return {
    // 状态
    tasks,
    filter,
    sort,
    loading,
    // 计算属性
    filteredTasks,
    stats,
    allTags,
    activeTasks,
    inProgressTasks,
    // 方法
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    getTaskById,
    setFilter,
    clearFilter,
    setSort,
    toggleTaskStatus,
    archiveTask,
    getTasksByDate,
  };
});
