// ============================================================
// PomodoroX - 应用入口
// ============================================================

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useAppStore } from "./stores/app";
import "./style.css";

const app = createApp(App);

// 安装 Pinia 状态管理
const pinia = createPinia();
app.use(pinia);

// 安装路由
app.use(router);

// ---- 全局错误边界 ----
app.config.errorHandler = (err, _instance, info) => {
  if (import.meta.env.DEV) console.error("[Vue Error]", err, info);
  // 标记已处理，避免 window.onerror 重复显示 Toast
  if (err instanceof Error) {
    (err as unknown as Record<string, unknown>).__vueHandled = true;
  }
  try {
    const appStore = useAppStore();
    appStore.showToast("应用出现错误，建议刷新页面重试", "error", 5000);
  } catch {
    // Pinia 未就绪时静默处理
  }
};

// 捕获全局 JS 错误（过滤已被 Vue errorHandler 处理的错误）
window.addEventListener("error", (event) => {
  if (
    event.error &&
    (event.error as unknown as Record<string, unknown>).__vueHandled
  )
    return;
  if (import.meta.env.DEV) console.error("[Global Error]", event.error);
  try {
    const appStore = useAppStore();
    appStore.showToast("发生未知错误，建议刷新页面", "error", 5000);
  } catch {
    // ignore
  }
});

// 捕获未处理的 Promise 拒绝
window.addEventListener("unhandledrejection", (event) => {
  if (import.meta.env.DEV) console.error("[Unhandled Rejection]", event.reason);
  try {
    const appStore = useAppStore();
    appStore.showToast("异步操作失败，建议刷新页面", "error", 5000);
  } catch {
    // ignore
  }
});

// 挂载应用
app.mount("#app");

// 捕获 Vite 预加载错误（部署更新导致资源失效）
window.addEventListener("vite:preloadError", () => {
  window.location.reload();
});
