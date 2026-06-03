<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import MarkdownPreview from "@/components/shared/MarkdownPreview.vue";
import type { Mood, Task } from "@/types";
import { MOODS } from "@/utils/constants";
import { formatFriendlyDate, getWeekdayName } from "@/utils/format";

// ---- Props ----
const props = defineProps<{
  date: string;
  content: string;
  mood: Mood;
  tags: string[];
  reflectionId: string | null;
  todayTasks: Task[];
}>();

const emit = defineEmits<{
  (e: "update:content", value: string): void;
  (e: "update:mood", value: Mood): void;
  (e: "update:tags", value: string[]): void;
  (e: "changeDate", offset: number): void;
  (e: "goToToday"): void;
  (e: "save"): void;
  (e: "triggerAutoSave"): void;
  (e: "openBatchExport"): void;
}>();

// ---- 本地状态 ----
const showPreview = ref(false);
const showMetaPanel = ref(false);
const tagInput = ref("");

// 当前心情的显示文本
const currentMoodInfo = computed(() => getMoodInfo(props.mood));

// ---- 心情配置 ----
const moodConfig: Record<
  Mood,
  { emoji: string; label: string; color: string; bgColor: string }
> = {
  great: {
    emoji: "\u{1F604}",
    label: "很棒",
    color: "#3FB950",
    bgColor: "rgba(63, 185, 80, 0.15)",
  },
  good: {
    emoji: "\u{1F642}",
    label: "不错",
    color: "#58A6FF",
    bgColor: "rgba(88, 166, 255, 0.15)",
  },
  normal: {
    emoji: "\u{1F610}",
    label: "一般",
    color: "#D29922",
    bgColor: "rgba(210, 153, 34, 0.15)",
  },
  bad: {
    emoji: "\u{1F61F}",
    label: "不好",
    color: "#F0883E",
    bgColor: "rgba(240, 136, 62, 0.15)",
  },
  terrible: {
    emoji: "\u{1F61E}",
    label: "很差",
    color: "#F85149",
    bgColor: "rgba(248, 81, 73, 0.15)",
  },
};

// ---- 模板 ----
const templates = [
  {
    label: "极简日记",
    text: "### 极简日记\n\n- 今天发生了：\n- 我的感受是：\n- 今天最重要的一件事：\n- 明天想继续：\n",
  },
  {
    label: "情绪复盘",
    text: "### 情绪复盘\n\n- 今天的主要情绪：\n- 触发这个情绪的事件：\n- 我当时的想法：\n- 这个想法是否完全准确：\n- 我可以如何照顾自己：\n",
  },
  {
    label: "今日收获",
    text: "### 今日收获\n\n- 今天完成了：\n- 今天学到了：\n- 今天让我开心的是：\n- 今天值得保留的一个瞬间：\n- 给今天的自己一句话：\n",
  },
  {
    label: "困难与解决",
    text: "### 困难与解决\n\n- 今天遇到的困难：\n- 当时我的感受：\n- 我尝试过的方法：\n- 有效的做法：\n- 下次可以怎么改进：\n",
  },
  {
    label: "明日计划",
    text: "### 明日计划\n\n- 明天最重要的一件事：\n- 需要完成的 2–3 个小任务：\n  - \n  - \n  - \n- 可能遇到的阻碍：\n- 我准备如何应对：\n- 明天从哪一步开始：\n",
  },
];

// ---- 计算属性 ----
const dateDisplayText = computed(() => {
  const friendly = formatFriendlyDate(props.date);
  const weekday = getWeekdayName(props.date);
  return `${friendly} ${weekday}`;
});

// ---- 方法 ----
function selectMood(mood: Mood) {
  emit("update:mood", mood);
  emit("triggerAutoSave");
}

function insertTemplate(template: (typeof templates)[0]) {
  emit("update:content", template.text + props.content);
  emit("triggerAutoSave");
  nextTick(() => {
    const textarea = document.querySelector(
      ".reflection-textarea"
    ) as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(0, 0);
    }
  });
}

function handleTagInputKey(e: KeyboardEvent) {
  if (e.key === "Enter" || e.key === "," || e.key === " ") {
    e.preventDefault();
    addTag();
  } else if (e.key === "Backspace" && tagInput.value === "") {
    removeLastTag();
  }
}

