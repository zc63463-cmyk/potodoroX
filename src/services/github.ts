// ============================================================
// PomodoroX - GitHub 同步服务
// 使用 Octokit 进行 GitHub API 交互
// ============================================================

import { Octokit } from 'octokit'
import type { Task, Reflection, Session } from '@/types'
import type { OutboxEvent } from '@/services/outbox'
import { GITHUB_SYNC_DIR } from '@/utils/constants'

/** GitHub 服务配置 */
interface GitHubConfig {
  token: string
  owner: string
  repo: string
}

/** 同步结果 */
interface SyncResult {
  success: boolean
  message: string
  details?: string
}

let octokit: Octokit | null = null
let config: GitHubConfig = { token: '', owner: '', repo: '' }

/**
 * 将 UTF-8 字符串安全编码为 Base64
 * 替代已废弃的 btoa(unescape(encodeURIComponent(...))) 方案
 */
function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * 从 Base64 解码为 UTF-8 字符串
 * 替代已废弃的 decodeURIComponent(escape(atob(...))) 方案
 */
function base64ToUtf8(base64: string): string {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

/**
 * 检测是否在线
 */
function isOnline(): boolean {
  return navigator.onLine
}

/**
 * 认证 GitHub
 * @param token GitHub Personal Access Token
 */
export function authenticate(token: string): void {
  if (!token) {
    octokit = null
    return
  }
  octokit = new Octokit({
    auth: token,
  })
  config.token = token
}

/**
 * 设置 GitHub 仓库信息
 */
export function setRepo(owner: string, repo: string): void {
  config.owner = owner
  config.repo = repo
}

/**
 * 检查 GitHub 服务是否已配置
 */
export function isConfigured(): boolean {
  return !!(octokit && config.owner && config.repo)
}

/**
 * 确保 Octokit 实例可用
 */
function ensureOctokit(): Octokit {
  if (!octokit) {
    throw new Error('GitHub 未认证，请先配置 Token')
  }
  if (!config.owner || !config.repo) {
    throw new Error('GitHub 仓库未配置')
  }
  return octokit
}

/**
 * 推送任务数据到 GitHub
 * @param tasks 任务列表
 * @param month 月份 (YYYY-MM)
 */
export async function pushTasks(tasks: Task[], month: string): Promise<SyncResult> {
  if (!isOnline()) {
    return { success: false, message: '当前离线，无法同步' }
  }

  try {
    const client = ensureOctokit()
    const content = JSON.stringify(tasks, null, 2)
    const path = `${GITHUB_SYNC_DIR}/${month}/tasks.json`

    // 尝试获取文件 SHA（如果已存在）
    let sha: string | undefined
    try {
      const response = await client.rest.repos.getContent({
        owner: config.owner,
        repo: config.repo,
        path,
      })
      if (!Array.isArray(response.data) && 'sha' in response.data) {
        sha = response.data.sha
      }
    } catch {
      // 文件不存在，这是正常的
    }

    await client.rest.repos.createOrUpdateFileContents({
      owner: config.owner,
      repo: config.repo,
      path,
      message: `sync: 更新 ${month} 任务数据`,
      content: utf8ToBase64(content),
      sha,
    })

    return { success: true, message: `成功推送 ${tasks.length} 个任务` }
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    console.error('[GitHub] 推送任务失败:', message)
    return { success: false, message: `推送任务失败: ${message}` }
  }
}

/**
 * 从 GitHub 拉取任务数据
 * @param month 月份 (YYYY-MM)
 */
export async function pullTasks(month: string): Promise<SyncResult & { tasks?: Task[] }> {
  if (!isOnline()) {
    return { success: false, message: '当前离线，无法同步' }
  }

  try {
    const client = ensureOctokit()
    const path = `${GITHUB_SYNC_DIR}/${month}/tasks.json`

    const response = await client.rest.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path,
    })

    if (Array.isArray(response.data)) {
      return { success: false, message: '路径是目录而非文件' }
    }

    if ('content' in response.data) {
      const content = base64ToUtf8(response.data.content)
      const tasks = JSON.parse(content) as Task[]
      return { success: true, message: `成功拉取 ${tasks.length} 个任务`, tasks }
    }

    return { success: false, message: '无法解析响应数据' }
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    // 404 表示文件不存在，不是错误
    if (message.includes('404') || message.includes('Not Found')) {
      return { success: true, message: '远程无任务数据', tasks: [] }
    }
    console.error('[GitHub] 拉取任务失败:', message)
    return { success: false, message: `拉取任务失败: ${message}` }
  }
}

