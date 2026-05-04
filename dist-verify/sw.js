// ============================================================
// PomodoroX - Service Worker 骨架
// 当前为占位文件，离线缓存逻辑作为 P2 推迟
// ============================================================

const CACHE_NAME = 'pomodorox-v1'

// 安装事件
self.addEventListener('install', (event) => {
  console.log('[SW] 安装完成')
  self.skipWaiting()
})

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('[SW] 激活完成')
  event.waitUntil(clients.claim())
})

// 请求拦截（预留 - 离线缓存逻辑后续添加）
self.addEventListener('fetch', (event) => {
  // 暂不拦截请求
  // event.respondWith(caches.match(event.request))
})
