// ============================================================
// app store 回归测试
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

const { useAppStore } = await import("./app");

beforeEach(() => {
  setActivePinia(createPinia());
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ============================================================
// sidebar
// ============================================================
describe("sidebar", () => {
  it("toggleSidebar 应切换状态", () => {
    const store = useAppStore();
    expect(store.sidebarCollapsed).toBe(false);
    store.toggleSidebar();
    expect(store.sidebarCollapsed).toBe(true);
    expect(store.sidebarWidth).toBe("64px");
    store.toggleSidebar();
    expect(store.sidebarCollapsed).toBe(false);
    expect(store.sidebarWidth).toBe("240px");
  });
});

// ============================================================
// navigation
// ============================================================
describe("navigation", () => {
  it("navigateTo 应切换视图", () => {
    const store = useAppStore();
    expect(store.currentView).toBe("timer");
    store.navigateTo("tasks");
    expect(store.currentView).toBe("tasks");
    store.navigateTo("settings");
    expect(store.currentView).toBe("settings");
  });
});

// ============================================================
// online status
// ============================================================
describe("online status", () => {
  it("updateOnlineStatus 应读取 navigator.onLine", () => {
    const store = useAppStore();
    // happy-dom 默认 navigator.onLine = true
    store.updateOnlineStatus();
    expect(store.isOnline).toBe(true);
  });
});

// ============================================================
// sync status
// ============================================================
describe("sync status", () => {
  it("setSyncStatus 应合并状态", () => {
    const store = useAppStore();
    expect(store.syncStatus).toEqual({
      lastSyncAt: null,
      pendingCount: 0,
      isSyncing: false,
    });
    store.setSyncStatus({ pendingCount: 5 });
    expect(store.syncStatus.pendingCount).toBe(5);
    expect(store.hasPendingSync).toBe(true);
    store.setSyncStatus({ pendingCount: 0 });
    expect(store.hasPendingSync).toBe(false);
  });
});

// ============================================================
// global search
// ============================================================
describe("global search", () => {
  it("toggleGlobalSearch 应切换显示状态", () => {
    const store = useAppStore();
    expect(store.showGlobalSearch).toBe(false);
    store.toggleGlobalSearch();
    expect(store.showGlobalSearch).toBe(true);
    store.toggleGlobalSearch();
    expect(store.showGlobalSearch).toBe(false);
  });

  it("closeGlobalSearch 应关闭搜索", () => {
    const store = useAppStore();
    store.showGlobalSearch = true;
    store.closeGlobalSearch();
    expect(store.showGlobalSearch).toBe(false);
  });
});

// ============================================================
// modal
// ============================================================
describe("modal", () => {
  it("openModal / closeModal 应切换状态", () => {
    const store = useAppStore();
    expect(store.modalOpen).toBe(false);
    store.openModal();
    expect(store.modalOpen).toBe(true);
    store.closeModal();
    expect(store.modalOpen).toBe(false);
  });
});

// ============================================================
// immersive mode
// ============================================================
describe("immersive mode", () => {
  it("toggleImmersiveMode 应切换状态", () => {
    const store = useAppStore();
    expect(store.immersiveMode).toBe(false);
    store.toggleImmersiveMode();
    expect(store.immersiveMode).toBe(true);
    store.toggleImmersiveMode();
    expect(store.immersiveMode).toBe(false);
  });

  it("exitImmersiveMode 应退出沉浸模式", () => {
    const store = useAppStore();
    store.immersiveMode = true;
    store.exitImmersiveMode();
    expect(store.immersiveMode).toBe(false);
  });
});

// ============================================================
// toast
// ============================================================
describe("toast", () => {
  it("showToast 应添加 toast 到列表", () => {
    const store = useAppStore();
    store.showToast("hello", "info", 3000);
    expect(store.toasts).toHaveLength(1);
    expect(store.toasts[0].message).toBe("hello");
    expect(store.toasts[0].type).toBe("info");
  });

  it("showToast 应使用默认参数", () => {
    const store = useAppStore();
    store.showToast("default");
    expect(store.toasts[0].type).toBe("info");
    expect(store.toasts[0].timer).toBeDefined();
  });

  it("removeToast 应移除指定 toast", () => {
    const store = useAppStore();
    store.showToast("a");
    store.showToast("b");
    const id = store.toasts[0].id;
    store.removeToast(id);
    expect(store.toasts).toHaveLength(1);
    expect(store.toasts[0].message).toBe("b");
  });

  it("removeToast 应清理 timer", () => {
    const store = useAppStore();
    store.showToast("a");
    const id = store.toasts[0].id;
    const timer = store.toasts[0].timer;
    const clearSpy = vi.spyOn(globalThis, "clearTimeout");
    store.removeToast(id);
    expect(clearSpy).toHaveBeenCalledWith(timer);
  });

  it("removeToast 对不存在的 id 应静默处理", () => {
    const store = useAppStore();
    store.showToast("a");
    store.removeToast("not-exists");
    expect(store.toasts).toHaveLength(1);
  });
});
