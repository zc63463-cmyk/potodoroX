/**
 * useAudio 测试
 * 覆盖：Web Audio API 音效生成 / 音量控制 / 错误容错
 *
 * 注意：useAudio 使用模块级 audioContext 单例，需用 vi.resetModules() 隔离测试
 */

import { describe, it, expect, vi } from "vitest";

// ---- 辅助函数：创建 mock 并动态导入 ----
async function setupMock(suspended = false) {
  vi.resetModules();

  const mockCtx = {
    state: suspended ? ("suspended" as const) : ("running" as const),
    currentTime: 10,
    destination: Symbol("destination"),
    createGain: vi.fn(() => ({
      gain: {
        value: 1,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    })),
    createOscillator: vi.fn(() => ({
      type: "sine",
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    })),
    resume: vi.fn(),
  };

  // @ts-expect-error - mock
  globalThis.AudioContext = vi.fn(() => mockCtx);

  const mod = await import("./useAudio");
  // 重置音量到默认值
  mod.setVolume(0.5);

  return { mockCtx, ...mod };
}

// ============================================================
// useAudio composable
// ============================================================
describe("useAudio", () => {
  it("应该返回所有音效函数", async () => {
    const { useAudio } = await setupMock();
    const audio = useAudio();
    expect(audio.volume).toBeDefined();
    expect(audio.setVolume).toBeDefined();
    expect(audio.generateTone).toBeDefined();
    expect(audio.playFocusStart).toBeDefined();
    expect(audio.playBreakStart).toBeDefined();
    expect(audio.playSessionComplete).toBeDefined();
    expect(audio.playTick).toBeDefined();
    expect(audio.playError).toBeDefined();
    expect(audio.playSuccess).toBeDefined();
  });
});

// ============================================================
// setVolume
// ============================================================
describe("setVolume", () => {
  it("应该设置 0~1 之间的音量", async () => {
    const { setVolume, useAudio } = await setupMock();
    setVolume(0.8);
    const audio = useAudio();
    expect(audio.volume.value).toBe(0.8);
  });

  it("音量超过 1 应限制为 1", async () => {
    const { setVolume, useAudio } = await setupMock();
    setVolume(1.5);
    const audio = useAudio();
    expect(audio.volume.value).toBe(1);
  });

  it("音量低于 0 应限制为 0", async () => {
    const { setVolume, useAudio } = await setupMock();
    setVolume(-0.3);
    const audio = useAudio();
    expect(audio.volume.value).toBe(0);
  });
});

// ============================================================
// generateTone
// ============================================================
describe("generateTone", () => {
  it("应该创建 oscillator 和 gain 节点", async () => {
    const { generateTone, mockCtx } = await setupMock();
    generateTone(440, 0.5, "sine", 0);

    expect(mockCtx.createOscillator).toHaveBeenCalled();
    expect(mockCtx.createGain).toHaveBeenCalled();
  });

  it("应该设置正确的频率和波形", async () => {
    const { generateTone, mockCtx } = await setupMock();
    generateTone(880, 1.0, "triangle", 0.2);

    const osc = mockCtx.createOscillator.mock.results[0].value;
    expect(osc.type).toBe("triangle");
    expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(
      880,
      expect.any(Number)
    );
  });

  it("应该调用 oscillator.start 和 stop", async () => {
    const { generateTone, mockCtx } = await setupMock();
    generateTone(440, 0.5, "sine", 0);

    const osc = mockCtx.createOscillator.mock.results[0].value;
    expect(osc.start).toHaveBeenCalled();
    expect(osc.stop).toHaveBeenCalled();
  });

  it("应该设置 startDelay 偏移", async () => {
    const { generateTone, mockCtx } = await setupMock();
    generateTone(440, 0.5, "sine", 1.5);

    const osc = mockCtx.createOscillator.mock.results[0].value;
    expect(osc.start).toHaveBeenCalledWith(expect.any(Number));
  });

  it("AudioContext 创建失败应静默容错", async () => {
    vi.resetModules();
    globalThis.AudioContext = vi.fn(() => {
      throw new Error("Web Audio not supported");
    });
    const { generateTone } = await import("./useAudio");

    expect(() => generateTone(440, 0.5)).not.toThrow();
  });
});

// ============================================================
// playFocusStart
// ============================================================
describe("playFocusStart", () => {
  it("应该播放 3 个音符的上升音阶 C5→E5→G5", async () => {
    const { playFocusStart, mockCtx } = await setupMock();
    playFocusStart();

    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(3);
  });

  it("AudioContext 创建失败应静默容错", async () => {
    vi.resetModules();
    globalThis.AudioContext = vi.fn(() => {
      throw new Error("fail");
    });
    const { playFocusStart } = await import("./useAudio");

    expect(() => playFocusStart()).not.toThrow();
  });
});

// ============================================================
// playBreakStart
// ============================================================
describe("playBreakStart", () => {
  it("应该播放双音铃声", async () => {
    const { playBreakStart, mockCtx } = await setupMock();
    playBreakStart();

    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(2);
  });
});

// ============================================================
// playSessionComplete
// ============================================================
describe("playSessionComplete", () => {
  it("应该播放 C 大调和弦（4 和弦 + 1 低音 = 5 音符）", async () => {
    const { playSessionComplete, mockCtx } = await setupMock();
    playSessionComplete();

    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(5);
  });
});

// ============================================================
// playTick
// ============================================================
describe("playTick", () => {
  it("应该创建 1000Hz 短促正弦波", async () => {
    const { playTick, mockCtx } = await setupMock();
    playTick();

    const osc = mockCtx.createOscillator.mock.results[0].value;
    expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(
      1000,
      expect.any(Number)
    );
    expect(osc.start).toHaveBeenCalled();
    expect(osc.stop).toHaveBeenCalled();
  });
});

// ============================================================
// playError
// ============================================================
describe("playError", () => {
  it("应该播放两个低频方波", async () => {
    const { playError, mockCtx } = await setupMock();
    playError();

    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(2);
  });
});

// ============================================================
// playSuccess
// ============================================================
describe("playSuccess", () => {
  it("应该播放 5 个音符的上行琶音", async () => {
    const { playSuccess, mockCtx } = await setupMock();
    playSuccess();

    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(5);
  });
});

// ============================================================
// AudioContext 管理
// ============================================================
describe("AudioContext 管理", () => {
  it("suspended 状态应被 resume", async () => {
    const { playTick, mockCtx } = await setupMock(true);
    playTick();

    expect(mockCtx.resume).toHaveBeenCalled();
  });

  it("running 状态不应调用 resume", async () => {
    const { playTick, mockCtx } = await setupMock(false);
    playTick();

    expect(mockCtx.resume).not.toHaveBeenCalled();
  });
});
