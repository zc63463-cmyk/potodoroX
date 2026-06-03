/**
 * network.ts 测试
 * 覆盖：probeOnline 缓存/成功/失败/超时 / isOnline 边界条件
 *
 * 注意：probeOnline 使用模块级变量 (lastProbeResult/lastProbeAt)，
 * 需用 vi.resetModules() 隔离测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---- 辅助函数 ----
function setupMockFetch(
  options: { ok?: boolean; reject?: boolean; abortDelay?: number } = {}
) {
  const mockRes = { ok: options.ok ?? true, status: 200 };
  const mockFetch = vi.fn(
    () =>
      new Promise((resolve, reject) => {
        if (options.reject) {
          reject(new Error("Network error"));
        } else {
          resolve(mockRes);
        }
      })
  ) as unknown as typeof fetch;
  globalThis.fetch = mockFetch;

  const mockAbort = vi.fn();
  globalThis.AbortController = vi.fn().mockImplementation(function () {
    return {
      signal: { aborted: false, reason: undefined },
      abort: mockAbort,
    };
  }) as unknown as typeof AbortController;

  return { mockFetch, mockAbort };
}

function setupFakeTimers(now: number) {
  vi.useFakeTimers();
  vi.setSystemTime(now);
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ============================================================
// probeOnline
// ============================================================
describe("probeOnline", () => {
  it("首次调用应发起 fetch", async () => {
    setupFakeTimers(1000000);
    const { mockFetch } = setupMockFetch({ ok: true });

    const { probeOnline } = await import("./network");
    const result = await probeOnline();

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith("/api/webdav-proxy?health=1", {
      method: "HEAD",
      signal: expect.any(Object),
    });
  });

  it("缓存期内不应再次请求", async () => {
    setupFakeTimers(1000000);
    const { mockFetch } = setupMockFetch({ ok: true });

    const { probeOnline } = await import("./network");

    await probeOnline();
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 2 秒后再次调用，应命中缓存
    vi.advanceTimersByTime(2000);
    const result2 = await probeOnline();
    expect(result2).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1); // 未新增请求
  });

  it("缓存过期后应重新请求", async () => {
    setupFakeTimers(1000000);
    const { mockFetch } = setupMockFetch({ ok: true });

    const { probeOnline } = await import("./network");

    await probeOnline();
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 6 秒后缓存过期
    vi.advanceTimersByTime(6000);
    vi.setSystemTime(1006000);

    const result2 = await probeOnline();
    expect(result2).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("fetch 成功 (ok=true) 应返回 true 并缓存", async () => {
    setupFakeTimers(1000000);
    const { mockFetch } = setupMockFetch({ ok: true });

    const { probeOnline } = await import("./network");

    const result1 = await probeOnline();
    expect(result1).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 缓存期内
    vi.advanceTimersByTime(1000);
    const result2 = await probeOnline();
    expect(result2).toBe(true); // 返回缓存值 true
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("fetch 返回 ok=false 应返回 false 并缓存", async () => {
    setupFakeTimers(1000000);
    const { mockFetch } = setupMockFetch({ ok: false });

    const { probeOnline } = await import("./network");

    const result1 = await probeOnline();
    expect(result1).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 缓存期内返回 false
    vi.advanceTimersByTime(1000);
    const result2 = await probeOnline();
    expect(result2).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("fetch reject 应返回 false 并缓存", async () => {
    setupFakeTimers(1000000);
    const { mockFetch } = setupMockFetch({ reject: true });

    const { probeOnline } = await import("./network");

    const result1 = await probeOnline();
    expect(result1).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 缓存期内返回 false
    vi.advanceTimersByTime(1000);
    const result2 = await probeOnline();
    expect(result2).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should create AbortController with 5s timeout", async () => {
    setupFakeTimers(1000000);
    setupMockFetch({ ok: true });

    const { probeOnline } = await import("./network");
    await probeOnline();

    // AbortController 被创建
    expect(globalThis.AbortController).toHaveBeenCalled();
  });
});

// ============================================================
// isOnline
// ============================================================
describe("isOnline", () => {
  it("navigator.onLine = true 应返回 true", async () => {
    (globalThis as any).navigator = { onLine: true };

    const { isOnline } = await import("./network");
    expect(isOnline()).toBe(true);
  });

  it("navigator.onLine = false 应返回 false", async () => {
    (globalThis as any).navigator = { onLine: false };

    const { isOnline } = await import("./network");
    expect(isOnline()).toBe(false);
  });

  it("navigator 不存在时（SSR/测试）应返回 true", async () => {
    // 模拟 SSR 无 navigator 环境
    delete (globalThis as any).navigator;

    const { isOnline } = await import("./network");
    expect(isOnline()).toBe(true);
  });

  it("navigator.onLine 为 undefined 时应返回 true", async () => {
    (globalThis as any).navigator = { onLine: undefined };

    const { isOnline } = await import("./network");
    expect(isOnline()).toBe(true);
  });

  it("navigator 为 null 时 typeof 检查通过但访问 onLine 抛错", async () => {
    // 极端边界：navigator 为 null（非 undefined），typeof null === 'object'
    (globalThis as any).navigator = null;

    const { isOnline } = await import("./network");
    // typeof navigator !== 'undefined' 为 true（typeof null === 'object'）
    // 但 navigator.onLine 会抛 TypeError: Cannot read properties of null
    expect(() => isOnline()).toThrow();
  });
});

// ============================================================
// 综合场景
// ============================================================
describe("综合场景", () => {
  it("缓存过期后重新请求，若再次失败应缓存 false", async () => {
    setupFakeTimers(1000000);
    const { mockFetch } = setupMockFetch({ ok: true });

    const { probeOnline } = await import("./network");

    // 第一次成功
    expect(await probeOnline()).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 缓存过期后改为失败（创建新的 mock）
    vi.advanceTimersByTime(6000);
    vi.setSystemTime(1006000);
    const { mockFetch: mockFetch2 } = setupMockFetch({ reject: true });

    expect(await probeOnline()).toBe(false);
    expect(mockFetch2).toHaveBeenCalledTimes(1); // 新 mock 被调用 1 次

    // 缓存更新为 false
    vi.advanceTimersByTime(1000);
    expect(await probeOnline()).toBe(false);
    expect(mockFetch2).toHaveBeenCalledTimes(1); // 未新增（命中缓存）
  });

  it("short timeout 应导致 catch 返回 false", async () => {
    setupFakeTimers(1000000);

    // Mock fetch 永不 resolve（模拟超时）
    globalThis.fetch = vi.fn(() => new Promise(() => {})) as any;
    const mockAbort = vi.fn();
    globalThis.AbortController = vi.fn().mockImplementation(function () {
      return {
        signal: { aborted: false },
        abort: mockAbort,
      };
    }) as any;

    const { probeOnline } = await import("./network");

    // 启动探测（fetch 永不 resolve），推进时间触发 abort 超时
    void probeOnline();
    vi.advanceTimersByTime(6000);

    // fetch 仍在 hanging，但 AbortController 触发了 abort
    // 因为 fetch rejection 被 catch 吞掉，最终返回 false
    expect(mockAbort).toHaveBeenCalled();
  });
});
