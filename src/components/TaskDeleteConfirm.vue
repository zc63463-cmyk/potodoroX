<script setup lang="ts">
// ============================================================
// PomodoroX - 删除确认弹窗
// ============================================================

interface Props {
  visible: boolean
  taskTitle?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

function confirm() {
  emit('confirm')
}

function cancel() {
  emit('cancel')
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    cancel()
  }
}
</script>

<template>
  <Transition name="modal">
    <div v-if="visible" class="modal-overlay" @click.self="cancel">
      <div class="modal-panel small" @keydown="handleKeydown" tabindex="-1">
        <div class="modal-header">
          <h2 class="modal-title">确认删除</h2>
          <button class="modal-close" @click="cancel">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p class="delete-message">
            <template v-if="taskTitle">
              确定要删除任务「{{ taskTitle }}」吗？此操作无法撤销。
            </template>
            <template v-else>
              确定要删除这个任务吗？此操作无法撤销。
            </template>
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cancel">取消</button>
          <button class="btn btn-danger" @click="confirm">删除</button>
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

.modal-panel.small {
  max-width: 400px;
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

/* ---- 删除消息 ---- */
.delete-message {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
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

.btn-danger {
  background: var(--danger);
  color: white;
}

.btn-danger:hover {
  filter: brightness(1.1);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--danger) 30%, transparent);
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
