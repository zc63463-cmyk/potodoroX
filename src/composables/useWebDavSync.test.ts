// ============================================================
// useWebDavSync 纯函数与并发锁回归测试
// ============================================================
//
// 覆盖审查中提出的 P1/P2 问题：
// - 时间戳字符串比较 bug（YYYY-MM-DD HH:mm:ss vs ISO）
// - 墓碑阻止已删除实体复活
// - 旧更新不覆盖新本地
// - serialized() 全局串行锁
// - PROPFIND XML 解析（Phase 2 事件流）
// ============================================================

import { describe, it, expect } from "vitest";
import {
  mergeWithTombstones,
  mergeTombstones,
  parsePropfindHrefs,
  extractFileNamesFromHrefs,
  isValidOutboxEvent,
  renderReadableStatus,
  type ReadableSyncSummary,
  __webdavSerialized,
} from "./useWebDavSync";
import type { Tombstone } from "@/services/outbox";

type Entity = { id: string; updatedAt: string; value?: string };

describe("mergeWithTombstones", () => {
  it("空墓碑时按 updatedAt LWW 合并", () => {
    const local: Entity[] = [
      { id: "a", updatedAt: "2026-05-01T10:00:00.000Z", value: "local-a" },
    ];
    const remote: Entity[] = [
      { id: "a", updatedAt: "2026-05-01T12:00:00.000Z", value: "remote-a" },
      { id: "b", updatedAt: "2026-05-01T09:00:00.000Z", value: "remote-b" },
    ];
    const { merged, pulled, toDeleteLocal } = mergeWithTombstones(
      "task",
      local,
      remote,
      []
    );
    expect(merged.find((e) => e.id === "a")?.value).toBe("remote-a");
    expect(merged.find((e) => e.id === "b")?.value).toBe("remote-b");
    expect(pulled).toBe(2);
    expect(toDeleteLocal).toEqual([]);
  });

  it("混合时间戳格式：YYYY-MM-DD HH:mm:ss 与 ISO 正确比较（不受字典序影响）", () => {
    // 关键：空格(0x20) < 'T'(0x54)，朴素字符串比较会说 "15:00 空格" < "10:00 T"
    // 错误地认为 15:00 的本地数据更旧，于是被 10:00 的远端覆盖。
    // parseTime 归一化后应按真实时间判定：15:00 更新 → 本地胜出。
    const local: Entity[] = [
      { id: "a", updatedAt: "2026-05-04 15:00:00", value: "newer-local" },
    ];
    const remote: Entity[] = [
      { id: "a", updatedAt: "2026-05-04T10:00:00", value: "older-remote" },
    ];
    // 朴素字符串比较验证确实会出 bug（作为对照）
    expect("2026-05-04 15:00:00" < "2026-05-04T10:00:00").toBe(true);

    const { merged, pulled } = mergeWithTombstones("task", local, remote, []);
    expect(merged.find((e) => e.id === "a")?.value).toBe("newer-local");
    expect(pulled).toBe(0);
  });

  it("墓碑阻止远端已删除实体复活（远端不再有此 entity）", () => {
    const local: Entity[] = [
      { id: "a", updatedAt: "2026-05-04T10:00:00.000Z", value: "local" },
    ];
    const remote: Entity[] = [];
    const tombstones: Tombstone[] = [
      {
        entityType: "task",
        entityId: "a",
        deletedAt: "2026-05-04T11:00:00.000Z",
      },
    ];
    const { merged, toDeleteLocal } = mergeWithTombstones(
      "task",
      local,
      remote,
      tombstones
    );
    expect(merged).toEqual([]);
    expect(toDeleteLocal).toEqual(["a"]);
  });

  it("墓碑阻止远端实体被拉回本地", () => {
    const local: Entity[] = [];
    const remote: Entity[] = [
      { id: "a", updatedAt: "2026-05-04T10:00:00.000Z", value: "remote" },
    ];
    const tombstones: Tombstone[] = [
      {
        entityType: "task",
        entityId: "a",
        deletedAt: "2026-05-04T11:00:00.000Z",
      },
    ];
    const { merged, pulled } = mergeWithTombstones(
      "task",
      local,
      remote,
      tombstones
    );
    expect(merged).toEqual([]);
    expect(pulled).toBe(0);
  });

  it("实体更新晚于墓碑时，实体复活", () => {
    const local: Entity[] = [];
    const remote: Entity[] = [
      { id: "a", updatedAt: "2026-05-04T12:00:00.000Z", value: "revived" },
    ];
    const tombstones: Tombstone[] = [
      {
        entityType: "task",
        entityId: "a",
        deletedAt: "2026-05-04T10:00:00.000Z",
      },
    ];
    const { merged, pulled } = mergeWithTombstones(
      "task",
      local,
      remote,
      tombstones
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].value).toBe("revived");
    expect(pulled).toBe(1);
  });

  it("墓碑按 entityType 隔离：task 墓碑不影响 reflection 合并", () => {
    const local: Entity[] = [];
    const remote: Entity[] = [
      { id: "a", updatedAt: "2026-05-04T10:00:00.000Z", value: "remote" },
    ];
    const tombstones: Tombstone[] = [
      {
        entityType: "reflection",
        entityId: "a",
        deletedAt: "2026-05-04T11:00:00.000Z",
      },
    ];
    const { merged, pulled } = mergeWithTombstones(
      "task",
      local,
      remote,
      tombstones
    );
    expect(merged).toHaveLength(1);
    expect(pulled).toBe(1);
  });

  it("旧远端 updatedAt 不覆盖新本地", () => {
    const local: Entity[] = [
      { id: "a", updatedAt: "2026-05-04T15:00:00.000Z", value: "new-local" },
    ];
    const remote: Entity[] = [
      { id: "a", updatedAt: "2026-05-04T10:00:00.000Z", value: "old-remote" },
    ];
    const { merged, pulled } = mergeWithTombstones("task", local, remote, []);
    expect(merged[0].value).toBe("new-local");
    expect(pulled).toBe(0);
  });
});

