<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useAppStore } from "@/stores/app";
import { useReflectionStore } from "@/stores/reflection";
import { useSessionStore } from "@/stores/session";
import { useSettingsStore } from "@/stores/settings";
import { useSyncStore } from "@/stores/sync";
import { useTaskStore } from "@/stores/task";
import { useTimerStore } from "@/stores/timer";
import type { SyncTypeResult } from "@/composables/useWebDavSync";
import { useWebDavSync } from "@/composables/useWebDavSync";
import { isTauri } from "@/utils/platform";
import type { ImportReflection } from "@/utils/importReflection";
import { parseImportFile } from "@/utils/importReflection";
import type { ThemeName, Reflection, Session, Task } from "@/types";
import { db } from "@/services/database";

// ---- Stores ----
const settingsStore = useSettingsStore();
const appStore = useAppStore();
const taskStore = useTaskStore();
const reflectionStore = useReflectionStore();
const timerStore = useTimerStore();
const syncStore = useSyncStore();
const sessionStore = useSessionStore();

// ---- 状态 ----
const showToken = ref(false);
const isTestingConnection = ref(false);
const testResult = ref<{ success: boolean; message: string } | null>(null);
const isSyncing = ref(false);
const syncResult = ref<{ success: boolean; message: string } | null>(null);
const showClearConfirm = ref(false);
const isExporting = ref(false);
const isImporting = ref(false);
const isClearing = ref(false);
const isImportingReflection = ref(false);
const showConflictModal = ref(false);
const importConflicts = ref<
  Array<{
    date: string;
    incoming: ImportReflection;
    action: "replace" | "skip";
  }>
>([]);
const pendingImportItems = ref<ImportReflection[]>([]);

// ---- WebDAV 同步 ----
const webDav = useWebDavSync();
const webDavUrl = ref("");
const webDavUsername = ref("");
const webDavPassword = ref("");
const isTestingWebDav = ref(false);
const webDavTestResult = ref<{ success: boolean; message: string } | null>(
  null
);
const syncTypes = ref<Array<"reflections" | "sessions" | "tasks">>([
  "reflections",
  "sessions",
  "tasks",
]);

// 初始化 WebDAV 配置
if (webDav.config.value) {
  webDavUrl.value = webDav.config.value.url;
  webDavUsername.value = webDav.config.value.username;
  webDavPassword.value = webDav.config.value.password;
}

/** 是否具备测试连接的最小条件 */
const canTestWebDav = computed(() => {
  return !!(webDavUrl.value && webDavUsername.value);
});

/** 是否可以同步（至少选择一种类型） */
const canSyncWebDav = computed(() => {
  return canTestWebDav.value && syncTypes.value.length > 0;
});

// ---- 本地编辑副本（避免直接修改 store） ----
const localSettings = ref({
  githubToken: "",
  githubRepo: "",
  githubOwner: "",
});

// ---- 主题配置 ----
const themeOptions: {
  name: ThemeName;
  label: string;
  labelEn: string;
  bg: string;
  accent: string;
}[] = [
  {
    name: "dark-night",
    label: "深夜模式",
    labelEn: "Dark Night",
    bg: "#0D1117",
    accent: "#58A6FF",
  },
  {
    name: "morning-mist",
    label: "晨雾模式",
    labelEn: "Morning Mist",
    bg: "#1A1A2E",
    accent: "#E94560",
  },
  {
    name: "daylight",
    label: "日光模式",
    labelEn: "Daylight",
    bg: "#F8F9FA",
    accent: "#FF6B35",
  },
];

// ---- 计算属性 ----

/** 当前主题 */
const currentTheme = computed(() => settingsStore.settings.theme);

/** 是否已配置 GitHub */
const githubConfigured = computed(() => {
  return !!(
    localSettings.value.githubToken &&
    localSettings.value.githubOwner &&
    localSettings.value.githubRepo
  );
});

/** 上次同步时间 */
const lastSyncTime = computed(() => {
  return appStore.syncStatus.lastSyncAt || "从未同步";
});

/** 数据库统计 */
const dbStats = ref({
  tasks: 0,
  sessions: 0,
  reflections: 0,
});

/** 计时器设置（从 store 读取，单位转换） ---- */
const workDuration = computed({
  get: () => Math.round(settingsStore.settings.workDuration / 60),
  set: (v: number) => settingsStore.updateSetting("workDuration", v * 60),
});

const shortBreakDuration = computed({
  get: () => Math.round(settingsStore.settings.shortBreakDuration / 60),
  set: (v: number) => settingsStore.updateSetting("shortBreakDuration", v * 60),
});

const longBreakDuration = computed({
  get: () => Math.round(settingsStore.settings.longBreakDuration / 60),
  set: (v: number) => settingsStore.updateSetting("longBreakDuration", v * 60),
});

const longBreakInterval = computed({
  get: () => settingsStore.settings.longBreakInterval,
  set: (v: number) => settingsStore.updateSetting("longBreakInterval", v),
});

/** 自由计时默认时长 */
const freeDuration = computed({
  get: () => Math.round(settingsStore.settings.freeDuration / 60),
  set: (v: number) => settingsStore.updateSetting("freeDuration", v * 60),
});

// 滑块临时值（@input 更新显示，@change 才写入 store）
const sliderWorkDuration = ref(workDuration.value);
const sliderShortBreak = ref(shortBreakDuration.value);
const sliderLongBreak = ref(longBreakDuration.value);
const sliderFreeDuration = ref(freeDuration.value);

