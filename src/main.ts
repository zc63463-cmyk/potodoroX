// ============================================================
// PomodoroX - 应用入口
// ============================================================

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

// 安装 Pinia 状态管理
const pinia = createPinia()
app.use(pinia)

// 安装路由
app.use(router)

// 挂载应用
app.mount('#app')