describe("mergeTombstones", () => {
  it("按 entityType+entityId 保留最新 deletedAt", () => {
    const local: Tombstone[] = [
      {
        entityType: "task",
        entityId: "a",
        deletedAt: "2026-05-04T10:00:00.000Z",
      },
    ];
    const remote: Tombstone[] = [
      {
        entityType: "task",
        entityId: "a",
        deletedAt: "2026-05-04T12:00:00.000Z",
      },
      {
        entityType: "reflection",
        entityId: "a",
        deletedAt: "2026-05-04T09:00:00.000Z",
      },
    ];
    const { merged, pulled } = mergeTombstones(local, remote);
    expect(merged).toHaveLength(2);
    const taskT = merged.find(
      (t) => t.entityType === "task" && t.entityId === "a"
    );
    expect(taskT?.deletedAt).toBe("2026-05-04T12:00:00.000Z");
    expect(pulled).toBe(2); // 任务墓碑更新 + 反思墓碑新增
  });

  it("旧远端墓碑不覆盖新本地墓碑", () => {
    const local: Tombstone[] = [
      {
        entityType: "task",
        entityId: "a",
        deletedAt: "2026-05-04T15:00:00.000Z",
      },
    ];
    const remote: Tombstone[] = [
      {
        entityType: "task",
        entityId: "a",
        deletedAt: "2026-05-04T10:00:00.000Z",
      },
    ];
    const { merged, pulled } = mergeTombstones(local, remote);
    expect(merged[0].deletedAt).toBe("2026-05-04T15:00:00.000Z");
    expect(pulled).toBe(0);
  });
});

describe("__webdavSerialized", () => {
  it("并发调用严格串行执行", async () => {
    const order: number[] = [];
    const makeTask = (id: number, delayMs: number) =>
      __webdavSerialized(async () => {
        order.push(id);
        await new Promise((r) => setTimeout(r, delayMs));
        order.push(-id); // 结束标记
      });

    await Promise.all([makeTask(1, 20), makeTask(2, 5), makeTask(3, 1)]);

    // 必须严格 1→-1→2→-2→3→-3，不能交错
    expect(order).toEqual([1, -1, 2, -2, 3, -3]);
  });

  it("失败的任务不会阻塞后续任务", async () => {
    const results: string[] = [];
    const fail = __webdavSerialized(async () => {
      throw new Error("boom");
    }).catch(() => {
      results.push("fail-handled");
    });
    const ok = __webdavSerialized(async () => {
      results.push("ok");
    });

    await Promise.all([fail, ok]);
    expect(results).toContain("fail-handled");
    expect(results).toContain("ok");
  });
});

