<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { useMarkdown } from "@/composables/useMarkdown";

const props = defineProps<{
  visible: boolean;
  mode: "plan" | "completion";
  initialContent?: string;
}>();

const emit = defineEmits<{
  confirm: [content: string];
  skip: [];
  close: [];
}>();

const { renderMarkdown } = useMarkdown();

const content = ref("");
const showPreview = ref(false);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

// 预览 HTML 内容
const previewHtml = computed(() => {
  if (!content.value) return '<p class="sn-preview-empty">没有内容</p>';
  return renderMarkdown(content.value);
});

// ---- 模式配置 ----
const modeConfig = {
  plan: {
    title: "计时目标",
    placeholder:
      "计划在这个时段完成什么？\n支持换行和简单 Markdown：\n- 任务项 1\n- 任务项 2\n\n**重点**：...",
    confirmText: "开始计时",
  },
  completion: {
    title: "计时总结",
    placeholder:
      "实际完成了什么？遇到了什么问题？\n支持换行和简单 Markdown：\n1. 已完成项\n2. 待跟进项\n\n> 备注...",
    confirmText: "保存总结",
  },
} as const;

const cfg = computed(() => modeConfig[props.mode]);

// ---- 监听 visible 变化，自动聚焦 textarea ----
watch(
  () => props.visible,
  async (v) => {
    if (v) {
      content.value = props.initialContent || "";
      showPreview.value = false;
      await nextTick();
      textareaRef.value?.focus();
    }
  }
);

// ---- 操作 ----
function handleConfirm() {
  emit("confirm", content.value);
}

function handleSkip() {
  content.value = "";
  emit("skip");
}

function handleClose() {
  emit("close");
}

// Esc 关闭
function onOverlayKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    e.preventDefault();
    handleClose();
  }
}

// 键盘快捷键：Ctrl+Enter 确认
function onKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    handleConfirm();
  }
}

// 插入常用格式
function insertFormat(prefix: string, suffix = "") {
  const ta = textareaRef.value;
  if (!ta) return;

  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const selected = content.value.substring(start, end);
  const replacement = prefix + selected + suffix;

  content.value =
    content.value.substring(0, start) +
    replacement +
    content.value.substring(end);

  // 恢复光标位置
  nextTick(() => {
    ta.focus();
    const newPos = selected
      ? start + replacement.length
      : start + prefix.length;
    ta.setSelectionRange(newPos, newPos);
  });
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="visible"
        class="sn-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sn-modal-title"
        @click.self="handleClose"
        @keydown="onOverlayKeydown"
      >
        <div class="sn-modal glass" @click.stop>
          <!-- 头部 -->
          <div class="sn-modal-header">
            <h3 id="sn-modal-title" class="sn-modal-title">{{ cfg.title }}</h3>
            <button
              class="sn-modal-close"
              aria-label="关闭"
              title="关闭 (Esc)"
              @click="handleClose"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- 工具栏 -->
          <div class="sn-toolbar" role="toolbar" aria-label="格式工具栏">
            <button
              class="sn-toolbar-btn"
              aria-label="加粗"
              title="加粗 (Ctrl+B)"
              @click="insertFormat('**', '**')"
            >
              <strong>B</strong>
            </button>
            <button
              class="sn-toolbar-btn"
              aria-label="斜体"
              title="斜体 (Ctrl+I)"
              @click="insertFormat('*', '*')"
            >
              <em>I</em>
            </button>
            <button
              class="sn-toolbar-btn"
              aria-label="无序列表"
              title="无序列表"
              @click="insertFormat('\n- ')"
            >
              • ≡
            </button>
            <button
              class="sn-toolbar-btn"
              aria-label="有序列表"
              title="有序列表"
              @click="insertFormat('\n1. ')"
            >
              1.
            </button>
            <button
              class="sn-toolbar-btn"
              aria-label="引用"
              title="引用"
              @click="insertFormat('\n> ')"
            >
              "
            </button>
            <span class="sn-toolbar-spacer" />
            <button
              class="sn-toolbar-btn"
              :class="{ active: showPreview }"
              aria-label="切换预览"
              title="预览"
              @click="showPreview = !showPreview"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>

          <!-- 内容区 -->
          <div class="sn-modal-body">
            <!-- 编辑模式 -->
            <textarea
              v-show="!showPreview"
              ref="textareaRef"
              v-model="content"
              class="sn-textarea"
              :placeholder="cfg.placeholder"
              :aria-label="cfg.title"
              rows="8"
              @keydown="onKeydown"
            />

            <!-- 预览模式 -->
            <div
              v-show="showPreview"
              class="sn-preview markdown-body"
              v-html="previewHtml"
            />
          </div>

          <!-- 底部操作栏 -->
          <div class="sn-modal-footer">
            <span class="sn-hint">Ctrl + Enter 确认</span>
            <div class="sn-actions">
              <button class="btn btn-secondary btn-sm" @click="handleSkip">
                跳过
              </button>
              <button class="btn btn-primary btn-sm" @click="handleConfirm">
                {{ cfg.confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ---- 遮罩 ---- */
.sn-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  padding: 16px;
}

/* ---- Modal 卡片 ---- */
.sn-modal {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

/* ---- 头部 ---- */
.sn-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 0;
  flex-shrink: 0;
}

.sn-modal-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.sn-modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.sn-modal-close:hover {
  background: var(--hover-bg);
  color: var(--text);
}

/* ---- 工具栏 ---- */
.sn-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 20px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--glass-border);
}

.sn-toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.sn-toolbar-btn:hover {
  background: var(--hover-bg);
  color: var(--text);
}

.sn-toolbar-btn.active {
  background: var(--accent-dim);
  color: var(--accent);
}

.sn-toolbar-spacer {
  flex: 1;
}

/* ---- 正文区 ---- */
.sn-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  min-height: 180px;
}

.sn-textarea {
  width: 100%;
  min-height: 180px;
  padding: 12px;
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  background: var(--bg-elevated);
  color: var(--text);
  font-size: 0.93rem;
  line-height: 1.6;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s;
}

.sn-textarea:focus {
  border-color: var(--accent);
}

.sn-textarea::placeholder {
  color: var(--text-tertiary);
  line-height: 1.6;
}

/* 预览区 */
.sn-preview {
  min-height: 180px;
  padding: 12px;
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  background: var(--bg-elevated);
}

.sn-preview-empty {
  color: var(--text-tertiary);
  font-style: italic;
}

/* ---- 底部 ---- */
.sn-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px 16px;
  flex-shrink: 0;
}

.sn-hint {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.sn-actions {
  display: flex;
  gap: 8px;
}

/* ---- 动画 ---- */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-active .sn-modal,
.modal-fade-leave-active .sn-modal {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .sn-modal {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}

.modal-fade-leave-to .sn-modal {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}

/* ---- 响应式 ---- */
@media (max-width: 480px) {
  .sn-modal {
    max-width: 100%;
    border-radius: 12px;
  }

  .sn-toolbar {
    padding: 8px 14px;
    gap: 2px;
  }

  .sn-modal-body {
    padding: 12px 14px;
  }

  .sn-modal-header,
  .sn-modal-footer {
    padding-left: 14px;
    padding-right: 14px;
  }
}
</style>
