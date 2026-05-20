// ============================================================
// reflection store 回归测试
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

const mockDb = vi.hoisted(() => ({
  getAllReflections: vi.fn(),
  createReflection: vi.fn(),
  updateReflection: vi.fn(),
  deleteReflection: vi.fn(),
  getReflectionsByDateRange: vi.fn(),
}));

const mockRecordEvent = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockMarkTombstone = vi.hoisted(() =>
  vi.fn().mockResolvedValue(undefined)
);

vi.mock("@/services/database", () => ({ db: mockDb }));

vi.mock("@/stores/sync", () => ({
  useSyncStore: () => ({ recordEvent: mockRecordEvent }),
}));

vi.mock("@/services/outbox", () => ({
  markTombstone: mockMarkTombstone,
}));

vi.mock("@/utils/format", () => ({
  formatDate: (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  },
  formatDateTime: vi.fn(),
}));

const { useReflectionStore } = await import("./reflection");

function createMockReflection(
  overrides: Partial<
    ReturnType<typeof useReflectionStore>["reflections"][number]
  > = {}
) {
  return {
    id: "ref-1",
    date: "2026-05-01",
    content: "今日反思",
    mood: "good" as const,
    relatedTaskIds: [],
    tags: ["日记"],
    createdAt: "2026-05-01 18:00:00",
    updatedAt: "2026-05-01 18:00:00",
    synced: false,
    ...overrides,
  };
}

beforeEach(() => {
  setActivePinia(createPinia());
  mockDb.getAllReflections.mockReset();
  mockDb.createReflection.mockReset();
  mockDb.updateReflection.mockReset();
  mockDb.deleteReflection.mockReset();
  mockDb.getReflectionsByDateRange.mockReset();
  mockRecordEvent.mockReset().mockResolvedValue(undefined);
  mockMarkTombstone.mockReset().mockResolvedValue(undefined);
});

// ============================================================
// loadReflections
// ============================================================
describe("loadReflections", () => {
  it("应正确加载反思列表", async () => {
    const reflections = [
      createMockReflection({ id: "r1" }),
      createMockReflection({ id: "r2" }),
    ];
    mockDb.getAllReflections.mockResolvedValue(reflections);
    const store = useReflectionStore();
    await store.loadReflections();
    expect(store.reflections).toEqual(reflections);
    expect(store.loading).toBe(false);
  });

  it("加载失败时应捕获异常", async () => {
    mockDb.getAllReflections.mockRejectedValue(new Error("db error"));
    const store = useReflectionStore();
    await store.loadReflections();
    expect(store.reflections).toEqual([]);
    expect(store.loading).toBe(false);
  });
});

// ============================================================
// createReflection
// ============================================================
describe("createReflection", () => {
  it("应创建反思并 prepend 到列表", async () => {
    const input = {
      date: "2026-05-01",
      content: "新反思",
      mood: "great" as const,
      tags: [] as string[],
      relatedTaskIds: [] as string[],
    };
    const created = createMockReflection({ id: "new-1", content: "新反思" });
    mockDb.createReflection.mockResolvedValue(created);
    const store = useReflectionStore();
    const result = await store.createReflection(input);
    expect(result).toEqual(created);
    expect(store.reflections[0]).toEqual(created);
    expect(mockRecordEvent).toHaveBeenCalledWith(
      "reflection.created",
      "new-1",
      created
    );
  });

  it("创建失败时应返回 null", async () => {
    mockDb.createReflection.mockRejectedValue(new Error("fail"));
    const store = useReflectionStore();
    const result = await store.createReflection({
      date: "2026-05-01",
      content: "x",
      mood: "good",
      tags: [],
      relatedTaskIds: [],
    });
    expect(result).toBeNull();
  });
});

// ============================================================
// updateReflection
// ============================================================
describe("updateReflection", () => {
  it("应更新反思并同步本地列表", async () => {
    const existing = createMockReflection({ id: "r1", content: "旧内容" });
    const updated = createMockReflection({ id: "r1", content: "新内容" });
    mockDb.getAllReflections.mockResolvedValue([existing]);
    mockDb.updateReflection.mockResolvedValue(updated);
    const store = useReflectionStore();
    await store.loadReflections();
    const result = await store.updateReflection("r1", { content: "新内容" });
    expect(result).toEqual(updated);
    expect(store.reflections[0].content).toBe("新内容");
    expect(mockRecordEvent).toHaveBeenCalledWith(
      "reflection.updated",
      "r1",
      updated
    );
  });

  it("更新失败时应返回 null", async () => {
    mockDb.updateReflection.mockRejectedValue(new Error("fail"));
    const store = useReflectionStore();
    const result = await store.updateReflection("r1", { content: "x" });
    expect(result).toBeNull();
  });
});

// ============================================================
// deleteReflection
// ============================================================
describe("deleteReflection", () => {
  it("应删除反思并写 tombstone + 事件", async () => {
    const reflection = createMockReflection({ id: "r-del" });
    mockDb.getAllReflections.mockResolvedValue([reflection]);
    mockDb.deleteReflection.mockResolvedValue(true);
    const store = useReflectionStore();
    await store.loadReflections();
    const ok = await store.deleteReflection("r-del");
    expect(ok).toBe(true);
    expect(store.reflections).toHaveLength(0);
    expect(mockMarkTombstone).toHaveBeenCalledWith("reflection", "r-del");
    expect(mockRecordEvent).toHaveBeenCalledWith(
      "reflection.deleted",
      "r-del",
      { id: "r-del" }
    );
  });

  it("删除失败时应返回 false", async () => {
    mockDb.deleteReflection.mockResolvedValue(false);
    const store = useReflectionStore();
    const ok = await store.deleteReflection("r1");
    expect(ok).toBe(false);
    expect(mockMarkTombstone).not.toHaveBeenCalled();
  });
});