// 同步 store -> slider（store 被其他地方更新时）
watch(workDuration, (v) => {
  sliderWorkDuration.value = v;
});
watch(shortBreakDuration, (v) => {
  sliderShortBreak.value = v;
});
watch(longBreakDuration, (v) => {
  sliderLongBreak.value = v;
});
watch(freeDuration, (v) => {
  sliderFreeDuration.value = v;
});

const autoStartBreak = computed({
  get: () => settingsStore.settings.autoStartBreak,
  set: (v: boolean) => settingsStore.updateSetting("autoStartBreak", v),
});

const autoStartPomodoro = computed({
  get: () => settingsStore.settings.autoStartPomodoro,
  set: (v: boolean) => settingsStore.updateSetting("autoStartPomodoro", v),
});

// ---- Debounce 工具 ----
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/** 延迟写入 store（防抖 500ms） */
const debouncedUpdateToken = debounce((value: string) => {
  settingsStore.updateSetting("githubToken", value);
}, 500);
const debouncedUpdateOwner = debounce((value: string) => {
  settingsStore.updateSetting("githubOwner", value);
}, 500);
const debouncedUpdateRepo = debounce((value: string) => {
  settingsStore.updateSetting("githubRepo", value);
}, 500);

// ---- 方法 ----

/** 更新 GitHub Token */
function updateGithubToken(value: string) {
  localSettings.value.githubToken = value;
  debouncedUpdateToken(value);
}

/** 更新 GitHub Owner */
function updateGithubOwner(value: string) {
  localSettings.value.githubOwner = value;
  debouncedUpdateOwner(value);
}

/** 更新 GitHub Repo */
function updateGithubRepo(value: string) {
  localSettings.value.githubRepo = value;
  debouncedUpdateRepo(value);
}

/** 测试 GitHub 连接 */
async function testConnection() {
  isTestingConnection.value = true;
  testResult.value = null;

  try {
    syncStore.authenticate(localSettings.value.githubToken);
    syncStore.setRepo(
      localSettings.value.githubOwner,
      localSettings.value.githubRepo
    );

    await syncStore.loadSyncStatus();
    testResult.value = {
      success: true,
      message: `连接成功！待同步: ${syncStore.pendingCount} 条`,
    };
  } catch (err) {
    testResult.value = {
      success: false,
      message: err instanceof Error ? err.message : "连接失败",
    };
  } finally {
    isTestingConnection.value = false;
  }
}

/** 执行同步 */
async function syncNow() {
  isSyncing.value = true;
  syncResult.value = null;

  try {
    syncStore.authenticate(localSettings.value.githubToken);
    syncStore.setRepo(
      localSettings.value.githubOwner,
      localSettings.value.githubRepo
    );

    appStore.setSyncStatus({ isSyncing: true });

    const result = await syncStore.fullSyncAction();
    syncResult.value = result;

    // 更新同步状态
    await syncStore.loadSyncStatus();
    appStore.setSyncStatus({
      isSyncing: false,
      lastSyncAt: new Date().toISOString(),
      pendingCount: syncStore.pendingCount,
    });
  } catch (err) {
    syncResult.value = {
      success: false,
      message: err instanceof Error ? err.message : "同步失败",
    };
    appStore.setSyncStatus({ isSyncing: false });
  } finally {
    isSyncing.value = false;
  }
}

/** 选择主题 */
function selectTheme(theme: ThemeName) {
  settingsStore.updateSetting("theme", theme);
}

/** 导出数据 */
async function exportData() {
  isExporting.value = true;
  try {
    const { tasks, reflections, sessions } = await syncStore.exportAllData();

    const data = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      tasks,
      reflections,
      sessions,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pomodorox-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("导出数据失败:", err);
  } finally {
    isExporting.value = false;
  }
}

/** 导入数据 */
async function importData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    isImporting.value = true;
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // 校验 schema
      if (!data.tasks || !data.reflections || !data.sessions) {
        appStore.showToast("无效的备份文件格式", "error");
        return;
      }
      if (
        !Array.isArray(data.tasks) ||
        !Array.isArray(data.reflections) ||
        !Array.isArray(data.sessions)
      ) {
        appStore.showToast("备份数据格式不正确", "error");
        return;
      }

      // 通过 SyncStore 批量导入
      const validTasks = data.tasks
        .filter((t: any) => t.title)
        .map((t: any) => ({
          title: t.title,
          description: t.description || "",
          priority: t.priority || "medium",
          estimatedPomodoros: t.estimatedPomodoros || 1,
          tags: t.tags || [],
          dueDate: t.dueDate || null,
        }));

      const validReflections = data.reflections
        .filter((r: any) => r.date)
        .map((r: any) => ({
          date: r.date,
          content: r.content || "",
          mood: r.mood || "normal",
          relatedTaskIds: r.relatedTaskIds || [],
          tags: r.tags || [],
        }));

      const validSessions = data.sessions
        .filter((s: any) => s.type && s.duration)
        .map((s: any) => ({
          taskId: s.taskId,
          type: s.type,
          duration: s.duration,
          completed: s.completed ?? false,
          startedAt: s.startedAt,
        }));

      await syncStore.importRecords(
        validTasks,
        validReflections,
        validSessions
      );

      // 刷新 store 内存状态
      await Promise.all([
        taskStore.loadTasks(),
        reflectionStore.loadReflections(),
        timerStore.loadTodaySessions(),
      ]);

      appStore.showToast("数据导入成功！", "success");
    } catch (err) {
      console.error("导入数据失败:", err);
      appStore.showToast("导入失败：文件格式不正确", "error");
    } finally {
      isImporting.value = false;
    }
  };
  input.click();
}

/** 请求清除所有数据 */
function requestClearData() {
  showClearConfirm.value = true;
}

