<script setup lang="ts">
// ============================================================
// PomodoroX - 任务详情弹窗
// 规划 / 完成情况 / 专注记录 三 Tab 设计
// ============================================================

import { ref, computed, watch } from 'vue'
import { useSessionStore } from '@/stores/session'
import { PRIORITIES, STATUSES } from '@/utils/constants'
import { formatRelativeTime, formatFriendlyDate } from '@/utils/format'
import type { Task, UpdateTaskInput, Session } from '@/types'

interface Props {
  task: Task | null
  visible: boolean
  initialTab?: 'plan' | 'completion' | 'sessions'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update', id: string, input: UpdateTaskInput): void
}>()

// ---- Stores ----
const sessionStore = useSessionStore()

// ---- 状态 ----
const activeTab = ref<'plan' | 'completion' | 'sessions'>(props.initialTab || 'plan')
const planText = ref('')
const completionText = ref('')
const saving = ref(false)
let saveTimeout: ReturnType<typeof setTimeout> | null = null

// ---- Session 编辑状态 ----
const expandedSessionId = ref<string | null>(null)
const sessionEdits = ref<Map<string, { plan: string; completion: string }>>(new Map())
const sessionSavingIds = ref<Set<string>>(new Set())
const sessionSaveTimeouts = ref<Map<string, ReturnType<typeof setTimeout>>>(new Map())

// ---- 计算属性 ----
const taskSessions = computed(() => {
  if (!props.task) return []
  return sessionStore.getSessionsByTask(props.task.id).sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt)
  )
})

function getPriorityInfo(priority: string) {
  return PRIORITIES.find((p) => p.value === priority) || PRIORITIES[1]
}

function getStatusInfo(status: string) {
  return STATUSES.find((s) => s.value === status) || STATUSES[0]
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60)
  return `${mins} 分钟`
}

// ---- Watchers ----
watch(() => props.task, (task) => {
  if (task) {
    planText.value = task.plan
    completionText.value = task.completion
  }
  // task 切换时清空 session 编辑状态
  expandedSessionId.value = null
  sessionEdits.value.clear()
  sessionSavingIds.value.clear()
  sessionSaveTimeouts.value.forEach((t) => clearTimeout(t))
  sessionSaveTimeouts.value.clear()
}, { immediate: true })

watch(() => props.initialTab, (tab) => {
  if (tab) activeTab.value = tab
})

watch(() => props.visible, (visible) => {
  if (visible) {
    activeTab.value = props.initialTab || 'plan'
  } else {
    // Modal 关闭时折叠所有 session
    expandedSessionId.value = null
  }
})

// ---- 自动保存 ----
function scheduleSave() {
  saving.value = true
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    if (!props.task) return
    const updates: UpdateTaskInput = {}
    if (planText.value !== props.task.plan) updates.plan = planText.value
    if (completionText.value !== props.task.completion) updates.completion = completionText.value
    if (Object.keys(updates).length > 0) {
      emit('update', props.task.id, updates)
    }
    saving.value = false
  }, 800)
}

function onPlanInput() {
  scheduleSave()
}

function onCompletionInput() {
  scheduleSave()
}

// ---- Session 编辑方法 ----
function toggleSessionExpand(sessionId: string) {
  if (expandedSessionId.value === sessionId) {
    expandedSessionId.value = null
    return
  }
  // 初始化编辑缓存
  if (!sessionEdits.value.has(sessionId)) {
    const session = taskSessions.value.find((s) => s.id === sessionId)
    if (session) {
      sessionEdits.value.set(sessionId, {
        plan: session.plan || '',
        completion: session.completion || '',
      })
    }
  }
  expandedSessionId.value = sessionId
}

function getSessionEdit(sessionId: string): { plan: string; completion: string } {
  if (!sessionEdits.value.has(sessionId)) {
    const session = taskSessions.value.find((s) => s.id === sessionId)
    if (session) {
      sessionEdits.value.set(sessionId, {
        plan: session.plan || '',
        completion: session.completion || '',
      })
    }
  }
  return sessionEdits.value.get(sessionId) || { plan: '', completion: '' }
}

