# PomodoroX 移动端 Web 适配 - 系统设计

> **版本**: v1.0 | **日期**: 2026-05-03 | **状态**: 待评审
> **负责人**: 高见远（架构师）
> **基于 PRD**: `docs/prd-mobile.md`

---

## 1. 实现方案概述

### 1.1 总体策略：增量修改，最小变更

采用**纯 CSS 响应式 + 后端无关**策略。不在移动端引入新的 UI 框架，不改变桌面端代码结构。所有修改都是**增量式**的：

- **数据库层**：MemoryStore 增加 localStorage 持久化（不需要额外依赖）
- **UI 层**：在各 View 的 scoped style 中追加 `@media` 响应式规则；全局样式新增 CSS 变量定义的断点
- **构建层**：新增 `build:web` npm script，复用现有 Vite 配置
- **开发体验**：启动时显示局域网 IP，方便手机访问

### 1.2 核心架构决策

| 决策 | 选项 | 选择理由 |
|------|------|---------|
| 响应式方案 | Tailwind + CSS 变量 + `@media` | 已使用 Tailwind，CSS 变量已定义，零新增依赖 |
| 移动端存储 | localStorage（通过 MemoryStore 封装） | 纯浏览器可用，零依赖，Settings Store 已有先例 |
| 移动端导航 | 底部 Tab Bar（固定） | PRD 要求，桌面版底部导航已存在，仅需响应式调整 |
| 表单弹窗 | 底部弹层（Bottom Sheet）替代居中模态框 | 移动端触摸友好，PRD US-02 要求 |
| 看板降级 | 水平滑动标签 + 操作菜单 | 不引入拖拽库，PRD 明确要求 |
| Three.js 降级 | 检测 `devicePixelRatio` + `hardwareConcurrency` | PRD Q2 待确认，先实现检测逻辑 |
| PWA | 本次追加 manifest.json（P2） | PRD Q4 待确认，先做基础支持 |

### 1.3 数据流变更

```
桌面端（Tauri）                             移动端（Web）
┌───────────────────────┐                  ┌───────────────────────┐
│  SqliteDatabase       │                  │  MemoryStore          │
│  (Tauri plugin-sql)   │                  │  + localStorage       │
│                       │                  │                       │
│  DB ←→ MemoryStore    │  同一代码库       │  localStorage ←→     │
│          ↓            │ ←──────────────→ │  MemoryStore          │
│  GitHub Sync          │  不同数据库实例    │          ↓           │
│                       │                  │  GitHub Sync          │
└───────────────────────┘                  └───────────────────────┘
```

**关键变更**：
- `createDatabase()` 在非 Tauri 环境下仍然走 MemoryStore，但现在 MemoryStore 会在每次写入后自动 `saveToLocalStorage()`
- 启动时 MemoryStore 先 `loadFromLocalStorage()` 恢复数据
- 设置仍走 `localStorage.getItem('pomodorox-settings')`（Settings Store 已有兜底逻辑，无需变更）

---

## 2. 文件列表

### 2.1 需要新增的文件

| 文件路径 | 职责 |
|---------|------|
| `public/manifest.json` | PWA Manifest（移入 P2 范围，但先创建基础版本） |
| `public/sw.js` | Service Worker 骨架（先创建，离线缓存作为 P2 推迟） |
| `src/styles/responsive.css` | 响应式 CSS 变量和工具类 |

### 2.2 需要修改的文件

