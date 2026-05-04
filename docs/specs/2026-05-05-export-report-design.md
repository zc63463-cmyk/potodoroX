# Export Report 高级导出器 - 设计文档

> **日期**: 2026-05-05  
> **类型**: 功能重构与增强  
> **目标**: 将现有静态 Markdown 导出升级为通用高级导出器，纳入 `plan`/`completion` 字段，支持 Markdown / CSV / JSON 三种格式，并增加类别检索与时间区间筛选。

---

## 1. 背景与问题

当前 `src/services/export.ts` 提供四种导出函数：
- `exportDailyReport` — 日报 Markdown
- `exportWeeklyReport` — 周报 Markdown
- `exportTaskReport` — 任务列表 Markdown（无筛选）
- `exportReflectionReport` — 反思报告 Markdown

**问题**：
1. `plan`（任务规划）与 `completion`（任务总结）字段存在于 `Task` / `Session` 类型中，但 **完全未进入任何导出报告**
2. 任务报告无筛选能力，只能导出全部任务
3. 仅支持 Markdown 单一格式，无法对接外部工具
4. 日报/周报的任务筛选逻辑过于简单（仅按 `createdAt`），遗漏了在区间内实际有活动但非新创建的任务

---

## 2. 设计目标

| 目标 | 优先级 |
|------|--------|
| 在日报/周报中完整呈现任务的 `plan` 与 `completion` | P0 |
| 任务报告支持类别检索 + 时间区间筛选 | P0 |
| 统一为通用导出器 `exportAdvancedReport`，支持三种输出格式 | P1 |
| 保持现有四个函数向后兼容（deprecated 薄包装） | P1 |
| 日报/周报任务筛选升级为"区间内有活动即包含" | P0 |

---

## 3. 架构设计

### 3.1 整体数据流

```mermaid
graph LR
    A["StatsView<br/>收集日期范围 + 筛选条件"] --> B["exportAdvanced(options)<br/>数据聚合/筛选引擎"]
    B --> C["格式渲染器<br/>Markdown / CSV / JSON"]
    C --> D["Blob + download<br/>浏览器下载"]

    style B fill:#58A6FF,color:#fff
    style C fill:#3FB950,color:#fff
```

### 3.2 模块划分

| 模块 | 职责 | 文件 |
|------|------|------|
| **数据聚合器** | 按日期范围/筛选条件收集任务、Session、反思 | `export.ts` 内部 |
| **格式渲染器** | `MarkdownRenderer` / `CsvRenderer` / `JsonRenderer` | `export.ts` 内部 |
| **兼容性层** | 旧函数委托给新核心 | `export.ts` 外部函数 |

---

## 4. API 设计

### 4.1 核心接口

```typescript
// src/services/export.ts

export interface ExportOptions {
  type: 'daily' | 'weekly' | 'task'
  dateRange?: { start: string; end: string }  // YYYY-MM-DD
  filters?: {
    status?: TaskStatus | 'all'
    priority?: Priority | ''
    tags?: string[]
    search?: string
  }
  format: 'markdown' | 'csv' | 'json'
  includeFields?: ('plan' | 'completion' | 'description' | 'tags')[]
}

export function exportAdvancedReport(options: ExportOptions): string
```

### 4.2 向后兼容

```typescript
// 旧函数保留为 deprecated 薄包装
export function exportDailyReport(
  date: string,
  tasks: Task[],
  reflections: Reflection[],
  sessions: Session[]
): string {
  return exportAdvancedReport({
    type: 'daily',
    dateRange: { start: date, end: date },
    format: 'markdown',
    includeFields: ['plan', 'completion', 'tags']
  })
}
```

---

## 5. 数据筛选规则

### 5.1 日报/周报任务筛选（升级）

**旧逻辑**：`createdAt` 在日期范围内  
**新逻辑**：满足以下任一条件即包含

```typescript
function isTaskActiveInRange(
  task: Task,
  sessions: Session[],
  start: Date,
  end: Date
): boolean {
  const created = new Date(task.createdAt)
  const updated = new Date(task.updatedAt)
  const hasSessionInRange = sessions.some(
    s => s.taskId === task.id &&
         new Date(s.startedAt) >= start &&
         new Date(s.startedAt) <= end
  )
  return (created >= start && created <= end) ||
         (updated >= start && updated <= end) ||
         hasSessionInRange
}
```

### 5.2 任务报告筛选

