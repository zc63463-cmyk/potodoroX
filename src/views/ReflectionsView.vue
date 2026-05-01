<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useReflectionStore } from '@/stores/reflection'
import { useTaskStore } from '@/stores/task'
import type { Mood, Reflection } from '@/types'
import { MOODS } from '@/utils/constants'
import { formatDate, formatFriendlyDate, getWeekdayName } from '@/utils/format'

// ---- Stores ----
const reflectionStore = useReflectionStore()
const taskStore = useTaskStore()

// ---- 状态 ----
const selectedDate = ref(formatDate(new Date()))
const content = ref('')
const currentMood = ref<Mood>('normal')
const showPreview = ref(false)
const isSaving = ref(false)
const saveMessage = ref('')
const showDeleteConfirm = ref(false)
const deleteTargetId = ref<string | null>(null)
const autoSaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)

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
  { label: '今日收获', text: '## 今日收获\n\n- \n- \n- \n' },
  { label: '困难与解决', text: '## 困难与解决\n\n### 遇到的困难\n\n\n### 解决方案\n\n\n### 经验总结\n\n' },
  { label: '明日计划', text: '## 明日计划\n\n1. \n2. \n3. \n\n### 目标\n\n' },
]

// ---- 计算属性 ----

/** 当前日期的反思 */
const currentReflection = computed(() => {
  return reflectionStore.reflections.find((r) => r.date === selectedDate.value)
})

/** 当前反思的 ID（用于判断是新建还是编辑） */
const currentReflectionId = computed(() => {
  return currentReflection.value?.id || null
})

/** 日期显示文本 */
const dateDisplayText = computed(() => {
  const friendly = formatFriendlyDate(selectedDate.value)
  const weekday = getWeekdayName(selectedDate.value)
  return `${friendly} ${weekday}`
})

/** 当日相关任务 */
const todayTasks = computed(() => {
  return taskStore.tasks.filter(
    (t) =>
      t.createdAt.startsWith(selectedDate.value) ||
      (t.dueDate && t.dueDate.startsWith(selectedDate.value))
  )
})

/** 最近反思列表（排除当前编辑的） */
const recentReflections = computed(() => {
  return reflectionStore.filteredReflections
    .filter((r) => r.id !== currentReflectionId.value)
    .slice(0, 10)
})

/** 是否有未保存的更改 */
const hasUnsavedChanges = computed(() => {
  if (!currentReflection.value) {
    return content.value.trim() !== '' || currentMood.value !== 'normal'
  }
  return (
    currentReflection.value.content !== content.value ||
    currentReflection.value.mood !== currentMood.value
  )
})

// ---- 方法 ----

/** 加载指定日期的反思 */
function loadReflectionForDate(date: string) {
  const reflection = reflectionStore.reflections.find((r) => r.date === date)
  if (reflection) {
    content.value = reflection.content
    currentMood.value = reflection.mood
  } else {
    content.value = ''
    currentMood.value = 'normal'
  }
}

/** 保存反思 */
async function saveReflection() {
  isSaving.value = true
  try {
    if (currentReflectionId.value) {
      await reflectionStore.updateReflection(currentReflectionId.value, {
        content: content.value,
        mood: currentMood.value,
      })
    } else {
      await reflectionStore.createReflection({
        date: selectedDate.value,
        content: content.value,
        mood: currentMood.value,
        relatedTaskIds: [],
        tags: [],
      })
    }
    showSaveMessage('保存成功')
  } catch (err) {
    console.error('保存反思失败:', err)
    showSaveMessage('保存失败')
  } finally {
    isSaving.value = false
  }
}

/** 自动保存（防抖） */
function triggerAutoSave() {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }
  autoSaveTimer.value = setTimeout(() => {
    if (hasUnsavedChanges.value) {
      saveReflection()
    }
  }, 1500)
}

/** 显示保存消息 */
function showSaveMessage(msg: string) {
  saveMessage.value = msg
  setTimeout(() => {
    saveMessage.value = ''
  }, 2000)
}

/** 选择心情 */
function selectMood(mood: Mood) {
  currentMood.value = mood
  triggerAutoSave()
}

/** 插入模板 */
function insertTemplate(template: typeof templates[0]) {
  content.value = template.text + content.value
  triggerAutoSave()
  nextTick(() => {
    const textarea = document.querySelector('.reflection-textarea') as HTMLTextAreaElement
    if (textarea) {
      textarea.focus()
      textarea.setSelectionRange(0, 0)
    }
  })
}

