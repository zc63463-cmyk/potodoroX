<script setup lang="ts">
import { computed } from "vue";
import type { Reflection } from "@/types";
import { formatFriendlyDate } from "@/utils/format";

// ---- Props ----
const props = defineProps<{
  reflections: Reflection[];
  allTags: string[];
  activeTag: string | null;
  dateFrom: string | null;
  dateTo: string | null;
}>();

const emit = defineEmits<{
  (e: "filterByTag", tag: string | null): void;
  (
    e: "filterByDateRange",
    dateFrom: string | null,
    dateTo: string | null
  ): void;
  (e: "openDetail", reflection: Reflection): void;
  (e: "deleteReflection", id: string): void;
}>();

// ---- 计算属性 ----
const filteredReflections = computed(() => {
  let list = [...props.reflections];
  if (props.activeTag) {
    list = list.filter((r) => r.tags.includes(props.activeTag!));
  }
  if (props.dateFrom) {
    list = list.filter((r) => r.date >= props.dateFrom!);
  }
  if (props.dateTo) {
    list = list.filter((r) => r.date <= props.dateTo!);
  }
  return list;
});

// ---- 方法 ----
function getContentPreview(content: string): string {
  if (!content) return "无内容";
  const stripped = content
    .replace(/[#*_[\]]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  return stripped.length > 150 ? stripped.slice(0, 150) + "..." : stripped;
}

function getMoodInfo(mood: string) {
  const map: Record<string, { emoji: string; color: string }> = {
    great: { emoji: "\u{1F604}", color: "#3FB950" },
    good: { emoji: "\u{1F642}", color: "#58A6FF" },
    normal: { emoji: "\u{1F610}", color: "#D29922" },
    bad: { emoji: "\u{1F61F}", color: "#F0883E" },
    terrible: { emoji: "\u{1F61E}", color: "#F85149" },
  };
  return map[mood] || map.normal;
}

function handleDateFromChange(e: Event) {
  const target = e.target as HTMLInputElement;
  emit("filterByDateRange", target.value || null, props.dateTo);
}

function handleDateToChange(e: Event) {
  const target = e.target as HTMLInputElement;
  emit("filterByDateRange", props.dateFrom, target.value || null);
}

function clearDateRange() {
  emit("filterByDateRange", null, null);
}
</script>

<template>
  <div class="browser-panel">
    <!-- 日期筛选栏 -->
    <div class="date-filter-bar">
      <div class="date-filter-label">📅 浏览历史</div>
      <div class="date-filter-range">
        <label class="date-field" :class="{ active: !!dateFrom }">
          <svg
            class="date-field-icon"
            width="14"
            height="14"
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
          <input
            type="date"
            class="date-field-input"
            :value="dateFrom"
            placeholder="开始"
            @change="handleDateFromChange"
          />
        </label>
        <span class="date-range-arrow">→</span>
        <label class="date-field" :class="{ active: !!dateTo }">
          <svg
            class="date-field-icon"
            width="14"
            height="14"
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
          <input
            type="date"
            class="date-field-input"
            :value="dateTo"
            placeholder="结束"
            @change="handleDateToChange"
          />
        </label>
      </div>
      <div class="date-filter-actions">
        <button
          v-if="dateFrom || dateTo"
          class="btn-clear-filter"
          @click="clearDateRange"
        >
          清除
        </button>
      </div>
    </div>

    <!-- 标签筛选栏 -->
    <div v-if="allTags.length > 0" class="tag-filter-bar">
      <button
        class="tag-filter-pill"
        :class="{ active: activeTag === null }"
        @click="emit('filterByTag', null)"
      >
        全部
      </button>
      <button
        v-for="tag in allTags"
        :key="tag"
        class="tag-filter-pill"
        :class="{ active: activeTag === tag }"
        @click="emit('filterByTag', activeTag === tag ? null : tag)"
      >
        {{ tag }}
      </button>
    </div>
    <div v-else class="tag-filter-empty">暂无标签</div>

    <!-- 反思卡片列表 -->
    <div v-if="filteredReflections.length === 0" class="browser-empty">
      暂无反思记录
    </div>
    <div v-else class="reflection-card-list">
      <div v-for="r in filteredReflections" :key="r.id" class="reflection-card">
        <div class="reflection-card-header" @click="emit('openDetail', r)">
          <div class="reflection-card-meta">
            <span class="reflection-card-date">{{
              formatFriendlyDate(r.date)
            }}</span>
            <span
              class="reflection-card-mood"
              :style="{ color: getMoodInfo(r.mood).color }"
            >
              {{ getMoodInfo(r.mood).emoji }}
            </span>
            <span
              v-for="tag in r.tags"
              :key="tag"
              class="reflection-card-tag"
              >{{ tag }}</span
            >
          </div>
          <button
            class="reflection-card-delete"
            title="删除"
            @click.stop="emit('deleteReflection', r.id)"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path
                d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zM11 3V1.75A1.75 1.75 0 009.25 0h-2.5A1.75 1.75 0 005 1.75V3H2.75a.75.75 0 000 1.5h.69l.95 9.3A1.75 1.75 0 006.12 16h3.76a1.75 1.75 0 001.73-1.5l.95-9.3h.69a.75.75 0 000-1.5H11zm-6.56 1.5l.91 8.82a.25.25 0 00.25.22h3.8a.25.25 0 00.25-.22l.91-8.82H4.44z"
              />
            </svg>
          </button>
        </div>

        <p class="reflection-card-preview">
          {{ getContentPreview(r.content) }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.browser-panel {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--glass-shadow);
}

/* ---- 标签筛选栏 ---- */
.tag-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-filter-pill {
  padding: 4px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.25s ease;
}

.tag-filter-pill:hover {
  border-color: var(--accent-dim);
  color: var(--text);
  background: var(--hover-bg);
}

.tag-filter-pill.active {
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
  box-shadow: 0 0 10px var(--accent-glow);
}

.tag-filter-empty {
  font-size: 0.85rem;
  color: var(--text-muted);
  padding: 8px 0;
}

/* ---- 日期筛选栏 ---- */
.date-filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border-radius: 12px;
  background: var(--surface);
  border: 1px solid var(--glass-border);
}

.date-filter-label {
  font-size: 0.9rem;
  color: var(--text);
  font-weight: 600;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}

.date-filter-range {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

/* ---- 日期输入字段 ---- */
.date-field {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  min-width: 0;
  flex: 1;
}

.date-field:hover {
  border-color: var(--accent-dim);
  background: var(--hover-bg);
}

.date-field.active {
  border-color: var(--accent);
  background: rgba(88, 166, 255, 0.06);
  box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.08);
}

.date-field-icon {
  color: var(--text-muted);
  flex-shrink: 0;
  transition: color 0.25s ease;
}

.date-field.active .date-field-icon {
  color: var(--accent);
}

.date-field-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  min-width: 120px;
  padding: 0;
}

