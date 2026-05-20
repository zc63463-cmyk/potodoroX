// ============================================================
// useWebDavSync 网络集成测试
// 覆盖：testConnection、syncEvents 错误路径与正常流程
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- hoisted mocks ----
const mockFetch = vi.hoisted(() => vi.fn());
(globalThis as any).fetch = mockFetch;

const mockIsTauri = vi.hoisted(() => vi.fn().mockReturnValue(false));
vi.mock("@/utils/platform", () => ({ isTauri: mockIsTauri }));

const mockIsOnline = vi.hoisted(() => vi.fn().mockReturnValue(true));
const mockProbeOnline = vi.hoisted(() => vi.fn().mockResolvedValue(true));
vi.mock("@/utils/network", () => ({
  isOnline: mockIsOnline,
  probeOnline: mockProbeOnline,
}));

const mockGetUnpushedEvents = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const mockRemovePushedEvents = vi.hoisted(() =>
  vi.fn().mockResolvedValue(undefined)
);
const mockMarkProcessed = vi.hoisted(() =>
  vi.fn().mockResolvedValue(undefined)
);
const mockGetUnpushedCount = vi.hoisted(() => vi.fn().mockResolvedValue(0));
const mockGetAllTombstones = vi.hoisted(() => vi.fn().mockResolvedValue([]));

vi.mock("@/services/outbox", () => ({
  getUnpushedEvents: mockGetUnpushedEvents,
  removePushedEvents: mockRemovePushedEvents,
  markProcessed: mockMarkProcessed,
  getUnpushedCount: mockGetUnpushedCount,
  getAllTombstones: mockGetAllTombstones,
  upsertTombstones: vi.fn().mockResolvedValue(undefined),
}));

const mockDb = vi.hoisted(() => ({
  getAllTasks: vi.fn().mockResolvedValue([]),
  getAllReflections: vi.fn().mockResolvedValue([]),
  getAllSessions: vi.fn().mockResolvedValue([]),
  upsertTask: vi.fn().mockResolvedValue(undefined),
  upsertReflection: vi.fn().mockResolvedValue(undefined),
  upsertSession: vi.fn().mockResolvedValue(undefined),
  deleteTask: vi.fn().mockResolvedValue(undefined),
  deleteReflection: vi.fn().mockResolvedValue(undefined),
  deleteSession: vi.fn().mockResolvedValue(undefined),
  clearProcessedEvents: vi.fn().mockResolvedValue(undefined),
  recordSyncConflict: vi.fn().mockResolvedValue({}),
  getSyncConflicts: vi.fn().mockResolvedValue([]),
  clearSyncConflicts: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/services/database", () => ({ db: mockDb }));

const mockConsumeEventsFrom = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    pulled: 0,
    processed: 0,
    applied: 0,
    skipped: 0,
    skippedLocalNewer: 0,
    skippedTombstone: 0,
    alreadyProcessed: 0,
    errors: 0,
  })
);

vi.mock("@/services/event-consumer", async () => {
  const actual = await vi.importActual<
    typeof import("@/services/event-consumer")
  >("@/services/event-consumer");
  return {
    ...actual,
    consumeEventsFrom: mockConsumeEventsFrom,
  };
});

const { useWebDavSync } = await import("./useWebDavSync");

// ---- helpers ----

function createResponse(
  status: number,
  body: string,
  headers?: Record<string, string>
): Response {
  return new Response(body, { status, headers });
}

const emptyPropfindXml = `<?xml version="1.0" encoding="utf-8"?>
<D:multistatus xmlns:D="DAV:">
  <D:response><D:href>/dav/pomodorox/events/</D:href></D:response>
</D:multistatus>`;

/** 默认 fetch mock：覆盖 WebDAV 同步常用的方法 */
function defaultMockFetch(
  _url: string | URL | Request,
  init?: RequestInit
): Promise<Response> {
  const method = (init?.method || "GET").toUpperCase();
  const override = (init?.headers as Record<string, string> | undefined)?.[
    "X-HTTP-Method-Override"
  ];
  const actualMethod = override || method;

  if (actualMethod === "PROPFIND") {
    return Promise.resolve(createResponse(207, emptyPropfindXml));
  }
  if (actualMethod === "MKCOL") {
    return Promise.resolve(createResponse(201, ""));
  }
  if (actualMethod === "PUT") {
    return Promise.resolve(createResponse(201, ""));
  }
  if (actualMethod === "GET") {
    return Promise.resolve(createResponse(200, "[]"));
  }
  if (actualMethod === "DELETE") {
    return Promise.resolve(createResponse(204, ""));
  }
  return Promise.resolve(createResponse(200, ""));
}

