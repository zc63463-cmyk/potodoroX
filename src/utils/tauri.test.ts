import { describe, it, expect } from 'vitest'
import { isTauriAvailable } from '@/utils/tauri'

describe('isTauriAvailable', () => {
  it('在浏览器环境中应该返回 false', () => {
    // 测试环境没有 __TAURI_INTERNALS__
    expect(isTauriAvailable()).toBe(false)
  })

  it('当 window.__TAURI_INTERNALS__ 存在时应返回 true', () => {
    // 模拟 Tauri 环境
    const originalInternals = (globalThis as Record<string, unknown>).__TAURI_INTERNALS__

    try {
      ;(globalThis as Record<string, unknown>).__TAURI_INTERNALS__ = {}
      expect(isTauriAvailable()).toBe(true)
    } finally {
      // 恢复原始状态
      if (originalInternals === undefined) {
        delete (globalThis as Record<string, unknown>).__TAURI_INTERNALS__
      } else {
        ;(globalThis as Record<string, unknown>).__TAURI_INTERNALS__ = originalInternals
      }
    }
  })
})
