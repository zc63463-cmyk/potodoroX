// ============================================================
// PomodoroX - Tauri 环境检测工具
// 统一的 isTauriAvailable 检测函数
// ============================================================

/**
 * 检测当前是否运行在 Tauri 桌面环境中
 * @returns 是否在 Tauri 环境中
 */
export function isTauriAvailable(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}