function scheduleSessionSave(sessionId: string) {
  sessionSavingIds.value.add(sessionId)
  const existing = sessionSaveTimeouts.value.get(sessionId)
  if (existing) clearTimeout(existing)
  const timeout = setTimeout(() => {
    flushSessionSave(sessionId)
  }, 800)
  sessionSaveTimeouts.value.set(sessionId, timeout)
}

async function flushSessionSave(sessionId: string) {
  const edit = sessionEdits.value.get(sessionId)
  if (!edit) {
    sessionSavingIds.value.delete(sessionId)
    return
  }
  const session = taskSessions.value.find((s) => s.id === sessionId)
  if (!session) {
    sessionSavingIds.value.delete(sessionId)
    return
  }
  const updates: Partial<Pick<Session, 'plan' | 'completion'>> = {}
  if (edit.plan !== session.plan) updates.plan = edit.plan
  if (edit.completion !== session.completion) updates.completion = edit.completion
  if (Object.keys(updates).length > 0) {
    await sessionStore.updateSession(sessionId, updates)
  }
  sessionSavingIds.value.delete(sessionId)
}

function onSessionPlanInput(sessionId: string) {
  scheduleSessionSave(sessionId)
}

function onSessionCompletionInput(sessionId: string) {
  scheduleSessionSave(sessionId)
}

function close() {
  // 立即保存 task 的未保存更改
  if (saveTimeout) {
    clearTimeout(saveTimeout)
    saveTimeout = null
    if (props.task) {
      const updates: UpdateTaskInput = {}
      if (planText.value !== props.task.plan) updates.plan = planText.value
      if (completionText.value !== props.task.completion) updates.completion = completionText.value
      if (Object.keys(updates).length > 0) {
        emit('update', props.task.id, updates)
      }
    }
  }
  // flush 所有 session 的 pending save
  sessionSaveTimeouts.value.forEach((timeout, sessionId) => {
    clearTimeout(timeout)
    flushSessionSave(sessionId)
  })
  sessionSaveTimeouts.value.clear()
  saving.value = false
  expandedSessionId.value = null
  emit('close')
}
</script>