| 文件路径 | 修改范围 |
|---------|---------|
| **`src/services/database.ts`** | MemoryStore 类新增 `saveToLocalStorage()`、`loadFromLocalStorage()`、`autoSave` 机制 |
| **`src/App.vue`** | 响应式：顶部栏高度从 56px → 44px（移动端），底部导航标签图标、间距缩小 |
| **`src/style.css`** | 新增响应式 CSS 变量断点（`--breakpoint-mobile`、`--breakpoint-tablet`）；新增 `modal-content` 移动端全屏覆盖 |
| **`index.html`** | 新增移动端 meta 标签：`apple-mobile-web-app-capable`、`apple-mobile-web-app-status-bar-style`、`format-detection=telephone=no`、`theme-color` 更新 |
| **`vite.config.ts`** | 新增 `build:web` 条件逻辑（当 `VITE_BUILD_WEB=true` 时调整 `base` 和输出目录） |
| **`package.json`** | 新增 `build:web`、`dev:lan` 两个 npm script |
| **`src/views/TimerView.vue`** | 响应式：计时器数字 `font-size` 调整，环形进度缩放，模式芯片水平滚动，关联任务选择器底部弹层 |
| **`src/views/TasksView.vue`** | 响应式：看板视图在 < 640px 下降级为水平标签 + 操作菜单；新建/编辑任务表单使用底部弹层；FAB 悬浮按钮 |
| **`src/views/ReflectionsView.vue`** | 响应式：编辑面板全宽，隐藏右侧边栏，键盘适配（`scrollIntoView`），编辑器占满可用高度 |
| **`src/views/StatsView.vue`** | 响应式：统计卡片单列网格，图表纵向排列，导出按钮全宽 |
| **`src/views/SettingsView.vue`** | 响应式：`settings-body` max-width 去限制，表单输入框 100% 宽，主题卡片移动端 2 列，操作按钮全宽堆叠 |
| **`src/components/GlobalSearch.vue`** | 移动端：搜索弹窗全屏覆盖，输入框字体大小 16px（防 iOS zoom），结果列表可滚动 |
| **`src/components/ToastContainer.vue`** | 移动端：Toast 从右上角改为顶部居中 + 水平满宽 |
| **`src/components/MagicRings.vue`** | 移动端性能：检测低端设备跳过渲染；touch 事件兼容处理 |

---

## 3. 数据结构和接口（设计）

### 3.1 MemoryStore 持久化方案

#### 3.1.1 新增方法

```typescript
class MemoryStore {
  // ... 现有属性和方法保持不变 ...

  /**
   * localStorage Key 常量
   * 单 key 存全部数据，保证写入原子性
   */
  private static readonly STORAGE_KEY = 'pomodorox-memorystore'

  /**
   * 序列化所有数据到 localStorage
   * 在每次创建/更新/删除操作后自动调用
   * 使用 try-catch 处理 localStorage 满的情况
   */
  async saveToLocalStorage(): Promise<void> {
    if (typeof localStorage === 'undefined') return
    try {
      const data = {
        tasks: Array.from(this.tasks.entries()),
        reflections: Array.from(this.reflections.entries()),
        sessions: Array.from(this.sessions.entries()),
        syncLog: this.syncLog,
      }
      localStorage.setItem(MemoryStore.STORAGE_KEY, JSON.stringify(data))
    } catch (err) {
      console.warn('[MemoryStore] localStorage 写入失败，可能已满:', err)
    }
  }

  /**
   * 从 localStorage 恢复数据
   * 在 init() 时调用
   */
  async loadFromLocalStorage(): Promise<void> {
    if (typeof localStorage === 'undefined') return
    try {
      const raw = localStorage.getItem(MemoryStore.STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (data.tasks) this.tasks = new Map(data.tasks)
      if (data.reflections) this.reflections = new Map(data.reflections)
      if (data.sessions) this.sessions = new Map(data.sessions)
      if (data.syncLog) this.syncLog = data.syncLog
      console.log('[MemoryStore] 已从 localStorage 恢复数据')
    } catch (err) {
      console.warn('[MemoryStore] localStorage 数据解析失败，使用空数据:', err)
    }
  }

  /**
   * 自动保存标志
   * 在 init() 中根据环境启用
   */
  private autoSaveEnabled = false

  /**
   * 覆写 init()：新增 localStorage 恢复 + autoSave 启用
   */
  async init(): Promise<void> {
    await this.loadFromLocalStorage()
    // 非 Tauri 环境下启用 autoSave（浏览器/移动端 Web）
    if (typeof localStorage !== 'undefined' && !isTauriAvailable()) {
      this.autoSaveEnabled = true
    }
  }
}
```

