/**
 * WebDAV 同步 Composable
 *
 * - Tauri 桌面端：通过 Rust 命令直接访问 WebDAV
 * - Web 浏览器端：通过用户自部署的 Cloudflare Worker 代理访问 WebDAV（绕过 CORS）
 */

import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { isTauri } from '@/utils/platform'
import type { Reflection } from '@/types'

interface WebDavConfig {
  url: string
  username: string
  password: string
  /** 仅 Web 端使用：Cloudflare Worker 代理 URL */
  proxyUrl?: string
}

interface SyncResult {
  success: boolean
  message: string
  pushed: number
  pulled: number
}

const STORAGE_KEY = 'webdav-config'
const LAST_SYNC_KEY = 'webdav-last-sync'
const REMOTE_PATH = 'pomodorox/reflections.json'

const config = ref<WebDavConfig | null>(loadConfig())
const lastSyncAt = ref<string | null>(loadLastSync())
const isSyncing = ref(false)
const syncError = ref<string | null>(null)

function loadConfig(): WebDavConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed.url && parsed.username) {
      return parsed as WebDavConfig
    }
  } catch {
    // ignore
  }
  return null
}

function saveConfig(cfg: WebDavConfig | null): void {
  if (cfg) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

function loadLastSync(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY)
}

function saveLastSync(at: string): void {
  localStorage.setItem(LAST_SYNC_KEY, at)
  lastSyncAt.value = at
}

/** 拼接完整 WebDAV URL */
function joinUrl(base: string, path: string): string {
  const trimmedBase = base.endsWith('/') ? base.slice(0, -1) : base
  const trimmedPath = path.startsWith('/') ? path.slice(1) : path
  return `${trimmedBase}/${trimmedPath}`
}

/** 浏览器端通过 Worker 代理发起 WebDAV 请求 */
async function webProxyRequest(
  cfg: WebDavConfig,
  method: string,
  path: string,
  body?: string,
): Promise<Response> {
  if (!cfg.proxyUrl) {
    throw new Error('未配置 WebDAV 代理 URL（Web 端必需）')
  }
  const targetUrl = joinUrl(cfg.url, path)
  const proxy = cfg.proxyUrl.endsWith('/') ? cfg.proxyUrl.slice(0, -1) : cfg.proxyUrl
  const reqUrl = `${proxy}/?url=${encodeURIComponent(targetUrl)}`
  const auth = btoa(`${cfg.username}:${cfg.password}`)
  const headers: Record<string, string> = {
    Authorization: `Basic ${auth}`,
  }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  return fetch(reqUrl, {
    method,
    headers,
    body,
  })
}

export function useWebDavSync() {
  const isAvailable = computed(() => {
    if (isTauri()) return true
    // Web 端需要配置了 proxyUrl 才可用
    return !!config.value?.proxyUrl
  })

  const isConfigured = computed(() => {
    if (!config.value) return false
    if (isTauri()) return true
    return !!config.value.proxyUrl
  })

  function setConfig(cfg: WebDavConfig) {
    config.value = cfg
    saveConfig(cfg)
  }

  function clearConfig() {
    config.value = null
    saveConfig(null)
  }

  async function testConnection(): Promise<boolean> {
    if (!config.value) return false

    if (isTauri()) {
      try {
        return await invoke('webdav_test', {
          url: config.value.url,
          username: config.value.username,
          password: config.value.password,
        })
      } catch (err) {
        console.error('[WebDAV] 连接测试失败:', err)
        return false
      }
    }

    // Web 端：通过代理发一个 PROPFIND 到根路径
    try {
      const res = await webProxyRequest(config.value, 'PROPFIND', '')
      return res.status >= 200 && res.status < 400
    } catch (err) {
      console.error('[WebDAV] 代理连接测试失败:', err)
      return false
    }
  }

  async function pushFile(path: string, content: string): Promise<boolean> {
    if (!config.value) return false

    if (isTauri()) {
      try {
        await invoke('webdav_put', {
          url: config.value.url,
          username: config.value.username,
          password: config.value.password,
          path,
          content,
        })
        return true
      } catch (err) {
        console.error('[WebDAV] 上传失败:', err)
        return false
      }
    }

    try {
      const res = await webProxyRequest(config.value, 'PUT', path, content)
      if (!res.ok) {
        console.error('[WebDAV] 代理上传失败:', res.status, await res.text())
        return false
      }
      return true
    } catch (err) {
      console.error('[WebDAV] 代理上传异常:', err)
      return false
    }
  }

  async function pullFile(path: string): Promise<string | null> {
    if (!config.value) return null

    if (isTauri()) {
      try {
        return await invoke<string>('webdav_get', {
          url: config.value.url,
          username: config.value.username,
          password: config.value.password,
          path,
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('404') || msg.includes('Not Found')) {
          return null
        }
        console.error('[WebDAV] 下载失败:', err)
        return null
      }
    }

    try {
      const res = await webProxyRequest(config.value, 'GET', path)
      if (res.status === 404) return null
      if (!res.ok) {
        console.error('[WebDAV] 代理下载失败:', res.status)
        return null
      }
      return await res.text()
    } catch (err) {
      console.error('[WebDAV] 代理下载异常:', err)
      return null
    }
  }

  async function pushReflections(reflections: Reflection[]): Promise<boolean> {
    const content = JSON.stringify(reflections, null, 2)
    return pushFile(REMOTE_PATH, content)
  }

  async function pullReflections(): Promise<Reflection[] | null> {
    const content = await pullFile(REMOTE_PATH)
    if (!content) return null
    try {
      const data = JSON.parse(content)
      if (Array.isArray(data)) return data as Reflection[]
      return null
    } catch {
      return null
    }
  }

  /**
   * 双向同步：拉取远程 + 合并（按 updatedAt 择新） + 推送
   */
  async function sync(reflections: Reflection[]): Promise<SyncResult> {
    if (!config.value) {
      return { success: false, message: 'WebDAV 未配置', pushed: 0, pulled: 0 }
    }
    if (!isAvailable.value) {
      return {
        success: false,
        message: isTauri() ? 'WebDAV 不可用' : '请先配置 Worker 代理 URL',
        pushed: 0,
        pulled: 0,
      }
    }

    isSyncing.value = true
    syncError.value = null

    try {
      const remote = await pullReflections()

      const merged = new Map<string, Reflection>()
      reflections.forEach((r) => merged.set(r.id, r))

      let pulled = 0
      if (remote) {
        remote.forEach((r) => {
          const local = merged.get(r.id)
          if (!local) {
            merged.set(r.id, r)
            pulled++
          } else if (r.updatedAt > local.updatedAt) {
            merged.set(r.id, r)
            pulled++
          }
        })
      }

      const mergedList = Array.from(merged.values())
      const pushOk = await pushReflections(mergedList)
      const pushed = mergedList.length

      if (!pushOk) {
        return { success: false, message: '推送数据到 WebDAV 失败', pushed: 0, pulled }
      }

      saveLastSync(new Date().toISOString())
      return {
        success: true,
        message: `同步完成：推送 ${pushed} 条，拉取 ${pulled} 条`,
        pushed,
        pulled,
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '同步失败'
      syncError.value = msg
      return { success: false, message: msg, pushed: 0, pulled: 0 }
    } finally {
      isSyncing.value = false
    }
  }

  return {
    config,
    isAvailable,
    isConfigured,
    isSyncing,
    lastSyncAt,
    syncError,
    setConfig,
    clearConfig,
    testConnection,
    sync,
  }
}
