/**
 * 检测当前运行环境
 */

export function isTauri(): boolean {
  return (
    typeof window !== "undefined" &&
    (window as unknown as Record<string, unknown>).__TAURI__ !== undefined
  );
}

export function isWeb(): boolean {
  return typeof window !== "undefined" && !isTauri();
}
