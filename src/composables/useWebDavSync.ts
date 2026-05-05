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
import {
  getAllTombstones,
  upsertTombstones,
  type Tombstone,
} from "@/services/outbox";
import { parseTime } from "@/services/event-consumer";

interface WebDavConfig {
  url: string;
  username: string;
  password: string;
  /** 仅 Web 端使用：Cloudflare Worker 代理 URL */
  proxyUrl?: string;
}

export interface SyncTypeResult<T = unknown> {
  type: "reflections" | "sessions" | "tasks";
  pushed: number;
  pulled: number;
  merged?: T;
  /** 本地需要删除的实体 ID（被远端墓碑覆盖） */
  toDeleteLocal?: string[];
  error?: string;
}

export interface SyncTombstonesResult {
  pushed: number;
  pulled: number;
  merged: Tombstone[];
  error?: string;
}

const STORAGE_KEY = "webdav-config";
const LAST_SYNC_KEY = "webdav-last-sync";
const REMOTE_PATHS = {
  reflections: "pomodorox/reflections.json",
  sessions: "pomodorox/sessions.json",
  tasks: "pomodorox/tasks.json",
  tombstones: "pomodorox/tombstones.json",
} as const;

const config = ref<WebDavConfig | null>(loadConfig());
const lastSyncAt = ref<string | null>(loadLastSync());
const isSyncing = ref(false);
const syncError = ref<string | null>(null);

// ---- 全局串行锁（模块级，保证所有 sync 调用按顺序执行） ----
let _syncLock: Promise<unknown> = Promise.resolve();

/** 串行执行异步函数：同一时间只有一个 WebDAV 同步操作 */
function serialized<T>(fn: () => Promise<T>): Promise<T> {
  const run = _syncLock.then(() => fn());
  _syncLock = run.catch(() => undefined);
  return run;
}

// ---- 可测试的纯函数（导出供测试用） ----

/**
 * 应用墓碑过滤的合并：
 * - 跳过 tombstone.deletedAt >= entity.updatedAt 的条目
 * - 返回需从本地删除的 ID（本地有但被远端墓碑覆盖）
 * - 使用 parseTime 避免字符串格式差异（YYYY-MM-DD HH:mm:ss vs ISO）
 */
export function mergeWithTombstones<
  T extends { id: string; updatedAt: string },
>(
  entityType: string,
  local: T[],
  remote: T[],
  tombstones: Tombstone[]
): { merged: T[]; pulled: number; toDeleteLocal: string[] } {
  const tsMap = new Map<string, string>();
  tombstones
    .filter((t) => t.entityType === entityType)
    .forEach((t) => tsMap.set(t.entityId, t.deletedAt));

  const merged = new Map<string, T>();
  const toDeleteLocal: string[] = [];

  local.forEach((item) => {
    const ts = tsMap.get(item.id);
    if (ts && parseTime(ts) >= parseTime(item.updatedAt)) {
      toDeleteLocal.push(item.id);
      return;
    }
    merged.set(item.id, item);
  });

  let pulled = 0;
  remote.forEach((item) => {
    const ts = tsMap.get(item.id);
    if (ts && parseTime(ts) >= parseTime(item.updatedAt)) return;
    const existing = merged.get(item.id);
    if (!existing) {
      merged.set(item.id, item);
      pulled++;
    } else if (parseTime(item.updatedAt) > parseTime(existing.updatedAt)) {
      merged.set(item.id, item);
      pulled++;
    }
  });

  return { merged: Array.from(merged.values()), pulled, toDeleteLocal };
}

/** 合并墓碑列表（按 entityType+entityId 保留最新 deletedAt） */
export function mergeTombstones(
  local: Tombstone[],
  remote: Tombstone[]
): { merged: Tombstone[]; pulled: number } {
  const map = new Map<string, Tombstone>();
  const keyOf = (t: Tombstone) => `${t.entityType}:${t.entityId}`;
  local.forEach((t) => map.set(keyOf(t), t));

  let pulled = 0;
  remote.forEach((t) => {
    const k = keyOf(t);
    const existing = map.get(k);
    if (!existing) {
      map.set(k, t);
      pulled++;
    } else if (parseTime(t.deletedAt) > parseTime(existing.deletedAt)) {
      map.set(k, t);
      pulled++;
    }
  });

  return { merged: Array.from(map.values()), pulled };
}

