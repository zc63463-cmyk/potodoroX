# 浏览历史 Modal + Markdown TOC 实施计划

**Goal:** 将浏览历史卡片展开改为 Modal 弹窗（支持编辑正文），Markdown 预览区增加侧边栏目录（TOC）+ 滚动联动高亮。

**Tech Stack:** Vue 3 + Pinia + markdown-it + markdown-it-anchor

---

## Task 1: 依赖替换

**Files:** `package.json`

- 移除 `"marked": "^15.0.0"`
- 新增 `"markdown-it": "^14.0.0"`, `"markdown-it-anchor": "^9.0.0"`
- 运行 `pnpm install`
- Verify: `pnpm list markdown-it markdown-it-anchor --depth=0` shows versions

---

## Task 2: 重写 `useMarkdown.ts`

**Files:** `src/composables/useMarkdown.ts`

- 移除 `marked` 导入
- 导入 `MarkdownIt` 和 `markdown-it-anchor`
- 配置 `html: false, breaks: true, linkify: true`
- 配置 `markdown-it-anchor` with slugify（小写，非字母数字中文替换为 `-`，去首尾 `-`）
- `renderMarkdown(text): string` — `md.render(text)`
- `extractToc(text): TocItem[]` — 用 `md.parse(text, {})` 遍历 tokens，提取 `heading_open` h1-h3，生成 `{ level, text, id }` 数组，跳过重复 id
- Export `TocItem` interface

---

## Task 3: 新建 `MarkdownPreview.vue`

**Files:** `src/components/MarkdownPreview.vue`

**Script:**
- Props: `content: string`, `showToc: boolean` (default true)
- Setup `useMarkdown()` composable
- `tocItems` computed: `extractToc(content)`
- `activeTocId` ref
- `contentRef` ref for content container
- `IntersectionObserver` on mounted:
  - Query `.markdown-body h1, h2, h3` within contentRef
  - `root: contentRef`, `threshold: [0, 0.5, 1]`
  - Callback: find topmost visible heading → set activeTocId
- Watch `content` → rebuild observer
- `onBeforeUnmount` → disconnect observer
- `scrollToToc(id)` method: `document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })`

**Template:**
- Root: flex container
- Left (v-if showToc && tocItems.length): sticky TOC sidebar
  - TOC items list, each clickable, indent by level, active styling
- Right: `.markdown-body` div with `v-html="renderMarkdown(content)"`

**Style:**
- TOC sidebar: width 180px, border-right, sticky top 0
- TOC item: h1 no indent, h2 padding-left 12px, h3 padding-left 24px
- Active: accent color + 2px left border
- Mobile (< 768px): hide TOC sidebar
- Markdown body styles: same as existing ReflectionEditor.vue preview styles

---

## Task 4: 新建 `ReflectionDetailModal.vue`

**Files:** `src/components/ReflectionDetailModal.vue`

**Script:**
- Props: `reflection: Reflection`
- Emits: `close`, `save(id, { content })`
- Local state: `editedContent = ref(reflection.content)`, `showPreview = ref(false)`
- Methods: `onSave` → emit save with editedContent; `onCancel` → emit close
- Mood/tag/date display helpers (read-only)

**Template (Teleport to body):**
- Modal overlay (fixed, inset 0, bg rgba(0,0,0,0.5), backdrop-filter blur)
- Modal container (max-width 900px, max-height 85vh, glass bg, rounded 16px, flex column)
- Header: date + weekday + mood emoji + tag chips + close button
- Toolbar: 编辑 / 预览 toggle buttons
- Body (flex-1, overflow-hidden, flex row):
  - Edit mode: textarea (flex-1)
  - Preview mode: `<MarkdownPreview :content="editedContent" show-toc />`
- Footer: 取消 + 保存 buttons

**Style:**
- Glassmorphism overlay and container
- Header compact layout
- Textarea same style as ReflectionEditor.vue
- Footer button styling consistent with project

---

## Task 5: 修改 `ReflectionBrowser.vue`

**Files:** `src/components/ReflectionBrowser.vue`

- Remove `expandedId` ref and `toggleExpand`
- Remove `renderMarkdown` import and use (no longer needed in browser)
- Remove card body expansion (`v-show`, `reflection-card-body`, `reflection-card-actions`)
- Change click handler: `emit('openDetail', r)` instead of toggleExpand
- Add emit: `(e: 'openDetail', reflection: Reflection): void`
- Keep card preview text (2-line clamp), tags, mood, date, delete button
- Remove markdown-body styles (moved to MarkdownPreview.vue)

---

## Task 6: 修改 `ReflectionEditor.vue`

**Files:** `src/components/ReflectionEditor.vue`

- Import `MarkdownPreview`
- Replace preview div:
  ```vue
  <!-- 旧 -->
  <div v-else class="reflection-preview markdown-body" v-html="renderMarkdown(content)" />
  <!-- 新 -->
  <MarkdownPreview v-else :content="content" show-toc />
  ```
- Remove `renderMarkdown` import from `useMarkdown` (still needed for editor? No, MarkdownPreview handles it)
- Remove `useMarkdown` composable usage (no longer needed in editor script)
- Remove `.reflection-preview` styles and `.markdown-body :deep()` styles (moved to MarkdownPreview.vue)
- Keep all other editor logic (mood, templates, tags, textarea, toolbar)

---

## Task 7: 修改 `ReflectionsView.vue`

**Files:** `src/views/ReflectionsView.vue`

- Import `ReflectionDetailModal`
- Add state: `showDetailModal`, `selectedReflectionForModal`
- Add handler `openDetailModal(reflection)`
- Add handler `saveDetail(id, { content })`:
  - Call `reflectionStore.updateReflection(id, { content })`
  - Success: close modal, show save message
- Add handler `closeDetailModal()`
- In template:
  - Add `<ReflectionDetailModal v-if="..." :reflection="..." @close="..." @save="..." />`
- Update `<ReflectionBrowser>` binding: remove `@delete-reflection` duplication if any, add `@open-detail="openDetailModal"`

---

## Task 8: 验证

- `pnpm run typecheck` — expect no errors
- `pnpm run build:web` — expect build succeeds
