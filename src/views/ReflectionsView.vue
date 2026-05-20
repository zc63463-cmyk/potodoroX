<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import ReflectionEditor from "@/components/reflection/ReflectionEditor.vue";
import ReflectionBrowser from "@/components/reflection/ReflectionBrowser.vue";
import ReflectionDetailModal from "@/components/reflection/ReflectionDetailModal.vue";
import { useReflectionStore } from "@/stores/reflection";
import { useTaskStore } from "@/stores/task";
import type { Mood, Reflection, ReflectionFilter } from "@/types";
import { formatDate, formatFriendlyDate } from "@/utils/format";

// ---- Stores ----
const reflectionStore = useReflectionStore();
const taskStore = useTaskStore();

// ---- 状态 ----
const mode = ref<"edit" | "browse">("edit");
const selectedDate = ref(formatDate(new Date()));
const content = ref("");
const currentMood = ref<Mood>("normal");
const currentTags = ref<string[]>([]);
const isSaving = ref(false);
const saveMessage = ref("");
const showDeleteConfirm = ref(false);
const deleteTargetId = ref<string | null>(null);
const autoSaveTimer = ref<ReturnType<typeof setTimeout> | null>(null);

/** 页面刷新前保存未保存内容 */
function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (hasUnsavedChanges.value) {
    // 同步触发保存（异步不等待，但至少启动保存流程）
    saveReflection();
    // 提示浏览器有未保存内容
    e.preventDefault();
    e.returnValue = "";
  }
}
const browseActiveTag = ref<string | null>(null);
const browseDateFrom = ref<string | null>(null);
const browseDateTo = ref<string | null>(null);
const showDetailModal = ref(false);
const selectedReflectionForModal = ref<Reflection | null>(null);

// ---- 计算属性 ----
const currentReflection = computed(() => {
  return reflectionStore.reflections.find((r) => r.date === selectedDate.value);
});

const currentReflectionId = computed(() => {
  return currentReflection.value?.id || null;
});

const hasUnsavedChanges = computed(() => {
  if (!currentReflection.value) {
    return (
      content.value.trim() !== "" ||
      currentMood.value !== "normal" ||
      currentTags.value.length > 0
    );
  }
  return (
    currentReflection.value.content !== content.value ||
    currentReflection.value.mood !== currentMood.value ||
    JSON.stringify(currentReflection.value.tags) !==
      JSON.stringify(currentTags.value)
  );
});

const todayTasks = computed(() => {
  return taskStore.tasks.filter(
    (t) =>
      t.createdAt.startsWith(selectedDate.value) ||
      (t.dueDate && t.dueDate.startsWith(selectedDate.value))
  );
});

const recentReflections = computed(() => {
  return reflectionStore.filteredReflections
    .filter((r) => r.id !== currentReflectionId.value)
    .slice(0, 10);
});

// ---- 方法 ----
function loadReflectionForDate(date: string) {
  const reflection = reflectionStore.reflections.find((r) => r.date === date);
  if (reflection) {
    content.value = reflection.content;
    currentMood.value = reflection.mood;
    currentTags.value = [...reflection.tags];
  } else {
    content.value = "";
    currentMood.value = "normal";
    currentTags.value = [];
  }
}

async function saveReflection() {
  isSaving.value = true;
  try {
    if (currentReflectionId.value) {
      await reflectionStore.updateReflection(currentReflectionId.value, {
        content: content.value,
        mood: currentMood.value,
        tags: currentTags.value,
      });
    } else {
      await reflectionStore.createReflection({
        date: selectedDate.value,
        content: content.value,
        mood: currentMood.value,
        relatedTaskIds: [],
        tags: currentTags.value,
      });
    }
    showSaveMessage("保存成功");
  } catch (err) {
    if (import.meta.env.DEV) console.error("保存反思失败:", err);
    showSaveMessage("保存失败");
  } finally {
    isSaving.value = false;
  }
}

function triggerAutoSave() {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value);
  }
  autoSaveTimer.value = setTimeout(() => {
    if (hasUnsavedChanges.value) {
      saveReflection();
    }
  }, 300);
}

