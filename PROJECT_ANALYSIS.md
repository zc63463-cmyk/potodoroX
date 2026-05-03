# PomodoroX 项目全面分析报告

## 一、当前功能概览

### 已实现功能

| 模块 | 功能点 |
|------|--------|
| **番茄计时器** | 工作/短休息/长休息/自由计时四种模式；环形 SVG 进度条；动态渐变背景；呼吸动画；任务关联；音效播放；系统通知；庆祝粒子动画；空格键快捷键；今日专注统计 |
| **任务管理** | 列表/看板/日历热力图三种视图；任务 CRUD；状态/优先级/标签筛选；搜索排序；内联编辑；截止日期追踪（过期/即将到期高亮）；番茄钟预估与实际数 |
| **反思日志** | 按日期编辑；Markdown 编辑+预览；心情选择器；快速模板；自动保存；今日任务关联；最近反思列表 |
| **数据统计** | 日期范围选择（今日/本周/本月/自定义）；统计卡片（番茄数、专注时长、连续天数、完成率）；柱状图趋势；甜甜圈图时间分布；心情折线图；最佳专注时段；最近会话列表；Markdown 报告导出 |
| **设置** | GitHub 同步配置；计时器时长/间隔/自动开始；三主题切换；数据导入/导出/清除 |
| **数据层** | SQLite 本地存储（Tauri 插件）；GitHub REST API 同步；设置持久化（Tauri Store / localStorage 回退） |

---

## 二、UI/UX 明显问题

### 1. 交互体验缺陷

| 问题 | 位置 | 严重程度 |
|------|------|----------|
| **计时器完成检测不可靠** | `TimerView.vue:237-247` | 高 |
| `watch(() => timerStore.remaining)` 通过 `remaining <= 0` 且 `todaySessions[0].completed` 判断会话完成，存在竞态条件：当 `remaining` 归零时，session 可能尚未写入数据库和 `todaySessions`，导致通知和庆祝动画不触发；若写入后 `remaining` 再次被 watch 触发，则可能导致重复通知。 | | |
| **看板无法拖拽** | `TasksView.vue` | 高 |
| 看板视图只有点击移动按钮来变更状态，不符合用户心智模型。现代看板（Trello/Notion）均支持拖拽卡片，当前交互效率低。 | | |
| **自动保存机制不完整** | `ReflectionsView.vue:128-137` | 中 |
| `triggerAutoSave` 仅在 `selectMood` 和 `insertTemplate` 时调用，**内容编辑时（textarea 输入）没有自动保存**，用户可能丢失大量输入内容。 | | |
| **内联编辑 ref 用法错误** | `TasksView.vue:662` | 中 |
| `<input ref="inlineEditInput" />` 在 `v-for` 中使用单一 ref 字符串，Vue 3 中无法正确获取元素引用，导致自动聚焦失效。应使用 `:ref="(el) => { ... }"` 或函数绑定。 | | |
| **滑块频繁触发保存** | `SettingsView.vue:473-481` | 中 |
| 拖动时长滑块时，`@input` 每次变化都立即调用 `settingsStore.updateSetting()`，造成高频 IO 写入。应使用 `debounce` 或 `change` 事件。 | | |

### 2. 视觉与信息展示问题

| 问题 | 位置 | 说明 |
|------|------|------|
| **热力图数据逻辑错误** | `TasksView.vue:145-178` | 使用 `task.updatedAt` 和 `task.actualPomodoros` 计算每日番茄数，这是错误的：任务更新不等于完成番茄钟，应使用 `sessions` 表数据 |
| **月份标签重叠** | `TasksView.vue:851-860` | `left: wi * 15 + 'px'` 硬编码定位，周数多时会重叠，无法正确显示月份 |
| **心情折线 X 轴不均匀** | `StatsView.vue:274-290` | `moodLinePoints` 过滤掉无数据的天数后，按索引均匀分布，导致时间间隔视觉上被压缩，可能产生误导 |
| **统计完成率算法错误** | `StatsView.vue:151-161` | `taskCompletionRate` 统计"在日期范围内创建的任务"的完成率，而非"在日期范围内完成的任务"，指标定义不符合直觉 |
| **无全局搜索 UI** | 全局 | README 宣称 `Ctrl+K` 全局搜索，`appStore.showGlobalSearch` 存在，但没有任何视图实现搜索弹窗组件 |
| **无加载/空状态骨架屏** | 全局 | 数据加载时没有 skeleton 或 loading 占位，直接空白或闪一下 |

### 3. 可用性问题

