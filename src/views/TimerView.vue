<script setup lang="ts">
// ============================================================
// PomodoroX - 计时器视图（主视图）
// 沉浸式番茄钟计时器，大气背景 + 环形进度 + 呼吸动画
// ============================================================

import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
  defineAsyncComponent,
} from "vue";
import { useTimerStore } from "@/stores/timer";
import { useTaskStore } from "@/stores/task";
import { useSettingsStore } from "@/stores/settings";
import { useSessionStore } from "@/stores/session";
import { useAppStore } from "@/stores/app";
import { useNotification } from "@/composables/useNotification";
import {
  playFocusStart,
  playBreakStart,
  playSessionComplete,
  playSuccess,
} from "@/composables/useAudio";
import { TIMER_MODES } from "@/utils/constants";
import { formatMinutes, getWeekdayName, formatDate } from "@/utils/format";
import type { Task, SessionType } from "@/types";
import { animate, spring } from "animejs";
import GooeyNav from "@/components/GooeyNav.vue";

// MagicRings 拆分为异步 chunk，避免 Three.js 拖累 TimerView 主包
const MagicRings = defineAsyncComponent(
  () => import("@/components/MagicRings.vue")
);

// ---- Stores ----
const timerStore = useTimerStore();
const taskStore = useTaskStore();
const settingsStore = useSettingsStore();
const sessionStore = useSessionStore();
const appStore = useAppStore();

// ---- Composables ----
const { sendNotification, permissionState } = useNotification();

// ---- 本地状态 ----
const showTaskSelector = ref(false);
const showCelebration = ref(false);
const celebrationParticles = ref<
  Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    delay: number;
    color: string;
  }>
>([]);

// ---- Session 规划/总结提示 ----
const showSessionPlanPrompt = ref(false);
const sessionPlanInput = ref("");
const showSessionCompletionPrompt = ref(false);
const sessionCompletionInput = ref("");

// ---- Anime.js 动效状态 ----
/** 进度环 SVG 元素引用 */
const ringCircleRef = ref<SVGCircleElement | null>(null);
/** 主按钮元素引用 */
const primaryBtnRef = ref<HTMLElement | null>(null);
/** 是否已执行初始动画绑定 */
const animeInit = ref(false);

// ---- 计算属性 ----

/** 当前任务 */
const currentTask = computed<Task | undefined>(() => {
  if (!timerStore.currentTaskId) return undefined;
  return taskStore.getTaskById(timerStore.currentTaskId);
});

/** 当前任务名称 */
const currentTaskName = computed(
  () => currentTask.value?.title || "未选择任务"
);

/** 会话类型配置 */
const sessionConfig = computed(() => TIMER_MODES[timerStore.sessionType]);

/** 会话类型中文标签 */
const sessionLabel = computed(() => sessionConfig.value.labelZh);

/** 会话类型颜色 */
const sessionColor = computed(() => sessionConfig.value.color);

/** GooeyNav 选项 */
const gooeyItems = computed(() => [
  {
    value: "work" as const,
    label: TIMER_MODES.work.labelZh,
    color: TIMER_MODES.work.color,
  },
  {
    value: "short_break" as const,
    label: TIMER_MODES.short_break.labelZh,
    color: TIMER_MODES.short_break.color,
  },
  {
    value: "long_break" as const,
    label: TIMER_MODES.long_break.labelZh,
    color: TIMER_MODES.long_break.color,
  },
  {
    value: "free" as const,
    label: TIMER_MODES.free.labelZh,
    color: TIMER_MODES.free.color,
  },
]);

const gooeyActiveIndex = computed(() => {
  return gooeyItems.value.findIndex(
    (item) => item.value === timerStore.sessionType
  );
});

function onGooeySelect(index: number) {
  const mode = gooeyItems.value[index];
  if (mode && !timerStore.isRunning) {
    timerStore.setSessionType(mode.value as SessionType);
  }
}

/** 格式化剩余时间 */
const displayTime = computed(() => timerStore.formattedRemaining);

/** SVG 环形进度参数 */
const RING_RADIUS = 120;
const RING_STROKE = 6;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** 是否正在计时 */
const isActive = computed(() => timerStore.isRunning && !timerStore.isPaused);

/** 是否暂停 */
const isPausedState = computed(() => timerStore.isPaused);

/** 是否空闲（未开始/已重置） */
const isIdle = computed(() => !timerStore.isRunning && !timerStore.isPaused);

/** 今日日期 */
const todayDisplay = computed(() => {
  const now = new Date();
  return `${getWeekdayName(now)} ${formatDate(now)}`;
});

/** 今日专注总时长（秒） */
const todayFocusSeconds = computed(() => {
  return sessionStore.todaySessions
    .filter((s) => s.type === "work" && s.completed)
    .reduce((sum, s) => sum + s.duration, 0);
});

/** 今日专注总时长（格式化） */
const todayFocusDisplay = computed(() =>
  formatMinutes(Math.round(todayFocusSeconds.value / 60))
);

/** 已完成番茄钟数 */
const completedCount = computed(() => timerStore.completedPomodoros);

/** 连续番茄钟计数 */
const streakCount = computed(() => timerStore.pomodoroStreak);

/** 长休息间隔 */
const longBreakInterval = computed(
  () => settingsStore.settings.longBreakInterval
);

/** 可选任务列表（活跃任务） */
const selectableTasks = computed(() => taskStore.activeTasks);

/** 自由计时分钟输入 */
const freeMinutes = ref(30);
/** 自由计时秒数输入 */
const freeSeconds = ref(0);

// 切换到自由模式时，初始化输入值为当前 remaining
watch(
  () => timerStore.sessionType,
  (type) => {
    if (type === "free" && !timerStore.isRunning) {
      const totalSecs = Math.round(timerStore.remaining);
      freeMinutes.value = Math.floor(totalSecs / 60);
      freeSeconds.value = totalSecs % 60;
    }
  }
);

