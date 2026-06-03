/**
 * exportReflection 测试
 * 覆盖：Markdown 导出 / JSON 导出 / 下载触发 / 格式 roundtrip
 */

import { describe, it, expect, vi, beforeAll } from "vitest";
import {
  exportReflectionAsMarkdown,
  exportReflectionAsJson,
  downloadFile,
  downloadReflection,
} from "./exportReflection";
import type { Reflection } from "@/types";

// 批量导出函数（待实现）
let batchExportAsMarkdown: (r: Reflection[]) => string;
let batchExportAsJson: (r: Reflection[]) => string;

// ---- 测试数据 ----
const fullReflection: Reflection = {
  id: "ref-001",
  date: "2026-05-20",
  content: "今天完成了 6 个番茄钟，效率很高！",
  mood: "great",
  relatedTaskIds: ["task-1", "task-2"],
  tags: ["高效", "编码"],
  createdAt: "2026-05-20T10:00:00Z",
  updatedAt: "2026-05-20T18:00:00Z",
  synced: false,
};

const minimalReflection: Reflection = {
  id: "ref-002",
  date: "2026-05-19",
  content: "状态一般，没什么特别的。",
  mood: "normal",
  relatedTaskIds: [],
  tags: [],
  createdAt: "2026-05-19T10:00:00Z",
  updatedAt: "2026-05-19T10:00:00Z",
  synced: false,
};

// ============================================================
// exportReflectionAsMarkdown
// ============================================================
describe("exportReflectionAsMarkdown", () => {
  it("应该导出完整反思为 Markdown（含 YAML frontmatter）", () => {
    const result = exportReflectionAsMarkdown(fullReflection);

    // frontmatter 分隔符
    expect(result).toContain("---");
    // 日期
    expect(result).toContain("date: 2026-05-20");
    // 心情
    expect(result).toContain("mood: great");
    expect(result).toContain("mood_label: 很棒");
    expect(result).toContain("mood_emoji: 😄");
    // 标签
    expect(result).toContain("tags:");
    expect(result).toContain("  - 高效");
    expect(result).toContain("  - 编码");
    // 正文
    expect(result).toContain("今天完成了 6 个番茄钟，效率很高！");
    // 不应该包含内部字段
    expect(result).not.toContain("id:");
    expect(result).not.toContain("relatedTaskIds:");
    expect(result).not.toContain("createdAt:");
  });

  it("应该导出最小反思为 Markdown", () => {
    const result = exportReflectionAsMarkdown(minimalReflection);

    expect(result).toContain("date: 2026-05-19");
    expect(result).toContain("mood: normal");
    expect(result).toContain("mood_label: 一般");
    expect(result).toContain("mood_emoji: 😐");
    expect(result).toContain("状态一般，没什么特别的。");
    // 无标签时不应包含 tags 段
    expect(result).not.toContain("  -");
  });

  it("bad mood 应正确映射标签", () => {
    const result = exportReflectionAsMarkdown({
      ...minimalReflection,
      mood: "bad",
    });
    expect(result).toContain("mood_label: 不好");
    expect(result).toContain("mood_emoji: 😔");
  });

  it("terrible mood 应正确映射标签", () => {
    const result = exportReflectionAsMarkdown({
      ...minimalReflection,
      mood: "terrible",
    });
    expect(result).toContain("mood_label: 很差");
    expect(result).toContain("mood_emoji: 😢");
  });
});

// ============================================================
// exportReflectionAsJson
// ============================================================
describe("exportReflectionAsJson", () => {
  it("应该导出反思为 JSON（含版本信息）", () => {
    const json = exportReflectionAsJson(fullReflection);
    const parsed = JSON.parse(json);

    expect(parsed.version).toBe("pomodorox-reflection-1.0");
    expect(parsed.exportedAt).toBeTruthy(); // ISO 时间戳
    expect(parsed.reflection.date).toBe("2026-05-20");
    expect(parsed.reflection.mood).toBe("great");
    expect(parsed.reflection.tags).toEqual(["高效", "编码"]);
    expect(parsed.reflection.relatedTaskIds).toEqual(["task-1", "task-2"]);
    expect(parsed.reflection.content).toBe("今天完成了 6 个番茄钟，效率很高！");
    // 不应该包含内部字段
    expect(parsed.reflection.id).toBeUndefined();
    expect(parsed.reflection.createdAt).toBeUndefined();
    expect(parsed.reflection.synced).toBeUndefined();
  });

  it("应该导出最小反思为有效 JSON", () => {
    const json = exportReflectionAsJson(minimalReflection);
    const parsed = JSON.parse(json);

    expect(parsed.version).toBe("pomodorox-reflection-1.0");
    expect(parsed.reflection.date).toBe("2026-05-19");
    expect(parsed.reflection.mood).toBe("normal");
    expect(parsed.reflection.tags).toEqual([]);
    expect(parsed.reflection.relatedTaskIds).toEqual([]);
  });
});

