# PomodoroX 移动端 Web 适配 — 任务分解清单

> **文档版本**: v1.0 | **更新日期**: 2026-05-03 | **负责人**: 毕达成（Bi）
> **依据**: `docs/prd-mobile.md` + `docs/system-design-mobile.md`

---

## 1. Required Packages（依赖包）

```json
{
  "devDependencies": {
    "cross-env": "^7.0.3",
    "qrcode-terminal": "^0.12.0"
  }
}
```

| 包名 | 作用 | 安装命令 |
|------|------|---------|
| `cross-env` | 跨平台设置环境变量 `VITE_BUILD_WEB=true`，在 Windows/Linux/macOS 上统一 `build:web` 脚本行为 | `pnpm add -D cross-env` |
| `qrcode-terminal` | 开发阶段在终端打印 QR Code，手机扫码即可访问局域网地址 | `pnpm add -D qrcode-terminal` |

---

## 2. Logic Analysis（文件级逻辑分析）

按依赖关系从底层到上层排列。**新增** 4 个文件，**修改** 14 个现有文件。

### 2.1 新增文件

| # | 文件路径 | 新文件 | 职责 | 预估行数 |
|---|---------|-------|------|---------|
| N01 | `src/styles/responsive.css` | 新增 | 响应式 CSS 变量断点声明（`--bp-mobile`, `--bp-tablet`, `--touch-target-min` 等）；全局滚动适配（`@media max-width: 640px` 下的 `-webkit-overflow-scrolling: touch`） | ~50 |
| N02 | `scripts/start-with-qr.cjs` | 新增 | Node.js 脚本：获取局域网 IP、生成 QR Code 并打印终端、通过 `spawn` 启动 Vite dev server | ~30 |
| N03 | `public/manifest.json` | 新增 | PWA Manifest 基础文件：名称、图标、主题色、display 模式（`standalone`）、scope 等（仅骨架，离线缓存 P2） | ~20 |
| N04 | `public/sw.js` | 新增 | Service Worker 骨架文件（先创建文件，离线缓存逻辑作为 P2 推迟，仅保留 activate/install 事件空处理） | ~15 |

### 2.2 修改文件