/** 背景渐变样式 - 根据会话类型变化 */
const backgroundStyle = computed(() => {
  const type = timerStore.sessionType;
  if (type === "work") {
    return {
      background: `
        radial-gradient(ellipse at 20% 50%, rgba(88, 166, 255, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(136, 100, 255, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(88, 166, 255, 0.04) 0%, transparent 50%),
        var(--bg)
      `,
    };
  } else if (type === "short_break") {
    return {
      background: `
        radial-gradient(ellipse at 30% 40%, rgba(63, 185, 80, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 60%, rgba(56, 211, 159, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 90%, rgba(63, 185, 80, 0.04) 0%, transparent 50%),
        var(--bg)
      `,
    };
  } else if (type === "long_break") {
    return {
      background: `
        radial-gradient(ellipse at 25% 50%, rgba(240, 136, 62, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 75% 30%, rgba(255, 183, 77, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(240, 136, 62, 0.04) 0%, transparent 50%),
        var(--bg)
      `,
    };
  }
  return { background: "var(--bg)" };
});

/** 进度环颜色 */
const ringColor = computed(() => sessionColor.value);

/** 进度环第二颜色（MagicRings 使用） */
const ringSecondaryColor = computed(() => {
  const type = timerStore.sessionType;
  switch (type) {
    case "work":
      return "#58A6FF";
    case "short_break":
      return "#3FB950";
    case "long_break":
      return "#7C3AED";
    case "free":
      return "#FF6B35";
    default:
      return "#58A6FF";
  }
});

/** 进度环发光效果 */
const ringGlow = computed(() => {
  const color = sessionColor.value;
  return `0 0 20px ${color}40, 0 0 40px ${color}20, 0 0 60px ${color}10`;
});

// ---- 方法 ----

/** 开始/暂停切换 */
function toggleTimer() {
  // 触发主按钮弹簧效果
  animatePrimaryBtn();

  if (timerStore.isRunning && !timerStore.isPaused) {
    // 暂停
    timerStore.pause();
  } else if (timerStore.isPaused) {
    // 恢复
    timerStore.resume();
  } else {
    // 开始 — 工作会话且有任务关联时，先显示规划提示
    if (timerStore.sessionType === "work" && timerStore.currentTaskId) {
      showSessionPlanPrompt.value = true;
      return; // 等待用户输入规划后再开始
    }

    // 开始 — 自由模式时传入自定义时长
    doStartTimer();
  }
}

/** 实际开始计时 */
async function doStartTimer(plan?: string) {
  // 首次开始计时时请求通知权限（基于用户手势，不会被浏览器静默拒绝）
  if (permissionState.value === "default") {
    const { requestPermission } = await import("@/composables/useNotification");
    await requestPermission();
  }

  if (timerStore.sessionType === "free") {
    const customDuration = freeMinutes.value * 60 + freeSeconds.value;
    if (customDuration <= 0) return; // 防止零时长开始
    timerStore.start(customDuration);
  } else {
    timerStore.start(undefined, plan);
  }
  // 播放音效
  if (timerStore.isWorkSession) {
    playFocusStart();
  } else {
    playBreakStart();
  }
}

let sessionPlanTimer: ReturnType<typeof setTimeout> | null = null;

/** 确认 Session 规划并开始 */
function confirmSessionPlan() {
  showSessionPlanPrompt.value = false;
  const plan = sessionPlanInput.value.trim();
  doStartTimer(plan);
  // 清空输入，为下次准备
  sessionPlanTimer = setTimeout(() => {
    sessionPlanInput.value = "";
  }, 300);
}

/** 跳过 Session 规划 */
function skipSessionPlan() {
  sessionPlanInput.value = "";
  confirmSessionPlan();
}

/** 重置计时器 */
function resetTimer() {
  timerStore.reset();
}

/** 处理快进请求 */
const showFastForwardConfirm = ref(false);

async function handleFastForward() {
  const result = await timerStore.fastForward();
  if (result.success) return;
  if (result.reason === "quota_exhausted") {
    showFastForwardConfirm.value = true;
  }
  // 'idle' 按钮已禁用，理论上不会触发
}

/** 确认超额快进 */
async function confirmFastForward() {
  showFastForwardConfirm.value = false;
  await timerStore.fastForward(true);
}

/** 取消超额快进 */
function cancelFastForward() {
  showFastForwardConfirm.value = false;
}

/** 选择任务 */
function selectTask(taskId: string | null) {
  timerStore.setCurrentTaskId(taskId);
  showTaskSelector.value = false;
}

/** 切换任务选择器 */
function toggleTaskSelector() {
  showTaskSelector.value = !showTaskSelector.value;
}

let celebrationTimer: ReturnType<typeof setTimeout> | null = null;

/** 触发庆祝动画 */
function triggerCelebration() {
  showCelebration.value = true;
  // 生成粒子
  const colors = [
    "#58A6FF",
    "#3FB950",
    "#A371F7",
    "#F0883E",
    "#F85149",
    "#FFD700",
  ];
  celebrationParticles.value = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: (Math.random() - 0.5) * 300,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 0.5,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  // 3秒后清除
  celebrationTimer = setTimeout(() => {
    showCelebration.value = false;
    celebrationParticles.value = [];
  }, 3000);
}

/** 处理会话完成 */
async function handleSessionComplete() {
  playSessionComplete();
  playSuccess();
  triggerCelebration();

  // 发送通知
  const title = timerStore.isWorkSession ? "番茄钟完成!" : "休息结束!";
  const body = timerStore.isWorkSession
    ? `太棒了！你完成了一个番茄钟 ${currentTask.value ? `- ${currentTask.value.title}` : ""}`
    : "休息结束，准备开始下一个番茄钟吧！";

  await sendNotification(title, body, {
    tag: "pomodorox-timer",
    onClick: () => {
      window.focus();
    },
  });
}

/** 确认 Session 总结 */
async function confirmSessionCompletion() {
  const taskId = timerStore.pendingCompletionForTaskId;
  if (taskId && sessionCompletionInput.value.trim()) {
    const sessions = sessionStore.getSessionsByTask(taskId);
    const latest = sessions.sort((a, b) =>
      b.startedAt.localeCompare(a.startedAt)
    )[0];
    if (latest) {
      await sessionStore.updateSession(latest.id, {
        completion: sessionCompletionInput.value.trim(),
      });
    }
  }
  showSessionCompletionPrompt.value = false;
  sessionCompletionInput.value = "";
  timerStore.clearPendingCompletion();
}

/** 跳过 Session 总结 */
function skipSessionCompletion() {
  sessionCompletionInput.value = "";
  showSessionCompletionPrompt.value = false;
  timerStore.clearPendingCompletion();
}

