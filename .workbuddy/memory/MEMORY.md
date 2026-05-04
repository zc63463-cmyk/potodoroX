# PomodoroX 工作记忆

## 项目概要
- **技术栈**: Tauri v2 + Vue 3 + TypeScript + Pinia + Tailwind CSS v4
- **构建工具**: Vite 8
- **桌面框架**: Tauri v2 (Rust 后端目前无自定义命令)
- **数据库**: SQLite (tauri-plugin-sql) + 内存回退

## 项目约定
- 日期格式: `YYYY-MM-DD` / `YYYY-MM-DD HH:mm:ss`
- 状态管理: Pinia Setup Store 模式
- 路径别名: `@` → `src/`
- 测试框架: Vitest + happy-dom
- **架构规则**: View → Store → Service，禁止 View 直接调用 db/github

## 架构层次
```
View 层: TimerView, TasksView, ReflectionsView, StatsView, SettingsView
Store 层: timerStore, taskStore, reflectionStore, sessionStore, syncStore, settingsStore, appStore
Service 层: database.ts (db), github.ts, export.ts
```

## 已知问题 & 决策
- 2026-05-03: timerStore 已修复为使用 settingsStore 而非直接读 localStorage
- 2026-05-03: isTauriAvailable 已提取到 `src/utils/tauri.ts` 共享
- 2026-05-03: Rust 后端无自定义命令，前端无效 Tauri invoke 调用已移除
- 2026-05-03: github.ts 的 unescape() 已替换为 TextEncoder/TextDecoder 方案
- 2026-05-03: ReflectionsView 自动保存 timer 已添加 onUnmounted 清理
- 2026-05-03: StatsView 日期比较已改用 Date 对象
- 2026-05-03: **流程C重构**: 新增 SessionStore (`src/stores/session.ts`) 封装 Session 数据管理
- 2026-05-03: **流程C重构**: 新增 SyncStore (`src/stores/sync.ts`) 封装 GitHub 同步 + db sync
- 2026-05-03: **流程C重构**: timerStore 的 todaySessions/loadTodaySessions 委托给 SessionStore
- 2026-05-03: **流程C重构**: TasksView/StatsView/SettingsView 已消除所有 db 越层访问
- 2026-05-03: **流程C重构**: TasksView 筛选排序统一使用 taskStore.filteredTasks + setFilter + setSort
- 2026-05-03: **流程C重构**: 删除 useTimer.ts 死代码，清理 TimerState/DailyStats/未用常量/未用函数
- 2026-05-03: **流程C重构**: SettingsView 通过 SyncStore 访问 db/github，不再直接 import
- 2026-05-03: **Tauri 空白修复**: vite.config.ts 添加 `base: process.env.TAURI_ENV_PLATFORM ? './' : '/'`，tauri.conf.json devUrl 端口从 5173 改为 1420
- 2026-05-03: **Tauri 构建修复**: tauri.conf.json 移除无效字段（app.title / macOS.title / appimage.bundleMedia），Cargo.toml 启用 `tray-icon` feature
- 2026-05-03: `cargo tauri build --debug` 成功，输出 pomodorox.exe + MSI/NSIS 安装包
- 2026-05-03: src-tauri/icons/icon.ico 为临时占位文件，需后续用 `pnpm tauri icon` 替换

## 项目构建配置
- **Vite base**: Tauri 生产构建需相对路径 `./`，开发模式用默认 `/`
- **Vite dev server 端口**: 1420 (tauri.conf.json devUrl 需匹配)
- **Tauri CLI**: 未安装为项目依赖，需通过 `cargo tauri dev` 或全局安装

## 待办 (P2) ✅ 全部完成
- ~~提取 5 个 View 的背景 orb CSS 到 style.css 全局类~~ (已合并，同时修复 keyframes 命名冲突)
- ~~提取模态框 CSS 到全局类~~ (已合并)
- ~~github.ts 重构为类实例或进一步集成到 SyncStore~~ (已评估，现有架构合理)
- ~~reflectionStore 中的手工日期格式化改为使用 formatDate()~~ (已替换)

## 已开发功能
- **自由计时（2026-05-03）**: AppConfig.freeDuration（默认30分钟）、timerStore free 模式支持、TimerView 模式切换 chips + 时长输入、SettingsView 默认时长滑块
- **动效引擎集成（2026-05-03）**: Anime.js v4.4.1（数字翻动+进度环+弹簧按钮）、Three.js 0.184.0（MagicRings GLSL 圆环律动）
- **2026-05-07 整理**: 移除 PixelSnow（粒子背景）和 EvilEye（火焰瞳孔着色器），只保留 MagicRings 圆环特效。项目文件清理完毕。
