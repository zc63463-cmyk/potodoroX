/**
 * WebDAV 同步 Composable（Tauri 桌面端独占）
 *
 * 通过 Tauri Rust 命令绕过浏览器 CORS 限制，
 * 实现与坚果云等 WebDAV 服务的双向同步。
 */

import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { isTauri } from '@/utils/platform'
import type { Reflection } from '@/types'

interface WebDavConfig {
  url: string
  username: string
  password: string
}

interface SyncResult {
  success: boolean
  message: string
  pushed: number
  pulled: number
}

const STORAGE_KEY = 'webdav-config'

const config = ref<WebDavConfig | null>(loadConfig())
const lastSyncAt = ref<string | null>(loadLastSync())
const isSyncing = ref(false)
const syncError = ref<string | null>(null)

function loadConfig(): WebDavConfig | null {
  if (!isTauri()) return null
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
  if (!isTauri()) return
  if (cfg) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

function loadLastSync(): string | null {
  if (!isTauri()) return null
  return localStorage.getItem('webdav-last-sync')
}

function saveLastSync(at: string): void {
  if (!isTauri()) return
  localStorage.setItem('webdav-last-sync', at)
  lastSyncAt.value = at
}

export function useWebDavSync() {
  const isAvailable = computed(() => isTauri())
  const isConfigured = computed(() => !!config.value)

  function setConfig(cfg: WebDavConfig) {
    config.value = cfg
    saveConfig(cfg)
  }

  function clearConfig() {
    config.value = null
    saveConfig(null)
  }

  async function testConnection(): Promise<boolean> {
    if (!isTauri() || !config.value) return false
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

  async function pushFile(path: string, content: string): Promise<boolean> {
    if (!isTauri() || !config.value) return false
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

  async function pullFile(path: string): Promise<string | null> {
    if (!isTauri() || !config.value) return null
    try {
      const result = await invoke<string>('webdav_get', {
        url: config.value.url,
        username: config.value.username,
        password: config.value.password,
        path,
      })
      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      // 404 不算错误，表示远程没有此文件
      if (msg.includes('404') || msg.includes('Not Found')) {
        return null
      }
      console.error('[WebDAV] 下载失败:', err)
      return null
    }
  }

  /**
   * 推送本地反思数据到 WebDAV
   */
  async function pushReflections(reflections: Reflection[]): Promise<boolean> {
    if (!isTauri() || !config.value) return false
    const content = JSON.stringify(reflections, null, 2)
    return pushFile('pomodorox/reflections.json', content)
  }

  /**
   * 从 WebDAV 拉取反思数据
   */
  async function pullReflections(): Promise<Reflection[] | null> {
    if (!isTauri() || !config.value) return null
    const content = await pullFile('pomodorox/reflections.json')
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
   * 双向同步：推送本地 + 拉取远程，按 updatedAt 合并
   */
  async function sync(reflections: Reflection[]): Promise<SyncResult> {
    if (!isTauri() || !config.value) {
      return { success: false, message: 'WebDAV 不可用或未配置', pushed: 0, pulled: 0 }
    }

    isSyncing.value = true
    syncError.value = null

    try {
      // 1. 拉取远程数据
      const remote = await pullReflections()

      // 2. 合并：以 updatedAt 为准，较新者覆盖
      const merged = new Map<string, Reflection>()

      // 先放入本地数据
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

      // 3. 推送合并后的数据
      const mergedList = Array.from(merged.values())
      const pushOk = await pushReflections(mergedList)
      const pushed = reflections.length // 近似值：推送了全部合并数据

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
