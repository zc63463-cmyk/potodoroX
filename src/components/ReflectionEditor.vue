<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import MarkdownPreview from '@/components/MarkdownPreview.vue'
import type { Mood, Task } from '@/types'
import { MOODS } from '@/utils/constants'
import { formatFriendlyDate, getWeekdayName } from '@/utils/format'

// ---- Props ----
const props = defineProps<{
  date: string
  content: string
  mood: Mood
  tags: string[]
  reflectionId: string | null
  todayTasks: Task[]
}>()

const emit = defineEmits<{
  (e: 'update:content', value: string): void
  (e: 'update:mood', value: Mood): void
  (e: 'update:tags', value: string[]): void
  (e: 'changeDate', offset: number): void
  (e: 'goToToday'): void
  (e: 'save'): void
  (e: 'triggerAutoSave'): void
}>()

// ---- 本地状态 ----
const showPreview = ref(false)
const tagInput = ref('')

// ---- 心情配置 ----
const moodConfig: Record<Mood, { emoji: string; label: string; color: string; bgColor: string }> = {
  great: { emoji: '\u{1F604}', label: '很棒', color: '#3FB950', bgColor: 'rgba(63, 185, 80, 0.15)' },
  good: { emoji: '\u{1F642}', label: '不错', color: '#58A6FF', bgColor: 'rgba(88, 166, 255, 0.15)' },
  normal: { emoji: '\u{1F610}', label: '一般', color: '#D29922', bgColor: 'rgba(210, 153, 34, 0.15)' },
  bad: { emoji: '\u{1F61F}', label: '不好', color: '#F0883E', bgColor: 'rgba(240, 136, 62, 0.15)' },
  terrible: { emoji: '\u{1F61E}', label: '很差', color: '#F85149', bgColor: 'rgba(248, 81, 73, 0.15)' },
}

// ---- 模板 ----
const templates = [
  {
    label: '极简日记',
    text: '### 极简日记\n\n- 今天发生了：\n- 我的感受是：\n- 今天最重要的一件事：\n- 明天想继续：\n',
  },
  {
    label: '情绪复盘',
    text: '### 情绪复盘\n\n- 今天的主要情绪：\n- 触发这个情绪的事件：\n- 我当时的想法：\n- 这个想法是否完全准确：\n- 我可以如何照顾自己：\n',
  },
  {
    label: '今日收获',
    text: '### 今日收获\n\n- 今天完成了：\n- 今天学到了：\n- 今天让我开心的是：\n- 今天值得保留的一个瞬间：\n- 给今天的自己一句话：\n',
  },
  {
    label: '困难与解决',
    text: '### 困难与解决\n\n- 今天遇到的困难：\n- 当时我的感受：\n- 我尝试过的方法：\n- 有效的做法：\n- 下次可以怎么改进：\n',
  },
  {
    label: '明日计划',
    text: '### 明日计划\n\n- 明天最重要的一件事：\n- 需要完成的 2–3 个小任务：\n  - \n  - \n  - \n- 可能遇到的阻碍：\n- 我准备如何应对：\n- 明天从哪一步开始：\n',
  },
]

// ---- 计算属性 ----
const dateDisplayText = computed(() => {
  const friendly = formatFriendlyDate(props.date)
  const weekday = getWeekdayName(props.date)
  return `${friendly} ${weekday}`
})

// ---- 方法 ----
function selectMood(mood: Mood) {
  emit('update:mood', mood)
  emit('triggerAutoSave')
}

function insertTemplate(template: (typeof templates)[0]) {
  emit('update:content', template.text + props.content)
  emit('triggerAutoSave')
  nextTick(() => {
    const textarea = document.querySelector('.reflection-textarea') as HTMLTextAreaElement
    if (textarea) {
      textarea.focus()
      textarea.setSelectionRange(0, 0)
    }
  })
}

function handleTagInputKey(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
    e.preventDefault()
    addTag()
  } else if (e.key === 'Backspace' && tagInput.value === '') {
    removeLastTag()
  }
}

function addTag() {
  const raw = tagInput.value.trim().toLowerCase().replace(/,/g, '')
  if (!raw) return
  if (raw.length > 20) return
  if (props.tags.includes(raw)) {
    tagInput.value = ''
    return
  }
  if (props.tags.length >= 8) return
  emit('update:tags', [...props.tags, raw])
  tagInput.value = ''
  emit('triggerAutoSave')
}

function removeTag(index: number) {
  const next = [...props.tags]
  next.splice(index, 1)
  emit('update:tags', next)
  emit('triggerAutoSave')
}

function removeLastTag() {
  if (props.tags.length === 0) return
  const next = [...props.tags]
  next.pop()
  emit('update:tags', next)
  emit('triggerAutoSave')
}

function onBlurTagInput() {
  addTag()
}

function getMoodInfo(mood: Mood) {
  return moodConfig[mood] || moodConfig.normal
}
</script>

