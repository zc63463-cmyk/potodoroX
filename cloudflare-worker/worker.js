/**
 * PomodoroX WebDAV Proxy Worker (JavaScript version for Dashboard paste)
 *
 * 用途：让浏览器跨过 CORS 访问坚果云等 WebDAV 服务
 * 部署：直接复制到 Cloudflare Workers 网页编辑器粘贴并 Deploy
 */

const ALLOWED_HOSTS = [
  'dav.jianguoyun.com',      // 坚果云
  'webdav.yandex.com',       // Yandex (备选)
  'dav.box.com',             // Box (备选)
]

const ALLOWED_METHODS = ['GET', 'PUT', 'PROPFIND', 'MKCOL', 'DELETE', 'OPTIONS', 'HEAD']

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Depth, Destination, Overwrite, If-Match, If-None-Match',
  'Access-Control-Expose-Headers': 'ETag, Last-Modified, Content-Length',
  'Access-Control-Max-Age': '86400',
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    const url = new URL(request.url)

    if (url.pathname === '/health') {
      return jsonResponse({ status: 'ok', service: 'pomodorox-webdav-proxy' })
    }

    if (url.pathname === '/' && !url.searchParams.has('url')) {
      return new Response(
        'PomodoroX WebDAV Proxy is running.\n\n' +
        'Usage: <method> /?url=<webdav-target-url>\n' +
        'Allowed hosts: ' + ALLOWED_HOSTS.join(', ') + '\n',
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain' } }
      )
    }

    const target = url.searchParams.get('url')
    if (!target) {
      return errorResponse(400, 'Missing required query parameter: url')
    }

    let targetUrl
    try {
      targetUrl = new URL(target)
    } catch {
      return errorResponse(400, 'Invalid target URL')
    }

    if (targetUrl.protocol !== 'https:') {
      return errorResponse(400, 'Only HTTPS targets are allowed')
    }

    if (!ALLOWED_HOSTS.includes(targetUrl.hostname)) {
      return errorResponse(
        403,
        'Target host not allowed. Allowed: ' + ALLOWED_HOSTS.join(', ')
      )
    }

    if (!ALLOWED_METHODS.includes(request.method)) {
      return errorResponse(405, 'Method ' + request.method + ' not allowed')
    }

    const passthroughHeaders = [
      'authorization',
      'content-type',
      'depth',
      'destination',
      'overwrite',
      'if-match',
      'if-none-match',
    ]
    const forwardHeaders = new Headers()
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
      return errorResponse(502, 'Proxy request failed: ' + message)
    }
  },
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function errorResponse(status, message) {
  return jsonResponse({ error: message }, status)
}