/**
 * 从 GitHub 拉取反思数据
 * @param month 月份 (YYYY-MM)
 */
export async function pullReflections(month: string): Promise<SyncResult & { reflections?: Reflection[] }> {
  if (!isOnline()) {
    return { success: false, message: '当前离线，无法同步' }
  }

  try {
    const client = ensureOctokit()
    const path = `${GITHUB_SYNC_DIR}/${month}/reflections.json`

    const response = await client.rest.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path,
    })

    if (Array.isArray(response.data)) {
      return { success: false, message: '路径是目录而非文件' }
    }

    if ('content' in response.data) {
      const content = base64ToUtf8(response.data.content)
      const reflections = JSON.parse(content) as Reflection[]
      return { success: true, message: `成功拉取 ${reflections.length} 条反思`, reflections }
    }

    return { success: false, message: '无法解析响应数据' }
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    if (message.includes('404') || message.includes('Not Found')) {
      return { success: true, message: '远程无反思数据', reflections: [] }
    }
    console.error('[GitHub] 拉取反思失败:', message)
    return { success: false, message: `拉取反思失败: ${message}` }
  }
}

/**
 * 从 GitHub 拉取会话数据
 * @param month 月份 (YYYY-MM)
 */
export async function pullSessions(month: string): Promise<SyncResult & { sessions?: Session[] }> {
  if (!isOnline()) {
    return { success: false, message: '当前离线，无法同步' }
  }

  try {
    const client = ensureOctokit()
    const path = `${GITHUB_SYNC_DIR}/${month}/sessions.json`

    const response = await client.rest.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path,
    })

    if (Array.isArray(response.data)) {
      return { success: false, message: '路径是目录而非文件' }
    }

    if ('content' in response.data) {
      const content = base64ToUtf8(response.data.content)
      const sessions = JSON.parse(content) as Session[]
      return { success: true, message: `成功拉取 ${sessions.length} 条会话`, sessions }
    }

    return { success: false, message: '无法解析响应数据' }
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    if (message.includes('404') || message.includes('Not Found')) {
      return { success: true, message: '远程无会话数据', sessions: [] }
    }
    console.error('[GitHub] 拉取会话失败:', message)
    return { success: false, message: `拉取会话失败: ${message}` }
  }
}

/**
 * 推送反思数据到 GitHub
 * @param reflections 反思列表
 * @param month 月份 (YYYY-MM)
 */
export async function pushReflections(reflections: Reflection[], month: string): Promise<SyncResult> {
  if (!isOnline()) {
    return { success: false, message: '当前离线，无法同步' }
  }

  try {
    const client = ensureOctokit()
    const content = JSON.stringify(reflections, null, 2)
    const path = `${GITHUB_SYNC_DIR}/${month}/reflections.json`

    let sha: string | undefined
    try {
      const response = await client.rest.repos.getContent({
        owner: config.owner,
        repo: config.repo,
        path,
      })
      if (!Array.isArray(response.data) && 'sha' in response.data) {
        sha = response.data.sha
      }
    } catch {
      // 文件不存在
    }

    await client.rest.repos.createOrUpdateFileContents({
      owner: config.owner,
      repo: config.repo,
      path,
      message: `sync: 更新 ${month} 反思数据`,
      content: utf8ToBase64(content),
      sha,
    })

    return { success: true, message: `成功推送 ${reflections.length} 条反思` }
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    console.error('[GitHub] 推送反思失败:', message)
    return { success: false, message: `推送反思失败: ${message}` }
  }
}

