// ============================================================
// PomodoroX - 设置 Store
// 使用 @tauri-apps/plugin-store，回退到 localStorage
// ============================================================

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { AppConfig, ThemeName } from '@/types'
import { DEFAULT_CONFIG, STORE_FILENAME } from '@/utils/constants'
import { isTauriAvailable } from '@/utils/tauri'
import { formatDate } from '@/utils/format'

export const useSettingsStore = defineStore('settings', () => {
  // ---- 状态 ----
  const settings = ref<AppConfig>({ ...DEFAULT_CONFIG })

  /** 是否已加载设置 */
  const loaded = ref(false)

  // ---- 方法 ----

  /**
   * 从存储加载设置
   */
  async function loadSettings(): Promise<void> {
    try {
      if (isTauriAvailable()) {
        // 使用 Tauri Store 插件
        const { load } = await import('@tauri-apps/plugin-store')
        const store = await load(STORE_FILENAME, { autoSave: true, defaults: {} })
        const saved = await store.get<AppConfig>('settings')
        if (saved) {
          settings.value = { ...DEFAULT_CONFIG, ...saved }
        }
      } else {
        // 回退到 localStorage
        const saved = localStorage.getItem('pomodorox-settings')
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<AppConfig>
          settings.value = { ...DEFAULT_CONFIG, ...parsed }
        }
      }
    } catch (err) {
      console.warn('[Settings] 加载设置失败，使用默认值:', err)
      settings.value = { ...DEFAULT_CONFIG }
    }
    loaded.value = true
    applyTheme(settings.value.theme)
  }

  /**
   * 保存设置到存储
   */
  async function saveSettings(): Promise<void> {
    try {
      if (isTauriAvailable()) {
        const { load } = await import('@tauri-apps/plugin-store')
        const store = await load(STORE_FILENAME, { autoSave: true, defaults: {} })
        await store.set('settings', settings.value)
      } else {
        localStorage.setItem('pomodorox-settings', JSON.stringify(settings.value))
      }
    } catch (err) {
      console.warn('[Settings] 保存设置失败:', err)
    }
  }

  /**
   * 更新单个设置项
   */
  async function updateSetting<K extends keyof AppConfig>(key: K, value: AppConfig[K]): Promise<void> {
    settings.value[key] = value
    if (key === 'theme') {
      applyTheme(value as ThemeName)
    }
    await saveSettings()
  }

  /**
   * 批量更新设置
   */
  async function updateSettings(partial: Partial<AppConfig>): Promise<void> {
    settings.value = { ...settings.value, ...partial }
    if (partial.theme) {
      applyTheme(partial.theme)
    }
    await saveSettings()
  }

  /**
   * 重置设置为默认值
   */
  async function resetSettings(): Promise<void> {
    settings.value = { ...DEFAULT_CONFIG }
    applyTheme(DEFAULT_CONFIG.theme)
    await saveSettings()
  }

  /**
   * 应用主题到 DOM
   */
  function applyTheme(theme: ThemeName): void {
    if (typeof document === 'undefined') return
    // 移除所有主题类
    document.body.classList.remove('theme-dark-night', 'theme-morning-mist', 'theme-daylight', 'theme-custom')
    // 添加当前主题类
    document.body.classList.add(`theme-${theme}`)
  }

  /**
   * 获取本周起始日期（周一）YYYY-MM-DD
   */
  function getWeekStart(): string {
    const d = new Date()
    const day = d.getDay() || 7 // 周日=7
    if (day !== 1) {
      d.setDate(d.getDate() - (day - 1))
    }
    d.setHours(0, 0, 0, 0)
    return formatDate(d)
  }

  /**
   * 检查并重置每周快进额度（自然周重置）
   */
  function checkAndResetWeeklyQuota(): void {
    const currentWeekStart = getWeekStart()
    if (settings.value.weeklyFastForwardResetAt !== currentWeekStart) {
      settings.value.weeklyFastForwardUsed = 0
      settings.value.weeklyFastForwardResetAt = currentWeekStart
    }
  }

  /**
   * 获取工作时长（秒）
   */
  function getWorkDuration(): number {
    return settings.value.workDuration
  }

  /**
   * 获取短休息时长（秒）
   */
  function getShortBreakDuration(): number {
    return settings.value.shortBreakDuration
  }

  /**
   * 获取长休息时长（秒）
   */
  function getLongBreakDuration(): number {
    return settings.value.longBreakDuration
  }

  // ---- 监听设置变化自动保存 ----
  watch(
    settings,
    () => {
      if (loaded.value) {
        saveSettings()
      }
    },
    { deep: true }
  )

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
  }
})