// ============================================================
// Phase 2: PROPFIND XML 解析（事件流同步）
// ============================================================

describe("parsePropfindHrefs", () => {
  it("解析标准 DAV: 命名空间的 multistatus 响应", () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<d:multistatus xmlns:d="DAV:">
  <d:response>
    <d:href>/dav/pomodorox/events/</d:href>
    <d:propstat><d:status>HTTP/1.1 200 OK</d:status></d:propstat>
  </d:response>
  <d:response>
    <d:href>/dav/pomodorox/events/abc123.json</d:href>
    <d:propstat><d:status>HTTP/1.1 200 OK</d:status></d:propstat>
  </d:response>
  <d:response>
    <d:href>/dav/pomodorox/events/def456.json</d:href>
    <d:propstat><d:status>HTTP/1.1 200 OK</d:status></d:propstat>
  </d:response>
</d:multistatus>`;
    const hrefs = parsePropfindHrefs(xml);
    expect(hrefs).toHaveLength(3);
    expect(hrefs).toContain("/dav/pomodorox/events/");
    expect(hrefs).toContain("/dav/pomodorox/events/abc123.json");
    expect(hrefs).toContain("/dav/pomodorox/events/def456.json");
  });

  it("URL-decode 中文/特殊字符", () => {
    const xml = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:">
  <d:response><d:href>/dav/%E4%B8%AD%E6%96%87/event.json</d:href></d:response>
</d:multistatus>`;
    const hrefs = parsePropfindHrefs(xml);
    expect(hrefs).toEqual(["/dav/中文/event.json"]);
  });

  it("空字符串返回空数组", () => {
    expect(parsePropfindHrefs("")).toEqual([]);
    expect(parsePropfindHrefs("   ")).toEqual([]);
  });

  it("损坏的 XML 仍能通过正则回退提取", () => {
    // DOMParser 可能生成 parse error 但仍允许回退
    const xml = `<d:href>abc.json</d:href> garbage <d:href>def.json</d:href>`;
    const hrefs = parsePropfindHrefs(xml);
    expect(hrefs.length).toBeGreaterThanOrEqual(2);
    expect(hrefs.some((h) => h.endsWith("abc.json"))).toBe(true);
    expect(hrefs.some((h) => h.endsWith("def.json"))).toBe(true);
  });
});

describe("extractFileNamesFromHrefs", () => {
  it("只返回目标目录下的第一层 JSON 文件", () => {
    const hrefs = [
      "/dav/pomodorox/events/", // 目录本身
      "/dav/pomodorox/events/abc.json",
      "/dav/pomodorox/events/def.json",
      "/dav/pomodorox/events/nested/deep.json", // 更深层级
      "/dav/pomodorox/events/readme.txt", // 非目标后缀
      "/dav/other/events/xyz.json", // 其他目录
    ];
    const names = extractFileNamesFromHrefs(
      hrefs,
      "pomodorox/events/",
      ".json"
    );
    expect(names).toEqual(["abc.json", "def.json"]);
  });

  it("目录路径不带尾斜杠也可以工作", () => {
    const hrefs = ["/dav/pomodorox/events/x.json"];
    const names = extractFileNamesFromHrefs(hrefs, "pomodorox/events", ".json");
    expect(names).toEqual(["x.json"]);
  });

  it("无 suffix 过滤返回所有第一层文件", () => {
    const hrefs = [
      "/dav/pomodorox/events/a.json",
      "/dav/pomodorox/events/b.txt",
      "/dav/pomodorox/events/",
    ];
    const names = extractFileNamesFromHrefs(hrefs, "pomodorox/events/");
    expect(names).toEqual(["a.json", "b.txt"]);
  });
});

