# PomodoroX 反思模块导出与同步设计文档

**日期**: 2026-05-05
**状态**: 已批准，待实现
**范围**: 反思数据导出、本地文件导入、WebDAV 同步（Tauri 独占）

---

## 1. 背景与目标

### 1.1 现状
- **保存**: 已支持自动保存（1.5s debounce）+ 手动保存，数据写入 IndexedDB/SQLite
- **同步**: 已支持 GitHub 仓库同步（JSON 格式，按月分文件），但需梯子
- **导出**: Settings 页支持全量 JSON 备份；Stats 页支持综合报告导出（MD/CSV/JSON）
- **缺失**: 反思模块内无直接导出入口；无国内可用的独立同步方式

### 1.2 目标
1. **反思页导出按钮**: 编辑页和浏览 Modal 可直接导出单条反思为 Markdown/JSON
2. **本地文件导入**: Settings 页支持导入 JSON/Markdown 格式的反思文件，处理冲突
3. **WebDAV 同步（Tauri 独占）**: 通过坚果云等 WebDAV 服务实现跨设备双向同步

---

## 2. 功能范围

### 2.1 In-Scope
- 单条反思导出（Markdown / JSON）
- 批量/单条反思导入（JSON / Markdown）
- WebDAV 配置、连接测试、双向同步
- 冲突处理（以 `updatedAt` 为准）
- Tauri 环境检测与降级提示

### 2.2 Out-of-Scope
- Web 端 WebDAV 同步（CORS 限制，后续实测可用时解锁）
- 飞书/Base 同步（CORS 限制）
- 自动定时同步（仅手动 + 保存后自动推送）
- 端到端加密

---

## 3. 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                        Web 端 (Vercel)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ 导出按钮      │  │ 导入按钮      │  │ GitHub 同步         │  │
│  │ (MD/JSON)    │  │ (文件上传)    │  │ (已有)             │  │
│  └──────────────┘  └──────────────┘  └────────────────────┘  │
│                                                              │
│  WebDAV 不可用 → 显示"请使用桌面端"提示                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Tauri 桌面端                              │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ 导出按钮      │  │ 导入按钮      │  │ GitHub 同步         │  │
│  └──────────────┘  └──────────────┘  └────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ WebDAV 同步 (Rust HTTP 调用，绕过 CORS)                  │  │
│  │  • 推送: PUT reflections.json                           │  │
│  │  • 拉取: GET reflections.json                           │  │
│  │  • 合并: 按 updatedAt 时间戳冲突解决                     │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. 模块设计

### 4.1 导出模块 (`src/utils/exportReflection.ts`)

```typescript
// 导出单条反思为 Markdown
export function exportReflectionAsMarkdown(reflection: Reflection): string

// 导出单条反思为 JSON
export function exportReflectionAsJson(reflection: Reflection): string

// 下载文件到本地
export function downloadFile(content: string, filename: string, mimeType: string): void
```

**Markdown 格式**:
```markdown
---
date: 2026-05-05
mood: good
tags:
  - 极简日记
  - 明日计划
---

# 内容正文...
```

**JSON 格式**:
```json
{
  "version": "pomodorox-reflection-1.0",
  "exportedAt": "2026-05-05T12:00:00Z",
  "reflection": {
    "date": "2026-05-05",
    "mood": "good",
    "tags": ["极简日记"],
    "content": "内容正文..."
  }
}
```

### 4.2 导入模块 (`src/utils/importReflection.ts`)

```typescript
interface ImportResult {
  reflections: Reflection[]
  conflicts: Array<{ date: string; existing: Reflection; incoming: Reflection }>
}

// 从文件内容解析
export function parseImportFile(content: string, filename: string): ImportResult

// 处理冲突（用户选择替换/跳过）
export async function resolveConflicts(
  conflicts: ImportResult['conflicts'],
  resolution: 'replace' | 'skip' | 'ask'
): Promise<void>
```

**支持的格式**:
- 单条 JSON: `{ version, reflection }`
- 批量 JSON: `{ version, reflections: [] }`（来自 Settings 页全量导出）
- Markdown: 解析 YAML frontmatter + 正文

### 4.3 WebDAV 同步模块 (`src/composables/useWebDavSync.ts`)

```typescript
interface WebDavConfig {
  url: string
  username: string
  password: string
}

interface SyncResult {
  success: boolean
  message: string
  pushed: number
  pulled: number
}

export function useWebDavSync() {
  // 配置管理（Tauri store 加密存储）
  const config = ref<WebDavConfig | null>(loadConfig())
  const isConfigured = computed(() => !!config.value)
  
  // 环境检测
  const isAvailable = computed(() => isTauri())
  
  // 连接测试
  async function testConnection(): Promise<boolean>
  
  // 双向同步
  async function sync(): Promise<SyncResult>
  
  // 自动推送（保存后 debounce 5s）
  async function autoPush(reflections: Reflection[]): Promise<void>
}
```

**存储结构**:
```
dav-root/
  pomodorox/
    reflections.json     # 全部反思数组
    last-sync.json       # { timestamp, deviceId }
```

**冲突解决**:
- 比较本地与远程每条反思的 `updatedAt`
- 较新者覆盖较旧者
- 相同时间戳 → 本地优先