#### 3.1.2 修改点

每个会改变数据的方法（create/update/delete/markSynced/clearAll）在返回前追加：

```typescript
if (this.autoSaveEnabled) {
  await this.saveToLocalStorage()
}
```

具体修改点：
- `createTask()` — 第 56 行 `this.tasks.set()` 后加 autoSave
- `updateTask()` — 第 79 行后加 autoSave
- `deleteTask()` — 第 84 行后加 autoSave
- `markTaskSynced()` — 第 104 行后加 autoSave
- `createReflection()` — 第 119 行后加 autoSave
- `updateReflection()` — 第 141 行后加 autoSave
- `deleteReflection()` — 第 146 行后加 autoSave
- `markReflectionSynced()` — 第 163 行后加 autoSave
- `createSession()` — 第 176 行后加 autoSave
- `updateSession()` — 第 192 行后加 autoSave
- `deleteSession()` — 第 197 行后加 autoSave
- `markSessionSynced()` — 第 223 行后加 autoSave
- `clearAll()` — 第 255 行后加 autoSave

### 3.2 localStorage Key 设计

| Key | 用途 | 数据结构 | 生命周期 |
|-----|------|---------|---------|
| `pomodorox-memorystore` | 存储所有业务数据（tasks/reflections/sessions/syncLog） | `{ tasks: [string, Task][], reflections: [string, Reflection][], sessions: [string, Session][], syncLog: [...] }` | 用户清除数据时删除 |
| `pomodorox-settings` | 存储应用配置（已有，不变） | `JSON.stringify(AppConfig)` | 长期保留 |

**为什么用单 key 存全部**：
- 写入原子性：一次 `setItem` 保证所有数据一致
- 读取简单：一次 `getItem` 恢复全部
- 数据量小：PomodoroX 数据量级很小（单个用户，千条以内），单 key 足够
- 维护简单：没有多 key 同步问题

### 3.3 接口变更说明

**DatabaseService 接口**：**无变更**。所有 CRUD 方法签名保持不变。仅 MemoryStore 实现类内部增加持久化逻辑。

---

## 4. 程序调用流程（时序图）

### 4.1 移动端数据加载流程

```
用户打开页面
     │
     ▼
App.vue onMounted()
     │
     ├──► settingsStore.loadSettings()
     │       ├── isTauriAvailable()? → false
     │       └── localStorage.getItem('pomodorox-settings')
     │            └── JSON.parse → 恢复设置
     │
     └──► 各 View onMounted() 中调用 store.loadXxx()
              │
              ├──► store 内部调用 db.getAllXxx()
              │       │
              │       └──► createDatabase()
              │               ├── isTauriAvailable()? → false
              │               └── new MemoryStore()
              │                    └── init()
              │                         └── loadFromLocalStorage()
              │                              └── localStorage.getItem('pomodorox-memorystore')
              │                                   └── JSON.parse → Map恢复
              │
              └── data ready → 渲染视图
```

### 4.2 移动端数据写入流程

```
用户在手机上操作（创建任务/完成番茄钟/保存反思）
     │
     ▼
Store 方法调用
     │
     ├──► db.createTask(input)  /  db.updateTask(...)  /  db.deleteTask(...)
     │       │
     │       └──► MemoryStore.方法()
     │               ├── 修改 Map 数据
     │               ├── (autoSaveEnabled) → saveToLocalStorage()
     │               │       └── JSON.stringify + localStorage.setItem()
     │               └── return 结果
     │
     └── 页面刷新 → 数据完整（从 localStorage 恢复）
```

### 4.3 响应式布局决策树

