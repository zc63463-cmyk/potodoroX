<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import type { Task, Session, TaskStatus, Priority } from "@/types";
import { exportAdvancedReport } from "@/services/export";
import { formatDate } from "@/utils/format";

// ---- Props ----
const props = defineProps<{
  visible: boolean;
  tasks: Task[];
  sessions: Session[];
  currentFilters: {
    status: TaskStatus | "all";
    priority: Priority | "";
    tag: string;
    search: string;
  };
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

// ---- 状态 ----
const exportFormat = ref<"markdown" | "csv" | "json">("markdown");
const exportType = ref<"task" | "daily" | "weekly" | "biweekly">("task");
const selectedTaskId = ref<string | null>(null);
const useCurrentFilters = ref(true);
const dateFrom = ref("");
const dateTo = ref("");

// ---- 计算属性 ----
const canExport = computed(() => {
  if (useCurrentFilters.value) return true;
  if (exportType.value === "daily") return !!dateFrom.value;
  if (exportType.value === "weekly" || exportType.value === "biweekly")
    return !!dateFrom.value && !!dateTo.value;
  return true;
});

const filteredTasks = computed(() => {
  if (selectedTaskId.value) {
    const task = props.tasks.find((t) => t.id === selectedTaskId.value);
    return task ? [task] : [];
  }
  return props.tasks;
});

const filteredSessions = computed(() => {
  if (selectedTaskId.value) {
    return props.sessions.filter((s) => s.taskId === selectedTaskId.value);
  }
  return props.sessions;
});

const panelRef = ref<HTMLDivElement | null>(null);

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      nextTick(() => panelRef.value?.focus());
    }
  }
);

// ---- 方法 ----
function closeModal() {
  emit("close");
}

async function handleExport() {
  try {
    const filters = useCurrentFilters.value
      ? {
          status:
            props.currentFilters.status === "all"
              ? undefined
              : props.currentFilters.status,
          priority: props.currentFilters.priority || undefined,
          tag: props.currentFilters.tag || undefined,
          search: props.currentFilters.search || undefined,
        }
      : undefined;

    const dateRange = useCurrentFilters.value
      ? undefined
      : dateFrom.value
        ? {
            start: dateFrom.value,
            end: dateTo.value || dateFrom.value,
          }
        : undefined;

    const content = exportAdvancedReport({
      type: exportType.value,
      format: exportFormat.value,
      tasks: filteredTasks.value,
      sessions: filteredSessions.value,
      reflections: [],
      dateRange,
      filters,
    });

    // Generate filename
    const dateStr = formatDate(new Date());
    const filename = `potodorox-export-${dateStr}.${exportFormat.value === "markdown" ? "md" : exportFormat.value}`;

    // Download file
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    closeModal();
  } catch (err) {
    if (import.meta.env.DEV) console.error("Export failed:", err);
    alert("导出失败，请重试");
  }
}

function resetCustomFilters() {
  dateFrom.value = "";
  dateTo.value = "";
}

