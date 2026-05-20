<script setup lang="ts">
import { ref, nextTick } from "vue";
import { PRIORITIES, STATUSES } from "@/utils/constants";
import {
  formatDate,
  formatRelativeTime,
  formatFriendlyDate,
} from "@/utils/format";
import { useTaskStore } from "@/stores/task";
import type { Task, TaskStatus, Priority } from "@/types";

interface Props {
  tasks: Task[];
  searchQuery?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  toggleDone: [task: Task];
  openDetail: [task: Task];
  openEdit: [task: Task];
  delete: [taskId: string];
  create: [];
}>();

const taskStore = useTaskStore();
const expandedTaskId = ref<string | null>(null);
const inlineEditingId = ref<string | null>(null);
const inlineEditTitle = ref("");
const inlineEditInputRef = ref<HTMLInputElement | null>(null);

function getPriorityInfo(priority: Priority) {
  return PRIORITIES.find((p) => p.value === priority) || PRIORITIES[1];
}

function getStatusInfo(status: TaskStatus) {
  return STATUSES.find((s) => s.value === status) || STATUSES[0];
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return dueDate < formatDate(new Date());
}

function isDueSoon(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
}

function toggleExpand(taskId: string) {
  expandedTaskId.value = expandedTaskId.value === taskId ? null : taskId;
}

function startInlineEdit(task: Task) {
  inlineEditingId.value = task.id;
  inlineEditTitle.value = task.title;
  nextTick(() => {
    inlineEditInputRef.value?.focus();
    inlineEditInputRef.value?.select();
  });
}

async function saveInlineEdit(task: Task) {
  const newTitle = inlineEditTitle.value.trim();
  if (newTitle && newTitle !== task.title) {
    await taskStore.updateTask(task.id, { title: newTitle });
  }
  inlineEditingId.value = null;
}

function cancelInlineEdit() {
  inlineEditingId.value = null;
}

function onInlineEditKeydown(e: KeyboardEvent, task: Task) {
  if (e.key === "Enter") {
    e.preventDefault();
    saveInlineEdit(task);
  } else if (e.key === "Escape") {
    cancelInlineEdit();
  }
}
</script>

<template>
  <div class="list-view">
    <div v-if="tasks.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity="0.4"
        >
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      </div>
      <p class="empty-title">暂无任务</p>
      <p class="empty-desc">
        {{
          props.searchQuery
            ? "没有匹配的搜索结果"
            : "点击「新建任务」或按 N 键创建第一个任务"
        }}
      </p>
      <button
        v-if="!props.searchQuery"
        class="empty-action"
        @click="emit('create')"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        新建任务
      </button>
    </div>

    <div v-else class="task-list">
      <TransitionGroup name="task-item">
        <div
          v-for="task in tasks"
          :key="task.id"
          class="task-card"
          :class="{
            expanded: expandedTaskId === task.id,
            done: task.status === 'done',
            overdue: isOverdue(task.dueDate) && task.status !== 'done',
          }"
        >
          <div class="task-row" @click="toggleExpand(task.id)">
            <button
              class="task-checkbox"
              :class="{ checked: task.status === 'done' }"
              @click.stop="emit('toggleDone', task)"
            >
              <svg
                v-if="task.status === 'done'"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
            <div class="task-title-area" @dblclick.stop="startInlineEdit(task)">
              <input
                v-if="inlineEditingId === task.id"
                ref="inlineEditInputRef"
                v-model="inlineEditTitle"
                class="inline-edit-input"
                @blur="saveInlineEdit(task)"
                @keydown="onInlineEditKeydown($event, task)"
                @click.stop
              />
              <span
                v-else
                class="task-title"
                :class="{ 'line-through opacity-50': task.status === 'done' }"
                @click.stop="emit('openDetail', task)"
                >{{ task.title }}</span
              >
            </div>
            <span
              class="priority-badge"
              :style="{
                backgroundColor: getPriorityInfo(task.priority).color + '20',
                color: getPriorityInfo(task.priority).color,
              }"
              >{{ getPriorityInfo(task.priority).label }}</span
            >
            <div class="task-tags">
              <span
                v-for="tag in task.tags.slice(0, 2)"
                :key="tag"
                class="tag-chip"
                >{{ tag }}</span
              >
              <span v-if="task.tags.length > 2" class="tag-more"
                >+{{ task.tags.length - 2 }}</span
              >
            </div>
            <span
              v-if="task.actualPomodoros > 0 || task.estimatedPomodoros > 0"
              class="pomodoro-count"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                opacity="0.7"
              >
                <circle cx="12" cy="13" r="9" fill="#F85149" opacity="0.8" />
                <rect
                  x="9"
                  y="1"
                  width="6"
                  height="4"
                  rx="1"
                  fill="#3FB950"
                  opacity="0.7"
                />
                <path
                  d="M12 7v3M9 10l3 3 3-3"
                  stroke="white"
                  stroke-width="1.5"
                  fill="none"
                  stroke-linecap="round"
                />
              </svg>
              {{ task.actualPomodoros }}/{{ task.estimatedPomodoros }}
            </span>
            <span
              v-if="task.dueDate"
              class="due-date"
              :class="{
                overdue: isOverdue(task.dueDate) && task.status !== 'done',
                'due-soon': isDueSoon(task.dueDate) && task.status !== 'done',
              }"
            >
              <svg
                width="12"
                height="12"
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
            </span>
            <div class="task-actions">
              <button
                class="action-btn"
                title="编辑"
                @click.stop="emit('openEdit', task)"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                  />
                  <path
                    d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                  />
                </svg>
              </button>
              <button
                class="action-btn delete-btn"
                title="删除"
                @click.stop="emit('delete', task.id)"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- 展开详情 -->
          <Transition name="expand">
            <div v-if="expandedTaskId === task.id" class="task-detail">
              <div class="detail-section">
                <div class="detail-label">状态</div>
                <span
                  class="status-badge"
                  :style="{
                    color: getStatusInfo(task.status).color,
                    backgroundColor: getStatusInfo(task.status).color + '15',
                  }"
                  >{{ getStatusInfo(task.status).label }}</span
                >
              </div>
              <div v-if="task.description" class="detail-section">
                <div class="detail-label">描述</div>
                <p class="detail-description">{{ task.description }}</p>
              </div>
              <div v-if="task.plan || task.completion" class="detail-section">
                <div class="detail-label">计划</div>
                <p v-if="task.plan" class="detail-description">
                  {{ task.plan }}
                </p>
                <p
                  v-else-if="task.completion"
                  class="detail-description text-muted"
                >
                  暂无计划
                </p>
              </div>
              <div class="detail-section">
                <div class="detail-label">番茄钟</div>
                <div class="detail-meta">
                  已完成 {{ task.actualPomodoros }} / 预计
                  {{ task.estimatedPomodoros }}
                </div>
              </div>
              <div v-if="task.dueDate" class="detail-section">
                <div class="detail-label">截止日期</div>
                <div class="detail-meta">
                  {{ formatFriendlyDate(task.dueDate) }} ({{
                    formatRelativeTime(task.dueDate)
                  }})
                </div>
              </div>
              <div class="detail-section">
                <div class="detail-label">创建时间</div>
                <div class="detail-meta">
                  {{ formatRelativeTime(task.createdAt) }}
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.list-view {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-card {
  background: var(--glass-bg);
  backdrop-filter: blur(8px) saturate(140%);
  -webkit-backdrop-filter: blur(8px) saturate(140%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 0;
  overflow: hidden;
  transition: all var(--transition-fast);
}

.task-card:hover {
  border-color: var(--accent-dim);
  box-shadow:
    0 0 16px var(--accent-glow),
    var(--glass-shadow);
  transform: translateY(-1px);
}

.task-card.done {
  opacity: 0.75;
}

.task-card.overdue {
  border-left: 3px solid #f85149;
}

.task-card.expanded {
  box-shadow:
    0 0 20px var(--accent-glow),
    var(--glass-shadow);
}

.task-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  min-height: 52px;
}

.task-checkbox {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--glass-border);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  color: white;
  padding: 0;
}