/** 点击计时器中心 */
function onTimerCenterClick() {
  toggleTimer();
  // 移动端沉浸模式：双击计时器区域切换全屏
  if (
    window.innerWidth < 640 &&
    !timerStore.isRunning &&
    !timerStore.isPaused
  ) {
    appStore.toggleImmersiveMode();
  }
}

// ---- Anime.js 动效 ----

/** 数字翻动动画 */
let lastDisplayTime = "";
function animateDigitFlip(newTime: string) {
  if (!animeInit.value || !newTime || newTime === lastDisplayTime) {
    lastDisplayTime = newTime;
    return;
  }
  const oldChars = lastDisplayTime.padEnd(5, " ");
  const newChars = newTime.padEnd(5, " ");
  const els = document.querySelectorAll(".timer-digits .digit-char");

  for (let i = 0; i < Math.min(els.length, 5); i++) {
    const el = els[i] as HTMLElement;
    if (!el) continue;
    if (el.classList.contains("digit-colon")) continue;

    const oldCh = oldChars[i];
    const newCh = newChars[i];
    if (oldCh === newCh) continue;

    const oldNum = parseInt(oldCh);
    const newNum = parseInt(newCh);
    if (isNaN(oldNum) || isNaN(newNum)) {
      el.textContent = newCh;
      continue;
    }

    // 使用 Anime.js 对数字对象插值
    const obj = { v: oldNum };
    animate(obj, {
      v: [oldNum, newNum],
      duration: 350,
      ease: "inOutBack",
      onUpdate: () => {
        el.textContent = Math.round(Math.abs(obj.v)).toString();
        // 微小的位移 + 透明度变化
        const t = Math.abs((obj.v - oldNum) / (newNum - oldNum || 1));
        el.style.transform = `translateY(${(1 - t) * 5}px)`;
        el.style.opacity = String(0.55 + 0.45 * t);
      },
      onComplete: () => {
        el.style.transform = "";
        el.style.opacity = "";
      },
    });
  }

  lastDisplayTime = newTime;
}

/** 进度环平滑动画 */
let animatingRing = false;
let prevProgress = 0;
function animateRingProgress(progress: number) {
  if (!ringCircleRef.value || animatingRing) {
    prevProgress = progress;
    return;
  }
  animatingRing = true;
  const from = prevProgress;
  const to = progress;
  const obj = { v: from };
  const circumference = 2 * Math.PI * RING_RADIUS;

  animate(obj, {
    v: [from, to],
    duration: 600,
    ease: "inOutCubic",
    onUpdate: () => {
      const offset = circumference - (obj.v / 100) * circumference;
      ringCircleRef.value?.setAttribute("stroke-dashoffset", String(offset));
    },
    onComplete: () => {
      prevProgress = to;
      animatingRing = false;
    },
  });
}

/** 主按钮弹簧点击效果 */
const btnSpringEase = spring({ stiffness: 220, damping: 14 });
function animatePrimaryBtn() {
  if (!primaryBtnRef.value) return;
  animate(primaryBtnRef.value, {
    scale: [1, 0.92, 1],
    duration: 500,
    ease: btnSpringEase,
  });
}

/** 模式切换时颜色过渡动画 */
function animateModeColor(element: HTMLElement | null, color: string) {
  if (!element) return;
  animate(element, {
    color,
    duration: 500,
    ease: "inOutQuad",
  });
}

// ---- 监听器 ----

// 监听今日番茄数变化 → 新完成的 work session 已持久化，触发庆祝
let prevTodayPomodoros = sessionStore.todayPomodoros;
watch(
  () => sessionStore.todayPomodoros,
  (newVal) => {
    if (newVal > prevTodayPomodoros) {
      handleSessionComplete();
    }
    prevTodayPomodoros = newVal;
  }
);

// 监听 Session 完成 → 显示总结提示
watch(
  () => timerStore.pendingCompletionForTaskId,
  (taskId) => {
    if (taskId) {
      showSessionCompletionPrompt.value = true;
    }
  }
);

// 监听会话类型变化 - 更新页面标题
watch(
  () => timerStore.sessionType,
  (type) => {
    const label = TIMER_MODES[type]?.labelZh || "计时器";
    document.title = `${label} - PomodoroX`;
  }
);

// ---- Anime.js 监听器 ----

/** 监听数字变化 → 翻动动画 */
watch(
  () => timerStore.formattedRemaining,
  (newTime) => {
    animateDigitFlip(newTime);
  }
);

/** 监听进度变化 → 环形动画 */
watch(
  () => timerStore.progress,
  (newProgress) => {
    animateRingProgress(newProgress);
  }
);

/** 监听会话类型 → 颜色过渡 */
watch(
  () => timerStore.sessionType,
  () => {
    nextTick(() => {
      // 模式切换时文字颜色过渡
      const sessionCfg = TIMER_MODES[timerStore.sessionType];
      if (sessionCfg) {
        // 统计数字颜色动画
        timerFooterStats();
      }
    });
  }
);

/** 底部统计颜色跟随 */
function timerFooterStats() {
  const color = TIMER_MODES[timerStore.sessionType]?.color || "";
  if (!color) return;
  const els = document.querySelectorAll(".timer-digits, .session-type-badge");
  els.forEach((el) => {
    animateModeColor(el as HTMLElement, color);
  });
}

// 键盘快捷键 - Space 开始/暂停
function handleKeyDown(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  const isInput =
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable;
  if (isInput) return;

  if (e.code === "Space" && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    toggleTimer();
  }
}

// 点击外部关闭任务选择器
function handleDocumentClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (showTaskSelector.value && !target.closest(".task-selector-container")) {
    showTaskSelector.value = false;
  }
}

// ---- 生命周期 ----
onMounted(async () => {
  // 加载今日数据
  await timerStore.loadTodaySessions();
  await taskStore.loadTasks();

  // 如果计时器未初始化（remaining 为 0），设置默认时长
  timerStore.initRemainingIfZero();

  // 注册键盘事件
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("click", handleDocumentClick);

  // ---- Anime.js 初始化 ----
  await nextTick();
  // 记录初始数字
  lastDisplayTime = timerStore.formattedRemaining;
  // 记录初始进度
  prevProgress = timerStore.progress;
  // 初始化环形位置
  if (ringCircleRef.value) {
    const circumference = 2 * Math.PI * RING_RADIUS;
    const offset = circumference - (timerStore.progress / 100) * circumference;
    ringCircleRef.value.setAttribute("stroke-dashoffset", String(offset));
  }
  animeInit.value = true;
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("click", handleDocumentClick);
  if (sessionPlanTimer) clearTimeout(sessionPlanTimer);
  if (celebrationTimer) clearTimeout(celebrationTimer);
});
</script>