```typescript
function filterTasks(
  tasks: Task[],
  filters: ExportOptions['filters'],
  dateRange?: { start: string; end: string }
): Task[] {
  return tasks.filter(t => {
    // 状态
    if (filters?.status && filters.status !== 'all' && t.status !== filters.status) return false
    // 优先级
    if (filters?.priority && t.priority !== filters.priority) return false
    // 标签
    if (filters?.tags?.length && !filters.tags.some(tag => t.tags.includes(tag))) return false
    // 搜索
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      const match = t.title.toLowerCase().includes(q) ||
                    t.description.toLowerCase().includes(q) ||
                    t.plan.toLowerCase().includes(q) ||
                    t.completion.toLowerCase().includes(q)
      if (!match) return false
    }
    // 时间范围
    if (dateRange) {
      const start = new Date(dateRange.start + 'T00:00:00')
      const end = new Date(dateRange.end + 'T23:59:59')
      if (!isTaskActiveInRange(t, [], start, end)) return false
    }
    return true
  })
}
```

---

## 6. 格式规范

### 6.1 Markdown（日报/周报）

任务列表项下方直接内嵌 plan / completion（非空时）：

```markdown
- [x] 完成项目报告 (高优先级)
  标签: `工作` `报告`
  番茄钟: 3/4

  **规划：**
  > 1. 收集 Q2 数据
  > 2. 撰写初稿

  **总结：**
  > 初稿完成度 80%，数据部分需补充。
```

**空值处理**：`plan` 或 `completion` 为空字符串时，该小节完全跳过。

### 6.2 Markdown（任务报告）

按优先级分组，每个任务展示完整字段：

```markdown
## 高优先级

- [x] 完成项目报告 [已完成]
  标签: `工作` `报告`
  截止: 2026-05-03
  番茄钟: 3/4

  **规划：**
  > 1. 收集 Q2 数据
  > 2. 撰写初稿

  **总结：**
  > 初稿完成度 80%
```

### 6.3 CSV 格式

```csv
ID,Title,Status,Priority,Tags,DueDate,EstimatedPomodoros,ActualPomodoros,Plan,Completion,CreatedAt,UpdatedAt
1,完成项目报告,done,high,"工作,报告",2026-05-03,4,3,"1. 收集Q2数据\n2. 撰写初稿","初稿完成度80%",2026-05-03 09:00:00,2026-05-03 11:30:00
```

- 多行文本转义为 `\n`
- 含逗号字段用双引号包裹
- 空字符串留空

### 6.4 JSON 格式

```json
{
  "meta": {
    "generatedAt": "2026-05-05T01:17:00.000Z",
    "type": "weekly",
    "dateRange": { "start": "2026-04-27", "end": "2026-05-03" }
  },
  "summary": {
    "totalSessions": 2,
    "totalFocusMinutes": 50,
    "completedTasks": 1,
    "totalTasks": 2
  },
  "tasks": [
    {
      "id": "1",
      "title": "完成项目报告",
      "plan": "1. 收集Q2数据\n2. 撰写初稿",
      "completion": "初稿完成度80%",
      ...
    }
  ],
  "reflections": [...],
  "sessions": [...]
}
```

---

## 7. StatsView UI 变更

### 7.1 新增格式选择器

日期范围选择器旁增加 `format` 下拉：

```
[ 本周 ▼ ]  [ 格式: Markdown ▼ ]  [ 导出报告 ]
              └── Markdown / CSV / JSON
```

### 7.2 任务报告触发入口

新增"导出任务报告"按钮，附带筛选面板：

```
┌────────────────────────────────────────┐
│  导出任务报告                            │
│                                        │
│  [ 状态: 全部 ▼ ]  [ 优先级: 全部 ▼ ]     │
│  [ 标签: 多选 ]    [ 搜索: ______ ]     │
│                                        │
│  [ 日期范围: 本周 ▼ ]                   │
│                                        │
│  [ 格式: Markdown ▼ ]  [ 导出 ]          │
└────────────────────────────────────────┘
```

---

## 8. 测试策略

| 测试项 | 范围 |
|--------|------|
| `exportAdvancedReport` 三种 format 输出结构正确 | 新增单元测试 |
| `isTaskActiveInRange` 边界条件（created/updated/session） | 新增单元测试 |
| `filterTasks` 组合筛选逻辑 | 新增单元测试 |
| 旧函数 backward compatibility（调用新核心） | 保留 + 新增适配层测试 |
| CSV 转义（逗号、引号、换行） | 边界测试 |

---

## 9. 边界与约束

- **向后兼容**：旧函数签名不变，内部委托新核心
- **性能**：任务量大时 CSV/JSON 输出可能较大，但仍在浏览器 Blob 内存安全范围内（< 10MB）
- **Tauri 桌面端**：Blob 下载逻辑在 Tauri 中同样适用
- **时区**：继续使用本地时区（与现有逻辑一致）
