# WebDAV 同步工程实现笔记

> **日期**: 2026-05-05
> **关联文档**: [架构文档](WebDavSync.structure.md)

---

## 1. 改动文件总览

| 文件 | 改动类型 | 说明 |
|------|---------|------|
| `api/webdav-proxy.js` | **新增** | Vercel Serverless Function WebDAV 代理 |
| `src/composables/useWebDavSync.ts` | **新增/修改** | WebDAV sync composable，支持 Tauri + Web 双端 |
| `src/views/SettingsView.vue` | **修改** | WebDAV 配置面板、测试连接、立即同步按钮 |
| `src-tauri/src/lib.rs` | **修改** | 新增 `webdav_put`、`webdav_get`、`webdav_test` 命令 |
| `src-tauri/Cargo.toml` | **修改** | 添加 `ureq`、`base64` 依赖 |
| `vercel.json` | **修改** | `/api/*` 排除 SPA rewrite |
| `cloudflare-worker/` | **已弃用** | 保留代码供参考，不再部署 |

---

## 2. `api/webdav-proxy.js` — Vercel 代理

### 2.1 选型决策

最初使用 Cloudflare Worker 作为代理，但发现 **Cloudflare Workers 无法向 Cloudflare CDN 保护的源站（坚果云）发起请求**，返回 520。因此迁移至 Vercel Node.js Serverless Function。

### 2.2 关键实现细节

#### ESM 导出（根 package.json 已设 `"type": "module"`）

```javascript
// ✅ 正确
export default async function handler(request, response) { }

// ❌ 错误（CommonJS 在 ESM 项目下会报 ReferenceError）
module.exports = async function handler(...) { }
```

#### Node.js `request.body` 不能传给 `fetch`

Node.js `IncomingMessage` 的 `body` 是流对象，必须显式读取为字符串后再传给 `fetch`：

```javascript
let bodyText = undefined
if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
  const chunks = []
  for await (const chunk of request) {
    chunks.push(chunk)
  }
  if (chunks.length > 0) {
    bodyText = Buffer.concat(chunks).toString('utf-8')
  }
}

const proxyResponse = await fetch(targetUrl, {
  method: request.method,
  headers: forwardHeaders,
  body: bodyText,
})
```

#### 坚果云 User-Agent 伪装

坚果云会拒绝非浏览器 User-Agent，因此强制覆盖：

```javascript
forwardHeaders['User-Agent'] =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ... Chrome/124.0.0.0 Safari/537.36'
```

### 2.3 部署验证

- `GET /api/webdav-proxy?health=1` → `{"status":"ok"}`
- `GET /api/webdav-proxy?url=https://dav.jianguoyun.com/dav/` → 返回使用文档

---

## 3. `useWebDavSync.ts` — 前端同步逻辑

### 3.1 Tauri / Web 双端分支

```typescript
const isAvailable = computed(() => {
  if (isTauri()) return true
  // Web 端：只要配置了服务器+用户名+密码即可
  return !!config.value
})
```

### 3.2 Web 端请求封装

```typescript
async function webProxyRequest(
  cfg: WebDavConfig,
  method: string,
  path: string,
  body?: string,
): Promise<Response> {
  const targetUrl = joinUrl(cfg.url, path)
  // 未配置自定义代理时，使用同域名 /api/webdav-proxy
  const proxy = cfg.proxyUrl || '/api/webdav-proxy'
  const reqUrl = `${proxy}/?url=${encodeURIComponent(targetUrl)}`
  const auth = btoa(`${cfg.username}:${cfg.password}`)
  const headers: Record<string, string> = {
    Authorization: `Basic ${auth}`,
  }

  // PROPFIND 必须带 Depth header（坚果云严格要求）
  if (method === 'PROPFIND') {
    headers['Depth'] = '0'
    headers['Content-Type'] = 'application/xml; charset=utf-8'
    body = body ?? '<?xml ...<D:allprop/>...</D:propfind>'
  } else if (method === 'PUT') {
    headers['Content-Type'] = 'application/json'
  }

  return fetch(reqUrl, { method, headers, body })
}
```

### 3.3 MKCOL 预创建目录（避免 409）

坚果云在文件父目录不存在时返回 409 Conflict（非标准 404）。因此在 `sync()` 和 `pushFile()` 两处预先创建目录：