<template>
  <div class="editor-panel">
    <!-- 日期标题 -->
    <div class="editor-date-header">
      <h2 class="date-title">{{ dateDisplayText }}</h2>
      <button class="btn-today" @click="emit('goToToday')">回到今天</button>
    </div>

    <!-- 心情选择器 -->
    <div class="mood-selector">
      <span class="mood-label">今日心情</span>
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
    <div class="template-bar">
      <span class="template-label">快速模板</span>
      <button v-for="tpl in templates" :key="tpl.label" class="template-btn" @click="insertTemplate(tpl)">
        {{ tpl.label }}
      </button>
    </div>

    <!-- 标签输入 -->
    <div class="tag-bar">
      <span class="tag-label">标签</span>
      <div class="tag-input-wrap">
        <span v-for="(tag, i) in tags" :key="tag" class="tag-chip">
          {{ tag }}
          <button class="tag-remove" @click="removeTag(i)">×</button>
        </span>
        <input
          ref="tagInputRef"
          v-model="tagInput"
          class="tag-input"
          placeholder="添加标签，按回车确认"
          @keydown="handleTagInputKey"
          @blur="onBlurTagInput"
        />
      </div>
    </div>

    <!-- 编辑/预览切换 -->
    <div class="editor-toolbar">
      <button class="toolbar-btn" :class="{ active: !showPreview }" @click="showPreview = false">编辑</button>
      <button class="toolbar-btn" :class="{ active: showPreview }" @click="showPreview = true">预览</button>
    </div>

    <!-- 编辑模式 -->
    <textarea
      v-if="!showPreview"
      :value="content"
      class="reflection-textarea"
      placeholder="写下今天的反思..."
      @input="emit('update:content', ($event.target as HTMLTextAreaElement).value); emit('triggerAutoSave')"
    />

    <!-- 预览模式 -->
    <MarkdownPreview v-else :content="content" show-toc />
  </div>
</template>

<style scoped>
/* ---- 编辑器面板 (Glass) ---- */
.editor-panel {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
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
}

.date-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
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
  box-shadow: 0 0 8px var(--accent-glow);
}

/* ---- 心情选择器 ---- */
.mood-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mood-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.mood-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.mood-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  border: 1.5px solid transparent;
  background: linear-gradient(135deg, var(--surface) 0%, var(--bg-elevated) 100%);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--text-secondary);
  overflow: hidden;
}

.mood-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--mood-bg);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.mood-card:hover {
  border-color: var(--mood-color, var(--border));
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--mood-bg);
}

.mood-card:hover::before {
  opacity: 0.6;
}

.mood-card.active {
  border-color: var(--mood-color, var(--accent));
  background: linear-gradient(135deg, var(--mood-bg) 0%, var(--surface) 100%);
  color: var(--mood-color, var(--accent));
  box-shadow: 0 0 20px var(--mood-bg), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.mood-card.active::before {
  opacity: 1;
}

.mood-emoji {
  position: relative;
  z-index: 1;
  font-size: 1.4rem;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

.mood-text {
  position: relative;
  z-index: 1;
  font-size: 0.85rem;
  font-weight: 500;
}

/* ---- 快速模板 ---- */
.template-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.template-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.template-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.template-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--hover-bg);
  box-shadow: 0 0 10px var(--accent-glow);
  transform: translateY(-1px);
}

/* ---- 标签输入 ---- */
.tag-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.tag-input-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.tag-input-wrap:focus-within {
  border-color: var(--accent-dim);
  box-shadow: 0 0 0 2px var(--accent-glow);
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid var(--accent-dim);
  background: rgba(88, 166, 255, 0.08);
  color: var(--accent);
  font-size: 0.75rem;
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
  transition: background 0.2s ease;
}

.tag-remove:hover {
  background: rgba(248, 81, 73, 0.15);
  color: var(--danger);
}

.tag-input {
  flex: 1;
  min-width: 120px;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 0.85rem;
  outline: none;
  padding: 4px 0;
}

.tag-input::placeholder {
  color: var(--text-muted);
}

/* ---- 编辑区 ---- */
.editor-toolbar {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--glass-border);
  flex-shrink: 0;
  background: var(--bg-elevated);
}

.toolbar-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
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
  padding: 20px;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 0.95rem;
  line-height: 1.7;
  resize: none;
  outline: none;
  font-family: inherit;
  transition: background 0.2s ease;
}

.reflection-textarea::placeholder {
  color: var(--text-muted);
}

.reflection-textarea:focus {
  background: var(--surface-hover);
}


/* ---- 响应式 ---- */
@media (max-width: 600px) {
  .editor-panel {
    padding: 16px;
  }

  .mood-options {
    gap: 6px;
  }

  .mood-card {
    padding: 8px 12px;
  }

  .mood-text {
    display: none;
  }
}
</style>
