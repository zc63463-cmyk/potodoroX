# Export Report Advanced Exporter — PRD

> **状态**: 已批准  
> **日期**: 2026-05-05  
> **关联设计**: `docs/specs/2026-05-05-export-report-design.md`

---

## 1. 背景与问题

当前 `src/services/export.ts` 的导出函数：
- `plan` / `completion` 字段存在于 Task/Session 类型中，但**完全未进入任何导出报告**
- 任务报告无筛选能力（状态、优先级、标签、时间区间）
- 仅支持 Markdown，无法对接外部工具
- 日报/周报仅按 `createdAt` 筛选，遗漏区间内有番茄钟或状态变更的旧任务

---

## 2. 目标

重构为通用导出器 `exportAdvancedReport(options)`：
- **P0**: 日报/周报完整呈现 `plan` 与 `completion`
- **P0**: 任务报告支持类别检索 + 时间区间筛选
- **P0**: 日报/周报任务筛选升级为"区间内有活动即包含"
- **P1**: 统一 API 支持 Markdown / CSV / JSON 三种格式
- **P1**: 旧函数保留为 deprecated 薄包装

---

## 3. 功能需求

### 3.1 API

```typescript
interface ExportOptions {
  type: 'daily' | 'weekly' | 'task'
  dateRange?: { start: string; end: string }
  filters?: {
    status?: TaskStatus | 'all'
    priority?: Priority | ''
    tags?: string[]
    search?: string
  }
  format: 'markdown' | 'csv' | 'json'
  includeFields?: ('plan' | 'completion')[]
}

export function exportAdvancedReport(options: ExportOptions): string
```

### 3.2 任务筛选规则（日报/周报）

满足任一条件即包含：
1. `createdAt` 在区间内
2. `updatedAt` 在区间内
3. 存在 `Session` 的 `startedAt` 在区间内且 `taskId` 匹配

### 3.3 Plan / Completion 呈现（Markdown）

```markdown
- [x] 完成项目报告 (高优先级)
  标签: `工作` `报告`
  番茄钟: 3/4

  **规划：**
  > 1. 收集 Q2 数据
  > 2. 撰写初稿

  **总结：**
  > 初稿完成度 80%
```

空字符串时该小节完全跳过。

### 3.4 任务报告筛选

- 状态 / 优先级 / 标签（多选）/ 搜索（匹配 title/description/plan/completion）
- 时间范围筛选使用与日报/周报相同的 `isTaskActiveInRange` 逻辑

### 3.5 CSV 格式

```csv
ID,Title,Status,Priority,Tags,DueDate,Estimated,Actual,Plan,Completion,CreatedAt,UpdatedAt
```

- 多行文本转义为 `\n`
- 含逗号字段用双引号包裹

### 3.6 JSON 格式

```json
{
  "meta": { "type": "weekly", "dateRange": {...}, "generatedAt": "..." },
  "summary": { "totalSessions": 2, "totalFocusMinutes": 50, ... },
  "tasks": [ { "id": "1", "plan": "...", "completion": "...", ... } ],
  "reflections": [...],
  "sessions": [...]
}
```

---

## 4. UI 变更

### 4.1 StatsView 导出按钮

日期范围选择器旁增加格式下拉：

```
[ 本周 ▼ ]  [ 格式: Markdown ▼ ]  [ 导出报告 ]
```

### 4.2 任务报告筛选面板

新增"导出任务报告"入口，附带筛选面板：
- 状态 / 优先级 / 标签 / 搜索 / 日期范围 / 格式选择

---

## 5. 兼容性

旧函数保留签名，内部委托新核心：

```typescript
export function exportDailyReport(date, tasks, reflections, sessions): string {
  return exportAdvancedReport({ type: 'daily', dateRange: { start: date, end: date }, format: 'markdown' })
}
```

---

## 6. 验收标准

- [ ] `exportAdvancedReport` 三种 format 输出结构正确
- [ ] `isTaskActiveInRange` 覆盖 created/updated/session 三种条件
- [ ] `filterTasks` 组合筛选逻辑正确
- [ ] 旧函数 backward compatibility 测试通过
- [ ] CSV 转义边界（逗号、引号、换行）测试通过
- [ ] StatsView UI 增加格式选择器且可用