/** 导入反思（专用入口，支持 .md/.json） */
async function importReflectionData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,.md,.markdown";
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    isImportingReflection.value = true;
    try {
      const text = await file.text();
      const result = parseImportFile(text, file.name);

      // 检测冲突
      const conflicts: typeof importConflicts.value = [];
      const reflectionStore = useReflectionStore();
      await reflectionStore.loadReflections();

      for (const item of result.items) {
        const existing = reflectionStore.reflections.find(
          (r) => r.date === item.date
        );
        if (existing) {
          conflicts.push({
            date: item.date,
            incoming: item,
            action: "replace",
          });
        }
      }

      // 无冲突直接导入
      if (conflicts.length === 0) {
        for (const item of result.items) {
          await importSingleReflection(item);
        }
        await reflectionStore.loadReflections();
        appStore.showToast(`成功导入 ${result.items.length} 条反思`, "success");
        return;
      }

      // 有冲突，弹出选择
      importConflicts.value = conflicts;
      pendingImportItems.value = result.items;
      showConflictModal.value = true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "导入失败";
      console.error("导入反思失败:", err);
      appStore.showToast(`导入失败：${msg}`, "error");
    } finally {
      isImportingReflection.value = false;
    }
  };
  input.click();
}

/** 导入单条反思（内部） */
async function importSingleReflection(item: ImportReflection) {
  const reflectionStore = useReflectionStore();
  const existing = reflectionStore.reflections.find(
    (r) => r.date === item.date
  );

  if (existing) {
    await reflectionStore.updateReflection(existing.id, {
      content: item.content,
      mood: item.mood,
      tags: item.tags,
    });
  } else {
    await reflectionStore.createReflection({
      date: item.date,
      content: item.content,
      mood: item.mood,
      tags: item.tags,
      relatedTaskIds: item.relatedTaskIds || [],
    });
  }
}

/** 应用冲突解决并导入 */
async function applyConflictResolution() {
  const reflectionStore = useReflectionStore();
  let imported = 0;
  let skipped = 0;

  for (const item of pendingImportItems.value) {
    const conflict = importConflicts.value.find((c) => c.date === item.date);
    if (conflict && conflict.action === "skip") {
      skipped++;
      continue;
    }
    await importSingleReflection(item);
    imported++;
  }

  await reflectionStore.loadReflections();
  showConflictModal.value = false;
  importConflicts.value = [];
  pendingImportItems.value = [];
  appStore.showToast(
    `导入完成：${imported} 条已导入，${skipped} 条已跳过`,
    "success"
  );
}

/** 取消冲突处理 */
function cancelConflictImport() {
  showConflictModal.value = false;
  importConflicts.value = [];
  pendingImportItems.value = [];
}

/** 确认清除数据 */
async function confirmClearData() {
  isClearing.value = true;
  try {
    // 通过 SyncStore 清除数据库
    await syncStore.clearAllData();

    // 清除 localStorage
    localStorage.removeItem("pomodorox-settings");

    // 刷新 store 内存状态
    await Promise.all([
      taskStore.loadTasks(),
      reflectionStore.loadReflections(),
      timerStore.loadTodaySessions(),
      sessionStore.loadAllSessions(),
    ]);

    appStore.showToast("数据已清除，页面即将刷新", "success");
    setTimeout(() => window.location.reload(), 1500);
  } catch (err) {
    console.error("清除数据失败:", err);
    appStore.showToast("清除数据失败", "error");
  } finally {
    isClearing.value = false;
    showClearConfirm.value = false;
  }
}

/** 取消清除 */
function cancelClear() {
  showClearConfirm.value = false;
}

/** WebDAV 保存配置 */
function saveWebDavConfig() {
  if (webDavUrl.value && webDavUsername.value) {
    webDav.setConfig({
      url: webDavUrl.value,
      username: webDavUsername.value,
      password: webDavPassword.value,
    });
  }
}

/** WebDAV 测试连接 */
async function testWebDavConnection() {
  isTestingWebDav.value = true;
  webDavTestResult.value = null;
  saveWebDavConfig();

  try {
    const ok = await webDav.testConnection();
    webDavTestResult.value = {
      success: ok,
      message: ok
        ? "连接成功！WebDAV 服务可用"
        : "连接失败：无法访问 WebDAV 服务器",
    };
  } catch (err) {
    webDavTestResult.value = {
      success: false,
      message: err instanceof Error ? err.message : "连接测试失败",
    };
  } finally {
    isTestingWebDav.value = false;
  }
}