### 4.4 环境检测工具

```typescript
// src/utils/platform.ts
export function isTauri(): boolean {
  return typeof window !== 'undefined' && 
         (window as any).__TAURI__ !== undefined
}
```

---

## 5. UI 设计

### 5.1 反思编辑页 (`ReflectionEditor.vue`)

顶部工具栏右侧增加导出按钮组：

```
[😊 心情选择]  [标签]  [快速模板]  [导出 ▼]
                                    ├─ Markdown
                                    └─ JSON
```

- hover 时显示下拉格式选择
- 点击后触发下载
- Toast 提示"导出成功"

### 5.2 浏览 Modal (`ReflectionDetailModal.vue`)

底部操作区（只读模式时显示）：

```
[关闭]           [导出 ▼]  [进入编辑]
                  ├─ Markdown
                  └─ JSON
```

编辑模式下隐藏导出按钮（防止与保存操作混淆）。

### 5.3 设置页 (`SettingsView.vue`)

**数据管理区域**新增：

```
┌─────────────────────────────┐
│ 导入反思                     │
│ [选择文件 / 拖放至此]         │
│ 支持 .json 和 .md 格式       │
└─────────────────────────────┘

┌─────────────────────────────┐
│ WebDAV 同步 (仅限桌面端)      │
│                             │
│ 服务器地址: [________________]│
│ 用户名:    [________________]│
│ 密码:      [________________]│
│                             │
│ [测试连接]  [立即同步]        │
│ 上次同步: 2026-05-05 12:00  │
│                             │
│ ⚠️ WebDAV 同步功能仅限桌面端使用│
└─────────────────────────────┘
```

Web 端显示灰色禁用状态 + 提示文字。

### 5.4 冲突处理弹窗

导入发现冲突时弹出：

```
┌─────────────────────────────────────┐
│ 发现 3 条冲突                        │
│                                     │
│ 2026-05-05  已有: 极简日记          │
│            [替换] [跳过]              │
│                                     │
│ 2026-05-04  已有: 情绪复盘          │
│            [替换] [跳过]              │
│                                     │
│           [全部替换] [全部跳过] [取消]│
└─────────────────────────────────────┘
```

---

## 6. 错误处理

| 场景 | 行为 |
|------|------|
| 导出失败 | `appStore.showToast('导出失败', 'error')` |
| 导入格式错误 | Toast + 控制台详细日志 |
| 导入冲突 | 弹窗列出冲突项，用户选择 |
| WebDAV 连接超时 | Toast "连接超时，请检查服务器地址" |
| WebDAV 401 | Toast "用户名或密码错误" |
| WebDAV 404 | 自动创建目录和文件 |
| 非 Tauri 访问 WebDAV | 面板禁用 + 提示 "仅限桌面端" |
| 同步冲突（并发修改） | 以 `updatedAt` 为准覆盖，Toast 提示覆盖条数 |

---

## 7. 平台限制

| 功能 | Web 端 | Tauri 桌面端 |
|------|--------|--------------|
| 导出按钮 | ✅ | ✅ |
| 本地导入 | ✅ (文件上传) | ✅ (文件选择器) |
| WebDAV 同步 | ❌ CORS | ✅ Rust HTTP |
| GitHub 同步 | ✅ | ✅ |
| 自动推送 | ❌ | ✅ (保存后 5s debounce) |

**Web 端 WebDAV 说明**:
- 坚果云等 WebDAV 服务通常不开放浏览器 CORS
- 后续若实测某服务支持 CORS，可通过配置白名单解锁 Web 端

---

## 8. 数据安全

- **WebDAV 密码**: Tauri 端使用 `tauri-plugin-store` 加密存储；Web 端不涉及
- **传输**: WebDAV over HTTPS（强制验证 URL 以 https:// 开头）
- **本地导出文件**: 不加密，由用户自行管理

---

## 9. 测试要点

### 9.1 导出测试
- [ ] 单条 Markdown 导出包含正确 frontmatter
- [ ] 单条 JSON 导出包含 version 字段
- [ ] 中文文件名正常下载

### 9.2 导入测试
- [ ] JSON 单条导入成功
- [ ] JSON 批量导入成功
- [ ] Markdown 带 frontmatter 导入成功
- [ ] Markdown 无 frontmatter 导入（默认 mood='normal'）
- [ ] 冲突检测正确
- [ ] 替换/跳过/全部替换功能正常

### 9.3 WebDAV 测试
- [ ] Tauri 环境检测正确
- [ ] Web 端显示禁用提示
- [ ] 连接测试成功/失败提示
- [ ] 首次同步创建目录
- [ ] 推送后拉取数据一致
- [ ] 冲突时较新数据覆盖较旧
- [ ] 自动推送 debounce 5s

---

## 10. 未来扩展

| 功能 | 优先级 | 说明 |
|------|--------|------|
| Web 端 WebDAV | 低 | 等坚果云开放 CORS 或使用代理 |
| 自动定时同步 | 低 | 每 30 分钟自动同步 |
| 端到端加密 | 低 | 同步前加密数据 |
| 多设备冲突 UI | 低 | 可视化三路合并 |