function resetTaskSelection() {
  selectedTaskId.value = null;
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">导出任务数据</h2>
            <button class="modal-close" @click="closeModal">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- 导出格式 -->
            <div class="form-group">
              <label class="form-label">导出格式</label>
              <div class="format-options">
                <button
                  class="format-btn"
                  :class="{ active: exportFormat === 'markdown' }"
                  @click="exportFormat = 'markdown'"
                >
                  📄 Markdown
                </button>
                <button
                  class="format-btn"
                  :class="{ active: exportFormat === 'csv' }"
                  @click="exportFormat = 'csv'"
                >
                  📊 CSV
                </button>
                <button
                  class="format-btn"
                  :class="{ active: exportFormat === 'json' }"
                  @click="exportFormat = 'json'"
                >
                  🔧 JSON
                </button>
              </div>
            </div>

            <!-- 导出类型 -->
            <div class="form-group">
              <label class="form-label">导出类型</label>
              <select v-model="exportType" class="form-select">
                <option value="task">任务报告</option>
                <option value="daily">日报</option>
                <option value="weekly">周报</option>
                <option value="biweekly">半月报 (15天)</option>
              </select>
            </div>

            <!-- 指定任务 -->
            <div class="form-group">
              <label class="form-label">指定任务 (可选)</label>
              <select v-model="selectedTaskId" class="form-select">
                <option value="">全部任务</option>
                <option v-for="task in tasks" :key="task.id" :value="task.id">
                  {{ task.title }}
                </option>
              </select>
              <button
                v-if="selectedTaskId"
                class="reset-btn"
                @click="resetTaskSelection"
              >
                清除任务选择
              </button>
            </div>

            <!-- 筛选选项 -->
            <div class="form-group">
              <label class="form-label">筛选条件</label>
              <div class="filter-toggle">
                <label class="toggle-label">
                  <input v-model="useCurrentFilters" type="checkbox" />
                  <span>使用当前面板筛选条件</span>
                </label>
              </div>
              <p class="filter-hint">
                当前筛选: 状态={{ currentFilters.status }}, 优先级={{
                  currentFilters.priority || "全部"
                }}, 标签={{ currentFilters.tag || "全部" }}, 搜索={{
                  currentFilters.search || "无"
                }}
              </p>
            </div>

            <!-- 自定义日期范围 -->
            <div v-if="!useCurrentFilters" class="form-group">
              <label class="form-label">日期范围</label>
              <div class="date-range-inputs">
                <input
                  v-model="dateFrom"
                  type="date"
                  class="form-input"
                  placeholder="开始日期"
                />
                <span class="date-separator">-</span>
                <input
                  v-model="dateTo"
                  type="date"
                  class="form-input"
                  :placeholder="
                    exportType === 'daily' ? '结束日期 (可选)' : '结束日期'
                  "
                />
              </div>
              <button class="reset-btn" @click="resetCustomFilters">
                重置日期
              </button>
            </div>

            <!-- 统计信息 -->
            <div class="export-stats">
              <div class="stat-item">
                <span class="stat-label">任务数量:</span>
                <span class="stat-value">{{ filteredTasks.length }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">会话数量:</span>
                <span class="stat-value">{{ filteredSessions.length }}</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">取消</button>
            <button
              class="btn btn-primary"
              :disabled="!canExport"
              @click="handleExport"
            >
              导出
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ---- Modal Overlay ---- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

/* ---- Modal Content ---- */
.modal-content {
  background: var(--surface);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* ---- Modal Header ---- */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--glass-border);
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--hover-bg);
  color: var(--text);
}

/* ---- Modal Body ---- */
.modal-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

/* ---- Form Groups ---- */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 8px;
}

/* ---- Format Options ---- */
.format-options {
  display: flex;
  gap: 8px;
}

.format-btn {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-secondary);
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.format-btn:hover {
  border-color: var(--accent);
  color: var(--text);
}

.format-btn.active {
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
}

/* ---- Form Select ---- */
.form-select {
  width: 100%;
  padding: 10px 12px;
  font-size: 0.9rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  cursor: pointer;
  outline: none;
}

.form-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-glow);
}

/* ---- Filter Toggle ---- */
.filter-toggle {
  margin-bottom: 8px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.toggle-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--accent);
}

.filter-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
}

/* ---- Date Range Inputs ---- */
.date-range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-input {
  flex: 1;
  padding: 10px 12px;
  font-size: 0.85rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  outline: none;
}

.form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-glow);
}

.date-separator {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.reset-btn {
  margin-top: 8px;
  padding: 6px 12px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background: var(--hover-bg);
  color: var(--text);
}

/* ---- Export Stats ---- */
.export-stats {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: var(--glass-bg);
  border-radius: 8px;
  border: 1px solid var(--glass-border);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}

/* ---- Modal Footer ---- */
.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid var(--glass-border);
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.btn-secondary:hover {
  background: var(--hover-bg);
  color: var(--text);
}

.btn-primary {
  background: var(--accent);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--accent-glow);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ---- Modal Transition ---- */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
