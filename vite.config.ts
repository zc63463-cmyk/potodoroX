/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],

  // Tauri 生产构建使用相对路径，开发时使用默认绝对路径
  base: process.env.TAURI_ENV_PLATFORM
    ? "./"
    : process.env.VITE_BUILD_WEB
      ? "/"
      : "/",

  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  // 测试配置
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["src/**/*.test.ts"],
    setupFiles: ["src/test-setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/types/**", "src/**/*.d.ts"],
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
      ignored: ["**/src-tauri/**"],
    },
  },

  // 构建配置
  build: {
    // Tauri 使用 Chromium on Windows 和 WebKit on macOS/Linux
    // 使用现代浏览器目标以支持解构等语法
    target:
      process.env.TAURI_ENV_PLATFORM === "windows"
        ? "chrome105"
        : process.env.VITE_BUILD_WEB
          ? "es2015"
          : "safari16",
    // 开发构建时不要 minify，方便调试
    minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
    // 为 Tauri 产出 sourcemap
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
    // 生产构建移除诊断日志，保留 console.error
    esbuild: {
      pure: ["console.log", "console.warn", "console.info", "console.debug"],
    },
  },

  // 环境变量前缀
  envPrefix: ["VITE_", "TAURI_ENV_*"],

  // 保留终端历史输出，不清屏
  clearScreen: false,
});