| # | 文件路径 | 修改要点 | 变更类型 | 预估新增行数 |
|---|---------|---------|---------|------------|
| M01 | `index.html` | • 添加 viewport meta: `width=device-width, initial-scale=1.0, viewport-fit=cover`<br>• 添加 `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `format-detection=telephone=no`, `theme-color` 等移动端 meta 标签<br>• 添加 `<link rel="manifest">` 引用 | 修改 | ~6 |
| M02 | `package.json` | • 新增 `build:web` script: `cross-env VITE_BUILD_WEB=true tsc && vite build --outDir dist-web`<br>• 新增 `dev:lan` script: `vite --host 0.0.0.0`<br>• 新增 `dev:lan:qr` script: `node scripts/start-with-qr.cjs` | 修改 | ~3 |
| M03 | `vite.config.ts` | • `base` 配置增加 Web 构建分支（`VITE_BUILD_WEB=true` 时 `base: '/'`）<br>• `build.target` 增加 Web 构建分支（使用 `es2015`） | 修改 | ~8 |
| M04 | `src/services/database.ts` | • MemoryStore 类新增 `STORAGE_KEY` 静态常量<br>• 新增 `saveToLocalStorage()` 方法：序列化 tasks/reflections/sessions/syncLog 到单个 localStorage key<br>• 新增 `loadFromLocalStorage()` 方法：反序列化恢复 Map 数据<br>• 新增 `autoSaveEnabled` 标志<br>• `init()` 覆写：先 `loadFromLocalStorage()`，非 Tauri 环境启用 `autoSaveEnabled`<br>• 所有 13 个数据变更方法返回前追加 `if (autoSaveEnabled) await saveToLocalStorage()` | 修改 | ~60 |
| M05 | `src/style.css` | • 新增移动端 Modal 覆盖样式：`.modal-content` 在手机端全屏铺满的规则<br>• 追加 safe-area 相关 padding 变量 | 修改 | ~15 |
| M06 | `src/App.vue` | • `scoped style` 追加手机端 (< 640px) 响应式规则<br>  - 顶部栏高度 56px→44px，padding 缩小<br>  - app-title 字号缩小<br>  - 搜索快捷键提示（`Ctrl K`）隐藏<br>  - 底部导航：图标 20px，标签 0.6rem，padding 缩小<br>  - 底部导航 padding 增加 `env(safe-area-inset-bottom)`<br>• 平板端 (641~1023px) 中等响应式规则 | 修改 | ~40 |
| M07 | `src/views/TimerView.vue` | • scoped CSS 追加移动端规则：<br>  - 计时数字 3rem 字号<br>  - 环形进度 SVG 百分比宽 + max-width 自适应<br>  - 主按钮最小高度 48px<br>  - 模式切换改为全宽水平滚动 chips<br>• 沉浸模式功能（P1）：点击计时器区域隐藏顶部/底部栏 | 修改 | ~30 |
| M08 | `src/views/TasksView.vue` | • scoped CSS 追加移动端规则：<br>  - 看板视图在 < 640px 下降级为水平标签 + 操作菜单（不再三列并排）<br>  - 新建/编辑任务弹窗使用底部铺满样式<br>  - FAB 悬浮按钮（右下角，替代顶部工具栏新建按钮）<br>  - 日历热力图缩小<br>• 表单弹窗在移动端改为 drawer 风格 | 修改 | ~50 |
| M09 | `src/views/ReflectionsView.vue` | • scoped CSS 追加移动端规则：<br>  - 隐藏右侧 side panel（编辑区占满）<br>  - 编辑器高度自适应占满可用空间<br>  - 日期选择器触控适配<br>  - 心情选择器水平滚动<br>  - 键盘弹起时 `scrollIntoView` | 修改 | ~20 |
| M10 | `src/views/StatsView.vue` | • scoped CSS 追加移动端规则：<br>  - 统计卡片 4 列→2 列两行<br>  - 图表纵向排列（柱状图/折线图/甜甜圈图）<br>  - 图表 SVG 容器宽度自适应<br>  - 甜甜圈图半径缩小 | 修改 | ~10 |
| M11 | `src/views/SettingsView.vue` | • scoped CSS 追加移动端规则：<br>  - `settings-body` max-width 去除，内容区 100% 宽<br>  - 输入框 100% 宽度<br>  - 主题卡片移动端 2 列<br>  - 操作按钮全宽堆叠 | 修改 | ~10 |
| M12 | `src/components/GlobalSearch.vue` | • scoped CSS 追加移动端规则：<br>  - 搜索弹窗全屏覆盖<br>  - 输入框 font-size 16px（防 iOS 自动缩放）<br>  - 结果列表可滚动 | 修改 | ~10 |
| M13 | `src/components/ToastContainer.vue` | • scoped CSS 追加移动端规则：<br>  - Toast 从右上角改为顶部居中 + 水平满宽<br>  - 调整 z-index 确保不被底部导航遮挡 | 修改 | ~10 |
| M14 | `src/components/MagicRings.vue` | • 新增 `shouldSkipRender` 计算属性：检测 `devicePixelRatio < 2` 或 `hardwareConcurrency < 4` 时跳过 Three.js 渲染<br>• `onMounted` 中增加条件判断，低端设备不创建渲染器 | 修改 | ~15 |

---

## 3. 有序的任务拆分

### 3.1 任务清单

**优先级标注**: P0 = 必须完成（阻塞发布） | P1 = 应该完成（提升体验） | P2 = 值得做（锦上添花）

| # | 任务编号 | 任务名称 | 优先级 | 涉及文件 | 依赖任务 | 预估行数 |
|---|---------|---------|--------|---------|---------|---------|
| 1 | T-01 | 移动端 meta 标签 + index.html 更新 | **P0** | `index.html` | 无 | ~6 |
| 2 | T-02 | 响应式 CSS 断点 + 全局样式 | **P0** | `src/styles/responsive.css`（新增）, `src/style.css` | T-01 | ~65 |
| 3 | T-03 | MemoryStore localStorage 持久化 | **P0** | `src/services/database.ts` | 无 | ~60 |
| 4 | T-04 | Vite build:web 构建配置 + 路由 Hash 模式 | **P0** | `vite.config.ts`, `package.json`, `src/router/index.ts` | 无 | ~11 |
| 5 | T-05 | App.vue 底部导航 + 顶部栏响应式 + safe-area | **P0** | `src/App.vue` | T-02 | ~40 |
| 6 | T-06 | LAN 开发访问 + QR Code 生成 | **P0** | `package.json`, `scripts/start-with-qr.cjs`（新增） | 无 | ~33 |
| 7 | T-07 | TimerView 移动端适配 | **P0** | `src/views/TimerView.vue` | T-05 | ~30 |
| 8 | T-08 | TasksView 移动端适配 | **P0** | `src/views/TasksView.vue` | T-05 | ~50 |
| 9 | T-09 | ReflectionsView 移动端适配 | **P0** | `src/views/ReflectionsView.vue` | T-05 | ~20 |
| 10 | T-10 | StatsView 移动端适配 | **P0** | `src/views/StatsView.vue` | T-05 | ~10 |
| 11 | T-11 | SettingsView 移动端适配 | **P0** | `src/views/SettingsView.vue` | T-05 | ~10 |
| 12 | T-12 | GlobalSearch 移动端适配 | **P1** | `src/components/GlobalSearch.vue` | T-05 | ~10 |
| 13 | T-13 | ToastContainer 移动端适配 | **P1** | `src/components/ToastContainer.vue` | T-05 | ~10 |
| 14 | T-14 | MagicRings 移动端性能降级 | **P1** | `src/components/MagicRings.vue` | T-05 | ~15 |
| 15 | T-15 | 沉浸模式 + 通知权限请求 | **P1** | `src/views/TimerView.vue` | T-07 | ~15 |
| 16 | T-16 | 空状态 / 骨架屏适配 | **P1** | 各 View 文件（追加骨架屏移动端样式） | T-07~T-11 | ~20 |
| 17 | T-17 | PWA Manifest 配置文件 | **P2** | `public/manifest.json`（新增） | 无 | ~20 |
| 18 | T-18 | Service Worker 骨架 | **P2** | `public/sw.js`（新增） | T-17 | ~15 |
| 19 | T-19 | 页面过渡动画优化 + QQ/微信兼容（预留） | **P2** | 各 View Transition 样式 | T-05 | ~15 |

### 3.2 P0 任务（5+1 个并行 + 7 个串行组）

```
并行组 1（基础设施，可并行）:
  T-01 (meta 标签)
  T-03 (localStorage 持久化)
  T-04 (build:web 配置 + Hash 路由)
  T-06 (LAN + QR Code)

