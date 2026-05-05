/**
 * 检测当前运行环境
 */

export function isTauri(): boolean {
  return typeof window !== 'undefined' && (window as any).__TAURI__ !== undefined
}

export function isWeb(): boolean {
  return typeof window !== 'undefined' && !isTauri()
}