```
浏览器窗口宽度
     │
     ├── < 640px（手机）
     │     ├── 顶部栏高度 44px，logo+搜索按钮
     │     ├── 底部导航紧凑：图标 20px，标签 0.65rem，padding 缩小
     │     ├── 内容区：单列全宽，无侧边栏
     │     ├── TasksView：看板降级为水平标签，表单全屏/底部弹层
     │     ├── TimerView：计时数字 3rem，环形进度缩放，芯片水平滚动
     │     ├── ReflectionsView：隐藏右侧 side panel，编辑器占满
     │     ├── StatsView：统计卡片 1 列，图表纵向排列
     │     ├── SettingsView：max-width 去除，表单 100%
     │     ├── Toast：顶部居中全宽
     │     ├── GlobalSearch：全屏覆盖模式
     │     └── MagicRings：低端设备跳过渲染
     │
     ├── 640px ~ 1023px（平板）
     │     ├── 顶部栏高度 48px
     │     ├── 底部导航中等间距
     │     ├── 内容区：两列网格（如可用）
     │     └── 侧边栏可收起
     │
     └── ≥ 1024px（桌面）→ 现有布局不变
```

---

## 5. 响应式 CSS 策略

### 5.1 CSS 变量断点定义

在 `src/styles/responsive.css` 中：

```css
/* ============================================================
   PomodoroX - 响应式断点和工具类
   ============================================================ */

:root {
  /* 断点（用于 JS 参考，CSS 中仍用 @media） */
  --bp-mobile: 640px;
  --bp-tablet: 1024px;

  /* 移动端布局变量 */
  --topbar-height-desktop: 56px;
  --topbar-height-mobile: 44px;
  --bottomnav-height: 56px;

  /* 移动端触摸目标最小值 */
  --touch-target-min: 44px;
}

/* ---- 全局滚动适配 ---- */
@media (max-width: 640px) {
  html {
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }

  body {
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
}
```

### 5.2 各 View 移动端布局规则

| View | 桌面行为（≥1024px） | 手机行为（<640px） |
|------|-------------------|------------------|
| **TimerView** | 计时器居中，两侧留白 | 计时器全宽，模式 chips 水平滚动，统计卡片紧凑 |
| **TasksView** | 列表/看板/日历三模式，看板可拖拽 | 看板降级为水平标签+操作菜单，表单使用底部弹层，FAB 按钮 |
| **ReflectionsView** | 左编辑 + 右侧边栏（300px） | 隐藏侧边栏，编辑器占满，键盘弹起 `scrollIntoView` |
| **StatsView** | 4 列统计卡片 + 2 列图表网格 | 1 列统计卡片 + 1 列图表 |
| **SettingsView** | 内容区 max-width 720px 居中 | 内容区 100% 宽，主题 2 列，操作按钮全宽 |
| **GlobalSearch** | 居中浮窗 560px | 全屏覆盖 |
| **Toast** | 右上角浮窗 | 顶部居中全宽 |

### 5.3 底部导航和顶部栏移动端紧凑版

```css
/* App.vue scoped 追加 */

/* 移动端：< 640px */
@media (max-width: 640px) {
  .top-bar {
    padding: 8px 12px;
    height: var(--topbar-height-mobile);
  }

  .app-title {
    font-size: 0.95rem;
  }

  .search-trigger {
    padding: 4px 8px;
  }

  .search-hint {
    display: none;  /* 移动端隐藏快捷键提示 */
  }

  .nav-item {
    padding: 4px 8px;
    min-width: 48px;
  }

  .nav-icon svg {
    width: 20px;
    height: 20px;
  }

  .nav-label {
    font-size: 0.6rem;
  }

  .nav-indicator {
    width: 16px;
    height: 2px;
  }

  .bottom-nav {
    padding: 4px 8px calc(4px + env(safe-area-inset-bottom, 0px));
  }
}

/* 平板：640px ~ 1023px */
@media (min-width: 641px) and (max-width: 1023px) {
  .top-bar {
    padding: 10px 16px;
  }

  .nav-item {
    padding: 5px 12px;
    min-width: 56px;
  }
}
```

---

