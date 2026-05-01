// ============================================================
// PomodoroX - 全局应用状态 Store
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SyncStatus, ViewName } from '@/types'

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
  }
})
