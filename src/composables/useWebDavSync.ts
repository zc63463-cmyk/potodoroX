/**
 * WebDAV 同步 Composable
 *
 * - Tauri 桌面端：通过 Rust 命令直接访问 WebDAV
 * - Web 浏览器端：通过用户自部署的 Cloudflare Worker 代理访问 WebDAV（绕过 CORS）
 */

import { ref, computed } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { isTauri } from "@/utils/platform";
import { isOnline, probeOnline } from "@/utils/network";
import type { Reflection, Session, Task } from "@/types";
import { db } from "@/services/database";
import {
  getAllTombstones,
  getUnpushedEvents,
  getUnpushedCount,
  removePushedEvents,
  markProcessed,
  upsertTombstones,
  type OutboxEvent,
  type Tombstone,
} from "@/services/outbox";
import type { ConflictLogEntry } from "@/types";
import {
  consumeEventsFrom,
  parseTime,
  type ConsumeEventsResult,
} from "@/services/event-consumer";

/** 网络请求超时时间（毫秒） */
const FETCH_TIMEOUT_MS = 30000;

/** 带超时的 fetch，超时后自动 Abort（尊重外部 signal） */
async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit & { timeout?: number }
): Promise<Response> {
  const timeout = init?.timeout ?? FETCH_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  // 组合外部 signal：外部 abort 或超时都会触发取消
  const externalSignal = init?.signal;
  if (externalSignal) {
    externalSignal.addEventListener("abort", () => controller.abort(), {
      once: true,
    });
  }

  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    return res;
  } catch (err) {
    const isTimeout =
      err instanceof Error &&
      (err.name === "AbortError" || err.message?.includes("abort"));
    // 仅当不是外部 signal 触发时才包装为超时错误
    if (isTimeout && (!externalSignal || !externalSignal.aborted)) {
      throw new Error(`请求超时（${timeout}ms）`, { cause: err });
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** 事件同步结果（Phase 2 / append-only 事件流） */
export interface SyncEventsResult {
  pushed: number;
  pulled: number;
  processed: number;
  applied?: number;
  skipped?: number;
  skippedLocalNewer?: number;
  skippedTombstone?: number;
  alreadyProcessed?: number;
  errors: number;
  error?: string;
  /** 本次同步 GC 删除的过期事件文件数 */
  deleted?: number;
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
  readableDir: "pomodorox/readable/",
  readableReportsDir: "pomodorox/readable/reports/",
  readableSnapshotsDir: "pomodorox/readable/snapshots/",
  readableStatus: "pomodorox/readable/status.md",
  readableSummary: "pomodorox/readable/latest-summary.json",
  readableTasks: "pomodorox/readable/snapshots/tasks.md",
  readableReflections: "pomodorox/readable/snapshots/reflections.md",
  readableSessions: "pomodorox/readable/snapshots/sessions.md",
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

// ============================================================
// 冲突检测与处理（Phase 1 快照同步增强）
// ============================================================

/** 单个实体冲突记录 */
export interface ConflictRecord<T> {
  entityId: string;
  local: T;
  remote: T;
  winner: "local" | "remote";
  reason: string;
}

/** 冲突检测 + LWW 解决后的结果 */
export interface ConflictResolutionResult<T> {
  /** 解决冲突后的远程数组（用于后续合并） */
  resolvedRemote: T[];
  /** 检测到的冲突记录 */
  conflicts: ConflictRecord<T>[];
}

/**
 * 检测本地与远程之间的真正冲突：
 * 双方都在 lastSyncAt 之后发生了更新，才视为冲突。
 * 若 lastSyncAt 为空（首次同步），则不检测冲突，全部按正常合并处理。
 */
export function detectConflicts<T extends { id: string; updatedAt: string }>(
  local: T[],
  remote: T[],
  lastSyncAt: string | null
): Array<{ entityId: string; local: T; remote: T }> {
  if (!lastSyncAt) return [];
  const lastSyncMs = parseTime(lastSyncAt);
  if (!lastSyncMs) return [];

  const localMap = new Map<string, T>();
  local.forEach((item) => localMap.set(item.id, item));

  const conflicts: Array<{ entityId: string; local: T; remote: T }> = [];
  remote.forEach((r) => {
    const l = localMap.get(r.id);
    if (!l) return;
    const localMs = parseTime(l.updatedAt);
    const remoteMs = parseTime(r.updatedAt);
    if (localMs > lastSyncMs && remoteMs > lastSyncMs) {
      conflicts.push({ entityId: r.id, local: l, remote: r });
    }
  });
  return conflicts;
}

/**
 * 对检测到的冲突执行 Last-Write-Wins 解决：
 * - 比较 local.updatedAt 与 remote.updatedAt
 * - 返回每条冲突的获胜方与原因
 */
export function resolveConflictsLWW<
  T extends { id: string; updatedAt: string },
>(
  conflicts: Array<{ entityId: string; local: T; remote: T }>
): ConflictRecord<T>[] {
  return conflicts.map(({ entityId, local, remote }) => {
    const localMs = parseTime(local.updatedAt);
    const remoteMs = parseTime(remote.updatedAt);
    if (localMs >= remoteMs) {
      return {
        entityId,
        local,
        remote,
        winner: "local" as const,
        reason: `local updatedAt (${local.updatedAt}) >= remote updatedAt (${remote.updatedAt})`,
      };
    }
    return {
      entityId,
      local,
      remote,
      winner: "remote" as const,
      reason: `remote updatedAt (${remote.updatedAt}) > local updatedAt (${local.updatedAt})`,
    };
  });
}

/**
 * 将冲突解决应用到远程数组：
 * 对于本地获胜的冲突，用本地版本替换远程版本，
 * 确保后续 mergeWithTombstones 不会再次覆盖。
 */
export function applyConflictResolution<T extends { id: string }>(
  remote: T[],
  conflictRecords: ConflictRecord<T>[]
): T[] {
  if (conflictRecords.length === 0) return remote;
  const winnerMap = new Map<string, T>();
  conflictRecords.forEach((c) => {
    if (c.winner === "local") {
      winnerMap.set(c.entityId, c.local);
    }
  });
  return remote.map(
    (r) => winnerMap.get((r as unknown as { id: string }).id) ?? r
  );
}

/**
 * 生成冲突备份文件路径：
 * originalPath = "pomodorox/tasks.json" → "pomodorox/tasks.conflict-2026-05-19T12-30-00-000Z.json"
 */
export function generateConflictBackupPath(
  originalPath: string,
  timestamp: string
): string {
  const ts = timestamp.replace(/[:.]/g, "-");
  const idx = originalPath.lastIndexOf(".");
  if (idx === -1) return `${originalPath}.conflict-${ts}`;
  const base = originalPath.slice(0, idx);
  const ext = originalPath.slice(idx);
  return `${base}.conflict-${ts}${ext}`;
}

/**
 * 构建冲突备份 JSON 内容（包含所有冲突记录的完整快照）
 */
export function buildConflictBackupContent<T>(
  records: ConflictRecord<T>[],
  meta: { generatedAt: string; originalPath: string }
): string {
  const payload = {
    generatedAt: meta.generatedAt,
    originalPath: meta.originalPath,
    conflictCount: records.length,
    conflicts: records.map((r) => ({
      entityId: r.entityId,
      winner: r.winner,
      reason: r.reason,
      local: r.local,
      remote: r.remote,
    })),
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * 检查实体列表中是否存在未同步的变更（synced === false）
 */
export function hasUnsyncedChanges(
  items: Array<{ synced?: boolean }>
): boolean {
  return items.some((item) => item.synced === false);
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

/** UTF-8 安全的 btoa，用于 Basic Auth 头（浏览器原生 btoa 不支持非 Latin1 字符） */
function utf8Btoa(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function loadConfig(): WebDavConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.url && parsed.username) {
      const cfg = parsed as WebDavConfig;

      // 向后兼容：如果密码是旧 "v2:base64" 格式，自动解码回明文
      if (typeof cfg.password === "string" && cfg.password.startsWith("v2:")) {
        try {
          cfg.password = decodeURIComponent(atob(cfg.password.slice(3)));
        } catch {
          cfg.password = cfg.password.slice(3);
        }
      }

      // 防御性检查
      if (
        cfg.url.includes("/api/webdav-proxy?url=") ||
        cfg.url.includes("/api/webdav-proxy?t=")
      ) {
        console.error("[WebDAV] 配置中的 URL 包含代理路径，清除配置:", cfg.url);
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return cfg;
    }
  } catch {
    // ignore
  }
  return null;
}

/** 密码明文存储——简单可靠，最优先 */
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

/** 超过此天数未同步则触发快照兜底（GC 保留 30 天，留 5 天安全边际） */
const SNAPSHOT_FALLBACK_DAYS = 25;

function shouldTriggerSnapshotFallback(now = Date.now()): boolean {
  const last = loadLastSync();
  if (!last) return false; // 首次同步，无历史事件需要保护
  const days = (now - new Date(last).getTime()) / (1000 * 60 * 60 * 24);
  return days > SNAPSHOT_FALLBACK_DAYS;
}

/** 拼接完整 WebDAV URL */
function joinUrl(base: string, path: string): string {
  const trimmedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const trimmedPath = path.startsWith("/") ? path.slice(1) : path;
  const result = `${trimmedBase}/${trimmedPath}`;
  // 防御性检查：防止嵌套代理 URL
  if (
    result.includes("/api/webdav-proxy?url=") ||
    result.includes("/api/webdav-proxy?t=")
  ) {
    console.error("[WebDAV] 检测到嵌套代理 URL，可能是配置错误:", result);
    throw new Error("嵌套代理 URL: 服务器地址配置错误");
  }
  return result;
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
  // base64 编码 target URL，绕过 Vercel WAF 对 ?url=https://... 的拦截
  const encodedTarget = encodeURIComponent(btoa(targetUrl));
  const reqUrl = `${proxy}?t=${encodedTarget}`;
  const auth = utf8Btoa(`${cfg.username}:${cfg.password}`);
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
    // 根据文件扩展名推断 Content-Type，避免坚果云因类型不匹配返回 400
    const ext = path.split(".").pop()?.toLowerCase() ?? "";
    headers["Content-Type"] =
      ext === "md" || ext === "txt"
        ? "text/plain; charset=utf-8"
        : "application/json; charset=utf-8";
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const shouldTunnelMethod = method === "PROPFIND" || method === "MKCOL";
  if (shouldTunnelMethod) {
    return fetchWithTimeout(reqUrl, {
      method: "POST",
      headers: {
        ...headers,
        "X-HTTP-Method-Override": method,
      },
      body: finalBody,
    });
  }

  const directResponse = await fetchWithTimeout(reqUrl, {
    method,
    headers,
    body: finalBody,
  });

  // Some Vercel edges/browsers reject WebDAV extension methods before the
  // serverless function can proxy them. If the 405 did not come from upstream,
  // retry through a normal POST and let the proxy forward the real method.
  if (
    directResponse.status !== 405 ||
    directResponse.headers.get("X-Upstream-Status")
  ) {
    return directResponse;
  }

  return fetchWithTimeout(reqUrl, {
    method: "POST",
    headers: {
      ...headers,
      "X-HTTP-Method-Override": method,
    },
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
    "session.deleted",
  ]);
  if (!allowedTypes.has(e.type)) return false;

  // type 前缀必须与 entityType 对齐：task.* ↔ task, reflection.* ↔ reflection, session.* ↔ session
  const prefix = e.type.split(".")[0];
  if (prefix !== e.entityType) return false;

  return true;
}

function safeText(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\r?\n/g, " ").trim() || "-";
}

function formatReadableDate(value: string | null | undefined): string {
  if (!value) return "-";
  const ms = parseTime(value);
  if (!ms) return value;
  return new Date(ms).toLocaleString();
}

function slugTimestamp(value: string): string {
  return value.replace(/[:.]/g, "-");
}

function renderTasksSnapshot(tasks: Task[], generatedAt: string): string {
  const lines = [
    "# PomodoroX Tasks Snapshot",
    "",
    `Generated at: ${formatReadableDate(generatedAt)}`,
    `Total tasks: ${tasks.length}`,
    "",
    "| Title | Status | Priority | Updated | Due |",
    "| --- | --- | --- | --- | --- |",
  ];
  for (const task of tasks) {
    lines.push(
      `| ${safeText(task.title)} | ${safeText(task.status)} | ${safeText(
        task.priority
      )} | ${formatReadableDate(task.updatedAt)} | ${safeText(task.dueDate)} |`
    );
  }
  return lines.join("\n") + "\n";
}

function renderReflectionsSnapshot(
  reflections: Reflection[],
  generatedAt: string
): string {
  const lines = [
    "# PomodoroX Reflections Snapshot",
    "",
    `Generated at: ${formatReadableDate(generatedAt)}`,
    `Total reflections: ${reflections.length}`,
    "",
    "| Date | Mood | Updated | Content |",
    "| --- | --- | --- | --- |",
  ];
  for (const reflection of reflections) {
    lines.push(
      `| ${safeText(reflection.date)} | ${safeText(
        reflection.mood
      )} | ${formatReadableDate(reflection.updatedAt)} | ${safeText(
        reflection.content
      ).slice(0, 120)} |`
    );
  }
  return lines.join("\n") + "\n";
}

function renderSessionsSnapshot(
  sessions: Session[],
  generatedAt: string
): string {
  const lines = [
    "# PomodoroX Sessions Snapshot",
    "",
    `Generated at: ${formatReadableDate(generatedAt)}`,
    `Total sessions: ${sessions.length}`,
    "",
    "| Started | Type | Duration(min) | Completed | Updated |",
    "| --- | --- | ---: | --- | --- |",
  ];
  for (const session of sessions) {
    lines.push(
      `| ${formatReadableDate(session.startedAt)} | ${safeText(
        session.type
      )} | ${Math.round(session.duration / 60)} | ${
        session.completed ? "yes" : "no"
      } | ${formatReadableDate(session.updatedAt)} |`
    );
  }
  return lines.join("\n") + "\n";
}

export interface ReadableSyncSummary {
  generatedAt: string;
  device: string;
  pushed: number;
  pulled: number;
  processed: number;
  applied: number;
  skipped: number;
  skippedLocalNewer: number;
  skippedTombstone: number;
  alreadyProcessed: number;
  pushErrors: number;
  fetchErrors: number;
  parseErrors: number;
  consumeErrors: number;
  errors: number;
  pendingOutbox: number;
  totalTasks: number;
  totalReflections: number;
  totalSessions: number;
}

export function renderReadableStatus(summary: ReadableSyncSummary): string {
  const health =
    summary.errors === 0
      ? "Healthy"
      : "Warning - some sync items need attention";
  return [
    "# PomodoroX Sync Status",
    "",
    `Last generated: ${formatReadableDate(summary.generatedAt)}`,
    `Device: ${summary.device}`,
    `Health: ${health}`,
    "",
    "## Result",
    "",
    `Pushed: ${summary.pushed}`,
    `Pulled: ${summary.pulled}`,
    `Processed: ${summary.processed}`,
    `Applied: ${summary.applied}`,
    `Skipped: ${summary.skipped}`,
    `Errors: ${summary.errors}`,
    `Pending local outbox: ${summary.pendingOutbox}`,
    "",
    "## Skip Reasons",
    "",
    `Local newer: ${summary.skippedLocalNewer}`,
    `Tombstone newer: ${summary.skippedTombstone}`,
    `Already processed: ${summary.alreadyProcessed}`,
    "",
    "## Error Sources",
    "",
    `Push errors: ${summary.pushErrors}`,
    `Remote fetch errors: ${summary.fetchErrors}`,
    `Remote parse errors: ${summary.parseErrors}`,
    `Consume errors: ${summary.consumeErrors}`,
    "",
    "## Local Snapshot Counts",
    "",
    `Tasks: ${summary.totalTasks}`,
    `Reflections: ${summary.totalReflections}`,
    `Sessions: ${summary.totalSessions}`,
    "",
    "## Notes",
    "",
    "Skipped events are normal when local data is newer or a tombstone prevents old data from returning.",
    "The canonical sync source remains pomodorox/events/*.json; readable files are diagnostics only.",
    "",
  ].join("\n");
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

  async function testConnection(): Promise<{ ok: boolean; error?: string }> {
    if (!config.value) return { ok: false, error: "WebDAV 未配置" };

    if (isTauri()) {
      try {
        const ok = await invoke<boolean>("webdav_test", {
          url: config.value.url,
          username: config.value.username,
          password: config.value.password,
        });
        return { ok, error: ok ? undefined : "Tauri WebDAV 连接失败" };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[WebDAV] 连接测试失败:", err);
        return { ok: false, error: msg };
      }
    }

    // Web 端：通过代理发一个 PROPFIND 到实际使用的 pomodorox/ 目录
    // 根路径可能 207 但子路径 400（如 URL 缺少 /dav/），所以测实际路径更可靠
    try {
      const res = await webProxyRequest(
        config.value,
        "PROPFIND",
        "pomodorox/",
        undefined,
        {
          depth: "0",
        }
      );

      // 尝试读取响应体获取详细错误
      let errorBody = "";
      try {
        errorBody = await res.text();
        // 如果是 JSON 错误响应，提取 message
        try {
          const parsed = JSON.parse(errorBody);
          if (parsed.error) errorBody = parsed.error;
          if (parsed.detail) errorBody += " — " + parsed.detail;
        } catch {
          // 不是 JSON，保留原始文本（最多 500 字）
          errorBody = errorBody.slice(0, 500);
        }
      } catch {
        // 无法读取 body
      }

      if (res.status >= 200 && res.status < 400) {
        return { ok: true };
      }

      // 502 = 代理层 body 丢失（platform-level issue）
      if (res.status === 502 || res.status === 400) {
        return {
          ok: false,
          error:
            `代理请求失败 (HTTP ${res.status})` +
            (errorBody ? `: ${errorBody}` : ""),
        };
      }

      return {
        ok: false,
        error:
          `WebDAV 服务器返回 HTTP ${res.status}` +
          (errorBody ? `: ${errorBody}` : "，请检查地址和认证信息"),
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[WebDAV] 代理连接测试失败:", err);
      return { ok: false, error: msg };
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

    let xml: string;
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

  /** 删除远程文件（幂等，404 视为已删除） */
  async function deleteRemoteFile(path: string): Promise<boolean> {
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
  void deleteRemoteFile;

  /** 批量推送时每批最大事件数 */
  const BATCH_SIZE = 20;

  /**
   * 推送本地 outbox 事件到 WebDAV（append-only）
   *
   * 批量优化：将事件打包为 JSON 数组上传，每批最多 BATCH_SIZE 个。
   * - 单事件：保持旧格式（对象 JSON），向后兼容
   * - 多事件：数组 JSON，文件名带 batch- 前缀
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
    const datePrefix = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

    // 分批处理
    for (let i = 0; i < events.length; i += BATCH_SIZE) {
      const batch = events.slice(i, i + BATCH_SIZE);
      const isSingle = batch.length === 1;

      // 单事件保持旧格式（向后兼容），多事件用 batch- 前缀
      // batch ID 用首个事件的 eventId，确保重试时文件名不变（幂等）
      const path = isSingle
        ? `${REMOTE_PATHS.eventsDir}${datePrefix}-${batch[0].eventId}.json`
        : `${REMOTE_PATHS.eventsDir}batch-${datePrefix}-${batch[0].eventId}.json`;
      const content = JSON.stringify(isSingle ? batch[0] : batch, null, 2);

      // 指数退避重试：最多 3 次（1s / 2s / 4s）
      let ok = false;
      let attempts = 0;
      const maxAttempts = 3;
      while (!ok && attempts < maxAttempts) {
        ok = await pushFile(path, content);
        attempts++;
        if (!ok && attempts < maxAttempts) {
          const delay = Math.min(1000 * Math.pow(2, attempts - 1), 8000);
          await new Promise((r) => setTimeout(r, delay));
        }
      }

      if (ok) {
        pushed += batch.length;
        pushedIds.push(...batch.map((e) => e.eventId));
      } else {
        failed += batch.length;
        console.warn(
          `[WebDAV] 批量推送失败（已重试 ${maxAttempts} 次，${batch.length} 个事件）`
        );
      }
    }

    if (pushedIds.length > 0) {
      await removePushedEvents(pushedIds);
      // 同时标记为已处理，防止本设备下次拉取时重复消费
      for (const id of pushedIds) {
        await markProcessed(id);
      }
    }
    return { pushed, failed };
  }

  async function ensureRemoteDirs(paths: string[]): Promise<void> {
    for (const path of paths) {
      if (isTauri() && config.value) {
        try {
          await invoke("webdav_mkcol", {
            url: config.value.url,
            username: config.value.username,
            password: config.value.password,
            path,
          });
        } catch {
          /* directory may already exist */
        }
      } else if (config.value) {
        try {
          await webProxyRequest(config.value, "MKCOL", path);
        } catch {
          /* directory may already exist */
        }
      }
    }
  }

  async function publishReadableSyncFiles(params: {
    generatedAt: string;
    pushed: number;
    pushErrors: number;
    fetchErrors: number;
    parseErrors: number;
    consumed: ConsumeEventsResult;
    totalErrors: number;
  }): Promise<void> {
    try {
      await ensureRemoteDirs([
        REMOTE_PATHS.readableDir,
        REMOTE_PATHS.readableReportsDir,
        REMOTE_PATHS.readableSnapshotsDir,
      ]);

      const [tasks, reflections, sessions, pendingOutbox] = await Promise.all([
        db.getAllTasks(),
        db.getAllReflections(),
        db.getAllSessions(),
        getUnpushedCount(),
      ]);
      const summary: ReadableSyncSummary = {
        generatedAt: params.generatedAt,
        device:
          typeof navigator !== "undefined" && navigator.userAgent
            ? navigator.userAgent
            : isTauri()
              ? "tauri"
              : "web",
        pushed: params.pushed,
        pulled: params.consumed.pulled,
        processed: params.consumed.processed,
        applied: params.consumed.applied,
        skipped: params.consumed.skipped,
        skippedLocalNewer: params.consumed.skippedLocalNewer,
        skippedTombstone: params.consumed.skippedTombstone,
        alreadyProcessed: params.consumed.alreadyProcessed,
        pushErrors: params.pushErrors,
        fetchErrors: params.fetchErrors,
        parseErrors: params.parseErrors,
        consumeErrors: params.consumed.errors,
        errors: params.totalErrors,
        pendingOutbox,
        totalTasks: tasks.length,
        totalReflections: reflections.length,
        totalSessions: sessions.length,
      };
      const status = renderReadableStatus(summary);
      const reportPath = `${REMOTE_PATHS.readableReportsDir}${slugTimestamp(
        params.generatedAt
      )}.md`;

      const writes = await Promise.all([
        pushFile(REMOTE_PATHS.readableStatus, status),
        pushFile(
          REMOTE_PATHS.readableSummary,
          JSON.stringify(summary, null, 2)
        ),
        pushFile(reportPath, status),
        pushFile(
          REMOTE_PATHS.readableTasks,
          renderTasksSnapshot(tasks, params.generatedAt)
        ),
        pushFile(
          REMOTE_PATHS.readableReflections,
          renderReflectionsSnapshot(reflections, params.generatedAt)
        ),
        pushFile(
          REMOTE_PATHS.readableSessions,
          renderSessionsSnapshot(sessions, params.generatedAt)
        ),
      ]);
      if (writes.some((ok) => !ok)) {
        console.warn("[WebDAV] 部分可读同步报告写入失败（不影响主同步）");
      }
    } catch (err) {
      console.warn("[WebDAV] 写入可读同步报告失败（不影响主同步）:", err);
    }
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

    // 并发批量拉取（每批 4 个文件，平衡速度与服务器压力）
    const CONCURRENT_BATCH_SIZE = 4;
    for (let i = 0; i < listRes.names.length; i += CONCURRENT_BATCH_SIZE) {
      const batch = listRes.names.slice(i, i + CONCURRENT_BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map((name) => pullFile(`${REMOTE_PATHS.eventsDir}${name}`))
      );
      for (let j = 0; j < batch.length; j++) {
        const name = batch[j];
        const res = batchResults[j];
        if (res.kind === "fatal") {
          fetchErrors++;
          console.warn(`[WebDAV] 拉取事件 ${name} 失败: ${res.error}`);
          continue;
        }
        if (res.kind === "missing") continue;
        try {
          const parsed = JSON.parse(res.content);

          // 批量打包格式：JSON 数组
          if (Array.isArray(parsed)) {
            const batchEvents = parsed.filter((item) => {
              if (!isValidOutboxEvent(item)) {
                parseErrors++;
                console.warn(
                  `[WebDAV] 批量文件 ${name} 内事件 ${(item as Record<string, unknown>)?.eventId ?? "?"} 字段缺失或非法，跳过`
                );
                return false;
              }
              return true;
            });
            events.push(...batchEvents);
          } else if (isValidOutboxEvent(parsed)) {
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
    }
    return { kind: "ok", events, fetchErrors, parseErrors };
  }

  /** 远程事件文件保留天数 */
  const EVENT_RETENTION_DAYS = 30;

  /**
   * 压缩远程 events/ 目录：删除超过保留期的旧事件文件。
   * 新格式文件名含日期前缀（YYYY-MM-DD-eventId.json），便于按日期筛选。
   * 旧格式文件名（eventId.json）无法判断日期，保留不动。
   *
   * 失败不影响主同步，仅记录日志。
   */
  async function compactRemoteEvents(): Promise<{
    deleted: number;
    errors: number;
  }> {
    const listRes = await listEvents();
    if (listRes.kind !== "ok") return { deleted: 0, errors: 0 };

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - EVENT_RETENTION_DAYS);
    const cutoffStr = cutoff.toISOString().slice(0, 10); // "YYYY-MM-DD"

    let deleted = 0;
    let errors = 0;

    for (const name of listRes.names) {
      // 单事件格式: "2024-05-19-abc123.json"
      // 批量格式: "batch-2024-05-19-abc123.json"
      const dateMatch = name.match(/^(?:batch-)?(\d{4}-\d{2}-\d{2})-/);
      if (!dateMatch) continue; // 旧格式或未知格式，保留

      const fileDate = dateMatch[1];
      if (fileDate < cutoffStr) {
        const path = `${REMOTE_PATHS.eventsDir}${name}`;
        const ok = await deleteRemoteFile(path);
        if (ok) {
          deleted++;
        } else {
          errors++;
          console.warn(`[WebDAV] GC 删除旧事件失败: ${name}`);
        }
      }
    }

    if (deleted > 0) {
      if (import.meta.env.DEV)
        console.log(`[WebDAV] GC 完成: 删除 ${deleted} 个过期事件文件`);
    }
    return { deleted, errors };
  }

  /**
   * 完整事件同步：push 本地 outbox → pull 远程 → consume → GC。
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
    if (!isOnline()) {
      return {
        pushed: 0,
        pulled: 0,
        processed: 0,
        errors: 0,
        error: "网络离线，跳过同步",
      };
    }

    // 二次确认：navigator.onLine 可能误判（连上无 Internet 的 WiFi）
    const actuallyOnline = await probeOnline();
    if (!actuallyOnline) {
      return {
        pushed: 0,
        pulled: 0,
        processed: 0,
        errors: 0,
        error: "无法连接到同步服务器，跳过同步",
      };
    }

    isSyncing.value = true;
    syncError.value = null;

    try {
      // ---- 快照同步兜底（长期离线设备）----
      if (shouldTriggerSnapshotFallback()) {
        console.warn(
          `[WebDAV] 检测到长期离线（>${SNAPSHOT_FALLBACK_DAYS}天），触发快照同步兜底`
        );

        const tombstones = await getAllTombstones();

        // 1. 墓碑同步（必须先于实体同步）
        const tsRes = await syncTombstones();
        if (tsRes.error) {
          console.warn("[WebDAV] 快照兜底：墓碑同步失败", tsRes.error);
        }

        // 2. 实体快照同步
        const [tasks, reflections, sessions] = await Promise.all([
          db.getAllTasks(),
          db.getAllReflections(),
          db.getAllSessions(),
        ]);

        const taskRes = await syncTasks(tasks, tombstones, {
          skipLastSync: true,
        });
        if (taskRes.merged) {
          for (const task of taskRes.merged) await db.upsertTask(task);
          for (const id of taskRes.toDeleteLocal ?? []) await db.deleteTask(id);
        }
        if (taskRes.error) {
          console.warn("[WebDAV] 快照兜底：任务同步失败", taskRes.error);
        }

        const reflectionRes = await syncReflections(reflections, tombstones, {
          skipLastSync: true,
        });
        if (reflectionRes.merged) {
          for (const r of reflectionRes.merged) await db.upsertReflection(r);
          for (const id of reflectionRes.toDeleteLocal ?? [])
            await db.deleteReflection(id);
        }
        if (reflectionRes.error) {
          console.warn("[WebDAV] 快照兜底：反思同步失败", reflectionRes.error);
        }

        const sessionRes = await syncSessions(sessions, tombstones, {
          skipLastSync: true,
        });
        if (sessionRes.merged) {
          for (const s of sessionRes.merged) await db.upsertSession(s);
          for (const id of sessionRes.toDeleteLocal ?? [])
            await db.deleteSession(id);
        }
        if (sessionRes.error) {
          console.warn("[WebDAV] 快照兜底：会话同步失败", sessionRes.error);
        }

        if (import.meta.env.DEV) console.log("[WebDAV] 快照同步兜底完成");
      }

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

      const generatedAt = new Date().toISOString();
      const totalErrors =
        failed + consumed.errors + pullRes.fetchErrors + pullRes.parseErrors;

      await publishReadableSyncFiles({
        generatedAt,
        pushed,
        pushErrors: failed,
        fetchErrors: pullRes.fetchErrors,
        parseErrors: pullRes.parseErrors,
        consumed,
        totalErrors,
      });

      // Step 4: 压缩过期事件（尽力而为，不影响主结果）
      let deleted = 0;
      try {
        const gc = await compactRemoteEvents();
        deleted = gc.deleted;
        // 远程旧事件已删除，清理对应的本地 processed 记录防止无限增长
        if (deleted > 0) {
          await db.clearProcessedEvents();
        }
      } catch (err) {
        console.warn("[WebDAV] 事件压缩失败:", err);
      }

      // 所有副作用完成后才保存 lastSync，确保下次兜底同步判断准确
      saveLastSync(generatedAt);

      return {
        pushed,
        pulled: consumed.pulled,
        processed: consumed.processed,
        applied: consumed.applied,
        skipped: consumed.skipped,
        skippedLocalNewer: consumed.skippedLocalNewer,
        skippedTombstone: consumed.skippedTombstone,
        alreadyProcessed: consumed.alreadyProcessed,
        errors: totalErrors,
        deleted,
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

  /**
   * 快照同步通用冲突处理：
   * 1. 检测冲突（双方都在 lastSyncAt 后更新）
   * 2. LWW 解决冲突，生成备份内容
   * 3. 推送备份文件到 WebDAV
   * 4. 将冲突记录写入本地数据库
   *
   * 返回解决后的远程数组 + 冲突数量。
   */
  async function handleSnapshotConflicts<
    T extends { id: string; updatedAt: string },
  >(
    entityType: "task" | "reflection" | "session",
    local: T[],
    remote: T[],
    remotePath: string
  ): Promise<{ resolvedRemote: T[]; conflictCount: number }> {
    const rawConflicts = detectConflicts(local, remote, lastSyncAt.value);
    if (rawConflicts.length === 0) {
      return { resolvedRemote: remote, conflictCount: 0 };
    }

    const conflictRecords = resolveConflictsLWW(rawConflicts);
    const resolvedRemote = applyConflictResolution(remote, conflictRecords);

    // 推送冲突备份到 WebDAV（失败不影响主同步）
    try {
      const backupPath = generateConflictBackupPath(
        remotePath,
        new Date().toISOString()
      );
      const backupContent = buildConflictBackupContent(conflictRecords, {
        generatedAt: new Date().toISOString(),
        originalPath: remotePath,
      });
      const backupOk = await pushFile(backupPath, backupContent);
      if (!backupOk) {
        console.warn("[WebDAV] 冲突备份推送失败:", backupPath);
      }
    } catch (err) {
      console.warn("[WebDAV] 冲突备份异常:", err);
    }

    // 写入本地冲突日志（失败不影响主同步）
    try {
      for (const record of conflictRecords) {
        const entry: Omit<ConflictLogEntry, "id"> = {
          entityType,
          entityId: record.entityId,
          localUpdatedAt: record.local.updatedAt,
          remoteUpdatedAt: record.remote.updatedAt,
          resolvedAt: new Date().toISOString(),
          resolution: record.winner === "local" ? "local_wins" : "remote_wins",
          localSnapshot: JSON.stringify(record.local),
          remoteSnapshot: JSON.stringify(record.remote),
        };
        await db.recordSyncConflict(entry);
      }
    } catch (err) {
      console.warn("[WebDAV] 冲突日志写入失败:", err);
    }

    return { resolvedRemote, conflictCount: conflictRecords.length };
  }

  /** 同步反思 */
  async function syncReflections(
    items: Reflection[],
    tombstones: Tombstone[] = [],
    opts?: { skipLastSync?: boolean }
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

    const previousSyncing = isSyncing.value;
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
      let remote: Reflection[] = pullRes.data;

      // 冲突检测与解决
      const { resolvedRemote, conflictCount } = await handleSnapshotConflicts(
        "reflection",
        items,
        remote,
        REMOTE_PATHS.reflections
      );
      remote = resolvedRemote;

      const { merged, pulled, toDeleteLocal } = mergeWithTombstones(
        "reflection",
        items,
        remote,
        tombstones
      );

      // 增量优化：若本地无变更、无冲突、无远端新数据，跳过推送
      const shouldSkipPush =
        !hasUnsyncedChanges(items) && conflictCount === 0 && pulled === 0;

      if (!shouldSkipPush) {
        const pushOk = await pushFile(
          REMOTE_PATHS.reflections,
          JSON.stringify(merged, null, 2)
        );
        if (!pushOk) {
          return {
            type: "reflections",
            pushed: 0,
            pulled,
            error: "推送数据到 WebDAV 失败",
          };
        }
      }
      const pushed = shouldSkipPush ? 0 : merged.length;

      if (!opts?.skipLastSync) saveLastSync(new Date().toISOString());
      return { type: "reflections", pushed, pulled, merged, toDeleteLocal };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "同步失败";
      syncError.value = msg;
      return { type: "reflections", pushed: 0, pulled: 0, error: msg };
    } finally {
      isSyncing.value = previousSyncing;
    }
  }

  /** 同步会话 */
  async function syncSessions(
    items: Session[],
    tombstones: Tombstone[] = [],
    opts?: { skipLastSync?: boolean }
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

    const previousSyncing = isSyncing.value;
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
      let remote: Session[] = pullRes.data;

      // 冲突检测与解决
      const { resolvedRemote, conflictCount } = await handleSnapshotConflicts(
        "session",
        items,
        remote,
        REMOTE_PATHS.sessions
      );
      remote = resolvedRemote;

      const { merged, pulled, toDeleteLocal } = mergeWithTombstones(
        "session",
        items,
        remote,
        tombstones
      );

      // 增量优化：若本地无变更、无冲突、无远端新数据，跳过推送
      const shouldSkipPush =
        !hasUnsyncedChanges(items) && conflictCount === 0 && pulled === 0;

      if (!shouldSkipPush) {
        const pushOk = await pushFile(
          REMOTE_PATHS.sessions,
          JSON.stringify(merged, null, 2)
        );
        if (!pushOk) {
          return {
            type: "sessions",
            pushed: 0,
            pulled,
            error: "推送数据到 WebDAV 失败",
          };
        }
      }
      const pushed = shouldSkipPush ? 0 : merged.length;

      if (!opts?.skipLastSync) saveLastSync(new Date().toISOString());
      return { type: "sessions", pushed, pulled, merged, toDeleteLocal };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "同步失败";
      syncError.value = msg;
      return { type: "sessions", pushed: 0, pulled: 0, error: msg };
    } finally {
      isSyncing.value = previousSyncing;
    }
  }

  /** 同步任务 */
  async function syncTasks(
    items: Task[],
    tombstones: Tombstone[] = [],
    opts?: { skipLastSync?: boolean }
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

    const previousSyncing = isSyncing.value;
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
      let remote: Task[] = pullRes.data;

      // 冲突检测与解决
      const { resolvedRemote, conflictCount } = await handleSnapshotConflicts(
        "task",
        items,
        remote,
        REMOTE_PATHS.tasks
      );
      remote = resolvedRemote;

      const { merged, pulled, toDeleteLocal } = mergeWithTombstones(
        "task",
        items,
        remote,
        tombstones
      );

      // 增量优化：若本地无变更、无冲突、无远端新数据，跳过推送
      const shouldSkipPush =
        !hasUnsyncedChanges(items) && conflictCount === 0 && pulled === 0;

      if (!shouldSkipPush) {
        const pushOk = await pushFile(
          REMOTE_PATHS.tasks,
          JSON.stringify(merged, null, 2)
        );
        if (!pushOk) {
          return {
            type: "tasks",
            pushed: 0,
            pulled,
            error: "推送数据到 WebDAV 失败",
          };
        }
      }
      const pushed = shouldSkipPush ? 0 : merged.length;

      if (!opts?.skipLastSync) saveLastSync(new Date().toISOString());
      return { type: "tasks", pushed, pulled, merged, toDeleteLocal };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "同步失败";
      syncError.value = msg;
      return { type: "tasks", pushed: 0, pulled: 0, error: msg };
    } finally {
      isSyncing.value = previousSyncing;
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
    // 测试钩子（不用于生产代码）
    __shouldTriggerSnapshotFallback: shouldTriggerSnapshotFallback,
  };
}
