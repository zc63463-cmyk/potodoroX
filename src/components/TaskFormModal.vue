<script setup lang="ts">
// ============================================================
// PomodoroX - 任务表单弹窗
// 新建 / 编辑 任务的统一表单界面
// ============================================================

import { ref, watch } from 'vue'
import { PRIORITIES, STATUSES, DEFAULT_TAGS } from '@/utils/constants'
import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '@/types'

interface Props {
  visible: boolean
  editingTask: Task | null
  initialStatus?: TaskStatus
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'create', input: CreateTaskInput): void
  (e: 'update', id: string, input: UpdateTaskInput): void
  (e: 'cancel'): void
}>()

// ---- 表单数据 ----
const form = ref({
  title: '',
  description: '',
  status: 'todo' as TaskStatus,
  priority: 'medium' as Task['priority'],
  estimatedPomodoros: 1,
  tags: [] as string[],
  dueDate: '' as string,
})
const tagInput = ref('')
const formError = ref('')

// ---- 初始化表单 ----
watch(() => props.visible, (visible) => {
  if (visible) {
    initForm()
  }
})

function initForm() {
  if (props.editingTask) {
    form.value = {
      title: props.editingTask.title,
      description: props.editingTask.description,
      status: props.editingTask.status,
      priority: props.editingTask.priority,
      estimatedPomodoros: props.editingTask.estimatedPomodoros,
      tags: [...props.editingTask.tags],
      dueDate: props.editingTask.dueDate || '',
    }
  } else {
    form.value = {
      title: '',
      description: '',
      status: props.initialStatus || 'todo',
      priority: 'medium',
      estimatedPomodoros: 1,
      tags: [],
      dueDate: '',
    }
  }
  tagInput.value = ''
  formError.value = ''
}

// ---- 标签管理 ----
function addTag() {
  const tag = tagInput.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
  }
  tagInput.value = ''
}

function removeTag(tag: string) {
  form.value.tags = form.value.tags.filter((t) => t !== tag)
}

function onTagInputKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    addTag()
  }
}

function selectDefaultTag(tag: string) {
  if (!form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
  }
}

// ---- 保存 ----
function saveTask() {
  if (!form.value.title.trim()) {
    formError.value = '任务标题不能为空'
    return
  }

  const input: CreateTaskInput = {
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    priority: form.value.priority,
    estimatedPomodoros: form.value.estimatedPomodoros,
    tags: [...form.value.tags],
    dueDate: form.value.dueDate || null,
    plan: '',
    completion: '',
  }

  if (props.editingTask) {
    const updateInput: UpdateTaskInput = {
      ...input,
      status: form.value.status,
    }
    emit('update', props.editingTask.id, updateInput)
  } else {
    emit('create', input)
  }
}

function close() {
  emit('cancel')
}

// ---- 键盘 ----
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    close()
  }
}
</script>

