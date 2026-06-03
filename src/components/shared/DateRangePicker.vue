<script setup lang="ts">
import { ref, computed } from "vue";
import {
  formatDate,
  getThisWeek,
  getThisMonth,
  getToday,
} from "@/utils/format";

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;
  label: string;
}

const emit = defineEmits<{
  select: [range: DateRange];
}>();

// ---- 预设范围 ----

type PresetKey =
  | "today"
  | "last7"
  | "last30"
  | "thisWeek"
  | "thisMonth"
  | "custom";

interface Preset {
  key: PresetKey;
  label: string;
  icon: string;
  getRange: () => DateRange;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

const presets: Preset[] = [
  {
    key: "today",
    label: "今日",
    icon: "☀️",
    getRange: () => {
      const d = getToday();
      return { start: d, end: d, label: "今日" };
    },
  },
  {
    key: "last7",
    label: "最近 7 天",
    icon: "📅",
    getRange: () => ({
      start: daysAgo(6),
      end: getToday(),
      label: "最近 7 天",
    }),
  },
  {
    key: "last30",
    label: "最近 30 天",
    icon: "🗓️",
    getRange: () => ({
      start: daysAgo(29),
      end: getToday(),
      label: "最近 30 天",
    }),
  },
  {
    key: "thisWeek",
    label: "本周",
    icon: "📆",
    getRange: () => {
      const [start, end] = getThisWeek();
      return { start, end, label: "本周" };
    },
  },
  {
    key: "thisMonth",
    label: "本月",
    icon: "📊",
    getRange: () => {
      const [start, end] = getThisMonth();
      return { start, end, label: "本月" };
    },
  },
  {
    key: "custom",
    label: "自定义范围",
    icon: "⚙️",
    getRange: () => {
      const d = getToday();
      return { start: d, end: d, label: "自定义范围" };
    },
  },
];

// ---- 状态 ----

const activePreset = ref<PresetKey>("last7");
const customStart = ref(getToday());
const customEnd = ref(getToday());

// ---- 计算 ----

const selectedPreset = computed(
  () => presets.find((p) => p.key === activePreset.value)!
);

const displayRange = computed(() => {
  if (activePreset.value === "custom") {
    return {
      start: customStart.value,
      end: customEnd.value,
      label: "自定义范围",
    };
  }
  return selectedPreset.value.getRange();
});

// ---- 操作 ----

function selectPreset(key: PresetKey) {
  activePreset.value = key;
  if (key !== "custom") {
    emit("select", presets.find((p) => p.key === key)!.getRange());
  }
}

function confirmCustom() {
  // 确保 start <= end
  const rawStart = customStart.value;
  const rawEnd = customEnd.value;
  const start = rawStart <= rawEnd ? rawStart : rawEnd;
  const end = rawStart <= rawEnd ? rawEnd : rawStart;

  customStart.value = start;
  customEnd.value = end;

  emit("select", {
    start,
    end,
    label: `${start} — ${end}`,
  });
}
</script>

<template>
  <div class="drp-container">
    <!-- 预设选项 -->
    <div class="drp-presets">
      <button
        v-for="preset in presets"
        :key="preset.key"
        class="drp-preset-btn"
        :class="{
          active: activePreset === preset.key,
          'is-custom': preset.key === 'custom',
        }"
        @click="selectPreset(preset.key)"
      >
        <span class="drp-preset-icon">{{ preset.icon }}</span>
        <span class="drp-preset-label">{{ preset.label }}</span>
        <span
          v-if="activePreset === preset.key && preset.key !== 'custom'"
          class="drp-preset-check"
        >
          <svg
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
        </span>
      </button>
    </div>

    <!-- 自定义日期范围 -->
    <Transition name="drp-slide">
      <div v-if="activePreset === 'custom'" class="drp-custom">
        <div class="drp-custom-row">
          <label class="drp-custom-label">起始日期</label>
          <input v-model="customStart" type="date" class="drp-date-input" />
        </div>
        <div class="drp-custom-row">
          <label class="drp-custom-label">结束日期</label>
          <input v-model="customEnd" type="date" class="drp-date-input" />
        </div>
        <button class="drp-confirm-btn" @click="confirmCustom">
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
            <polyline points="20 6 9 17 4 12" />
          </svg>
          确认范围
        </button>
      </div>
    </Transition>

    <!-- 当前选中范围预览 -->
    <div class="drp-footer">
      <span class="drp-footer-label">导出范围：</span>
      <span class="drp-footer-range">{{ displayRange.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.drp-container {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ---- 预设按钮列表 ---- */
.drp-presets {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.drp-preset-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  background: var(--bg-elevated);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 0.9rem;
  text-align: left;
}

.drp-preset-btn:hover {
  background: var(--hover-bg);
  color: var(--text);
  border-color: var(--accent-dim);
}

.drp-preset-btn.active {
  background: rgba(88, 166, 255, 0.08);
  border-color: var(--accent);
  color: var(--accent);
  font-weight: 500;
}

.drp-preset-btn.is-custom {
  grid-column: 1 / -1;
}

.drp-preset-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.drp-preset-label {
  flex: 1;
}

.drp-preset-check {
  color: var(--accent);
  flex-shrink: 0;
}

/* ---- 自定义日期 ---- */
.drp-custom {
  margin-top: 12px;
  padding: 14px;
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  background: var(--bg-elevated);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.drp-custom-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.drp-custom-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  min-width: 60px;
}

.drp-date-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

.drp-date-input:focus {
  border-color: var(--accent);
}

/* 暗色模式日期输入文字颜色 */
.drp-date-input::-webkit-calendar-picker-indicator {
  filter: invert(0.7);
}

.drp-confirm-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  margin-top: 4px;
}

.drp-confirm-btn:hover {
  background: var(--accent-hover);
}

/* ---- 底部预览 ---- */
.drp-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--glass-border);
}

.drp-footer-label {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.drp-footer-range {
  font-size: 0.85rem;
  color: var(--accent);
  font-weight: 500;
}

/* ---- 动画 ---- */
.drp-slide-enter-active,
.drp-slide-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.drp-slide-enter-from,
.drp-slide-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
}

.drp-slide-enter-to,
.drp-slide-leave-from {
  opacity: 1;
  max-height: 200px;
}
</style>
