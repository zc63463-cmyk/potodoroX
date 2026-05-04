// ============================================================
// PomodoroX - 全局应用状态 Store
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SyncStatus, ViewName, ToastType } from '@/types'

export const useAppStore = defineStore('app', () => {
  // ---- 状态 ----
  /** 侧边栏是否折叠 */
  const sidebarCollapsed = ref(false)

  /** 当前视图 */
  const currentView = ref<ViewName>('timer')

  /** 是否在线 */
  const isOnline = ref(navigator.onLine)

  /** 同步状态 */
  const syncStatus = ref<SyncStatus>({
    lastSyncAt: null,
    pendingCount: 0,
    isSyncing: false,
  })

  /** 是否显示全局搜索 */
  const showGlobalSearch = ref(false)

  /** 是否显示模态框 */
  const modalOpen = ref(false)

  /** Toast 通知列表 */
  const toasts = ref<Array<{ id: string; message: string; type: ToastType }>>([])

  /** 计时器沉浸模式（移动端全屏） */
  const immersiveMode = ref(false)

  /** Toast ID 计数器 */
  let toastIdCounter = 0

  // ---- 计算属性 ----
  /** 侧边栏宽度 */
  const sidebarWidth = computed(() => sidebarCollapsed.value ? '64px' : '240px')

  /** 是否有未同步数据 */
  const hasPendingSync = computed(() => syncStatus.value.pendingCount > 0)

  // ---- 方法 ----
  /** 切换侧边栏 */
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  /** 导航到指定视图 */
  function navigateTo(view: ViewName) {
    currentView.value = view
  }

  /** 更新在线状态 */
  function updateOnlineStatus() {
    isOnline.value = navigator.onLine
  }

  /** 设置同步状态 */
  function setSyncStatus(status: Partial<SyncStatus>) {
    syncStatus.value = { ...syncStatus.value, ...status }
  }

  /** 切换全局搜索 */
  function toggleGlobalSearch() {
    showGlobalSearch.value = !showGlobalSearch.value
  }

  /** 关闭全局搜索 */
  function closeGlobalSearch() {
    showGlobalSearch.value = false
  }

  /** 打开模态框 */
  function openModal() {
    modalOpen.value = true
  }

  /** 关闭模态框 */
  function closeModal() {
    modalOpen.value = false
  }

  /** 切换沉浸模式 */
  function toggleImmersiveMode() {
    immersiveMode.value = !immersiveMode.value
  }

  /** 退出沉浸模式 */
  function exitImmersiveMode() {
    immersiveMode.value = false
  }

  /** 显示 Toast 通知 */
  function showToast(message: string, type: ToastType = 'info', duration = 3000) {
    const id = `toast-${++toastIdCounter}`
    toasts.value.push({ id, message, type })

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  /** 移除 Toast */
  function removeToast(id: string) {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  // ---- 初始化 ----
  // 监听在线/离线事件
  if (typeof window !== 'undefined') {
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
  }

  return {
    // 状态
    sidebarCollapsed,
    currentView,
    isOnline,
    syncStatus,
    showGlobalSearch,
    modalOpen,
    toasts,
    immersiveMode,
    // 计算属性
    sidebarWidth,
    hasPendingSync,
    // 方法
    toggleSidebar,
    navigateTo,
    updateOnlineStatus,
    setSyncStatus,
    toggleGlobalSearch,
    closeGlobalSearch,
    openModal,
    closeModal,
    showToast,
    removeToast,
    toggleImmersiveMode,
    exitImmersiveMode,
  }
})
