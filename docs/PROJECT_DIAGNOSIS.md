# PomodoroX 项目全面诊断报告

> 生成时间：2026-05-03  
> 诊断范围：架构 + 代码质量 + 功能完成度  
> 代码规模：~29 个前端源文件，~7 个 Rust 后端文件

---

## 1. 执行摘要

| 维度 | 评分 | 说明 |
|------|------|------|
| 功能完成度 | 85/100 | 核心功能完备，部分高级功能待完善 |
| 架构设计 | 78/100 | 分层清晰，但存在职责重复和耦合问题 |
| 代码质量 | 72/100 | 类型安全良好，但存在重复代码、测试缺失 |
| 工程化 | 65/100 | 无测试、无 pre-commit、无 CI/CD |
| **综合健康度** | **75/100** | 项目基础扎实，建议优先补齐测试和消除重复代码 |

**关键发现：**
- `useTimer` composable 与 `timerStore` 存在严重逻辑重复
- 全局搜索 UI 状态已定义，但搜索功能未实现
- 零测试覆盖率
- Rust 后端几乎无自定义业务逻辑

---

## 2. 项目概况

### 2.1 技术栈

| 层级 | 技术 | 版本 | 评价 |
|------|------|------|------|
| 桌面框架 | Tauri | v2 | 现代、轻量、安全 |
| 前端框架 | Vue | 3.5.33 | Composition API + `<script setup>` |
| 构建工具 | Vite | 8.0.10 | 快速、现代 |
| 状态管理 | Pinia | 3.0.4 | Setup Store 模式 |
| 样式方案 | Tailwind CSS | v4.2.4 | 新版，使用 `@import "tailwindcss"` |
| 类型系统 | TypeScript | ~6.0.2 | 严格模式部分开启 |
| 本地存储 | SQLite (tauri-plugin-sql) | v2 | 带内存回退 |
| 远程同步 | Octokit (GitHub API) | 5.0.5 | 标准 REST API |

### 2.2 项目结构

```
src/
├── main.ts              # 入口（简洁，职责单一）
├── App.vue              # 根布局（侧边栏 + 路由视图）
├── router/index.ts      # 5 个视图路由，懒加载
├── style.css            # 全局样式 + 4 套主题 CSS 变量
├── stores/              # 5 个 Pinia Store
│   ├── app.ts           # 全局 UI 状态
│   ├── timer.ts         # 计时器逻辑（与 useTimer 重复！）
│   ├── task.ts          # 任务 CRUD + 筛选排序
│   ├── reflection.ts    # 反思 CRUD
│   └── settings.ts      # 设置持久化（Tauri Store / localStorage）
├── composables/         # 4 个 Composables
│   ├── useTimer.ts      # 计时器核心（与 timerStore 重复！）
│   ├── useAudio.ts      # Web Audio API 音效
│   ├── useKeyboard.ts   # 全局快捷键
│   └── useNotification.ts # 系统通知
├── services/            # 3 个服务层
│   ├── database.ts      # 统一 DB 接口（SQLite + Memory 双实现）
│   ├── github.ts        # GitHub 同步 API
│   └── export.ts        # Markdown 导出（日报/周报/任务/反思）
├── views/               # 5 个页面视图
│   ├── TimerView.vue    # ~1330 行，最复杂视图
│   ├── TasksView.vue    # ~1126 行，三视图模式
│   ├── ReflectionsView.vue # ~1127 行，Markdown 编辑器
│   ├── StatsView.vue    # ~1328 行，纯 CSS/SVG 图表
│   └── SettingsView.vue # ~1525 行，设置面板
├── types/index.ts       # 类型定义（集中管理）
└── utils/               # 工具函数
    ├── constants.ts     # 常量配置
    ├── format.ts        # 日期/时间格式化
    └── id.ts            # UUID 生成
```

### 2.3 后端（Rust）

```
src-tauri/
├── src/
│   ├── main.rs          # 标准入口
│   └── lib.rs           # 插件注册（无自定义命令）
├── Cargo.toml           # 依赖：tauri + 5 个插件
└── tauri.conf.json      # 标准配置
```

**评价：** Rust 后端目前只是一个"壳"，所有业务逻辑都在前端。`lib.rs` 中没有定义任何自定义命令，前端通过 `invoke` 调用的 `timer_tick` / `timer_stop` 等命令实际上不存在，会被静默捕获并忽略。

---

## 3. 功能完成度评估

### 3.1 核心功能对照表

