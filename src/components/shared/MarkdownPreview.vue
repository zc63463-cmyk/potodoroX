<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import { useMarkdown } from "@/composables/useMarkdown";

const props = defineProps<{
  content: string;
  showToc?: boolean;
}>();

const { renderMarkdown, extractToc } = useMarkdown();

const contentRef = ref<HTMLElement | null>(null);
const tocItems = computed(() => extractToc(props.content));
const activeTocId = ref<string | null>(null);
let observer: IntersectionObserver | null = null;

function buildObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (!contentRef.value) return;

  const headings = contentRef.value.querySelectorAll<HTMLElement>("h1, h2, h3");
  if (headings.length === 0) return;

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length > 0) {
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        );
        activeTocId.value = topmost.target.id;
      }
    },
    {
      root: contentRef.value,
      threshold: [0, 0.5, 1],
    }
  );

  headings.forEach((h) => observer!.observe(h));
}

function scrollToToc(id: string) {
  if (!contentRef.value) return;
  const el = contentRef.value.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
  if (!el) return;

  const containerRect = contentRef.value.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const offset = elRect.top - containerRect.top + contentRef.value.scrollTop;
  contentRef.value.scrollTo({ top: offset, behavior: "smooth" });
}

onMounted(() => {
  nextTick(buildObserver);
});

watch(
  () => props.content,
  () => {
    nextTick(buildObserver);
  }
);

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});
</script>

<template>
  <div class="markdown-preview-container">
    <!-- TOC 侧边栏 -->
    <nav v-if="showToc && tocItems.length > 0" class="toc-sidebar">
      <div class="toc-title">目录</div>
      <ul class="toc-list">
        <li
          v-for="item in tocItems"
          :key="item.id"
          class="toc-item"
          :class="{
            active: activeTocId === item.id,
            'level-1': item.level === 1,
            'level-2': item.level === 2,
            'level-3': item.level === 3,
          }"
          @click="scrollToToc(item.id)"
        >
          {{ item.text }}
        </li>
      </ul>
    </nav>

    <!-- Markdown 内容 -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div
      ref="contentRef"
      class="markdown-body"
      v-html="renderMarkdown(content)"
    />
  </div>
</template>

<style scoped>
.markdown-preview-container {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* ---- TOC 侧边栏 ---- */
.toc-sidebar {
  width: 180px;
  min-width: 160px;
  max-width: 180px;
  flex-shrink: 0;
  padding: 16px 12px;
  border-right: 1px solid var(--glass-border);
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.02);
}

.toc-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
  padding-left: 8px;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toc-item {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-left: 2px solid transparent;
}

.toc-item:hover {
  background: var(--hover-bg);
  color: var(--text);
}

.toc-item.active {
  color: var(--accent);
  background: rgba(88, 166, 255, 0.08);
  border-left-color: var(--accent);
  font-weight: 500;
}

.toc-item.level-2 {
  padding-left: 20px;
}

.toc-item.level-3 {
  padding-left: 32px;
}

/* ---- Markdown 内容区 ---- */
.markdown-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text-secondary);
}

.markdown-body :deep(h1) {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 16px 0 8px;
  color: var(--accent);
}

.markdown-body :deep(h2) {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 14px 0 6px;
  color: var(--text);
}

.markdown-body :deep(h3) {
  font-size: 1rem;
  font-weight: 600;
  margin: 12px 0 4px;
  color: var(--text);
}

.markdown-body :deep(h4) {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 10px 0 4px;
  color: var(--text);
}

.markdown-body :deep(h5) {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 8px 0 4px;
  color: var(--text-secondary);
}

.markdown-body :deep(h6) {
  font-size: 0.85rem;
  font-weight: 600;
  margin: 8px 0 4px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 8px 0;
  padding-left: 24px;
}

.markdown-body :deep(li) {
  margin: 4px 0;
  color: var(--text-secondary);
}

.markdown-body :deep(strong) {
  color: var(--text);
  font-weight: 600;
}

.markdown-body :deep(em) {
  color: var(--text-secondary);
  font-style: italic;
}

.markdown-body :deep(code) {
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--surface);
  color: var(--accent);
  font-size: 0.875rem;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace;
}

.markdown-body :deep(pre) {
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--surface);
  overflow-x: auto;
  margin: 10px 0;
}

.markdown-body :deep(pre code) {
  background: transparent;
  padding: 0;
}

.markdown-body :deep(blockquote) {
  margin: 10px 0;
  padding: 8px 16px;
  border-left: 3px solid var(--accent-dim);
  background: rgba(88, 166, 255, 0.05);
  border-radius: 0 8px 8px 0;
  color: var(--text-secondary);
}

.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--glass-border);
  margin: 16px 0;
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 0.9rem;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  padding: 8px 12px;
  border: 1px solid var(--glass-border);
  text-align: left;
}

.markdown-body :deep(th) {
  background: var(--bg-elevated);
  font-weight: 600;
  color: var(--text);
}

.markdown-body :deep(td) {
  color: var(--text-secondary);
}

.markdown-body :deep(p) {
  margin: 8px 0;
  color: var(--text-secondary);
}

/* ---- 删除线 ---- */
.markdown-body :deep(s),
.markdown-body :deep(del) {
  text-decoration: line-through;
  color: var(--text-tertiary);
  opacity: 0.75;
}

/* ---- 下划线 ---- */
.markdown-body :deep(ins) {
  text-decoration: underline;
  text-decoration-color: var(--accent);
  text-underline-offset: 3px;
}

/* ---- 高亮 ---- */
.markdown-body :deep(mark) {
  background: rgba(88, 166, 255, 0.2);
  color: var(--text);
  padding: 1px 4px;
  border-radius: 3px;
}

/* ---- 上下标 ---- */
.markdown-body :deep(sub),
.markdown-body :deep(sup) {
  font-size: 0.75em;
  color: var(--text-secondary);
}

/* ---- 链接 ---- */
.markdown-body :deep(a) {
  color: var(--accent);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.15s ease;
}

.markdown-body :deep(a:hover) {
  border-bottom-color: var(--accent);
  opacity: 0.9;
}

/* ---- 图片 ---- */
.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  display: block;
  margin: 12px 0;
}

/* ---- 任务列表 ---- */
.markdown-body :deep(.contains-task-list) {
  list-style: none;
  padding-left: 4px;
}

.markdown-body :deep(.task-list-item) {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 4px 0;
}

.markdown-body :deep(.task-list-item-checkbox) {
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  min-width: 16px;
  margin-top: 2px;
  border: 1.5px solid var(--border);
  border-radius: 3px;
  background: var(--surface);
  cursor: default;
  position: relative;
  transition: all 0.15s ease;
}

.markdown-body :deep(.task-list-item-checkbox:checked) {
  background: var(--accent);
  border-color: var(--accent);
}

.markdown-body :deep(.task-list-item-checkbox:checked::after) {
  content: "";
  position: absolute;
  left: 4px;
  top: 1px;
  width: 5px;
  height: 9px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* ---- 响应式 ---- */
@media (max-width: 768px) {
  .toc-sidebar {
    display: none;
  }
}
</style>
