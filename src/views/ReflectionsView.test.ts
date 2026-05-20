/**
 * ReflectionsView 冒烟测试
 * 验证反思视图能成功挂载且关键 UI 元素存在
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";

// ============================================================
// Mock 子组件
// ============================================================
vi.mock("@/components/reflection/ReflectionEditor.vue", () => ({
  default: {
    name: "ReflectionEditor",
    template: '<div class="reflection-editor-mock" />',
    props: [
      "date",
      "content",
      "mood",
      "tags",
      "isSaving",
      "saveMessage",
      "showDeleteConfirm",
      "deleteTargetId",
    ],
    emits: [
      "update:content",
      "update:mood",
      "update:tags",
      "save",
      "delete",
      "close-delete",
      "confirm-delete",
    ],
  },
}));

vi.mock("@/components/reflection/ReflectionBrowser.vue", () => ({
  default: {
    name: "ReflectionBrowser",
    template: '<div class="reflection-browser-mock" />',
    props: [
      "reflections",
      "activeTag",
      "dateFrom",
      "dateTo",
      "showDetailModal",
      "detailReflection",
    ],
    emits: [
      "update:activeTag",
      "update:dateFrom",
      "update:dateTo",
      "open-detail",
      "close-detail",
    ],
  },
}));

vi.mock("@/components/reflection/ReflectionDetailModal.vue", () => ({
  default: {
    name: "ReflectionDetailModal",
    template: '<div class="reflection-detail-modal-mock" />',
    props: ["visible", "reflection"],
    emits: ["close"],
  },
}));

// ============================================================
// Mock Stores — 返回 plain 数据（非 ref），Pinia mock 无 auto-unwrap
// ============================================================
const mockReflections = [
  {
    id: "r1",
    date: "2026-05-20",
    content: "测试反思",
    mood: "good" as const,
    tags: ["高效"],
    relatedTaskIds: [],
    createdAt: "2026-05-20T10:00:00Z",
    updatedAt: "2026-05-20T10:00:00Z",
    synced: false,
  },
];

function createMockReflectionStore() {
  return {
    reflections: mockReflections,
    filteredReflections: mockReflections,
    createReflection: vi.fn().mockResolvedValue({ id: "r-new" }),
    updateReflection: vi.fn().mockResolvedValue(undefined),
    deleteReflection: vi.fn().mockResolvedValue(undefined),
    loadReflections: vi.fn().mockResolvedValue(undefined),
    setFilter: vi.fn(),
    setSort: vi.fn(),
    clearFilter: vi.fn(),
    getReflectionByDate: vi.fn().mockReturnValue(null),
  };
}

function createMockTaskStore() {
  return {
    tasks: [],
    loadTasks: vi.fn().mockResolvedValue(undefined),
    getTaskById: vi.fn(),
  };
}

vi.mock("@/stores/reflection", () => ({ useReflectionStore: vi.fn() }));
vi.mock("@/stores/task", () => ({ useTaskStore: vi.fn() }));

import { useReflectionStore } from "@/stores/reflection";
import { useTaskStore } from "@/stores/task";

// ============================================================
// 测试
// ============================================================
describe("ReflectionsView 冒烟测试", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    vi.mocked(useReflectionStore).mockReturnValue(
      createMockReflectionStore() as unknown as ReturnType<
        typeof useReflectionStore
      >
    );
    vi.mocked(useTaskStore).mockReturnValue(
      createMockTaskStore() as unknown as ReturnType<typeof useTaskStore>
    );
  });

  it("组件能成功挂载且不崩溃", async () => {
    const ReflectionsView = (await import("./ReflectionsView.vue")).default;
    const wrapper = mount(ReflectionsView);
    expect(wrapper.html()).toBeTruthy();
  });

  it("默认应渲染编辑器组件", async () => {
    const ReflectionsView = (await import("./ReflectionsView.vue")).default;
    const wrapper = mount(ReflectionsView);
    expect(wrapper.find(".reflection-editor-mock").exists()).toBe(true);
  });

  it("应该包含反思相关文本", async () => {
    const ReflectionsView = (await import("./ReflectionsView.vue")).default;
    const wrapper = mount(ReflectionsView);
    const text = wrapper.text();
    expect(text).toMatch(/反思|心情/);
  });
});