| README 特性 | 实现状态 | 文件位置 | 备注 |
|------------|---------|---------|------|
| 沉浸式番茄计时 | 90% | TimerView + timerStore | 环形进度、呼吸动画、粒子庆祝、动态背景均实现 |
| 自由任务规划 | 85% | TasksView + taskStore | 列表/看板/日历三视图、筛选排序、标签、截止日期 |
| 反思日志 | 80% | ReflectionsView | Markdown 编辑器、心情记录、模板、自动保存 |
| 自律统计 | 85% | StatsView | 柱状图、甜甜圈图、折线图、水平柱状图，纯 SVG/CSS |
| Markdown 导出 | 90% | export.ts | 日报/周报/任务报告/反思报告 |
| GitHub 同步 | 70% | github.ts + SettingsView | 推送/拉取已实现，但无冲突处理、无增量同步 |
| 主题系统 | 85% | style.css + settingsStore | 4 套主题（含自定义），CSS 变量切换 |
| 快捷键 | 75% | useKeyboard + App.vue | Ctrl+1~5 导航、Ctrl+N 新建、Ctrl+Space 计时、Escape 关闭 |
| 环境音效 | 60% | useAudio.ts | 有开始/完成/休息音效，但无背景白噪音 |
| 全局搜索 | 30% | appStore | UI 状态已定义（`showGlobalSearch`），搜索面板未实现 |
| 看板拖放 | 40% | TasksView | 有"移动"按钮，无原生 HTML5 拖放 |
| 数据导入导出 | 70% | SettingsView | JSON 备份导入导出，无格式校验 |

### 3.2 缺失功能

1. **全局搜索面板** - `appStore.showGlobalSearch` 和 `appStore.toggleGlobalSearch()` 已定义，但无搜索 UI 和逻辑
2. **看板原生拖放** - 当前通过按钮移动任务，体验不够流畅
3. **冲突处理** - GitHub 同步为覆盖式，无合并策略
4. **数据迁移** - 无数据库版本管理，schema 变更会崩溃
5. **键盘快捷键提示** - 无快捷键帮助面板
6. **通知历史** - 无通知中心

---

## 4. 架构分析

### 4.1 分层架构

```
┌─────────────────────────────────────────────┐
│  Views (TimerView, TasksView, ...)          │  UI 层
├─────────────────────────────────────────────┤
│  Stores (Pinia)                             │  状态层
├─────────────────────────────────────────────┤
│  Composables (useTimer, useAudio, ...)      │  业务逻辑层
├─────────────────────────────────────────────┤
│  Services (database, github, export)        │  数据/外部服务层
├─────────────────────────────────────────────┤
│  Utils (format, id, constants)              │  工具层
└─────────────────────────────────────────────┘
```

**优点：**
- 分层清晰，依赖方向正确（View → Store → Service → Utils）
- Pinia Store 按领域划分（timer/task/reflection/settings/app）
- database.ts 的**统一接口 + 双实现**设计优秀（SQLite + Memory）
- export.ts 纯函数设计，无状态，易测试

### 4.2 浅模块识别

#### 🔴 问题 1：timerStore 与 useTimer 严重重复

| | timerStore | useTimer |
|---|---|---|
| 剩余时间 | `remaining` | `remaining` |
| 运行状态 | `isRunning` | `isRunning` |
| 暂停状态 | `isPaused` | `isPaused` |
| 会话类型 | `sessionType` | `sessionType` |
| 时间戳计时 | `targetEndTime` + `tick()` | `targetEndTime` + `tick()` |
| 页面可见性 | `onVisibilityChange` | `handleVisibilityChange` |
| Tauri 通知 | `notifyTauriTimerStart/Stop` | `notifyTauriStart/Stop/Tick` |

**后果：** 逻辑维护困难，修改计时器行为需要在两个地方同步修改。

**建议：** 将计时核心逻辑只保留在 composable 中，timerStore 仅保留与业务相关的状态（今日会话、番茄计数、连续进度）。

#### 🟡 问题 2：TasksView 过于臃肿

`TasksView.vue` 约 1126 行，包含：
- 3 种视图模式的逻辑（列表/看板/日历）
- 表单验证和提交
- 筛选排序逻辑（与 taskStore.filteredTasks 部分重复）
- 内联编辑
- 热力图数据计算

**建议：** 拆分为子组件（`TaskList.vue`, `TaskKanban.vue`, `TaskCalendar.vue`, `TaskFormModal.vue`）。

