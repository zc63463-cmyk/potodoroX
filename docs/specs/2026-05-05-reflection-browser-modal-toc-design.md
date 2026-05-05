# 浏览历史弹窗 Modal + Markdown 侧边栏目录设计

## 概述

将浏览历史中的卡片展开改为**弹窗 Modal** 形式，Modal 内支持编辑正文内容。同时，Markdown 预览区（编辑模式的预览 + 浏览 Modal 的预览）增加**侧边栏目录（TOC）**，支持点击跳转和滚动联动高亮。

渲染引擎从 `marked` 替换为 `markdown-it` + `markdown-it-anchor`，利用其更成熟的 token 流支持 TOC 提取。

---

## 设计决策

- **Modal 内编辑范围**：仅内容正文可编辑（textarea + 预览切换），心情、标签、日期只读显示。
- **TOC 位置**：编辑预览区 + 浏览 Modal 预览区，共用同一个 `<MarkdownPreview>` 组件。
- **渲染引擎**：`marked` → `markdown-it` + `markdown-it-anchor`（heading id 自动生成）。
- **TOC 列表自研**：用 `markdown-it.parse()` 的 token 流提取 h1-h3，生成 Vue 可操作的数组，驱动侧边栏渲染 + 滚动联动。

---

## 架构变更

### 文件清单

| 文件 | 动作 | 说明 |
|------|------|------|
| `package.json` | 修改 | 移除 `marked`，新增 `markdown-it`、`markdown-it-anchor` |
| `pnpm-lock.yaml` | 修改 | 依赖更新 |
| `src/composables/useMarkdown.ts` | 重写 | marked → markdown-it，新增 `extractToc` |
| `src/components/MarkdownPreview.vue` | 新建 | 复用 Markdown 预览 + 可选 TOC 侧边栏 + 滚动联动 |
| `src/components/ReflectionDetailModal.vue` | 新建 | 浏览历史弹窗（只读头部 + 编辑正文 + 保存/取消） |
| `src/components/ReflectionBrowser.vue` | 修改 | 移除卡片展开逻辑，点击 emit `openDetail` |
| `src/components/ReflectionEditor.vue` | 修改 | 预览区改用 `<MarkdownPreview :content="content" show-toc />` |
| `src/views/ReflectionsView.vue` | 修改 | 新增 Modal 状态管理 + 事件处理 |

---

## Markdown 渲染引擎（`useMarkdown.ts`）

```ts
import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'

const md = new MarkdownIt({
  html: false,        // 禁用原始 HTML，天然 XSS 防护
  breaks: true,       // 软换行
  linkify: true,     // 自动识别 URL
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

md.use(anchor, {
  slugify,
  permalink: false,
})

export interface TocItem {
  level: number
  text: string
  id: string
}

export function useMarkdown() {
  function renderMarkdown(text: string): string {
    return md.render(text)
  }

  function extractToc(text: string): TocItem[] {
    const tokens = md.parse(text, {})
    const toc: TocItem[] = []
    const seenIds = new Set<string>()
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === 'heading_open' && tokens[i].tag.match(/^h[1-3]$/)) {
        const level = parseInt(tokens[i].tag[1])
        const textToken = tokens[i + 1]
        if (textToken && textToken.type === 'inline') {
          const rawText = textToken.content
          const id = slugify(rawText)
          if (seenIds.has(id)) continue
          seenIds.add(id)
          toc.push({ level, text: rawText, id })
        }
      }
    }
    return toc
  }

  return { renderMarkdown, extractToc }
}
```

---

## MarkdownPreview.vue（复用预览组件）

### Props

- `content: string` — Markdown 原文
- `showToc: boolean` — 是否显示 TOC 侧边栏（默认 true）

### 内部状态

- `tocItems: TocItem[]` — TOC 数据
- `activeTocId: string | null` — 当前高亮项
- `contentRef: HTMLElement` — 内容容器引用
- `observer: IntersectionObserver` — 滚动监听

### 生命周期

1. **onMounted**：`extractToc(content)` → 生成 TOC 列表 → 为每个 heading 元素建立 `IntersectionObserver`
2. **watch(content)**：重新提取 TOC → 重建 Observer
3. **onBeforeUnmount**：disconnect Observer

### TOC 交互

- **点击 TOC 项**：`document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })`
- **Observer 回调**：找到进入视口的最上方 heading → 设置 `activeTocId`
- **缩进**：h1 不缩进，h2 缩进 12px，h3 缩进 24px

### 布局