function addTag() {
  const raw = tagInput.value.trim().toLowerCase().replace(/,/g, "");
  if (!raw) return;
  if (raw.length > 20) return;
  if (props.tags.includes(raw)) {
    tagInput.value = "";
    return;
  }
  if (props.tags.length >= 8) return;
  emit("update:tags", [...props.tags, raw]);
  tagInput.value = "";
  emit("triggerAutoSave");
}

function removeTag(index: number) {
  const next = [...props.tags];
  next.splice(index, 1);
  emit("update:tags", next);
  emit("triggerAutoSave");
}

function removeLastTag() {
  if (props.tags.length === 0) return;
  const next = [...props.tags];
  next.pop();
  emit("update:tags", next);
  emit("triggerAutoSave");
}

function onBlurTagInput() {
  addTag();
}

function getMoodInfo(mood: Mood) {
  return moodConfig[mood] || moodConfig.normal;
}
</script>

<template>
  <div class="editor-panel">
    <!-- 日期标题 -->
    <div class="editor-date-header">
      <h2 class="date-title">{{ dateDisplayText }}</h2>
      <div class="header-actions">
        <button class="btn-export" @click="emit('openBatchExport')">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          批量导出
        </button>
        <button class="btn-today" @click="emit('goToToday')">回到今天</button>
      </div>
    </div>

    <!-- 可折叠元信息面板 -->
    <div class="meta-panel" :class="{ expanded: showMetaPanel }">
      <!-- 折叠状态：一行摘要 -->
      <div class="meta-summary" @click="showMetaPanel = !showMetaPanel">
        <span class="meta-summary-item">
          <span class="meta-summary-emoji">{{ currentMoodInfo.emoji }}</span>
          {{ currentMoodInfo.label }}
        </span>
        <span class="meta-summary-divider">·</span>
        <span class="meta-summary-item">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
          {{ tags.length ? tags.length + " 个标签" : "无标签" }}
        </span>
        <svg
          class="meta-chevron"
          :class="{ rotated: showMetaPanel }"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      <!-- 展开时显示完整选择器 -->
      <div v-if="showMetaPanel" class="meta-body">
        <!-- 心情选择 -->
        <div class="meta-section">
          <span class="meta-section-label">心情</span>
          <div class="mood-options">
            <button
              v-for="m in MOODS"
              :key="m.value"
              class="mood-card"
              :class="{ active: mood === m.value }"
              :style="{
                '--mood-color': getMoodInfo(m.value).color,
                '--mood-bg': getMoodInfo(m.value).bgColor,
              }"
              @click="selectMood(m.value)"
            >
              <span class="mood-emoji">{{ getMoodInfo(m.value).emoji }}</span>
              <span class="mood-text">{{ getMoodInfo(m.value).label }}</span>
            </button>
          </div>
        </div>

        <!-- 快速模板 -->
        <div class="meta-section">
          <span class="meta-section-label">模板</span>
          <div class="template-options">
            <button
              v-for="tpl in templates"
              :key="tpl.label"
              class="template-btn"
              @click="insertTemplate(tpl)"
            >
              {{ tpl.label }}
            </button>
          </div>
        </div>

        <!-- 标签输入 -->
        <div class="meta-section">
          <span class="meta-section-label">标签</span>
          <div class="tag-input-wrap">
            <span v-for="(tag, i) in tags" :key="tag" class="tag-chip">
              {{ tag }}
              <button class="tag-remove" @click="removeTag(i)">×</button>
            </span>
            <input
              v-model="tagInput"
              class="tag-input"
              placeholder="输入标签，回车确认"
              @keydown="handleTagInputKey"
              @blur="onBlurTagInput"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑/预览区（占据剩余空间） -->
    <div class="editor-main">
      <div class="editor-toolbar">
        <button
          class="toolbar-btn"
          :class="{ active: !showPreview }"
          @click="showPreview = false"
        >
          编辑
        </button>
        <button
          class="toolbar-btn"
          :class="{ active: showPreview }"
          @click="showPreview = true"
        >
          预览
        </button>
      </div>
      <textarea
        v-if="!showPreview"
        :value="content"
        class="reflection-textarea"
        placeholder="写下今天的反思..."
        @input="
          emit('update:content', ($event.target as HTMLTextAreaElement).value);
          emit('triggerAutoSave');
        "
      />
      <MarkdownPreview v-else :content="content" show-toc />
    </div>
  </div>
