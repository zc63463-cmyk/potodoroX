/** 轻量级在线探测缓存（5 秒内复用结果） */
let lastProbeResult = true;
let lastProbeAt = 0;
const PROBE_TTL_MS = 5000;

/**
 * 主动探测互联网可达性。
 * 向代理健康检查端点发送 HEAD 请求，验证真实连通性。
 * 结果缓存 5 秒，避免频繁探测。
 */
export async function probeOnline(): Promise<boolean> {
  const now = Date.now();
  if (now - lastProbeAt < PROBE_TTL_MS) return lastProbeResult;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch("/api/webdav-proxy?health=1", {
      method: "HEAD",
      signal: controller.signal,
    });
    clearTimeout(timer);
    lastProbeResult = res.ok;
    lastProbeAt = now;
    return lastProbeResult;
  } catch {
    lastProbeResult = false;
    lastProbeAt = now;
    return false;
  }
}

/**
 * 安全检测当前是否在线。
 *
 * `navigator.onLine` 只能检测系统网络接口状态（有线/WiFi 连接），
 * 无法保证实际互联网可达。但对于轻量级离线跳过已足够。
 *
 * 兼容 SSR / 测试环境（无 navigator 时返回 true，避免阻断）。
 */
export function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine !== undefined
    ? navigator.onLine
    : true;
}