串行组 2:
  T-01 → T-02 (CSS 断点，依赖 meta 标签)
       → T-05 (App 布局，依赖响应式 CSS)
            ├→ T-07 (TimerView)
            ├→ T-08 (TasksView)
            ├→ T-09 (ReflectionsView)
            ├→ T-10 (StatsView)
            └→ T-11 (SettingsView)
```

### 3.3 P1~P2 任务

```
串行组 3（依赖 T-05）:
  T-05 → T-12 (GlobalSearch)
       → T-13 (ToastContainer)
       → T-14 (MagicRings)

串行组 4（依赖具体 View）:
  T-07 → T-15 (沉浸模式 + 通知)
  T-07~T-11 → T-16 (空状态/骨架屏)

并行组 5（P2）:
  T-17 (PWA Manifest, 无依赖)
  T-18 (SW 骨架, 依赖 T-17)
  T-19 (过渡动画, 依赖 T-05)
```

---

## 4. Full API Spec（API 规范）

### 4.1 MemoryStore 新增方法

```typescript
// ========================================
// 文件: src/services/database.ts
// 类: MemoryStore
// ========================================

/** localStorage Key 常量 — 单 key 存储所有业务数据 */
private static readonly STORAGE_KEY = 'pomodorox-memorystore'

/** 自动保存标志 — init() 中根据环境设置 */
private autoSaveEnabled = false

