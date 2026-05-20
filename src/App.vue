<script setup lang="ts">
import { onMounted, onUnmounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAppStore } from "@/stores/app";
import { useSettingsStore } from "@/stores/settings";
import { useSyncStore } from "@/stores/sync";
import { useKeyboard } from "@/composables/useKeyboard";
import ToastContainer from "@/components/ToastContainer.vue";
import GlobalSearch from "@/components/GlobalSearch.vue";
import type { ViewName } from "@/types";

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const settingsStore = useSettingsStore();
const syncStore = useSyncStore();

// ---- 底部导航配置 ----
const navItems = [
  {
    name: "timer" as ViewName,
    path: "/",
    label: "专注",
    icon: "focus",
    shortcut: "Ctrl+1",
  },
  {
    name: "tasks" as ViewName,
    path: "/tasks",
    label: "任务",
    icon: "tasks",
    shortcut: "Ctrl+2",
  },
  {
    name: "reflections" as ViewName,
    path: "/reflections",
    label: "反思",
    icon: "journal",
    shortcut: "Ctrl+3",
  },
  {
    name: "stats" as ViewName,
    path: "/stats",
    label: "统计",
    icon: "stats",
    shortcut: "Ctrl+4",
  },
  {
    name: "settings" as ViewName,
    path: "/settings",
    label: "设置",
    icon: "settings",
    shortcut: "Ctrl+5",
  },
];

/** 当前激活的导航项 */
const activeNav = computed(() => {
  return navItems.find((item) => item.path === route.path) ?? null;
});

/** 导航到指定视图 */
function navigateTo(view: ViewName) {
  const item = navItems.find((n) => n.name === view);
  if (item) {
    router.push(item.path);
    appStore.navigateTo(view);
  }
}

// ---- 键盘快捷键 ----
useKeyboard({
  onNavigate: navigateTo,
  onCloseModal: () => {
    appStore.closeModal();
    appStore.closeGlobalSearch();
  },
  // 注意：Ctrl+K 全局搜索由 GlobalSearch.vue 自身监听，此处不重复注册
});

// ---- 页面可见性变化自动同步 ----
function handleVisibilityChange() {
  if (document.visibilityState === "visible") {
    syncStore.backgroundPull().catch(() => {});
  }
}

// ---- 网络状态变化 ----
let onlineDebounceTimer: ReturnType<typeof setTimeout> | null = null;
function handleOnline() {
  appStore.isOnline = true;
  if (onlineDebounceTimer) clearTimeout(onlineDebounceTimer);
  onlineDebounceTimer = setTimeout(() => {
    if (import.meta.env.DEV) console.log("[App] 网络恢复，触发同步");
    syncStore.backgroundPull().catch(() => {});
  }, 300);
}
function handleOffline() {
  appStore.isOnline = false;
}

// ---- 初始化 ----
onMounted(async () => {
  await settingsStore.loadSettings();

  // 启动时后台同步（WebDAV 已配置且在线时自动触发）
  syncStore.backgroundPull().catch(() => {});

  // 页面切回前台时自动同步
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // 网络状态监听
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  const currentNav = navItems.find((item) => item.path === route.path);
  if (currentNav) {
    appStore.navigateTo(currentNav.name);
  }
});

onUnmounted(() => {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  window.removeEventListener("online", handleOnline);
  window.removeEventListener("offline", handleOffline);
  if (onlineDebounceTimer) clearTimeout(onlineDebounceTimer);
});

// ---- SVG 图标渲染函数 ----
function renderIcon(name: string, active: boolean) {
  const color = active ? "currentColor" : "currentColor";
  const opacity = active ? "1" : "0.5";

  switch (name) {
    case "focus":
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:${opacity}"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    case "tasks":
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:${opacity}"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`;
    case "journal":
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:${opacity}"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
    case "stats":
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:${opacity}"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>`;
    case "settings":
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:${opacity}"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.67 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.67a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`;
    default:
      return "";
  }
}
</script>