/** WebDAV 执行同步 */
async function syncWebDav() {
  saveWebDavConfig();

  // Step 1: 先同步墓碑（删除标记）
  const tombstoneResult = await webDav.syncTombstones();
  if (tombstoneResult.error) {
    appStore.showToast(`墓碑同步失败：${tombstoneResult.error}`, "error");
    return;
  }
  const tombstones = tombstoneResult.merged;

  // Step 2: 并行同步实体（携带墓碑过滤）
  const tasks: Promise<SyncTypeResult>[] = [];

  if (syncTypes.value.includes("reflections")) {
    const reflectionStore = useReflectionStore();
    await reflectionStore.loadReflections();
    tasks.push(webDav.syncReflections(reflectionStore.reflections, tombstones));
  }

  if (syncTypes.value.includes("sessions")) {
    const sessionStore = useSessionStore();
    await sessionStore.loadAllSessions();
    tasks.push(webDav.syncSessions(sessionStore.sessions, tombstones));
  }

  if (syncTypes.value.includes("tasks")) {
    const taskStore = useTaskStore();
    await taskStore.loadTasks();
    tasks.push(webDav.syncTasks(taskStore.tasks, tombstones));
  }

  const results = await Promise.allSettled(tasks);

  const success: PromiseFulfilledResult<SyncTypeResult>[] = [];
  const failures: Array<
    PromiseRejectedResult | PromiseFulfilledResult<SyncTypeResult>
  > = [];

  results.forEach((r) => {
    if (r.status === "fulfilled") {
      if (r.value.error) {
        failures.push(r);
      } else {
        success.push(r);
      }
    } else {
      failures.push(r);
    }
  });

  // Step 3: 写回合并后的数据到本地数据库 + 删除被墓碑覆盖的本地实体
  for (const r of success) {
    try {
      // 删除被墓碑覆盖的本地实体
      if (r.value.toDeleteLocal && r.value.toDeleteLocal.length > 0) {
        for (const id of r.value.toDeleteLocal) {
          if (r.value.type === "reflections") await db.deleteReflection(id);
          else if (r.value.type === "sessions") await db.deleteSession(id);
          else if (r.value.type === "tasks") await db.deleteTask(id);
        }
      }

      // 写回合并实体
      if (!r.value.merged) continue;

      if (r.value.type === "reflections") {
        const reflectionStore = useReflectionStore();
        for (const reflection of r.value.merged as Reflection[]) {
          await db.upsertReflection(reflection);
        }
        await reflectionStore.loadReflections();
      } else if (r.value.type === "sessions") {
        const sessionStore = useSessionStore();
        for (const session of r.value.merged as Session[]) {
          await db.upsertSession(session);
        }
        await sessionStore.loadAllSessions();
      } else if (r.value.type === "tasks") {
        const taskStore = useTaskStore();
        for (const task of r.value.merged as Task[]) {
          await db.upsertTask(task);
        }
        await taskStore.loadTasks();
      }
    } catch (err) {
      console.error(`写回 ${r.value.type} 数据失败:`, err);
    }
  }

  if (failures.length === 0) {
    const parts = success
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

/** 加载数据库统计 */
async function loadDbStats() {
  try {
    await syncStore.loadDbStats();
    dbStats.value = {
      tasks: syncStore.dbStats.taskCount,
      sessions: syncStore.dbStats.sessionCount,
      reflections: syncStore.dbStats.reflectionCount,
    };
  } catch (err) {
    console.error("加载数据库统计失败:", err);
  }
}

// ---- 初始化 ----
onMounted(async () => {
  await settingsStore.loadSettings();

  // 同步本地编辑副本
  localSettings.value = {
    githubToken: settingsStore.settings.githubToken,
    githubRepo: settingsStore.settings.githubRepo,
    githubOwner: settingsStore.settings.githubOwner,
  };

  // 加载数据库统计
  await loadDbStats();
});
</script>

<template>
  <div class="settings-view">
    <!-- 动态背景 -->
    <div class="bg-orb bg-orb-1" />
    <div class="bg-orb bg-orb-2" />

    <!-- 顶部栏 -->
    <header class="settings-header">
      <h1 class="page-title">应用设置</h1>
    </header>

    <!-- 主内容 -->
    <div class="settings-body">
      <!-- GitHub 同步 -->
      <section class="settings-section">
        <h2 class="section-title">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="section-icon"
          >
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
          GitHub 同步
        </h2>
        <div class="section-content">
          <!-- Token -->
          <div class="form-group">
            <label class="form-label">GitHub Token</label>
            <div class="input-with-toggle">
              <input
                :type="showToken ? 'text' : 'password'"
                :value="localSettings.githubToken"
                @input="
                  updateGithubToken(($event.target as HTMLInputElement).value)
                "
                class="form-input"
                placeholder="ghp_xxxxxxxxxxxx"
              />
              <button
                class="input-toggle"
                @click="showToken = !showToken"
                :title="showToken ? '隐藏' : '显示'"
              >
                <svg
                  v-if="showToken"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                <svg
                  v-else
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Owner -->
          <div class="form-group">
            <label class="form-label">仓库 Owner</label>
            <input
              type="text"
              :value="localSettings.githubOwner"
              @input="
                updateGithubOwner(($event.target as HTMLInputElement).value)
              "
              class="form-input"
              placeholder="your-username"
            />
          </div>

          <!-- Repo -->
          <div class="form-group">
            <label class="form-label">仓库名称</label>
            <input
              type="text"
              :value="localSettings.githubRepo"
              @input="
                updateGithubRepo(($event.target as HTMLInputElement).value)
              "
              class="form-input"
              placeholder="promoX-data"
            />
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <button
              class="btn-secondary"
              :disabled="isTestingConnection || !githubConfigured"
              @click="testConnection"
            >
              <svg
                v-if="isTestingConnection"
                class="spin-icon"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              <span>{{ isTestingConnection ? "测试中..." : "测试连接" }}</span>
            </button>
            <button
              class="btn-primary"
              :disabled="isSyncing || !githubConfigured"
              @click="syncNow"
            >
              <svg
                v-if="isSyncing"
                class="spin-icon"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              <span>{{ isSyncing ? "同步中..." : "立即同步" }}</span>
            </button>
          </div>

          <!-- 测试结果 -->
          <div
            v-if="testResult"
            class="result-message"
            :class="{ success: testResult.success, error: !testResult.success }"
          >
            {{ testResult.message }}
          </div>

          <!-- 同步结果 -->
          <div
            v-if="syncResult"
            class="result-message"
            :class="{ success: syncResult.success, error: !syncResult.success }"
          >
            <pre class="result-pre">{{ syncResult.message }}</pre>
          </div>

          <!-- 同步状态 -->
          <div class="sync-status">
            <span class="sync-status-label">上次同步：</span>
            <span class="sync-status-value">{{ lastSyncTime }}</span>
            <span
              v-if="appStore.syncStatus.pendingCount > 0"
              class="sync-pending"
            >
              ({{ appStore.syncStatus.pendingCount }} 项待同步)
            </span>
          </div>
        </div>
      </section>

      <!-- WebDAV 同步 -->
      <section class="settings-section">
        <h2 class="section-title">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="section-icon"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          WebDAV 同步
        </h2>
        <div class="section-content">
          <div v-if="!isTauri()" class="webdav-info-tip">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span
              >浏览器端通过 Vercel 边缘代理访问 WebDAV，无需额外配置代理。</span
            >
          </div>

          <div class="form-group">
            <label class="form-label">服务器地址</label>
            <input
              v-model="webDavUrl"
              type="text"
              class="form-input"
              placeholder="https://dav.jianguoyun.com/dav/"
            />
          </div>
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input
              v-model="webDavUsername"
              type="text"
              class="form-input"
              placeholder="your@email.com"
            />
          </div>
          <div class="form-group">
            <label class="form-label">密码</label>
            <input
              v-model="webDavPassword"
              type="password"
              class="form-input"
              placeholder="应用专用密码"
            />
          </div>

          <div class="form-group">
            <label class="form-label">同步内容</label>
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input
                  type="checkbox"
                  value="reflections"
                  v-model="syncTypes"
                />
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
          </div>

          <div class="form-actions">
            <button
              class="btn-secondary"
              :disabled="isTestingWebDav || !canTestWebDav"
              @click="testWebDavConnection"
            >
              <svg
                v-if="isTestingWebDav"
                class="spin-icon"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              <span>{{ isTestingWebDav ? "测试中..." : "测试连接" }}</span>
            </button>
            <button
              class="btn-primary"
              :disabled="webDav.isSyncing.value || !canSyncWebDav"
              @click="syncWebDav"
            >
              <svg
                v-if="webDav.isSyncing.value"
                class="spin-icon"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              <span>{{
                webDav.isSyncing.value ? "同步中..." : "立即同步"
              }}</span>
            </button>
          </div>

          <div
            v-if="webDavTestResult"
            class="result-message"
            :class="{
              success: webDavTestResult.success,
              error: !webDavTestResult.success,
            }"
          >
            {{ webDavTestResult.message }}
          </div>

          <div class="sync-status">
            <span class="sync-status-label">上次同步：</span>
            <span class="sync-status-value">{{
              webDav.lastSyncAt.value || "从未同步"
            }}</span>
          </div>
        </div>
      </section>

      <!-- 计时器设置 -->
      <section class="settings-section">
        <h2 class="section-title">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="section-icon"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          计时器设置
        </h2>
        <div class="section-content">
          <!-- 工作时长 -->
          <div class="form-group">
            <div class="slider-header">
              <label class="form-label">工作时长</label>
              <span class="slider-value">{{ sliderWorkDuration }} 分钟</span>
            </div>
            <input
              type="range"
              v-model.number="sliderWorkDuration"
              @change="workDuration = sliderWorkDuration"
              min="15"
              max="60"
              step="5"
              class="form-slider"
            />
            <div class="slider-labels">
              <span>15</span>
              <span>30</span>
              <span>45</span>
              <span>60</span>
            </div>
          </div>

          <!-- 短休息时长 -->
          <div class="form-group">
            <div class="slider-header">
              <label class="form-label">短休息时长</label>
              <span class="slider-value">{{ sliderShortBreak }} 分钟</span>
            </div>
            <input
              type="range"
              v-model.number="sliderShortBreak"
              @change="shortBreakDuration = sliderShortBreak"
              min="3"
              max="15"
              step="1"
              class="form-slider"
            />
            <div class="slider-labels">
              <span>3</span>
              <span>6</span>
              <span>9</span>
              <span>15</span>
            </div>
          </div>

          <!-- 长休息时长 -->
          <div class="form-group">
            <div class="slider-header">
              <label class="form-label">长休息时长</label>
              <span class="slider-value">{{ sliderLongBreak }} 分钟</span>
            </div>
            <input
              type="range"
              v-model.number="sliderLongBreak"
              @change="longBreakDuration = sliderLongBreak"
              min="10"
              max="30"
              step="5"
              class="form-slider"
            />
            <div class="slider-labels">
              <span>10</span>
              <span>15</span>
              <span>20</span>
              <span>30</span>
            </div>
          </div>

          <!-- 长休息间隔 -->
          <div class="form-group">
            <label class="form-label">长休息间隔（每 N 个番茄钟后）</label>
            <div class="number-input-group">
              <button
                class="number-btn"
                :disabled="longBreakInterval <= 2"
                @click="longBreakInterval = longBreakInterval - 1"
              >
                -
              </button>
              <span class="number-value">{{ longBreakInterval }}</span>
              <button
                class="number-btn"
                :disabled="longBreakInterval >= 8"
                @click="longBreakInterval = longBreakInterval + 1"
              >
                +
              </button>
            </div>
          </div>

          <!-- 自由计时默认时长 -->
          <div class="form-group">
            <div class="slider-header">
              <label class="form-label">自由计时默认时长</label>
              <span class="slider-value">{{ sliderFreeDuration }} 分钟</span>
            </div>
            <input
              type="range"
              v-model.number="sliderFreeDuration"
              @change="freeDuration = sliderFreeDuration"
              min="1"
              max="180"
              step="1"
              class="form-slider"
            />
            <div class="slider-labels">
              <span>1</span>
              <span>45</span>
              <span>90</span>
              <span>180</span>
            </div>
          </div>

          <!-- 开关选项 -->
          <div class="form-group">
            <div class="toggle-row">
              <div class="toggle-info">
                <span class="toggle-label">自动开始休息</span>
                <span class="toggle-desc">完成番茄钟后自动开始休息</span>
              </div>
              <button
                class="toggle-switch"
                :class="{ active: autoStartBreak }"
                @click="autoStartBreak = !autoStartBreak"
              >
                <span class="toggle-knob" />
              </button>
            </div>
          </div>

          <div class="form-group">
            <div class="toggle-row">
              <div class="toggle-info">
                <span class="toggle-label">自动开始番茄钟</span>
                <span class="toggle-desc">休息结束后自动开始下一个番茄钟</span>
              </div>
              <button
                class="toggle-switch"
                :class="{ active: autoStartPomodoro }"
                @click="autoStartPomodoro = !autoStartPomodoro"
              >
                <span class="toggle-knob" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 主题设置 -->
      <section class="settings-section">
        <h2 class="section-title">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="section-icon"
          >
            <circle cx="13.5" cy="6.5" r="2.5" />
            <path d="M17.5 10.5l2 2" />
            <path d="M20.5 17.5l-2 2" />
            <path d="M6.5 17.5l-2 2" />
            <path d="M2.5 10.5l2 2" />
            <circle cx="10.5" cy="17.5" r="2.5" />
            <circle cx="13.5" cy="17.5" r="2.5" />
          </svg>
          主题
        </h2>
        <div class="section-content">
          <div class="theme-grid">
            <button
              v-for="theme in themeOptions"
              :key="theme.name"
              class="theme-card"
              :class="{ active: currentTheme === theme.name }"
              @click="selectTheme(theme.name)"
            >
              <div class="theme-preview" :style="{ background: theme.bg }">
                <div class="theme-preview-elements">
                  <div
                    class="theme-preview-bar"
                    :style="{ background: theme.accent, width: '60%' }"
                  />
                  <div
                    class="theme-preview-bar"
                    :style="{ background: theme.accent + '40', width: '80%' }"
                  />
                  <div
                    class="theme-preview-bar"
                    :style="{ background: theme.accent + '25', width: '45%' }"
                  />
                </div>
                <div
                  class="theme-preview-accent"
                  :style="{ background: theme.accent }"
                />
              </div>
              <div class="theme-info">
                <span class="theme-label">{{ theme.label }}</span>
                <span class="theme-label-en">{{ theme.labelEn }}</span>
              </div>
              <div v-if="currentTheme === theme.name" class="theme-check">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </section>

      <!-- 数据管理 -->
      <section class="settings-section">
        <h2 class="section-title">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="section-icon"
          >
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
          数据管理
        </h2>
        <div class="section-content">
          <!-- 数据库信息 -->
          <div class="db-info">
            <div class="db-info-item">
              <span class="db-info-label">任务总数</span>
              <span class="db-info-value">{{ dbStats.tasks }}</span>
            </div>
            <div class="db-info-item">
              <span class="db-info-label">会话总数</span>
              <span class="db-info-value">{{ dbStats.sessions }}</span>
            </div>
            <div class="db-info-item">
              <span class="db-info-label">反思总数</span>
              <span class="db-info-value">{{ dbStats.reflections }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="data-actions">
            <button
              class="btn-secondary"
              :disabled="isExporting"
              @click="exportData"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>{{ isExporting ? "导出中..." : "导出数据" }}</span>
            </button>
            <button
              class="btn-secondary"
              :disabled="isImporting"
              @click="importData"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>{{ isImporting ? "导入中..." : "导入数据" }}</span>
            </button>
            <button
              class="btn-secondary"
              :disabled="isImportingReflection"
              @click="importReflectionData"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>{{
                isImportingReflection ? "导入中..." : "导入反思"
              }}</span>
            </button>
            <button
              class="btn-danger"
              :disabled="isClearing"
              @click="requestClearData"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                />
              </svg>
              <span>{{ isClearing ? "清除中..." : "清除所有数据" }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- 关于 -->
      <section class="settings-section">
        <h2 class="section-title">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="section-icon"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          关于
        </h2>
        <div class="section-content">
          <div class="about-content">
            <div class="about-logo">
              <span class="about-name">PomodoroX</span>
              <span class="about-version">v1.0.0</span>
            </div>
            <p class="about-desc">
              一款现代化的番茄钟效率工具，帮助你专注工作、追踪任务、记录反思。
            </p>
            <div class="about-tech">
              <span class="tech-tag">Vue 3</span>
              <span class="tech-tag">TypeScript</span>
              <span class="tech-tag">Pinia</span>
              <span class="tech-tag">Tailwind CSS</span>
              <span class="tech-tag">Tauri</span>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              class="about-link"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </section>
    </div>

    <!-- 冲突处理对话框 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showConflictModal"
          class="modal-overlay"
          @click.self="cancelConflictImport"
        >
          <div class="modal-content" style="max-width: 480px">
            <h3 class="modal-title">导入冲突</h3>
            <p class="modal-message">以下日期的反思已存在，请选择处理方式：</p>
            <div
              class="conflict-list"
              style="max-height: 300px; overflow-y: auto; margin: 12px 0"
            >
              <div
                v-for="conflict in importConflicts"
                :key="conflict.date"
                class="conflict-item"
                style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  padding: 10px 0;
                  border-bottom: 1px solid var(--border);
                "
              >
                <span style="font-weight: 500; color: var(--text)">{{
                  conflict.date
                }}</span>
                <div style="display: flex; gap: 8px">
                  <button
                    class="modal-btn"
                    :class="{ cancel: conflict.action !== 'replace' }"
                    style="padding: 4px 12px; font-size: 0.8rem"
                    @click="conflict.action = 'replace'"
                  >
                    替换
                  </button>
                  <button
                    class="modal-btn"
                    :class="{ cancel: conflict.action !== 'skip' }"
                    style="padding: 4px 12px; font-size: 0.8rem"
                    @click="conflict.action = 'skip'"
                  >
                    跳过
                  </button>
                </div>
              </div>
            </div>
            <div class="modal-actions">
              <button class="modal-btn cancel" @click="cancelConflictImport">
                取消
              </button>
              <button class="modal-btn" @click="applyConflictResolution">
                确认导入
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 清除确认对话框 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showClearConfirm"
          class="modal-overlay"
          @click.self="cancelClear"
        >
          <div class="modal-content">
            <h3 class="modal-title">确认清除所有数据</h3>
            <p class="modal-message">
              此操作将删除所有任务、会话记录和反思数据。删除后无法恢复，建议先导出备份。
            </p>
            <div class="modal-actions">
              <button class="modal-btn cancel" @click="cancelClear">
                取消
              </button>
              <button
                class="modal-btn danger"
                :disabled="isClearing"
                @click="confirmClearData"
              >
                {{ isClearing ? "清除中..." : "确认清除" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
}

/* ---- 动态背景 ---- */
.bg-orb {
  opacity: 0.3;
}

.bg-orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(
    circle,
    rgba(88, 166, 255, 0.1) 0%,
    transparent 70%
  );
  top: -15%;
  right: -10%;
  animation: orb-drift-settings-1 25s ease-in-out infinite;
}

.bg-orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(
    circle,
    rgba(136, 100, 255, 0.08) 0%,
    transparent 70%
  );
  bottom: -10%;
  left: -5%;
  animation: orb-drift-settings-2 30s ease-in-out infinite;
}

@keyframes orb-drift-settings-1 {
  0%,
  100% {
    transform: translate(0, 0);
  }
  33% {
    transform: translate(-30px, 20px);
  }
  66% {
    transform: translate(20px, -15px);
  }
}

@keyframes orb-drift-settings-2 {
  0%,
  100% {
    transform: translate(0, 0);
  }
  33% {
    transform: translate(25px, -20px);
  }
  66% {
    transform: translate(-15px, 15px);
  }
}

/* ---- 顶部栏 ---- */
.settings-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text);
}