<template>
  <div class="timer-view" :style="backgroundStyle">
    <!-- 动态背景层 -->
    <div class="timer-bg-layer" :class="`session-${timerStore.sessionType}`">
      <!-- 各模式深色背景基底 -->
      <div class="bg-deep" />
      <!-- 装饰光晕 -->
      <div class="bg-orb bg-orb-1" />
      <div class="bg-orb bg-orb-2" />
      <div class="bg-orb bg-orb-3" />
      <div class="bg-mesh" />
    </div>

    <!-- 庆祝粒子 -->
    <Transition name="celebration">
      <div v-if="showCelebration" class="celebration-overlay">
        <div
          v-for="p in celebrationParticles"
          :key="p.id"
          class="celebration-particle"
          :style="{
            transform: `translate(${p.x}px, ${p.y}px)`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            backgroundColor: p.color,
          }"
        />
      </div>
    </Transition>

    <!-- 主内容 -->
    <div class="timer-content">
      <!-- 顶部栏 -->
      <header class="timer-header">
        <div class="header-left">
          <div class="task-selector-container">
            <button
              class="current-task-btn glass"
              @click.stop="toggleTaskSelector"
            >
              <span class="task-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 3h10v1H3V3zm0 4h7v1H3V7zm0 4h10v1H3v-1z"
                    fill="currentColor"
                    opacity="0.7"
                  />
                </svg>
              </span>
              <span class="task-name">{{ currentTaskName }}</span>
              <svg
                class="chevron-icon"
                :class="{ open: showTaskSelector }"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <!-- 任务下拉选择 -->
            <Transition name="dropdown">
              <div
                v-if="showTaskSelector"
                class="task-dropdown glass-strong"
                @click.stop
              >
                <div class="dropdown-header">选择任务</div>
                <button
                  class="dropdown-item"
                  :class="{ active: timerStore.currentTaskId === null }"
                  @click="selectTask(null)"
                >
                  <span class="item-indicator" />
                  <span>无任务</span>
                </button>
                <div class="dropdown-divider" />
                <button
                  v-for="task in selectableTasks"
                  :key="task.id"
                  class="dropdown-item"
                  :class="{ active: timerStore.currentTaskId === task.id }"
                  @click="selectTask(task.id)"
                >
                  <span
                    class="item-indicator"
                    :style="{
                      backgroundColor:
                        task.status === 'in_progress'
                          ? '#58A6FF'
                          : 'transparent',
                    }"
                  />
                  <span class="item-title">{{ task.title }}</span>
                  <span class="item-meta">
                    {{ task.actualPomodoros }}/{{ task.estimatedPomodoros }}
                  </span>
                </button>
                <div v-if="selectableTasks.length === 0" class="dropdown-empty">
                  暂无任务，去添加一个吧
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <div class="header-right">
          <span class="date-display">{{ todayDisplay }}</span>
        </div>
      </header>

      <!-- 中央计时器 -->
      <div class="timer-center">
        <!-- 会话类型标签 -->
        <div class="session-label-wrapper">
          <span
            class="session-type-badge"
            :style="{
              color: sessionColor,
              borderColor: sessionColor + '40',
              background: sessionColor + '15',
            }"
          >
            {{ sessionLabel }}
          </span>
          <!-- 模式切换（GooeyNav） -->
          <GooeyNav
            :items="gooeyItems"
            :active-index="gooeyActiveIndex"
            :disabled="timerStore.isRunning"
            @select="onGooeySelect"
          />
        </div>

        <!-- 环形进度 + 时间显示 -->
        <div
          class="timer-ring-container"
          :class="{
            breathing: isActive,
            paused: isPausedState,
          }"
          @click="onTimerCenterClick"
        >
          <!-- MagicRings 对齐圆环 -->
          <div class="magic-rings-wrap">
            <MagicRings
              :color="sessionColor"
              :color-two="ringSecondaryColor"
              :ring-count="6"
              :speed="0.8"
              :attenuation="8"
              :line-thickness="2"
              :base-radius="0.35"
              :radius-step="0.1"
              :scale-rate="0.08"
              :opacity="0.8"
              :blur="5"
              :noise-amount="0.05"
              :rotation="0"
              :ring-gap="1.6"
              :fade-in="0.6"
              :fade-out="0.4"
              :follow-mouse="true"
              :mouse-influence="0.15"
              :hover-scale="1.1"
              :parallax="0.03"
              :click-burst="false"
              :is-active="isActive"
            />
          </div>

          <!-- 外发光环 -->
          <div
            class="ring-glow"
            :style="{
              boxShadow: `0 0 60px ${sessionColor}20, 0 0 120px ${sessionColor}10`,
            }"
          />

          <!-- SVG 环形进度 -->
          <svg
            class="timer-ring-svg"
            :width="RING_RADIUS * 2 + RING_STROKE * 2 + 60"
            :height="RING_RADIUS * 2 + RING_STROKE * 2 + 60"
            viewBox="0 0 340 340"
          >
            <!-- 外层装饰环 -->
            <circle
              cx="170"
              cy="170"
              :r="RING_RADIUS + 12"
              fill="none"
              :stroke="sessionColor"
              stroke-opacity="0.04"
              stroke-width="1"
            />

            <!-- 背景环 -->
            <circle
              cx="170"
              cy="170"
              :r="RING_RADIUS"
              fill="none"
              :stroke="sessionColor"
              stroke-opacity="0.08"
              :stroke-width="RING_STROKE"
            />

            <!-- 进度环 -->
            <circle
              ref="ringCircleRef"
              cx="170"
              cy="170"
              :r="RING_RADIUS"
              fill="none"
              :stroke="ringColor"
              :stroke-width="RING_STROKE + 2"
              stroke-linecap="round"
              :stroke-dasharray="RING_CIRCUMFERENCE"
              :stroke-dashoffset="RING_CIRCUMFERENCE"
              class="progress-ring"
              :style="{ filter: isActive ? ringGlow : 'none' }"
              transform="rotate(-90 170 170)"
            />

            <!-- 内层装饰环 -->
            <circle
              cx="170"
              cy="170"
              :r="RING_RADIUS - 16"
              fill="none"
              :stroke="sessionColor"
              stroke-opacity="0.06"
              stroke-width="1"
              stroke-dasharray="4 6"
            />

            <!-- 刻度点（12个） -->
            <g v-for="i in 12" :key="'tick-' + i">
              <circle
                :cx="
                  170 +
                  (RING_RADIUS + 20) *
                    Math.cos((((i - 1) * 30 - 90) * Math.PI) / 180)
                "
                :cy="
                  170 +
                  (RING_RADIUS + 20) *
                    Math.sin((((i - 1) * 30 - 90) * Math.PI) / 180)
                "
                r="2"
                :fill="sessionColor"
                :fill-opacity="i % 3 === 0 ? 0.5 : 0.15"
              />
            </g>
          </svg>

          <!-- 中心内容 -->
          <div class="timer-center-content">
            <div class="timer-digits" :style="{ color: sessionColor }">
              <span
                v-for="(ch, i) in displayTime.split('')"
                :key="ch + '-' + i"
                class="digit-char"
                :class="{ 'digit-colon': ch === ':' }"
                >{{ ch }}</span
              >
            </div>
            <!-- 自由计时输入（仅 idle + free 模式） -->
            <div
              v-if="isIdle && timerStore.sessionType === 'free'"
              class="free-duration-input"
            >
              <div class="duration-field">
                <input
                  ref="minInputRef"
                  v-model.number="freeMinutes"
                  type="number"
                  min="1"
                  max="999"
                  class="duration-input"
                  :style="{
                    borderColor: sessionColor + '40',
                    color: sessionColor,
                  }"
                  @keydown.stop
                />
                <span class="duration-unit" :style="{ color: sessionColor }"
                  >分</span
                >
              </div>
              <span class="duration-sep">:</span>
              <div class="duration-field">
                <input
                  v-model.number="freeSeconds"
                  type="number"
                  min="0"
                  max="59"
                  class="duration-input"
                  :style="{
                    borderColor: sessionColor + '40',
                    color: sessionColor,
                  }"
                  @keydown.stop
                />
                <span class="duration-unit" :style="{ color: sessionColor }"
                  >秒</span
                >
              </div>
            </div>
            <div v-if="isPausedState" class="timer-status-badge paused-badge">
              已暂停
            </div>
            <div
              v-else-if="isIdle && timerStore.sessionType !== 'free'"
              class="timer-status-hint"
            >
              按空格键开始
            </div>
          </div>
        </div>

        <!-- 番茄钟计数指示器 -->
        <div class="pomodoro-indicators">
          <template v-for="i in longBreakInterval" :key="'pomo-' + i">
            <span
              class="pomodoro-dot"
              :class="{
                filled: i <= streakCount,
                current: i === streakCount + 1 && timerStore.isWorkSession,
              }"
              :style="{
                backgroundColor: i <= streakCount ? sessionColor : undefined,
                borderColor: i <= streakCount ? sessionColor : undefined,
                boxShadow:
                  i <= streakCount ? `0 0 10px ${sessionColor}40` : 'none',
              }"
            >
              <svg
                v-if="i <= streakCount"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <span v-else class="dot-number">{{ i }}</span>
            </span>
          </template>
        </div>
      </div>

      <!-- 控制按钮区（玻璃拟态面板） -->
      <div class="timer-controls glass">
        <!-- 重置/回退按钮 -->
        <button
          class="control-btn secondary-btn"
          :disabled="isIdle"
          title="重置 (Ctrl+R)"
          @click="resetTimer"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          <span class="control-label">重置</span>
        </button>

        <!-- 开始/暂停 主按钮 -->
        <button
          ref="primaryBtnRef"
          class="control-btn primary-btn"
          :class="{ 'is-running': isActive }"
          :style="{
            '--btn-color': sessionColor,
            '--btn-glow': `${sessionColor}40`,
          }"
          @click="toggleTimer"
        >
          <svg
            v-if="isActive"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
          <svg
            v-else
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          <span class="control-label">{{
            isActive ? "暂停" : isPausedState ? "继续" : "开始"
          }}</span>
        </button>

        <!-- 快进 10′ 按钮 -->
        <button
          class="control-btn secondary-btn ff-btn"
          :disabled="isIdle"
          :title="`快进 10 分钟 (已用 ${timerStore.sessionFastForwardCount}/3)`"
          @click="handleFastForward"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="13 19 22 12 13 5 13 19" />
            <polygon points="2 19 11 12 2 5 2 19" />
          </svg>
          <span class="control-label">快进 10′</span>
          <span
            v-if="timerStore.sessionFastForwardCount > 0"
            class="ff-count"
            :class="{
              'ff-count-over': timerStore.sessionFastForwardCount >= 3,
            }"
          >
            {{
              timerStore.sessionFastForwardCount >= 3
                ? timerStore.sessionFastForwardCount
                : timerStore.sessionFastForwardCount + "/3"
            }}
          </span>
        </button>
      </div>

      <!-- Session 规划提示（内联面板） -->
      <Transition name="dropdown">
        <div v-if="showSessionPlanPrompt" class="session-prompt glass">
          <div class="prompt-label">本次专注目标（可选）</div>
          <input
            v-model="sessionPlanInput"
            type="text"
            class="prompt-input"
            placeholder="例如：完成登录页面的 UI 设计..."
            @keydown.enter="confirmSessionPlan"
          />
          <div class="prompt-actions">
            <button class="btn btn-secondary btn-sm" @click="skipSessionPlan">
              跳过
            </button>
            <button class="btn btn-primary btn-sm" @click="confirmSessionPlan">
              开始专注
            </button>
          </div>
        </div>
      </Transition>

      <!-- Session 总结提示（内联面板） -->
      <Transition name="dropdown">
        <div v-if="showSessionCompletionPrompt" class="session-prompt glass">
          <div class="prompt-label">本次专注总结（可选）</div>
          <input
            v-model="sessionCompletionInput"
            type="text"
            class="prompt-input"
            placeholder="例如：完成了登录页原型，遇到一个小兼容性问题..."
            @keydown.enter="confirmSessionCompletion"
          />
          <div class="prompt-actions">
            <button
              class="btn btn-secondary btn-sm"
              @click="skipSessionCompletion"
            >
              跳过
            </button>
            <button
              class="btn btn-primary btn-sm"
              @click="confirmSessionCompletion"
            >
              保存总结
            </button>
          </div>
        </div>
      </Transition>

      <!-- 快进额度确认弹窗 -->
      <Transition name="dropdown">
        <div
          v-if="showFastForwardConfirm"
          class="session-prompt glass ff-confirm"
        >
          <div class="prompt-label">本周快进额度已用完</div>
          <p class="prompt-desc">
            当前 session 已快进
            {{ timerStore.sessionFastForwardCount }} 次，本周额度（{{
              settingsStore.settings.weeklyFastForwardQuota
            }}
            次）也已用尽。<br />
            确定继续快进？超额使用将在下周一自动恢复。
          </p>
          <div class="prompt-actions">
            <button class="btn btn-secondary btn-sm" @click="cancelFastForward">
              取消
            </button>
            <button class="btn btn-primary btn-sm" @click="confirmFastForward">
              继续快进
            </button>
          </div>
        </div>
      </Transition>

      <!-- 底部统计信息栏 -->
      <footer class="timer-footer">
        <div class="stat-card glass">
          <div
            class="stat-icon-wrapper"
            :style="{ background: sessionColor + '20', color: sessionColor }"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" opacity="0.3" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value" :style="{ color: sessionColor }">{{
              completedCount
            }}</span>
            <span class="stat-label">今日番茄</span>
          </div>
        </div>
        <div class="stat-card glass">
          <div
            class="stat-icon-wrapper"
            style="background: rgba(63, 185, 80, 0.2); color: var(--success)"
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
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ todayFocusDisplay }}</span>
            <span class="stat-label">专注时长</span>
          </div>
        </div>
        <div class="stat-card glass">
          <div
            class="stat-icon-wrapper"
            style="background: rgba(240, 136, 62, 0.2); color: var(--warning)"
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
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value"
              >{{ streakCount }}/{{ longBreakInterval }}</span
            >
            <span class="stat-label">连续进度</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================
   TimerView 2.0 - 沉浸式计时器视图
   双层环形进度 + 玻璃拟态 + 动态粒子背景
   ============================================================ */

