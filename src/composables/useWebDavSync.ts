/**
 * WebDAV 同步 Composable
 *
 * - Tauri 桌面端：通过 Rust 命令直接访问 WebDAV
 * - Web 浏览器端：通过 Vercel Edge API 代理访问 WebDAV（绕过 CORS）
 *
 * 支持同步类型：reflections / sessions / tasks
 * 支持按日期范围筛选同步
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

interface SyncResult {
  success: boolean;
  message: string;
  pushed: number;
  pulled: number;
}

const STORAGE_KEY = "webdav-config";
const LAST_SYNC_KEY = "webdav-last-sync";

const REMOTE_PATHS = {
  reflections: "pomodorox/reflections.json",
  sessions: "pomodorox/sessions.json",
  tasks: "pomodorox/tasks.json",
} as const;

type SyncType = keyof typeof REMOTE_PATHS;

interface SyncOptions {
  types: SyncType[];
  dateRange?: { start: string; end: string };
}

interface SyncTypeResult {
  type: SyncType;
  pushed: number;
  pulled: number;
  error?: string;
}

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
  const reqUrl = `${proxy}/?url=${encodeURIComponent(targetUrl)}`;
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

  /** 按日期范围过滤实体 */
  function filterByDateRange<T>(
    items: T[],
    range: { start: string; end: string },
    getDate: (item: T) => string
  ): T[] {
    return items.filter((item) => {
      const dateStr = getDate(item);
      return dateStr >= range.start && dateStr <= range.end;
    });
  }

  /** 通用合并：本地 + 远程，按时间戳择新 */
  function mergeEntities<T extends { id: string }>(
    local: T[],
    remote: T[],
    getTimestamp: (item: T) => string
  ): { merged: T[]; pulled: number } {
    const map = new Map<string, T>();
    local.forEach((e) => map.set(e.id, e));

    let pulled = 0;
    remote.forEach((r) => {
      const existing = map.get(r.id);
      if (!existing) {
        map.set(r.id, r);
        pulled++;
      } else if (getTimestamp(r) > getTimestamp(existing)) {
        map.set(r.id, r);
        pulled++;
      }
    });

    return { merged: Array.from(map.values()), pulled };
  }

  /** 同步单个类型 */
  async function syncType<T extends { id: string }>(
    type: SyncType,
    localData: T[],
    getTimestamp: (item: T) => string,
    getDate: (item: T) => string,
    dateRange?: { start: string; end: string }
  ): Promise<SyncTypeResult> {
    const path = REMOTE_PATHS[type];

    // 拉取远程
    const raw = await pullFile(path);
    let remoteData: T[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) remoteData = parsed as T[];
      } catch {
        /* 远程数据损坏，视为空 */
      }
    }

    // 日期范围过滤
    if (dateRange) {
      localData = filterByDateRange(localData, dateRange, getDate);
      remoteData = filterByDateRange(remoteData, dateRange, getDate);
    }

    // 合并
    const { merged, pulled } = mergeEntities(
      localData,
      remoteData,
      getTimestamp
    );

    // 推送
    const content = JSON.stringify(merged, null, 2);
    const pushOk = await pushFile(path, content);

    if (!pushOk) {
      return { type, pushed: 0, pulled, error: "推送失败" };
    }

    return { type, pushed: merged.length, pulled };
  }

  /**
   * 双向同步：拉取远程 + 合并（按 updatedAt 择新） + 推送
   * @param dataMap 各类型的本地数据映射
   * @param options 同步选项（类型、日期范围）
   */
  async function sync(
    dataMap: {
      reflections?: Reflection[];
      sessions?: Session[];
      tasks?: Task[];
    },
    options: SyncOptions
  ): Promise<SyncResult> {
    if (!config.value) {
      return { success: false, message: "WebDAV 未配置", pushed: 0, pulled: 0 };
    }
    if (!isAvailable.value) {
      return {
        success: false,
        message: isTauri() ? "WebDAV 不可用" : "请先配置代理 URL",
        pushed: 0,
        pulled: 0,
      };
    }

    isSyncing.value = true;
    syncError.value = null;

    try {
      // Web 端：先确保远程目录存在
      if (!isTauri()) {
        try {
          await webProxyRequest(config.value, "MKCOL", "pomodorox/");
        } catch {
          /* 目录已存在或冲突，忽略 */
        }
      }

      const results: SyncTypeResult[] = [];

      for (const type of options.types) {
        switch (type) {
          case "reflections": {
            const data = dataMap.reflections ?? [];
            const result = await syncType(
              type,
              data,
              (r) => r.updatedAt,
              (r) => r.date,
              options.dateRange
            );
            results.push(result);
            break;
          }
          case "sessions": {
            const data = dataMap.sessions ?? [];
            const result = await syncType(
              type,
              data,
              (s) => s.startedAt,
              (s) => s.startedAt.slice(0, 10),
              options.dateRange
            );
            results.push(result);
            break;
          }
          case "tasks": {
            const data = dataMap.tasks ?? [];
            const result = await syncType(
              type,
              data,
              (t) => t.updatedAt,
              (t) => t.createdAt.slice(0, 10),
              options.dateRange
            );
            results.push(result);
            break;
          }
        }
      }

      const totalPushed = results.reduce((s, r) => s + r.pushed, 0);
      const totalPulled = results.reduce((s, r) => s + r.pulled, 0);
      const errors = results
        .filter((r) => r.error)
        .map((r) => `${r.type}: ${r.error}`);

      if (errors.length === results.length) {
        return {
          success: false,
          message: errors.join("; "),
          pushed: 0,
          pulled: totalPulled,
        };
      }

      saveLastSync(new Date().toISOString());

      const parts: string[] = [];
      results.forEach((r) => {
        if (!r.error) parts.push(`${r.type} 推${r.pushed}/拉${r.pulled}`);
      });
      const msg = `同步完成：${parts.join("，")}${errors.length ? "（" + errors.join("; ") + "）" : ""}`;

      return {
        success: true,
        message: msg,
        pushed: totalPushed,
        pulled: totalPulled,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "同步失败";
      syncError.value = msg;
      return { success: false, message: msg, pushed: 0, pulled: 0 };
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
    sync,
  };
}
