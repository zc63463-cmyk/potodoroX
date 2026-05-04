import { describe, it, expect } from 'vitest'
import { DEFAULT_CONFIG } from './constants'

describe('DEFAULT_CONFIG', () => {
  it('should have freeDuration defaulting to 30 minutes (1800 seconds)', () => {
    expect(DEFAULT_CONFIG.freeDuration).toBe(1800)
  })

  it('should have existing duration fields unchanged', () => {
    expect(DEFAULT_CONFIG.workDuration).toBe(1500)    // 25min
    expect(DEFAULT_CONFIG.shortBreakDuration).toBe(300) // 5min
    expect(DEFAULT_CONFIG.longBreakDuration).toBe(900)  // 15min
  })
})