<template>
  <Transition name="modal">
    <div v-if="visible && task" class="modal-overlay" @click.self="close">
      <div class="modal-panel">
        <!-- 头部 -->
        <div class="modal-header">
          <h2 class="modal-title">{{ task.title }}</h2>
          <button class="modal-close" @click="close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- 任务信息卡 -->
        <div class="task-info-card">
          <div class="info-row">
            <span
              class="status-badge"
              :style="{ color: getStatusInfo(task.status).color, backgroundColor: getStatusInfo(task.status).color + '15' }"
            >
              {{ getStatusInfo(task.status).label }}
            </span>
            <span
              class="priority-badge"
              :style="{ backgroundColor: getPriorityInfo(task.priority).color + '20', color: getPriorityInfo(task.priority).color }"
            >
              {{ getPriorityInfo(task.priority).label }}
            </span>
          </div>

          <div v-if="task.tags.length > 0" class="info-tags">
            <span v-for="tag in task.tags" :key="tag" class="tag-chip">{{ tag }}</span>
          </div>

          <div class="info-meta">
            <span class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
                <circle cx="12" cy="13" r="9" fill="#F85149" opacity="0.8"/>
                <rect x="9" y="1" width="6" height="4" rx="1" fill="#3FB950" opacity="0.7"/>
              </svg>
              {{ task.actualPomodoros }}/{{ task.estimatedPomodoros }} 番茄
            </span>
            <span v-if="task.dueDate" class="meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {{ formatFriendlyDate(task.dueDate) }}
            </span>
          </div>
        </div>

        <!-- Tab 栏 -->
        <div class="tab-bar">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'plan' }"
            @click="activeTab = 'plan'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            规划
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'completion' }"
            @click="activeTab = 'completion'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            完成情况
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'sessions' }"
            @click="activeTab = 'sessions'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            专注记录
            <span v-if="taskSessions.length > 0" class="tab-count">{{ taskSessions.length }}</span>
          </button>
        </div>

        <!-- Tab 内容 -->
        <div class="tab-content">
          <!-- 规划 -->
          <div v-if="activeTab === 'plan'" class="tab-pane">
            <label class="field-label">任务规划</label>
            <textarea
              v-model="planText"
              class="detail-textarea"
              placeholder="在此输入任务规划...&#10;例如：&#10;- 第一步：梳理需求&#10;- 第二步：设计原型&#10;- 第三步：开发实现"
              rows="8"
              @input="onPlanInput"
            />
            <div class="save-hint">
              <span v-if="saving">保存中...</span>
              <span v-else-if="planText !== (task?.plan || '')">有未保存的更改</span>
              <span v-else class="saved">已自动保存</span>
            </div>
          </div>

          <!-- 完成情况 -->
          <div v-if="activeTab === 'completion'" class="tab-pane">
            <label class="field-label">完成总结</label>
            <textarea
              v-model="completionText"
              class="detail-textarea"
              placeholder="在此输入完成总结...&#10;例如：&#10;- 已完成登录页面 UI 设计&#10;- 遇到布局兼容性问题，已解决&#10;- 剩余接口联调待下次处理"
              rows="8"
              @input="onCompletionInput"
            />
            <div class="save-hint">
              <span v-if="saving">保存中...</span>
              <span v-else-if="completionText !== (task?.completion || '')">有未保存的更改</span>
              <span v-else class="saved">已自动保存</span>
            </div>
          </div>

          <!-- 专注记录 -->
          <div v-if="activeTab === 'sessions'" class="tab-pane">
            <div v-if="taskSessions.length === 0" class="empty-sessions">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.3">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <p>暂无专注记录</p>
              <p class="empty-sub">开始番茄钟后，专注记录将显示在这里</p>
            </div>
            <div v-else class="session-list">
              <div
                v-for="session in taskSessions"
                :key="session.id"
                class="session-item editable"
                :class="{ completed: session.completed, expanded: expandedSessionId === session.id }"
              >
                <div class="session-header" @click="toggleSessionExpand(session.id)">
                  <span class="session-time">{{ session.startedAt.substring(5, 16).replace(' ', ' ') }}</span>
                  <span class="session-duration">{{ formatDuration(session.duration) }}</span>
                  <span v-if="session.completed" class="session-badge completed">已完成</span>
                  <span v-else class="session-badge skipped">已跳过</span>
                  <svg
                    class="expand-icon"
                    :class="{ rotated: expandedSessionId === session.id }"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>

                <!-- 展开编辑区 -->
                <div v-if="expandedSessionId === session.id" class="session-body">
                  <div class="edit-group">
                    <label class="field-label">本次目标</label>
                    <textarea
                      :value="getSessionEdit(session.id).plan"
                      class="detail-textarea compact"
                      placeholder="本次专注的目标..."
                      rows="3"
                      @input="(e) => { getSessionEdit(session.id).plan = (e.target as HTMLTextAreaElement).value; onSessionPlanInput(session.id) }"
                    />
                  </div>
                  <div class="edit-group">
                    <label class="field-label">完成总结</label>
                    <textarea
                      :value="getSessionEdit(session.id).completion"
                      class="detail-textarea compact"
                      placeholder="完成后的总结..."
                      rows="3"
                      @input="(e) => { getSessionEdit(session.id).completion = (e.target as HTMLTextAreaElement).value; onSessionCompletionInput(session.id) }"
                    />
                  </div>
                  <div class="save-hint session-hint">
                    <span v-if="sessionSavingIds.has(session.id)">保存中...</span>
                    <span v-else-if="getSessionEdit(session.id).plan !== session.plan || getSessionEdit(session.id).completion !== session.completion">有未保存的更改</span>
                    <span v-else class="saved">已自动保存</span>
                  </div>
                </div>

                <!-- 折叠时仅展示已有内容（只读预览） -->
                <div v-else class="session-preview">
                  <div v-if="session.plan" class="session-note">
                    <span class="note-label">目标：</span>{{ session.plan }}
                  </div>
                  <div v-if="session.completion" class="session-note">
                    <span class="note-label">总结：</span>{{ session.completion }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部 -->
        <div class="modal-footer">
          <span class="footer-meta">
            创建于 {{ formatRelativeTime(task.createdAt) }} · 更新于 {{ formatRelativeTime(task.updatedAt) }}
          </span>
          <button class="btn btn-secondary" @click="close">关闭</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ---- 模态框覆层 ---- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

/* ---- 模态面板 ---- */
.modal-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow), 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ---- 头部 ---- */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--glass-border);
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.modal-close:hover {
  background: var(--hover-bg);
  color: var(--text);
}

