# 反思模块模板与 Markdown 浏览功能设计

## 概述

优化反思模块的模板功能，支持 Markdown 格式渲染，并新增历史反思的浏览视图，提供标签筛选和完整内容预览能力。整体体验参考语雀"小记"的笔记列表 + 标签筛选 + 内容阅览模式。

---

## 设计决策

- **布局策略**：保持现有编辑页布局（左侧编辑 + 右侧边栏），在页面内通过模式切换实现"写反思"和"浏览历史"两种视图，不破坏用户已有操作习惯。
- **Markdown 渲染**：引入 `marked` 库替代现有的正则替换方案，支持 GFM 语法（表格、删除线、任务列表等），同时配置轻量 XSS 清理。
- **组件拆分**：将现有 1312 行的 `ReflectionsView.vue` 拆分为外壳 + `ReflectionEditor` + `ReflectionBrowser`，避免文件持续膨胀。

---

## 架构与组件拆分

```
ReflectionsView.vue（外壳，约 200 行）
├── header：模式切换按钮（写反思 / 浏览历史）+ 保存状态
├── body：
│   ├── ReflectionEditor.vue（编辑模式）
│   └── ReflectionBrowser.vue（浏览模式）
└── 右侧 sidebar（始终显示今日任务 + 最近反思，两种模式都保留）
```

### 新建文件

| 文件 | 职责 |
|------|------|
| `src/composables/useMarkdown.ts` | 封装 `marked.parse()` + 轻量 XSS 清理 |
| `src/components/ReflectionEditor.vue` | 编辑区完整体验：日期导航、心情、标签输入、模板、编辑/预览 |
| `src/components/ReflectionBrowser.vue` | 历史浏览：标签筛选栏、反思卡片列表、Markdown 内容预览 |

### 修改文件

| 文件 | 变更 |
|------|------|
| `src/views/ReflectionsView.vue` | 精简为外壳，提取编辑/浏览逻辑到子组件 |
| `package.json` / `pnpm-lock.yaml` | 新增 `marked` 依赖 |

---

## Markdown 渲染（`useMarkdown.ts`）

```ts
import { marked } from 'marked'

export function useMarkdown() {
  marked.setOptions({
    breaks: true,
    gfm: true,
  })

  function sanitize(html: string): string {
    const temp = document.createElement('div')
    temp.innerHTML = html
    temp.querySelectorAll('script').forEach(el => el.remove())
    temp.querySelectorAll('*').forEach(el => {
      for (const attr of Array.from(el.attributes)) {
        if (/^on/i.test(attr.name) || attr.value.includes('javascript:')) {
          el.removeAttribute(attr.name)
        }
      }
    })
    return temp.innerHTML
  }

  function renderMarkdown(text: string): string {
    try {
      return sanitize(marked.parse(text, { async: false }) as string)
    } catch {
      return text.replace(/\n/g, '<br>')
    }
  }

  return { renderMarkdown }
}
```

**样式**：在 `.markdown-body` class 下为 h1-h3、ul/ol、code、pre、blockquote、table、hr 提供统一主题化样式，使用 `var(--text)`、`var(--accent)`、`var(--surface)` 等 CSS 变量，保持玻璃拟态设计风格。

---

## 标签系统

### 标签输入（`ReflectionEditor.vue`）

- **位置**：在「快速模板」栏下方新增「标签」栏。
- **交互**：
  - 已选标签显示为小 chip（圆角 + 背景色 + X 按钮删除）。
  - 输入框 placeholder：`添加标签，按回车确认`。
  - 按 **Enter** / **逗号** / **空格** → 将输入转为 chip。
  - 输入框为空时按 **Backspace** → 删除最后一个 chip。
- **校验规则**：自动 trim、去重、转小写、限制单个长度 20 字符、最多 8 个标签。
- **样式**：小尺寸（padding 2px 10px, font-size 0.75rem），使用 `var(--accent)` 边框 + 淡背景。

### 标签筛选（`ReflectionBrowser.vue`）

- **位置**：浏览视图顶部横向排列。
- **交互**：显示 "全部" + 所有唯一标签 pill。点击标签 → 筛选含该标签的反思；再次点击 → 取消筛选；点击 "全部" → 清除筛选。
- **样式**：pill 形状，选中态使用 `var(--accent)` 填充色。

---

## 模板系统（`ReflectionEditor.vue`）

替换现有 3 个模板为以下 5 个，点击后在 `content` 头部插入对应 Markdown 文本并自动聚焦 textarea。

### 1. 极简日记
```markdown
### 极简日记

- 今天发生了：
- 我的感受是：
- 今天最重要的一件事：
- 明天想继续：
```

### 2. 情绪复盘
```markdown
### 情绪复盘

- 今天的主要情绪：
- 触发这个情绪的事件：
- 我当时的想法：
- 这个想法是否完全准确：
- 我可以如何照顾自己：
```