beforeEach(() => {
  mockFetch.mockReset().mockImplementation(defaultMockFetch);
  mockIsTauri.mockReturnValue(false);
  mockIsOnline.mockReturnValue(true);
  mockProbeOnline.mockResolvedValue(true);
  mockGetUnpushedEvents.mockResolvedValue([]);
  mockGetUnpushedCount.mockResolvedValue(0);
  mockConsumeEventsFrom.mockResolvedValue({
    pulled: 0,
    processed: 0,
    applied: 0,
    skipped: 0,
    skippedLocalNewer: 0,
    skippedTombstone: 0,
    alreadyProcessed: 0,
    errors: 0,
  });
  localStorage.clear();
});

// ============================================================
// testConnection
// ============================================================
describe("testConnection", () => {
  it("未配置时应返回 false", async () => {
    const webdav = useWebDavSync();
    webdav.clearConfig();
    const ok = await webdav.testConnection();
    expect(ok).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("Web PROPFIND 200 应返回 true", async () => {
    const webdav = useWebDavSync();
    webdav.setConfig({
      url: "https://dav.example.com",
      username: "u",
      password: "p",
    });
    mockFetch.mockResolvedValue(
      createResponse(
        207,
        `<?xml version="1.0"?><D:multistatus xmlns:D="DAV:"><D:response><D:href>/</D:href></D:response></D:multistatus>`
      )
    );
    const ok = await webdav.testConnection();
    expect(ok).toBe(true);
    expect(mockFetch).toHaveBeenCalled();
  });

  it("Web PROPFIND 401 应返回 false", async () => {
    const webdav = useWebDavSync();
    webdav.setConfig({
      url: "https://dav.example.com",
      username: "u",
      password: "p",
    });
    mockFetch.mockResolvedValue(createResponse(401, "Unauthorized"));
    const ok = await webdav.testConnection();
    expect(ok).toBe(false);
  });

  it("Web fetch 抛异常应返回 false", async () => {
    const webdav = useWebDavSync();
    webdav.setConfig({
      url: "https://dav.example.com",
      username: "u",
      password: "p",
    });
    mockFetch.mockRejectedValue(new Error("network error"));
    const ok = await webdav.testConnection();
    expect(ok).toBe(false);
  });
});

// ============================================================
// syncEvents 错误路径
// ============================================================
describe("syncEvents error paths", () => {
  it("未配置时应返回错误", async () => {
    const webdav = useWebDavSync();
    webdav.clearConfig();
    const result = await webdav.syncEvents();
    expect(result.error).toBe("WebDAV 未配置");
    expect(result.errors).toBe(0);
  });

  it("不在线时应返回错误", async () => {
    const webdav = useWebDavSync();
    webdav.setConfig({
      url: "https://dav.example.com",
      username: "u",
      password: "p",
    });
    mockIsOnline.mockReturnValue(false);
    const result = await webdav.syncEvents();
    expect(result.error).toContain("离线");
  });

  it("probeOnline 失败时应返回错误", async () => {
    const webdav = useWebDavSync();
    webdav.setConfig({
      url: "https://dav.example.com",
      username: "u",
      password: "p",
    });
    mockProbeOnline.mockResolvedValue(false);
    const result = await webdav.syncEvents();
    expect(result.error).toContain("无法连接");
  });
});

// ============================================================
// syncEvents 正常流程
// ============================================================
describe("syncEvents normal flow", () => {
  it("空 outbox + 空远程应成功完成", async () => {
    const webdav = useWebDavSync();
    webdav.setConfig({
      url: "https://dav.example.com",
      username: "u",
      password: "p",
    });

    const result = await webdav.syncEvents();

    expect(result.error).toBeUndefined();
    expect(result.pushed).toBe(0);
    expect(result.pulled).toBe(0);
    expect(result.processed).toBe(0);
    expect(result.errors).toBe(0);
    expect(webdav.lastSyncAt).not.toBeNull();
  });

  it("应推送本地 outbox 事件并标记为已处理", async () => {
    const webdav = useWebDavSync();
    webdav.setConfig({
      url: "https://dav.example.com",
      username: "u",
      password: "p",
    });

    mockGetUnpushedEvents.mockResolvedValue([
      {
        eventId: "evt-1",
        type: "task.created",
        entityType: "task",
        entityId: "t1",
        payload: {},
        timestamp: "2026-05-01T10:00:00Z",
      },
    ]);

    const result = await webdav.syncEvents();

    expect(result.error).toBeUndefined();
    expect(result.pushed).toBe(1);
    expect(mockRemovePushedEvents).toHaveBeenCalledWith(["evt-1"]);
    expect(mockMarkProcessed).toHaveBeenCalledWith("evt-1");

    // 验证 PUT 被调用（推送事件文件）
    const putCalls = mockFetch.mock.calls.filter(([, init]: any) => {
      const m = (init?.method || "GET").toUpperCase();
      const o = init?.headers?.["X-HTTP-Method-Override"];
      return m === "PUT" || o === "PUT";
    });
    expect(putCalls.length).toBeGreaterThan(0);
  });

  it("应拉取远程事件并消费", async () => {
    const webdav = useWebDavSync();
    webdav.setConfig({
      url: "https://dav.example.com",
      username: "u",
      password: "p",
    });

    // PROPFIND 返回一个远程事件文件
    const propfindWithFile = `<?xml version="1.0" encoding="utf-8"?>
<D:multistatus xmlns:D="DAV:">
  <D:response><D:href>/dav/pomodorox/events/2026-05-19-evt-remote.json</D:href></D:response>
</D:multistatus>`;

    // GET 返回事件内容
    const remoteEvent = {
      eventId: "evt-remote",
      type: "task.created",
      entityType: "task",
      entityId: "t2",
      payload: { title: "Remote" },
      timestamp: "2026-05-01T10:00:00Z",
    };

    mockFetch.mockImplementation((url, init) => {
      const urlStr = typeof url === "string" ? url : (url as any).url;
      const method = (init?.method || "GET").toUpperCase();
      const override = (init?.headers as any)?.["X-HTTP-Method-Override"];
      const actualMethod = override || method;

      if (actualMethod === "PROPFIND") {
        return Promise.resolve(createResponse(207, propfindWithFile));
      }
      if (actualMethod === "GET" && urlStr.includes("evt-remote")) {
        return Promise.resolve(
          createResponse(200, JSON.stringify(remoteEvent))
        );
      }
      if (
        actualMethod === "MKCOL" ||
        actualMethod === "PUT" ||
        actualMethod === "DELETE"
      ) {
        return Promise.resolve(
          createResponse(actualMethod === "MKCOL" ? 201 : 204, "")
        );
      }
      return Promise.resolve(createResponse(200, "[]"));
    });

    mockConsumeEventsFrom.mockResolvedValue({
      pulled: 1,
      processed: 1,
      applied: 1,
      skipped: 0,
      skippedLocalNewer: 0,
      skippedTombstone: 0,
      alreadyProcessed: 0,
      errors: 0,
    });

    const result = await webdav.syncEvents();

    expect(result.error).toBeUndefined();
    expect(result.pulled).toBe(1);
    expect(result.processed).toBe(1);
    expect(mockConsumeEventsFrom).toHaveBeenCalled();
  });

  it("pullRemoteEvents fatal 时应返回部分错误", async () => {
    const webdav = useWebDavSync();
    webdav.setConfig({
      url: "https://dav.example.com",
      username: "u",
      password: "p",
    });

    // PROPFIND 返回 500，导致 listEvents fatal
    mockFetch.mockImplementation((_url, init) => {
      const method = (init?.method || "GET").toUpperCase();
      const override = (init?.headers as any)?.["X-HTTP-Method-Override"];
      const actualMethod = override || method;

      if (actualMethod === "PROPFIND") {
        return Promise.resolve(createResponse(500, "Server Error"));
      }
      if (actualMethod === "MKCOL" || actualMethod === "PUT") {
        return Promise.resolve(createResponse(201, ""));
      }
      return Promise.resolve(createResponse(200, "[]"));
    });

    const result = await webdav.syncEvents();

    expect(result.error).toContain("拉取远端事件失败");
    expect(result.errors).toBeGreaterThanOrEqual(0);
  });

  it("快照兜底触发时 lastSyncAt 应更新", async () => {
    const webdav = useWebDavSync();
    webdav.setConfig({
      url: "https://dav.example.com",
      username: "u",
      password: "p",
    });

    // 设置 lastSync 为 26 天前，触发快照兜底
    localStorage.setItem("webdav-last-sync", "2026-04-01T00:00:00.000Z");
    // 重新加载使 lastSyncAt ref 生效（模块已加载，但 loadLastSync 在 syncEvents 中直接读 localStorage）
    // syncEvents 内部调用 shouldTriggerSnapshotFallback() → loadLastSync() 读 localStorage

    // 快照兜底会调用 syncTombstones / syncTasks / syncReflections / syncSessions
    // 这些都需要 fetch 响应，使用默认 mock 即可
    mockDb.getAllTasks.mockResolvedValue([
      { id: "t1", title: "Task", updatedAt: "2026-05-01" },
    ]);
    mockDb.getAllReflections.mockResolvedValue([]);
    mockDb.getAllSessions.mockResolvedValue([]);

    const result = await webdav.syncEvents();

    // 快照兜底后应继续正常事件同步
    expect(result.error).toBeUndefined();
    expect(webdav.lastSyncAt).not.toBeNull();
  });
});