.date-field-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(0.6);
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.date-field.active .date-field-input::-webkit-calendar-picker-indicator {
  opacity: 1;
  filter: invert(0.5) sepia(1) saturate(5) hue-rotate(180deg);
}

/* ---- 日期范围箭头 ---- */
.date-range-arrow {
  color: var(--text-muted);
  font-size: 0.95rem;
  font-weight: 300;
  flex-shrink: 0;
}

/* ---- 清除按钮 ---- */
.date-filter-actions {
  flex-shrink: 0;
}

.btn-clear-filter {
  padding: 7px 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-clear-filter:hover {
  background: rgba(248, 81, 73, 0.1);
  border-color: rgba(248, 81, 73, 0.3);
  color: var(--danger);
}

/* ---- 空状态 ---- */
.browser-empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* ---- 卡片列表 ---- */
.reflection-card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reflection-card {
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  background: var(--surface);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.reflection-card:hover {
  border-color: var(--accent-dim);
  background: var(--hover-bg);
  box-shadow: 0 4px 16px var(--accent-glow);
  transform: translateY(-1px);
}

.reflection-card:hover .reflection-card-delete {
  opacity: 1;
}

.reflection-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.reflection-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.reflection-card-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.reflection-card-mood {
  font-size: 1rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.reflection-card-tag {
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--accent-dim);
  background: rgba(88, 166, 255, 0.08);
  color: var(--accent);
  font-size: 0.7rem;
  font-weight: 500;
}

.reflection-card-preview {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

.reflection-card-delete {
  position: absolute;
  top: 10px;
  right: 10px;
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

.reflection-card-delete:hover {
  background: rgba(248, 81, 73, 0.15);
  color: var(--danger);
  box-shadow: 0 0 8px rgba(248, 81, 73, 0.2);
}
</style>
