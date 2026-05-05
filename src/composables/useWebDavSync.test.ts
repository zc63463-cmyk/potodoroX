// ============================================================
// useWebDavSync 纯函数与并发锁回归测试
// ============================================================
//
// 覆盖审查中提出的 P1/P2 问题：
// - 时间戳字符串比较 bug（YYYY-MM-DD HH:mm:ss vs ISO）
// - 墓碑阻止已删除实体复活
// - 旧更新不覆盖新本地
// - serialized() 全局串行锁
// ============================================================

import { describe, it, expect } from "vitest";
import {
  mergeWithTombstones,
  mergeTombstones,
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
