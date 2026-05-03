/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  // 测试配置
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/types/**', 'src/**/*.d.ts'],
    },
  },

  // Tauri 开发服务器配置
  // 需要固定端口，以便 Tauri 知道向哪里发送请求
  server: {
    port: 1420,
    strictPort: true,
    host: true,
    watch: {
      // 告知 vite 监听 `src` 目录以外的文件变化
      ignored: ['**/src-tauri/**'],
    },
  },

  // 构建配置
  build: {
    // Tauri 使用 Chromium on Windows 和 WebKit on macOS/Linux
    // 使用现代浏览器目标以支持解构等语法
    target: process.env.TAURI_ENV_PLATFORM === 'windows' ? 'chrome105' : 'safari16',
    // 开发构建时不要 minify，方便调试
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    // 为 Tauri 产出 sourcemap
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },

  // 环境变量前缀
  envPrefix: ['VITE_', 'TAURI_ENV_*'],

  // TypeScript 类型检查
  // 在 build 时禁用，让 tsc 单独处理
  clearScreen: false,
})
