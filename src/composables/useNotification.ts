// ============================================================
// PomodoroX - 通知 Composable
// 支持 Tauri 通知和浏览器 Notification API
// ============================================================

import { ref } from 'vue'
import { isTauriAvailable } from '@/utils/tauri'

/** 通知权限状态 */
const permissionState = ref<'default' | 'granted' | 'denied' | 'unavailable'>('default')

/**
 * 请求通知权限
 */
export async function requestPermission(): Promise<boolean> {
  try {
    if (isTauriAvailable()) {
      // 使用 Tauri 通知插件
      const { isPermissionGranted, requestPermission } = await import('@tauri-apps/plugin-notification')
      let granted = await isPermissionGranted()
      if (!granted) {
        const permission = await requestPermission()
        granted = permission === 'granted'
      }
      permissionState.value = granted ? 'granted' : 'denied'
      return granted
    } else if ('Notification' in window) {
      // 使用浏览器 Notification API
      const permission = await Notification.requestPermission()
      permissionState.value = permission as 'default' | 'granted' | 'denied'
      return permission === 'granted'
    } else {
      permissionState.value = 'unavailable'
      return false
    }
  } catch (err) {
    console.warn('[Notification] 请求权限失败:', err)
    permissionState.value = 'unavailable'
    return false
  }
}

/**
 * 发送通知
 * @param title 通知标题
 * @param body 通知内容
 * @param options 可选配置
 */
export async function sendNotification(
  title: string,
  body: string,
  options?: {
    icon?: string
    tag?: string
    onClick?: () => void
  }
): Promise<void> {
  try {
    if (isTauriAvailable()) {
      // 使用 Tauri 通知插件
      const { sendNotification: tauriNotify, isPermissionGranted } = await import('@tauri-apps/plugin-notification')
      let granted = await isPermissionGranted()
      if (!granted) {
        granted = await requestPermission()
      }
      if (granted) {
        tauriNotify({
          title,
          body,
          icon: options?.icon,
        })
      }
    } else if ('Notification' in window && Notification.permission === 'granted') {
      // 使用浏览器 Notification API
      const notification = new Notification(title, {
        body,
        icon: options?.icon,
        tag: options?.tag,
        silent: false,
      })

      if (options?.onClick) {
        notification.onclick = options.onClick
      }
    } else {
      // 回退：使用浏览器原生通知前先请求权限
      const granted = await requestPermission()
      if (granted && 'Notification' in window) {
        const notification = new Notification(title, {
          body,
          icon: options?.icon,
          tag: options?.tag,
        })
        if (options?.onClick) {
          notification.onclick = options.onClick
        }
      }
    }
  } catch (err) {
    console.warn('[Notification] 发送通知失败:', err)
  }
}

/**
 * 通知 composable
 */
export function useNotification() {
  return {
    permissionState,
    requestPermission,
    sendNotification,
  }
}
