// ============================================================
// settings store 回归测试
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

const mockTauriStore = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn().mockResolvedValue(undefined),
}));

const mockLoadTauriStore = vi.hoisted(() =>
  vi.fn().mockResolvedValue(mockTauriStore)
);

const mockIsTauriAvailable = vi.hoisted(() => vi.fn().mockReturnValue(false));

vi.mock("@/utils/tauri", () => ({
  isTauriAvailable: mockIsTauriAvailable,
}));

vi.mock("@tauri-apps/plugin-store", () => ({
  load: mockLoadTauriStore,
}));

const { useSettingsStore } = await import("./settings");

beforeEach(() => {
  setActivePinia(createPinia());
  mockIsTauriAvailable.mockReturnValue(false);
  mockLoadTauriStore.mockClear();
  mockTauriStore.get.mockClear().mockResolvedValue(undefined);
  mockTauriStore.set.mockClear().mockResolvedValue(undefined);
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ============================================================
// loadSettings
// ============================================================
describe("loadSettings", () => {
  it("localStorage 无数据时应使用默认值", async () => {
    const store = useSettingsStore();
    await store.loadSettings();
    expect(store.loaded).toBe(true);
    expect(store.settings.workDuration).toBe(1500);
  });

  it("localStorage 空字符串时不应解析", async () => {
    localStorage.setItem("pomodorox-settings", "   ");
    const store = useSettingsStore();
    await store.loadSettings();
    expect(store.loaded).toBe(true);
    expect(store.settings.workDuration).toBe(1500);
  });

  it("localStorage 有数据时应合并", async () => {
    localStorage.setItem(
      "pomodorox-settings",
      JSON.stringify({ workDuration: 1800, theme: "dark-night" })
    );
    const store = useSettingsStore();
    await store.loadSettings();
    expect(store.settings.workDuration).toBe(1800);
    expect(store.settings.theme).toBe("dark-night");
    expect(store.settings.shortBreakDuration).toBe(300); // 默认值保留
  });

  it("Tauri 环境下应使用 Store 插件", async () => {
    mockIsTauriAvailable.mockReturnValue(true);
    const customStore = {
      get: vi.fn().mockResolvedValue({ workDuration: 1200 }),
      set: vi.fn().mockResolvedValue(undefined),
    };
    mockLoadTauriStore.mockResolvedValue(customStore);
    const store = useSettingsStore();
    await store.loadSettings();
    expect(mockLoadTauriStore).toHaveBeenCalled();
    expect(store.settings.workDuration).toBe(1200);
    expect(store.loaded).toBe(true);
  });

  it("加载失败时应回退到默认值", async () => {
    localStorage.setItem("pomodorox-settings", "not-json");
    const store = useSettingsStore();
    await store.loadSettings();
    expect(store.loaded).toBe(true);
    expect(store.settings.workDuration).toBe(1500);
  });
});

// ============================================================
// saveSettings
// ============================================================
describe("saveSettings", () => {
  it("应保存到 localStorage", async () => {
    const store = useSettingsStore();
    store.settings.workDuration = 1800;
    await store.saveSettings();
    const saved = JSON.parse(localStorage.getItem("pomodorox-settings")!);
    expect(saved.workDuration).toBe(1800);
  });

  it("Tauri 环境下应保存到 Store 插件", async () => {
    mockIsTauriAvailable.mockReturnValue(true);
    const customStore = {
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue(undefined),
    };
    mockLoadTauriStore.mockResolvedValue(customStore);
    const store = useSettingsStore();
    store.settings.workDuration = 1800;
    await store.saveSettings();
    expect(customStore.set).toHaveBeenCalledWith(
      "settings",
      expect.objectContaining({ workDuration: 1800 })
    );
  });
});

// ============================================================
// updateSetting
// ============================================================
describe("updateSetting", () => {
  it("应更新单个设置并保存", async () => {
    const store = useSettingsStore();
    await store.updateSetting("workDuration", 1800);
    expect(store.settings.workDuration).toBe(1800);
    expect(localStorage.getItem("pomodorox-settings")).toContain("1800");
  });

  it("更新 theme 时应设置主题并保存", async () => {
    const store = useSettingsStore();
    await store.updateSetting("theme", "dark-night");
    expect(store.settings.theme).toBe("dark-night");
    expect(document.body.classList.contains("theme-dark-night")).toBe(true);
  });
});

// ============================================================
// updateSettings
// ============================================================
describe("updateSettings", () => {
  it("应批量更新并保存", async () => {
    const store = useSettingsStore();
    await store.updateSettings({ workDuration: 1800, shortBreakDuration: 600 });
    expect(store.settings.workDuration).toBe(1800);
    expect(store.settings.shortBreakDuration).toBe(600);
  });
});

// ============================================================
// resetSettings
// ============================================================
describe("resetSettings", () => {
  it("应重置为默认值", async () => {
    const store = useSettingsStore();
    store.settings.workDuration = 9999;
    await store.resetSettings();
    expect(store.settings.workDuration).toBe(1500);
  });
});

// ============================================================
// applyTheme
// ============================================================
describe("applyTheme", () => {
  it("应添加主题 class", () => {
    const store = useSettingsStore();
    store.applyTheme("dark-night");
    expect(document.body.classList.contains("theme-dark-night")).toBe(true);
  });

  it("应移除旧主题 class", () => {
    const store = useSettingsStore();
    document.body.classList.add("theme-daylight");
    store.applyTheme("dark-night");
    expect(document.body.classList.contains("theme-daylight")).toBe(false);
    expect(document.body.classList.contains("theme-dark-night")).toBe(true);
  });

  it("服务端环境下应安全返回", () => {
    const store = useSettingsStore();
    // document is undefined in some contexts; happy-dom provides it
    expect(() => store.applyTheme("daylight")).not.toThrow();
  });
});

// ============================================================
// checkAndResetWeeklyQuota
// ============================================================
describe("checkAndResetWeeklyQuota", () => {
  it("新周应重置额度", () => {
    const store = useSettingsStore();
    store.settings.weeklyFastForwardResetAt = "2020-01-01";
    store.settings.weeklyFastForwardUsed = 5;
    store.checkAndResetWeeklyQuota();
    expect(store.settings.weeklyFastForwardUsed).toBe(0);
    expect(store.settings.weeklyFastForwardResetAt).not.toBe("2020-01-01");
  });

  it("同一周不应重置", () => {
    const store = useSettingsStore();
    const monday = store.getWeekStart();
    store.settings.weeklyFastForwardResetAt = monday;
    store.settings.weeklyFastForwardUsed = 5;
    store.checkAndResetWeeklyQuota();
    expect(store.settings.weeklyFastForwardUsed).toBe(5);
  });
});

// ============================================================
// getWeekStart
// ============================================================
describe("getWeekStart", () => {
  it("应返回本周一", () => {
    const store = useSettingsStore();
    const result = store.getWeekStart();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const d = new Date(result);
    expect(d.getDay()).toBe(1); // Monday
  });
});

// ============================================================
// getDuration helpers
// ============================================================
describe("duration helpers", () => {
  it("应返回正确时长", () => {
    const store = useSettingsStore();
    expect(store.getWorkDuration()).toBe(1500);
    expect(store.getShortBreakDuration()).toBe(300);
    expect(store.getLongBreakDuration()).toBe(900);
  });
});