let saveMessageTimer: ReturnType<typeof setTimeout> | null = null;

function showSaveMessage(msg: string) {
  saveMessage.value = msg;
  if (saveMessageTimer) clearTimeout(saveMessageTimer);
  saveMessageTimer = setTimeout(() => {
    saveMessage.value = "";
  }, 2000);
}

function changeDate(offset: number) {
  const d = new Date(selectedDate.value);
  d.setDate(d.getDate() + offset);
  selectedDate.value = formatDate(d);
}

function goToToday() {
  selectedDate.value = formatDate(new Date());
}

function editReflection(reflection: Reflection) {
  selectedDate.value = reflection.date;
  mode.value = "edit";
}

function openDetailModal(reflection: Reflection) {
  selectedReflectionForModal.value = reflection;
  showDetailModal.value = true;
}

function closeDetailModal() {
  showDetailModal.value = false;
  selectedReflectionForModal.value = null;
}

async function saveDetail(id: string, payload: { content: string }) {
  try {
    await reflectionStore.updateReflection(id, payload);
    showSaveMessage("保存成功");
    closeDetailModal();
  } catch (err) {
    if (import.meta.env.DEV) console.error("Modal 保存反思失败:", err);
    showSaveMessage("保存失败");
  }
}

function requestDelete(id: string) {
  deleteTargetId.value = id;
  showDeleteConfirm.value = true;
}

async function confirmDelete() {
  if (deleteTargetId.value) {
    await reflectionStore.deleteReflection(deleteTargetId.value);
    if (deleteTargetId.value === currentReflectionId.value) {
      content.value = "";
      currentMood.value = "normal";
      currentTags.value = [];
    }
  }
  showDeleteConfirm.value = false;
  deleteTargetId.value = null;
}

function cancelDelete() {
  showDeleteConfirm.value = false;
  deleteTargetId.value = null;
}

function handleBrowserFilter(tag: string | null) {
  browseActiveTag.value = tag;
  updateStoreFilter();
}

function handleDateRangeFilter(dateFrom: string | null, dateTo: string | null) {
  browseDateFrom.value = dateFrom;
  browseDateTo.value = dateTo;
  updateStoreFilter();
}

function updateStoreFilter() {
  const filter: Partial<ReflectionFilter> = {};
  if (browseActiveTag.value) {
    filter.tag = browseActiveTag.value;
  }
  if (browseDateFrom.value) {
    filter.dateFrom = browseDateFrom.value;
  }
  if (browseDateTo.value) {
    filter.dateTo = browseDateTo.value;
  }
  if (Object.keys(filter).length > 0) {
    reflectionStore.setFilter(filter);
  } else {
    reflectionStore.clearFilter();
  }
}

function getMoodEmoji(mood: string): string {
  const map: Record<string, string> = {
    great: "\u{1F604}",
    good: "\u{1F642}",
    normal: "\u{1F610}",
    bad: "\u{1F61F}",
    terrible: "\u{1F61E}",
  };
  return map[mood] || map.normal;
}

function getMoodColor(mood: string): string {
  const map: Record<string, string> = {
    great: "#3FB950",
    good: "#58A6FF",
    normal: "#D29922",
    bad: "#F0883E",
    terrible: "#F85149",
  };
  return map[mood] || map.normal;
}

function getContentPreview(content: string): string {
  if (!content) return "无内容";
  const stripped = content
    .replace(/[#*_[\]]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  return stripped.length > 80 ? stripped.slice(0, 80) + "..." : stripped;
}

// ---- 监听 ----
watch(selectedDate, (newDate) => {
  loadReflectionForDate(newDate);
});

// ---- 初始化 ----
onMounted(async () => {
  window.addEventListener("beforeunload", handleBeforeUnload);
  await Promise.all([reflectionStore.loadReflections(), taskStore.loadTasks()]);
  loadReflectionForDate(selectedDate.value);
});

// ---- 清理 ----
onUnmounted(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value);
    autoSaveTimer.value = null;
  }
  // 组件卸载前保存未保存内容（防止切到其他视图再回来时数据丢失）
  if (hasUnsavedChanges.value) {
    saveReflection();
  }
});
</script>

