# 反思导出与同步实施计划

**基于**: `docs/specs/2026-05-05-reflection-export-sync-design.md`

---

## 任务清单

### Phase 1: 工具函数
- [ ] `src/utils/platform.ts` — Tauri 环境检测
- [ ] `src/utils/exportReflection.ts` — Markdown/JSON 导出
- [ ] `src/utils/importReflection.ts` — Markdown/JSON 导入 + 冲突检测

### Phase 2: UI 导出按钮
- [ ] `ReflectionEditor.vue` — 编辑页顶部导出按钮
- [ ] `ReflectionDetailModal.vue` — 浏览 Modal 底部导出按钮

### Phase 3: UI 导入
- [ ] `SettingsView.vue` — 数据管理区增加导入区域
- [ ] `SettingsView.vue` — 冲突处理弹窗

### Phase 4: WebDAV 同步
- [ ] `src/composables/useWebDavSync.ts` — WebDAV 客户端 + 同步逻辑
- [ ] `SettingsView.vue` — WebDAV 配置面板（Tauri 独占）

### Phase 5: 验证
- [ ] `pnpm run typecheck` — TypeScript 类型检查
- [ ] `pnpm run build:web` — 生产构建
- [ ] 导出/导入功能端到端测试

---

## 验证命令

```bash
pnpm run typecheck
pnpm run build:web
```