/* ---- 主容器 ---- */
.timer-view {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background 1.5s ease;
}

/* ---- 动态背景层 ---- */
.timer-bg-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.bg-orb {
  opacity: 0.4;
  transition:
    background 2s ease,
    opacity 2s ease;
}

.bg-mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      ellipse at 20% 30%,
      rgba(88, 166, 255, 0.03) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 80% 70%,
      rgba(136, 100, 255, 0.03) 0%,
      transparent 50%
    );
}

/* 各模式深色背景基底 */
.bg-deep {
  position: absolute;
  inset: 0;
  background-color: var(--bg);
  z-index: -2;
}

/* MagicRings 对齐圆环 */
.magic-rings-wrap {
  position: absolute;
  width: 320px;
  height: 320px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

/* 工作模式 - 蓝紫色调 */
.session-work .bg-orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(
    circle,
    rgba(88, 166, 255, 0.15) 0%,
    transparent 70%
  );
  top: -15%;
  left: -10%;
  animation: orb-float-timer-1 20s ease-in-out infinite;
}

.session-work .bg-orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(
    circle,
    rgba(136, 100, 255, 0.12) 0%,
    transparent 70%
  );
  bottom: -10%;
  right: -10%;
  animation: orb-float-timer-2 25s ease-in-out infinite;
}