/**
 * 序列化所有数据到 localStorage
 * 在每次创建/更新/删除操作后自动调用
 * 使用 try-catch 处理 localStorage 满的情况（QuotaExceededError）
 */
async saveToLocalStorage(): Promise<void>

/**
 * 从 localStorage 恢复数据
 * 在 init() 时调用
 * 解析失败时使用空数据（console.warn 输出提示）
 */
async loadFromLocalStorage(): Promise<void>

/**
 * init() 覆写 — 新增 localStorage 恢复 + autoSave 启用
 * 
 * 调用顺序:
 * 1. await this.loadFromLocalStorage()
 * 2. if (非 Tauri 环境) this.autoSaveEnabled = true
 */
async init(): Promise<void>
```

### 4.2 MemoryStore 现有方法修改

所有 13 个数据变更方法，在返回结果**之前**追加以下代码：

```typescript
if (this.autoSaveEnabled) {
  await this.saveToLocalStorage()
}
```

具体修改点：

| 方法 | 文件大约行号 | 修改时机 |
|------|------------|---------|
| `createTask()` | ~56 | `this.tasks.set()` 之后 |
| `updateTask()` | ~79 | 方法返回前 |
| `deleteTask()` | ~84 | 方法返回前 |
| `markTaskSynced()` | ~104 | 方法返回前 |
| `createReflection()` | ~119 | 方法返回前 |
| `updateReflection()` | ~141 | 方法返回前 |
| `deleteReflection()` | ~146 | 方法返回前 |
| `markReflectionSynced()` | ~163 | 方法返回前 |
| `createSession()` | ~176 | 方法返回前 |
| `updateSession()` | ~192 | 方法返回前 |
| `deleteSession()` | ~197 | 方法返回前 |
| `markSessionSynced()` | ~223 | 方法返回前 |
| `clearAll()` | ~255 | 方法返回前 |

### 4.3 DatabaseService 接口

**无变更**。所有 CRUD 方法签名保持不变。仅 MemoryStore 实现类内部增加持久化逻辑，对上层 Store 完全透明。

### 4.4 新增 npm scripts

```json
{
  "scripts": {
    "build:web": "cross-env VITE_BUILD_WEB=true tsc && vite build --outDir dist-web",
    "dev:lan": "vite --host 0.0.0.0",
    "dev:lan:qr": "node scripts/start-with-qr.cjs"
  }
}
```

### 4.5 vite.config.ts 变更

```typescript
// base 配置
base: process.env.TAURI_ENV_PLATFORM
  ? './'
  : process.env.VITE_BUILD_WEB
    ? '/'
    : '/',

// build.target 配置
build: {
  target: process.env.TAURI_ENV_PLATFORM === 'windows'
    ? 'chrome105'
    : process.env.VITE_BUILD_WEB
      ? 'es2015'
      : 'safari16',
  // ... 其余配置不变
}
```

### 4.6 路由变更

```typescript
// src/router/index.ts
// createWebHistory() → createWebHashHistory()
// 避免手机端部署时刷新出现 404

