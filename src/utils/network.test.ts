// ============================================================
// network.ts 回归测试
// ============================================================

import { describe, it, expect } from "vitest";
import { isOnline } from "./network";

describe("isOnline", () => {
  it("navigator.onLine === true 时返回 true", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { onLine: true },
      writable: true,
      configurable: true,
    });
    expect(isOnline()).toBe(true);
  });

  it("navigator.onLine === false 时返回 false", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { onLine: false },
      writable: true,
      configurable: true,
    });
    expect(isOnline()).toBe(false);
  });

  it("SSR/测试环境无 navigator 时返回 true（避免阻断）", () => {
    // @ts-expect-error 删除 navigator 模拟 SSR
    delete (globalThis as typeof globalThis & { navigator?: unknown })
      .navigator;
    expect(isOnline()).toBe(true);
  });

  it("navigator 存在但无 onLine 属性时返回 true", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {},
      writable: true,
      configurable: true,
    });
    expect(isOnline()).toBe(true);
  });
});