.session-work .bg-orb-3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(
    circle,
    rgba(88, 166, 255, 0.08) 0%,
    transparent 70%
  );
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: orb-float-timer-3 18s ease-in-out infinite;
}

/* 短休息 - 青绿色调 */
.session-short_break .bg-orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(
    circle,
    rgba(78, 205, 196, 0.15) 0%,
    transparent 70%
  );
  top: -15%;
  left: -10%;
  animation: orb-float-timer-1 22s ease-in-out infinite;
}

.session-short_break .bg-orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(
    circle,
    rgba(63, 185, 80, 0.12) 0%,
    transparent 70%
  );
  bottom: -10%;
  right: -10%;
  animation: orb-float-timer-2 20s ease-in-out infinite;
}

.session-short_break .bg-orb-3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(
    circle,
    rgba(78, 205, 196, 0.08) 0%,
    transparent 70%
  );
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: orb-float-timer-3 16s ease-in-out infinite;
}

/* 长休息 - 暖紫色调 */
.session-long_break .bg-orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(
    circle,
    rgba(167, 139, 250, 0.15) 0%,
    transparent 70%
  );
  top: -15%;
  left: -10%;
  animation: orb-float-timer-1 24s ease-in-out infinite;
}

.session-long_break .bg-orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(
    circle,
    rgba(192, 132, 252, 0.12) 0%,
    transparent 70%
  );
  bottom: -10%;
  right: -10%;
  animation: orb-float-timer-2 22s ease-in-out infinite;
}

.session-long_break .bg-orb-3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(
    circle,
    rgba(167, 139, 250, 0.08) 0%,
    transparent 70%
  );
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: orb-float-timer-3 20s ease-in-out infinite;
}

/* 自由计时 - 橙红色调 */
.session-free .bg-orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(
    circle,
    rgba(255, 107, 107, 0.15) 0%,
    transparent 70%
  );
  top: -15%;
  left: -10%;
  animation: orb-float-timer-1 20s ease-in-out infinite;
}

.session-free .bg-orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(
    circle,
    rgba(248, 81, 73, 0.12) 0%,
    transparent 70%
  );
  bottom: -10%;
  right: -10%;
  animation: orb-float-timer-2 25s ease-in-out infinite;
}

.session-free .bg-orb-3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(
    circle,
    rgba(255, 107, 107, 0.08) 0%,
    transparent 70%
  );
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: orb-float-timer-3 18s ease-in-out infinite;
}

@keyframes orb-float-timer-1 {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(50px, -40px) scale(1.1);
  }
  66% {
    transform: translate(-30px, 30px) scale(0.95);
  }
}

@keyframes orb-float-timer-2 {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(-40px, 50px) scale(1.05);
  }
  66% {
    transform: translate(40px, -30px) scale(0.9);
  }
}

@keyframes orb-float-timer-3 {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.4;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.7;
  }
}

/* ---- 主内容 ---- */
.timer-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 16px 24px;
  gap: 0;
}

