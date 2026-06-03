/**
 * useNotification 测试
 * 覆盖：浏览器 Notification API / 权限请求 / 发送通知 / 降级逻辑
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  requestPermission,
  sendNotification,
  useNotification,
} from "./useNotification";

// ============================================================
// Mock setup
// ============================================================
const mockNotificationRequestPermission = vi.fn();
const mockNotificationClass = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();

  // Mock 浏览器 Notification
  mockNotificationRequestPermission.mockResolvedValue("granted");
  Object.defineProperty(globalThis, "Notification", {
    value: mockNotificationClass,
    writable: true,
    configurable: true,
  });
  (globalThis.Notification as any).permission = "default";
  (globalThis.Notification as any).requestPermission =
    mockNotificationRequestPermission;
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ============================================================
// useNotification composable
// ============================================================
describe("useNotification", () => {
  it("应该返回通知相关功能", () => {
    const notif = useNotification();
    expect(notif.permissionState).toBeDefined();
    expect(notif.requestPermission).toBeDefined();
    expect(notif.sendNotification).toBeDefined();
  });
});

// ============================================================
// requestPermission
// ============================================================
describe("requestPermission", () => {
  it("应该请求并授予权限（default → granted）", async () => {
    (globalThis.Notification as any).permission = "default";
    mockNotificationRequestPermission.mockResolvedValue("granted");

    const granted = await requestPermission();
    const notif = useNotification();

    expect(granted).toBe(true);
    expect(notif.permissionState.value).toBe("granted");
    expect(mockNotificationRequestPermission).toHaveBeenCalled();
  });

  it("应该在已授予时直接返回 true", async () => {
    (globalThis.Notification as any).permission = "granted";

    const granted = await requestPermission();
    const notif = useNotification();

    expect(granted).toBe(true);
    expect(notif.permissionState.value).toBe("granted");
    // 不应该再次请求
    expect(mockNotificationRequestPermission).not.toHaveBeenCalled();
  });

  it("应该在已拒绝时返回 false", async () => {
    (globalThis.Notification as any).permission = "denied";

    const granted = await requestPermission();
    const notif = useNotification();

    expect(granted).toBe(false);
    expect(notif.permissionState.value).toBe("denied");
  });

  it("应该在用户拒绝后返回 false", async () => {
    (globalThis.Notification as any).permission = "default";
    mockNotificationRequestPermission.mockResolvedValue("denied");

    const granted = await requestPermission();

    expect(granted).toBe(false);
  });

  it("应该在 Notification API 不可用时标记为 unavailable", async () => {
    // @ts-expect-error mock: 测试 Notification API 不可用场景
    delete globalThis.Notification;

    const granted = await requestPermission();
    const notif = useNotification();

    expect(granted).toBe(false);
    expect(notif.permissionState.value).toBe("unavailable");
  });

  it("应该在 requestPermission 异常时标记为 unavailable", async () => {
    (globalThis.Notification as any).permission = "default";
    mockNotificationRequestPermission.mockRejectedValue(
      new Error("Permission denied")
    );

    const granted = await requestPermission();
    const notif = useNotification();

    expect(granted).toBe(false);
    expect(notif.permissionState.value).toBe("unavailable");
  });
});

// ============================================================
// sendNotification
// ============================================================
describe("sendNotification", () => {
  it("应该在已授权时发送通知", async () => {
    (globalThis.Notification as any).permission = "granted";

    await sendNotification("测试标题", "测试内容");

    expect(mockNotificationClass).toHaveBeenCalledWith("测试标题", {
      body: "测试内容",
      icon: undefined,
      tag: undefined,
      silent: false,
    });
  });

  it("应该支持 icon 和 tag 选项", async () => {
    (globalThis.Notification as any).permission = "granted";

    await sendNotification("标题", "内容", {
      icon: "/icon.png",
      tag: "reminder",
    });

    expect(mockNotificationClass).toHaveBeenCalledWith("标题", {
      body: "内容",
      icon: "/icon.png",
      tag: "reminder",
      silent: false,
    });
  });

  it("应该支持 onClick 回调", async () => {
    (globalThis.Notification as any).permission = "granted";
    const onClick = vi.fn();

    // Mock Notification 实例
    const mockInstance = { onclick: null };
    mockNotificationClass.mockImplementation(function () {
      return mockInstance;
    });

    await sendNotification("标题", "内容", { onClick });

    expect(mockInstance.onclick).toBe(onClick);
  });

  it("应该在未授权时先请求权限再发送", async () => {
    (globalThis.Notification as any).permission = "default";
    mockNotificationRequestPermission.mockResolvedValue("granted");

    await sendNotification("标题", "内容");

    expect(mockNotificationRequestPermission).toHaveBeenCalled();
    expect(mockNotificationClass).toHaveBeenCalled();
  });

  it("应该在请求后仍拒绝时不发送", async () => {
    (globalThis.Notification as any).permission = "default";
    mockNotificationRequestPermission.mockResolvedValue("denied");

    await sendNotification("标题", "内容");

    // 不应创建 Notification
    const firstCallArgs = mockNotificationClass.mock.calls[0];
    // 如果有调用，不应该有 title="标题"
    if (firstCallArgs) {
      expect(firstCallArgs[0]).not.toBe("标题");
    }
  });

  it("应该在 Notification API 不可用时静默失败", async () => {
    // @ts-expect-error mock: 测试 Notification API 不可用时静默降级
    delete globalThis.Notification;

    // 不应抛出错误
    await expect(sendNotification("标题", "内容")).resolves.toBeUndefined();
  });
});

// ============================================================
// 边界条件
// ============================================================
describe("边界条件", () => {
  it("空标题应能发送", async () => {
    (globalThis.Notification as any).permission = "granted";

    await sendNotification("", "内容");

    expect(mockNotificationClass).toHaveBeenCalledWith("", expect.any(Object));
  });

  it("长标题应能发送", async () => {
    (globalThis.Notification as any).permission = "granted";
    const longTitle = "A".repeat(500);

    await sendNotification(longTitle, "内容");

    expect(mockNotificationClass).toHaveBeenCalledWith(
      longTitle,
      expect.any(Object)
    );
  });

  it("连续多次请求权限不应重复弹出", async () => {
    (globalThis.Notification as any).permission = "granted";

    await requestPermission();
    await requestPermission();
    await requestPermission();

    // 已授权后不应再请求
    expect(mockNotificationRequestPermission).not.toHaveBeenCalled();
  });
});
