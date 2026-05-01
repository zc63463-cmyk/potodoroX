// ============================================================
// PomodoroX - Vue Router 配置
// ============================================================

import { createRouter, createWebHistory } from 'vue-router'

// 视图组件（懒加载）
const TimerView = () => import('@/views/TimerView.vue')
const TasksView = () => import('@/views/TasksView.vue')
const ReflectionsView = () => import('@/views/ReflectionsView.vue')
const StatsView = () => import('@/views/StatsView.vue')
const SettingsView = () => import('@/views/SettingsView.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'timer',
      component: TimerView,
      meta: { title: '计时器', icon: '⏱️' },
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: TasksView,
      meta: { title: '任务', icon: '📋' },
    },
    {
      path: '/reflections',
      name: 'reflections',
      component: ReflectionsView,
      meta: { title: '反思', icon: '💭' },
    },
    {
      path: '/stats',
      name: 'stats',
      component: StatsView,
      meta: { title: '统计', icon: '📊' },
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { title: '设置', icon: '⚙️' },
    },
  ],
})

// 路由守卫：更新页面标题
router.beforeEach((to) => {
  const title = (to.meta.title as string) || 'PomodoroX'
  document.title = `${title} - PomodoroX`
})

export default router
