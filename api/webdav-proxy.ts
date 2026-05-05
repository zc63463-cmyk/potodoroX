/**
 * Vercel Edge Function: WebDAV Proxy
 *
 * 用途：让浏览器跨过 CORS 访问坚果云等 WebDAV 服务
 * 部署：Vercel 自动部署 api/ 目录下的此文件
 *
 * 与 Cloudflare Worker 逻辑一致，改用标准 Edge Function 签名。
 */

const ALLOWED_HOSTS = [
  'dav.jianguoyun.com',      // 坚果云
  'webdav.yandex.com',       // Yandex (备选)
  'dav.box.com',             // Box (备选)
]

const ALLOWED_METHODS = ['GET', 'PUT', 'PROPFIND', 'MKCOL', 'DELETE', 'OPTIONS', 'HEAD']

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Depth, Destination, Overwrite, If-Match, If-None-Match',
  'Access-Control-Expose-Headers': 'ETag, Last-Modified, Content-Length, X-Upstream-Status',
  'Access-Control-Max-Age': '86400',
}

export default async function handler(request: Request): Promise<Response> {
  // 处理 CORS 预检
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  const url = new URL(request.url)

  // 健康检查
  if (url.pathname === '/api/webdav-proxy/health' || url.searchParams.get('health') === '1') {
    return jsonResponse({ status: 'ok', service: 'pomodorox-webdav-proxy' })
  }

  // 根路径文档
  if (!url.searchParams.has('url')) {
    return new Response(
      'PomodoroX WebDAV Proxy (Vercel Edge)\n\n' +
      'Usage: <method> /api/webdav-proxy?url=<webdav-target-url>\n' +
      'Allowed hosts: ' + ALLOWED_HOSTS.join(', ') + '\n',
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
      'Target host not allowed. Allowed: ' + ALLOWED_HOSTS.join(', ')
    )
  }

  // 校验 HTTP 方法
  if (!ALLOWED_METHODS.includes(request.method)) {
    return errorResponse(405, 'Method ' + request.method + ' not allowed')
  }

  // 透传关键 headers
  const passthroughHeaders = [
    'authorization',
    'content-type',
    'content-length',
    'depth',
    'destination',
    'overwrite',
    'if-match',
    'if-none-match',
    'accept',
  ]
  const forwardHeaders = new Headers()
  for (const [key, value] of request.headers) {
    if (passthroughHeaders.includes(key.toLowerCase())) {
      forwardHeaders.set(key, value)
    }
  }

  // 坚果云会拒绝非浏览器/非已知客户端的 User-Agent
  forwardHeaders.set(
    'User-Agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  )

  // 读取 body（Edge Function 需先读取再转发）
  const hasBody = !['GET', 'HEAD', 'OPTIONS'].includes(request.method)
  let bodyText: string | undefined = undefined
  if (hasBody) {
    try {
      bodyText = await request.text()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return errorResponse(400, 'Failed to read request body: ' + msg)
    }
  }

  try {
    const proxyResponse = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: forwardHeaders,
      body: bodyText,
    })

    // 构造响应：保留原响应头 + 添加 CORS 头
    const responseHeaders = new Headers(proxyResponse.headers)
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      responseHeaders.set(key, value)
    }
    // 调试：暴露上游状态
    responseHeaders.set('X-Upstream-Status', String(proxyResponse.status))

    // 上游 5xx 时：读取 body 并以 JSON 形式返回诊断信息
    if (proxyResponse.status >= 500) {
      const upstreamBody = await proxyResponse.text()
      return jsonResponse(
        {
          error: 'Upstream WebDAV server error',
          upstreamStatus: proxyResponse.status,
          upstreamStatusText: proxyResponse.statusText,
          upstreamBody: upstreamBody.slice(0, 2000),
          target: targetUrl.toString(),
          method: request.method,
        },
        502,
      )
    }

    return new Response(proxyResponse.body, {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: responseHeaders,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown proxy error'
    return jsonResponse(
      {
        error: 'Proxy fetch failed',
        message,
        target: targetUrl.toString(),
        method: request.method,
      },
      502,
    )
  }
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
