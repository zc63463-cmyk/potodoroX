# PomodoroX WebDAV Proxy (Cloudflare Worker)

让浏览器可以访问 WebDAV 服务（如坚果云）的轻量代理。

**为什么需要它**：浏览器有 CORS 限制，无法直接调用坚果云 WebDAV API。这个 Worker 在 Cloudflare 边缘网络上转发请求并添加 CORS 头。

**特点**：
- 完全无状态，不存储任何凭据
- 仅允许白名单内的 WebDAV 主机（防止被滥用）
- 免费额度：10 万请求/天
- 国内访问快

---

## 部署方式

### 方式 A：网页 Dashboard 粘贴部署（最简单，无需安装工具）

1. 访问 [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
2. 点击 **Create Worker** → **Start with Hello World!**
3. 输入 Worker 名称，例如 `pomodorox-webdav-proxy`
4. 点击 **Deploy**（先部署默认代码）
5. 在 Worker 详情页点击 **Edit code**
6. 删除编辑器里的全部默认代码，**复制粘贴 `src/index.ts` 的全部内容**
7. 点击右上角 **Deploy**
8. 复制生成的 URL（形如 `https://pomodorox-webdav-proxy.<你的子域>.workers.dev`）
9. 在 PomodoroX 的「设置 → WebDAV 同步 → 代理 URL」字段填入此 URL

### 方式 B：使用 Wrangler CLI 部署（推荐长期维护）

```bash
# 1. 进入 worker 目录
cd cloudflare-worker

# 2. 安装依赖
npm install

# 3. 登录 Cloudflare（会打开浏览器授权）
npx wrangler login

# 4. 部署
npm run deploy

# 5. 查看实时日志（可选）
npm run tail
```

---

## 配置说明

### 修改允许的 WebDAV 主机

编辑 `src/index.ts` 顶部的 `ALLOWED_HOSTS` 数组，仅允许你信任的 WebDAV 服务：

```typescript
const ALLOWED_HOSTS = [
  'dav.jianguoyun.com',  // 坚果云
  // 'your-other-webdav.com',
]
```

修改后需重新部署。

### 测试 Worker 是否工作

```bash
# 健康检查
curl https://<your-worker-url>/health
# 期望返回: {"status":"ok","service":"pomodorox-webdav-proxy"}

# 根路径文档
curl https://<your-worker-url>/
```

---

## 工作原理

```
浏览器 ─请求─→ Worker ─转发─→ 坚果云 WebDAV
            （添加 CORS）   （透传 Authorization）
```

请求示例：

```
PUT https://<worker-url>/?url=https%3A%2F%2Fdav.jianguoyun.com%2Fdav%2Fpomodorox%2Freflections.json
Authorization: Basic <base64(username:password)>
Content-Type: application/json

{ "reflections": [...] }
```

Worker 会：
1. 校验 `url` 参数指向允许的主机
2. 透传 `Authorization` 等头部
3. 转发请求体
4. 给响应加上 CORS 头

---

## 安全须知

- Worker URL 是公开的，但**没有凭据就无法操作 WebDAV 数据**（坚果云会拒绝未授权请求）
- 请勿在代码中硬编码任何凭据
- 如担心被滥用，可在 Cloudflare Dashboard 给 Worker 添加访问规则（如 IP 白名单）

---

## 免费额度

Cloudflare Workers 免费层：
- **请求数**：100,000 次/天
- **CPU 时间**：10ms/请求
- 一次反思同步约 2-3 次请求，每天个人使用足够。
