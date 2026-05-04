# 项目全面审查报告

## 审查范围

针对所有源文件、配置文件、依赖关系、构建验证。

## 发现的问题

### 🔴 P0 — 构建阻断

**App.vue 中文编码损坏**
- 症状：`pnpm run build` 报 SyntaxError，Chinese chars 变为乱码（如 `涓撴敞` 应为 `专注`）
- 根因：文件保存时使用了错误的字符编码（UTF-8 BOM 被误解码为其他编码）
- 修复：用 UTF-8 重写整个 `src/App.vue`，恢复所有中文标签/注释/样式注释

### 🟡 P2 — 代码质量

| 问题 | 文件 | 修复 |
|------|------|------|
| `minInputRef` 声明但未使用 | `src/views/TimerView.vue` | 删除声明 |
| `@vitejs/plugin-vue` 在 dependencies 而非 devDependencies | `package.json` | 迁移到 devDependencies |

### 🟢 P3 — 配置

| 问题 | 修复 |
|------|------|
| `.gitignore` 缺少 `.playwright-cli/` | 添加 |
| `.gitignore` 缺少 `src-tauri/gen/` | 添加 |

## 验证结果

| 检查项 | 状态 |
|--------|------|
| `pnpm run build` (tsc + vite build) | ✅ 通过 |
| `pnpm test` (35 tests) | ✅ 全部通过 |
| `vue-tsc --noEmit` | ✅ （已作为 build 脚本一部分） |
