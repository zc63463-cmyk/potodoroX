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
  getUnpushedEvents,
  removePushedEvents,
  upsertTombstones,
  type OutboxEvent,
  type Tombstone,
} from "@/services/outbox";
import { consumeEventsFrom, parseTime } from "@/services/event-consumer";

/** 事件同步结果（Phase 2 / append-only 事件流） */
export interface SyncEventsResult {
  pushed: number;
  pulled: number;
  processed: number;
  errors: number;
  error?: string;
}

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
  /** Phase 2: 事件流目录（append-only） */
  eventsDir: "pomodorox/events/",
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

// ---- PROPFIND XML 解析 ----

/**
 * 解析 WebDAV PROPFIND Depth:1 返回的 XML multistatus 响应，
 * 提取 href 子节点的路径部分（URL-decoded）。
 *
 * 返回的是 href 的完整 path 部分（以 "/" 开头，不含 host）。
 * 调用方需自行剥离目录前缀、筛选扩展名等。
 */
export function parsePropfindHrefs(xml: string): string[] {
  if (!xml || !xml.trim()) return [];

  // 优先用 DOMParser（浏览器 / happy-dom / jsdom 均支持）
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    // 命名空间可能是 "DAV:" 前缀 d 或 D。用本地名获取：
    const hrefs = Array.from(doc.getElementsByTagName("*"))
      .filter((el) => el.localName === "href" || el.nodeName.endsWith(":href"))
      .map((el) => el.textContent?.trim() ?? "")
      .filter((s) => s.length > 0)
      .map((s) => {
        try {
          return decodeURIComponent(s);
        } catch {
          return s;
        }
      });
    if (hrefs.length > 0) return hrefs;
  } catch {
    // DOMParser 不可用或解析失败，降级到 regex
  }

  // 降级：用正则提取 <*:href>...</*:href>
  const regex = /<[^>:]*:?href[^>]*>([^<]+)<\/[^>:]*:?href>/gi;
  const result: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(xml)) !== null) {
    const raw = m[1].trim();
    if (!raw) continue;
    try {
      result.push(decodeURIComponent(raw));
    } catch {
      result.push(raw);
    }
  }
  return result;
}

/**
 * 从 href 列表中提取指定目录下的文件名（过滤目录本身 + 非目标扩展名）。
 *
 * @param hrefs PROPFIND 返回的完整 href 数组
 * @param dirPath 目标目录（如 "pomodorox/events/"）
 * @param suffix 可选后缀过滤（如 ".json"）
 */