### 3. 今日收获
```markdown
### 今日收获

- 今天完成了：
- 今天学到了：
- 今天让我开心的是：
- 今天值得保留的一个瞬间：
- 给今天的自己一句话：
```

### 4. 困难与解决
```markdown
### 困难与解决

- 今天遇到的困难：
- 当时我的感受：
- 我尝试过的方法：
- 有效的做法：
- 下次可以怎么改进：
```

### 5. 明日计划
```markdown
### 明日计划

- 明天最重要的一件事：
- 需要完成的 2–3 个小任务：
  - 
  - 
  - 
- 可能遇到的阻碍：
- 我准备如何应对：
- 明天从哪一步开始：
```

---

## 浏览视图（`ReflectionBrowser.vue`）

### 布局

```
┌─────────────────────────────────────────────────┐
│ [全部] [日记] [复盘] [收获] [标签2] [标签3] ... │  ← 标签筛选栏
├─────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────┐  │
│ │ 5月3日 周四        😊  [日记] [收获]       │  │
│ │                                           │  │
│ │ 今天完成了项目重构，感觉很有成就感...      │  │  ← 预览前150字
│ │                                           │  │
│ │ [展开查看完整内容]                        │  │
│ └───────────────────────────────────────────┘  │
│ ┌───────────────────────────────────────────┐  │
│ │ 5月2日 周三        😐                      │  │
│ │ ...                                       │  │
│ └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 交互

- **卡片**：每个反思显示日期、心情 emoji、标签 chips、内容预览（前 150 字）。
- **展开**：点击卡片或「展开查看完整内容」按钮 → 卡片向下展开，显示完整的 `marked` 渲染内容（`max-height` + `opacity` transition，0.3s ease）。
- **编辑**：展开态底部显示「✏️ 编辑此条」按钮，点击后父组件切换回编辑模式并加载该日期。
- **删除**：卡片右上角保留删除按钮（hover 显示）。
- **排序**：列表按日期倒序排列。

---

## 模式切换

- 在 `ReflectionsView` header 中，日期导航左侧增加两个模式按钮：「✍️ 写反思」/「📚 浏览历史」。
- 通过 `mode: 'edit' | 'browse'` ref 控制主内容区渲染 `ReflectionEditor` 还是 `ReflectionBrowser`。
- 切换模式时不丢失当前编辑内容（编辑态数据缓存在父组件 `editState`）。

---

## 数据流

```
ReflectionsView.vue（状态持有者）
  ├── mode: 'edit' | 'browse'
  ├── editState: { date, content, mood, tags, reflectionId }
  ├── on save → reflectionStore.updateReflection(id, { content, mood, tags })
  ├── on create → reflectionStore.createReflection({ date, content, mood, tags, relatedTaskIds: [] })
  └── on tag filter → reflectionStore.setFilter({ tag })

ReflectionEditor.vue（v-model 风格）
  ├── 接收 props: date, content, mood, tags, todayTasks
  ├── 编辑后 emit: update:content, update:mood, update:tags
  └── 点击模板 emit: insertTemplate(text) → 父组件更新 content

ReflectionBrowser.vue（只读展示）
  ├── 接收 props: reflections（已筛选后的列表）, allTags
  ├── emit: selectReflection(r) → 父切 edit 模式并加载日期
  └── emit: deleteReflection(id) → 父调用 store.deleteReflection
```

---

## 边界与错误处理

- **marked 解析异常**：`renderMarkdown` 用 try/catch，失败时回退到纯文本换行渲染。
- **空标签输入**：trim 后为空则不添加，重复标签不添加。
- **无标签时**：标签输入栏正常显示（提示"添加标签"），标签筛选栏隐藏并显示 "暂无标签" 提示。
- **无历史反思时**：浏览模式显示空状态文字提示。
- **切换模式时**：编辑态的未保存内容保留在父组件 `editState` 中，切换回来不丢失。

---

## 样式原则

- 保持现有 **Focus Flow Design System**：玻璃拟态（glass-bg、backdrop-filter）、圆角 12-16px、`var(--accent)` 主色调。
- 所有新增样式使用 scoped CSS，与现有变量体系兼容。
- 移动端响应式保持现有断点（max-width: 900px / 640px）。

---

## 依赖变更

新增依赖：

```json
{
  "marked": "^15.0.0"
}
```

---

## 与现有系统的兼容性

- `src/stores/reflection.ts` **无需修改**：已有的 `filteredReflections`、`allTags`、`setFilter` 机制完全满足标签筛选需求。
- `src/services/database.ts` **无需修改**：`tags` 字段已存在于 `reflections` 表，JSON 序列化/反序列化已支持。
- `src/types/index.ts` **无需修改**：`Reflection` 类型已包含 `tags: string[]`。