// ============================================================
// isValidOutboxEvent：远端事件字段完整性校验（防止损坏事件绕过版本/墓碑保护）
// ============================================================

describe("isValidOutboxEvent", () => {
  const good = {
    eventId: "evt-1",
    type: "task.updated",
    entityType: "task",
    entityId: "task-1",
    payload: { id: "task-1", title: "x", updatedAt: "2026-05-04 10:00:00" },
    timestamp: "2026-05-04T10:00:00.000Z",
  };

  it("完整合法事件通过校验", () => {
    expect(isValidOutboxEvent(good)).toBe(true);
  });

  it("非对象（null / 字符串 / 数组非事件形状）均拒绝", () => {
    expect(isValidOutboxEvent(null)).toBe(false);
    expect(isValidOutboxEvent("evt")).toBe(false);
    expect(isValidOutboxEvent(123)).toBe(false);
  });

  it.each([
    ["eventId"],
    ["type"],
    ["entityType"],
    ["entityId"],
    ["timestamp"],
    ["payload"],
  ])("缺失关键字段 %s 应拒绝", (key) => {
    const bad: Record<string, unknown> = { ...good };
    delete bad[key];
    expect(isValidOutboxEvent(bad)).toBe(false);
  });

  it("空字符串字段拒绝", () => {
    expect(isValidOutboxEvent({ ...good, eventId: "" })).toBe(false);
    expect(isValidOutboxEvent({ ...good, entityId: "" })).toBe(false);
  });

  it("未知事件类型拒绝（防止任意 type 绕过消费者 default 分支）", () => {
    expect(isValidOutboxEvent({ ...good, type: "task.archived" })).toBe(false);
    expect(
      isValidOutboxEvent({ ...good, type: "malicious", entityType: "task" })
    ).toBe(false);
  });

  it("type 前缀与 entityType 不一致拒绝（防止 task.updated 伪装成 session 绕过版本保护）", () => {
    expect(
      isValidOutboxEvent({
        ...good,
        type: "task.updated",
        entityType: "session",
      })
    ).toBe(false);
    expect(
      isValidOutboxEvent({
        ...good,
        type: "reflection.deleted",
        entityType: "task",
      })
    ).toBe(false);
  });

  it("payload 为 null 或原始值拒绝", () => {
    expect(isValidOutboxEvent({ ...good, payload: null })).toBe(false);
    expect(isValidOutboxEvent({ ...good, payload: "string" })).toBe(false);
    expect(isValidOutboxEvent({ ...good, payload: 42 })).toBe(false);
  });

  it("payload 为数组拒绝（typeof [] === 'object' 的边界情形）", () => {
    // 防止 upsertTask([]) 产出 undefined id 的脏记录
    expect(isValidOutboxEvent({ ...good, payload: [] })).toBe(false);
    expect(isValidOutboxEvent({ ...good, payload: [{ id: "x" }] })).toBe(false);
  });
});

describe("renderReadableStatus", () => {
  it("renders human-readable sync counters and skip reasons", () => {
    const summary: ReadableSyncSummary = {
      generatedAt: "2026-05-05T12:00:00.000Z",
      device: "test-device",
      pushed: 1,
      pulled: 24,
      processed: 20,
      applied: 3,
      skipped: 17,
      skippedLocalNewer: 15,
      skippedTombstone: 2,
      alreadyProcessed: 4,
      pushErrors: 0,
      fetchErrors: 0,
      parseErrors: 1,
      consumeErrors: 0,
      errors: 1,
      pendingOutbox: 0,
      totalTasks: 8,
      totalReflections: 2,
      totalSessions: 5,
    };

    const md = renderReadableStatus(summary);
    expect(md).toContain("# PomodoroX Sync Status");
    expect(md).toContain("Pushed: 1");
    expect(md).toContain("Applied: 3");
    expect(md).toContain("Skipped: 17");
    expect(md).toContain("Local newer: 15");
    expect(md).toContain("Tombstone newer: 2");
    expect(md).toContain("Remote parse errors: 1");
    expect(md).toContain("readable files are diagnostics only");
  });
});