import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // ... 路由配置不变
  ],
})
```

### 4.7 数据接口

| Key | 用途 | 数据结构 | 生命周期 |
|-----|------|---------|---------|
| `pomodorox-memorystore` | 存储所有业务数据（tasks/reflections/sessions/syncLog） | `{ tasks: [string, Task][], reflections: [string, Reflection][], sessions: [string, Session][], syncLog: SyncLogEntry[] }` | 用户清除数据时删除 |
| `pomodorox-settings` | 存储应用配置（已有，不变） | `JSON.stringify(AppConfig)` | 长期保留 |

**序列化格式说明**：Map 类型无法直接被 `JSON.stringify` 序列化，因此序列化时使用 `Array.from(map.entries())` 转为 `[key, value][]` 数组，反序列化时 `new Map(array)` 恢复。

---

## 5. Shared Knowledge（共享知识）

### 5.1 MemoryStore 持久化约定

| 约定 | 说明 |
|------|------|
| **单 key 存储** | 所有业务数据存于一个 key `pomodorox-memorystore`，保证写入原子性 |
| **仅非 Tauri 环境启用** | 通过 `typeof localStorage !== 'undefined' && !isTauriAvailable()` 判断，避免与 SQLite 冲突 |
| **每次写入后自动保存** | 13 个数据变更方法各自在返回前追加 `saveToLocalStorage()` 调用 |
| **启动时恢复** | `init()` 首先调用 `loadFromLocalStorage()`，然后判断是否启用 autoSave |
| **错误容忍** | `saveToLocalStorage` 和 `loadFromLocalStorage` 均使用 try-catch，失败不阻塞主流程 |
| **localStorage 满处理** | `QuotaExceededError` 时输出 `console.warn` 提示，不影响当前操作 |

### 5.2 响应式断点约定

所有开发人员必须遵守以下断点约定：

```css
/* src/styles/responsive.css 中的断点定义 */

/* CSS 变量（用于 JS 参考，不做响应式驱动） */
:root {
  --bp-mobile: 640px;      /* 手机端上限 */
  --bp-tablet: 1024px;     /* 平板端上限 */
  --topbar-height-desktop: 56px;
  --topbar-height-mobile: 44px;
  --bottomnav-height: 56px;
  --touch-target-min: 44px;
}
```

| 断点 | 范围 | 目标设备 | 布局特征 |
|------|------|---------|---------|
| `@media (max-width: 640px)` | 0 ~ 640px | 手机 | 单列全宽，紧凑导航，无侧边栏，底部弹层 |
| `@media (min-width: 641px) and (max-width: 1023px)` | 641 ~ 1023px | 平板 | 中等间距，两列可用，导航中等 |
| `@media (min-width: 1024px)` | ≥ 1024px | 桌面 | 现有布局不变 |

**禁止使用 magic number**（如 768、375 等非约定断点）。所有媒体查询必须使用以上三个断点之一。

### 5.3 移动端交互规范

| 规范 | 说明 | 来源 |
|------|------|------|
| **触摸目标最小 44px** | 所有可点击元素（按钮、链接、图标按钮）最小 touch target 为 44x44px | PRD M-P1-03 |
| **底部弹层替代居中 Modal** | 移动端表单/确认弹窗使用 `.modal-bottom` 类底部滑入，替代桌面居中弹窗 | 系统设计 Q6 |
| **看板降级** | < 640px 时看板不再三列并排，改为水平标签 + 操作菜单（不引入拖拽库） | PRD UI 5.4 |
| **Table/Stats 降级** | 统计卡片 4 列→2 列；图表纵向排列 | PRD UI 5.6 |
| **FAB 按钮** | 移动端 TasksView 使用右下角 FAB 替代顶部工具栏新建 | PRD UI 5.4 |
| **滚动条优化** | 移动端使用薄滚动条，`-webkit-overflow-scrolling: touch` | PRD M-P1-05 |
| **iOS 安全区域** | 底部导航 padding 追加 `env(safe-area-inset-bottom, 0px)` | PRD M-P0-11 |
| **顶部栏隐藏快捷键** | html 标签（如 `Ctrl K`）在移动端隐藏 | PRD M-P1-01 |
| **Toast 位置** | 移动端 Toast 从右上角改为顶部居中 + 水平满宽 | PRD M-P1-08 |
| **输入框 font-size** | 移动端输入框字体至少 16px，防止 iOS 自动缩放 | 已知问题 |
| **Notification API** | 移动端使用浏览器 Notification API（已有 `useNotification.ts` 回退） | PRD 4.2 |
| **日期选择器** | 移动端改为滚动选择器，替代弹出日历 | PRD UI 5.6 |
| **代码风格** | 所有新增 CSS 使用 scoped style 追加 `@media (max-width: 640px)` 规则，不修改现有桌面端样式 | 增量原则 |
| **不做** | 不要使用 touch 事件库，不要修改 DatabaseService 接口，不要新增 Vue 组件（除非明确要求） | 最小变更 |

### 5.4 路由约定

- **移动端使用 Hash 路由**（`createWebHashHistory()`），避免静态部署时刷新 404
- `src/router/index.ts` 中完成变更，其他组件中路由调用方式不变

### 5.5 构建产出约定

| 构建模式 | 命令 | 输出目录 | 说明 |
|---------|------|---------|------|
| 桌面端（Tauri） | `pnpm build` | `dist/` | 不变，Tauri 壳使用 |
| 移动端 Web | `pnpm build:web` | `dist-web/` | 纯前端产物，可直接 `serve dist-web` |
| 开发服务器 | `pnpm dev:lan` | — | `--host 0.0.0.0` 监听所有网络接口 |
| 开发+二维码 | `pnpm dev:lan:qr` | — | 打印二维码后启动 dev server |

---

## 6. 任务依赖图

```text
=== P0 任务依赖图 ===