/** 切换日期 */
function changeDate(offset: number) {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() + offset)
  selectedDate.value = formatDate(d)
}

/** 跳转到今天 */
function goToToday() {
  selectedDate.value = formatDate(new Date())
}

/** 点击编辑某个反思 */
function editReflection(reflection: Reflection) {
  selectedDate.value = reflection.date
}

/** 请求删除反思 */
function requestDelete(id: string) {
  deleteTargetId.value = id
  showDeleteConfirm.value = true
}

/** 确认删除 */
async function confirmDelete() {
  if (deleteTargetId.value) {
    await reflectionStore.deleteReflection(deleteTargetId.value)
    // 如果删除的是当前编辑的，清空编辑器
    if (deleteTargetId.value === currentReflectionId.value) {
      content.value = ''
      currentMood.value = 'normal'
    }
  }
  showDeleteConfirm.value = false
  deleteTargetId.value = null
}

/** 取消删除 */
function cancelDelete() {
  showDeleteConfirm.value = false
  deleteTargetId.value = null
}

/** 获取心情配置 */
function getMoodInfo(mood: Mood) {
  return moodConfig[mood] || moodConfig.normal
}

/** 获取内容预览（前80字） */
function getContentPreview(content: string): string {
  if (!content) return '无内容'
  const stripped = content.replace(/[#*_\[\]]/g, '').replace(/\n+/g, ' ').trim()
  return stripped.length > 80 ? stripped.slice(0, 80) + '...' : stripped
}

/** 简单的 Markdown 渲染（基础支持） */
function renderMarkdown(text: string): string {
  if (!text) return ''
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-3 mb-1" style="color: var(--text)">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-4 mb-2" style="color: var(--text)">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2" style="color: var(--accent)">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc" style="color: var(--text-secondary)">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal" style="color: var(--text-secondary)">$2</li>')
    .replace(/\n/g, '<br>')
}

// ---- 监听 ----

// 日期变化时加载对应反思
watch(selectedDate, (newDate) => {
  loadReflectionForDate(newDate)
})

// ---- 初始化 ----
onMounted(async () => {
  await Promise.all([
    reflectionStore.loadReflections(),
    taskStore.loadTasks(),
  ])
  loadReflectionForDate(selectedDate.value)
})
</script>

<template>
  <div class="reflections-view">
    <!-- 顶部栏 -->
    <header class="reflections-header">
      <div class="header-left">
        <button class="btn-new" @click="goToToday">
          <span class="btn-icon">+</span>
          <span>新建反思</span>
        </button>
      </div>

      <div class="header-center">
        <button class="date-nav-btn" @click="changeDate(-1)" title="前一天">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10.5 3L5 8l5.5 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="date-display">
          <input
            type="date"
            v-model="selectedDate"
            class="date-input"
          />
          <span class="date-text">{{ dateDisplayText }}</span>
        </div>
        <button class="date-nav-btn" @click="changeDate(1)" title="后一天">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 3L11 8l-5.5 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div class="header-right">
        <span v-if="saveMessage" class="save-message" :class="{ error: saveMessage.includes('失败') }">
          {{ saveMessage }}
        </span>
        <button
          class="btn-save"
          :disabled="isSaving || !hasUnsavedChanges"
          @click="saveReflection"
        >
          <svg v-if="isSaving" class="spin-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
          <span>{{ isSaving ? '保存中...' : '保存' }}</span>
        </button>
      </div>
    </header>

    <!-- 主内容 -->
    <div class="reflections-body">
      <!-- 左侧：编辑器 -->
      <div class="editor-panel">
        <!-- 日期标题 -->
        <div class="editor-date-header">
          <h2 class="date-title">{{ dateDisplayText }}</h2>
          <button
            v-if="selectedDate !== formatDate(new Date())"
            class="btn-today"
            @click="goToToday"
          >
            回到今天
          </button>
        </div>

        <!-- 心情选择器 -->
        <div class="mood-selector">
          <span class="mood-label">今日心情</span>
          <div class="mood-options">
            <button
              v-for="mood in MOODS"
              :key="mood.value"
              class="mood-card"
              :class="{ active: currentMood === mood.value }"
              :style="{
                '--mood-color': getMoodInfo(mood.value).color,
                '--mood-bg': getMoodInfo(mood.value).bgColor,
              }"
              @click="selectMood(mood.value)"
            >
              <span class="mood-emoji">{{ getMoodInfo(mood.value).emoji }}</span>
              <span class="mood-text">{{ getMoodInfo(mood.value).label }}</span>
            </button>
          </div>
        </div>

        <!-- 快速模板 -->
        <div class="template-bar">
          <span class="template-label">快速模板</span>
          <button
            v-for="tpl in templates"
            :key="tpl.label"
            class="template-btn"
            @click="insertTemplate(tpl)"
          >
            {{ tpl.label }}
          </button>
        </div>

        <!-- 内容编辑区 -->
        <div class="editor-area">
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

          <!-- 编辑模式 -->
          <textarea
            v-if="!showPreview"
            v-model="content"
            class="reflection-textarea"
            placeholder="写下今天的反思..."
            @blur="triggerAutoSave"
          />

          <!-- 预览模式 -->
          <div
            v-else
            class="reflection-preview"
            v-html="renderMarkdown(content)"
          />
        </div>
      </div>

      <!-- 右侧边栏 -->
      <aside class="sidebar-panel">
        <!-- 今日相关任务 -->
        <div class="sidebar-section">
          <h3 class="section-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="section-icon">
              <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z"/>
              <path d="M8 4a.75.75 0 01.75.75v2.5h2.5a.75.75 0 010 1.5h-2.5v2.5a.75.75 0 01-1.5 0v-2.5h-2.5a.75.75 0 010-1.5h2.5v-2.5A.75.75 0 018 4z"/>
            </svg>
            今日任务
          </h3>
          <div v-if="todayTasks.length === 0" class="empty-hint">
            当日暂无相关任务
          </div>
          <ul v-else class="task-link-list">
            <li v-for="task in todayTasks" :key="task.id" class="task-link-item">
              <span
                class="task-status-dot"
                :class="{
                  'status-todo': task.status === 'todo',
                  'status-progress': task.status === 'in_progress',
                  'status-done': task.status === 'done',
                }"
              />
              <span class="task-link-title">{{ task.title }}</span>
              <span class="task-pomo-count">
                {{ task.actualPomodoros }}/{{ task.estimatedPomodoros }}
              </span>
            </li>
          </ul>
        </div>

        <!-- 最近反思 -->
        <div class="sidebar-section">
          <h3 class="section-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="section-icon">
              <path d="M8 0a8 8 0 110 16A8 8 0 018 0zM1.5 8a6.5 6.5 0 1013 0 6.5 6.5 0 00-13 0zm4.879-2.773a.75.75 0 00-1.061 0l-2.25 2.25a.75.75 0 000 1.06l2.25 2.25a.75.75 0 101.06-1.06l-1.72-1.72h4.34a.75.75 0 000-1.5H4.72l1.72-1.72a.75.75 0 000-1.06z"/>
            </svg>
            最近反思
          </h3>
          <div v-if="recentReflections.length === 0" class="empty-hint">
            暂无反思记录
          </div>
          <ul v-else class="reflection-list">
            <li
              v-for="r in recentReflections"
              :key="r.id"
              class="reflection-item"
              @click="editReflection(r)"
            >
              <div class="reflection-item-header">
                <span class="reflection-item-date">
                  {{ formatFriendlyDate(r.date) }}
                </span>
                <span
                  class="reflection-item-mood"
                  :style="{ color: getMoodInfo(r.mood).color }"
                >
                  {{ getMoodInfo(r.mood).emoji }}
                </span>
              </div>
              <p class="reflection-item-preview">
                {{ getContentPreview(r.content) }}
              </p>
              <button
                class="reflection-item-delete"
                title="删除"
                @click.stop="requestDelete(r.id)"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zM11 3V1.75A1.75 1.75 0 009.25 0h-2.5A1.75 1.75 0 005 1.75V3H2.75a.75.75 0 000 1.5h.69l.95 9.3A1.75 1.75 0 006.12 16h3.76a1.75 1.75 0 001.73-1.5l.95-9.3h.69a.75.75 0 000-1.5H11zm-6.56 1.5l.91 8.82a.25.25 0 00.25.22h3.8a.25.25 0 00.25-.22l.91-8.82H4.44z"/>
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </div>

    <!-- 删除确认对话框 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDelete">
          <div class="modal-content">
            <h3 class="modal-title">确认删除</h3>
            <p class="modal-message">删除后无法恢复，确定要删除这条反思吗？</p>
            <div class="modal-actions">
              <button class="modal-btn cancel" @click="cancelDelete">取消</button>
              <button class="modal-btn danger" @click="confirmDelete">删除</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.reflections-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ---- 顶部栏 ---- */
