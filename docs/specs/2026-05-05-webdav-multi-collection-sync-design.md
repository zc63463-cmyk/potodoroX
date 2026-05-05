# WebDAV 多集合同步设计文档

将 WebDAV 同步从仅支持反思扩展到支持反思 + 番茄会话（Session），通过多选框控制同步内容，采用独立的同步方法保证类型安全和错误隔离。

## 范围

- Session schema 增加 `updatedAt` 字段
- db 层维护 Session 的 `updatedAt`
- WebDAV composable 重构为 `syncReflections` / `syncSessions` 两个独立方法
- SettingsView UI 增加同步类型多选框（反思 / 番茄记录）
- GitHub 事件同步保持 append-only，不添加 `session.updated` 事件

## 设计决策

### Session 合并语义

采用 last-write-wins 策略，基于 `updatedAt` 字段：

- 本地与远程按 id 合并，保留 `updatedAt` 更新的版本
- 与现有 Reflection 同步策略一致
- GitHub 事件同步仍为 append-only（不生成 `session.updated` 事件）

### API 设计

采用**方案 B：分别的方法 + 上层编排**

```ts
// WebDAV composable 暴露
async function syncReflections(items: Reflection[]): Promise<SyncTypeResult>;
async function syncSessions(items: Session[]): Promise<SyncTypeResult>;

// SettingsView 编排
const tasks: Promise<SyncTypeResult>[] = [];
if (syncTypes.value.includes("reflections")) {
  await reflectionStore.loadReflections();
  tasks.push(webDav.syncReflections(reflectionStore.reflections));
}
if (syncTypes.value.includes("sessions")) {
  await sessionStore.loadAllSessions();
  tasks.push(webDav.syncSessions(sessionStore.sessions));
}
const results = await Promise.allSettled(tasks);
```

**理由**：

- 每个方法签名清晰、强类型
- 错误隔离：一个失败不影响另一个
- 未来扩展第三种类型不改已有方法签名

### 远程文件布局

每种数据类型独立存储：

- `pomodorox/reflections.json` — Reflection 数组
- `pomodorox/sessions.json` — Session 数组

**理由**：

- 多选框同步时只读写选中的文件，避免不必要的数据传输
- 独立文件更安全，避免误覆盖其他类型数据

## Schema 变更

### Session 类型

```ts
// src/types/index.ts
export interface Session {
  id: string;
  taskId: string | null;
  type: SessionType;
  duration: number;
  completed: boolean;
  startedAt: string;
  endedAt: string | null;
  plan: string;
  completion: string;
  synced: boolean;
  updatedAt: string; // 新增：ISO 字符串
}
```

### db 层维护

```ts
// db.createSession(input): 返回的 Session 包含 updatedAt = now()
// db.updateSession(id, input): 更新时 updatedAt = now()
```

### 老数据兼容

**懒迁移策略**（无数据库迁移脚本）：

- `db.getAllSessions()` 读取时，如果 `updatedAt === undefined`，回填为 `endedAt ?? startedAt`
- 下次写回时持久化新值
- 从 WebDAV 拉取的老数据同样处理

## WebDAV Composable 重构

### 共享底层函数（内部）

```ts
function pushFile(path: string, content: string): Promise<boolean>;
function pullFile(path: string): Promise<string | null>;
function ensureRemoteDir(): Promise<void>; // MKCOL pomodorox/
function mergeById<T extends { id: string }>(
  local: T[],
  remote: T[],
  getTimestamp: (e: T) => string
): { merged: T[]; pulled: number };
```

### 公共方法

```ts
const REMOTE_PATHS = {
  reflections: "pomodorox/reflections.json",
  sessions: "pomodorox/sessions.json",
};

interface SyncTypeResult {
  type: "reflections" | "sessions";
  pushed: number;
  pulled: number;
  error?: string;
}

async function syncReflections(items: Reflection[]): Promise<SyncTypeResult>;
async function syncSessions(items: Session[]): Promise<SyncTypeResult>;
```

每个 sync 方法内部流程：