T-01 (meta 标签)
   │
   ▼
T-02 (响应式 CSS 断点 + 全局样式)
   │
   ▼
T-05 (App.vue 布局响应式 + safe-area)
   │
   ├─────┬──────┬──────┬──────┐
   ▼     ▼      ▼      ▼      ▼
 T-07  T-08   T-09   T-10   T-11
(计时器)(任务) (反思) (统计) (设置)
   │
   ▼
T-15 (沉浸模式 + 通知权限)


T-03 (MemoryStore 持久化)  ── 无依赖，可 T-01/T-02/T-05 并行
T-04 (build:web 配置)       ── 无依赖，可并行
T-06 (LAN + QR Code)       ── 无依赖，可并行


=== P1 任务依赖图 ===

T-05 ──→ T-12 (GlobalSearch 移动端)
T-05 ──→ T-13 (ToastContainer 移动端)
T-05 ──→ T-14 (MagicRings 性能降级)

T-07~T-11 ──→ T-16 (空状态 / 骨架屏)


=== P2 任务依赖图 ===

T-17 (PWA Manifest, 无依赖)
  │
  ▼
T-18 (Service Worker 骨架)

T-05 ──→ T-19 (页面过渡动画)


=== 时间线建议 ===

Phase 1 (P0):   T-01, T-02, T-03, T-04, T-05, T-06   ← 基础设施
Phase 2 (P0):   T-07, T-08, T-09, T-10, T-11           ← 5 个核心页面
Phase 3 (P1):   T-12, T-13, T-14, T-15, T-16           ← 体验提升
Phase 4 (P2):   T-17, T-18, T-19                       ← 锦上添花
```

---

## 附录：跨团队协作接口

| 接口领域 | 提供方 | 接收方 | 交付物 |
|---------|-------|-------|--------|
| MemoryStore 持久化 | 高见远（架构师） | 所有前端开发 | `database.ts` 的 `saveToLocalStorage/loadFromLocalStorage` 实现 |
| 响应式 CSS 断点 | 高见远（架构师） | 所有前端开发 | `responsive.css` 的 CSS 变量和断点定义 |
| 路由 Hash 模式 | 许清楚（前端） | 所有前端开发 | `router/index.ts` 的 `createWebHashHistory` 变更 |
| build:web 配置 | 许清楚（前端） | 测试/部署 | `vite.config.ts` + `package.json` 修改 |
| LAN + QR Code | 许清楚（前端） | 所有开发人员 | `scripts/start-with-qr.cjs` 脚本 |
| PWA Manifest | 许清楚（前端） | 运维/部署 | `public/manifest.json` |
| 各 View 响应式样式 | 各前端开发 | 测试 | 各 View 的 scoped CSS 追加 |
