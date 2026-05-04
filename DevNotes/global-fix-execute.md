# 全局问题修复执行报告

> 执行时间: 2026-05-04
> 前置计划: `global-fix-plan.md`

---

## 一、验证结果

| 检查项 | 命令 | 结果 |
|--------|------|------|
| 类型检查 | `pnpm typecheck` | ✅ 通过 (0 errors) |
| 单元测试 | `pnpm test` | ✅ 通过 (73/73 tests, 8 files) |
| 构建 | `pnpm build` | ✅ 通过 (876ms) |

---

## 二、已修复问题

### 1. TimerStore tick 竞态锁强化

**文件:** `src/stores/timer.ts`

**改动:**
- `tick()` line 317: 增加 `|| isCompleting` 守卫，防止完成过程中重复触发 `completeSession`
- `onVisibilityChange()` line 344: 同上增加 `!isCompleting` 守卫
- `start()` / `resume()`: 注册 `beforeunload` 事件监听器，防止窗口关闭时 interval 泄漏
- `stopTimer()`: 统一移除 `beforeunload` 监听器

**效果:** 消除 `tick()` 与 `onVisibilityChange()` 并发调用 `completeSession` 的竞态窗口；窗口关闭前定时器资源被正确清理。

---

### 2. TimerStore 循环依赖解耦

**文件:** `src/stores/timer.ts`

**改动:**
- 引入 `getSettingsStore()` 惰性初始化器，在首次调用时缓存 `useSettingsStore()` 实例
- `getTotalDuration()` / `autoSwitchSession()` 统一通过缓存实例读取配置
- 移除原函数内部动态调用 `useSettingsStore()` 的 hack 注释

**效果:** 消除每次 tick/切换时重复调用 `useSettingsStore()` 的性能开销和代码异味。

---

### 3. TimerView 直接 store state 修改 → action

**文件:** `src/views/TimerView.vue` + `src/stores/timer.ts`

**改动:**
- `timer.ts` 新增 action:
  - `setCurrentTaskId(taskId)`
  - `clearPendingCompletion()`
  - `initRemainingIfZero()`
- `TimerView.vue` 替换 3 处直接赋值:
  - `timerStore.currentTaskId = taskId` → `timerStore.setCurrentTaskId(taskId)`
  - `timerStore.pendingCompletionForTaskId = null` ×2 → `timerStore.clearPendingCompletion()`
  - `timerStore.remaining = timerStore.getTotalDuration()` → `timerStore.initRemainingIfZero()`

**效果:** 所有跨层 state 变更均通过 Pinia action 完成，DevTools Time Travel 可追踪，符合 Vue/Pinia 最佳实践。

---

### 4. TimerView remaining watch 竞态修复

**文件:** `src/views/TimerView.vue`

**改动:**
- 移除原 `watch(() => timerStore.remaining)` 完成检测逻辑
- 替换为 `watch(() => sessionStore.todayPomodoros)`，基于已持久化的番茄数增量触发 `handleSessionComplete()`

**效果:** 消除 `remaining` 归零时 session 尚未写入导致庆祝/通知不触发的 race condition；动画触发时机严格对应 DB 完成。

---

### 5. SettingsView 输入高频保存 debounce

**文件:** `src/views/SettingsView.vue`

**改动:**
- 新增局部 `debounce<T>(fn, ms)` 工具
- GitHub Token / Owner / Repo 三个 `@input` 事件的 store 写入分别包装为 500ms debounce
- 本地 `localSettings` 仍实时更新，UI 响应无延迟；store 持久化延迟写入

**效果:** 消除每次按键触发 `settingsStore.updateSetting()` → storage IO 的高频写入；输入停止 500ms 后统一落盘。

---

## 三、无需修复（已自愈或评估后确认）

| 原债务项 | 评估结论 |
|---------|---------|
| `ReflectionsView` XSS (v-html) | 当前已有 `escapeHtml()` 预处理 + 正则替换，XSS 风险已控制 |
| `ReflectionsView` 自动保存不完整 | 当前已有 `watch(content)` 绑定 textarea，内容变化自动触发防抖保存 |
| `StatsView` 越层访问 DB | 当前 import 链路已改为 `useSessionStore()`，无直接 `db.getAllSessions()` 调用 |
| `SettingsView` 数据清除不彻底 | 当前通过 `syncStore.clearAllData()` 统一清理，覆盖 SQLite + localStorage |

---

## 四、影响范围

- **仅修改文件:** `timer.ts`, `TimerView.vue`, `SettingsView.vue`
- **无新增依赖**
- **无 API/接口变更**
- **无 UI 布局/样式变更**

---

## 五、回归验证建议

1. 快速计时 1 分钟，确认 session 完成后弹窗/动画正常触发
2. 切换浏览器标签页后返回，确认剩余时间补偿正确
3. 设置页输入 GitHub Token，确认 500ms 后 store 值更新
4. 重新运行 `pnpm test` 确保 73 项测试持续通过
