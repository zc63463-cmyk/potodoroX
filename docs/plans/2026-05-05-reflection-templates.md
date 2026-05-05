# 反思模块模板与 Markdown 浏览功能实施计划

**Goal:** 为反思模块增加 5 个结构化模板、Markdown 渲染支持、标签输入与筛选、以及历史反思浏览视图。

**Architecture:** 将 `ReflectionsView.vue` 拆分为外壳 + `ReflectionEditor` + `ReflectionBrowser`，引入 `marked` 库处理 Markdown，标签系统复用 store 已有机制。

**Tech Stack:** Vue 3 + Pinia + `marked`

---

## File Structure

| File | Responsibility | Action |
|------|---------------|--------|
| `src/composables/useMarkdown.ts` | Markdown rendering + XSS sanitize | Create |
| `src/components/ReflectionEditor.vue` | 编辑模式：日期、心情、标签、模板、编辑/预览 | Create |
| `src/components/ReflectionBrowser.vue` | 浏览模式：标签筛选、反思卡片、Markdown 预览 | Create |
| `src/views/ReflectionsView.vue` | 外壳：模式切换、布局、侧边栏、删除确认 | Modify |
| `package.json` / `pnpm-lock.yaml` | 新增 `marked` 依赖 | Modify |

---

## Task 1: Install `marked`

**Files:** `package.json`

- Add `"marked": "^15.0.0"` to `dependencies`.
- Run `pnpm install`.
- Verify: `pnpm list marked` shows version.

---

## Task 2: Create `useMarkdown.ts`

**Files:** `src/composables/useMarkdown.ts`

Create composable wrapping `marked.parse()` with GFM + soft breaks enabled. Add lightweight DOM-based XSS sanitizer removing `<script>` and event handlers. Fallback to plain text on parse error. Export `renderMarkdown(text: string): string`.

---

## Task 3: Create `ReflectionEditor.vue` — Script

**Files:** `src/components/ReflectionEditor.vue`

Props: `date`, `content`, `mood`, `tags`, `reflectionId`, `todayTasks`.
Emits: `update:content`, `update:mood`, `update:tags`, `changeDate`, `goToToday`, `save`, `triggerAutoSave`.

Include: mood config map, 5 templates (极简日记/情绪复盘/今日收获/困难与解决/明日计划), `insertTemplate`, tag input handling (Enter/Comma/Space to add, Backspace to remove last, max 8, max length 20, dedupe, lowercase), `renderMarkdown` via composable, `showPreview` toggle.

---

## Task 4: Create `ReflectionEditor.vue` — Template & Styles

**Files:** `src/components/ReflectionEditor.vue`

Template: date header → mood selector → template bar → tag input bar (chips + input) → edit/preview toggle → textarea / `v-html` markdown preview.

Styles: copy existing `.editor-panel`, `.mood-*`, `.template-*`, `.editor-toolbar`, `.reflection-textarea`, `.reflection-preview` from `ReflectionsView.vue`. Add `.tag-bar`, `.tag-chip`, `.tag-input`, `.tag-input-wrap` styles. Add `.markdown-body :deep()` styles for h1-h3, ul/ol, code, pre, blockquote, table, hr.

---

## Task 5: Create `ReflectionBrowser.vue` — Script

**Files:** `src/components/ReflectionBrowser.vue`

Props: `reflections`, `allTags`, `activeTag`. Emits: `filterByTag`, `selectReflection`, `deleteReflection`.

Include: `expandedId` ref, `toggleExpand`, `getContentPreview` (150 chars), `getMoodInfo` emoji/color map, `filteredReflections` computed filtering by `activeTag`. Use `renderMarkdown` composable.

---

## Task 6: Create `ReflectionBrowser.vue` — Template & Styles

**Files:** `src/components/ReflectionBrowser.vue`

Template: tag filter pills (全部 + allTags) → empty state or card list. Each card: date, mood emoji, tag chips, preview text. Expanded: full `marked` preview + "编辑此条" button + delete icon.

Styles: `.browser-panel` (glass), `.tag-filter-pill` (active = filled accent), `.reflection-card` (hover lift + shadow), `.reflection-card-header`, `.reflection-card-preview` (2-line clamp), `.reflection-card-body` (fade-in animation), `.card-action-btn`, delete button (opacity 0 → 1 on hover). Add `.markdown-body :deep()` styles matching `ReflectionEditor` theme.

---

## Task 7: Refactor `ReflectionsView.vue` — Script

**Files:** `src/views/ReflectionsView.vue`

Replace entire `<script setup>` with shell logic:
- State: `mode: 'edit' | 'browse'`, `selectedDate`, `content`, `currentMood`, `currentTags`, `browseActiveTag`, `isSaving`, `saveMessage`, `showDeleteConfirm`, `deleteTargetId`, `autoSaveTimer`.
- Computed: `currentReflection`, `currentReflectionId`, `hasUnsavedChanges`, `todayTasks`, `recentReflections`.
- Methods: `loadReflectionForDate`, `saveReflection`, `triggerAutoSave`, `changeDate`, `goToToday`, `editReflection`, `requestDelete`, `confirmDelete`, `cancelDelete`, `handleBrowserFilter`.
- Watch `selectedDate` → `loadReflectionForDate`.
- `onMounted` → load store data.
- `onUnmounted` → clear timer.

Import `ReflectionEditor` and `ReflectionBrowser`.

---

## Task 8: Refactor `ReflectionsView.vue` — Template & Styles

**Files:** `src/views/ReflectionsView.vue`

Template: bg orbs → header with mode-switch buttons (写反思 / 浏览历史) + date nav (only in edit mode) + save button → body with `<ReflectionEditor v-if="mode === 'edit'" />` / `<ReflectionBrowser v-else />` + sidebar (today tasks + recent reflections). Keep Teleport delete modal.

Styles: keep orbs, `.reflections-view`, `.reflections-header`, `.mode-switch`, `.mode-btn`, date nav, save button, `.reflections-body`, `.sidebar-panel`, sidebar sections, task list, reflection list, modal overlay, fade transition, responsive breakpoints. Remove all editor-specific styles (moved to `ReflectionEditor`).

---

## Task 9: Verification

- Run `pnpm run typecheck` → expect no errors.
- Run `pnpm run build:web` → expect build succeeds.
- Manual test: open Reflections view, check templates insert, tags add/remove, preview renders Markdown, browse mode filters by tag, edit from browse works.