## 6. 移动端 Web 构建

### 6.1 新增 build:web npm script

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:web": "cross-env VITE_BUILD_WEB=true tsc && vite build --outDir dist-web",
    "dev:lan": "vite --host 0.0.0.0",
    "preview": "vite preview"
  }
}
```

### 6.2 vite.config.ts 调整

```typescript
// 在 base 配置处增加 Web 构建条件
base: process.env.TAURI_ENV_PLATFORM
  ? './'
  : process.env.VITE_BUILD_WEB
    ? '/'
    : '/',

// build 目标调整：Web 构建使用更通用的目标
build: {
  target: process.env.TAURI_ENV_PLATFORM === 'windows'
    ? 'chrome105'
    : process.env.VITE_BUILD_WEB
      ? 'es2015'
      : 'safari16',
  // ...
}
```

### 6.3 输出目录

- Web 构建输出到 `dist-web/`
- 与 Tauri 构建输出 `dist/` 隔离，不发生冲突

---

## 7. LAN 开发指引

### 7.1 启动时显示局域网 IP

新写一个 Vite 插件 `scripts/dev-server-info.ts`（可选），或在 `package.json` 的 `dev:lan` 中利用 Vite 内置输出。

简化方案：通过 `vite --host 0.0.0.0` 启动后，Vite 会自动输出 `Network: http://192.168.x.x:1420/`，手机直接访问此 URL 即可。

### 7.2 QR Code 生成（可选）

可以使用 `qrcode-terminal` 包在终端打印二维码：

```json
{
  "devDependencies": {
    "qrcode-terminal": "^0.12.0"
  }
}
```

新增 npm script：

```json
{
  "scripts": {
    "dev:lan:qr": "node scripts/start-with-qr.cjs"
  }
}
```

`scripts/start-with-qr.cjs`：

```javascript
const { execSync, spawn } = require('child_process')
const qrcode = require('qrcode-terminal')
const os = require('os')

// 获取局域网 IP
const interfaces = os.networkInterfaces()
let ip = 'localhost'
for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    if (iface.family === 'IPv4' && !iface.internal) {
      ip = iface.address
      break
    }
  }
  if (ip !== 'localhost') break
}

const url = `http://${ip}:1420`
console.log(`\n  LAN 地址: ${url}\n`)
qrcode.generate(url, { small: true })

// 启动 Vite
spawn('vite', ['--host', '0.0.0.0'], { stdio: 'inherit' })
```

---

## 8. MagicRings 移动端性能处理

在 `MagicRings.vue` 中增加移动端检测降级逻辑：

```typescript
/** 是否应跳过渲染（低端设备或移动端） */
const shouldSkipRender = computed(() => {
  if (typeof window === 'undefined') return true
  const dpr = window.devicePixelRatio || 1
  const cores = navigator.hardwareConcurrency || 4
  // 低 DPR (< 2) 或低核心数 (< 4) 的设备跳过 Three.js 渲染
  return dpr < 2 || cores < 4
})

