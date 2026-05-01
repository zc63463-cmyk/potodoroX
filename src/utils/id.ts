// ============================================================
// PomodoroX - UUID 生成工具
// ============================================================

/**
 * 生成 UUID v4
 * 优先使用 crypto.randomUUID()，回退到手动生成
 * @returns UUID 字符串
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  // 回退方案：手动生成 UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