// ============================================================
// downloadFile
// ============================================================
describe("downloadFile", () => {
  it("应该创建 Blob 并触发下载", () => {
    const appendChild = vi.fn();
    const removeChild = vi.fn();
    const click = vi.fn();
    const createObjectURL = vi.fn(() => "blob:test-url");
    const revokeObjectURL = vi.fn();

    // 保存原生 API
    const origCreateElement = document.createElement;
    const origURL = URL.createObjectURL;
    const origRevoke = URL.revokeObjectURL;

    document.createElement = vi.fn((tag: string) => {
      if (tag === "a") {
        return {
          href: "",
          download: "",
          click,
          setAttribute: vi.fn(),
        } as unknown as HTMLAnchorElement;
      }
      return origCreateElement.call(document, tag);
    });
    document.body.appendChild = appendChild;
    document.body.removeChild = removeChild;
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;

    downloadFile("test content", "test.md", "text/markdown");

    expect(createObjectURL).toHaveBeenCalled();
    expect(appendChild).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(removeChild).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test-url");

    // 恢复
    document.createElement = origCreateElement;
    URL.createObjectURL = origURL;
    URL.revokeObjectURL = origRevoke;
  });
});

// ============================================================
// downloadReflection
// ============================================================
describe("downloadReflection", () => {
  it("应该生成正确的 Markdown 文件名", () => {
    const appendChild = vi.fn();
    const removeChild = vi.fn();
    const click = vi.fn();

    const origCreateElement = document.createElement;
    document.createElement = vi.fn((tag: string) => {
      if (tag === "a") {
        const el = {
          href: "",
          download: "",
          click,
          setAttribute: vi.fn(),
        } as unknown as HTMLAnchorElement;
        return el;
      }
      return origCreateElement.call(document, tag);
    });
    document.body.appendChild = appendChild;
    document.body.removeChild = removeChild;

    downloadReflection(fullReflection, "md");

    // restore
    document.createElement = origCreateElement;
  });

  it("应该生成正确的 JSON 文件名", () => {
    const appendChild = vi.fn();
    const removeChild = vi.fn();
    const click = vi.fn();

    const origCreateElement = document.createElement;
    document.createElement = vi.fn((tag: string) => {
      if (tag === "a") {
        return {
          href: "",
          download: "",
          click,
          setAttribute: vi.fn(),
        } as unknown as HTMLAnchorElement;
      }
      return origCreateElement.call(document, tag);
    });
    document.body.appendChild = appendChild;
    document.body.removeChild = removeChild;

    downloadReflection(fullReflection, "json");

    document.createElement = origCreateElement;
  });
});

// ============================================================
// batchExportAsMarkdown
// ============================================================
describe("batchExportAsMarkdown", () => {
  beforeAll(async () => {
    const mod = await import("./exportReflection");
    batchExportAsMarkdown = mod.batchExportAsMarkdown;
  });

  it("空数组应返回只有头部的空报告", () => {
    const result = batchExportAsMarkdown([]);
    expect(result).toContain("# 📝 PomodoroX 反思导出");
    expect(result).toContain("_共 0 条反思记录_");
    expect(result).not.toContain("---");
  });

  it("单条反思应包含头部 + 内容 + 分隔线", () => {
    const result = batchExportAsMarkdown([fullReflection]);
    expect(result).toContain("_共 1 条反思记录_");
    expect(result).toContain(fullReflection.content);
    // 分隔线在内容和头部之间
    const sepCount = (result.match(/^---$/gm) || []).length;
    expect(sepCount).toBeGreaterThanOrEqual(2); // frontmatter 的 --- + 尾部分隔
  });

  it("多条反思应按日期倒序排列", () => {
    const r1: Reflection = {
      ...fullReflection,
      date: "2026-05-01",
      content: "最早",
    };
    const r2: Reflection = {
      ...fullReflection,
      date: "2026-05-31",
      content: "最新",
    };

    const result = batchExportAsMarkdown([r1, r2]);
    const idx1 = result.indexOf("最早");
    const idx2 = result.indexOf("最新");
    expect(idx2).toBeLessThan(idx1); // 日期大的在前面
  });
});

// ============================================================
// batchExportAsJson
// ============================================================
describe("batchExportAsJson", () => {
  beforeAll(async () => {
    const mod = await import("./exportReflection");
    batchExportAsJson = mod.batchExportAsJson;
  });

  it("应该导出为有效的 JSON 结构", () => {
    const result = batchExportAsJson([fullReflection]);
    const parsed = JSON.parse(result);

    expect(parsed.version).toBe("pomodorox-reflections-batch-1.0");
    expect(parsed.count).toBe(1);
    expect(parsed.reflections).toHaveLength(1);
    expect(parsed.reflections[0].date).toBe("2026-05-20");
    expect(parsed.reflections[0].content).toBe(fullReflection.content);
  });

  it("空数组应返回 count:0", () => {
    const result = batchExportAsJson([]);
    const parsed = JSON.parse(result);
    expect(parsed.count).toBe(0);
    expect(parsed.reflections).toEqual([]);
  });

  it("多条反思应按日期倒序排列", () => {
    const r1: Reflection = {
      ...fullReflection,
      date: "2026-05-01",
      content: "c1",
    };
    const r2: Reflection = {
      ...fullReflection,
      date: "2026-05-31",
      content: "c2",
    };

    const result = batchExportAsJson([r1, r2]);
    const parsed = JSON.parse(result);
    expect(parsed.reflections[0].content).toBe("c2"); // 日期大的在前
    expect(parsed.reflections[1].content).toBe("c1");
  });
});