<template>
  <div class="reflections-view">
    <!-- 动态背景光球 -->
    <div class="bg-orb bg-orb-1"></div>
    <div class="bg-orb bg-orb-2"></div>

    <!-- 顶部栏 -->
    <header class="reflections-header">
      <div class="header-left">
        <div class="mode-switch">
          <button
            class="mode-btn"
            :class="{ active: mode === 'edit' }"
            @click="mode = 'edit'"
          >
            ✍️ 写反思
          </button>
          <button
            class="mode-btn"
            :class="{ active: mode === 'browse' }"
            @click="mode = 'browse'"
          >
            📚 浏览历史
          </button>
        </div>
      </div>

      <div v-if="mode === 'edit'" class="header-center">
        <button class="date-nav-btn" title="前一天" @click="changeDate(-1)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M10.5 3L5 8l5.5 5"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <div class="date-display">
          <input v-model="selectedDate" type="date" class="date-input" />
          <span class="date-text">{{ formatFriendlyDate(selectedDate) }}</span>
        </div>
        <button class="date-nav-btn" title="后一天" @click="changeDate(1)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M5.5 3L11 8l-5.5 5"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <div v-else class="header-center" />

      <div class="header-right">
        <span
          v-if="saveMessage"
          class="save-message"
          :class="{ error: saveMessage.includes('失败') }"
        >
          {{ saveMessage }}
        </span>
        <button
          v-if="mode === 'edit'"
          class="btn-save"
          :disabled="isSaving || !hasUnsavedChanges"
          @click="saveReflection"
        >
          <svg
            v-if="isSaving"
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
          <span>{{ isSaving ? "保存中..." : "保存" }}</span>
        </button>
      </div>
    </header>

    <!-- 主内容 -->
    <div class="reflections-body">
      <!-- 编辑模式 -->
      <ReflectionEditor
        v-if="mode === 'edit'"
        :date="selectedDate"
        :content="content"
        :mood="currentMood"
        :tags="currentTags"
        :reflection-id="currentReflectionId"
        :today-tasks="todayTasks"
        @update:content="
          content = $event;
          triggerAutoSave();
        "
        @update:mood="
          currentMood = $event;
          triggerAutoSave();
        "
        @update:tags="
          currentTags = $event;
          triggerAutoSave();
        "
        @change-date="changeDate"
        @go-to-today="goToToday"
        @save="saveReflection"
        @trigger-auto-save="triggerAutoSave"
      />

      <!-- 浏览模式 -->
      <ReflectionBrowser
        v-else
        :reflections="reflectionStore.filteredReflections"
        :all-tags="reflectionStore.allTags"
        :active-tag="browseActiveTag"
        :date-from="null"
        :date-to="null"
        @filter-by-tag="handleBrowserFilter"
        @filter-by-date-range="handleDateRangeFilter"
        @open-detail="openDetailModal"
        @delete-reflection="requestDelete"
      />

      <!-- 右侧边栏 -->
      <aside class="sidebar-panel">
        <!-- 今日相关任务 -->
        <div class="sidebar-section">
          <h3 class="section-title">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="section-icon"
            >
              <path
                d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z"
              />
              <path
                d="M8 4a.75.75 0 01.75.75v2.5h2.5a.75.75 0 010 1.5h-2.5v2.5a.75.75 0 01-1.5 0v-2.5h-2.5a.75.75 0 010-1.5h2.5v-2.5A.75.75 0 018 4z"
              />
            </svg>
            今日任务
          </h3>
          <div v-if="todayTasks.length === 0" class="empty-hint">
            当日暂无相关任务
          </div>
          <ul v-else class="task-link-list">
            <li
              v-for="task in todayTasks"
              :key="task.id"
              class="task-link-item"
            >
              <span
                class="task-status-dot"
                :class="{
                  'status-todo': task.status === 'todo',
                  'status-progress': task.status === 'in_progress',
                  'status-done': task.status === 'done',
                }"
              />
              <span class="task-link-title">{{ task.title }}</span>
              <span class="task-pomo-count">
                {{ task.actualPomodoros }}/{{ task.estimatedPomodoros }}
              </span>
            </li>
          </ul>
        </div>

        <!-- 最近反思 -->
        <div class="sidebar-section">
          <h3 class="section-title">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="section-icon"
            >
              <path
                d="M8 0a8 8 0 110 16A8 8 0 018 0zM1.5 8a6.5 6.5 0 1013 0 6.5 6.5 0 00-13 0zm4.879-2.773a.75.75 0 00-1.061 0l-2.25 2.25a.75.75 0 000 1.06l2.25 2.25a.75.75 0 101.06-1.06l-1.72-1.72h4.34a.75.75 0 000-1.5H4.72l1.72-1.72a.75.75 0 000-1.06z"
              />
            </svg>
            最近反思
          </h3>
          <div v-if="recentReflections.length === 0" class="empty-hint">
            暂无反思记录
          </div>
          <ul v-else class="reflection-list">
            <li
              v-for="r in recentReflections"
              :key="r.id"
              class="reflection-item"
              @click="editReflection(r)"
            >
              <div class="reflection-item-header">
                <span class="reflection-item-date">{{
                  formatFriendlyDate(r.date)
                }}</span>
                <span
                  class="reflection-item-mood"
                  :style="{ color: getMoodColor(r.mood) }"
                >
                  {{ getMoodEmoji(r.mood) }}
                </span>
              </div>
              <p class="reflection-item-preview">
                {{ getContentPreview(r.content) }}
              </p>
              <button
                class="reflection-item-delete"
                title="删除"
                @click.stop="requestDelete(r.id)"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path
                    d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zM11 3V1.75A1.75 1.75 0 009.25 0h-2.5A1.75 1.75 0 005 1.75V3H2.75a.75.75 0 000 1.5h.69l.95 9.3A1.75 1.75 0 006.12 16h3.76a1.75 1.75 0 001.73-1.5l.95-9.3h.69a.75.75 0 000-1.5H11zm-6.56 1.5l.91 8.82a.25.25 0 00.25.22h3.8a.25.25 0 00.25-.22l.91-8.82H4.44z"
                  />
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </div>

    <!-- 删除确认对话框 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showDeleteConfirm"
          class="modal-overlay"
          @click.self="cancelDelete"
        >
          <div class="modal-content">
            <h3 class="modal-title">确认删除</h3>
            <p class="modal-message">删除后无法恢复，确定要删除这条反思吗？</p>
            <div class="modal-actions">
              <button class="modal-btn cancel" @click="cancelDelete">
                取消
              </button>
              <button class="modal-btn danger" @click="confirmDelete">
                删除
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 反思详情弹窗 -->
    <ReflectionDetailModal
      v-if="showDetailModal && selectedReflectionForModal"
      :reflection="selectedReflectionForModal"
      @close="closeDetailModal"
      @save="saveDetail"
    />
  </div>
