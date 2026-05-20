/**
 * id.ts 测试
 * 覆盖：crypto.randomUUID() 路径 / 回退方案 / UUID v4 格式 / 唯一性
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateId } from "./id";

// ============================================================
// crypto.randomUUID() 路径
// ============================================================
describe("generateId — crypto.randomUUID()", () => {
  it("应该返回 36 字符的 UUID 字符串", () => {
    const id = generateId();
    expect(id).toHaveLength(36);
  });

  it("应该符合 UUID v4 格式 (8-4-4-4-12)", () => {
    const id = generateId();
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    expect(id).toMatch(uuidRegex);
  });

  it("每次调用应生成不同的 ID", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it("ID 不应为空", () => {
    expect(generateId()).toBeTruthy();
  });
});

// ============================================================
// 回退方案（无 crypto.randomUUID）
// ============================================================
describe("generateId — 回退方案", () => {
  beforeEach(() => {
    // 移除 crypto.randomUUID 触发回退
    vi.stubGlobal("crypto", {
      getRandomValues: undefined,
      randomUUID: undefined,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("回退方案也应生成 36 字符 UUID", () => {
    const id = generateId();
    expect(id).toHaveLength(36);
  });

  it("回退 UUID 应包含 8-4-4-4-12 分隔符", () => {
    const id = generateId();
    const parts = id.split("-");
    expect(parts).toHaveLength(5);
    expect(parts[0]).toHaveLength(8);
    expect(parts[1]).toHaveLength(4);
    expect(parts[2]).toHaveLength(4);
    expect(parts[3]).toHaveLength(4);
    expect(parts[4]).toHaveLength(12);
  });

  it("回退 UUID 的第 3 段首位应为 '4'（版本号）", () => {
    const id = generateId();
    expect(id[14]).toBe("4");
  });

  it("回退 UUID 的第 4 段首位应为 8/9/a/b（变体）", () => {
    const id = generateId();
    expect(["8", "9", "a", "b"]).toContain(id[19]);
  });

  it("回退方案多次生成不重复", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it("crypto 完全不可用时不抛错", () => {
    vi.stubGlobal("crypto", undefined);
    expect(() => generateId()).not.toThrow();
    vi.unstubAllGlobals();
  });
});

// ============================================================
// 边界条件
// ============================================================
describe("边界条件", () => {
  it("1000 次生成应有完美的唯一性", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateId()));
    expect(ids.size).toBe(1000);
  });

  it("ID 只包含小写十六进制字符和连字符", () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f-]+$/);
  });
});
