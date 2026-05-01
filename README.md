# PomodoroX 🍅

> 沉浸式多端高级番茄时钟 — 以番茄计时为基座，融合任务规划、反思日志、自律统计与知识库导出

## ✨ 特性

- 🍅 **沉浸式番茄计时** — 环形进度 + 动态背景 + 环境音效 + 呼吸灯动画
- 📋 **自由任务规划** — 列表/看板/日历热力图三种视图，支持标签、优先级、截止日期
- 📝 **反思日志** — Markdown 编辑器 + 心情记录 + 快捷模板 + 任务关联
- 📊 **自律统计** — 番茄趋势、时间分布、心情曲线、最佳专注时段
- 📤 **Markdown 导出** — 日报/周报/任务报告，无缝对接 Obsidian/Notion 知识库
- ☁️ **GitHub 同步** — 数据存储在你的 GitHub 仓库，完全掌控，无平台锁定
- 🎨 **主题系统** — 深夜模式 / 晨雾模式 / 日光模式，沉浸式氛围设计
- ⌨️ **快捷键** — Ctrl+Space 开始计时，Ctrl+N 新建任务，Ctrl+K 全局搜索

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | [Tauri v2](https://tauri.app/) |
| 前端框架 | [Vue 3](https://vuejs.org/) + TypeScript |
| 构建工具 | [Vite](https://vite.dev/) |
| 状态管理 | [Pinia](https://pinia.vuejs.org/) |
| 样式方案 | [Tailwind CSS v4](https://tailwindcss.com/) |
| 本地存储 | SQLite (tauri-plugin-sql) |
| 远程同步 | GitHub REST API (octokit) |
| 音频 | Web Audio API (程序化生成) |

## 📁 项目结构

```
pomodorox/
├── src/                          # Vue 3 前端
│   ├── assets/                   # 静态资源
│   ├── components/               # 通用组件
│   ├── composables/              # Vue Composables
│   │   ├── useTimer.ts           # 时间戳计时器
│   │   ├── useAudio.ts           # Web Audio API 音效
│   │   ├── useKeyboard.ts        # 键盘快捷键
│   │   └── useNotification.ts    # 系统通知
│   ├── services/                 # 服务层
│   │   ├── database.ts           # SQLite 数据操作（含内存回退）
│   │   ├── github.ts             # GitHub API 同步
│   │   └── export.ts             # Markdown 导出
│   ├── stores/                   # Pinia 状态管理
│   │   ├── app.ts                # 全局应用状态
│   │   ├── settings.ts           # 用户设置
│   │   ├── timer.ts              # 计时器状态
│   │   ├── task.ts               # 任务管理
│   │   └── reflection.ts         # 反思管理
│   ├── types/                    # TypeScript 类型定义
│   ├── utils/                    # 工具函数
│   ├── views/                    # 页面视图
│   │   ├── TimerView.vue         # 番茄计时器（首页）
│   │   ├── TasksView.vue         # 任务管理
│   │   ├── ReflectionsView.vue   # 反思日志
│   │   ├── StatsView.vue         # 自律统计
│   │   └── SettingsView.vue      # 设置
│   ├── router/                   # 路由配置
│   ├── App.vue                   # 根组件
│   ├── main.ts                   # 入口文件
│   └── style.css                 # 全局样式 + 主题变量
├── src-tauri/                    # Tauri Rust 后端
│   ├── src/
│   │   ├── lib.rs                # 主入口 + 插件注册
│   │   └── main.rs               # 程序入口
│   ├── capabilities/             # 权限配置
│   ├── icons/                    # 应用图标
│   ├── Cargo.toml                # Rust 依赖
│   ├── tauri.conf.json           # Tauri 配置
│   └── build.rs                  # 构建脚本
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🚀 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 8
- [Rust](https://www.rust-lang.org/tools/install) >= 1.77
- [Tauri Prerequisites](https://tauri.app/start/prerequisites/)

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/YOUR_USERNAME/pomodorox.git
cd pomodorox

# 安装前端依赖
pnpm install

# 开发模式（仅前端，浏览器预览）
pnpm dev

# 开发模式（Tauri 桌面应用）
pnpm tauri dev

# 构建生产版本
pnpm tauri build
```

### 仅前端开发

项目支持纯浏览器开发模式（无需 Rust 环境）：

```bash
pnpm dev
# 打开 http://localhost:5173
# 数据自动使用内存存储回退
```

## 🎨 主题预览

| 主题 | 背景色 | 强调色 | 适用场景 |
|------|--------|--------|----------|
| 深夜模式 | `#0D1117` | `#58A6FF` | 默认主题，最低干扰 |
| 晨雾模式 | `#1A1A2E` | `#E94560` | 深色基调，微暖色调 |
| 日光模式 | `#F8F9FA` | `#FF6B35` | 白天使用，明亮清新 |

## ☁️ GitHub 数据同步

PomodoroX 使用你的 GitHub 仓库作为数据存储，数据结构如下：

```
your-repo/
└── .pomodorox/
    ├── config.json          # 用户配置
    ├── tasks/2026/05.json   # 按月存储任务
    ├── reflections/2026/05.json
    ├── sessions/2026/05.json
    └── exports/             # 导出的 Markdown 文件
```

### 配置步骤

1. 在 [GitHub Settings](https://github.com/settings/tokens) 创建 Personal Access Token
2. 权限只需勾选 `repo` (Full control of private repositories)
3. 在 PomodoroX 设置页面填入 Token、Owner、Repo 名称
4. 点击"测试连接"验证

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + Space` | 开始/暂停计时 |
| `Ctrl + 1~5` | 切换页面 |
| `Ctrl + N` | 新建任务 |
| `Ctrl + R` | 重置计时器 |
| `Ctrl + K` | 全局搜索 |
| `Escape` | 关闭弹窗 |

## 📐 架构设计

- **数据层**: 本地 SQLite 优先 + GitHub 异步同步，离线完全可用
- **计时器**: 基于 `Date.now()` 时间戳方案，不受 WebView 后台节流影响
- **状态管理**: Pinia Setup Store 管理状态，Composables 封装业务逻辑
- **UI**: Tailwind CSS + CSS 变量主题系统，纯 CSS/SVG 图表（零外部图表库）

## 📄 License

MIT