/** 暴露全局串行锁（仅测试用） */
export const __webdavSerialized = serialized;

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

  /**
   * 拉取远程文件的三态结果：
   * - ok: 文件存在并成功读取
   * - missing: 文件不存在（404/409）
   * - fatal: 其他错误（401/5xx/网络异常），调用方必须禁止 PUT 避免以本地子集覆盖远端
   */
  type PullResult =
    | { kind: "ok"; content: string }
    | { kind: "missing" }
    | { kind: "fatal"; error: string };

  async function pullFile(path: string): Promise<PullResult> {
    if (!config.value) return { kind: "fatal", error: "WebDAV 未配置" };

    if (isTauri()) {
      try {
        const content = await invoke<string>("webdav_get", {
          url: config.value.url,
          username: config.value.username,
          password: config.value.password,
          path,
        });
        return { kind: "ok", content };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("404") || msg.includes("Not Found")) {
          return { kind: "missing" };
        }
        console.error("[WebDAV] 下载失败:", err);
        return { kind: "fatal", error: msg };
      }
    }

    try {
      const res = await webProxyRequest(config.value, "GET", path);
      if (res.status === 404 || res.status === 409) return { kind: "missing" };
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        const err = `HTTP ${res.status} ${body}`.trim();
        console.error("[WebDAV] 代理下载失败:", err);
        return { kind: "fatal", error: err };
      }
      return { kind: "ok", content: await res.text() };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[WebDAV] 代理下载异常:", err);
      return { kind: "fatal", error: msg };
    }
  }

  /** 确保远程目录存在（Web 端和 Tauri 端均支持，已存在错误忽略） */
  async function ensureRemoteDir(): Promise<void> {
    if (!config.value) return;
    const dirPath = "pomodorox/";

    if (isTauri()) {
      try {
        await invoke("webdav_mkcol", {
          url: config.value.url,
          username: config.value.username,
          password: config.value.password,
          path: dirPath,
        });
      } catch (err) {
        // 目录已存在或冲突，忽略
        console.debug("[WebDAV] MKCOL 忽略:", err);
      }
      return;
    }

    try {
      await webProxyRequest(config.value, "MKCOL", dirPath);
    } catch {
      /* 目录已存在或冲突，忽略 */
    }
  }

  /**
   * 应用墓碑过滤的合并：使用模块级 mergeWithTombstones 实现
   */

  /** 同步墓碑（必须先于实体同步执行） */
  async function syncTombstones(): Promise<SyncTombstonesResult> {
    if (!config.value) {
      return { pushed: 0, pulled: 0, merged: [], error: "WebDAV 未配置" };
    }
    if (!isAvailable.value) {
      return {
        pushed: 0,
        pulled: 0,
        merged: [],
        error: isTauri() ? "WebDAV 不可用" : "请先配置 Worker 代理 URL",
      };
    }

    try {
      await ensureRemoteDir();

      const local = await getAllTombstones();
      const pullRes = await pullFile(REMOTE_PATHS.tombstones);
      if (pullRes.kind === "fatal") {
        // 读取失败时禁止 PUT，避免以本地子集覆盖远端
        return {
          pushed: 0,
          pulled: 0,
          merged: local,
          error: `拉取墓碑失败（已中止推送）：${pullRes.error}`,
        };
      }
      let remote: Tombstone[] = [];
      if (pullRes.kind === "ok") {
        try {
          const data = JSON.parse(pullRes.content);
          if (Array.isArray(data)) remote = data as Tombstone[];
        } catch {
          /* ignore */
        }
      }

      const { merged, pulled } = mergeTombstones(local, remote);

      // 写回本地墓碑
      await upsertTombstones(merged);

      const pushOk = await pushFile(
        REMOTE_PATHS.tombstones,
        JSON.stringify(merged, null, 2)
      );
      if (!pushOk) {
        return { pushed: 0, pulled, merged, error: "推送墓碑到 WebDAV 失败" };
      }

      return { pushed: merged.length, pulled, merged };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "墓碑同步失败";
      return { pushed: 0, pulled: 0, merged: [], error: msg };
    }
  }

  /** 同步反思 */
  async function syncReflections(
    items: Reflection[],
    tombstones: Tombstone[] = []
  ): Promise<SyncTypeResult<Reflection[]>> {
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

      const pullRes = await pullFile(REMOTE_PATHS.reflections);
      if (pullRes.kind === "fatal") {
        return {
          type: "reflections",
          pushed: 0,
          pulled: 0,
          error: `拉取失败（已中止推送）：${pullRes.error}`,
        };
      }
      let remote: Reflection[] = [];
      if (pullRes.kind === "ok") {
        try {
          const data = JSON.parse(pullRes.content);
          if (Array.isArray(data)) remote = data as Reflection[];
        } catch {
          // 解析失败，视为无远程数据
        }
      }

      const { merged, pulled, toDeleteLocal } = mergeWithTombstones(
        "reflection",
        items,
        remote,
        tombstones
      );
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
      return { type: "reflections", pushed, pulled, merged, toDeleteLocal };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "同步失败";
      syncError.value = msg;
      return { type: "reflections", pushed: 0, pulled: 0, error: msg };
    } finally {
      isSyncing.value = false;
    }
  }

  /** 同步会话 */
  async function syncSessions(
    items: Session[],
    tombstones: Tombstone[] = []
  ): Promise<SyncTypeResult<Session[]>> {
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

      const pullRes = await pullFile(REMOTE_PATHS.sessions);
      if (pullRes.kind === "fatal") {
        return {
          type: "sessions",
          pushed: 0,
          pulled: 0,
          error: `拉取失败（已中止推送）：${pullRes.error}`,
        };
      }
      let remote: Session[] = [];
      if (pullRes.kind === "ok") {
        try {
          const data = JSON.parse(pullRes.content);
          if (Array.isArray(data)) remote = data as Session[];
        } catch {
          // 解析失败，视为无远程数据
        }
      }

      const { merged, pulled, toDeleteLocal } = mergeWithTombstones(
        "session",
        items,
        remote,
        tombstones
      );
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
      return { type: "sessions", pushed, pulled, merged, toDeleteLocal };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "同步失败";
      syncError.value = msg;
      return { type: "sessions", pushed: 0, pulled: 0, error: msg };
    } finally {
      isSyncing.value = false;
    }
  }

  /** 同步任务 */
  async function syncTasks(
    items: Task[],
    tombstones: Tombstone[] = []
  ): Promise<SyncTypeResult<Task[]>> {
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

      const pullRes = await pullFile(REMOTE_PATHS.tasks);
      if (pullRes.kind === "fatal") {
        return {
          type: "tasks",
          pushed: 0,
          pulled: 0,
          error: `拉取失败（已中止推送）：${pullRes.error}`,
        };
      }
      let remote: Task[] = [];
      if (pullRes.kind === "ok") {
        try {
          const data = JSON.parse(pullRes.content);
          if (Array.isArray(data)) remote = data as Task[];
        } catch {
          // 解析失败，视为无远程数据
        }
      }

      const { merged, pulled, toDeleteLocal } = mergeWithTombstones(
        "task",
        items,
        remote,
        tombstones
      );
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
      return { type: "tasks", pushed, pulled, merged, toDeleteLocal };
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
    // 所有同步函数通过 serialized 锁串行化，防止并发读写冲突
    syncTombstones: () => serialized(() => syncTombstones()),
    syncReflections: (items: Reflection[], tombstones: Tombstone[] = []) =>
      serialized(() => syncReflections(items, tombstones)),
    syncSessions: (items: Session[], tombstones: Tombstone[] = []) =>
      serialized(() => syncSessions(items, tombstones)),
    syncTasks: (items: Task[], tombstones: Tombstone[] = []) =>
      serialized(() => syncTasks(items, tombstones)),
  };
}
