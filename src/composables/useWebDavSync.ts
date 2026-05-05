/**
 * WebDAV 同步 Composable
 *
 * - Tauri 桌面端：通过 Rust 命令直接访问 WebDAV
 * - Web 浏览器端：通过用户自部署的 Cloudflare Worker 代理访问 WebDAV（绕过 CORS）
 */

import { ref, computed } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { isTauri } from "@/utils/platform";
import type { Reflection, Session, Task } from "@/types";

interface WebDavConfig {
  url: string;
  username: string;
  password: string;
  /** 仅 Web 端使用：Cloudflare Worker 代理 URL */
  proxyUrl?: string;
}

export interface SyncTypeResult {
  type: "reflections" | "sessions" | "tasks";
  pushed: number;
  pulled: number;
  error?: string;
}

const STORAGE_KEY = "webdav-config";
const LAST_SYNC_KEY = "webdav-last-sync";
const REMOTE_PATHS = {
  reflections: "pomodorox/reflections.json",
  sessions: "pomodorox/sessions.json",
  tasks: "pomodorox/tasks.json",
} as const;

const config = ref<WebDavConfig | null>(loadConfig());
const lastSyncAt = ref<string | null>(loadLastSync());
const isSyncing = ref(false);
const syncError = ref<string | null>(null);

function loadConfig(): WebDavConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.url && parsed.username) {
      return parsed as WebDavConfig;
    }
  } catch {
    // ignore
  }
  return null;
}

function saveConfig(cfg: WebDavConfig | null): void {
  if (cfg) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function loadLastSync(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY);
}

function saveLastSync(at: string): void {
  localStorage.setItem(LAST_SYNC_KEY, at);
  lastSyncAt.value = at;
}