// ============================================================
// getReflectionById
// ============================================================
describe("getReflectionById", () => {
  it("应返回指定反思", async () => {
    const reflections = [
      createMockReflection({ id: "r1" }),
      createMockReflection({ id: "r2" }),
    ];
    mockDb.getAllReflections.mockResolvedValue(reflections);
    const store = useReflectionStore();
    await store.loadReflections();
    expect(store.getReflectionById("r2")?.id).toBe("r2");
    expect(store.getReflectionById("missing")).toBeUndefined();
  });
});

// ============================================================
// setFilter / clearFilter
// ============================================================
describe("filter", () => {
  it("setFilter 应合并筛选条件", () => {
    const store = useReflectionStore();
    store.setFilter({ mood: "good" });
    expect(store.filter.mood).toBe("good");
    store.setFilter({ tag: "日记" });
    expect(store.filter).toEqual({ mood: "good", tag: "日记" });
  });

  it("clearFilter 应重置筛选", () => {
    const store = useReflectionStore();
    store.setFilter({ mood: "good" });
    store.clearFilter();
    expect(store.filter).toEqual({});
  });
});

// ============================================================
// getReflectionsByDateRange
// ============================================================
describe("getReflectionsByDateRange", () => {
  it("应返回日期范围的反思", async () => {
    const reflections = [createMockReflection({ id: "r1" })];
    mockDb.getReflectionsByDateRange.mockResolvedValue(reflections);
    const store = useReflectionStore();
    const result = await store.getReflectionsByDateRange(
      "2026-05-01",
      "2026-05-31"
    );
    expect(result).toEqual(reflections);
  });

  it("失败时返回空数组", async () => {
    mockDb.getReflectionsByDateRange.mockRejectedValue(new Error("fail"));
    const store = useReflectionStore();
    const result = await store.getReflectionsByDateRange(
      "2026-05-01",
      "2026-05-31"
    );
    expect(result).toEqual([]);
  });
});

// ============================================================
// 计算属性
// ============================================================
describe("computed", () => {
  function seed(store: ReturnType<typeof useReflectionStore>) {
    store.reflections = [
      createMockReflection({
        id: "r1",
        date: "2026-05-01",
        mood: "good",
        tags: ["A"],
        createdAt: "2026-05-01 10:00:00",
      }),
      createMockReflection({
        id: "r2",
        date: "2026-05-02",
        mood: "bad",
        tags: ["B"],
        createdAt: "2026-05-02 10:00:00",
      }),
      createMockReflection({
        id: "r3",
        date: "2026-05-01",
        mood: "good",
        tags: ["A", "C"],
        createdAt: "2026-05-01 09:00:00",
      }),
    ];
  }

  it("filteredReflections 默认按日期倒序", () => {
    const store = useReflectionStore();
    seed(store);
    expect(store.filteredReflections.map((r) => r.id)).toEqual([
      "r2",
      "r1",
      "r3",
    ]);
  });

  it("filteredReflections 应按日期范围筛选", () => {
    const store = useReflectionStore();
    seed(store);
    store.setFilter({ dateFrom: "2026-05-01", dateTo: "2026-05-01" });
    expect(store.filteredReflections.map((r) => r.id)).toEqual(["r1", "r3"]);
  });

  it("filteredReflections 应按心情筛选", () => {
    const store = useReflectionStore();
    seed(store);
    store.setFilter({ mood: "bad" });
    expect(store.filteredReflections.map((r) => r.id)).toEqual(["r2"]);
  });

  it("filteredReflections 应按标签筛选", () => {
    const store = useReflectionStore();
    seed(store);
    store.setFilter({ tag: "A" });
    expect(store.filteredReflections.map((r) => r.id)).toEqual(["r1", "r3"]);
  });

  it("filteredReflections 同日期按 createdAt 倒序", () => {
    const store = useReflectionStore();
    seed(store);
    store.setFilter({ dateFrom: "2026-05-01", dateTo: "2026-05-01" });
    expect(store.filteredReflections.map((r) => r.id)).toEqual(["r1", "r3"]);
  });

  it("allTags 应返回排序后的唯一标签", () => {
    const store = useReflectionStore();
    seed(store);
    expect(store.allTags).toEqual(["A", "B", "C"]);
  });

  it("moodDistribution 应统计心情分布", () => {
    const store = useReflectionStore();
    seed(store);
    expect(store.moodDistribution.get("good")).toBe(2);
    expect(store.moodDistribution.get("bad")).toBe(1);
  });

  it("todayReflections 应返回今日反思", () => {
    const store = useReflectionStore();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    store.reflections = [
      createMockReflection({ id: "r1", date: todayStr }),
      createMockReflection({ id: "r2", date: "2020-01-01" }),
    ];
    expect(store.todayReflections.map((r) => r.id)).toEqual(["r1"]);
  });
});
