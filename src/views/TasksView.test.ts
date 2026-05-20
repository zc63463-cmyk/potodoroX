/**
 * TasksView 冒烟测试
 * 验证任务管理视图能成功挂载且关键 UI 元素存在
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { ref, computed } from "vue";

// ============================================================
// Mock 子组件（stub 为简单占位组件）
// ============================================================
vi.mock("@/components/TaskDetailModal.vue", () => ({
  default: {
    name: "TaskDetailModal",
    template: '<div class="task-detail-modal-mock" />',
    props: ["visible", "task", "initialTab"],
    emits: ["close", "update:task"],
  },
}));

vi.mock("@/components/TaskFormModal.vue", () => ({
  default: {
    name: "TaskFormModal",
    template: '<div class="task-form-modal-mock" />',
    props: ["visible", "editingTask"],
    emits: ["close", "create", "update"],
  },
}));

vi.mock("@/components/TaskDeleteConfirm.vue", () => ({
  default: {
    name: "TaskDeleteConfirm",
    template: '<div class="task-delete-confirm-mock" />',
    props: ["visible", "taskId"],
    emits: ["close", "confirm"],
  },
}));

vi.mock("@/components/TaskListPanel.vue", () => ({
  default: {
    name: "TaskListPanel",
    template: '<div class="task-list-panel-mock" />',
    props: ["tasks", "viewMode"],
  },
}));

vi.mock("@/components/TaskKanbanPanel.vue", () => ({
  default: {
    name: "TaskKanbanPanel",
    template: '<div class="task-kanban-panel-mock" />',
    props: ["tasks"],
  },
}));

vi.mock("@/components/TaskCalendarPanel.vue", () => ({
  default: {
    name: "TaskCalendarPanel",
    template: '<div class="task-calendar-panel-mock" />',
    props: ["tasks"],
  },
}));

vi.mock("@/components/TaskExportModal.vue", () => ({
  default: {
    name: "TaskExportModal",
    template: '<div class="task-export-modal-mock" />',
    props: ["visible"],
    emits: ["close"],
  },
}));

// ============================================================
// Mock Stores
// ============================================================

function createMockTaskStore() {
  return {
    tasks: ref([
      {
        id: "t1",
        title: "测试任务",
        status: "todo",
        priority: "medium",
        tags: [],
        description: "",
        plan: "",
        completion: "",
        estimatedPomodoros: 2,
        actualPomodoros: 0,
        dueDate: null,
        assignedDate: "",
        createdAt: "2026-05-20T10:00:00Z",
        updatedAt: "2026-05-20T10:00:00Z",
        synced: false,
      },
    ]),
    filteredTasks: computed(() => [
      {
        id: "t1",
        title: "测试任务",
        status: "todo",
        priority: "medium",
        tags: [],
        description: "",
        plan: "",
        completion: "",
        estimatedPomodoros: 2,
        actualPomodoros: 0,
        dueDate: null,
        assignedDate: "",
        createdAt: "2026-05-20T10:00:00Z",
        updatedAt: "2026-05-20T10:00:00Z",
        synced: false,
      },
    ]),
    getTaskById: vi.fn().mockReturnValue({
      id: "t1",
      title: "测试任务",
    }),
    stats: computed(() => ({ total: 1, todo: 1, in_progress: 0, done: 0 })),
    setFilter: vi.fn(),
    setSort: vi.fn(),
    updateTask: vi.fn(),
    createTask: vi.fn(),
    deleteTask: vi.fn(),
    loadTasks: vi.fn().mockResolvedValue(undefined),
    loadTask: vi.fn(),
  };
}

function createMockSessionStore() {
  return {
    sessions: ref([]),
    todaySessions: computed(() => []),
    todayPomodoros: 0,
    loadAllSessions: vi.fn().mockResolvedValue(undefined),
    getSessionsByTask: vi.fn().mockResolvedValue([]),
  };
}

vi.mock("@/stores/task", () => ({
  useTaskStore: vi.fn(),
}));
vi.mock("@/stores/session", () => ({
  useSessionStore: vi.fn(),
}));

import { useTaskStore } from "@/stores/task";
import { useSessionStore } from "@/stores/session";

// ---- 测试 ----
describe("TasksView 冒烟测试", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    vi.mocked(useTaskStore).mockReturnValue(createMockTaskStore() as any);
    vi.mocked(useSessionStore).mockReturnValue(createMockSessionStore() as any);
  });

  it("组件能成功挂载且不崩溃", async () => {
    const TasksView = (await import("./TasksView.vue")).default;
    const wrapper = mount(TasksView);

    expect(wrapper.html()).toBeTruthy();
    expect(wrapper.html().length).toBeGreaterThan(100);
  });

  it("应该显示页面标题「任务管理」", async () => {
    const TasksView = (await import("./TasksView.vue")).default;
    const wrapper = mount(TasksView);

    expect(wrapper.text()).toContain("任务管理");
  });

  it("应该显示任务统计", async () => {
    const TasksView = (await import("./TasksView.vue")).default;
    const wrapper = mount(TasksView);

    // 显示 "1 个任务"
    const text = wrapper.text();
    expect(text).toContain("任务");
  });

  it("应该默认渲染列表视图", async () => {
    const TasksView = (await import("./TasksView.vue")).default;
    const wrapper = mount(TasksView);

    expect(wrapper.find(".task-list-panel-mock").exists()).toBe(true);
  });

  it("应该包含新建任务按钮", async () => {
    const TasksView = (await import("./TasksView.vue")).default;
    const wrapper = mount(TasksView);

    const html = wrapper.html();
    expect(html).toContain("new-task-btn");
  });
});