/**
 * 推送会话数据到 GitHub
 * @param sessions 会话列表
 * @param month 月份 (YYYY-MM)
 */
export async function pushSessions(sessions: Session[], month: string): Promise<SyncResult> {
  if (!isOnline()) {
    return { success: false, message: '当前离线，无法同步' }
  }

  try {
    const client = ensureOctokit()
    const content = JSON.stringify(sessions, null, 2)
    const path = `${GITHUB_SYNC_DIR}/${month}/sessions.json`

    let sha: string | undefined
    try {
      const response = await client.rest.repos.getContent({
        owner: config.owner,
        repo: config.repo,
        path,
      })
      if (!Array.isArray(response.data) && 'sha' in response.data) {
        sha = response.data.sha
      }
    } catch {
      // 文件不存在
    }

    await client.rest.repos.createOrUpdateFileContents({
      owner: config.owner,
      repo: config.repo,
      path,
      message: `sync: 更新 ${month} 会话数据`,
      content: utf8ToBase64(content),
      sha,
    })

    return { success: true, message: `成功推送 ${sessions.length} 条会话记录` }
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    console.error('[GitHub] 推送会话失败:', message)
    return { success: false, message: `推送会话失败: ${message}` }
  }
}

/**
 * 推送 Markdown 内容到 GitHub
 * @param content Markdown 内容
 * @param filename 文件名（如 "2024-01-daily-report.md"）
 * @param directory 目录路径（默认为 pomodorox-sync/reports）
 */
export async function pushMarkdown(
  content: string,
  filename: string,
  directory = `${GITHUB_SYNC_DIR}/reports`
): Promise<SyncResult> {
  if (!isOnline()) {
    return { success: false, message: '当前离线，无法同步' }
  }

  try {
    const client = ensureOctokit()
    const path = `${directory}/${filename}`

    let sha: string | undefined
    try {
      const response = await client.rest.repos.getContent({
        owner: config.owner,
        repo: config.repo,
        path,
      })
      if (!Array.isArray(response.data) && 'sha' in response.data) {
        sha = response.data.sha
      }
    } catch {
      // 文件不存在
    }

    await client.rest.repos.createOrUpdateFileContents({
      owner: config.owner,
      repo: config.repo,
      path,
      message: `report: 更新报告 ${filename}`,
      content: utf8ToBase64(content),
      sha,
    })

    return { success: true, message: `成功推送 ${filename}` }
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    console.error('[GitHub] 推送 Markdown 失败:', message)
    return { success: false, message: `推送失败: ${message}` }
  }
}

/**
 * 获取同步状态
 * 检查 GitHub 连接和仓库是否可用
 */
export async function getSyncStatus(): Promise<SyncResult> {
  if (!isOnline()) {
    return { success: false, message: '当前离线' }
  }

  if (!isConfigured()) {
    return { success: false, message: 'GitHub 未配置' }
  }

  try {
    const client = ensureOctokit()
    await client.rest.repos.get({
      owner: config.owner,
      repo: config.repo,
    })
    return { success: true, message: 'GitHub 连接正常' }
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    return { success: false, message: `GitHub 连接失败: ${message}` }
  }
}

/**
 * 执行完整同步：推送所有未同步数据
 */
