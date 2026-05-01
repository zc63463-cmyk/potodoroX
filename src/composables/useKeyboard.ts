// ============================================================
// PomodoroX - 键盘快捷键 Composable
// ============================================================

import { onMounted, onUnmounted } from 'vue'
import type { ViewName } from '@/types'

interface KeyboardShortcutsOptions {
  /** 视图导航回调 */
  onNavigate?: (view: ViewName) => void
  /** 新建任务回调 */
  onNewTask?: () => void
  /** 开始/暂停计时器回调 */
  onToggleTimer?: () => void
  /** 重置计时器回调 */
  onResetTimer?: () => void
  /** 全局搜索回调 */
  onGlobalSearch?: () => void
  /** 关闭模态框回调 */
  onCloseModal?: () => void
  /** 是否启用快捷键 */
  enabled?: () => boolean
}

/**
 * 键盘快捷键 composable
 * @param options 快捷键回调配置
 */
export function useKeyboard(options: KeyboardShortcutsOptions = {}) {
  const {
    onNavigate,
    onNewTask,
    onToggleTimer,
    onResetTimer,
    onGlobalSearch,
    onCloseModal,
    enabled = () => true,
  } = options

  /**
   * 键盘事件处理
   */
  function handleKeyDown(event: KeyboardEvent) {
    // 如果快捷键被禁用，不处理
    if (!enabled()) return

    // 如果焦点在输入框中，不处理大部分快捷键
    const target = event.target as HTMLElement
    const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

    // Escape 始终处理
    if (event.key === 'Escape') {
      event.preventDefault()
      onCloseModal?.()
      return
    }

    // 输入框聚焦时只处理 Escape
    if (isInputFocused) return

    const ctrl = event.ctrlKey || event.metaKey

    // Ctrl+1~5: 导航视图
    if (ctrl && event.key >= '1' && event.key <= '5') {
      event.preventDefault()
      const viewMap: Record<string, ViewName> = {
        '1': 'timer',
        '2': 'tasks',
        '3': 'reflections',
        '4': 'stats',
        '5': 'settings',
      }
      onNavigate?.(viewMap[event.key])
      return
    }

    // Ctrl+N: 新建任务
    if (ctrl && event.key === 'n') {
      event.preventDefault()
      onNewTask?.()
      return
    }

    // Ctrl+Space: 开始/暂停计时器
    if (ctrl && event.code === 'Space') {
      event.preventDefault()
      onToggleTimer?.()
      return
    }

    // Ctrl+R: 重置计时器
    if (ctrl && event.key === 'r') {
      event.preventDefault()
      onResetTimer?.()
      return
    }

    // Ctrl+K: 全局搜索
    if (ctrl && event.key === 'k') {
      event.preventDefault()
      onGlobalSearch?.()
      return
    }
  }

  // ---- 生命周期 ----
  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
}
