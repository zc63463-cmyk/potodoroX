/**
 * PomodoroX WebDAV Proxy Worker (JavaScript version for Dashboard paste)
 *
 * 用途：让浏览器跨过 CORS 访问坚果云等 WebDAV 服务
 * 部署：直接复制到 Cloudflare Workers 网页编辑器粘贴并 Deploy
 */

const ALLOWED_HOSTS = [
  "dav.jianguoyun.com", // 坚果云
  "webdav.yandex.com", // Yandex (备选)
  "dav.box.com", // Box (备选)
];

const ALLOWED_METHODS = [
  "GET",
  "PUT",
  "PROPFIND",
  "MKCOL",
  "DELETE",
  "OPTIONS",
  "HEAD",
];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": ALLOWED_METHODS.join(", "),
  "Access-Control-Allow-Headers":
    "Authorization, Content-Type, Depth, Destination, Overwrite, If-Match, If-None-Match",
  "Access-Control-Expose-Headers": "ETag, Last-Modified, Content-Length",
  "Access-Control-Max-Age": "86400",
};

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return jsonResponse({ status: "ok", service: "pomodorox-webdav-proxy" });
    }

    if (url.pathname === "/" && !url.searchParams.has("url")) {
      return new Response(
        "PomodoroX WebDAV Proxy is running.\n\n" +
          "Usage: <method> /?url=<webdav-target-url>\n" +
          "Allowed hosts: " +
          ALLOWED_HOSTS.join(", ") +
          "\n",
        {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "text/plain" },
        }
      );
    }

    const target = url.searchParams.get("url");
    if (!target) {
      return errorResponse(400, "Missing required query parameter: url");
    }

    let targetUrl;
    try {
      targetUrl = new URL(target);
    } catch {
      return errorResponse(400, "Invalid target URL");
    }

    if (targetUrl.protocol !== "https:") {
      return errorResponse(400, "Only HTTPS targets are allowed");
    }

    if (!ALLOWED_HOSTS.includes(targetUrl.hostname)) {
      return errorResponse(
        403,
        "Target host not allowed. Allowed: " + ALLOWED_HOSTS.join(", ")
      );
    }

    if (!ALLOWED_METHODS.includes(request.method)) {
      return errorResponse(405, "Method " + request.method + " not allowed");
    }

    const passthroughHeaders = [
      "authorization",
      "content-type",
      "content-length",
      "depth",
      "destination",
      "overwrite",
      "if-match",
      "if-none-match",
      "accept",
    ];
    const forwardHeaders = new Headers();
    for (const [key, value] of request.headers) {
      if (passthroughHeaders.includes(key.toLowerCase())) {
        forwardHeaders.set(key, value);
      }
    }
    // 坚果云会拒绝非浏览器/非已知客户端的 User-Agent
    // 强制设置标准 UA（覆盖任何浏览器原始头）
    forwardHeaders.set(
      "User-Agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    // PROPFIND/PUT 等带 body 的请求需要先读取 body（Cloudflare Workers 对流式转发有限制）
    const hasBody = !["GET", "HEAD", "OPTIONS"].includes(request.method);
    let bodyText = undefined;
    if (hasBody) {
      try {
        bodyText = await request.text();
      } catch (err) {
        return errorResponse(
          400,
          "Failed to read request body: " + ((err && err.message) || err)
        );
      }
    }

    try {
      const proxyResponse = await fetch(targetUrl.toString(), {
        method: request.method,
        headers: forwardHeaders,
        body: bodyText,
      });

      const responseHeaders = new Headers(proxyResponse.headers);
      for (const [key, value] of Object.entries(CORS_HEADERS)) {
        responseHeaders.set(key, value);
      }
      // 调试：暴露上游状态到自定义 header（便于浏览器 DevTools 查看）
      responseHeaders.set("X-Upstream-Status", String(proxyResponse.status));

      // 上游 5xx 时：读取 body 并以 JSON 形式返回详细诊断信息
      if (proxyResponse.status >= 500) {
        const upstreamBody = await proxyResponse.text();
        return jsonResponse(
          {
            error: "Upstream WebDAV server error",
            upstreamStatus: proxyResponse.status,
            upstreamStatusText: proxyResponse.statusText,
            upstreamBody: upstreamBody.slice(0, 2000),
            target: targetUrl.toString(),
            method: request.method,
          },
          502
        );
      }

      return new Response(proxyResponse.body, {
        status: proxyResponse.status,
        statusText: proxyResponse.statusText,
        headers: responseHeaders,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown proxy error";
      return jsonResponse(
        {
          error: "Proxy fetch failed",
          message,
          target: targetUrl.toString(),
          method: request.method,
        },
        502
      );
    }
  },
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function errorResponse(status, message) {
  return jsonResponse({ error: message }, status);
}
