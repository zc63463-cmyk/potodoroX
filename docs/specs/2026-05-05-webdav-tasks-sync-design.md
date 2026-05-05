# WebDAV 任务同步设计文档

将 WebDAV 同步扩展到支持任务（Task），与现有的 reflections 和 sessions 同步保持一致的架构和合并策略。

## 范围

- WebDAV composable 添加 `syncTasks` 方法
- 远程文件：`pomodorox/tasks.json`
- SettingsView UI 添加"任务"复选框
- 合并策略：基于 `updatedAt` 的 last-write-wins（与 reflections/sessions 一致）

## 设计决策

### 合并策略

采用 last-write-wins 策略，基于 `updatedAt` 字段：

- 本地与远程按 id 合并，保留 `updatedAt` 更新的版本
- 与现有 Reflection 和 Session 同步策略完全一致
- Task 类型已有 `updatedAt` 字段，无需 schema 变更

### API 设计

扩展现有架构：

```ts
// src/composables/useWebDavSync.ts
const REMOTE_PATHS = {
  reflections: "pomodorox/reflections.json",
  sessions: "pomodorox/sessions.json",
  tasks: "pomodorox/tasks.json", // 新增
};

interface SyncTypeResult {
  type: "reflections" | "sessions" | "tasks"; // 扩展
  pushed: number;
  pulled: number;
  error?: string;
}

async function syncTasks(items: Task[]): Promise<SyncTypeResult>;
```

`syncTasks` 内部流程与 `syncReflections`/`syncSessions` 完全一致：

1. `ensureRemoteDir()` — 确保远程目录存在
2. `pullFile(REMOTE_PATHS.tasks)` + JSON.parse
3. `mergeById(local, remote, e => e.updatedAt)` — 按 updatedAt 择新
4. `pushFile(REMOTE_PATHS.tasks, JSON.stringify(merged, null, 2))`

复用共享函数 `mergeById`，无需新增底层逻辑。

## UI 变更（SettingsView）

### 同步类型多选

```vue
<div class="checkbox-group">
  <label class="checkbox-item">
    <input type="checkbox" value="reflections" v-model="syncTypes" />
    <span>反思</span>
  </label>
  <label class="checkbox-item">
    <input type="checkbox" value="sessions" v-model="syncTypes" />
    <span>番茄记录</span>
  </label>
  <label class="checkbox-item">
    <input type="checkbox" value="tasks" v-model="syncTypes" />
    <span>任务</span>
  </label>
</div>
```

### 状态

```ts
const syncTypes = ref<Array<"reflections" | "sessions" | "tasks">>([
  "reflections",
  "sessions",
  "tasks", // 新增，默认勾选
]);
```

### syncWebDav 编排

```ts
async function syncWebDav() {
  saveWebDavConfig();
  const tasks: Promise<SyncTypeResult>[] = [];

  if (syncTypes.value.includes("reflections")) {
    const reflectionStore = useReflectionStore();
    await reflectionStore.loadReflections();
    tasks.push(webDav.syncReflections(reflectionStore.reflections));
  }

  if (syncTypes.value.includes("sessions")) {
    const sessionStore = useSessionStore();
    await sessionStore.loadAllSessions();
    tasks.push(webDav.syncSessions(sessionStore.sessions));
  }

  if (syncTypes.value.includes("tasks")) {
    const taskStore = useTaskStore();
    await taskStore.loadTasks();
    tasks.push(webDav.syncTasks(taskStore.tasks));
  }

  const results = await Promise.allSettled(tasks);
  // 现有聚合逻辑无需修改
}
```

## 错误处理与消息聚合

使用现有的 `Promise.allSettled` 聚合逻辑，自动支持 tasks。

### Toast 文本规则

- **全成功**：`同步完成：反思 推 5/拉 2，番茄记录 推 30/拉 10，任务 推 8/拉 3`
- **部分失败**：`同步完成：反思 推 5/拉 2；任务失败：网络超时`
- **全失败**：`同步失败：反思 推送失败；任务 推送失败`

## 测试

### 新增单测

- `syncTasks`：happy path（mock fetch）

### 修改单测

- 无需修改，现有测试框架可复用

## 实施顺序

1. **WebDAV composable**：添加 `syncTasks` 方法 + 扩展 `REMOTE_PATHS` + `SyncTypeResult` 类型
2. **SettingsView**：添加"任务"复选框 + 扩展 `syncTypes` 类型 + `syncWebDav` 添加 tasks 分支
3. **测试**：新增 `syncTasks` 单测
4. **验证**：typecheck + build + 手测