/* ---- 主内容 ---- */
.settings-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* ---- 设置区块 ---- */
.settings-section {
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  border-bottom: 1px solid var(--glass-border);
  box-shadow: 0 1px 0 0 rgba(88, 166, 255, 0.05);
}

.section-icon {
  color: var(--accent);
  flex-shrink: 0;
}

.section-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ---- 表单元素 ---- */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text);
}

.form-input {
  padding: 10px 14px;
  font-size: 0.875rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-input:focus {
  border-color: var(--accent);
  box-shadow:
    0 0 0 3px var(--accent-glow),
    0 0 16px var(--accent-dim);
}

.form-input::placeholder {
  color: var(--text-tertiary);
}

.input-with-toggle {
  display: flex;
  gap: 0;
}

.input-with-toggle .form-input {
  flex: 1;
  border-radius: 10px 0 0 10px;
  border-right: none;
}

.input-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0 10px 10px 0;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.input-toggle:hover {
  color: var(--accent);
  background: var(--hover-bg);
}

/* ---- 滑块 ---- */
.slider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.slider-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent);
}

.form-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(
    to right,
    var(--accent) 0%,
    var(--accent) var(--value, 0%),
    var(--border) var(--value, 0%),
    var(--border) 100%
  );
  outline: none;
  cursor: pointer;
}

