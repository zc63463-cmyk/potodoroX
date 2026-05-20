// ============================================================
// PomodoroX — Service Worker
//
// 策略: Stale-While-Revalidate
// - 断网时: 返回缓存，应用完全可用
// - 联网时: 立即返回缓存，后台静默更新缓存
//
// 缓存范围:
// - 预缓存: index.html / manifest.json / favicon.svg / icons.svg
// - 运行时: /assets/* (JS/CSS，Vite hash 文件名，永不过期冲突)
// - 不缓存: /api/* (WebDAV 代理请求)
// ============================================================

// ⚠️ 每次发布新版本时必须更新此值，否则用户将继续使用旧缓存
const CACHE_NAME = "pomodorox-v2-20250519";

/** 安装时预缓存的核心资源 */
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.svg",
  "/icons.svg",
];

// ---- Install: 预缓存核心资源（逐个缓存，忽略单个失败） ----
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn("[SW] 预缓存失败:", url, err);
          })
        )
      );
      await self.skipWaiting();
    })()
  );
});

// ---- Activate: 清理旧版本缓存 ----
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// ---- Fetch: 策略路由 ----
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // 只处理 GET 请求
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 只处理同域请求
  if (url.origin !== self.location.origin) return;

  // 排除 API / WebDAV 代理、sourcemap、非目标路径
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.endsWith(".map")) return;

  // 静态资源: Stale-While-Revalidate
  event.respondWith(staleWhileRevalidate(request));
});

/**
 * Stale-While-Revalidate 策略
 * 1. 先尝试从缓存返回（快，断网也可用）
 * 2. 同时发网络请求更新缓存（后台静默刷新）
 * 3. 如果缓存没有且网络失败，返回离线降级响应
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // 后台网络请求（不阻塞响应）
  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined); // 网络失败返回 undefined

  // 有缓存 → 立即返回，后台更新
  if (cached) {
    void networkFetch; // fire-and-forget
    return cached;
  }

  // 无缓存 → 等待网络
  const networkResponse = await networkFetch;
  if (networkResponse) {
    return networkResponse;
  }

  // 缓存和网络都失败 → 返回离线降级响应
  return new Response(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>PomodoroX - 离线</title><style>' +
      "body{font-family:system-ui,sans-serif;background:#070B14;color:#E6EDF3;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}" +
      ".box{padding:40px 24px}h1{font-size:1.5rem;margin-bottom:12px}p{color:#8B949E;margin-bottom:24px}" +
      "button{background:#58A6FF;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:1rem;cursor:pointer}" +
      '</style></head><body><div class="box"><h1>📴 离线模式</h1><p>当前无网络连接，且页面缓存不可用。<br>请检查网络后重试。</p><button onclick="location.reload()">刷新页面</button></div></body></html>',
    {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}
