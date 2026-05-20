<script setup lang="ts">
import { computed, ref } from "vue";
import { PRIORITIES } from "@/utils/constants";
import { formatFriendlyDate } from "@/utils/format";
import { useTaskStore } from "@/stores/task";
import type { Task, TaskStatus, Priority } from "@/types";

interface Props {
  tasks: Task[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  openEdit: [task: Task];
  openDetail: [task: Task, tab: "plan" | "completion" | "sessions"];
}>();

const taskStore = useTaskStore();

const kanbanColumns: { status: TaskStatus; label: string; color: string }[] = [
  { status: "todo", label: "待办", color: "#8B949E" },
  { status: "in_progress", label: "进行中", color: "#58A6FF" },
  { status: "done", label: "已完成", color: "#3FB950" },
  { status: "archived", label: "已归档", color: "#484F58" },
];

const kanbanTasks = computed(() => {
  const groups: Record<TaskStatus, Task[]> = {
    todo: [],
    in_progress: [],
    done: [],
    archived: [],
  };
  props.tasks.forEach((t) => {
    if (groups[t.status]) {
      groups[t.status].push(t);
    }
  });
  return groups;
});

function getPriorityInfo(priority: Priority) {
  return PRIORITIES.find((p) => p.value === priority) || PRIORITIES[1];
}

async function moveTask(task: Task, newStatus: TaskStatus) {
  if (task.status !== newStatus) {
    await taskStore.updateTask(task.id, { status: newStatus });

    const refreshed = taskStore.getTaskById(task.id);
    if (!refreshed) return;

    if (newStatus === "in_progress" && !refreshed.plan) {
      emit("openDetail", refreshed, "plan");
    } else if (newStatus === "done" && !refreshed.completion) {
      emit("openDetail", refreshed, "completion");
    }
  }
}

// ---- 拖拽 ----
const dragTaskId = ref<string | null>(null);
const justDragged = ref(false);
const dragOverStatus = ref<TaskStatus | null>(null);

function onDragStart(e: DragEvent, task: Task) {
  dragTaskId.value = task.id;
  justDragged.value = false;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);
  }
}

function onDragOver(e: DragEvent, status: TaskStatus) {
  e.preventDefault();
  dragOverStatus.value = status;
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "move";
  }
}

function onDragLeave() {
  dragOverStatus.value = null;
}

function onDrop(e: DragEvent, newStatus: TaskStatus) {
  e.preventDefault();
  dragOverStatus.value = null;
  const taskId = e.dataTransfer?.getData("text/plain") || dragTaskId.value;
  dragTaskId.value = null;
  if (!taskId) return;
  const task = taskStore.getTaskById(taskId);
  if (task && task.status !== newStatus) {
    moveTask(task, newStatus);
    justDragged.value = true;
  }
}

let dragEndTimer: ReturnType<typeof setTimeout> | null = null;

function onDragEnd() {
  dragTaskId.value = null;
  dragOverStatus.value = null;
  // 拖拽结束后 300ms 内忽略 click 事件（防止拖拽被识别为点击）
  if (dragEndTimer) clearTimeout(dragEndTimer);
  dragEndTimer = setTimeout(() => {
    justDragged.value = false;
  }, 300);
}

function onCardClick(task: Task) {
  if (justDragged.value) return;
  emit("openEdit", task);
}
</script>