export function extractFileNamesFromHrefs(
  hrefs: string[],
  dirPath: string,
  suffix?: string
): string[] {
  const dir = dirPath.endsWith("/") ? dirPath : dirPath + "/";
  const names: string[] = [];
  for (const href of hrefs) {
    // href 可能是绝对（/dav/pomodorox/events/abc.json）或相对（pomodorox/events/abc.json）
    // 提取目标目录后的 basename
    const idx = href.indexOf(dir);
    if (idx === -1) continue;
    const tail = href.slice(idx + dir.length);
    if (!tail || tail === "" || tail.endsWith("/")) continue; // 是目录本身或子目录
    // 只取第一层 basename（不走更深层级）
    if (tail.includes("/")) continue;
    if (suffix && !tail.endsWith(suffix)) continue;
    names.push(tail);
  }
  return names;
}

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
  body?: string,
  opts?: { depth?: string }
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
  // Depth: 0 = 仅查询资源本身；Depth: 1 = 查询直接子资源（列目录）
  if (method === "PROPFIND") {
    headers["Depth"] = opts?.depth ?? "0";
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

/**
 * 严格校验远端拉回的事件对象是否是合法的 `OutboxEvent`。
 *
 * 必须同时满足：
 * 1. 基本字段 `eventId` / `type` / `entityType` / `entityId` / `timestamp` 均为非空字符串
 * 2. `type` 形如 `task.created` / `reflection.updated` / `session.updated` 等已知类型
 * 3. `type` 前缀与 `entityType` 一致（防止篡改绕过墓碑/版本保护）
 * 4. `payload` 为对象
 *
 * 校验失败的事件应被跳过并计入 `parseErrors`。
 */
export function isValidOutboxEvent(raw: unknown): raw is OutboxEvent {
  if (!raw || typeof raw !== "object") return false;
  const e = raw as Record<string, unknown>;
  if (typeof e.eventId !== "string" || e.eventId.length === 0) return false;
  if (typeof e.type !== "string" || e.type.length === 0) return false;
  if (typeof e.entityType !== "string" || e.entityType.length === 0)
    return false;
  if (typeof e.entityId !== "string" || e.entityId.length === 0) return false;
  if (typeof e.timestamp !== "string" || e.timestamp.length === 0) return false;
  if (
    e.payload === null ||
    typeof e.payload !== "object" ||
    Array.isArray(e.payload)
  )
    return false;

  const allowedTypes = new Set<string>([
    "task.created",
    "task.updated",
    "task.deleted",
    "reflection.created",
    "reflection.updated",
    "reflection.deleted",
    "session.created",
    "session.updated",
  ]);
  if (!allowedTypes.has(e.type)) return false;

  // type 前缀必须与 entityType 对齐：task.* ↔ task, reflection.* ↔ reflection, session.* ↔ session
  const prefix = e.type.split(".")[0];
  if (prefix !== e.entityType) return false;

  return true;
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
   * 拉取并解析 JSON 数组文件，将 JSON 解析失败也升级为 fatal：
   * - ok: 解析成功的数组（missing 和文件为空都返回 [] 且 kind=ok）
   * - fatal: HTTP 错误 / 网络异常 / JSON parse 失败 / 顶层非数组
   *
   * 把 parse 失败视为 fatal 是关键保护：远端文件可能损坏、被 Worker 代理返回成
   * HTML 错误页、或被部分写坏；若当作空数组继续 PUT，会用本地子集覆盖远端数据。
   */
  async function pullJsonArray<T>(
    path: string
  ): Promise<{ kind: "ok"; data: T[] } | { kind: "fatal"; error: string }> {
    const res = await pullFile(path);
    if (res.kind === "fatal") return { kind: "fatal", error: res.error };
    if (res.kind === "missing") return { kind: "ok", data: [] };
    // 空文件视为空数组（ok）
    const trimmed = res.content.trim();
    if (trimmed === "") return { kind: "ok", data: [] };
    try {
      const parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed)) {
        return {
          kind: "fatal",
          error: `远端 ${path} JSON 顶层不是数组`,
        };
      }
      return { kind: "ok", data: parsed as T[] };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        kind: "fatal",
        error: `解析 ${path} 失败（可能文件损坏）：${msg}`,
      };
    }
  }

  /**
   * 应用墓碑过滤的合并：使用模块级 mergeWithTombstones 实现
   */

  // ============================================================
  // Phase 2: 事件流同步（append-only / 多端并发安全）
  //
  // 每个 outbox 事件写入独立文件 pomodorox/events/{eventId}.json，
  // 文件不可变。两端同时同步各自上传不同 eventId → 无快照覆盖风险。
  // ============================================================

  /** PROPFIND Depth:1 列出目录下的文件名（只返回第一层） */
  async function listEvents(): Promise<
    { kind: "ok"; names: string[] } | { kind: "fatal"; error: string }
  > {
    if (!config.value) return { kind: "fatal", error: "WebDAV 未配置" };

    let xml = "";
    try {
      if (isTauri()) {
        xml = await invoke<string>("webdav_list", {
          url: config.value.url,
          username: config.value.username,
          password: config.value.password,
          path: REMOTE_PATHS.eventsDir,
        });
      } else {
        const res = await webProxyRequest(
          config.value,
          "PROPFIND",
          REMOTE_PATHS.eventsDir,
          undefined,
          { depth: "1" }
        );
        if (res.status === 404 || res.status === 409) {
          return { kind: "ok", names: [] };
        }
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          return {
            kind: "fatal",
            error: `PROPFIND HTTP ${res.status} ${body}`.trim(),
          };
        }
        xml = await res.text();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Tauri 404 -> 空字符串；其他异常 -> fatal
      if (msg.includes("404") || msg.includes("Not Found")) {
        return { kind: "ok", names: [] };
      }
      return { kind: "fatal", error: msg };
    }

    // 空响应（目录不存在）
    if (!xml.trim()) return { kind: "ok", names: [] };

    const hrefs = parsePropfindHrefs(xml);
    const names = extractFileNamesFromHrefs(
      hrefs,
      REMOTE_PATHS.eventsDir,
      ".json"
    );
    return { kind: "ok", names };
  }

  /** 删除远程文件（幂等，404 视为已删除）——供未来 GC 使用 */
  async function _deleteRemoteFile(path: string): Promise<boolean> {
    if (!config.value) return false;

    if (isTauri()) {
      try {
        await invoke("webdav_delete", {
          url: config.value.url,
          username: config.value.username,
          password: config.value.password,
          path,
        });
        return true;
      } catch (err) {
        console.warn("[WebDAV] 删除失败:", err);
        return false;
      }
    }

    try {
      const res = await webProxyRequest(config.value, "DELETE", path);
      return res.ok || res.status === 404;
    } catch (err) {
      console.warn("[WebDAV] 代理删除异常:", err);
      return false;
    }
  }
  void _deleteRemoteFile; // 暂未使用但保留接口

  /**
   * 推送本地 outbox 事件到 WebDAV（append-only）
   * 每个事件 PUT 到独立文件，不存在覆盖冲突。
   * 成功后从本地 outbox 移除。
   */
  async function pushLocalEvents(): Promise<{
    pushed: number;
    failed: number;
  }> {
    await ensureRemoteDir();
    // 确保 events 子目录存在
    if (isTauri() && config.value) {
      try {
        await invoke("webdav_mkcol", {
          url: config.value.url,
          username: config.value.username,
          password: config.value.password,
          path: REMOTE_PATHS.eventsDir,
        });
      } catch {
        /* already exists */
      }
    } else if (config.value) {
      try {
        await webProxyRequest(config.value, "MKCOL", REMOTE_PATHS.eventsDir);
      } catch {
        /* already exists */
      }
    }

    const events = await getUnpushedEvents();
    if (events.length === 0) return { pushed: 0, failed: 0 };

    let pushed = 0;
    let failed = 0;
    const pushedIds: string[] = [];
    for (const event of events) {
      const path = `${REMOTE_PATHS.eventsDir}${event.eventId}.json`;
      const ok = await pushFile(path, JSON.stringify(event, null, 2));
      if (ok) {
        pushed++;
        pushedIds.push(event.eventId);
      } else {
        failed++;
      }
    }
    if (pushedIds.length > 0) {
      await removePushedEvents(pushedIds);
    }
    return { pushed, failed };
  }

  /**
   * 从 WebDAV 拉取所有远程事件（PROPFIND + GET 每个文件）
   * 返回解析后的事件数组、读失败数和损坏数；调用方应把这些累加到 errors。
   *
   * - listEvents fatal：整体 fatal 中止
   * - 单个文件 GET fatal：fetchErrors++（不中断其他文件）
   * - 单个文件 JSON parse 失败 / 字段缺失：parseErrors++
   */
  async function pullRemoteEvents(): Promise<
    | {
        kind: "ok";
        events: OutboxEvent[];
        fetchErrors: number;
        parseErrors: number;
      }
    | { kind: "fatal"; error: string }
  > {
    const listRes = await listEvents();
    if (listRes.kind === "fatal") return listRes;
    if (listRes.names.length === 0) {
      return { kind: "ok", events: [], fetchErrors: 0, parseErrors: 0 };
    }

    const events: OutboxEvent[] = [];
    let fetchErrors = 0;
    let parseErrors = 0;
    for (const name of listRes.names) {
      const path = `${REMOTE_PATHS.eventsDir}${name}`;
      const res = await pullFile(path);
      if (res.kind === "fatal") {
        fetchErrors++;
        console.warn(`[WebDAV] 拉取事件 ${name} 失败: ${res.error}`);
        continue;
      }
      if (res.kind === "missing") continue;
      try {
        const parsed = JSON.parse(res.content);
        if (isValidOutboxEvent(parsed)) {
          events.push(parsed);
        } else {
          parseErrors++;
          console.warn(`[WebDAV] 事件 ${name} 字段缺失或非法，跳过`);
        }
      } catch (err) {
        parseErrors++;
        console.warn(`[WebDAV] 解析事件 ${name} 失败:`, err);
      }
    }
    return { kind: "ok", events, fetchErrors, parseErrors };
  }

  /**
   * 完整事件同步：push 本地 outbox → pull 远程 → consume。
   *
   * 这是多端并发安全的同步模式——
   * 两端同时同步各自写入不同 eventId 文件，互不覆盖。
   */
  async function syncEvents(): Promise<SyncEventsResult> {
    if (!config.value) {
      return {
        pushed: 0,
        pulled: 0,
        processed: 0,
        errors: 0,
        error: "WebDAV 未配置",
      };
    }
    if (!isAvailable.value) {
      return {
        pushed: 0,
        pulled: 0,
        processed: 0,
        errors: 0,
        error: isTauri() ? "WebDAV 不可用" : "请先配置 Worker 代理 URL",
      };
    }

    isSyncing.value = true;
    syncError.value = null;

    try {
      // Step 1: 推送本地事件
      const { pushed, failed } = await pushLocalEvents();

      // Step 2: 拉取远程事件
      const pullRes = await pullRemoteEvents();
      if (pullRes.kind === "fatal") {
        return {
          pushed,
          pulled: 0,
          processed: 0,
          errors: failed,
          error: `拉取远端事件失败：${pullRes.error}`,
        };
      }

      // Step 3: 消费事件（幂等 + 版本保护）
      const consumed = await consumeEventsFrom(pullRes.events);

      saveLastSync(new Date().toISOString());
      return {
        pushed,
        pulled: consumed.pulled,
        processed: consumed.processed,
        errors:
          failed + consumed.errors + pullRes.fetchErrors + pullRes.parseErrors,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "事件同步失败";
      syncError.value = msg;
      return { pushed: 0, pulled: 0, processed: 0, errors: 0, error: msg };
    } finally {
      isSyncing.value = false;
    }
  }

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
      const pullRes = await pullJsonArray<Tombstone>(REMOTE_PATHS.tombstones);
      if (pullRes.kind === "fatal") {
        // 读取或解析失败都禁止 PUT，避免以本地子集覆盖远端
        return {
          pushed: 0,
          pulled: 0,
          merged: local,
          error: `拉取墓碑失败（已中止推送）：${pullRes.error}`,
        };
      }
      const remote: Tombstone[] = pullRes.data;

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

      const pullRes = await pullJsonArray<Reflection>(REMOTE_PATHS.reflections);
      if (pullRes.kind === "fatal") {
        return {
          type: "reflections",
          pushed: 0,
          pulled: 0,
          error: `拉取失败（已中止推送）：${pullRes.error}`,
        };
      }
      const remote: Reflection[] = pullRes.data;

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

      const pullRes = await pullJsonArray<Session>(REMOTE_PATHS.sessions);
      if (pullRes.kind === "fatal") {
        return {
          type: "sessions",
          pushed: 0,
          pulled: 0,
          error: `拉取失败（已中止推送）：${pullRes.error}`,
        };
      }
      const remote: Session[] = pullRes.data;

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

      const pullRes = await pullJsonArray<Task>(REMOTE_PATHS.tasks);
      if (pullRes.kind === "fatal") {
        return {
          type: "tasks",
          pushed: 0,
          pulled: 0,
          error: `拉取失败（已中止推送）：${pullRes.error}`,
        };
      }
      const remote: Task[] = pullRes.data;

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
    // Phase 2: 事件流同步（推荐入口——多端并发安全）
    syncEvents: () => serialized(() => syncEvents()),
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