/* ---- 顶部栏 ---- */
.timer-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.date-display {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  letter-spacing: 0.02em;
}

/* ---- 任务选择器 ---- */
.task-selector-container {
  position: relative;
}

.current-task-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all var(--transition-normal);
  max-width: 280px;
}

.current-task-btn:hover {
  border-color: var(--accent);
  color: var(--text);
  background: var(--surface-hover);
}

.task-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  opacity: 0.6;
}

.task-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron-icon {
  flex-shrink: 0;
  opacity: 0.5;
  transition: transform var(--transition-normal);
}

.chevron-icon.open {
  transform: rotate(180deg);
}

/* 任务下拉菜单 */
.task-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 300px;
  max-width: 400px;
  max-height: 360px;
  overflow-y: auto;
  border-radius: var(--radius-lg);
  z-index: 100;
  padding: 8px;
}

.dropdown-header {
  padding: 10px 12px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
  text-align: left;
  transition: all var(--transition-fast);
}

.dropdown-item:hover {
  background: var(--surface-hover);
  color: var(--text);
}

.dropdown-item.active {
  background: var(--accent-dim);
  color: var(--accent);
}

.item-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1.5px solid var(--text-tertiary);
  transition: all var(--transition-fast);
}

.item-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.dropdown-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 8px;
  opacity: 0.5;
}

.dropdown-empty {
  padding: 20px 12px;
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

/* ---- 中央计时器区域 ---- */
.timer-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  flex: 1;
  justify-content: center;
}

/* 会话类型标签 */
.session-label-wrapper {
  margin-bottom: 4px;
}

.session-type-badge {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 4px 14px;
  border-radius: var(--radius-full);
  border: 1px solid;
  transition: all var(--transition-slow);
}

/* 自由计时时长输入 */
.free-duration-input {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 4px;
}

.duration-field {
  display: flex;
  align-items: center;
  gap: 2px;
}

.duration-input {
  width: 48px;
  background: transparent;
  border: 1px solid;
  border-radius: var(--radius-sm);
  padding: 4px 4px 4px 8px;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  outline: none;
  -moz-appearance: textfield;
}

.duration-input::-webkit-outer-spin-button,
.duration-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.duration-input:focus {
  box-shadow: 0 0 0 2px var(--accent-dim);
}

.duration-sep {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 2px;
}

.duration-unit {
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.7;
}

/* ---- 环形进度容器 ---- */
.timer-ring-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform var(--transition-normal);
  -webkit-tap-highlight-color: transparent;
}

.timer-ring-container:hover {
  transform: scale(1.02);
}

.timer-ring-container:active {
  transform: scale(0.98);
}

/* 外发光环 */
.ring-glow {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  transition: box-shadow var(--transition-slow);
  pointer-events: none;
}

/* 呼吸动画 - 运行中 */
.timer-ring-container.breathing {
  animation: timer-breathe 4s ease-in-out infinite;
}

@keyframes timer-breathe {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

/* 暂停状态 - 微弱闪烁 */
.timer-ring-container.paused {
  animation: timer-paused-pulse 2s ease-in-out infinite;
}

@keyframes timer-paused-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* SVG 进度环 */
.timer-ring-svg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.progress-ring {
  transition:
    stroke var(--transition-slow),
    filter var(--transition-slow);
}

/* 中心内容 */
.timer-center-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 250px;
  height: 250px;
  justify-content: center;
}

.timer-digits {
  font-size: 4.5rem;
  font-weight: 200;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  transition: color var(--transition-slow);
  user-select: none;
  text-shadow: 0 0 40px var(--accent-dim);
}

.digit-char {
  display: inline-block;
  min-width: 0.55em;
  text-align: center;
  will-change: transform, opacity;
}

.digit-colon {
  opacity: 0.4;
  min-width: 0.3em;
}

.timer-status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  letter-spacing: 0.05em;
}

.paused-badge {
  color: var(--text-secondary);
  background: var(--surface);
  border: 1px solid var(--border);
  animation: badge-pulse 2s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.timer-status-hint {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  letter-spacing: 0.03em;
}

/* ---- 番茄钟计数指示器 ---- */
.pomodoro-indicators {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.pomodoro-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--border);
  background: transparent;
  color: var(--text-tertiary);
  transition: all var(--transition-normal);
  opacity: 0.4;
  font-size: 0.7rem;
}

.dot-number {
  font-weight: 600;
}

.pomodoro-dot.filled {
  opacity: 1;
  border-color: transparent;
  color: white;
}

.pomodoro-dot.current {
  opacity: 0.7;
  border-style: dashed;
  animation: dot-pulse 2s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* ---- 控制按钮 ---- */
.timer-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 12px;
  margin-bottom: 4px;
  padding: 12px 24px;
  border-radius: var(--radius-xl);
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all var(--transition-normal);
  -webkit-tap-highlight-color: transparent;
  gap: 6px;
}

.control-label {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  letter-spacing: 0.02em;
  font-weight: 500;
}

.secondary-btn {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-lg);
  background: var(--surface);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.secondary-btn:hover:not(:disabled) {
  background: var(--surface-hover);
  color: var(--text);
  border-color: var(--text-tertiary);
  transform: translateY(-2px);
}

.secondary-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.95);
}

.secondary-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.secondary-btn:disabled .control-label {
  opacity: 0.5;
}

.primary-btn {
  width: 88px;
  height: 88px;
  border-radius: 28px;
  background: var(--btn-color, var(--accent));
  color: white;
  box-shadow:
    0 4px 24px var(--btn-glow, rgba(88, 166, 255, 0.3)),
    0 0 0 0 var(--btn-glow, rgba(88, 166, 255, 0.2));
  transition: all var(--transition-normal);
}

.primary-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow:
    0 8px 32px var(--btn-glow, rgba(88, 166, 255, 0.4)),
    0 0 0 8px var(--btn-glow, rgba(88, 166, 255, 0.1));
}

.primary-btn:active {
  transform: translateY(0) scale(0.95);
  box-shadow:
    0 2px 12px var(--btn-glow, rgba(88, 166, 255, 0.2)),
    0 0 0 0 var(--btn-glow, rgba(88, 166, 255, 0.2));
}

