// ============================================================
// PomodoroX - 音频 Composable
// 使用 Web Audio API 程序化生成音效
// ============================================================

import { ref } from 'vue'

// ---- 音频上下文（懒加载） ----
let audioContext: AudioContext | null = null
let masterGain: GainNode | null = null

/** 音量级别 0~1 */
const volume = ref(0.5)

/**
 * 获取或创建 AudioContext
 */
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
    masterGain = audioContext.createGain()
    masterGain.gain.value = volume.value
    masterGain.connect(audioContext.destination)
  }
  // 恢复被暂停的上下文（浏览器自动暂停策略）
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
  return audioContext
}

/**
 * 设置音量
 * @param level 音量级别 0~1
 */
export function setVolume(level: number): void {
  volume.value = Math.max(0, Math.min(1, level))
  if (masterGain) {
    masterGain.gain.value = volume.value
  }
}

/**
 * 生成基础音调
 * @param frequency 频率 (Hz)
 * @param duration 持续时间 (秒)
 * @param type 波形类型
 * @param startDelay 开始延迟 (秒)
 */
export function generateTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  startDelay = 0
): void {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startDelay)

    // 淡入淡出，避免爆音
    gainNode.gain.setValueAtTime(0, ctx.currentTime + startDelay)
    gainNode.gain.linearRampToValueAtTime(volume.value * 0.3, ctx.currentTime + startDelay + 0.05)
    gainNode.gain.linearRampToValueAtTime(volume.value * 0.3, ctx.currentTime + startDelay + duration - 0.1)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + startDelay + duration)

    oscillator.connect(gainNode)
    gainNode.connect(masterGain || ctx.destination)

    oscillator.start(ctx.currentTime + startDelay)
    oscillator.stop(ctx.currentTime + startDelay + duration)
  } catch {
    // Web Audio API 不可用时静默失败
  }
}

/**
 * 播放专注开始音效 - 柔和上升音调
 */
export function playFocusStart(): void {
  try {
    getAudioContext()

    // 三个上升音符 C5 -> E5 -> G5
    const notes = [523.25, 659.25, 783.99]
    notes.forEach((freq, i) => {
      generateTone(freq, 0.3, 'sine', i * 0.15)
    })
  } catch {
    // 静默失败
  }
}

/**
 * 播放休息开始音效 - 柔和铃声
 */
export function playBreakStart(): void {
  try {
    getAudioContext()

    // 柔和的双音铃声
    generateTone(800, 0.5, 'sine', 0)
    generateTone(1200, 0.4, 'sine', 0.1)
  } catch {
    // 静默失败
  }
}

/**
 * 播放会话完成音效 - 愉悦的和弦
 */
export function playSessionComplete(): void {
  try {
    getAudioContext()

    // C大调和弦 C5, E5, G5, C6
    const chord = [523.25, 659.25, 783.99, 1046.5]
    chord.forEach((freq, i) => {
      generateTone(freq, 0.8, 'sine', i * 0.08)
    })

    // 额外的低音
    generateTone(261.63, 1.0, 'triangle', 0)
  } catch {
    // 静默失败
  }
}

/**
 * 播放轻微的滴答声（可选）
 */
export function playTick(): void {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime)

    gainNode.gain.setValueAtTime(volume.value * 0.05, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.03)

    oscillator.connect(gainNode)
    gainNode.connect(masterGain || ctx.destination)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.03)
  } catch {
    // 静默失败
  }
}

/**
 * 播放错误/警告音效
 */
export function playError(): void {
  try {
    generateTone(200, 0.3, 'square', 0)
    generateTone(150, 0.3, 'square', 0.2)
  } catch {
    // 静默失败
  }
}

/**
 * 播放成功音效
 */
export function playSuccess(): void {
  try {
    // 上行琶音
    const notes = [523.25, 587.33, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) => {
      generateTone(freq, 0.2, 'sine', i * 0.1)
    })
  } catch {
    // 静默失败
  }
}

export function useAudio() {
  return {
    volume,
    setVolume,
    generateTone,
    playFocusStart,
    playBreakStart,
    playSessionComplete,
    playTick,
    playError,
    playSuccess,
  }
}
