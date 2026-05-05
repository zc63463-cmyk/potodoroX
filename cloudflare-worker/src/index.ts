/**
 * PomodoroX WebDAV Proxy Worker
 *
 * 无状态代理：将浏览器的 WebDAV 请求转发到目标 WebDAV 服务（如坚果云）。
 * Worker 不存储任何凭据，凭据由浏览器在 Authorization header 中传递。
 *
 * 用法:
 *   POST/GET/PUT/PROPFIND  https://<your-worker>.workers.dev/?url=<encoded-webdav-url>
 *   Headers:
 *     Authorization: Basic <base64(user:password)>
 *
 * 安全说明:
 *   - 仅允许同步到 ALLOWED_HOSTS 配置的 WebDAV 主机（防止滥用为开放代理）
 *   - 凭据透传，Worker 自身不记录
 */

const ALLOWED_HOSTS = [
  'dav.jianguoyun.com',      // 坚果云
  'webdav.yandex.com',       // Yandex (备选)
  'dav.box.com',             // Box (备选)
]

// 允许的 WebDAV 方法
const ALLOWED_METHODS = ['GET', 'PUT', 'PROPFIND', 'MKCOL', 'DELETE', 'OPTIONS', 'HEAD']

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Depth, Destination, Overwrite, If-Match, If-None-Match',
  'Access-Control-Expose-Headers': 'ETag, Last-Modified, Content-Length',
  'Access-Control-Max-Age': '86400',
}

export default {
  async fetch(request: Request): Promise<Response> {
    // 处理 CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    const url = new URL(request.url)

    // 健康检查端点
    if (url.pathname === '/health') {
      return jsonResponse({ status: 'ok', service: 'pomodorox-webdav-proxy' })
    }

    // 根路径返回简单文档
    if (url.pathname === '/' && !url.searchParams.has('url')) {
      return new Response(
        'PomodoroX WebDAV Proxy is running.\n\n' +
        'Usage: <method> /?url=<webdav-target-url>\n' +
        `Allowed hosts: ${ALLOWED_HOSTS.join(', ')}\n`,
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain' } }
      )
    }

    // 解析目标 URL
    const target = url.searchParams.get('url')
    if (!target) {
      return errorResponse(400, 'Missing required query parameter: url')
    }

    let targetUrl: URL
    try {
      targetUrl = new URL(target)
    } catch {
      return errorResponse(400, 'Invalid target URL')
    }

    // 仅允许 HTTPS
    if (targetUrl.protocol !== 'https:') {
      return errorResponse(400, 'Only HTTPS targets are allowed')
    }

    // 校验目标主机
    if (!ALLOWED_HOSTS.includes(targetUrl.hostname)) {
      return errorResponse(
        403,
        `Target host not allowed. Allowed: ${ALLOWED_HOSTS.join(', ')}`
      )
    }

    // 校验 HTTP 方法
    if (!ALLOWED_METHODS.includes(request.method)) {
      return errorResponse(405, `Method ${request.method} not allowed`)
    }

    // 转发请求 - 复制必要的 headers
    const forwardHeaders = new Headers()
    const passthroughHeaders = [
      'authorization',
      'content-type',
      'depth',
      'destination',
      'overwrite',
      'if-match',
      'if-none-match',
    ]
    for (const [key, value] of request.headers) {
      if (passthroughHeaders.includes(key.toLowerCase())) {
        forwardHeaders.set(key, value)
      }
    }

    try {
      const proxyResponse = await fetch(targetUrl.toString(), {
        method: request.method,
        headers: forwardHeaders,
        body: ['GET', 'HEAD', 'OPTIONS'].includes(request.method)
          ? undefined
          : request.body,
      })

      // 构造响应：保留原响应头 + 添加 CORS 头
      const responseHeaders = new Headers(proxyResponse.headers)
      for (const [key, value] of Object.entries(CORS_HEADERS)) {
        responseHeaders.set(key, value)
      }

      return new Response(proxyResponse.body, {
        status: proxyResponse.status,
        statusText: proxyResponse.statusText,
        headers: responseHeaders,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown proxy error'
      return errorResponse(502, `Proxy request failed: ${message}`)
    }
  },
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function errorResponse(status: number, message: string): Response {
  return jsonResponse({ error: message }, status)
}
