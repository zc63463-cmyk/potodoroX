// ============================================================
// PomodoroX - 应用入口
// ============================================================

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./style.css";

const app = createApp(App);

// 安装 Pinia 状态管理
const pinia = createPinia();
app.use(pinia);

// 安装路由
app.use(router);

// 挂载应用
app.mount("#app");

// 注册 Service Worker（仅浏览器环境）
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service Worker 注册失败不影响正常使用
    });
  });
}

// 捕获 Vite 预加载错误（部署更新导致资源失效）
window.addEventListener("vite:preloadError", () => {
  window.location.reload();
});