.form-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  border: 2px solid var(--surface);
  box-shadow: 0 0 0 2px var(--accent);
  transition:
    transform 0.15s ease,
    box-shadow 0.2s ease;
}

.form-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow:
    0 0 0 3px var(--accent),
    0 0 12px var(--accent-glow);
}

.form-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  border: 2px solid var(--surface);
  box-shadow: 0 0 0 2px var(--accent);
  transition:
    transform 0.15s ease,
    box-shadow 0.2s ease;
}

.form-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow:
    0 0 0 3px var(--accent),
    0 0 12px var(--accent-glow);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 2px;
}

.slider-labels span {
  font-size: 0.7rem;
  color: var(--text-tertiary);
}

/* ---- 数字输入 ---- */
.number-input-group {
  display: flex;
  align-items: center;
  gap: 0;
  width: fit-content;
}

.number-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.number-btn:first-child {
  border-radius: 10px 0 0 10px;
}

.number-btn:last-child {
  border-radius: 0 10px 10px 0;
}

.number-btn:hover:not(:disabled) {
  background: var(--hover-bg);
  color: var(--accent);
  border-color: var(--accent);
}

.number-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.number-value {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 36px;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
}

/* ---- 开关 ---- */
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.toggle-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toggle-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text);
}

.toggle-desc {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.toggle-switch {
  position: relative;
  width: 48px;
  height: 26px;
  border-radius: 13px;
  border: none;
  background: var(--border);
  cursor: pointer;
  transition:
    background 0.3s ease,
    box-shadow 0.3s ease;
  flex-shrink: 0;
}

.toggle-switch.active {
  background: var(--accent);
  box-shadow: 0 0 12px var(--accent-glow);
}

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-knob {
  transform: translateX(22px);
}

/* ---- 按钮 ---- */
.form-actions {
  display: flex;
  gap: 10px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: 10px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0 16px var(--accent-glow);
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.95;
  box-shadow: 0 0 24px var(--accent-glow);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--hover-bg);
  color: var(--text);
  border-color: var(--accent);
  box-shadow: 0 0 12px var(--accent-glow);
  transform: translateY(-1px);
}

