/**
 * 反思导入工具函数
 * 支持 Markdown (含 YAML frontmatter) 和 JSON 格式
 */

export interface ImportReflection {
  date: string
  content: string
  mood: 'great' | 'good' | 'normal' | 'bad' | 'terrible'
  tags: string[]
  relatedTaskIds: string[]
}

export interface ImportResult {
  items: ImportReflection[]
  format: 'json' | 'markdown'
}

/**
 * 解析导入文件
 * @param content 文件内容
 * @param filename 文件名（用于推断格式）
 */
export function parseImportFile(content: string, filename: string): ImportResult {
  const ext = filename.split('.').pop()?.toLowerCase()

  if (ext === 'json') {
    return parseJsonImport(content)
  }

  if (ext === 'md' || ext === 'markdown') {
    return parseMarkdownImport(content)
  }

  // 按内容推断
  if (content.trim().startsWith('{')) {
    return parseJsonImport(content)
  }
  if (content.trim().startsWith('---')) {
    return parseMarkdownImport(content)
  }

  throw new Error('无法识别的文件格式，请使用 .json 或 .md 文件')
}

/**
 * 解析 JSON 格式
 * 支持：
 * - 单条导出: { version, reflection: {...} }
 * - 批量备份: { version, reflections: [...] }
 */
function parseJsonImport(content: string): ImportResult {
  let data: any
  try {
    data = JSON.parse(content)
  } catch {
    throw new Error('JSON 解析失败')
  }

  const items: ImportReflection[] = []

  // 单条格式
  if (data.reflection && typeof data.reflection === 'object') {
    const r = normalizeReflection(data.reflection)
    if (r) items.push(r)
  }

  // 批量格式
  if (Array.isArray(data.reflections)) {
    data.reflections.forEach((r: any) => {
      const normalized = normalizeReflection(r)
      if (normalized) items.push(normalized)
    })
  }

  if (items.length === 0) {
    throw new Error('JSON 中未找到有效的反思数据')
  }

  return { items, format: 'json' }
}

/**
 * 解析 Markdown 格式（YAML frontmatter + 正文）
 */
function parseMarkdownImport(content: string): ImportResult {
  const trimmed = content.trim()

  // 必须有 frontmatter
  if (!trimmed.startsWith('---')) {
    throw new Error('Markdown 文件缺少 YAML frontmatter')
  }

  const parts = trimmed.split(/^---\s*$/m)
  if (parts.length < 3) {
    throw new Error('无法解析 Markdown 的 frontmatter')
  }

  const frontmatter = parts[1].trim()
  const body = parts.slice(2).join('---').trim()

  const meta = parseYamlFrontmatter(frontmatter)

  const item: ImportReflection = {
    date: meta.date || '',
    mood: validateMood(meta.mood),
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    relatedTaskIds: [],
    content: body,
  }

  if (!item.date) {
    throw new Error('Markdown frontmatter 缺少 date 字段')
  }

  return { items: [item], format: 'markdown' }
}

/**
 * 简单 YAML frontmatter 解析（只支持扁平 key: value 和简单 list）
 */
function parseYamlFrontmatter(text: string): Record<string, any> {
  const result: Record<string, any> = {}
  const lines = text.split('\n')
  let currentKey: string | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    // list item: "  - value"
    const listMatch = trimmed.match(/^-\s*(.+)$/)
    if (listMatch && currentKey) {
      if (!Array.isArray(result[currentKey])) {
        result[currentKey] = []
      }
      result[currentKey].push(listMatch[1].trim())
      continue
    }

    // key: value
    const kvMatch = trimmed.match(/^([\w_]+):\s*(.*)$/)
    if (kvMatch) {
      currentKey = kvMatch[1]
      const value = kvMatch[2].trim()
      result[currentKey] = value === '' ? '' : value
    }
  }

  return result
}

/**
 * 标准化单个反思对象
 */
function normalizeReflection(raw: any): ImportReflection | null {
  if (!raw || typeof raw !== 'object') return null

  const date = raw.date || ''
  if (!date) return null

  return {
    date,
    content: raw.content || '',
    mood: validateMood(raw.mood),
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    relatedTaskIds: Array.isArray(raw.relatedTaskIds) ? raw.relatedTaskIds : [],
  }
}

/**
 * 验证并标准化 mood 值
 */
function validateMood(value: any): 'great' | 'good' | 'normal' | 'bad' | 'terrible' {
  const valid = ['great', 'good', 'normal', 'bad', 'terrible'] as const
  if (typeof value === 'string' && valid.includes(value as any)) {
    return value as any
  }
  return 'normal'
}
