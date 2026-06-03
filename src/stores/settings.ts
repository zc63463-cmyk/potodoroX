// ============================================================
// PomodoroX - 设置 Store
// 使用 @tauri-apps/plugin-store，回退到 localStorage
// ============================================================

import { defineStore } from "pinia";
import { ref, watch } from "vue";
import type { AppConfig, ThemeName } from "@/types";
import { DEFAULT_CONFIG, STORE_FILENAME } from "@/utils/constants";
import { isTauriAvailable } from "@/utils/tauri";
import { formatDate } from "@/utils/format";
import { secureSetItem, secureGetItem, secureRemoveItem } from "@/utils/crypto";

export const useSettingsStore = defineStore("settings", () => {
  // ---- 状态 ----
  const settings = ref<AppConfig>({ ...DEFAULT_CONFIG });

  /** 是否已加载设置 */
  const loaded = ref(false);

  // ---- 方法 ----

  /**
   * 从存储加载设置
   */
  async function loadSettings(): Promise<void> {
    try {
      if (isTauriAvailable()) {
        // 使用 Tauri Store 插件
        const { load } = await import("@tauri-apps/plugin-store");
        const store = await load(STORE_FILENAME, {
          autoSave: true,
          defaults: {},
        });
        const saved = await store.get<AppConfig>("settings");
        if (saved) {
          settings.value = { ...DEFAULT_CONFIG, ...saved };
        }
      } else {
        // 回退到 localStorage（token 字段加密存储）
        const savedRaw = localStorage.getItem("pomodorox-settings");
        if (savedRaw && savedRaw.trim()) {
          const parsed = JSON.parse(savedRaw) as Partial<AppConfig>;
          settings.value = { ...DEFAULT_CONFIG, ...parsed };
        }
        // 单独加载加密的 githubToken（覆盖未加密的兜底值）
        const encryptedToken = await secureGetItem("githubToken");
        if (encryptedToken) {
          settings.value.githubToken = encryptedToken;
        }
      }
    } catch (err) {
      console.warn("[Settings] 加载设置失败，使用默认值:", err);
      settings.value = { ...DEFAULT_CONFIG };
    }
    loaded.value = true;
    applyTheme(settings.value.theme);
  }

  /**
   * 保存设置到存储
   */
  async function saveSettings(): Promise<void> {
    try {
      if (isTauriAvailable()) {
        const { load } = await import("@tauri-apps/plugin-store");
        const store = await load(STORE_FILENAME, {
          autoSave: true,
          defaults: {},
        });
        await store.set("settings", settings.value);
      } else {
        // Token 单独加密存储，其余设置明文字段存入 localStorage
        const { githubToken, ...safeSettings } = settings.value;
        localStorage.setItem(
          "pomodorox-settings",
          JSON.stringify(safeSettings)
        );
        await secureSetItem("githubToken", githubToken);
      }
    } catch (err) {
      console.warn("[Settings] 保存设置失败:", err);
    }
  }

  /**
   * 更新单个设置项
   */
  async function updateSetting<K extends keyof AppConfig>(
    key: K,
    value: AppConfig[K]
  ): Promise<void> {
    settings.value[key] = value;
    if (key === "theme") {
      applyTheme(value as ThemeName);
    }
    await saveSettings();
  }

  /**
   * 批量更新设置
   */
  async function updateSettings(partial: Partial<AppConfig>): Promise<void> {
    settings.value = { ...settings.value, ...partial };
    if (partial.theme) {
      applyTheme(partial.theme);
    }
    await saveSettings();
  }

  /**
   * 重置设置为默认值
   */
  async function resetSettings(): Promise<void> {
    settings.value = { ...DEFAULT_CONFIG };
    applyTheme(DEFAULT_CONFIG.theme);
    // 浏览器端需单独清除加密 token
    if (!isTauriAvailable()) {
      secureRemoveItem("githubToken");
    }
    await saveSettings();
  }

  /**
   * 应用主题到 DOM
   */
  function applyTheme(theme: ThemeName): void {
    if (typeof document === "undefined") return;
    // 移除所有主题类
    document.body.classList.remove(
      "theme-dark-night",
      "theme-morning-mist",
      "theme-daylight",
      "theme-custom"
    );
    // 添加当前主题类
    document.body.classList.add(`theme-${theme}`);
  }

  /**
   * 获取本周起始日期（周一）YYYY-MM-DD
   */
  function getWeekStart(): string {
    const d = new Date();
    const day = d.getDay() || 7; // 周日=7
    if (day !== 1) {
      d.setDate(d.getDate() - (day - 1));
    }
    d.setHours(0, 0, 0, 0);
    return formatDate(d);
  }

  /**
   * 检查并重置每周快进额度（自然周重置）
   */
  function checkAndResetWeeklyQuota(): void {
    const currentWeekStart = getWeekStart();
    if (settings.value.weeklyFastForwardResetAt !== currentWeekStart) {
      settings.value.weeklyFastForwardUsed = 0;
      settings.value.weeklyFastForwardResetAt = currentWeekStart;
    }
  }

  /**
   * 获取工作时长（秒）
   */
  function getWorkDuration(): number {
    return settings.value.workDuration;
  }

  /**
   * 获取短休息时长（秒）
   */
  function getShortBreakDuration(): number {
    return settings.value.shortBreakDuration;
  }

  /**
   * 获取长休息时长（秒）
   */
  function getLongBreakDuration(): number {
    return settings.value.longBreakDuration;
  }

  // ---- 监听设置变化自动保存（防抖，避免与显式 saveSettings 竞态） ----
  let saveDebounce: ReturnType<typeof setTimeout> | null = null;
  watch(
    settings,
    () => {
      if (loaded.value) {
        if (saveDebounce) clearTimeout(saveDebounce);
        saveDebounce = setTimeout(() => {
          saveSettings().catch(() => {});
        }, 300);
      }
    },
    { deep: true }
  );

  return {
    // 状态
    settings,
    loaded,
    // 方法
    loadSettings,
    saveSettings,
    updateSetting,
    updateSettings,
    resetSettings,
    applyTheme,
    checkAndResetWeeklyQuota,
    getWeekStart,
    getWorkDuration,
    getShortBreakDuration,
    getLongBreakDuration,
  };
});