```typescript
// sync() 开头
if (!isTauri()) {
  try {
    const dirPath = REMOTE_PATH.split('/').slice(0, -1).join('/') + '/'
    await webProxyRequest(config.value, 'MKCOL', dirPath)
  } catch { /* 忽略已存在 */ }
}

// pushFile() 内部
const parts = path.split('/')
if (parts.length > 1) {
  const parentDir = parts.slice(0, -1).join('/') + '/'
  try {
    await webProxyRequest(config.value, 'MKCOL', parentDir)
  } catch { /* 忽略已存在 */ }
}
```

### 3.4 GET 409 特殊处理

坚果云对不存在的文件返回 409，需与 404 同样视为"文件不存在"：

```typescript
const res = await webProxyRequest(config.value, 'GET', path)
if (res.status === 404 || res.status === 409) return null
```

---

## 4. `SettingsView.vue` — 配置面板

### 4.1 移除 Worker URL 配置

Web 端不再需要手动填写 Cloudflare Worker URL，代理已内建到同域名 `/api/webdav-proxy`。配置面板仅保留：

- 服务器地址（placeholder: `https://dav.jianguoyun.com/dav/`）
- 用户名
- 密码
- 测试连接按钮
- 立即同步按钮
- 上次同步时间显示

### 4.2 连接测试逻辑

```typescript
async function testWebDavConnection() {
  // 先保存配置到 localStorage
  saveWebDavConfig()
  const ok = await webDav.testConnection()
  webDavTestResult.value = ok
    ? { success: true, message: '连接成功！WebDAV 服务可用' }
    : { success: false, message: '连接失败，请检查地址、用户名和密码' }
}
```

---

## 5. Tauri 后端 Rust 命令

### 5.1 Cargo.toml 依赖

```toml
[dependencies]
ureq = "2.10"
base64 = "0.22"
```

### 5.2 核心命令签名

```rust
#[tauri::command]
fn webdav_test(url: String, username: String, password: String) -> Result<bool, String> { }

#[tauri::command]
fn webdav_put(url: String, username: String, password: String, path: String, content: String) -> Result<(), String> { }

#[tauri::command]
fn webdav_get(url: String, username: String, password: String, path: String) -> Result<String, String> { }
```

使用 `ureq` 进行 HTTP 请求，`base64` 编码 Basic Auth。

---

## 6. `vercel.json` 路由配置

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

关键：第一条规则**优先**排除 `/api/*` 路径，防止 SPA fallback 覆盖 Serverless Function。

---

## 7. 踩坑记录

### 7.1 Cloudflare Worker 520 错误

- **现象**: Worker → 坚果云返回 520
- **根因**: Cloudflare Workers 不能向 Cloudflare CDN 保护的源站发请求
- **解决**: 迁移至 Vercel Node.js Function

### 7.2 `module.exports` 在 ESM 项目下报错

- **现象**: `ReferenceError: module is not defined in ES module scope`
- **根因**: 根目录 `package.json` 设置了 `"type": "module"`
- **解决**: 改用 `export default`

### 7.3 Node.js `request.body` 不能直接传给 `fetch`

- **现象**: PUT 请求代理返回 502 `fetch failed`
- **根因**: `IncomingMessage` body 是流，不是 string/Buffer
- **解决**: 用 `for await` 读取 chunks，拼接为 Buffer 后再传给 fetch

### 7.4 坚果云 409 Conflict

- **现象**: GET 不存在的文件返回 409 而非 404
- **根因**: 父目录不存在时坚果云返回 409
- **解决**: 同步前先发 MKCOL 创建目录；GET 遇到 409 也视为 null

---

## 8. 测试清单

| 场景 | 命令/操作 | 期望结果 |
|------|----------|---------|
| 代理健康检查 | `GET /api/webdav-proxy?health=1` | `{"status":"ok"}` |
| 代理文档 | `GET /api/webdav-proxy` | 文本使用说明 |
| WebDAV 连接测试 | SettingsView → 测试连接 | 绿色提示"连接成功" |
| 首次同步 | SettingsView → 立即同步 | Console 无 409，时间戳更新 |
| 二次同步 | 再次点击立即同步 | 无重复上传，合并正确 |
| 多设备同步 | 另一浏览器打开同账号 | 数据一致，updatedAt 决定胜负 |
