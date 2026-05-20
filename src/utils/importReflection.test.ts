/**
 * importReflection 测试
 * 覆盖：JSON 单条/批量导入 / Markdown YAML frontmatter / 格式检测 / 错误处理
 */

import { describe, it, expect } from "vitest";
import { parseImportFile } from "./importReflection";

// ============================================================
// JSON 导入
// ============================================================
describe("parseImportFile — JSON", () => {
  const singleJson = JSON.stringify({
    version: "pomodorox-reflection-1.0",
    reflection: {
      date: "2026-05-20",
      content: "很棒的一天！",
      mood: "great",
      tags: ["高效"],
      relatedTaskIds: ["task-1"],
    },
  });

  const batchJson = JSON.stringify({
    version: "pomodorox-reflection-1.0",
    reflections: [
      {
        date: "2026-05-20",
        content: "第一天",
        mood: "good",
        tags: ["学习"],
        relatedTaskIds: [],
      },
      {
        date: "2026-05-19",
        content: "第二天",
        mood: "normal",
        tags: [],
        relatedTaskIds: [],
      },
    ],
  });

  it("应该通过文件名识别并解析 JSON 单条", () => {
    const result = parseImportFile(singleJson, "reflection.json");
    expect(result.format).toBe("json");
    expect(result.items).toHaveLength(1);
    expect(result.items[0].date).toBe("2026-05-20");
    expect(result.items[0].content).toBe("很棒的一天！");
    expect(result.items[0].mood).toBe("great");
    expect(result.items[0].tags).toEqual(["高效"]);
    expect(result.items[0].relatedTaskIds).toEqual(["task-1"]);
  });

  it("应该通过文件名识别并解析 JSON 批量", () => {
    const result = parseImportFile(batchJson, "reflections.json");
    expect(result.format).toBe("json");
    expect(result.items).toHaveLength(2);
    expect(result.items[0].date).toBe("2026-05-20");
    expect(result.items[1].date).toBe("2026-05-19");
  });

  it("应该通过内容自动识别 JSON（以 { 开头）", () => {
    const result = parseImportFile(singleJson, "data.txt");
    expect(result.format).toBe("json");
    expect(result.items).toHaveLength(1);
  });

  it("morning mood 在 JSON 中不被忽略，但 validateMood 会兜底", () => {
    const invalidMoodJson = JSON.stringify({
      version: "pomodorox-reflection-1.0",
      reflection: {
        date: "2026-05-20",
        content: "测试",
        mood: "happy",
        tags: [],
        relatedTaskIds: [],
      },
    });
    const result = parseImportFile(invalidMoodJson, "test.json");
    // mood 无效时会降级为 "normal"
    expect(result.items[0].mood).toBe("normal");
  });

  it("缺少 date 的 reflection 应被过滤", () => {
    const noDateJson = JSON.stringify({
      version: "pomodorox-reflection-1.0",
      reflections: [
        { content: "无日期", mood: "normal", tags: [], relatedTaskIds: [] },
        {
          date: "2026-05-20",
          content: "有日期",
          mood: "good",
          tags: [],
          relatedTaskIds: [],
        },
      ],
    });
    const result = parseImportFile(noDateJson, "data.json");
    // 第一条无日期被过滤，只保留第二条
    expect(result.items).toHaveLength(1);
    expect(result.items[0].content).toBe("有日期");
  });

  it("无效 JSON 应抛出解析错误", () => {
    expect(() => parseImportFile("{invalid json", "test.json")).toThrow(
      "JSON 解析失败"
    );
  });

  it("JSON 中没有有效数据应抛出错误", () => {
    const emptyJson = JSON.stringify({ version: "test" });
    expect(() => parseImportFile(emptyJson, "test.json")).toThrow(
      "JSON 中未找到有效的反思数据"
    );
  });

  it("reflections 数组为空应抛出错误", () => {
    const emptyArr = JSON.stringify({
      version: "pomodorox-reflection-1.0",
      reflections: [],
    });
    expect(() => parseImportFile(emptyArr, "test.json")).toThrow(
      "JSON 中未找到有效的反思数据"
    );
  });
});