export async function fullSync(
  unsyncedTasks: Task[],
  unsyncedReflections: Reflection[],
  unsyncedSessions: Session[]
): Promise<SyncResult[]> {
  const results: SyncResult[] = []
  const now = new Date()
  const month = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`

  if (unsyncedTasks.length > 0) {
    results.push(await pushTasks(unsyncedTasks, month))
  }

  if (unsyncedReflections.length > 0) {
    results.push(await pushReflections(unsyncedReflections, month))
  }

  if (unsyncedSessions.length > 0) {
    results.push(await pushSessions(unsyncedSessions, month))
  }

  if (results.length === 0) {
    results.push({ success: true, message: '没有需要同步的数据' })
  }

  return results
}

/**
 * 推送单个 outbox 事件到 GitHub
 * Append-only：每个事件写入独立的 outbox/{eventId}.json 文件
 * 永不覆盖已有文件（SHA 为空 = 新建）
 */
export async function pushEvent(event: OutboxEvent): Promise<SyncResult> {
  if (!isOnline()) {
    return { success: false, message: '当前离线，无法同步' }
  }

  try {
    const client = ensureOctokit()
    const path = `${GITHUB_SYNC_DIR}/outbox/${event.eventId}.json`
    const content = JSON.stringify(event, null, 2)

    // 不传入 SHA → 如果文件已存在则自动失败（GitHub API 返回 409）
    await client.rest.repos.createOrUpdateFileContents({
      owner: config.owner,
      repo: config.repo,
      path,
      message: `event: ${event.type} (${event.entityId})`,
      content: utf8ToBase64(content),
    })

    return { success: true, message: `事件 ${event.eventId} 推送成功` }
  } catch (err) {
    // 409 = 文件已存在（不同设备同时推送同一事件，或断网重试时远端已存在）
    // 视为幂等成功——事件已在 GitHub 上，无需重推
    if (err && typeof err === 'object' && 'status' in err && (err as any).status === 409) {
      return { success: true, message: `事件 ${event.eventId} 已存在（幂等跳过）` }
    }

    const message = err instanceof Error ? err.message : '未知错误'
    return { success: false, message: `事件推送失败: ${message}` }
  }
}

/**
 * 批量推送 outbox 事件
 * 调用方应自行控制批次大小（建议 ≤ 10 个/批）以避免 API 限频
 */
export async function pushEvents(events: OutboxEvent[]): Promise<SyncResult[]> {
  const results: SyncResult[] = []
  for (const event of events) {
    results.push(await pushEvent(event))
  }

  if (results.length === 0) {
    results.push({ success: true, message: '没有事件需要推送' })
  }

  return results
}

/**
 * 从 GitHub 拉取所有 outbox 事件
 * 使用 GitHub Repo Contents API 列出 outbox/ 目录下的文件
 * 然后逐个下载解析
 *
 * TODO: 添加 checkpoint 检查点，实现增量拉取
 *       每次消费成功后记录最新事件时间戳，下次只拉取之后的事件
 */
export async function pullEvents(): Promise<OutboxEvent[]> {
  if (!isOnline()) {
    console.warn('[GitHub] 当前离线，无法拉取事件')
    return []
  }

  try {
    const client = ensureOctokit()
    const dir = `${GITHUB_SYNC_DIR}/outbox`

    // 列出 outbox/ 目录内容
    let items: { name: string; path: string }[] = []
    try {
      const response = await client.rest.repos.getContent({
        owner: config.owner,
        repo: config.repo,
        path: dir,
      })

      if (Array.isArray(response.data)) {
        items = response.data
          .filter((item) => item.name.endsWith('.json'))
          .map((item) => ({ name: item.name, path: item.path }))
      }
    } catch {
      // outbox/ 目录不存在（首次使用或没有事件）
      return []
    }

    if (items.length === 0) return []

    // 按文件名排序（eventId 包含时间戳，自然形成时间序）
    items.sort((a, b) => a.name.localeCompare(b.name))

    // 逐个下载事件文件
    // 注：getContent 返回整个目录，无分页 API；
    // 个人使用场景事件数量有限，全量拉取后由消费端按 eventId 去重
    const events: OutboxEvent[] = []
    for (const item of items) {
      try {
        const response = await client.rest.repos.getContent({
          owner: config.owner,
          repo: config.repo,
          path: item.path,
        })

        if (!Array.isArray(response.data) && 'content' in response.data) {
          const content = base64ToUtf8(response.data.content)
          const event = JSON.parse(content) as OutboxEvent
          events.push(event)
        }
      } catch {
        // 单个事件文件拉取失败，跳过
        console.warn(`[GitHub] 拉取事件 ${item.name} 失败，跳过`)
      }
    }

    return events
  } catch (err) {
    console.error('[GitHub] 拉取事件列表失败:', err)
    return []
  }
}