.primary-btn .control-label {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

/* 运行中状态 */
.primary-btn.is-running {
  animation: primary-pulse 2s ease-in-out infinite;
}

@keyframes primary-pulse {
  0%,
  100% {
    box-shadow:
      0 4px 24px var(--btn-glow, rgba(88, 166, 255, 0.3)),
      0 0 0 0 var(--btn-glow, rgba(88, 166, 255, 0.2));
  }
  50% {
    box-shadow:
      0 6px 32px var(--btn-glow, rgba(88, 166, 255, 0.5)),
      0 0 0 10px var(--btn-glow, rgba(88, 166, 255, 0.05));
  }
}

/* ---- Session 提示面板 ---- */
.session-prompt {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 18px;
  margin-top: 8px;
  border-radius: var(--radius-lg);
  max-width: 400px;
  width: 90%;
  animation: prompt-slide-in 0.25s ease-out;
}

@keyframes prompt-slide-in {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.prompt-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
}

.prompt-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 0.85rem;
  border-radius: var(--radius-md);
  background: var(--bg);
  border: 1px solid var(--glass-border);
  color: var(--text);
  outline: none;
  transition: all var(--transition-fast);
}

.prompt-input:focus {
  border-color: var(--accent);
  box-shadow:
    0 0 0 3px var(--active-bg),
    0 0 15px var(--accent-glow);
}

.prompt-input::placeholder {
  color: var(--text-tertiary);
}

.prompt-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-sm {
  padding: 5px 12px;
  font-size: 0.8rem;
}

/* ---- 底部统计 ---- */
.timer-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 24px;
  margin-top: 8px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: var(--radius-lg);
}

.stat-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  letter-spacing: 0.02em;
}

/* ---- 庆祝动画 ---- */
.celebration-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.celebration-particle {
  position: absolute;
  border-radius: 50%;
  animation: particle-burst 1.5s ease-out forwards;
  opacity: 0;
}

@keyframes particle-burst {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
    transform: translate(var(--tx, 0), var(--ty, -100px)) scale(0);
  }
}

/* ---- 过渡动画 ---- */
.celebration-enter-active {
  transition: opacity 0.3s ease;
}

.celebration-leave-active {
  transition: opacity 0.5s ease;
}

.celebration-enter-from,
.celebration-leave-to {
  opacity: 0;
}

.dropdown-enter-active {
  transition: all 0.25s ease;
}

.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

/* ---- 响应式 ---- */
@media (max-width: 640px) {
  .timer-content {
    padding: 12px 16px;
  }

  .timer-header {
    padding: 12px 16px;
  }

  .current-task-btn {
    max-width: 180px;
    font-size: 0.8rem;
    padding: 6px 10px;
  }

  .task-dropdown {
    min-width: 260px;
    max-width: 300px;
  }

  .timer-digits {
    font-size: 4rem;
  }

  .timer-center-content {
    width: 240px;
    height: 240px;
  }

  .ring-glow {
    width: 300px;
    height: 300px;
  }

  .primary-btn {
    width: 72px;
    height: 72px;
    border-radius: 24px;
  }

  .secondary-btn {
    width: 52px;
    height: 52px;
  }

  .timer-footer {
    gap: 8px;
    padding: 8px 16px;
  }

  .stat-card {
    padding: 8px 12px;
  }

  .pomodoro-indicators {
    gap: 8px;
  }

  .pomodoro-dot {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 380px) {
  .timer-digits {
    font-size: 3.2rem;
  }

  .timer-center-content {
    width: 200px;
    height: 200px;
  }

  .ring-glow {
    width: 260px;
    height: 260px;
  }
}

/* 小高度窗口适配 */
@media (max-height: 700px) {
  .timer-digits {
    font-size: 3.2rem;
  }

  .timer-center-content {
    width: 200px;
    height: 200px;
  }

  .ring-glow {
    width: 260px;
    height: 260px;
  }

  .timer-ring-svg {
    transform: translate(-50%, -50%) scale(0.92);
  }

  .timer-center {
    gap: 8px;
  }

  .timer-controls {
    margin-top: 6px;
    padding: 8px 16px;
  }

  .primary-btn {
    width: 68px;
    height: 68px;
    border-radius: 22px;
  }

  .secondary-btn {
    width: 48px;
    height: 48px;
  }

  .control-label {
    font-size: 0.6rem;
  }

  .timer-footer {
    gap: 6px;
    padding: 6px 12px;
    margin-top: 2px;
  }

  .stat-card {
    padding: 6px 10px;
  }

  .stat-value {
    font-size: 0.85rem;
  }

  .stat-label {
    font-size: 0.6rem;
  }

  .pomodoro-dot {
    width: 26px;
    height: 26px;
  }
}

@media (max-height: 600px) {
  .timer-digits {
    font-size: 2.8rem;
  }

  .timer-center-content {
    width: 170px;
    height: 170px;
  }

  .ring-glow {
    width: 220px;
    height: 220px;
  }

  .timer-ring-svg {
    transform: translate(-50%, -50%) scale(0.85);
  }

  .timer-header {
    padding: 8px 12px;
  }

  .session-label-wrapper {
    margin-bottom: 0;
  }

  .pomodoro-indicators {
    margin-top: 4px;
  }
}

/* ---- 移动端响应式 ---- */
@media (max-width: 640px) {
  .timer-digits {
    font-size: 3rem;
  }

  .timer-ring-svg {
    transform: translate(-50%, -50%) scale(0.75);
  }

  .timer-center-content {
    width: 180px;
    height: 180px;
  }

  .ring-glow {
    width: 230px;
    height: 230px;
  }

  .timer-main-btn {
    min-height: 48px;
    font-size: 1rem;
    padding: 12px 32px;
  }

  .timer-header {
    padding: 6px 12px;
  }

  .timer-footer {
    flex-wrap: wrap;
    gap: 4px;
    padding: 6px 12px;
  }

  .stat-card {
    flex: 1;
    min-width: 60px;
    padding: 6px 8px;
  }

  .dropdown-empty {
    padding: 12px 8px;
    font-size: 0.75rem;
  }

  .ff-btn {
    position: relative;
  }

  .ff-count {
    position: absolute;
    top: -6px;
    right: -6px;
    background: var(--accent);
    color: white;
    font-size: 0.65rem;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
    line-height: 1;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    pointer-events: none;
  }

  .ff-count-over {
    background: var(--danger, #f85149);
  }

  .ff-confirm .prompt-desc {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 8px 0 16px;
    line-height: 1.5;
  }
}
</style>