.task-checkbox:hover {
  border-color: var(--accent);
  box-shadow: 0 0 8px var(--accent-glow);
}

.task-checkbox.checked {
  background: #3fb950;
  border-color: #3fb950;
}

.task-checkbox.checked:hover {
  filter: brightness(1.2);
}

.task-title-area {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.task-title {
  font-size: 0.9rem;
  color: var(--text);
  line-height: 1.5;
  word-break: break-word;
}

.task-title:hover {
  color: var(--accent);
}

.inline-edit-input {
  flex: 1;
  padding: 6px 10px;
  font-size: 0.9rem;
  background: var(--bg);
  border: 1px solid var(--accent);
  border-radius: var(--radius-md);
  color: var(--text);
  outline: none;
  box-shadow:
    0 0 0 3px var(--active-bg),
    0 0 15px var(--accent-glow);
  min-width: 0;
}

.priority-badge {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 600;
}

.task-tags {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  max-width: 140px;
  overflow: hidden;
}

.tag-chip {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  background: var(--active-bg);
  color: var(--accent);
  white-space: nowrap;
}

.tag-more {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.pomodoro-count {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.due-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.due-date.overdue {
  color: #f85149;
  font-weight: 600;
}

.due-date.due-soon {
  color: #e3b341;
}

.task-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.task-card:hover .task-actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  padding: 0;
}

.action-btn:hover {
  background: var(--hover-bg);
  color: var(--text);
  border-color: var(--text-tertiary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-btn.delete-btn:hover {
  border-color: #f85149;
  color: #f85149;
  background: color-mix(in srgb, #f85149 10%, transparent);
  box-shadow: 0 0 12px rgba(248, 81, 73, 0.3);
}

.task-detail {
  padding: 0 16px 16px;
  border-top: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.2);
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
  border-bottom: 1px solid var(--glass-border);
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-description {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  word-break: break-word;
}

.detail-description.text-muted {
  color: var(--text-tertiary);
}

.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
}

.detail-meta {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 20px;
  text-align: center;
  color: var(--text-tertiary);
}

.empty-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.empty-desc {
  font-size: 0.85rem;
  line-height: 1.5;
}

.empty-action {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius-lg);
  background: var(--active-bg);
  color: var(--accent);
  border: 1px solid var(--accent-dim);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.empty-action:hover {
  background: var(--accent);
  color: white;
  box-shadow: 0 0 20px var(--accent-glow);
}

/* 列表项过渡 */
.task-item-enter-active {
  transition: all var(--transition-normal);
}

.task-item-leave-active {
  transition: all var(--transition-fast);
}

.task-item-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.task-item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.task-item-move {
  transition: transform var(--transition-normal);
}

/* 展开动画 */
.expand-enter-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