.btn-secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-danger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: 10px;
  border: 1px solid rgba(248, 81, 73, 0.4);
  background: rgba(248, 81, 73, 0.08);
  color: var(--danger);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.btn-danger:hover:not(:disabled) {
  background: rgba(248, 81, 73, 0.15);
  border-color: rgba(248, 81, 73, 0.6);
  box-shadow: 0 0 12px rgba(248, 81, 73, 0.2);
  transform: translateY(-1px);
}

.btn-danger:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.spin-icon {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ---- 结果消息 ---- */
.result-message {
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 0.8rem;
  line-height: 1.5;
}

.result-message.success {
  background: rgba(63, 185, 80, 0.08);
  color: var(--success);
  border: 1px solid rgba(63, 185, 80, 0.2);
}

.result-message.error {
  background: rgba(248, 81, 73, 0.08);
  color: var(--danger);
  border: 1px solid rgba(248, 81, 73, 0.2);
}

.result-pre {
  white-space: pre-wrap;
  word-break: break-all;
}

/* ---- 同步状态 ---- */
.sync-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.sync-status-value {
  color: var(--text-secondary);
}

.sync-pending {
  color: var(--accent);
  font-weight: 500;
}

/* ---- WebDAV 提示 ---- */
.webdav-info-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  line-height: 1.5;
  margin-bottom: 12px;
}

