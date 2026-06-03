<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import MarkdownPreview from "@/components/shared/MarkdownPreview.vue";
import { useReflectionStore } from "@/stores/reflection";
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
const showMoodPicker = ref(false);
const showTemplatePicker = ref(false);
const showMdCheatsheet = ref(false);
const tagInput = ref("");
const showTagSuggestions = ref(false);

// Store
const reflectionStore = useReflectionStore();

// 历史标签（去重排序，排除已选中的）
const historyTags = computed(() =>
  reflectionStore.allTags.filter((t) => !props.tags.includes(t))
);

// 根据输入过滤的标签建议
const tagSuggestions = computed(() => {
  const query = tagInput.value.trim().toLowerCase();
  if (!query) return historyTags.value.slice(0, 8);
  return historyTags.value
    .filter((t) => t.toLowerCase().includes(query))
    .slice(0, 5);
});

// ---- 心情配置 ----
const moodConfig: Record<
  Mood,
  { emoji: string; label: string; color: string; bgColor: string }
> = {
  great: {
    emoji: "😄",
    label: "很棒",
    color: "#3FB950",
    bgColor: "rgba(63, 185, 80, 0.15)",
  },
  good: {
    emoji: "🙂",
    label: "不错",
    color: "#58A6FF",
    bgColor: "rgba(88, 166, 255, 0.15)",
  },
  normal: {
    emoji: "😐",
    label: "一般",
    color: "#D29922",
    bgColor: "rgba(210, 153, 34, 0.15)",
  },
  bad: {
    emoji: "😟",
    label: "不好",
    color: "#F0883E",
    bgColor: "rgba(240, 136, 62, 0.15)",
  },
  terrible: {
    emoji: "😞",
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

const currentMoodInfo = computed(() => getMoodInfo(props.mood));

// ---- 点击外部关闭下拉 ----
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest(".meta-mood") && showMoodPicker.value) {
    showMoodPicker.value = false;
  }
  if (!target.closest(".meta-template") && showTemplatePicker.value) {
    showTemplatePicker.value = false;
  }
  if (!target.closest(".meta-cheatsheet") && showMdCheatsheet.value) {
    showMdCheatsheet.value = false;
  }
}

onMounted(() => document.addEventListener("click", handleClickOutside));
onUnmounted(() => document.removeEventListener("click", handleClickOutside));

// ---- 方法 ----
function selectMood(mood: Mood) {
  emit("update:mood", mood);
  emit("triggerAutoSave");
  showMoodPicker.value = false;
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
  showTagSuggestions.value = false;
}