1. `ensureRemoteDir()` — 确保远程目录存在
2. `pullFile(REMOTE_PATHS[type])` + JSON.parse
3. `mergeById(local, remote, e => e.updatedAt)` — 按 updatedAt 择新
4. `pushFile(REMOTE_PATHS[type], JSON.stringify(merged, null, 2))`

### 移除的旧 API

- 移除 `pushReflections(reflections)` / `pullReflections()` — 功能合并到 `syncReflections`
- 移除 `sync(reflections)` — 替换为 `syncReflections` / `syncSessions`

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
</div>
```

### 状态

```ts
const syncTypes = ref<Array<"reflections" | "sessions">>([
  "reflections",
  "sessions",
]);
```

**默认两者都勾选**。

### 同步按钮

```vue
<button
  class="btn-primary"
  :disabled="webDav.isSyncing.value || !canTestWebDav || syncTypes.length === 0"
  @click="onSync"
>
  <span>{{ webDav.isSyncing.value ? '同步中...' : '立即同步' }}</span>
</button>
```

### onSync 编排

```ts
async function onSync() {
  saveWebDavConfig();
  const tasks: Promise<SyncTypeResult>[] = [];

  if (syncTypes.value.includes("reflections")) {
    await reflectionStore.loadReflections();
    tasks.push(webDav.syncReflections(reflectionStore.reflections));
  }

  if (syncTypes.value.includes("sessions")) {
    await sessionStore.loadAllSessions();
    tasks.push(webDav.syncSessions(sessionStore.sessions));
  }

  const results = await Promise.allSettled(tasks);

  // 聚合 toast 消息
  const success = results.filter(
    (r) => r.status === "fulfilled" && !r.value.error
  );
  const failures = results.filter(
    (r) =>
      r.status === "rejected" || (r.status === "fulfilled" && r.value.error)
  );

  if (failures.length === 0) {
    const parts = results
      .map((r) => `${r.value.type} 推${r.value.pushed}/拉${r.value.pulled}`)
      .join("，");
    appStore.showToast(`同步完成：${parts}`, "success");
  } else if (success.length > 0) {
    const successParts = success
      .map((r) => `${r.value.type} 推${r.value.pushed}/拉${r.value.pulled}`)
      .join("，");
    const failParts = failures
      .map((r) => (r.status === "rejected" ? r.reason.message : r.value.error))
      .join("；");
    appStore.showToast(`同步完成：${successParts}；${failParts}`, "success");
  } else {
    const failParts = failures
      .map((r) => (r.status === "rejected" ? r.reason.message : r.value.error))
      .join("；");
    appStore.showToast(`同步失败：${failParts}`, "error");
  }
}
```

## 错误处理与消息聚合

使用 `Promise.allSettled` 保证一个失败不影响另一个。

### Toast 文本规则

- **全成功**：`同步完成：反思 推 5/拉 2，会话 推 30/拉 10`
- **部分失败**：`同步完成：反思 推 5/拉 2；会话失败：网络超时`（半成功视为 success toast）
- **全失败**：`同步失败：反思 推送失败；会话 推送失败`（error toast）

## 测试

### 新增单测

- `mergeById`：本地缺、远端缺、双方都有但 timestamp 各种情况、空数组
- `syncReflections`：happy path（mock fetch）
- `syncSessions`：happy path（mock fetch）

### 修改单测

- `useWebDavSync.test.ts`：现有反思 sync 测试从 `sync(reflections)` 改为调用 `syncReflections`

### 不需要测

- UI checkbox 交互（手测够）
- 网络异常路径（已有现成 mock 模式）

## 实施顺序

1. **Schema 变更**：Session 类型加 `updatedAt`
2. **db 层**：`createSession` / `updateSession` 维护 `updatedAt`，`getAllSessions` 懒回填
3. **WebDAV composable**：重构为共享底层 + `syncReflections` / `syncSessions`
4. **SettingsView**：增加多选框 + `onSync` 编排
5. **测试**：新增/修改单测
6. **验证**：typecheck + build + 手测