</template>

<style scoped>
/* ---- 编辑器面板 (Glass) ---- */
.editor-panel {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--glass-shadow);
}

.editor-date-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.date-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-export:hover {
  background: var(--hover-bg);
  color: var(--accent);
  border-color: var(--accent-dim);
}

.btn-today {
  padding: 4px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-today:hover {
  background: var(--hover-bg);
  color: var(--accent);
  border-color: var(--accent-dim);
}

/* ---- 可折叠元信息面板 ---- */
.meta-panel {
  flex-shrink: 0;
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.meta-panel.expanded {
  border-color: var(--accent-dim);
}

.meta-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s ease;
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.meta-summary:hover {
  background: var(--hover-bg);
}

.meta-summary-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.meta-summary-emoji {
  font-size: 1rem;
}

.meta-summary-divider {
  color: var(--text-muted);
}

.meta-chevron {
  margin-left: auto;
  color: var(--text-muted);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.meta-chevron.rotated {
  transform: rotate(180deg);
}

.meta-body {
  padding: 10px 14px 12px;
  border-top: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-section-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ---- 心情选择 ---- */
.mood-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.mood-card {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 10px;
  border: 1.5px solid transparent;
  background: linear-gradient(
    135deg,
    var(--surface) 0%,
    var(--bg-elevated) 100%
  );
  cursor: pointer;
  transition: all 0.25s ease;
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.mood-card:hover {
  border-color: var(--mood-color, var(--border));
  transform: translateY(-1px);
}

.mood-card.active {
  border-color: var(--mood-color, var(--accent));
  background: linear-gradient(135deg, var(--mood-bg) 0%, var(--surface) 100%);
  color: var(--mood-color, var(--accent));
  box-shadow: 0 0 16px var(--mood-bg);
}

.mood-emoji {
  font-size: 1.1rem;
  line-height: 1;
}

/* ---- 模板选项 ---- */
.template-options {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.template-btn {
  padding: 5px 12px;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--hover-bg);
}

/* ---- 标签输入 ---- */
.tag-input-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  transition: border-color 0.2s ease;
}

.tag-input-wrap:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-glow);
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 9px;
  border-radius: 999px;
  border: 1px solid var(--accent-dim);
  background: rgba(88, 166, 255, 0.08);
  color: var(--accent);
  font-size: 0.73rem;
  font-weight: 500;
}

.tag-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  font-size: 0.7rem;
  line-height: 1;
  transition: background 0.2s;
}

.tag-remove:hover {
  background: rgba(248, 81, 73, 0.15);
  color: var(--danger);
}

.tag-input {
  flex: 1;
  min-width: 100px;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 0.82rem;
  outline: none;
  padding: 3px 0;
}

.tag-input::placeholder {
  color: var(--text-muted);
}

/* ---- 编辑/预览主区域（占据剩余空间） ---- */
.editor-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--glass-border);
  flex-shrink: 0;
  background: var(--bg-elevated);
}

.toolbar-btn {
  flex: 1;
  padding: 9px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.toolbar-btn:hover {
  color: var(--text);
  background: var(--hover-bg);
}

.toolbar-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  background: var(--active-bg);
}

.reflection-textarea {
  flex: 1;
  width: 100%;
  padding: 18px 20px;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 0.95rem;
  line-height: 1.75;
  resize: none;
  outline: none;
  font-family: inherit;
  transition: background 0.15s;
}

.reflection-textarea::placeholder {
  color: var(--text-muted);
}

.reflection-textarea:focus {
  background: rgba(88, 166, 255, 0.02);
}

/* ---- 响应式 ---- */
@media (max-width: 600px) {
  .editor-panel {
    padding: 12px 14px;
    gap: 8px;
  }

  .mood-options {
    gap: 4px;
  }

  .mood-card {
    padding: 6px 10px;
  }

  .mood-text {
    display: none;
  }

  .meta-summary {
    font-size: 0.78rem;
  }
}
</style>
