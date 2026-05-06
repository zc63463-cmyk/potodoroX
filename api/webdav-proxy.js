/**
 * Vercel Serverless Function: WebDAV Proxy
 *
 * 用途：让浏览器跨过 CORS 访问坚果云等 WebDAV 服务
 */

const ALLOWED_HOSTS = [
  "dav.jianguoyun.com",
  "webdav.yandex.com",
  "dav.box.com",
];

const ALLOWED_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PROPFIND",
  "MKCOL",
  "DELETE",
  "OPTIONS",
  "HEAD",
];
const ALLOWED_UPSTREAM_METHODS = [
  "GET",
  "PUT",
  "PROPFIND",
  "MKCOL",
  "DELETE",
  "HEAD",
];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": ALLOWED_METHODS.join(", "),
  "Access-Control-Allow-Headers":
    "Authorization, Content-Type, Depth, Destination, Overwrite, If-Match, If-None-Match, X-HTTP-Method-Override",
  "Access-Control-Expose-Headers":
    "ETag, Last-Modified, Content-Length, X-Upstream-Status",
  "Access-Control-Max-Age": "86400",
};

export default async function handler(request, response) {
  // 处理 CORS 预检
  if (request.method === "OPTIONS") {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.setHeader(key, value);
    });
    return response.status(204).end();
  }

  const url = new URL(request.url, `https://${request.headers.host}`);

  // 健康检查
  if (url.searchParams.get("health") === "1") {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.setHeader(key, value);
    });
    return response
      .status(200)
      .json({ status: "ok", service: "pomodorox-webdav-proxy" });
  }

  // 根路径文档
  if (!url.searchParams.has("url")) {
    Object.entries({ ...CORS_HEADERS, "Content-Type": "text/plain" }).forEach(
      ([key, value]) => {
        response.setHeader(key, value);
      }
    );
    return response
      .status(200)
      .send(
        "PomodoroX WebDAV Proxy (Vercel)\n\n" +
          "Usage: <method> /api/webdav-proxy?url=<webdav-target-url>\n" +
          "Allowed hosts: " +
          ALLOWED_HOSTS.join(", ") +
          "\n"
      );
  }

  // 解析目标 URL
  const target = url.searchParams.get("url");
  if (!target) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.setHeader(key, value);
    });
    return response
      .status(400)
      .json({ error: "Missing required query parameter: url" });
  }

  let targetUrl;
  try {
    targetUrl = new URL(target);
  } catch {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.setHeader(key, value);
    });
    return response.status(400).json({ error: "Invalid target URL" });
  }

  // 仅允许 HTTPS
  if (targetUrl.protocol !== "https:") {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.setHeader(key, value);
    });
    return response
      .status(400)
      .json({ error: "Only HTTPS targets are allowed" });
  }

  // 校验目标主机
  if (!ALLOWED_HOSTS.includes(targetUrl.hostname)) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.setHeader(key, value);
    });
    return response.status(403).json({
      error: "Target host not allowed. Allowed: " + ALLOWED_HOSTS.join(", "),
    });
  }

  // 校验 HTTP 方法
  if (!ALLOWED_METHODS.includes(request.method)) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.setHeader(key, value);
    });
    return response
      .status(405)
      .json({ error: "Method " + request.method + " not allowed" });
  }

  const overrideHeader = request.headers["x-http-method-override"];
  const overrideMethod = Array.isArray(overrideHeader)
    ? overrideHeader[0]
    : overrideHeader;
  const upstreamMethod = (overrideMethod || request.method).toUpperCase();

  if (!ALLOWED_UPSTREAM_METHODS.includes(upstreamMethod)) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.setHeader(key, value);
    });
    return response
      .status(405)
      .json({ error: "WebDAV method " + upstreamMethod + " not allowed" });
  }

  // 透传关键 headers
  const passthroughHeaders = [
    "authorization",
    "content-type",
    "depth",
    "destination",
    "overwrite",
    "if-match",
    "if-none-match",
    "accept",
  ];
  const forwardHeaders = {};
  for (const key of passthroughHeaders) {
    const value = request.headers[key];
    if (value) {
      forwardHeaders[key] = value;
    }
  }

  // 坚果云会拒绝非浏览器/非已知客户端的 User-Agent
  forwardHeaders["User-Agent"] =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

  // 读取 request body（Node.js IncomingMessage 不能直接传给 fetch）
  let bodyText = undefined;
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const chunks = [];
    for await (const chunk of request) {
      chunks.push(chunk);
    }
    if (chunks.length > 0) {
      bodyText = Buffer.concat(chunks).toString("utf-8");
    }
  }

  try {
    // Node.js 18+ 内置 fetch
    const proxyResponse = await fetch(targetUrl.toString(), {
      method: upstreamMethod,
      headers: forwardHeaders,
      body: bodyText,
    });

    // 设置 CORS 响应头
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.setHeader(key, value);
    });
    // 暴露上游状态
    response.setHeader("X-Upstream-Status", String(proxyResponse.status));

    // 上游 5xx 时读取 body
    if (proxyResponse.status >= 500) {
      const upstreamBody = await proxyResponse.text();
      return response.status(502).json({
        error: "Upstream WebDAV server error",
        upstreamStatus: proxyResponse.status,
        upstreamStatusText: proxyResponse.statusText,
        upstreamBody: upstreamBody.slice(0, 2000),
        target: targetUrl.toString(),
        method: upstreamMethod,
        inboundMethod: request.method,
      });
    }

    // 透传上游响应
    const contentType = proxyResponse.headers.get("content-type");
    if (contentType) {
      response.setHeader("Content-Type", contentType);
    }
    const upstreamBody = await proxyResponse.text();
    return response.status(proxyResponse.status).send(upstreamBody);
  } catch (err) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.setHeader(key, value);
    });
    const message = err instanceof Error ? err.message : "Unknown proxy error";
    return response.status(502).json({
      error: "Proxy fetch failed",
      message,
      target: targetUrl.toString(),
      method: upstreamMethod,
      inboundMethod: request.method,
    });
  }
}
