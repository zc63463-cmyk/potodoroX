// ============================================================
// PomodoroX - 数据库输入校验
// ============================================================

import type {
  CreateTaskInput,
  CreateReflectionInput,
  CreateSessionInput,
} from "@/types";

/** 安全解析 JSON，失败时返回默认值 */
export function safeJsonParse<T>(
  json: string | null | undefined,
  fallback: T
): T {
  if (!json || json === "null") return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    console.warn("[DB] JSON 解析失败，使用默认值:", json?.slice(0, 100));
    return fallback;
  }
}

// ============================================================
// 运行时输入校验
// ============================================================

export function assertNonEmptyString(
  value: unknown,
  name: string,
  maxLen = 5000
): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${name} 不能为空`);
  }
  if (value.length > maxLen) {
    throw new Error(`${name} 不能超过 ${maxLen} 字符`);
  }
}

export function assertOptionalString(
  value: unknown,
  name: string,
  maxLen = 5000
): void {
  if (value === undefined || value === null) return;
  if (typeof value !== "string" || value.length > maxLen) {
    throw new Error(`${name} 必须是字符串且不能超过 ${maxLen} 字符`);
  }
}

export function assertNonNegativeFinite(
  value: unknown,
  name: string
): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${name} 必须是非负有限数`);
  }
}

export function assertTags(tags: unknown): void {
  if (!Array.isArray(tags)) return;
  if (tags.length > 50) throw new Error("标签不能超过 50 个");
  for (const t of tags) {
    if (typeof t !== "string" || t.length > 50) {
      throw new Error("单个标签不能超过 50 字符");
    }
  }
}

export function validateCreateTaskInput(input: CreateTaskInput): void {
  assertNonEmptyString(input.title, "任务标题", 200);
  assertOptionalString(input.description, "任务描述");
  assertOptionalString(input.plan, "任务规划");
  assertOptionalString(input.completion, "任务总结");
  assertTags(input.tags);
  if (input.estimatedPomodoros !== undefined) {
    assertNonNegativeFinite(input.estimatedPomodoros, "预估番茄数");
  }
}

export function validateCreateReflectionInput(
  input: CreateReflectionInput
): void {
  assertNonEmptyString(input.date, "反思日期", 50);
  assertNonEmptyString(input.content, "反思内容");
  assertTags(input.tags);
}

export function validateCreateSessionInput(input: CreateSessionInput): void {
  assertNonNegativeFinite(input.duration, "时长");
  assertOptionalString(input.plan, "规划");
  assertOptionalString(input.completion, "总结");
}