</template>

<style scoped>
/* ---- 动态背景光球 ---- */
@keyframes orb-drift-reflections-1 {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(40px, 30px) scale(1.05);
  }
  66% {
    transform: translate(-20px, 50px) scale(0.95);
  }
}

@keyframes orb-drift-reflections-2 {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(-30px, -20px) scale(1.08);
  }
  66% {
    transform: translate(20px, -40px) scale(0.92);
  }
}

.bg-orb {
  opacity: 0.4;
  z-index: 0;
}

.bg-orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(
    circle,
    rgba(167, 139, 250, 0.1) 0%,
    transparent 70%
  );
  top: -15%;
  left: -10%;
  animation: orb-drift-reflections-1 25s ease-in-out infinite;
}

.bg-orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(
    circle,
    rgba(88, 166, 255, 0.08) 0%,
    transparent 70%
  );
  bottom: -10%;
  right: -5%;
  animation: orb-drift-reflections-2 30s ease-in-out infinite;
}

/* ---- 根容器 ---- */
.reflections-view {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--bg);
}

/* ---- 顶部栏 (Glass) ---- */
.reflections-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  flex-shrink: 0;
  gap: 16px;
}

.header-left,
.header-right {
  flex-shrink: 0;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: center;
}

/* ---- 模式切换 ---- */
.mode-switch {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
}