// ============================================================
// Markdown 导入
// ============================================================
describe("parseImportFile — Markdown", () => {
  const validMd = [
    "---",
    "date: 2026-05-20",
    "mood: great",
    "tags:",
    "  - 高效",
    "  - 编码",
    "---",
    "",
    "今天完成了 6 个番茄钟，效率很高！",
    "",
    "## 总结",
    "一切顺利。",
  ].join("\n");

  const minimalMd = [
    "---",
    "date: 2026-05-19",
    "mood: normal",
    "---",
    "",
    "内容",
  ].join("\n");

  it("应该通过文件名识别并解析 Markdown", () => {
    const result = parseImportFile(validMd, "reflection.md");
    expect(result.format).toBe("markdown");
    expect(result.items).toHaveLength(1);
    expect(result.items[0].date).toBe("2026-05-20");
    expect(result.items[0].mood).toBe("great");
    expect(result.items[0].tags).toEqual(["高效", "编码"]);
    expect(result.items[0].content).toContain("今天完成了 6 个番茄钟");
  });

  it("应该通过 .markdown 扩展名识别", () => {
    const result = parseImportFile(minimalMd, "reflection.markdown");
    expect(result.format).toBe("markdown");
    expect(result.items[0].date).toBe("2026-05-19");
  });

  it("应该通过内容自动识别 Markdown（以 --- 开头）", () => {
    const result = parseImportFile(validMd, "data.txt");
    expect(result.format).toBe("markdown");
  });

  it("Markdown 缺少 date 应抛出错误", () => {
    const noDateMd = ["---", "mood: good", "---", "", "内容"].join("\n");
    expect(() => parseImportFile(noDateMd, "test.md")).toThrow(
      "Markdown frontmatter 缺少 date 字段"
    );
  });

  it("Markdown 缺少 frontmatter 应抛出错误", () => {
    expect(() => parseImportFile("没有 frontmatter 的内容", "test.md")).toThrow(
      "Markdown 文件缺少 YAML frontmatter"
    );
  });

  it("frontmatter 格式不完整应抛出错误", () => {
    const badFm = "---\ndate: 2026-05-20\n"; // 只有开头没有结尾
    expect(() => parseImportFile(badFm, "test.md")).toThrow(
      "无法解析 Markdown 的 frontmatter"
    );
  });

  it("invalid mood 应降级为 normal", () => {
    const badMoodMd = [
      "---",
      "date: 2026-05-20",
      "mood: angry",
      "---",
      "",
      "内容",
    ].join("\n");
    const result = parseImportFile(badMoodMd, "test.md");
    expect(result.items[0].mood).toBe("normal");
  });

  it("YAML 注释行应被忽略", () => {
    const commentMd = [
      "---",
      "# 这是一个注释",
      "date: 2026-05-20",
      "mood: good",
      "---",
      "",
      "正文",
    ].join("\n");
    const result = parseImportFile(commentMd, "test.md");
    expect(result.items[0].date).toBe("2026-05-20");
    expect(result.items[0].mood).toBe("good");
  });

  it("tags 列表中空行应被忽略", () => {
    const tagMd = [
      "---",
      "date: 2026-05-20",
      "mood: normal",
      "tags:",
      "  - 标签1",
      "",
      "  - 标签2",
      "---",
      "",
      "内容",
    ].join("\n");
    const result = parseImportFile(tagMd, "test.md");
    expect(result.items[0].tags).toEqual(["标签1", "标签2"]);
  });
});