/** 拼接完整 WebDAV URL */
function joinUrl(base: string, path: string): string {
  const trimmedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const trimmedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${trimmedBase}/${trimmedPath}`;
}

/** 浏览器端通过 Vercel Edge API 代理发起 WebDAV 请求 */
async function webProxyRequest(
  cfg: WebDavConfig,
  method: string,
  path: string,
  body?: string
): Promise<Response> {
  const targetUrl = joinUrl(cfg.url, path);
  const proxy = cfg.proxyUrl
    ? cfg.proxyUrl.endsWith("/")
      ? cfg.proxyUrl.slice(0, -1)
      : cfg.proxyUrl
    : "/api/webdav-proxy";
  const reqUrl = `${proxy}?url=${encodeURIComponent(targetUrl)}`;
  const auth = btoa(`${cfg.username}:${cfg.password}`);
  const headers: Record<string, string> = {
    Authorization: `Basic ${auth}`,
  };

  let finalBody: string | undefined = body;

  // PROPFIND 必须带 Depth header（坚果云等 WebDAV 服务器严格要求）
  // Depth: 0 = 仅查询资源本身，用于存在性检查
  if (method === "PROPFIND") {
    headers["Depth"] = "0";
    headers["Content-Type"] = "application/xml; charset=utf-8";
    // 空 PROPFIND body = 请求所有属性（标准 allprop 行为）
    finalBody =
      body ??
      '<?xml version="1.0" encoding="utf-8"?><D:propfind xmlns:D="DAV:"><D:allprop/></D:propfind>';
  } else if (method === "PUT") {
    headers["Content-Type"] = "application/json";
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(reqUrl, {
    method,
    headers,
    body: finalBody,
  });
}

export function useWebDavSync() {
  const isAvailable = computed(() => {
    if (isTauri()) return true;
    // Web 端：只要配置了服务器地址+用户名+密码即可（使用同域名 /api/webdav-proxy）
    return !!config.value;
  });

  const isConfigured = computed(() => {
    return !!config.value;
  });

  function setConfig(cfg: WebDavConfig) {
    config.value = cfg;
    saveConfig(cfg);
  }

  function clearConfig() {
    config.value = null;
    saveConfig(null);
  }

  async function testConnection(): Promise<boolean> {
    if (!config.value) return false;

    if (isTauri()) {
      try {
        return await invoke("webdav_test", {
          url: config.value.url,
          username: config.value.username,
          password: config.value.password,
        });
      } catch (err) {
        console.error("[WebDAV] 连接测试失败:", err);
        return false;
      }
    }

    // Web 端：通过代理发一个 PROPFIND 到根路径
    try {
      const res = await webProxyRequest(config.value, "PROPFIND", "");
      return res.status >= 200 && res.status < 400;
    } catch (err) {
      console.error("[WebDAV] 代理连接测试失败:", err);
      return false;
    }
  }

  async function pushFile(path: string, content: string): Promise<boolean> {
    if (!config.value) return false;

    if (isTauri()) {
      try {
        await invoke("webdav_put", {
          url: config.value.url,
          username: config.value.username,
          password: config.value.password,
          path,
          content,
        });
        return true;
      } catch (err) {
        console.error("[WebDAV] 上传失败:", err);
        return false;
      }
    }

    try {
      // 坚果云要求父目录必须已存在，先 MKCOL 创建目录（忽略已存在/冲突）
      const parts = path.split("/");
      if (parts.length > 1) {
        const parentDir = parts.slice(0, -1).join("/") + "/";
        try {
          await webProxyRequest(config.value, "MKCOL", parentDir);
        } catch {
          /* 目录已存在或冲突，忽略 */
        }
      }
      const res = await webProxyRequest(config.value, "PUT", path, content);
      if (!res.ok) {
        console.error("[WebDAV] 代理上传失败:", res.status, await res.text());
        return false;
      }
      return true;
    } catch (err) {
      console.error("[WebDAV] 代理上传异常:", err);
      return false;
    }
  }

  async function pullFile(path: string): Promise<string | null> {
    if (!config.value) return null;

    if (isTauri()) {
      try {
        return await invoke<string>("webdav_get", {
          url: config.value.url,
          username: config.value.username,
          password: config.value.password,
          path,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("404") || msg.includes("Not Found")) {
          return null;
        }
        console.error("[WebDAV] 下载失败:", err);
        return null;
      }
    }

    try {
      const res = await webProxyRequest(config.value, "GET", path);
      if (res.status === 404 || res.status === 409) return null;
      if (!res.ok) {
        console.error("[WebDAV] 代理下载失败:", res.status);
        return null;
      }
      return await res.text();
    } catch (err) {
      console.error("[WebDAV] 代理下载异常:", err);
      return null;
    }
  }

  /** Web 端：确保远程目录存在（忽略已存在错误） */
  async function ensureRemoteDir(): Promise<void> {
    if (!config.value || isTauri()) return;
    try {
      const dirPath = "pomodorox/";
      await webProxyRequest(config.value, "MKCOL", dirPath);
    } catch {
      /* 目录已存在或冲突，忽略 */
    }
  }

  /** 按 id 合并本地和远程数据，保留 updatedAt 更新的版本 */
  function mergeById<T extends { id: string }>(
    local: T[],
    remote: T[],
    getTimestamp: (e: T) => string
  ): { merged: T[]; pulled: number } {
    const merged = new Map<string, T>();
    local.forEach((item) => merged.set(item.id, item));

    let pulled = 0;
    remote.forEach((item) => {
      const localItem = merged.get(item.id);
      if (!localItem) {
        merged.set(item.id, item);
        pulled++;
      } else if (getTimestamp(item) > getTimestamp(localItem)) {
        merged.set(item.id, item);
        pulled++;
      }
    });

    return { merged: Array.from(merged.values()), pulled };
  }

  /** 同步反思 */
  async function syncReflections(items: Reflection[]): Promise<SyncTypeResult> {
    if (!config.value) {
      return {
        type: "reflections",
        pushed: 0,
        pulled: 0,
        error: "WebDAV 未配置",
      };
    }
    if (!isAvailable.value) {
      return {
        type: "reflections",
        pushed: 0,
        pulled: 0,
        error: isTauri() ? "WebDAV 不可用" : "请先配置 Worker 代理 URL",
      };
    }

    isSyncing.value = true;
    syncError.value = null;

    try {
      await ensureRemoteDir();

      const content = await pullFile(REMOTE_PATHS.reflections);
      let remote: Reflection[] = [];
      if (content) {
        try {
          const data = JSON.parse(content);
          if (Array.isArray(data)) remote = data as Reflection[];
        } catch {
          // 解析失败，视为无远程数据
        }
      }

      const { merged, pulled } = mergeById(items, remote, (e) => e.updatedAt);
      const pushOk = await pushFile(
        REMOTE_PATHS.reflections,
        JSON.stringify(merged, null, 2)
      );
      const pushed = merged.length;

      if (!pushOk) {
        return {
          type: "reflections",
          pushed: 0,
          pulled,
          error: "推送数据到 WebDAV 失败",
        };
      }

      saveLastSync(new Date().toISOString());
      return { type: "reflections", pushed, pulled };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "同步失败";
      syncError.value = msg;
      return { type: "reflections", pushed: 0, pulled: 0, error: msg };
    } finally {
      isSyncing.value = false;
    }
  }

  /** 同步会话 */
  async function syncSessions(items: Session[]): Promise<SyncTypeResult> {
    if (!config.value) {
      return { type: "sessions", pushed: 0, pulled: 0, error: "WebDAV 未配置" };
    }
    if (!isAvailable.value) {
      return {
        type: "sessions",
        pushed: 0,
        pulled: 0,
        error: isTauri() ? "WebDAV 不可用" : "请先配置 Worker 代理 URL",
      };
    }

    isSyncing.value = true;
    syncError.value = null;

    try {
      await ensureRemoteDir();

      const content = await pullFile(REMOTE_PATHS.sessions);
      let remote: Session[] = [];
      if (content) {
        try {
          const data = JSON.parse(content);
          if (Array.isArray(data)) remote = data as Session[];
        } catch {
          // 解析失败，视为无远程数据
        }
      }

      const { merged, pulled } = mergeById(items, remote, (e) => e.updatedAt);
      const pushOk = await pushFile(
        REMOTE_PATHS.sessions,
        JSON.stringify(merged, null, 2)
      );
      const pushed = merged.length;

      if (!pushOk) {
        return {
          type: "sessions",
          pushed: 0,
          pulled,
          error: "推送数据到 WebDAV 失败",
        };
      }

      saveLastSync(new Date().toISOString());
      return { type: "sessions", pushed, pulled };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "同步失败";
      syncError.value = msg;
      return { type: "sessions", pushed: 0, pulled: 0, error: msg };
    } finally {
      isSyncing.value = false;
    }
  }

  /** 同步任务 */
  async function syncTasks(items: Task[]): Promise<SyncTypeResult> {
    if (!config.value) {
      return { type: "tasks", pushed: 0, pulled: 0, error: "WebDAV 未配置" };
    }
    if (!isAvailable.value) {
      return {
        type: "tasks",
        pushed: 0,
        pulled: 0,
        error: isTauri() ? "WebDAV 不可用" : "请先配置 Worker 代理 URL",
      };
    }

    isSyncing.value = true;
    syncError.value = null;

    try {
      await ensureRemoteDir();

      const content = await pullFile(REMOTE_PATHS.tasks);
      let remote: Task[] = [];
      if (content) {
        try {
          const data = JSON.parse(content);
          if (Array.isArray(data)) remote = data as Task[];
        } catch {
          // 解析失败，视为无远程数据
        }
      }

      const { merged, pulled } = mergeById(items, remote, (e) => e.updatedAt);
      const pushOk = await pushFile(
        REMOTE_PATHS.tasks,
        JSON.stringify(merged, null, 2)
      );
      const pushed = merged.length;

      if (!pushOk) {
        return {
          type: "tasks",
          pushed: 0,
          pulled,
          error: "推送数据到 WebDAV 失败",
        };
      }

      saveLastSync(new Date().toISOString());
      return { type: "tasks", pushed, pulled };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "同步失败";
      syncError.value = msg;
      return { type: "tasks", pushed: 0, pulled: 0, error: msg };
    } finally {
      isSyncing.value = false;
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
    syncReflections,
    syncSessions,
    syncTasks,
  };
}