#### 🟡 问题 3：settingsStore 直接操作 DOM

```typescript
function applyTheme(theme: ThemeName): void {
  document.body.classList.remove(...)
  document.body.classList.add(`theme-${theme}`)
}
```

Store 不应直接操作 DOM，建议通过 Vue 的响应式绑定或 App.vue 监听 theme 变化。

### 4.3 依赖关系图

```
App.vue
├── router
│   ├── TimerView ──→ timerStore, taskStore, settingsStore, useNotification, useAudio
│   ├── TasksView ──→ taskStore
│   ├── ReflectionsView ──→ reflectionStore, taskStore
│   ├── StatsView ──→ taskStore, reflectionStore, db, export
│   └── SettingsView ──→ settingsStore, appStore, db, github
├── appStore
└── useKeyboard

timerStore ──→ db, format, id, constants
useTimer ──→ useAudio, constants  (独立存在，与 timerStore 无直接依赖)
```

**问题：** timerStore 和 useTimer 是"平行世界"，各自维护一套计时状态。

---

## 5. 代码质量检查

### 5.1 TypeScript 类型安全

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 严格 null 检查 | 未开启 | `strictNullChecks` 未配置 |
| any 使用 | 1 处 | `database.ts:266` 有 `as any` |
| 隐式 any | 无 | 参数和返回值均有类型 |
| 类型定义 | 良好 | `types/index.ts` 覆盖主要实体 |
| 枚举类型 | 使用字符串联合 | `Priority`, `TaskStatus`, `Mood` 等 |

**tsconfig.json 建议：**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### 5.2 潜在 Bug

#### 🔴 Bug 1：timerStore 读取 localStorage 避免循环依赖

```typescript
// stores/timer.ts:76
function getTotalDuration(): number {
  const settingsStr = localStorage.getItem('pomodorox-settings')
  // ...
}
```

**问题：** 直接读取 localStorage 绕过 Pinia 的响应式系统，settings 变更后计时器不会自动更新。

**建议：** 使用 Pinia 的 `$subscribe` 或 computed 监听 settingsStore。

#### 🔴 Bug 2：GitHub 内容编码不可靠

```typescript
// services/github.ts:113
content: btoa(unescape(encodeURIComponent(content))),
```

`unescape` 已废弃，现代环境可能不可用。建议：
```typescript
content: btoa(encodeURIComponent(content).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(Number('0x' + p1)))),
```

#### 🟡 Bug 3：StatsView 日期边界问题

```typescript
// StatsView.vue:82
s.startedAt <= end + ' 23:59:59'
```

字符串拼接比较在边界情况下不可靠，应使用 `Date` 对象比较。

#### 🟡 Bug 4：ReflectionsView 内存泄漏风险

```typescript
// ReflectionsView.vue:132
autoSaveTimer.value = setTimeout(() => { ... }, 1500)
```

组件卸载时未清除 timer（`onUnmounted` 中无处理）。

### 5.3 重复代码

| 重复内容 | 位置 A | 位置 B | 行数 |
|----------|--------|--------|------|
| 计时器核心逻辑 | timerStore (~380行) | useTimer (~290行) | ~200行重复 |
| `isTauriAvailable()` | database.ts | useNotification.ts | useAudio.ts | 4行 x 3处 |
| 任务筛选排序 | taskStore.filteredTasks | TasksView.displayTasks | ~50行 |
| `spin-icon` 动画 | TimerView | TasksView | SettingsView | ~5行 x 多处 |

### 5.4 性能问题

1. **TasksView 热力图** - 每次渲染重新计算 91 天的数据，可考虑 `computed` 缓存但数据量大时仍重
2. **StatsView 图表** - `allSessions.value = await db.getAllSessions()` 加载所有会话，数据量大时内存压力大
3. **TimerView 背景样式** - 使用 `computed` 返回完整 CSS 字符串，每次 tick 触发重新计算

### 5.5 测试覆盖率

| 类型 | 数量 |
|------|------|
| 单元测试 | 0 |
| 集成测试 | 0 |
| E2E 测试 | 0 |

---

## 6. 风险与问题清单

### 🔴 P0（阻塞发布）

| # | 问题 | 影响 | 修复建议 |
|---|------|------|---------|
| 1 | 零测试覆盖率 | 回归风险极高 | 为核心逻辑补测试（timer、database、export） |
| 2 | timerStore/useTimer 重复 | 维护困难、状态不一致风险 | 合并为一个计时器核心 |