// ============================================================
// 文件格式推断
// ============================================================
describe("parseImportFile — 格式推断", () => {
  it("无法识别的格式应抛出错误", () => {
    expect(() =>
      parseImportFile("This is just plain text", "notes.txt")
    ).toThrow("无法识别的文件格式");
  });

  it("JSON 内容优先于文件名推断（以 { 开头）", () => {
    const jsonContent = JSON.stringify({
      version: "pomodorox-reflection-1.0",
      reflection: {
        date: "2026-05-20",
        content: "测试",
        mood: "good",
        tags: [],
        relatedTaskIds: [],
      },
    });
    const result = parseImportFile(jsonContent, "wrong-ext.xyz");
    expect(result.format).toBe("json");
    expect(result.items).toHaveLength(1);
  });

  it("Markdown 内容优先于文件名推断（以 --- 开头）", () => {
    const mdContent = [
      "---",
      "date: 2026-05-20",
      "mood: good",
      "---",
      "",
      "正文",
    ].join("\n");
    const result = parseImportFile(mdContent, "wrong-ext.xyz");
    expect(result.format).toBe("markdown");
    expect(result.items).toHaveLength(1);
  });
});

// ============================================================
// Roundtrip 测试
// ============================================================
describe("导出 → 导入 Roundtrip", () => {
  it("Markdown roundtrip 应保留核心数据", () => {
    // 这需要实际导出，这里只验证导入能正确处理典型的导出格式
    const exportedMd = [
      "---",
      "date: 2026-05-20",
      "mood: great",
      "mood_label: 很棒",
      "mood_emoji: 😄",
      "tags:",
      "  - 高效",
      "  - 编码",
      "---",
      "",
      "今天完成了 6 个番茄钟，效率很高！",
      "",
    ].join("\n");

    const result = parseImportFile(exportedMd, "reflection.md");
    expect(result.items[0].date).toBe("2026-05-20");
    expect(result.items[0].mood).toBe("great");
    expect(result.items[0].tags).toEqual(["高效", "编码"]);
    expect(result.items[0].content).toContain("今天完成了 6 个番茄钟");
  });

  it("JSON roundtrip 应保留核心数据", () => {
    const exportedJson = JSON.stringify({
      version: "pomodorox-reflection-1.0",
      exportedAt: "2026-05-20T10:00:00.000Z",
      reflection: {
        date: "2026-05-20",
        mood: "great",
        tags: ["高效", "编码"],
        relatedTaskIds: ["task-1", "task-2"],
        content: "今天完成了 6 个番茄钟，效率很高！",
      },
    });

    const result = parseImportFile(exportedJson, "reflection.json");
    expect(result.items[0].date).toBe("2026-05-20");
    expect(result.items[0].mood).toBe("great");
    expect(result.items[0].tags).toEqual(["高效", "编码"]);
    expect(result.items[0].relatedTaskIds).toEqual(["task-1", "task-2"]);
    expect(result.items[0].content).toBe("今天完成了 6 个番茄钟，效率很高！");
  });
});

// ============================================================
// 边界条件
// ============================================================
describe("边界条件", () => {
  it("空 tags/relatedTaskIds 应被正确解析", () => {
    const json = JSON.stringify({
      version: "pomodorox-reflection-1.0",
      reflection: {
        date: "2026-05-20",
        content: "无标签",
        mood: "normal",
        tags: null,
        relatedTaskIds: null,
      },
    });
    const result = parseImportFile(json, "test.json");
    expect(result.items[0].tags).toEqual([]);
    expect(result.items[0].relatedTaskIds).toEqual([]);
  });

  it("极长内容应能正常处理", () => {
    const longContent = "A".repeat(10000);
    const json = JSON.stringify({
      version: "pomodorox-reflection-1.0",
      reflection: {
        date: "2026-05-20",
        content: longContent,
        mood: "normal",
        tags: [],
        relatedTaskIds: [],
      },
    });
    const result = parseImportFile(json, "test.json");
    expect(result.items[0].content).toBe(longContent);
  });

  it("多段落 Markdown 正文应保留换行", () => {
    const multiParaMd = [
      "---",
      "date: 2026-05-20",
      "mood: good",
      "---",
      "",
      "第一段。",
      "",
      "第二段。",
      "",
      "第三段。",
    ].join("\n");

    const result = parseImportFile(multiParaMd, "test.md");
    expect(result.items[0].content).toContain("第一段。");
    expect(result.items[0].content).toContain("第二段。");
    expect(result.items[0].content).toContain("第三段。");
  });
});
