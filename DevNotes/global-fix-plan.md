# 全局问题修复实施计划

> 生成时间: 2026-05-04
> 基于: Overall-status.md 技术债务分析
> 目标: 增强代码健壮性，修复高/中优先级全局问题

---

## 一、修复范围

| # | 问题 | 文件 | 优先级 | 状态 |
|---|------|------|--------|------|
| 1 | TimerView 直接修改 store state | `TimerView.vue` | 高 | 待修复 |
| 2 | TimerStore tick 竞态锁不完整 | `timer.ts` | 高 | 待修复 |
| 3 | TimerStore 内部状态非响应式 | `timer.ts` | 中 | 待修复 |
| 4 | SettingsView 输入高频保存 | `SettingsView.vue` | 高 | 待修复 |
| 5 | TimerView remaining watch 竞态 | `TimerView.vue` | 高 | 待修复 |
| 6 | TimerStore 循环依赖 hack | `timer.ts` | 中 | 待修复 |

---

## 二、任务详情

### Task 1: TimerStore tick 竞态锁强化

**文件:** `src/stores/timer.ts`
**问题:** `tick()` 调用 `completeSession(true)` 前不检查 `isCompleting`，且 `onVisibilityChange` 同理。`completeSession` 是 async，若在 await 期间另一入口调用，锁已存在但 tick 自身不检查。

**修改:**
- `tick()` line ~323: 调用 `completeSession(true)` 前加 `if (isCompleting) return`
- `onVisibilityChange()` line ~350: 调用 `completeSession(true)` 前加 `if (isCompleting) return`
- 增加 `beforeunload` 事件监听，清理 interval

**验证:**
- `pnpm typecheck` 通过
- `pnpm test` 通过

---

### Task 2: TimerStore 内部状态响应式化

**文件:** `src/stores/timer.ts`
**问题:** `targetEndTime`, `timerInterval`, `sessionStartTime` 是 plain `let`，DevTools 不可见，调试困难。

**修改:**
- `let targetEndTime = 0` -> `const targetEndTime = ref(0)`
- `let timerInterval: ... | null = null` -> `const timerInterval = ref<...>(null)`
- `let sessionStartTime = ''` -> `const sessionStartTime = ref('')`
- 同步修改所有读取/赋值处为 `.value`

**注意:** `timerInterval` 改为 ref 后，`setInterval` 返回值在赋值时需注意 `ReturnType<typeof setInterval>` 不能直接放入 ref，使用 `let` 改为 `shallowRef` 或保持 `let` 但导出为 readonly ref 供调试。为最小改动，使用 `const _targetEndTime = ref(0)` 等内部 ref，对外仍不暴露。

**验证:**
- `pnpm typecheck` 通过

---

### Task 3: TimerView 直接 store state 修改 -> action

**文件:** `src/views/TimerView.vue`
**问题:**
- line 264: `timerStore.currentTaskId = taskId`
- line 326, 333: `timerStore.pendingCompletionForTaskId = null`
- line 552: `timerStore.remaining = timerStore.getTotalDuration()`

**修改:**
- 在 `timer.ts` 添加 action: `setCurrentTaskId(id)`, `clearPendingCompletion()`, `resetRemaining()`
- 在 `TimerView.vue` 替换直接赋值为调用 action

**验证:**
- `pnpm typecheck` 通过

---

### Task 4: TimerView remaining watch 竞态修复

**文件:** `src/views/TimerView.vue`
**问题:** line 450-458 watch on `remaining <= 0` 依赖 `sessionStore.todaySessions[0]` 判断完成。当 `remaining` 归零时 session 可能尚未写入，导致通知/动画不触发。

**修改:**
- 移除 `watch(() => timerStore.remaining)` 完成检测逻辑
- 改为监听 `timerStore.pendingCompletionForTaskId` 或 `sessionStore.todaySessions` 长度变化触发 `handleSessionComplete()`
- `handleSessionComplete()` 只负责播放动画/通知，不负责完成检测

**验证:**
- 构建通过

---

### Task 5: SettingsView 输入高频保存 debounce

**文件:** `src/views/SettingsView.vue`
**问题:**
- GitHub Token/Owner/Repo input 使用 `@input` 直接调用 `updateGithubToken()` -> `settingsStore.updateSetting()`，每次按键都写入 storage
- 时长 slider 已部分修复（使用 `@change`），但 slider 临时值逻辑需确认

**修改:**
- 给 `updateGithubToken`, `updateGithubOwner`, `updateGithubRepo` 添加 debounce（500ms）
- 引入简单 debounce util 或使用 `watch` + `debounce`

**验证:**
- `pnpm typecheck` 通过

---

### Task 6: TimerStore 循环依赖解耦

**文件:** `src/stores/timer.ts`
**问题:** `getTotalDuration()` 内部动态调用 `useSettingsStore()` 避免模块级循环依赖。

**修改:**
- 将 `getTotalDuration()` 改为接受 `settings: AppConfig` 参数
- 在组件层通过 `settingsStore.settings` 传入，或 store 初始化时注入
- 保持响应式：在 `setSessionType`, `start`, `reset` 等调用处传入当前 settings

**验证:**
- `pnpm typecheck` 通过
- `pnpm test` 通过

---

## 三、执行顺序

1. Task 1 (timer.ts 竞态锁) - 底层，影响稳定
2. Task 2 (timer.ts 响应式) - 同文件，一并修改
3. Task 6 (timer.ts 循环依赖) - 同文件，一并修改
4. Task 3 (TimerView store mutations) - 依赖 Task 2/6 的新 action
5. Task 4 (TimerView watch 竞态) - 视图层修改
6. Task 5 (SettingsView debounce) - 独立，可并行

---

## 四、验证清单

- [ ] `pnpm typecheck` 0 errors
- [ ] `pnpm test` all pass
- [ ] `pnpm build` success