| 问题 | 说明 |
|------|------|
| `alert()` 滥用 | `SettingsView.vue:233,269,293` 使用原生 `alert()` 提示导入/清除结果，打断用户操作流，应使用 toast/inline message |
| 清除数据不彻底 | `SettingsView.vue:286-301` 仅清除 `localStorage`，SQLite 数据未被清除，用户刷新后数据仍然存在 |
| 缺少撤销机制 | 删除任务、删除反思、清除数据均无撤销（Undo）或回收站机制 |
| 看板列无滚动提示 | 看板列内容超出时无视觉提示，用户可能不知道下面还有卡片 |
| 响应式断点混乱 | TimerView: 640px/380px；StatsView: 1100px/700px；SettingsView: 600px；TasksView 几乎无响应式适配 |

---

## 三、代码结构评估

### 合理之处

1. **Pinia Setup Store 模式使用规范**：所有 store 均采用 Composition API 风格，状态、计算属性、方法分离清晰。
2. **类型定义完整**：`src/types/index.ts` 涵盖了所有核心实体和筛选/排序/配置类型。
3. **视图与状态分离**：视图组件不直接操作数据库，统一通过 store 交互（StatsView 有例外）。
4. **常量集中管理**：主题、心情、优先级、视图配置等统一在 `constants.ts` 中定义。

### 结构性问题

| 问题 | 位置 | 影响 |
|------|------|------|
| **Store 循环依赖 Hack** | `timer.ts:78-95` | `getTotalDuration()` 在函数内部动态调用 `useSettingsStore()` 来避免模块级循环依赖，说明 timer store 和 settings store 的耦合设计不合理。应将时长配置作为参数传入，或使用时在组件层组合。 |
| **Store 筛选逻辑被架空** | `task.ts:28-88` | `taskStore.filteredTasks` 定义了完整的筛选/排序逻辑，但 `TasksView.vue:73-128` 完全重新实现了一套本地筛选，导致**维护两份重复逻辑**。视图应复用 store 的 getter。 |
| **数据层抽象被破坏** | `StatsView.vue:413` | 直接 `import { db } from '@/services/database'` 并调用 `db.getAllSessions()`，绕过 timer/reflection store，破坏了统一的数据层抽象。未来若加缓存或权限控制，StatsView 会遗漏。 |
| **TimerStore 内部状态非响应式** | `timer.ts:43-52` | `targetEndTime`、`timerInterval`、`sessionStartTime`、`currentSessionId` 是普通变量（非 ref），在 Vue DevTools 中不可见，且若需在组件间共享调试信息会很困难。 |
| **直接修改 store state** | `TimerView.vue:179` | `timerStore.currentTaskId = taskId` 直接赋值，应通过 store action 修改，以启用 devtools 追踪和未来的状态校验。 |
| **CSS 重复与 Tailwind 未使用** | 所有 .vue 文件 | README 宣称使用 Tailwind CSS v4，但代码中几乎全是手写 `<style scoped>`，且大量重复定义模态框、按钮、表单样式，与 Tailwind 的 utility-first 理念相悖。 |

---

## 四、缺少的核心功能

### 与 README 承诺不符（已宣称但未实现）

| README 承诺 | 实际状态 | 差距说明 |
|-------------|----------|----------|
"环境音效" | 部分实现 | 只有程序化提示音（`useAudio.ts` 未读，但从 TimerView 调用看只有简单音效），无白噪音/背景音
"全局搜索 Ctrl+K" | 未实现 | `appStore.showGlobalSearch` 存在，但无对应 UI 组件
"快捷键 Ctrl+1~5 切换页面" | 未实现 | `useKeyboard.ts` composable 未在当前视图中引入
"自由计时器 UI 入口" | 未实现 | `TIMER_MODES` 定义了 `free`，但 TimerView 没有切换自由模式的控件
"自定义主题" | 骨架实现 | `THEMES` 包含 `custom`，但 `THEME_COLORS.custom` 和设置页均无自定义配色面板

### 合理的功能性缺失

| 功能 | 优先级 | 说明 |
|------|--------|------|
| **拖拽排序/看板拖拽** | 高 | 看板卡片应支持拖拽变更状态 |
| **定时自动同步** | 高 | GitHub 同步需手动点击，应支持后台定时同步 |
| **任务到期提醒** | 中 | 有截止日期字段，但无提醒通知 |
| **重复任务** | 中 | 无法创建每日/每周重复任务 |
| **批量操作** | 中 | 无法批量删除/归档/修改状态 |
| **番茄钟历史明细** | 中 | 只能看今日会话，无法查看任意日期的 session 详情 |
| **数据导出格式扩展** | 低 | 目前仅支持 Markdown，应支持 CSV/JSON/ICS |
| **系统托盘/迷你模式** | 低 | Tauri 桌面应用应具备托盘图标和悬浮窗 |
| **番茄钟目标设定** | 低 | 无法设定"今日目标 N 个番茄钟" |
| **专注中断原因记录** | 低 | 跳过/暂停时无法记录原因，不利于后续分析 |

---

## 五、技术债务清单

### 高优先级（影响稳定性或数据安全）