.mode-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.mode-btn:hover {
  color: var(--text);
  background: var(--hover-bg);
}

.mode-btn.active {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 0 10px var(--accent-glow);
}

/* ---- 日期导航 ---- */
.date-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.25s ease;
}

.date-nav-btn:hover {
  background: var(--hover-bg);
  color: var(--text);
  border-color: var(--accent-dim);
  box-shadow: 0 0 8px var(--accent-glow);
}

.date-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-input {
  width: 140px;
  padding: 6px 10px;
  font-size: 0.875rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.date-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-glow);
}

.date-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.save-message {
  font-size: 0.8rem;
  color: var(--success);
  animation: fade-in 0.3s ease-out;
}

.save-message.error {
  color: var(--danger);
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border-radius: 10px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-save:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px var(--accent-glow);
}

.btn-save:disabled {
  opacity: 0.35;
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

/* ---- 主内容区 ---- */
.reflections-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 16px;
  padding: 16px;
}

/* ---- 右侧边栏 (Glass) ---- */
.sidebar-panel {
  width: 300px;
  min-width: 300px;
  overflow-y: auto;
  padding-bottom: 40px;
  display: flex;
  flex-direction: column;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--glass-shadow);
}

.sidebar-section {
  padding: 20px;
  border-bottom: 1px solid var(--glass-border);
}

.sidebar-section:last-child {
  border-bottom: none;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
}

.section-icon {
  color: var(--accent);
  flex-shrink: 0;
  filter: drop-shadow(0 0 4px var(--accent-glow));
}

.empty-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-align: center;
  padding: 16px 0;
}

/* ---- 任务链接列表 ---- */
.task-link-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.task-link-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid transparent;
}

.task-link-item:hover {
  background: var(--hover-bg);
  border-color: var(--accent-dim);
  box-shadow: 0 0 10px var(--accent-glow);
}

.task-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.task-status-dot.status-todo {
  background: var(--text-muted);
}

.task-status-dot.status-progress {
  background: var(--accent);
  box-shadow: 0 0 6px var(--accent-glow);
}

.task-status-dot.status-done {
  background: var(--success);
  box-shadow: 0 0 6px rgba(63, 185, 80, 0.3);
}

.task-link-title {
  flex: 1;
  font-size: 0.85rem;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-pomo-count {
  font-size: 0.75rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

/* ---- 反思列表 ---- */
.reflection-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reflection-item {
  position: relative;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: var(--surface);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.reflection-item:hover {
  border-color: var(--accent-dim);
  background: var(--hover-bg);
  box-shadow: 0 4px 16px var(--accent-glow);
  transform: translateY(-1px);
}

.reflection-item:hover .reflection-item-delete {
  opacity: 1;
}

.reflection-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.reflection-item-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.reflection-item-mood {
  font-size: 1rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.reflection-item-preview {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.reflection-item-delete {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
}

.reflection-item-delete:hover {
  background: rgba(248, 81, 73, 0.15);
  color: var(--danger);
  box-shadow: 0 0 8px rgba(248, 81, 73, 0.2);
}

/* ---- 删除确认对话框 ---- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: var(--surface);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 360px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}

.modal-message {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.modal-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-btn:hover {
  background: var(--hover-bg);
  border-color: var(--accent-dim);
}

.modal-btn.danger {
  border-color: var(--danger);
  color: var(--danger);
  background: rgba(248, 81, 73, 0.1);
}

.modal-btn.danger:hover {
  background: var(--danger);
  color: #fff;
  box-shadow: 0 0 12px rgba(248, 81, 73, 0.3);
}

/* ---- 过渡动画 ---- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ---- 响应式 ---- */
@media (max-width: 900px) {
  .sidebar-panel {
    display: none;
  }

  .reflections-body {
    padding: 12px;
  }
}

@media (max-width: 600px) {
  .reflections-header {
    flex-wrap: wrap;
    padding: 12px 16px;
  }

  .date-text {
    display: none;
  }

  .reflections-body {
    padding: 8px;
  }
}
</style>
