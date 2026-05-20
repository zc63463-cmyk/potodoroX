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

  // 根路径文档（无 url 且无 t 参数时）
  if (!url.searchParams.has("url") && !url.searchParams.has("t")) {
    Object.entries({ ...CORS_HEADERS, "Content-Type": "text/plain" }).forEach(
      ([key, value]) => {
        response.setHeader(key, value);
      }
    );
    return response
      .status(200)
      .send(
        "PomodoroX WebDAV Proxy (Vercel)\n\n" +
          "Usage: <method> /api/webdav-proxy?t=<base64-target-url>\n" +
          "Allowed hosts: " +
          ALLOWED_HOSTS.join(", ") +
          "\n"
      );
  }

  // 解析目标 URL（支持 base64 编码参数 t，绕过 WAF 的 https:// 检测）
  let target = url.searchParams.get("url");
  const encoded = url.searchParams.get("t");
  if (!target && encoded) {
    try {
      target = Buffer.from(encoded, "base64").toString("utf-8");
    } catch {
      target = null;
    }
  }
  if (!target) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.setHeader(key, value);
    });
    return response
      .status(400)
      .json({ error: "Missing required query parameter: url or t" });
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

  /** 请求体大小限制（10MB） */
  const MAX_BODY_SIZE = 10 * 1024 * 1024;

  /**
   * 读取 request body — 多策略兜底
   *
   * Vercel Serverless Function 的 Node.js runtime 中，IncomingMessage
   * 的 body stream 行为因版本而异。`for await` 在某些 runtime 版本中可能
   * 提前结束（返回空 chunks），导致 PROPFIND 等依赖 body 的 WebDAV 方法
   * 收到 400 Bad Request。
   *
   * 策略优先级：
   *   1. request.body（Vercel 预解析的 buffer/string）
   *   2. event-based `data`/`end` 监听（最兼容，避免 async iterator 差异）
   *   3. for await 兜底
   */
  async function readRequestBody(req) {
    // 策略 1：Vercel 可能已预解析 body
    if (req.body !== undefined && req.body !== null) {
      if (Buffer.isBuffer(req.body)) return req.body.toString("utf-8");
      if (typeof req.body === "string") return req.body;
    }

    // 策略 2：事件驱动读取（最兼容 Node.js streams，含 Vercel runtime）
    const contentLength = parseInt(req.headers["content-length"], 10);
    if (contentLength > 0 && contentLength <= MAX_BODY_SIZE) {
      try {
        const result = await new Promise((resolve) => {
          const chunks = [];
          let total = 0;
          let settled = false;
          const finish = () => {
            if (settled) return;
            settled = true;
            resolve(
              chunks.length > 0
                ? Buffer.concat(chunks).toString("utf-8")
                : undefined
            );
          };
          req.on("data", (chunk) => {
            total += chunk.length;
            if (total > MAX_BODY_SIZE) {
              settled = true;
              req.destroy();
              resolve(undefined);
              return;
            }
            chunks.push(chunk);
          });
          req.on("end", finish);
          req.on("error", finish);
          // 安全超时：5 秒内无 data 事件则放弃
          setTimeout(finish, 5000);
        });
        if (result !== undefined) return result;
      } catch {
        // 事件读取失败，继续降级
      }
    }

    // 策略 3：for await 兜底（旧方式）
    try {
      const chunks = [];
      let totalSize = 0;
      for await (const chunk of req) {
        totalSize += chunk.length;
        if (totalSize > MAX_BODY_SIZE) return undefined;
        chunks.push(chunk);
      }
      if (chunks.length > 0) return Buffer.concat(chunks).toString("utf-8");
    } catch {
      // 所有策略均失败
    }

    return undefined;
  }

  let bodyText = undefined;
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    bodyText = await readRequestBody(request);

    // 关键防护：WebDAV 方法（PROPFIND/MKCOL）若依赖 body 但读取为空，
    // 不要盲转给上游（上游可能返回误导性 400），直接返回明确错误。
    const needsBodyMethods = ["PROPFIND", "MKCOL", "PUT", "DELETE"];
    const actualMethod = (overrideMethod || request.method).toUpperCase();
    if (
      (!bodyText || bodyText.length === 0) &&
      needsBodyMethods.includes(actualMethod)
    ) {
      const contentLength = parseInt(request.headers["content-length"], 10);
      // 如果客户端声明了 Content-Length > 0 但 body 没读到，说明平台吞了 body
      if (contentLength > 0) {
        Object.entries(CORS_HEADERS).forEach(([key, value]) => {
          response.setHeader(key, value);
        });
        return response.status(502).json({
          error: "Request body not captured by serverless function",
          detail: `Content-Length was ${contentLength} but body is empty. This is a platform-level issue. Please retry or redeploy.`,
          target: targetUrl.toString(),
          method: actualMethod,
        });
      }
    }
  }

  try {
    // Node.js 18+ 内置 fetch，带 30s 超时
    // 内部跟随 3xx 重定向（避免浏览器 fetch 自动跟随导致 URL 解析异常）
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    let proxyResponse = await fetch(targetUrl.toString(), {
      method: upstreamMethod,
      headers: forwardHeaders,
      body: bodyText,
      redirect: "manual",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    // 内部跟随 3xx 重定向（最多 5 次，防循环）
    let redirectCount = 0;
    const MAX_REDIRECTS = 5;
    while (
      proxyResponse.status >= 300 &&
      proxyResponse.status < 400 &&
      redirectCount < MAX_REDIRECTS
    ) {
      const location = proxyResponse.headers.get("location");
      if (!location) break;
      // 解析绝对/相对 Location
      const redirectUrl = new URL(location, targetUrl.toString());
      // 只允许同 host 重定向（防 SSRF）
      if (!ALLOWED_HOSTS.includes(redirectUrl.hostname)) {
        Object.entries(CORS_HEADERS).forEach(([key, value]) => {
          response.setHeader(key, value);
        });
        return response.status(403).json({
          error: "Redirect target host not allowed",
          location: location,
        });
      }
      const redirectController = new AbortController();
      const redirectTimeout = setTimeout(
        () => redirectController.abort(),
        30000
      );
      proxyResponse = await fetch(redirectUrl.toString(), {
        method: upstreamMethod,
        headers: forwardHeaders,
        body: bodyText,
        redirect: "manual",
        signal: redirectController.signal,
      });
      clearTimeout(redirectTimeout);
      redirectCount++;
    }

    // 设置 CORS 响应头
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.setHeader(key, value);
    });
    // 暴露上游状态
    response.setHeader("X-Upstream-Status", String(proxyResponse.status));

    // 上游 5xx 时读取 body（限制长度避免内存爆炸）
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

    // 透传上游响应（限制 50MB，避免大文件缓冲导致内存爆炸）
    const MAX_PROXY_BODY = 50 * 1024 * 1024;
    const contentType = proxyResponse.headers.get("content-type");
    if (contentType) {
      response.setHeader("Content-Type", contentType);
    }
    const upstreamBuffer = await proxyResponse.arrayBuffer();
    if (upstreamBuffer.byteLength > MAX_PROXY_BODY) {
      return response.status(413).json({
        error: "Upstream response exceeds 50MB limit",
        limit: "50MB",
        receivedBytes: upstreamBuffer.byteLength,
      });
    }
    return response
      .status(proxyResponse.status)
      .send(Buffer.from(upstreamBuffer));
  } catch (err) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.setHeader(key, value);
    });
    const message = err instanceof Error ? err.message : "Unknown proxy error";
    const isTimeout = message?.includes("abort") || message?.includes("Abort");
    return response.status(isTimeout ? 504 : 502).json({
      error: isTimeout ? "Proxy timeout" : "Proxy fetch failed",
      message,
      target: targetUrl.toString(),
      method: upstreamMethod,
      inboundMethod: request.method,
    });
  }
}