```
┌─────────────────────────────────────────────┐
│ ┌────────┐  ┌────────────────────────────┐  │
│ │ 目录    │  │                            │  │
│ │ • 极简  │  │  ### 极简日记             │  │
│ │   日记  │  │                            │  │
│ │ • 我的  │  │  - 今天发生了：           │  │
│ │   感受  │  │  ...                       │  │
│ │          │  │                            │  │
│ │          │  │  ### 今天收获             │  │
│ └────────┘  └────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

- TOC 栏宽度 180px，min-width 160px，`position: sticky; top: 0`
- 无 heading 内容时 TOC 栏不渲染
- 移动端（< 768px）隐藏 TOC 栏

---

## ReflectionDetailModal.vue（浏览历史弹窗）

### Props

- `reflection: Reflection` — 当前弹窗对应的反思对象

### Emits

- `close` — 关闭弹窗（不保存）
- `save(id: string, payload: { content: string })` — 保存内容

### 内部状态

- `editedContent: string` — 当前编辑中的内容（与 `reflection.content` 分离，支持取消）
- `showPreview: boolean` — 编辑/预览切换

### 布局

```
┌──────────────────────────────────────────────┐
│ 2026/05/05 今天  😊  [日记] [收获]      [×] │ ← 头部（只读）
├──────────────────────────────────────────────┤
│ [编辑] [预览]                                │ ← 切换 tab
├──────────────────────────────────────────────┤
│ ┌────────┐  ┌────────────────────────────┐  │
│ │ TOC    │  │ textarea / Markdown 预览   │  │ ← 中间内容区
│ └────────┘  └────────────────────────────┘  │
├──────────────────────────────────────────────┤
│                              [取消] [保存]    │ ← 底部操作栏
└──────────────────────────────────────────────┘
```

- 尺寸：max-width 900px，max-height 85vh，居中弹窗
- 背景：玻璃拟态 overlay
- 滚动：内容区独立 overflow-y: auto

---

## ReflectionBrowser.vue 调整

- **移除**：`expandedId` ref、卡片内展开 body、`v-show` 动画、`toggleExpand`
- **保留**：标签筛选栏、卡片列表、预览文本（2 行 clamp）、删除按钮
- **变更**：卡片点击 → `emit('openDetail', r)`（不再展开，直接弹窗）

---

## ReflectionEditor.vue 调整

- 预览区替换为 `<MarkdownPreview :content="content" show-toc />`
- 移除原有的 `v-html="renderMarkdown(content)"` 和内联预览样式

---

## ReflectionsView.vue 数据流

```
ReflectionsView.vue
├── state:
│   ├── showDetailModal: boolean
│   ├── selectedReflectionForModal: Reflection | null
│   └── （原有状态不变：mode, selectedDate, content, mood, tags...）
├── on openDetail(reflection) → selectedReflectionForModal = reflection; showDetailModal = true
├── on saveDetail(id, { content }) →
│   ├── reflectionStore.updateReflection(id, { content })
│   ├── 成功 → showDetailModal = false; showSaveMessage('保存成功')
│   └── 失败 → showSaveMessage('保存失败')
├── on closeDetail() → showDetailModal = false
└── template:
    ├── <ReflectionDetailModal
    │     v-if="showDetailModal && selectedReflectionForModal"
    │     :reflection="selectedReflectionForModal"
    │     @close="showDetailModal = false"
    │     @save="(id, payload) => saveDetail(id, payload)" />
    └── （其余不变）
```

---

## 样式原则

- TOC active 项：`var(--accent)` 颜色 + 左侧 2px 竖线指示器
- TOC 栏：border-right: 1px solid var(--glass-border)
- Modal overlay：`position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px)`
- Modal 内容：玻璃拟态背景，border-radius 16px
- 保持现有 Focus Flow Design System 变量体系

---

## 边界处理

- **无 heading 内容**：TOC 栏不渲染，Markdown 占满
- **heading id 冲突**：`extractToc` 跳过重复 id（第二个相同 text 的 heading 不加入 TOC）。`markdown-it-anchor` 会自动追加 `-1`, `-2` 等后缀，两者可能不完全一致，但 TOC 点击跳转时按 `id` 查找 DOM 元素即可
- **Modal 取消**：`editedContent` 丢弃，不写入 store
- **Modal 保存**：仅更新 `content` 字段，成功后刷新列表（预览文本会更新）
- **XSS**：`markdown-it` 配置 `html: false`，天然过滤原始 HTML 标签和事件处理器
