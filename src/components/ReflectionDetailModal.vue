<script setup lang="ts">
import { ref, computed } from 'vue'
import MarkdownPreview from '@/components/MarkdownPreview.vue'
import type { Reflection } from '@/types'
import { formatFriendlyDate, getWeekdayName } from '@/utils/format'

const props = defineProps<{
  reflection: Reflection
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', id: string, payload: { content: string }): void
}>()

const editedContent = ref(props.reflection.content)
const showPreview = ref(false)
const isSaving = ref(false)

const dateDisplay = computed(() => {
  const friendly = formatFriendlyDate(props.reflection.date)
  const weekday = getWeekdayName(props.reflection.date)
  return `${friendly} ${weekday}`
})

function getMoodInfo(mood: string) {
  const map: Record<string, { emoji: string; color: string }> = {
    great: { emoji: '\u{1F604}', color: '#3FB950' },
    good: { emoji: '\u{1F642}', color: '#58A6FF' },
    normal: { emoji: '\u{1F610}', color: '#D29922' },
    bad: { emoji: '\u{1F61F}', color: '#F0883E' },
    terrible: { emoji: '\u{1F61E}', color: '#F85149' },
  }
  return map[mood] || map.normal
}

function onSave() {
  if (isSaving.value) return
  isSaving.value = true
  emit('save', props.reflection.id, { content: editedContent.value })
  isSaving.value = false
}

function onClose() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="onClose">
      <div class="modal-container">
        <!-- 头部 -->
        <div class="modal-header">
          <div class="modal-meta">
            <span class="modal-date">{{ dateDisplay }}</span>
            <span class="modal-mood" :style="{ color: getMoodInfo(reflection.mood).color }">
              {{ getMoodInfo(reflection.mood).emoji }}
            </span>
            <span
              v-for="tag in reflection.tags"
              :key="tag"
              class="modal-tag"
            >
              {{ tag }}
            </span>
          </div>
          <button class="modal-close" @click="onClose">×</button>
        </div>

        <!-- 工具栏 -->
        <div class="modal-toolbar">
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

        <!-- 内容区 -->
        <div class="modal-body">
          <textarea
            v-if="!showPreview"
            v-model="editedContent"
            class="modal-textarea"
            placeholder="写下反思内容..."
          />
          <MarkdownPreview
            v-else
            :content="editedContent"
            show-toc
          />
        </div>

        <!-- 底部操作栏 -->
        <div class="modal-footer">
          <button class="btn-cancel" @click="onClose">取消</button>
          <button
            class="btn-save"
            :disabled="isSaving || editedContent === reflection.content"
            @click="onSave"
          >
            {{ isSaving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-container {
  width: 100%;
  max-width: 900px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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

.modal-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.modal-date {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}

.modal-mood {
  font-size: 1.1rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.modal-tag {
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--accent-dim);
  background: rgba(88, 166, 255, 0.08);
  color: var(--accent);
  font-size: 0.7rem;
  font-weight: 500;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--hover-bg);
  color: var(--danger);
}

/* ---- 工具栏 ---- */
.modal-toolbar {
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

/* ---- 内容区 ---- */
.modal-body {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.modal-textarea {
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
  overflow-y: auto;
}

.modal-textarea::placeholder {
  color: var(--text-muted);
}

/* ---- 底部 ---- */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--glass-border);
  flex-shrink: 0;
  background: var(--bg-elevated);
}

.btn-cancel {
  padding: 8px 18px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: var(--hover-bg);
  color: var(--text);
  border-color: var(--accent-dim);
}

.btn-save {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-save:hover:not(:disabled) {
  opacity: 0.92;
  box-shadow: 0 4px 14px var(--accent-glow);
}

.btn-save:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* ---- 响应式 ---- */
@media (max-width: 600px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-container {
    max-height: 92vh;
  }

  .modal-header {
    padding: 12px 16px;
  }

  .modal-body {
    padding: 0;
  }

  .modal-textarea {
    padding: 16px;
  }

  .modal-footer {
    padding: 12px 16px;
  }
}
</style>
