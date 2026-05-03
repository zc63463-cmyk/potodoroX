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

## 已知问题 & 决策
- 2026-05-03: timerStore 已修复为使用 settingsStore 而非直接读 localStorage
- 2026-05-03: useTimer composable 已标记废弃，项目统一使用 useTimerStore
- 2026-05-03: isTauriAvailable 已提取到 `src/utils/tauri.ts` 共享
- 2026-05-03: Rust 后端无自定义命令，前端无效 Tauri invoke 调用已移除
- 2026-05-03: github.ts 的 unescape() 已替换为 TextEncoder/TextDecoder 方案
- 2026-05-03: ReflectionsView 自动保存 timer 已添加 onUnmounted 清理
- 2026-05-03: StatsView 日期比较已改用 Date 对象