// 在 onMounted 中判断
onMounted(() => {
  if (shouldSkipRender.value) return  // 不创建 Three.js 渲染器
  // ... 现有代码 ...
})
```

---

## 9. index.html 移动端 Meta 标签补充

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="description" content="PomodoroX - 高效番茄钟与任务管理工具" />
    <meta name="theme-color" content="#070B14" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="mobile-web-app-capable" content="yes" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="manifest" href="/manifest.json" />
    <title>PomodoroX</title>
  </head>
  <body class="theme-dark-night">
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

---

## 10. 需求 - 文件对照矩阵

| 需求 ID | 描述 | 涉及文件 |
|---------|------|---------|
| M-01 | MemoryStore localStorage 持久化 | `src/services/database.ts` |
| M-02 | App.vue 布局响应式 | `src/App.vue`, `src/style.css`, `src/styles/responsive.css` |
| M-03 | TimerView 移动端适配 | `src/views/TimerView.vue` |
| M-04 | TasksView 移动端适配 | `src/views/TasksView.vue` |
| M-05 | ReflectionsView 移动端适配 | `src/views/ReflectionsView.vue` |
| M-06 | StatsView 移动端适配 | `src/views/StatsView.vue` |
| M-07 | SettingsView 移动端适配 | `src/views/SettingsView.vue` |
| M-08 | LAN 访问 + QR Code | `package.json`, `scripts/start-with-qr.cjs` |
| M-09 | GlobalSearch 移动端适配 | `src/components/GlobalSearch.vue` |
| M-10 | ToastContainer 移动端适配 | `src/components/ToastContainer.vue` |
| M-11 | MagicRings 移动端性能 | `src/components/MagicRings.vue` |
| M-12 | index.html meta 标签 | `index.html`, `public/manifest.json` |
| M-13 | build:web 构建配置 | `vite.config.ts`, `package.json` |
| M-14 | 空状态/骨架屏 | 各 View 文件（追加骨架屏样式） |
| M-15 | PWA Manifest | `public/manifest.json` |
| M-16 | Service Worker | `public/sw.js` |

---

## 11. 待明确事项

| # | 问题 | 建议方案 | 决策人 | 状态 |
|---|------|---------|--------|------|
| Q2 | MagicRings 在低端手机性能不足 | 检测 `devicePixelRatio < 2` 或 `hardwareConcurrency < 4` 时跳过渲染 | 架构师 | ⏳ 待确认 |
| Q4 | PWA 支持范围 | 本次只创建 manifest.json 基础文件，SW 骨架暂不激活离线缓存 | 产品 | ⏳ 待确认 |
| Q6 | Mobile Bottom Sheet 组件 | 是否需要封装一个通用的底部弹层组件？建议复用现有 `modal-overlay` + 新增 `.modal-bottom` 类 | 架构师 | ⏳ 待确认 |
| Q7 | 触摸手势（滑动切换 Tab） | P2 范围，本次不做 | — | ✅ 已确认 |
| Q8 | 移动端测试方案 | 建议使用 Chrome DevTools 设备模拟 + 真机测试（375px/390px/414px） | — | ✅ 已确认 |

---

## 12. 附录：修改文件变更量估算

| 文件 | 当前行数 | 预计新增行数 | 变更类型 |
|------|---------|------------|---------|
| `src/services/database.ts` | 806 | ~60 | 新增方法 + 每方法追加 1-2 行 |
| `src/App.vue` | 340 | ~40 | scoped CSS 追加 media query |
| `src/style.css` | 503 | ~15 | 新增 mobile modal 样式 |
| `index.html` | 15 | ~6 | meta 标签追加 |
| `vite.config.ts` | 65 | ~8 | build:web 条件分支 |
| `package.json` | 39 | ~3 | 新增 script |
| `src/views/TimerView.vue` | ~900 | ~30 | scoped CSS 追加 |
| `src/views/TasksView.vue` | ~1100 | ~50 | scoped CSS + 看板降级逻辑 |
| `src/views/ReflectionsView.vue` | 1228 | ~20 | scoped CSS 追加 |
| `src/views/StatsView.vue` | 1460 | ~10 | scoped CSS 追加 |
| `src/views/SettingsView.vue` | 1603 | ~10 | scoped CSS 追加 |
| `src/components/GlobalSearch.vue` | 324 | ~10 | scoped CSS 追加 |
| `src/components/ToastContainer.vue` | 120 | ~10 | scoped CSS 追加 |
| `src/components/MagicRings.vue` | 287 | ~15 | 性能检测逻辑 |
| 新增 `src/styles/responsive.css` | — | ~50 | 新文件 |
| 新增 `public/manifest.json` | — | ~20 | 新文件 |
| 新增 `scripts/start-with-qr.cjs` | — | ~30 | 新文件 |

**总计**：新增 ~4 个文件（~100 行），修改 14 个现有文件（~270 行），整体变更量约 **370 行**。
