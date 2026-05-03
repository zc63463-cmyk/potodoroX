import { describe, it, expect } from 'vitest'

/**
 * 测试 github.ts 中使用的 UTF-8 Base64 编码方案
 * 这些函数是模块私有的，此处独立验证其正确性
 */
describe('UTF-8 Base64 编码', () => {
  /**
   * 复制 github.ts 中的编码函数用于测试
   */
  function utf8ToBase64(str: string): string {
    const bytes = new TextEncoder().encode(str)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  function base64ToUtf8(base64: string): string {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new TextDecoder().decode(bytes)
  }

  it('应该正确编码 ASCII 字符', () => {
    const input = 'Hello World'
    const encoded = utf8ToBase64(input)
    const decoded = base64ToUtf8(encoded)
    expect(decoded).toBe(input)
  })

  it('应该正确编码中文字符', () => {
    const input = '你好世界 PomodoroX'
    const encoded = utf8ToBase64(input)
    const decoded = base64ToUtf8(encoded)
    expect(decoded).toBe(input)
  })

  it('应该正确编码 JSON 数据', () => {
    const input = JSON.stringify({ title: '任务一', tags: ['工作', '重要'] }, null, 2)
    const encoded = utf8ToBase64(input)
    const decoded = base64ToUtf8(encoded)
    expect(decoded).toBe(input)
  })

  it('应该正确编码 emoji', () => {
    const input = '完成了一个番茄 🍅 休息 ☕'
    const encoded = utf8ToBase64(input)
    const decoded = base64ToUtf8(encoded)
    expect(decoded).toBe(input)
  })

  it('应该处理空字符串', () => {
    const input = ''
    const encoded = utf8ToBase64(input)
    const decoded = base64ToUtf8(encoded)
    expect(decoded).toBe(input)
  })

  it('编码结果应该是合法的 Base64', () => {
    const input = '测试数据123'
    const encoded = utf8ToBase64(input)
    // Base64 格式验证：只包含 A-Z, a-z, 0-9, +, /, =
    expect(encoded).toMatch(/^[A-Za-z0-9+/]*={0,2}$/)
  })
})
