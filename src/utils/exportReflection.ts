/**
 * 反思导出工具函数
 * 支持 Markdown 和 JSON 格式
 */

import type { Reflection } from '@/types'
import { MOODS } from '@/utils/constants'

/**
 * 导出单条反思为 Markdown（含 YAML frontmatter）
 */
export function exportReflectionAsMarkdown(reflection: Reflection): string {
  const moodInfo = MOODS.find((m) => m.value === reflection.mood)

  const lines: string[] = []
  lines.push('---')
  lines.push(`date: ${reflection.date}`)
  lines.push(`mood: ${reflection.mood}`)
  if (moodInfo) {
    lines.push(`mood_label: ${moodInfo.label}`)
    lines.push(`mood_emoji: ${moodInfo.emoji}`)
  }
  if (reflection.tags.length > 0) {
    lines.push('tags:')
    reflection.tags.forEach((tag) => lines.push(`  - ${tag}`))
  }
  lines.push('---')
  lines.push('')
  lines.push(reflection.content)
  lines.push('')

  return lines.join('\n')
}

/**
 * 导出单条反思为 JSON
 */
export function exportReflectionAsJson(reflection: Reflection): string {
  const data = {
    version: 'pomodorox-reflection-1.0',
    exportedAt: new Date().toISOString(),
    reflection: {
      date: reflection.date,
      mood: reflection.mood,
      tags: reflection.tags,
      relatedTaskIds: reflection.relatedTaskIds,
      content: reflection.content,
    },
  }
  return JSON.stringify(data, null, 2)
}

/**
 * 触发浏览器文件下载
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 导出单条反思并下载（便捷函数）
 * @param format 'md' | 'json'
 */
export function downloadReflection(reflection: Reflection, format: 'md' | 'json' = 'md'): void {
  const date = reflection.date
  const filename = `pomodorox-reflection-${date}.${format}`

  if (format === 'md') {
    downloadFile(exportReflectionAsMarkdown(reflection), filename, 'text/markdown;charset=utf-8')
  } else {
    downloadFile(exportReflectionAsJson(reflection), filename, 'application/json;charset=utf-8')
  }
}