<template>
  <div
    class="app-container"
    :class="{ 'immersive-mode': appStore.immersiveMode }"
  >
    <!-- 顶部栏 -->
    <header class="top-bar">
      <div class="top-bar-left">
        <span class="app-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="var(--accent)"
              stroke-width="2"
            />
            <circle cx="12" cy="12" r="3" fill="var(--accent)" />
            <path
              d="M12 2v4M12 18v4M2 12h4M18 12h4"
              stroke="var(--accent)"
              stroke-width="1.5"
              opacity="0.5"
            />
          </svg>
        </span>
        <span class="app-title">PomodoroX</span>
      </div>
      <div class="top-bar-right">
        <button
          class="search-trigger"
          title="全局搜索 (Ctrl+K)"
          @click="appStore.toggleGlobalSearch()"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span class="search-hint">Ctrl K</span>
        </button>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <div class="router-wrapper">
        <router-view v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </div>
    </main>

    <!-- 底部导航栏 -->
    <nav class="bottom-nav" role="navigation" aria-label="主导航">
      <button
        v-for="item in navItems"
        :key="item.name"
        class="nav-item"
        :class="{ active: activeNav?.name === item.name }"
        :aria-current="activeNav?.name === item.name ? 'page' : undefined"
        @click="navigateTo(item.name)"
      >
        <span
          class="nav-icon"
          v-html="renderIcon(item.icon, activeNav?.name === item.name)"
        />
        <span class="nav-label">{{ item.label }}</span>
        <span v-if="activeNav?.name === item.name" class="nav-indicator" />
      </button>
    </nav>

    <!-- Toast 通知容器 -->
    <ToastContainer />

    <!-- 全局搜索 -->
    <GlobalSearch />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: var(--bg);
  color: var(--text);
}

/* ---- 顶部栏 ---- */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  flex-shrink: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--glass-border);
  z-index: 50;
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-title {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--accent), #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.search-trigger:hover {
  border-color: var(--accent);
  color: var(--text);
  background: var(--surface-hover);
}

.search-hint {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  padding: 2px 5px;
  border-radius: 4px;
  background: var(--border);
}

/* ---- 主内容区 ---- */
.main-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  min-height: 0;
}

/* router-view 高度传递：确保各 View 的 height:100% 能基于固定高度生效 */
.router-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.router-wrapper > * {
  flex: 1;
  min-height: 0;
}

/* ---- 底部导航栏 ---- */
.bottom-nav {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 8px 16px calc(8px + env(safe-area-inset-bottom, 0px));
  flex-shrink: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid var(--glass-border);
  z-index: 50;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  border-radius: var(--radius-lg);
  min-width: 64px;
}

.nav-item:hover {
  color: var(--text);
  background: var(--surface-hover);
}

.nav-item.active {
  color: var(--accent);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-spring);
}

.nav-item.active .nav-icon {
  transform: translateY(-2px);
}

.nav-label {
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: all var(--transition-fast);
}

.nav-indicator {
  position: absolute;
  bottom: 2px;
  width: 20px;
  height: 3px;
  border-radius: 2px;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent-glow);
}

/* ---- 页面过渡动画 ---- */
.page-enter-active,
.page-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* ---- 响应式 ---- */
@media (max-width: 640px) {
  .top-bar {
    padding: 8px 12px;
    height: var(--topbar-height-mobile, 44px);
  }

  .app-title {
    font-size: 0.95rem;
  }

  .search-trigger {
    padding: 4px 8px;
    min-width: var(--touch-target-min, 44px);
    min-height: var(--touch-target-min, 44px);
    justify-content: center;
  }

  .search-hint {
    display: none;
  }

  .bottom-nav {
    padding: 4px 8px calc(4px + env(safe-area-inset-bottom, 0px));
  }

  .nav-item {
    padding: 4px 8px;
    min-width: 48px;
    min-height: var(--touch-target-min, 44px);
  }

  .nav-icon svg {
    width: 20px;
    height: 20px;
  }

  .nav-label {
    font-size: 0.6rem;
  }

  .nav-indicator {
    width: 16px;
    height: 2px;
  }

  /* 页面过渡简化 - 移动端轻量化 */
  .page-enter-active,
  .page-leave-active {
    transition: opacity 0.15s ease;
    transform: none;
  }

  .page-enter-from {
    opacity: 0;
    transform: none;
  }

  .page-leave-to {
    opacity: 0;
    transform: none;
  }
}

@media (min-width: 641px) and (max-width: 1023px) {
  .top-bar {
    padding: 10px 16px;
  }

  .nav-item {
    padding: 5px 12px;
    min-width: 56px;
  }
}

@media (min-width: 1024px) {
  .bottom-nav {
    padding: 10px 32px calc(10px + env(safe-area-inset-bottom, 0px));
  }

  .nav-item {
    padding: 8px 24px;
    min-width: 80px;
  }
}

/* ---- 沉浸模式（移动端全屏计时器） ---- */
.immersive-mode .top-bar,
.immersive-mode .bottom-nav {
  display: none;
}

.immersive-mode .main-content {
  height: 100vh;
}
</style>