/** 从历史标签中选择 */
function selectHistoryTag(tag: string) {
  if (props.tags.includes(tag)) return;
  if (props.tags.length >= 8) return;
  emit("update:tags", [...props.tags, tag]);
  tagInput.value = "";
  emit("triggerAutoSave");
  showTagSuggestions.value = false;
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

    <!-- 元信息面板：心情 | 模板 | 标签 三个并排 -->
    <div class="meta-panel">
      <!-- 心情下拉 -->
      <div class="meta-field meta-mood">
        <button
          class="meta-trigger"
          @click.stop="showMoodPicker = !showMoodPicker"
        >
          <span class="meta-trigger-emoji">{{ currentMoodInfo.emoji }}</span>
          <span class="meta-trigger-text">{{ currentMoodInfo.label }}</span>
          <svg
            class="meta-trigger-chevron"
            :class="{ rotated: showMoodPicker }"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <Transition name="dropdown">
          <div v-if="showMoodPicker" class="meta-dropdown">
            <button
              v-for="m in MOODS"
              :key="m.value"
              class="mood-option"
              :class="{ active: mood === m.value }"
              :style="{
                '--mood-c': getMoodInfo(m.value).color,
                '--mood-bg': getMoodInfo(m.value).bgColor,
              }"
              @click="selectMood(m.value)"
            >
              <span class="mood-option-emoji">{{
                getMoodInfo(m.value).emoji
              }}</span>
              {{ getMoodInfo(m.value).label }}
            </button>
          </div>
        </Transition>
      </div>

      <div class="meta-divider" />

      <!-- 模板下拉 -->
      <div class="meta-field meta-template">
        <button
          class="meta-trigger"
          @click.stop="showTemplatePicker = !showTemplatePicker"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
          <span class="meta-trigger-text">模板</span>
          <svg
            class="meta-trigger-chevron"
            :class="{ rotated: showTemplatePicker }"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <Transition name="dropdown">
          <div v-if="showTemplatePicker" class="meta-dropdown">
            <button
              v-for="tpl in templates"
              :key="tpl.label"
              class="template-option"
              @click="
                insertTemplate(tpl);
                showTemplatePicker = false;
              "
            >
              {{ tpl.label }}
            </button>
          </div>
        </Transition>
      </div>

      <!-- MD语法速查 -->
      <div class="meta-field meta-cheatsheet">
        <button
          class="meta-trigger meta-trigger-hint"
          @click.stop="showMdCheatsheet = !showMdCheatsheet"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span class="meta-trigger-text">MD语法</span>
        </button>
        <Transition name="dropdown">
          <div
            v-if="showMdCheatsheet"
            class="meta-dropdown md-cheatsheet-dropdown"
          >
            <table class="cheatsheet-table">
              <tr>
                <td><code>**粗体**</code></td>
                <td><strong>粗体</strong></td>
              </tr>
              <tr>
                <td><code>*斜体*</code></td>
                <td><em>斜体</em></td>
              </tr>
              <tr>
                <td><code>~~删除~~</code></td>
                <td><s>删除线</s></td>
              </tr>
              <tr>
                <td><code>++下划线++</code></td>
                <td><ins>下划线</ins></td>
              </tr>
              <tr>
                <td><code>==高亮==</code></td>
                <td><mark>高亮</mark></td>
              </tr>
              <tr>
                <td><code># 标题</code></td>
                <td>一级标题</td>
              </tr>
              <tr>
                <td><code>- 列表</code></td>
                <td>无序列表</td>
              </tr>
              <tr>
                <td><code>1. 有序</code></td>
                <td>有序列表</td>
              </tr>
              <tr>
                <td><code>- [x] 任务</code></td>
                <td>☑ 任务勾选</td>
              </tr>
              <tr>
                <td><code>&gt; 引用</code></td>
                <td>块引用</td>
              </tr>
              <tr>
                <td><code>| 表格 |</code></td>
                <td>表格</td>
              </tr>
              <tr>
                <td><code>\`代码\`</code></td>
                <td>行内代码</td>
              </tr>
              <tr>
                <td><code>\`\`\`代码块</code></td>
                <td>代码块</td>
              </tr>
              <tr>
                <td><code>[链接](url)</code></td>
                <td>链接</td>
              </tr>
            </table>
          </div>
        </Transition>
      </div>

      <div class="meta-divider" />

      <!-- 标签输入 -->
      <div class="meta-field meta-tags">
        <div class="meta-trigger-static">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
            />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          <span class="meta-trigger-text">标签</span>
        </div>
        <div class="tag-input-wrap" :class="{ focused: showTagSuggestions }">
          <span v-for="(tag, i) in tags" :key="tag" class="tag-chip">
            {{ tag }}
            <button class="tag-remove" @click="removeTag(i)">×</button>
          </span>
          <input
            v-model="tagInput"
            class="tag-input"
            placeholder="输入标签…"
            @focus="showTagSuggestions = true"
            @keydown="handleTagInputKey"
            @blur="onBlurTagInput"
          />
        </div>
        <!-- 历史标签建议 -->
        <Transition name="dropdown">
          <div
            v-if="showTagSuggestions && tagSuggestions.length > 0"
            class="tag-suggestions"
          >
            <button
              v-for="tag in tagSuggestions"
              :key="tag"
              class="tag-suggestion-item"
              @click="selectHistoryTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- 编辑/预览区 -->
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
        placeholder="写下今天的反思…"
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
  gap: 10px;
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
  font-size: 1.15rem;
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
  font-size: 0.78rem;
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
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-today:hover {
  background: var(--hover-bg);
  color: var(--accent);
  border-color: var(--accent-dim);
}

/* ---- 元信息面板 ---- */
.meta-panel {
  flex-shrink: 0;
  display: flex;
  align-items: stretch;
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  background: var(--surface);
  overflow: visible;
}

.meta-field {
  position: relative;
  display: flex;
  align-items: center;
}

.meta-mood {
  flex: 0 0 auto;
}

.meta-template {
  flex: 0 0 auto;
}

.meta-tags {
  flex: 1;
  min-width: 0;
  padding: 4px 8px;
  position: relative;
}

/* 触发按钮 */
.meta-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.meta-trigger:hover {
  background: var(--hover-bg);
  color: var(--text);
}

.meta-trigger-static {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-tertiary);
  font-size: 0.82rem;
  flex-shrink: 0;
  margin-right: 6px;
}

.meta-trigger-emoji {
  font-size: 1rem;
  line-height: 1;
}

.meta-trigger-text {
  font-weight: 500;
}

.meta-trigger-chevron {
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.meta-trigger-chevron.rotated {
  transform: rotate(180deg);
}

/* 分隔线 */
.meta-divider {
  width: 1px;
  background: var(--glass-border);
  margin: 6px 0;
  flex-shrink: 0;
}

/* 下拉菜单 */
.meta-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 50;
  min-width: 150px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-solid);
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.meta-template .meta-dropdown {
  min-width: 120px;
}

/* 心情选项 */
.mood-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mood-option:hover {
  background: var(--hover-bg);
  color: var(--text);
}

.mood-option.active {
  background: var(--mood-bg);
  color: var(--mood-c);
}

.mood-option-emoji {
  font-size: 1rem;
}

/* 模板选项 */
.template-option {
  padding: 7px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.template-option:hover {
  background: var(--hover-bg);
  color: var(--text);
}

/* 标签输入 */
.tag-input-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
  padding: 3px 6px;
  border: 1px solid transparent;
  border-radius: 6px;
  transition: border-color 0.15s;
}

.tag-input-wrap.focused {
  border-color: var(--accent-dim);
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--accent-dim);
  background: rgba(88, 166, 255, 0.08);
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 500;
  white-space: nowrap;
}

.tag-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  font-size: 0.65rem;
  line-height: 1;
  transition: background 0.15s;
}

.tag-remove:hover {
  background: rgba(248, 81, 73, 0.15);
  color: var(--danger);
}

.tag-input {
  flex: 1;
  min-width: 80px;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 0.82rem;
  outline: none;
  padding: 2px 0;
  font-family: inherit;
}

.tag-input::placeholder {
  color: var(--text-muted);
}

/* 标签历史建议 */
.tag-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  margin-top: 4px;
  background: rgba(22, 27, 34, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  padding: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag-suggestion-item {
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tag-suggestion-item:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(88, 166, 255, 0.08);
}

/* MD 语法速查 */
.meta-trigger-hint {
  color: var(--text-tertiary);
}

.meta-trigger-hint:hover {
  color: var(--accent);
}

.md-cheatsheet-dropdown {
  min-width: 260px;
  padding: 8px;
}

.cheatsheet-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.cheatsheet-table td {
  padding: 5px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: var(--text-secondary);
}

.cheatsheet-table td:first-child {
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.78rem;
  color: var(--accent);
  white-space: nowrap;
}

.cheatsheet-table tr:last-child td {
  border-bottom: none;
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ---- 编辑/预览主区域 ---- */
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
  font-size: 0.82rem;
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

  .meta-panel {
    flex-wrap: wrap;
  }

  .meta-field {
    flex: 1;
  }

  .meta-divider {
    display: none;
  }

  .meta-tags {
    flex: 1 0 100%;
  }

  .meta-trigger-text {
    font-size: 0.75rem;
  }
}
</style>
