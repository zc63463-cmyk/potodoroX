/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { resolve, relative } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { readdir } from "fs/promises";
import { join } from "path";

// ============================================================
// Vite Plugin: PWA Precache Manifest Generator
//
// build 完成后扫描 Vite 输出目录，生成所有静态文件的 URL 列表，
// 注入到 sw.js 的 __PRECACHE_MANIFEST__ 和 __BUILD_TIMESTAMP__ 占位符中
// 输出目录由 Vite 配置决定（默认 dist，命令行 --outDir 可覆盖）
// ============================================================
function pwaPrecachePlugin(): import("vite").Plugin {
  const PLUGIN_NAME = "vite-plugin-pwa-precache";
  let resolvedOutDir: string = "";

  async function collectFiles(dir: string, base: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relPath = "/" + relative(base, fullPath).replace(/\\/g, "/");

      if (entry.isDirectory()) {
        const subFiles = await collectFiles(fullPath, base);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        if (
          entry.name === "sw.js" ||
          entry.name.endsWith(".map") ||
          entry.name === "stats.html"
        ) {
          continue;
        }
        files.push(relPath);
      }
    }

    return files;
  }

  return {
    name: PLUGIN_NAME,
    apply: "build",

    configResolved(config) {
      // 读取 Vite 解析后的输出目录（可能是 dist / dist-web / pomodorox-web 等）
      resolvedOutDir = resolve(config.root, config.build.outDir);
    },

    async closeBundle() {
      if (!resolvedOutDir) {
        console.warn(`[PWA] 无法确定输出目录，跳过 precache manifest 生成`);
        return;
      }
      if (!existsSync(resolvedOutDir)) {
        console.warn(
          `[PWA] 输出目录不存在: ${resolvedOutDir}，跳过 precache manifest 生成`
        );
        return;
      }

      const swPath = join(resolvedOutDir, "sw.js");
      if (!existsSync(swPath)) {
        console.warn(`[PWA] sw.js 不存在于输出目录，跳过注入`);
        return;
      }

      try {
        // 1. 扫描所有需要预缓存的文件
        const assets = await collectFiles(resolvedOutDir, resolvedOutDir);
        // 添加根路径入口（确保 index.html 在最前面）
        const manifest = [
          "/",
          "/index.html",
          ...assets.filter((a) => a !== "/index.html"),
        ];

        console.log(`[PWA] 扫描到 ${manifest.length} 个文件用于预缓存`);

        // 2. 读取 sw.js 并替换占位符
        let swContent = readFileSync(swPath, "utf-8");

        const buildTimestamp = Date.now().toString();
        const manifestJson = JSON.stringify(manifest);

        swContent = swContent.replace(
          /typeof __BUILD_TIMESTAMP__ !== "undefined" \? __BUILD_TIMESTAMP__ : "dev"/g,
          JSON.stringify(buildTimestamp)
        );
        swContent = swContent.replace(
          /typeof __PRECACHE_MANIFEST__ !== "undefined" \? __PRECACHE_MANIFEST__ : \[\]/g,
          manifestJson
        );

        // 3. 写回
        writeFileSync(swPath, swContent, "utf-8");
        console.log(
          `[PWA] ✅ 预缓存清单已注入 sw.js (${manifest.length} 文件, build ${buildTimestamp})`
        );
      } catch (err) {
        console.error("[PWA] ❌ 生成 precache manifest 失败:", err);
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss(), pwaPrecachePlugin()],

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
