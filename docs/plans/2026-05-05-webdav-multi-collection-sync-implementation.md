# WebDAV 多集合同步实施计划

基于设计文档 `docs/specs/2026-05-05-webdav-multi-collection-sync-design.md`

## 任务分解

### 1. Schema 变更：Session 类型加 updatedAt

**文件**：`src/types/index.ts`

**操作**：

- 在 `Session` 接口中添加 `updatedAt: string` 字段
- 位置在 `synced: boolean` 之后

**验证**：`pnpm run typecheck` 通过

---

### 2. db 层维护 Session 的 updatedAt

**文件**：`src/services/database.ts`

**操作**：

- 修改 `createSession`：返回的 Session 对象包含 `updatedAt: now()`
- 修改 `updateSession`：更新时设置 `updatedAt: now()`
- 修改 `getAllSessions`：懒迁移逻辑
  ```ts
  if (session.updatedAt === undefined) {
    session.updatedAt = session.endedAt ?? session.startedAt;
  }
  ```

**验证**：`pnpm run typecheck` 通过

---

### 3. WebDAV Composable 重构

**文件**：`src/composables/useWebDavSync.ts`

**操作**：

#### 3.1 添加导入

- 导入 `Session` 类型
- 导入 `useSessionStore`（如果需要）

#### 3.2 定义新类型和常量

```ts
interface SyncTypeResult {
  type: "reflections" | "sessions";
  pushed: number;
  pulled: number;
  error?: string;
}

const REMOTE_PATHS = {
  reflections: "pomodorox/reflections.json",
  sessions: "pomodorox/sessions.json",
};
```

#### 3.3 提取共享底层函数

- `pushFile(path: string, content: string): Promise<boolean>`
- `pullFile(path: string): Promise<string | null>`
- `ensureRemoteDir(): Promise<void>`
- `mergeById<T extends { id: string }>(local: T[], remote: T[], getTimestamp: (e: T) => string): { merged: T[]; pulled: number }`

#### 3.4 实现新公共方法

- `syncReflections(items: Reflection[]): Promise<SyncTypeResult>`
- `syncSessions(items: Session[]): Promise<SyncTypeResult>`

每个方法内部流程：

1. `ensureRemoteDir()`
2. `pullFile(REMOTE_PATHS[type])` + JSON.parse
3. `mergeById(local, remote, e => e.updatedAt)`
4. `pushFile(REMOTE_PATHS[type], JSON.stringify(merged, null, 2))`

#### 3.5 移除旧 API

- 移除 `pushReflections(reflections)`
- 移除 `pullReflections()`
- 移除 `sync(reflections)`

**验证**：`pnpm run typecheck` 通过

---

### 4. SettingsView UI 更新

**文件**：`src/views/SettingsView.vue`

**操作**：

#### 4.1 添加状态

```ts
const syncTypes = ref<Array<"reflections" | "sessions">>([
  "reflections",
  "sessions",
]);
```

#### 4.2 添加同步类型多选框

在密码输入框后、同步按钮前插入：

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

#### 4.3 更新同步按钮禁用条件

```vue
:disabled="webDav.isSyncing.value || !canTestWebDav || syncTypes.length === 0"
```

#### 4.4 重写 onSync 函数

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

#### 4.5 添加 CSS

```css
.checkbox-group {
  display: flex;
  gap: 12px;
  margin: 12px 0;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.checkbox-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}
```

**验证**：`pnpm run typecheck` 通过

---

### 5. 测试

#### 5.1 新增单测：mergeById

**文件**：`src/composables/__tests__/useWebDavSync.test.ts`

**操作**：

- 测试本地缺、远端有
- 测试远端缺、本地有
- 测试双方都有但 timestamp 各种情况
- 测试空数组

#### 5.2 新增单测：syncReflections

**操作**：

- Mock fetch 返回远程数据
- 调用 `syncReflections`
- 验证返回的 SyncTypeResult

#### 5.3 新增单测：syncSessions

**操作**：

- Mock fetch 返回远程数据
- 调用 `syncSessions`
- 验证返回的 SyncTypeResult

#### 5.4 修改现有单测

**操作**：

- 将现有 `sync(reflections)` 测试改为调用 `syncReflections`

**验证**：`pnpm test` 通过

---

### 6. 验证

**操作**：

- `pnpm run typecheck`
- `pnpm run build`
- 手测：
  - 勾选"反思"同步，验证只同步 reflections
  - 勾选"番茄记录"同步，验证只同步 sessions
  - 两者都勾选，验证两者都同步
  - 都不勾选，验证按钮禁用
  - 验证 toast 消息格式正确

---

## 执行顺序

按任务编号 1 → 2 → 3 → 4 → 5 → 6 顺序执行