.reflections-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  flex-shrink: 0;
  gap: 16px;
}

.header-left,
.header-right {
  flex-shrink: 0;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-new {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-new:hover {
  background: var(--active-bg);
}

.btn-icon {
  font-size: 1.1rem;
  font-weight: 700;
}

.date-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.date-nav-btn:hover {
  background: var(--hover-bg);
  color: var(--text);
}

.date-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-input {
  width: 140px;
  padding: 6px 10px;
  font-size: 0.875rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  cursor: pointer;
}

.date-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.save-message {
  font-size: 0.8rem;
  color: #3FB950;
  animation: fade-in 0.3s ease-out;
}

.save-message.error {
  color: #F85149;
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-save:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.spin-icon {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ---- 主内容区 ---- */
.reflections-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ---- 编辑器面板 ---- */
.editor-panel {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-today:hover {
  background: var(--hover-bg);
  color: var(--accent);
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
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 10px;
  border: 2px solid transparent;
  background: var(--bg);
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
}

.mood-card:hover {
  border-color: var(--mood-color, var(--border));
  background: var(--mood-bg, var(--hover-bg));
}

.mood-card.active {
  border-color: var(--mood-color, var(--accent));
  background: var(--mood-bg, var(--active-bg));
  color: var(--mood-color, var(--accent));
}

.mood-emoji {
  font-size: 1.4rem;
  line-height: 1;
}

.mood-text {
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
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--hover-bg);
}

/* ---- 编辑区 ---- */
.editor-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--bg);
}

.editor-toolbar {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
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
  padding: 20px;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 0.95rem;
  line-height: 1.7;
  resize: none;
  outline: none;
  font-family: inherit;
}

.reflection-textarea::placeholder {
  color: var(--text-tertiary);
}

.reflection-preview {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text-secondary);
}

/* ---- 右侧边栏 ---- */
.sidebar-panel {
  width: 300px;
  min-width: 300px;
  border-left: 1px solid var(--border);
  background: var(--surface);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-section {
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
}

.section-icon {
  color: var(--accent);
  flex-shrink: 0;
}

.empty-hint {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  text-align: center;
  padding: 12px 0;
}

/* ---- 任务链接列表 ---- */
.task-link-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.task-link-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.task-link-item:hover {
  background: var(--hover-bg);
}

.task-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.task-status-dot.status-todo {
  background: #8B949E;
}

.task-status-dot.status-progress {
  background: #58A6FF;
}

.task-status-dot.status-done {
  background: #3FB950;
}

.task-link-title {
  flex: 1;
  font-size: 0.85rem;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-pomo-count {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

/* ---- 反思列表 ---- */
.reflection-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reflection-item {
  position: relative;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.reflection-item:hover {
  border-color: var(--accent);
  background: var(--hover-bg);
}

.reflection-item:hover .reflection-item-delete {
  opacity: 1;
}

.reflection-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.reflection-item-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.reflection-item-mood {
  font-size: 1rem;
}

.reflection-item-preview {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.reflection-item-delete {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
}

.reflection-item-delete:hover {
  background: rgba(248, 81, 73, 0.15);
  color: #F85149;
}

/* ---- 模态框 ---- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  width: 400px;
  max-width: 90vw;
  animation: bounce-in 0.2s ease-out;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
}

.modal-message {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 24px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-btn {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-btn.cancel {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.modal-btn.cancel:hover {
  background: var(--hover-bg);
  color: var(--text);
}

.modal-btn.danger {
  background: #F85149;
  color: #fff;
}

.modal-btn.danger:hover {
  opacity: 0.9;
}

/* ---- 过渡动画 ---- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ---- 响应式 ---- */
@media (max-width: 900px) {
  .sidebar-panel {
    display: none;
  }
}

@media (max-width: 600px) {
  .reflections-header {
    flex-wrap: wrap;
    padding: 12px 16px;
  }

  .date-text {
    display: none;
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

  .editor-panel {
    padding: 16px;
  }
}
</style>
