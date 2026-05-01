<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useSettingsStore } from '@/stores/settings'
import { useKeyboard } from '@/composables/useKeyboard'
import type { ViewName } from '@/types'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const settingsStore = useSettingsStore()

// ---- 侧边栏导航配置 ----
const navItems = [
  { name: 'timer' as ViewName, path: '/', label: '计时器', icon: '⏱️', shortcut: 'Ctrl+1' },
  { name: 'tasks' as ViewName, path: '/tasks', label: '任务', icon: '📋', shortcut: 'Ctrl+2' },
  { name: 'reflections' as ViewName, path: '/reflections', label: '反思', icon: '💭', shortcut: 'Ctrl+3' },
  { name: 'stats' as ViewName, path: '/stats', label: '统计', icon: '📊', shortcut: 'Ctrl+4' },
  { name: 'settings' as ViewName, path: '/settings', label: '设置', icon: '⚙️', shortcut: 'Ctrl+5' },
]

/** 当前激活的导航项 */
const activeNav = computed(() => {
  return navItems.find((item) => item.path === route.path) || navItems[0]
})

/** 导航到指定视图 */
function navigateTo(view: ViewName) {
  const item = navItems.find((n) => n.name === view)
  if (item) {
    router.push(item.path)
    appStore.navigateTo(view)
  }
}

// ---- 键盘快捷键 ----
useKeyboard({
  onNavigate: navigateTo,
  onCloseModal: () => {
    appStore.closeModal()
    appStore.closeGlobalSearch()
  },
  onGlobalSearch: () => {
    appStore.toggleGlobalSearch()
  },
})

// ---- 初始化 ----
onMounted(async () => {
  // 加载设置
  await settingsStore.loadSettings()
  // 同步当前视图状态
  const currentNav = navItems.find((item) => item.path === route.path)
  if (currentNav) {
    appStore.navigateTo(currentNav.name)
  }
})
</script>

<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <aside
      class="sidebar"
      :class="{ collapsed: appStore.sidebarCollapsed }"
    >
      <!-- Logo / 标题 -->
      <div class="sidebar-header">
        <span v-if="!appStore.sidebarCollapsed" class="sidebar-title">
          PomodoroX
        </span>
        <span v-else class="sidebar-title-short">PX</span>
      </div>

      <!-- 导航菜单 -->
      <nav class="sidebar-nav">
        <button
          v-for="item in navItems"
          :key="item.name"
          class="nav-item"
          :class="{ active: activeNav.name === item.name }"
          :title="appStore.sidebarCollapsed ? `${item.label} (${item.shortcut})` : undefined"
          @click="navigateTo(item.name)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span v-if="!appStore.sidebarCollapsed" class="nav-label">{{ item.label }}</span>
        </button>
      </nav>

      <!-- 底部操作 -->
      <div class="sidebar-footer">
        <!-- 在线/离线状态 -->
        <div class="status-indicator" :title="appStore.isOnline ? '在线' : '离线'">
          <span class="status-dot" :class="{ online: appStore.isOnline, offline: !appStore.isOnline }" />
          <span v-if="!appStore.sidebarCollapsed" class="status-text">
            {{ appStore.isOnline ? '在线' : '离线' }}
          </span>
        </div>

        <!-- 同步状态 -->
        <div
          v-if="appStore.hasPendingSync"
          class="sync-indicator"
          title="有待同步的数据"
        >
          <span class="sync-icon">↻</span>
          <span v-if="!appStore.sidebarCollapsed" class="sync-text">
            {{ appStore.syncStatus.pendingCount }} 项待同步
          </span>
        </div>

        <!-- 折叠按钮 -->
        <button
          class="collapse-btn"
          :title="appStore.sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'"
          @click="appStore.toggleSidebar()"
        >
          <span>{{ appStore.sidebarCollapsed ? '»' : '«' }}</span>
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: var(--bg);
  color: var(--text);
}

/* ---- 侧边栏 ---- */
.sidebar {
  width: 240px;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-right: 1px solid var(--border);
  transition: width 0.3s ease, min-width 0.3s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 64px;
  min-width: 64px;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid var(--border);
  text-align: center;
}

.sidebar-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: -0.02em;
}

.sidebar-title-short {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent);
}

/* ---- 导航 ---- */
.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  white-space: nowrap;
  width: 100%;
  text-align: left;
}

.nav-item:hover {
  background: var(--hover-bg);
  color: var(--text);
}

.nav-item.active {
  background: var(--active-bg);
  color: var(--accent);
  font-weight: 600;
}

.nav-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.nav-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---- 底部 ---- */
.sidebar-footer {
  padding: 12px 8px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.online {
  background: #3fb950;
  box-shadow: 0 0 6px rgba(63, 185, 80, 0.5);
}

.status-dot.offline {
  background: #8b949e;
}

.sync-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  font-size: 0.8rem;
  color: var(--accent);
}

.sync-icon {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  background: var(--hover-bg);
  color: var(--text);
}

/* ---- 主内容区 ---- */
.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