1. **计时器 interval 无 beforeunload 清理** (`timer.ts:125,309`)
   - 用户关闭应用前若计时器运行，interval 和 visibilitychange 事件未清理，可能导致内存泄漏或异常行为。
   - **建议**：在 `window.addEventListener('beforeunload', ...)` 中调用 `stopTimer()`。

2. **XSS 风险** (`ReflectionsView.vue:222-233`)
   - `renderMarkdown()` 输出直接通过 `v-html` 渲染，未过滤 HTML/JS。虽然内容来自用户输入，但导入数据时可能被恶意利用。
   - **建议**：使用 DOMPurify 或可信的 Markdown 库（marked + sanitize）。

3. **GitHub Token 明文存储** (`SettingsView.vue`)
   - Token 以明文保存在 localStorage / Tauri Store，无加密。
   - **建议**：使用 Tauri 的 `stronghold` 插件或系统 keychain 存储敏感凭证。

4. **导入数据无事务** (`SettingsView.vue:217-278`)
   - JSON 导入循环插入多条记录，若中途失败，数据处于半导入状态。
   - **建议**：提供事务包装或先校验 schema 再批量导入。

5. **TimerStore 竞态条件** (`timer.ts:294-304`)
   - `tick()` 中 `completeSession(true)` 是异步的，若执行耗时，下一个 tick（100ms 后）可能再次触发。
   - **建议**：添加 `isCompleting` 锁标志。

### 中优先级（影响可维护性）

6. **颜色值硬编码**（全局）
   - `#F85149`、`#58A6FF` 等颜色在 Vue 文件、constants、store 中多处硬编码。
   - **建议**：全部收敛到 CSS 变量或 theme constants，支持动态主题切换。

7. **响应式断点不统一**（全局）
   - 各视图使用不同的媒体查询断点，缺乏 design token。
   - **建议**：定义统一的 breakpoint variables（sm/md/lg/xl）。

8. **缺少测试覆盖**
   - 无任何单元测试（Vitest）或 E2E 测试（Playwright）。
   - timer store 的时间逻辑、任务筛选逻辑、日期计算等极易出 bug，应优先补充测试。

9. **日期计算工具函数不一致**
   - `timer.ts:275-287` 自己拼接日期字符串，`reflection.ts:63-67` 也自己拼接，多处重复。
   - **建议**：统一使用 `date-fns` 或收敛到 `utils/format.ts`。

10. **SettingsStore 重复保存** (`settings.ts:131-139`)
    - `watch(settings, saveSettings, { deep: true })` 与 `updateSetting()` 内调用 `saveSettings()` 叠加，一次更新触发两次持久化。
    - **建议**：`updateSetting` 中移除 `await saveSettings()`，完全由 watch 驱动。

### 低优先级（优化项）

11. **TasksView 计算属性性能** (`TasksView.vue:73-128`)
    - `displayTasks` 每次渲染都执行全量过滤+排序，任务量大时有性能问题。
    - **建议**：使用 `computed` 缓存是够的，但搜索输入应 debounce。

12. **StatsView 图表无数据缓存** (`StatsView.vue`)
    - `allSessions` 在 mounted 加载后不再更新，但切换到 stats 视图时不会重新加载，新数据不会自动刷新。

13. **缺少错误边界**
    - 任何 store 操作或数据库错误仅 `console.error`，用户无感知。
    - **建议**：增加全局错误处理和 toast 通知系统。

---

## 六、改进建议汇总

### 立即执行（1-2 天）
- [ ] 修复 `TimerView.vue` 的完成检测逻辑，改为监听 `todaySessions` 长度变化或 store 事件
- [ ] 修复 `ReflectionsView.vue` 的自动保存，增加 `watch(content, triggerAutoSave)`
- [ ] 修复 `TasksView.vue` 内联编辑 ref 绑定
- [ ] 统一使用 store 的 `filteredTasks` 替代视图本地筛选

### 短期（1-2 周）
- [ ] 将 `db` 直接调用从 StatsView 中移除，改为通过 store 获取数据
- [ ] 提取公共 UI 组件（Modal、Button、Toast、EmptyState）减少 CSS 重复
- [ ] 实现全局搜索弹窗组件（`Ctrl+K`）
- [ ] 修复热力图数据逻辑，改用 sessions 数据
- [ ] 添加拖拽库（如 `@vueuse/components` 或 `sortablejs`）实现看板拖拽

### 中期（1 个月）
- [ ] 引入单元测试（Vitest），优先覆盖 timer store 和任务筛选逻辑
- [ ] 接入可信 Markdown 渲染库（marked + DOMPurify）
- [ ] 实现定时自动同步（Tauri 后台任务或页面可见时同步）
- [ ] 使用 CSS 变量替换所有硬编码颜色
- [ ] 统一响应式断点和 design tokens

### 长期
- [ ] 敏感数据加密存储（Tauri Stronghold）
- [ ] 系统托盘/迷你悬浮窗
- [ ] 白噪音/环境音效系统
- [ ] 数据迁移和 schema 版本管理