/* ---- 任务信息卡 ---- */
.task-info-card {
  padding: 16px 20px;
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge,
.priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag-chip {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  background: var(--active-bg);
  color: var(--accent);
  white-space: nowrap;
}

.info-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* ---- Tab 栏 ---- */
.tab-bar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  margin: 12px 20px 0;
  background: var(--glass-bg);
  backdrop-filter: blur(12px) saturate(150%);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  flex-shrink: 0;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  flex: 1;
  justify-content: center;
}

.tab-btn:hover {
  color: var(--text);
  background: var(--hover-bg);
}

.tab-btn.active {
  color: white;
  background: var(--accent);
  box-shadow: 0 0 12px var(--accent-glow);
}

.tab-count {
  font-size: 0.65rem;
  background: var(--hover-bg);
  padding: 1px 6px;
  border-radius: 10px;
  margin-left: 2px;
}

/* ---- Tab 内容 ---- */
.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  min-height: 0;
}

.tab-pane {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.detail-textarea {
  width: 100%;
  padding: 12px;
  font-size: 0.9rem;
  line-height: 1.6;
  border-radius: var(--radius-md);
  background: var(--bg);
  border: 1px solid var(--glass-border);
  color: var(--text);
  resize: vertical;
  min-height: 160px;
  font-family: inherit;
  outline: none;
  transition: all var(--transition-fast);
}

.detail-textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--active-bg), 0 0 15px var(--accent-glow);
}

.detail-textarea::placeholder {
  color: var(--text-tertiary);
}

.save-hint {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-align: right;
  height: 18px;
}

.save-hint .saved {
  color: var(--success);
}

/* ---- 专注记录列表 ---- */
.empty-sessions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
  color: var(--text-tertiary);
  font-size: 0.85rem;
}

.empty-sub {
  font-size: 0.75rem;
  opacity: 0.7;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-item {
  padding: 12px;
  background: var(--glass-bg);
  backdrop-filter: blur(8px) saturate(140%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  box-shadow: var(--glass-shadow);
  transition: all var(--transition-fast);
}

.session-item:hover {
  border-color: var(--accent-dim);
}

.session-item.editable {
  cursor: pointer;
}

.session-item.editable.expanded {
  border-color: var(--accent-dim);
  cursor: default;
}

.session-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
  cursor: pointer;
  user-select: none;
}

.session-item.editable.expanded .session-header {
  margin-bottom: 12px;
}

.expand-icon {
  margin-left: 4px;
  transition: transform 0.2s ease;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.session-time {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text);
}

.session-duration {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.session-badge {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  margin-left: auto;
}

.session-badge.completed {
  color: var(--success);
  background: var(--success) + '15';
  background-color: color-mix(in srgb, var(--success) 15%, transparent);
}

.session-badge.skipped {
  color: var(--text-tertiary);
  background-color: var(--hover-bg);
}

.session-note {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-top: 4px;
  padding-top: 6px;
  border-top: 1px solid var(--glass-border);
}

.note-label {
  font-weight: 600;
  color: var(--accent);
}

/* ---- Session 展开编辑体 ---- */
.session-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: body-expand 0.2s ease;
}

@keyframes body-expand {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.edit-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-textarea.compact {
  min-height: 80px;
  resize: vertical;
}

.session-hint {
  text-align: right;
  height: 18px;
}

/* ---- 底部 ---- */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid var(--glass-border);
  flex-shrink: 0;
  gap: 12px;
}

.footer-meta {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.btn {
  padding: 6px 14px;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.btn-secondary {
  background: var(--surface);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--surface-hover);
  color: var(--text);
}

/* ---- 过渡动画 ---- */
.modal-enter-active {
  transition: all 0.25s ease;
}

.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-panel,
.modal-leave-to .modal-panel {
  transform: scale(0.96) translateY(10px);
  opacity: 0;
}

.modal-panel {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
</style>
