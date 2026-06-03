// ============================================================
// PomodoroX — Service Worker (PWA Enhanced)
//
// 缓存策略:
//   - 静态资源 (assets/*.js, *.css): CacheFirst（Vite hash 文件名永不变）
//   - 导航请求 (navigate): NetworkFirst → 缓存 index.html → 离线错误页
//   - 静态文件 (favicon, manifest): StaleWhileRevalidate
//   - API (/api/*): NetworkOnly（不缓存）
//   - 其他: StaleWhileRevalidate
//
// 版本管理:
//   - __BUILD_TIMESTAMP__ 由 Vite build 插件注入
//   - 每次构建生成新缓存版本，自动清理旧缓存
// ============================================================

// ⚠️ build 时 Vite 插件会替换下面两行
// @ts-nocheck
const BUILD_ID =
  typeof __BUILD_TIMESTAMP__ !== "undefined" ? __BUILD_TIMESTAMP__ : "dev";
const PRECACHE_MANIFEST =
  typeof __PRECACHE_MANIFEST__ !== "undefined" ? __PRECACHE_MANIFEST__ : [];

const CACHE_NAME = `pomodorox-v3-${BUILD_ID}`;

// ---- Install: 预缓存 build 期扫描到的所有静态资源 ----
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // 开发模式：只预缓存核心入口
      if (BUILD_ID === "dev") {
        const devAssets = [
          "/",
          "/index.html",
          "/manifest.json",
          "/favicon.svg",
        ];
        await Promise.all(
          devAssets.map((url) =>
            cache.add(url).catch((err) => console.warn("[SW] 预缓存跳过:", url))
          )
        );
      } else {
        // 生产模式：预缓存所有构建产物
        if (PRECACHE_MANIFEST.length > 0) {
          console.log(`[SW] 预缓存 ${PRECACHE_MANIFEST.length} 个文件...`);
          await Promise.all(
            PRECACHE_MANIFEST.map((url) =>
              cache.add(url).catch((err) => {
                console.warn("[SW] 预缓存失败:", url, err.message);
              })
            )
          );
          console.log("[SW] 预缓存完成");
        }
      }

      // 立即接管所有页面（不等待旧 SW 释放）
      await self.skipWaiting();
    })()
  );
});

// ---- Activate: 清理旧版本缓存 + 接管客户端 ----
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("pomodorox-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );

      // 接管所有已打开的页面
      await self.clients.claim();

      // 通知所有客户端 SW 已更新
      const allClients = await self.clients.matchAll({ type: "window" });
      for (const client of allClients) {
        client.postMessage({ type: "SW_ACTIVATED", version: BUILD_ID });
      }
    })()
  );
});

// ---- Fetch: 策略路由 ----
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // 只处理 GET/HEAD
  if (request.method !== "GET" && request.method !== "HEAD") return;

  const url = new URL(request.url);

  // 只处理同域
  if (url.origin !== self.location.origin) return;

  // === 策略路由 ===

  // 1. API 代理: NetworkOnly
  if (url.pathname.startsWith("/api/")) return;

  // 2. Sourcemap: NetworkOnly（生产环境不存在，dev 避免缓存）
  if (url.pathname.endsWith(".map")) return;

  // 3. 导航请求 (HTML): NetworkFirst → 缓存 index.html
  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigate(request));
    return;
  }

  // 4. 静态构建产物 (assets/ 目录, hash 文件名): CacheFirst
  if (url.pathname.includes("/assets/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 5. 静态文件 (favicon, manifest, icons): StaleWhileRevalidate
  if (
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".json") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // 6. 其他: StaleWhileRevalidate
  event.respondWith(staleWhileRevalidate(request));
});

// ============================================================
// 缓存策略实现
// ============================================================

/**
 * CacheFirst: 优先缓存，缓存未命中时走网络并缓存
 * 适用于 Vite hash 文件名（内容不变则文件名不变）
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    // 无缓存且网络不可用 — 对静态资源返回 504
    return new Response("", { status: 504, statusText: "Gateway Timeout" });
  }
}

/**
 * NetworkFirst: 优先网络，失败时回退到缓存（index.html）
 * 适用于导航请求 — 确保用户总是获得最新 HTML
 */
async function networkFirstNavigate(request) {
  try {
    const networkResponse = await fetch(request, { redirect: "follow" });
    if (networkResponse && networkResponse.ok) {
      // 后台更新缓存
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch {
    // 网络不可用，尝试缓存
  }

  // 回退：缓存 index.html
  const cache = await caches.open(CACHE_NAME);
  const cachedIndex = await cache.match("/index.html");
  if (cachedIndex) return cachedIndex;

  const cachedRoot = await cache.match("/");
  if (cachedRoot) return cachedRoot;

  // 完全离线且无缓存
  return new Response(
    `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PomodoroX · 离线</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:system-ui,-apple-system,sans-serif;background:#070B14;color:#E6EDF3;
       display:flex;align-items:center;justify-content:center;height:100vh;text-align:center}
  .box{max-width:320px;padding:40px 24px}
  .icon{font-size:3rem;margin-bottom:16px}
  h1{font-size:1.25rem;font-weight:600;margin-bottom:8px}
  p{font-size:0.9rem;color:#8B949E;line-height:1.6;margin-bottom:24px}
  button{background:#58A6FF;color:#fff;border:none;padding:10px 28px;border-radius:8px;
         font-size:0.95rem;font-weight:500;cursor:pointer;transition:background .2s}
  button:hover{background:#4090E0}
  .hint{font-size:0.8rem;color:#484F58;margin-top:16px}
</style></head><body>
<div class="box">
  <div class="icon">📴</div>
  <h1>首次访问需联网</h1>
  <p>PomodoroX 需要先在线加载一次，之后即可离线使用。</p>
  <button onclick="location.reload()">刷新页面</button>
  <div class="hint">恢复网络后刷新即可正常使用</div>
</div></body></html>`,
    { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

/**
 * StaleWhileRevalidate: 立即返回缓存，后台更新
 * 适用于不常变化的静态文件
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // 后台网络更新
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    // fire-and-forget: 不阻塞响应
    networkPromise.catch(() => {});
    return cached;
  }

  const networkResponse = await networkPromise;
  if (networkResponse) return networkResponse;

  return new Response("", { status: 504, statusText: "Gateway Timeout" });
}