.webdav-info-tip svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--accent);
}

.webdav-info-tip a {
  color: var(--accent);
  text-decoration: underline;
}

.form-hint {
  margin: 4px 0 0 0;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.checkbox-group {
  display: flex;
  gap: 16px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* ---- 主题选择 ---- */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.theme-card {
  position: relative;
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  text-align: left;
  padding: 0;
  box-shadow: var(--glass-shadow);
}

.theme-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.15),
    0 0 16px var(--accent-glow);
  border-color: var(--accent);
}

.theme-card.active {
  border-color: var(--accent);
  box-shadow:
    0 0 20px var(--accent-glow),
    0 4px 16px rgba(0, 0, 0, 0.1);
}

.theme-preview {
  height: 72px;
  padding: 12px;
  position: relative;
  overflow: hidden;
}

.theme-preview-elements {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  z-index: 1;
}

.theme-preview-bar {
  height: 4px;
  border-radius: 2px;
}

.theme-preview-accent {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.theme-info {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--surface);
}

.theme-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
}

.theme-label-en {
  font-size: 0.7rem;
  color: var(--text-tertiary);
}

.theme-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 8px var(--accent-glow);
}

/* ---- 数据库信息 ---- */
.db-info {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.db-info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 18px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  min-width: 100px;
  box-shadow: var(--glass-shadow);
}

.db-info-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.db-info-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
  text-shadow: 0 0 12px var(--accent-glow);
}

.data-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* ---- 关于 ---- */
.about-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.about-logo {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.about-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--accent);
  text-shadow: 0 0 16px var(--accent-glow);
}

.about-version {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  padding: 2px 8px;
  background: var(--surface);
  border-radius: 4px;
}

.about-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.about-tech {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tech-tag {
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.about-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 10px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  font-size: 0.85rem;
  text-decoration: none;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  width: fit-content;
}

.about-link:hover {
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 0 12px var(--accent-glow);
}

/* ---- 模态框（本地覆盖） ---- */
.modal-btn.danger {
  background: rgba(248, 81, 73, 0.15);
  color: var(--danger);
  border: 1px solid rgba(248, 81, 73, 0.4);
}

.modal-btn.danger:hover:not(:disabled) {
  background: rgba(248, 81, 73, 0.25);
  box-shadow: 0 0 16px rgba(248, 81, 73, 0.2);
}

.modal-btn.danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ---- 过渡动画 ---- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* ---- 响应式 ---- */
@media (max-width: 600px) {
  .settings-body {
    padding: 16px;
  }

  .theme-grid {
    grid-template-columns: 1fr;
  }

  .data-actions {
    flex-direction: column;
  }

  .data-actions .btn-secondary,
  .data-actions .btn-danger {
    width: 100%;
    justify-content: center;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn-primary,
  .form-actions .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}

/* ---- 移动端响应式 ---- */
@media (max-width: 640px) {
  .settings-body {
    max-width: 100%;
    padding: 12px 16px;
  }

  .settings-section {
    padding: 14px;
  }

  .settings-section-title {
    font-size: 0.95rem;
  }

  .settings-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .settings-label {
    min-width: 0;
    font-size: 0.85rem;
  }

  .settings-input {
    width: 100%;
    font-size: 16px; /* 防 iOS 缩放 */
  }

  .settings-slider {
    width: 100%;
  }

  .theme-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .theme-card {
    min-height: 44px;
    padding: 10px;
    font-size: 0.8rem;
  }

  .data-actions {
    flex-direction: column;
    gap: 8px;
  }

  .data-actions button {
    width: 100%;
    min-height: 44px;
    justify-content: center;
  }

  .form-actions {
    flex-direction: column;
    gap: 8px;
  }

  .form-actions button {
    width: 100%;
    min-height: 44px;
    justify-content: center;
  }

  .github-section {
    padding: 14px;
  }

  .config-row {
    flex-direction: column;
    gap: 6px;
  }
}

/* ---- 平板端 ---- */
@media (min-width: 641px) and (max-width: 1023px) {
  .settings-body {
    max-width: 100%;
    padding: 16px 24px;
  }

  .theme-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