<template>
  <Transition name="modal">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-panel" @keydown="handleKeydown" tabindex="-1">
        <!-- 头部 -->
        <div class="modal-header">
          <h2 class="modal-title">{{ editingTask ? '编辑任务' : '新建任务' }}</h2>
          <button class="modal-close" @click="close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- 表单内容 -->
        <div class="modal-body">
          <!-- 错误提示 -->
          <div v-if="formError" class="form-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ formError }}
          </div>

          <!-- 标题 -->
          <div class="form-group">
            <label class="form-label">
              标题 <span class="required">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              class="form-input"
              placeholder="输入任务标题..."
              maxlength="200"
              @keydown.enter="saveTask"
            />
          </div>

          <!-- 描述 -->
          <div class="form-group">
            <label class="form-label">描述</label>
            <textarea
              v-model="form.description"
              class="form-textarea"
              placeholder="添加任务描述（支持 Markdown）..."
              rows="4"
            />
          </div>

          <!-- 状态 & 优先级 -->
          <div class="form-row">
            <div class="form-group half">
              <label class="form-label">状态</label>
              <select v-model="form.status" class="form-select">
                <option v-for="s in STATUSES" :key="s.value" :value="s.value">
                  {{ s.label }}
                </option>
              </select>
            </div>
            <div class="form-group half">
              <label class="form-label">优先级</label>
              <select v-model="form.priority" class="form-select">
                <option v-for="p in PRIORITIES" :key="p.value" :value="p.value">
                  {{ p.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- 预估番茄数 & 截止日期 -->
          <div class="form-row">
            <div class="form-group half">
              <label class="form-label">预估番茄数</label>
              <input
                v-model.number="form.estimatedPomodoros"
                type="number"
                class="form-input"
                min="1"
                max="20"
              />
            </div>
            <div class="form-group half">
              <label class="form-label">截止日期</label>
              <input
                v-model="form.dueDate"
                type="date"
                class="form-input"
              />
            </div>
          </div>

          <!-- 标签 -->
          <div class="form-group">
            <label class="form-label">标签</label>
            <div class="tags-input-area">
              <div class="tags-chips">
                <span
                  v-for="tag in form.tags"
                  :key="tag"
                  class="tag-chip editable"
                >
                  {{ tag }}
                  <button class="tag-remove" @click="removeTag(tag)">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </span>
                <input
                  v-model="tagInput"
                  type="text"
                  class="tag-input"
                  placeholder="输入标签后回车..."
                  @keydown="onTagInputKeydown"
                />
              </div>
              <!-- 快速标签 -->
              <div class="quick-tags">
                <span class="quick-tags-label">快速添加：</span>
                <button
                  v-for="tag in DEFAULT_TAGS.filter(t => !form.tags.includes(t))"
                  :key="tag"
                  class="quick-tag-btn"
                  @click="selectDefaultTag(tag)"
                >
                  + {{ tag }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部 -->
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="close">取消</button>
          <button class="btn btn-primary" @click="saveTask">
            {{ editingTask ? '保存修改' : '创建任务' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ---- 通用模态框 ---- */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 20px;
}

.modal-panel {
  width: 100%;
  max-width: 560px;
  max-height: 85vh;
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--glass-shadow), 0 20px 60px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--glass-border);
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
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
}

.modal-close:hover {
  background: var(--hover-bg);
  color: var(--text);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--glass-border);
  flex-shrink: 0;
}

/* ---- 表单 ---- */
.form-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: color-mix(in srgb, var(--danger) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--danger) 30%, transparent);
  border-radius: var(--radius-lg);
  color: var(--danger);
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group.half {
  flex: 1;
  min-width: 0;
}

.form-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.required {
  color: var(--danger);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  font-size: 0.85rem;
  border-radius: var(--radius-lg);
  background: var(--bg);
  border: 1px solid var(--glass-border);
  color: var(--text);
  outline: none;
  transition: all var(--transition-fast);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--active-bg), 0 0 15px var(--accent-glow);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.6;
  font-family: inherit;
}

.form-row {
  display: flex;
  gap: 16px;
}

/* ---- 标签输入 ---- */
.tags-input-area {
  width: 100%;
}

.tags-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px 8px;
  background: var(--bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  min-height: 38px;
  align-items: center;
  transition: all var(--transition-fast);
}

.tags-chips:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--active-bg), 0 0 15px var(--accent-glow);
}

.tag-chip {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  background: var(--active-bg);
  color: var(--accent);
  white-space: nowrap;
}

.tag-chip.editable {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px 2px 8px;
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.tag-remove:hover {
  color: var(--danger);
  background: color-mix(in srgb, var(--danger) 15%, transparent);
}

.tag-input {
  flex: 1;
  min-width: 100px;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 0.85rem;
  outline: none;
  padding: 2px 4px;
}

.tag-input::placeholder {
  color: var(--text-tertiary);
}

.quick-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.quick-tags-label {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  margin-right: 4px;
}

.quick-tag-btn {
  padding: 2px 8px;
  border: 1px dashed var(--glass-border);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-tertiary);
  font-size: 0.7rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.quick-tag-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  border-style: solid;
  background: var(--active-bg);
  box-shadow: 0 0 8px var(--accent-glow);
}

/* ---- 按钮 ---- */
.btn {
  padding: 8px 20px;
  border-radius: var(--radius-lg);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.btn-secondary {
  background: var(--bg);
  color: var(--text-secondary);
  border: 1px solid var(--glass-border);
}

.btn-secondary:hover {
  background: var(--hover-bg);
  color: var(--text);
  border-color: var(--text-tertiary);
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.btn-primary:hover {
  filter: brightness(1.1);
  box-shadow: 0 0 20px var(--accent-glow), 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* ---- 过渡动画 ---- */
.modal-enter-active {
  transition: opacity var(--transition-normal);
}

.modal-leave-active {
  transition: opacity var(--transition-fast);
}

.modal-enter-active .modal-panel {
  transition: all var(--transition-spring);
}

.modal-leave-active .modal-panel {
  transition: all var(--transition-fast);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-panel {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.modal-leave-to .modal-panel {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
</style>
