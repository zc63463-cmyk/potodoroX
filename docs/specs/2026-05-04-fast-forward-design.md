# 快进功能设计文档

## 背景与目标

将原有的「跳过」按钮改造为「快进 10′」功能，既保留跳过当前会话的能力，又让专注时长更真实地反映实际投入的时间。

## 用户故事

- As a 用户，I want 在专注过程中快进剩余时间，so that 我可以快速跳过空闲时段但让统计数据反映真实专注时长
- As a 用户，I want 每轮 session 有 3 次免费快进额度，so that 我不会滥用快进功能
- As a 用户，I want 超额快进需要扣除每周额度，so that 我有可控的弹性空间

## 功能需求

### FR-1 快进基础行为
- 点击「快进 10′」按钮，当前 remaining 减少 600 秒
- targetEndTime 同步提前 600 秒，保证 tick 正确
- 快进后 remaining ≤ 0 时，立即触发会话完成
- 快进仅影响**运行中或暂停中**的会话（isIdle 时禁用）

### FR-2 单次 Session 免费额度
- 每个 session 最多可免费快进 **3 次**
- 第 4 次起进入超额模式，扣除每周额度
- 免费/超额次数在 reset() 时清零

### FR-3 每周超额额度
- 每周默认额度：**10 次**
- 额度跟随自然周（周一 00:00 重置）
- 额度存储于 settings store，持久化到 localStorage / Tauri Store
- 当前已用额度不足且用户确认时，允许超额（记为负数或继续累加，UI 显示为「超额 X 次」）

### FR-4 额度用尽弹窗
- 当单次 session 免费额度已用完（≥3 次）且本周超额额度也用完（≥10 次）时：
  - 点击快进按钮弹出确认对话框
  - 文案：「本周快进额度已用完（10/10），确定继续快进？超额使用将在下周恢复。」
  - 用户点击「确定」后执行快进，点击「取消」则无任何操作

### FR-5 实际计时量优先
- Session 的 `duration` 字段记录的是**实际专注时长**
- `duration = originalDuration - totalFastForwardSeconds`
- `totalFastForwardSeconds = 快进次数 × 600`
- 例：25min session 快进 2 次，duration = 15min（900s）
- 这保证了统计、任务 actualPomodoros 等数据反映真实投入

### FR-6 按钮 UI
- 文案：`快进 10′`
- 图标：双箭头 `⏩`（SVG）
- 右上角显示当前 session 已用快进次数（如 `2/3`）
- 颜色沿用 session 主题色

## 数据模型变更

### Session 实体
```typescript
interface Session {
  // ... existing fields
  fastForwardSeconds: number  // 新增：本次 session 快进的总秒数
}
```

### AppConfig 实体
```typescript
interface AppConfig {
  // ... existing fields
  weeklyFastForwardQuota: number        // 默认值 10
  weeklyFastForwardUsed: number         // 本周已用
  weeklyFastForwardResetAt: string      // 上次重置日期 YYYY-MM-DD
}
```

## 状态设计

### TimerStore 新增状态
```typescript
const sessionFastForwardCount = ref(0)   // 当前 session 已快进次数
const sessionFastForwardSeconds = ref(0) // 当前 session 已快进秒数
```

### SettingsStore 新增逻辑
```typescript
function getWeekStart(): string {
  const d = new Date()
  const day = d.getDay() || 7 // 周日=7
  if (day !== 1) {
    d.setHours(-24 * (day - 1))
  }
  return formatDate(d)
}

function checkAndResetWeeklyQuota() {
  const currentWeekStart = getWeekStart()
  if (settings.value.weeklyFastForwardResetAt !== currentWeekStart) {
    settings.value.weeklyFastForwardUsed = 0
    settings.value.weeklyFastForwardResetAt = currentWeekStart
  }
}
```

## 架构设计

```
TimerView.vue
  └── fastForward() ──► timerStore.fastForward()
                          ├── 检查额度（session count + weekly quota）
                          ├── 需要确认？→ 显示 confirm modal（通过返回值/回调）
                          └── 执行：remaining -= 600, targetEndTime -= 600000
                                sessionFastForwardCount++
                                sessionFastForwardSeconds += 600
                                如 remaining ≤ 0 → completeSession(true)

completeSession()
  └── duration = getTotalDuration() - sessionFastForwardSeconds.value
      └── 保存到 SessionStore
      └── reset() 时清空 sessionFastForwardCount / Seconds
```

## 边界情况

1. **快进超过剩余时间**：直接完成 session，duration = original - fastForwardSeconds
2. **暂停中快进**：正常扣除 remaining，恢复后从新的 targetEndTime 继续
3. **重置计时器**：sessionFastForwardCount / Seconds 清零，但不影响每周额度
4. **切换 session 类型**：stopTimer 时会 reset，额度计数清零
5. **刷新页面**：session 级状态丢失（ Vue ref 特性），这是可接受的——刷新后重新计时

## 错误处理

- 快进按钮 disabled 当 isIdle
- 额度检查失败时返回 `false`，UI 展示弹窗
- 不抛出异常，所有错误通过返回值和 console.warn 处理

## 测试要点

1. 快进 1 次：remaining 减少 600s，sessionFastForwardCount = 1
2. 快进 3 次：正常执行，第 4 次扣除每周额度
3. 快进超过剩余时间：立即完成，duration 正确
4. 每周一 00:00 后额度重置
5. 暂停中快进后恢复：时间正确
6. 弹窗确认：取消后不执行，不扣额度

## 非功能需求

- 性能：快进是 O(1) 状态更新，无额外计算
- 兼容性：新增字段不影响现有 session 数据（读取时默认为 0）
- 可访问性：按钮有 aria-label，弹窗有焦点管理