<template>
  <div class="kanban-view">
    <div class="kanban-board">
      <div v-for="col in kanbanColumns" :key="col.status" class="kanban-column">
        <div class="column-header" :style="{ borderTopColor: col.color }">
          <div class="column-title-row">
            <span class="column-dot" :style="{ backgroundColor: col.color }" />
            <span class="column-title">{{ col.label }}</span>
            <span class="column-count">{{
              kanbanTasks[col.status].length
            }}</span>
          </div>
        </div>

        <div
          class="column-body"
          :class="{ 'drag-over': dragOverStatus === col.status }"
          @dragover="onDragOver($event, col.status)"
          @dragleave="onDragLeave"
          @drop="onDrop($event, col.status)"
        >
          <div v-if="kanbanTasks[col.status].length === 0" class="column-empty">
            暂无任务
          </div>

          <TransitionGroup name="kanban-card">
            <div
              v-for="task in kanbanTasks[col.status]"
              :key="task.id"
              class="kanban-task-card"
              :class="{ 'is-dragging': dragTaskId === task.id }"
              draggable="true"
              style="cursor: grab"
              @dragstart="onDragStart($event, task)"
              @dragend="onDragEnd"
              @click="onCardClick(task)"
            >
              <div class="kanban-card-header">
                <span
                  class="kanban-priority-dot"
                  :style="{
                    backgroundColor: getPriorityInfo(task.priority).color,
                  }"
                  :title="getPriorityInfo(task.priority).label"
                />
                <span
                  class="kanban-card-title"
                  :class="{ 'line-through opacity-50': task.status === 'done' }"
                >
                  {{ task.title }}
                </span>
              </div>

              <div class="kanban-card-footer">
                <div v-if="task.tags.length > 0" class="kanban-card-tags">
                  <span
                    v-for="tag in task.tags.slice(0, 2)"
                    :key="tag"
                    class="tag-chip small"
                  >
                    {{ tag }}
                  </span>
                </div>
                <span class="kanban-pomodoro">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    opacity="0.6"
                  >
                    <circle
                      cx="12"
                      cy="13"
                      r="9"
                      fill="#F85149"
                      opacity="0.8"
                    />
                    <rect
                      x="9"
                      y="1"
                      width="6"
                      height="4"
                      rx="1"
                      fill="#3FB950"
                      opacity="0.7"
                    />
                  </svg>
                  {{ task.actualPomodoros }}/{{ task.estimatedPomodoros }}
                </span>
              </div>

              <div v-if="task.dueDate" class="kanban-card-due">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {{ formatFriendlyDate(task.dueDate) }}
              </div>

              <div class="kanban-card-actions">
                <button
                  v-for="targetCol in kanbanColumns.filter(
                    (c) => c.status !== col.status
                  )"
                  :key="targetCol.status"
                  class="kanban-move-btn"
                  :title="'移动到 ' + targetCol.label"
                  @click.stop="moveTask(task, targetCol.status)"
                >
                  {{ targetCol.label }}
                </button>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tag-chip {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  background: var(--active-bg);
  color: var(--accent);
  white-space: nowrap;
}

.tag-chip.small {
  padding: 1px 6px;
  font-size: 0.65rem;
}

.kanban-view {
  min-height: 100%;
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  min-height: 500px;
}

.kanban-column {
  display: flex;
  flex-direction: column;
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  overflow: hidden;
}

.column-header {
  padding: 14px 16px;
  border-top: 3px solid;
  background: color-mix(in srgb, var(--glass-bg) 60%, transparent);
  backdrop-filter: blur(8px);
  flex-shrink: 0;
}

.column-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.column-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
}

.column-count {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  background: var(--hover-bg);
  padding: 1px 7px;
  border-radius: 10px;
  margin-left: auto;
}

.column-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.column-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  font-size: 0.8rem;
  color: var(--text-tertiary);
  text-align: center;
}

.kanban-task-card {
  padding: 12px;
  background: var(--glass-bg);
  backdrop-filter: blur(8px) saturate(140%);
  -webkit-backdrop-filter: blur(8px) saturate(140%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  transition: all var(--transition-fast);
}

.kanban-task-card[draggable="true"] {
  cursor: grab;
}

.kanban-task-card.is-dragging {
  cursor: grabbing;
  opacity: 0.6;
  transform: rotate(2deg);
}

.column-body.drag-over {
  background: var(--accent-dim);
  border-radius: var(--radius-md);
}

.kanban-task-card:hover {
  border-color: var(--accent-dim);
  box-shadow:
    0 0 16px var(--accent-glow),
    var(--glass-shadow);
  transform: translateY(-2px);
}

.kanban-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.kanban-priority-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.kanban-card-title {
  font-size: 0.85rem;
  color: var(--text);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kanban-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  gap: 8px;
}

.kanban-card-tags {
  display: flex;
  gap: 4px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.kanban-pomodoro {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.7rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.kanban-card-due {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 0.7rem;
  color: var(--text-tertiary);
}

.kanban-card-actions {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--glass-border);
  flex-wrap: wrap;
}

.kanban-move-btn {
  padding: 2px 8px;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-tertiary);
  font-size: 0.65rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.kanban-move-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--active-bg);
  box-shadow: 0 0 8px var(--accent-glow);
}

/* 看板卡片过渡 */
.kanban-card-enter-active {
  transition: all var(--transition-normal);
}

.kanban-card-leave-active {
  transition: all var(--transition-fast);
}

.kanban-card-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.kanban-card-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@media (max-width: 768px) {
  .kanban-board {
    grid-template-columns: 1fr;
  }
}
</style>