### 🟡 P1（重要）

| # | 问题 | 影响 | 修复建议 |
|---|------|------|---------|
| 3 | 无数据库迁移机制 | schema 变更导致用户数据丢失 | 添加版本号和迁移脚本 |
| 4 | GitHub 同步无冲突处理 | 多设备使用时数据覆盖 | 实现合并策略或提示用户 |
| 5 | ReflectionsView 未清理 timer | 内存泄漏 | onUnmounted 中 clearTimeout |
| 6 | `unescape` 已废弃 | 编码可能在某些环境失败 | 替换为现代编码方案 |
| 7 | Rust 后端无自定义命令 | Tauri invoke 调用无效 | 移除无效调用或实现后端命令 |

### 🟢 P2（优化）

| # | 问题 | 影响 | 修复建议 |
|---|------|------|---------|
| 8 | Views 文件过大 | 可读性差 | 拆分为子组件 |
| 9 | 全局搜索未实现 | 功能不完整 | 实现搜索面板和逻辑 |
| 10 | 无 pre-commit hooks | 代码风格不一致 | 配置 husky + lint-staged |
| 11 | package.json 缺少 lint/test 脚本 | 开发体验差 | 添加 eslint、vitest 配置 |
| 12 | `verbatimModuleSyntax: true` 但无 type-only import 区分 | 可能导致运行时包含类型 | 审查 import 语句 |

---

## 7. 改进建议（按优先级排序）

### 阶段 1：基础加固（1-2 周）

1. **合并 timer 逻辑**
   - 保留 `useTimer` composable 作为计时核心
   - `timerStore` 仅保留业务状态（completedPomodoros, todaySessions 等）
   - TimerView 直接使用 composable，通过回调更新 store

2. **补充核心测试**
   - 安装 Vitest
   - 测试 `useTimer`（开始/暂停/恢复/完成）
   - 测试 `export.ts` 的 Markdown 生成
   - 测试 `format.ts` 的日期格式化

3. **修复 P0/P1 Bug**
   - 修复 ReflectionsView timer 泄漏
   - 替换 `unescape`
   - 修复 StatsView 日期边界

### 阶段 2：工程化完善（1 周）

4. **配置 ESLint + Prettier**
5. **配置 Husky + lint-staged**
6. **启用 TypeScript 严格模式**（逐步修复类型错误）
7. **添加数据库迁移机制**
   - 在 SQLite 中创建 `schema_version` 表
   - 启动时检查版本，执行迁移脚本

### 阶段 3：功能补全（2-3 周）

8. **实现全局搜索面板**
   - 搜索任务、反思、会话
   - 快捷键 `Ctrl+K`

9. **看板原生拖放**
   - HTML5 Drag & Drop API
   - 或集成 `@vueuse/gesture`

10. **GitHub 同步增强**
    - 增量同步（只推送变更）
    - 冲突检测和手动合并 UI

### 阶段 4：架构优化（可选）

11. **拆分大视图组件**
12. **提取通用 UI 组件**
    - Modal、Button、Input、Select 等
13. **Rust 后端补充**
    - 实现真正的后台计时（避免 WebView 节流）
    - 系统托盘集成

---

## 8. 总体评分

### 8.1 雷达图

```
功能完整性    ████████████████████░░░░░  85%
架构设计      ███████████████░░░░░░░░░░  78%
代码质量      ██████████████░░░░░░░░░░░  72%
类型安全      ████████████████░░░░░░░░░  80%
测试覆盖      ░░░░░░░░░░░░░░░░░░░░░░░░░   0%
工程化        █████████████░░░░░░░░░░░░  65%
文档完整      ████████████████░░░░░░░░░  80%
```

### 8.2 总结

PomodoroX 是一个**设计用心、功能丰富**的番茄时钟应用。前端架构采用现代 Vue 3 技术栈，代码风格统一，UI 细节考究（动画、主题、响应式均有考虑）。

**最大亮点：**
- database.ts 的统一接口设计（SQLite + 内存回退）
- 纯 CSS/SVG 实现的图表系统（零图表库依赖）
- 三视图任务管理（列表/看板/热力图）

**最大风险：**
- 零测试覆盖率
- timer 逻辑重复维护
- 缺乏数据迁移机制

**建议下一步行动：** 优先执行"阶段 1"（合并 timer + 补测试 + 修 Bug），这将显著提升项目的可维护性和稳定性。

---

*报告由 project-workflow 自动生成*
