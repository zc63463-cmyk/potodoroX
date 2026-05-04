<script setup lang="ts">
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in appStore.toasts"
          :key="toast.id"
          class="toast-item"
          :class="`toast-${toast.type}`"
        >
          <span class="toast-icon">
            {{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : toast.type === 'warning' ? '!' : 'ℹ' }}
          </span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
  min-width: 240px;
  max-width: 360px;
}

.toast-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.toast-message {
  font-size: 0.85rem;
  color: var(--text);
  line-height: 1.4;
}

/* 类型样式 */
.toast-success {
  border-color: rgba(63, 185, 80, 0.3);
}
.toast-success .toast-icon {
  background: rgba(63, 185, 80, 0.15);
  color: #3FB950;
}

.toast-error {
  border-color: rgba(248, 81, 73, 0.3);
}
.toast-error .toast-icon {
  background: rgba(248, 81, 73, 0.15);
  color: #F85149;
}

.toast-warning {
  border-color: rgba(210, 153, 34, 0.3);
}
.toast-warning .toast-icon {
  background: rgba(210, 153, 34, 0.15);
  color: #D29922;
}

.toast-info {
  border-color: rgba(88, 166, 255, 0.3);
}
.toast-info .toast-icon {
  background: rgba(88, 166, 255, 0.15);
  color: #58A6FF;
}

/* 动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ---- 移动端响应式 ---- */
@media (max-width: 640px) {
  .toast-container {
    top: auto;
    right: auto;
    left: 0;
    bottom: calc(60px + env(safe-area-inset-bottom, 0px));
    padding: 0 12px;
    width: 100%;
  }

  .toast-item {
    min-width: 0;
    max-width: 100%;
    width: 100%;
  }
}
</style>
