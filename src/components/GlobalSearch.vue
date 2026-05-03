<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useTaskStore } from '@/stores/task'
import { useReflectionStore } from '@/stores/reflection'

const router = useRouter()
const appStore = useAppStore()
const taskStore = useTaskStore()
const reflectionStore = useReflectionStore()

const query = ref('')
const selectedIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)

// 搜索结果
const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []

  const items: Array<{
    id: string
    type: 'task' | 'reflection'
    title: string
    subtitle: string
    icon: string
    action: () => void
  }> = []

  // 搜索任务
  taskStore.tasks.forEach((task) => {
    if (task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q)) {
      items.push({
        id: `task-${task.id}`,
        type: 'task',
        title: task.title,
        subtitle: task.status === 'done' ? '已完成' : task.status === 'in_progress' ? '进行中' : '待办',
        icon: '📋',
        action: () => {
          router.push('/tasks')
          appStore.closeGlobalSearch()
        },
      })
    }
  })

  // 搜索反思
  reflectionStore.reflections.forEach((reflection) => {
    const preview = reflection.content.slice(0, 50)
    if (preview.toLowerCase().includes(q) || reflection.date.includes(q)) {
      items.push({
        id: `reflection-${reflection.id}`,
        type: 'reflection',
        title: reflection.date,
        subtitle: preview || '无内容',
        icon: '💭',
        action: () => {
          router.push('/reflections')
          appStore.closeGlobalSearch()
        },
      })
    }
  })

  return items.slice(0, 10)
})

// 选中项变化时重置索引
watch(results, () => {
  selectedIndex.value = 0
})

// 键盘导航
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    appStore.closeGlobalSearch()
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const item = results.value[selectedIndex.value]
    if (item) {
      item.action()
    }
  }
}

// 自动聚焦
watch(() => appStore.showGlobalSearch, (show) => {
  if (show) {
    query.value = ''
    selectedIndex.value = 0
    setTimeout(() => inputRef.value?.focus(), 100)
  }
})

// 点击外部关闭
function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    appStore.closeGlobalSearch()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})

function handleGlobalKeydown(e: KeyboardEvent) {
  // Ctrl+K 或 Cmd+K 打开搜索
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    appStore.toggleGlobalSearch()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="search">
      <div
        v-if="appStore.showGlobalSearch"
        class="search-backdrop"
        @click="handleBackdropClick"
      >
        <div class="search-modal" @keydown="handleKeydown">
          <!-- 搜索输入 -->
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              class="search-input"
              placeholder="搜索任务、反思..."
            />
            <span class="search-shortcut">ESC</span>
          </div>

          <!-- 搜索结果 -->
          <div v-if="results.length > 0" class="search-results">
            <div
              v-for="(item, index) in results"
              :key="item.id"
              class="search-result-item"
              :class="{ selected: index === selectedIndex }"
              @click="item.action"
              @mouseenter="selectedIndex = index"
            >
              <span class="result-icon">{{ item.icon }}</span>
              <div class="result-content">
                <div class="result-title">{{ item.title }}</div>
                <div class="result-subtitle">{{ item.subtitle }}</div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else-if="query.trim()" class="search-empty">
            未找到匹配结果
          </div>

          <!-- 提示 -->
          <div class="search-footer">
            <span>↑↓ 导航</span>
            <span>↵ 确认</span>
            <span>ESC 关闭</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.search-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9998;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 120px;
}

.search-modal {
  width: 560px;
  max-width: 90vw;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.search-icon {
  font-size: 1.1rem;
  opacity: 0.6;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 1rem;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-shortcut {
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--hover-bg);
  color: var(--text-tertiary);
  border: 1px solid var(--border);
}

.search-results {
  max-height: 320px;
  overflow-y: auto;
  padding: 8px;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.search-result-item:hover,
.search-result-item.selected {
  background: var(--hover-bg);
}

.result-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: 0.9rem;
  color: var(--text);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-subtitle {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 0.9rem;
}

.search-footer {
  display: flex;
  gap: 16px;
  padding: 12px 20px;
  border-top: 1px solid var(--border);
  font-size: 0.7rem;
  color: var(--text-tertiary);
}

/* 动画 */
.search-enter-active,
.search-leave-active {
  transition: all 0.2s ease;
}

.search-enter-from,
.search-leave-to {
  opacity: 0;
}

.search-enter-from .search-modal,
.search-leave-to .search-modal {
  transform: translateY(-10px) scale(0.98);
}
</style>
