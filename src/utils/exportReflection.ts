/**
 * 反思导出工具函数
 * 支持单条/批量导出，Markdown 和 JSON 格式
 */

import type { Reflection } from "@/types";
import { MOODS } from "@/utils/constants";
import { formatDateTime } from "@/utils/format";

/**
 * 导出单条反思为 Markdown（含 YAML frontmatter）
 */
export function exportReflectionAsMarkdown(reflection: Reflection): string {
  const moodInfo = MOODS.find((m) => m.value === reflection.mood);

  const lines: string[] = [];
  lines.push("---");
  lines.push(`date: ${reflection.date}`);
  lines.push(`mood: ${reflection.mood}`);
  if (moodInfo) {
    lines.push(`mood_label: ${moodInfo.label}`);
    lines.push(`mood_emoji: ${moodInfo.emoji}`);
  }
  if (reflection.tags.length > 0) {
    lines.push("tags:");
    reflection.tags.forEach((tag) => lines.push(`  - ${tag}`));
  }
  lines.push("---");
  lines.push("");
  lines.push(reflection.content);
  lines.push("");

  return lines.join("\n");
}

/**
 * 导出单条反思为 JSON
 */
export function exportReflectionAsJson(reflection: Reflection): string {
  const data = {
    version: "pomodorox-reflection-1.0",
    exportedAt: new Date().toISOString(),
    reflection: {
      date: reflection.date,
      mood: reflection.mood,
      tags: reflection.tags,
      relatedTaskIds: reflection.relatedTaskIds,
      content: reflection.content,
    },
  };
  return JSON.stringify(data, null, 2);
}

/**
 * 触发浏览器文件下载
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 导出单条反思并下载（便捷函数）
 * @param format 'md' | 'json'
 */
export function downloadReflection(
  reflection: Reflection,
  format: "md" | "json" = "md"
): void {
  const date = reflection.date;
  const filename = `pomodorox-reflection-${date}.${format}`;

  if (format === "md") {
    downloadFile(
      exportReflectionAsMarkdown(reflection),
      filename,
      "text/markdown;charset=utf-8"
    );
  } else {
    downloadFile(
      exportReflectionAsJson(reflection),
      filename,
      "application/json;charset=utf-8"
    );
  }
}

// ============================================================
// 批量导出
// ============================================================

/**
 * 将多条反思按日期倒序拼接为一个 Markdown 文件
 * 每条反思包含 YAML frontmatter + 正文，用 --- 分隔
 */
export function batchExportAsMarkdown(reflections: Reflection[]): string {
  const sorted = [...reflections].sort((a, b) => b.date.localeCompare(a.date));

  const lines: string[] = [];
  lines.push("# 📝 PomodoroX 反思导出");
  lines.push("");
  lines.push(`_导出时间：${formatDateTime(new Date())}_`);
  lines.push(`_共 ${sorted.length} 条反思记录_`);

  if (sorted.length === 0) {
    lines.push("");
    lines.push("_暂无反思记录_");
    return lines.join("\n");
  }

  lines.push("");
  lines.push("---");
  lines.push("");

  for (let i = 0; i < sorted.length; i++) {
    lines.push(exportReflectionAsMarkdown(sorted[i]));
    if (i < sorted.length - 1) {
      lines.push("");
      lines.push("---");
      lines.push("");
    }
  }

  return lines.join("\n");
}

/**
 * 将多条反思导出为 JSON（按日期倒序）
 */
export function batchExportAsJson(reflections: Reflection[]): string {
  const sorted = [...reflections].sort((a, b) => b.date.localeCompare(a.date));

  const data = {
    version: "pomodorox-reflections-batch-1.0",
    exportedAt: new Date().toISOString(),
    count: sorted.length,
    reflections: sorted.map((r) => ({
      date: r.date,
      mood: r.mood,
      tags: r.tags,
      relatedTaskIds: r.relatedTaskIds,
      content: r.content,
    })),
  };

  return JSON.stringify(data, null, 2);
}
