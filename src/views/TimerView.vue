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
import { TIMER_MODES, PRIORITIES } from "@/utils/constants";
import { formatMinutes, getWeekdayName, formatDate } from "@/utils/format";
import type { Task, SessionType } from "@/types";
import { animate, spring } from "animejs";
import GooeyNav from "@/components/shared/GooeyNav.vue";

// MagicRings 拆分为异步 chunk，避免 Three.js 拖累 TimerView 主包
const MagicRings = defineAsyncComponent(
  () => import("@/components/timer/MagicRings.vue")
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

// ---- 任务选择器筛选状态 ----
const taskTagFilter = ref<string | null>(null);
const taskSearchQuery = ref("");

/** 可选任务列表（活跃任务，in_progress 置顶） */
const selectableTasks = computed(() => {
  const list = [...taskStore.activeTasks];
  // in_progress 任务置顶
  list.sort((a, b) => {
    if (a.status === "in_progress" && b.status !== "in_progress") return -1;
    if (a.status !== "in_progress" && b.status === "in_progress") return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
  return list;
});

/** 综合筛选后的任务列表（搜索 + 标签） */
const filteredSelectableTasks = computed(() => {
  let list = selectableTasks.value;

  // 标签筛选
  if (taskTagFilter.value) {
    list = list.filter((t) => t.tags.includes(taskTagFilter.value!));
  }

  // 搜索筛选
  if (taskSearchQuery.value.trim()) {
    const q = taskSearchQuery.value.trim().toLowerCase();
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  return list;
});

/** 下拉中可用的标签（仅出现在活跃任务中的标签） */
const taskDropdownTags = computed(() => {
  const tags = new Set<string>();
  taskStore.activeTasks.forEach((t) => t.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
});

/** 自由计时分钟输入 */
const freeMinutes = ref(30);
/** 自由计时秒数输入 */
const freeSeconds = ref(0);

// ---- 自由计时外置圆环滑块 ----
const RING_SLIDER_RADIUS = 48;
const RING_SLIDER_CIRCUMFERENCE = 2 * Math.PI * RING_SLIDER_RADIUS;
const RING_SLIDER_MIN = 1;
const RING_SLIDER_MAX = 180;

const ringSliderRef = ref<SVGSVGElement | null>(null);
const isDraggingRing = ref(false);

/** 自由计时 idle 态显示的时间 */
const freeDisplayTime = computed(() => {
  const m = String(freeMinutes.value).padStart(2, "0");
  const s = String(freeSeconds.value).padStart(2, "0");
  return `${m}:${s}`;
});

const ringSliderProgress = computed(() => {
  const range = RING_SLIDER_MAX - RING_SLIDER_MIN;
  return Math.max(
    0,
    Math.min(1, (freeMinutes.value - RING_SLIDER_MIN) / range)
  );
});

const ringSliderOffset = computed(
  () => RING_SLIDER_CIRCUMFERENCE * (1 - ringSliderProgress.value)
);

const ringSliderThumbAngle = computed(
  () => -Math.PI / 2 + ringSliderProgress.value * 2 * Math.PI
);

const ringSliderThumbX = computed(
  () => 60 + RING_SLIDER_RADIUS * Math.cos(ringSliderThumbAngle.value)
);

const ringSliderThumbY = computed(
  () => 60 + RING_SLIDER_RADIUS * Math.sin(ringSliderThumbAngle.value)
);

function updateFreeMinutesFromEvent(e: MouseEvent | TouchEvent) {
  if (!ringSliderRef.value) return;
  const rect = ringSliderRef.value.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const clientX =
    "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
  const clientY =
    "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
  const dx = clientX - centerX;
  const dy = clientY - centerY;
  let angle = Math.atan2(dy, dx) + Math.PI / 2;
  if (angle < 0) angle += 2 * Math.PI;
  const progress = angle / (2 * Math.PI);
  const range = RING_SLIDER_MAX - RING_SLIDER_MIN;
  freeMinutes.value = Math.max(
    RING_SLIDER_MIN,
    Math.min(RING_SLIDER_MAX, Math.round(RING_SLIDER_MIN + progress * range))
  );
}

function onRingSliderDown(e: MouseEvent | TouchEvent) {
  isDraggingRing.value = true;
  updateFreeMinutesFromEvent(e);
  document.addEventListener("mousemove", onRingSliderMove);
  document.addEventListener("mouseup", onRingSliderUp);
  document.addEventListener("touchmove", onRingSliderMove, {
    passive: false,
  });
  document.addEventListener("touchend", onRingSliderUp);
}

function onRingSliderMove(e: MouseEvent | TouchEvent) {
  if (!isDraggingRing.value) return;
  e.preventDefault();
  updateFreeMinutesFromEvent(e);
}

function onRingSliderUp() {
  isDraggingRing.value = false;
  document.removeEventListener("mousemove", onRingSliderMove);
  document.removeEventListener("mouseup", onRingSliderUp);
  document.removeEventListener("touchmove", onRingSliderMove);
  document.removeEventListener("touchend", onRingSliderUp);
}

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
  taskTagFilter.value = null;
  taskSearchQuery.value = "";
}

/** 切换任务选择器 */
function toggleTaskSelector() {
  showTaskSelector.value = !showTaskSelector.value;
  if (showTaskSelector.value) {
    // 打开时重置筛选，避免上次筛选残留
    taskTagFilter.value = null;
    taskSearchQuery.value = "";
  }
}

/** 清除任务筛选 */
function clearTaskFilter() {
  taskTagFilter.value = null;
  taskSearchQuery.value = "";
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
  // 自由计时 idle 态：大计时器区域不触发计时，避免与输入框编辑冲突
  if (timerStore.sessionType === "free" && isIdle.value) {
    return;
  }
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
  document.removeEventListener("mousemove", onRingSliderMove);
  document.removeEventListener("mouseup", onRingSliderUp);
  document.removeEventListener("touchmove", onRingSliderMove);
  document.removeEventListener("touchend", onRingSliderUp);
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
              <div v-if="showTaskSelector" class="task-dropdown" @click.stop>
                <div class="dropdown-header">选择任务</div>

                <!-- 搜索框 -->
                <div class="dropdown-search">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    v-model="taskSearchQuery"
                    type="text"
                    placeholder="搜索任务或标签..."
                    @click.stop
                  />
                  <button
                    v-if="taskSearchQuery"
                    class="search-clear"
                    @click.stop="taskSearchQuery = ''"
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
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <!-- 标签筛选栏 -->
                <div
                  v-if="taskDropdownTags.length > 0"
                  class="dropdown-tag-bar"
                >
                  <button
                    class="tag-chip"
                    :class="{ active: taskTagFilter === null }"
                    @click.stop="taskTagFilter = null"
                  >
                    全部
                  </button>
                  <button
                    v-for="tag in taskDropdownTags"
                    :key="tag"
                    class="tag-chip"
                    :class="{ active: taskTagFilter === tag }"
                    @click.stop="
                      taskTagFilter = taskTagFilter === tag ? null : tag
                    "
                  >
                    {{ tag }}
                  </button>
                </div>

                <!-- 无任务 / 清除选择 -->
                <button
                  class="dropdown-item"
                  :class="{ active: timerStore.currentTaskId === null }"
                  @click="selectTask(null)"
                >
                  <span class="item-indicator" />
                  <span class="item-title dim">不关联任务</span>
                </button>
                <div class="dropdown-divider" />

                <!-- 任务列表 -->
                <div class="dropdown-scroll">
                  <button
                    v-for="task in filteredSelectableTasks"
                    :key="task.id"
                    class="dropdown-item"
                    :class="{
                      active: timerStore.currentTaskId === task.id,
                      'is-in-progress': task.status === 'in_progress',
                    }"
                    @click="selectTask(task.id)"
                  >
                    <span
                      class="item-indicator"
                      :style="{
                        backgroundColor:
                          task.status === 'in_progress'
                            ? '#58A6FF'
                            : 'transparent',
                        borderColor:
                          task.status === 'in_progress'
                            ? '#58A6FF'
                            : 'var(--text-tertiary)',
                      }"
                    />
                    <div class="item-body">
                      <div class="item-title-row">
                        <span class="item-title">{{ task.title }}</span>
                        <span class="item-meta">
                          {{ task.actualPomodoros }}/{{
                            task.estimatedPomodoros
                          }}
                        </span>
                      </div>
                      <div v-if="task.tags.length > 0" class="item-tags-row">
                        <span
                          v-for="tag in task.tags.slice(0, 3)"
                          :key="tag"
                          class="item-tag-badge"
                        >
                          {{ tag }}
                        </span>
                        <span v-if="task.tags.length > 3" class="item-tag-more">
                          +{{ task.tags.length - 3 }}
                        </span>
                      </div>
                    </div>
                    <span
                      class="item-priority-dot"
                      :style="{
                        backgroundColor:
                          PRIORITIES.find((p) => p.value === task.priority)
                            ?.color ?? '#8B949E',
                      }"
                      :title="
                        PRIORITIES.find((p) => p.value === task.priority)
                          ?.label ?? ''
                      "
                    />
                  </button>
                </div>

                <!-- 空状态 -->
                <div
                  v-if="filteredSelectableTasks.length === 0"
                  class="dropdown-empty"
                >
                  <template v-if="selectableTasks.length === 0">
                    暂无任务，去添加一个吧
                  </template>
                  <template v-else>
                    没有匹配的任务
                    <button
                      class="clear-filter-link"
                      @click.stop="clearTaskFilter"
                    >
                      清除筛选
                    </button>
                  </template>
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
            <!-- 自由计时 idle 态：显示设置的时间（输入已外置到圆环滑块面板） -->
            <template v-if="isIdle && timerStore.sessionType === 'free'">
              <div class="timer-digits" :style="{ color: sessionColor }">
                <span
                  v-for="(ch, i) in freeDisplayTime.split('')"
                  :key="ch + '-' + i"
                  class="digit-char"
                  :class="{ 'digit-colon': ch === ':' }"
                  >{{ ch }}</span
                >
              </div>
              <div class="editor-hint">拖动下方圆环或输入设置时长</div>
            </template>

            <!-- 其他状态：正常大数字显示 -->
            <template v-else>
              <div class="timer-digits" :style="{ color: sessionColor }">
                <span
                  v-for="(ch, i) in displayTime.split('')"
                  :key="ch + '-' + i"
                  class="digit-char"
                  :class="{ 'digit-colon': ch === ':' }"
                  >{{ ch }}</span
                >
              </div>
            </template>
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

      <!-- 自由计时设置面板（圆环滑块 + 精确输入） -->
      <Transition name="fade">
        <div
          v-if="isIdle && timerStore.sessionType === 'free'"
          class="free-duration-setter"
        >
          <!-- 圆环滑块（快速调整分钟） -->
          <div class="setter-ring">
            <svg
              ref="ringSliderRef"
              viewBox="0 0 120 120"
              class="ring-slider"
              @mousedown.prevent="onRingSliderDown"
              @touchstart.prevent="onRingSliderDown"
            >
              <!-- 背景轨道 -->
              <circle
                cx="60"
                cy="60"
                :r="RING_SLIDER_RADIUS"
                fill="none"
                stroke="var(--border)"
                stroke-width="3"
                opacity="0.5"
              />
              <!-- 进度弧 -->
              <circle
                cx="60"
                cy="60"
                :r="RING_SLIDER_RADIUS"
                fill="none"
                :stroke="sessionColor"
                stroke-width="3"
                stroke-linecap="round"
                :stroke-dasharray="RING_SLIDER_CIRCUMFERENCE"
                :stroke-dashoffset="ringSliderOffset"
                transform="rotate(-90 60 60)"
                class="ring-slider-progress"
                :class="{ 'is-dragging': isDraggingRing }"
              />
              <!-- 拖动点 -->
              <circle
                :cx="ringSliderThumbX"
                :cy="ringSliderThumbY"
                r="5"
                :fill="sessionColor"
                class="ring-slider-thumb"
                :class="{ 'is-dragging': isDraggingRing }"
              />
            </svg>
            <!-- 圆环中心：分钟显示（只读反馈） -->
            <div class="ring-center-display">
              <span class="ring-center-value" :style="{ color: sessionColor }">
                {{ freeMinutes }}
              </span>
              <span class="ring-center-unit">分钟</span>
            </div>
          </div>

          <!-- 精确输入区（分钟 + 秒） -->
          <div class="setter-precision">
            <div class="precision-label">精确设置</div>
            <div class="precision-inputs">
              <div class="precision-field">
                <input
                  v-model.number="freeMinutes"
                  type="number"
                  min="1"
                  max="180"
                  class="precision-num"
                  :style="{
                    color: sessionColor,
                    borderColor: sessionColor + '30',
                  }"
                  @keydown.stop
                />
                <span class="precision-unit">分</span>
              </div>
              <span class="precision-sep">:</span>
              <div class="precision-field">
                <input
                  v-model.number="freeSeconds"
                  type="number"
                  min="0"
                  max="59"
                  class="precision-num"
                  :style="{
                    color: sessionColor,
                    borderColor: sessionColor + '30',
                  }"
                  @keydown.stop
                />
                <span class="precision-unit">秒</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>

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
  min-width: 340px;
  max-width: 420px;
  max-height: 480px;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  z-index: 100;
  padding: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.dropdown-header {
  padding: 8px 10px 6px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  flex-shrink: 0;
}

/* 搜索框 */
.dropdown-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  margin: 0 4px 6px;
  border-radius: var(--radius-md);
  background: var(--bg);
  border: 1px solid var(--border);
  transition: border-color var(--transition-fast);
  flex-shrink: 0;
}

.dropdown-search:focus-within {
  border-color: var(--accent);
}

.dropdown-search svg {
  flex-shrink: 0;
  color: var(--text-tertiary);
}

.dropdown-search input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 0.8rem;
  padding: 0;
}

.dropdown-search input::placeholder {
  color: var(--text-tertiary);
}

.search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: var(--border);
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 0;
  transition: all var(--transition-fast);
}

.search-clear:hover {
  background: var(--text-tertiary);
  color: var(--bg);
}

/* 标签筛选栏 */
.dropdown-tag-bar {
  display: flex;
  gap: 6px;
  padding: 2px 4px 8px;
  overflow-x: auto;
  scrollbar-width: none;
  flex-shrink: 0;
}

.dropdown-tag-bar::-webkit-scrollbar {
  display: none;
}

.tag-chip {
  flex-shrink: 0;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-secondary);
  font-size: 0.7rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.tag-chip:hover {
  border-color: var(--accent);
  color: var(--text);
}

.tag-chip.active {
  background: var(--accent-dim);
  border-color: var(--accent);
  color: var(--accent);
}

/* 滚动区域 */
.dropdown-scroll {
  overflow-y: auto;
  max-height: 260px;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.dropdown-scroll::-webkit-scrollbar {
  width: 4px;
}

.dropdown-scroll::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

.dropdown-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text);
  cursor: pointer;
  font-size: 0.85rem;
  text-align: left;
  transition: all var(--transition-fast);
  position: relative;
}

.dropdown-item:hover {
  background: var(--surface-hover);
}

.dropdown-item.active {
  background: var(--accent-dim);
  color: var(--accent);
}

.dropdown-item.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: var(--accent);
}

.dropdown-item.is-in-progress {
  background: rgba(88, 166, 255, 0.06);
}

.dropdown-item.is-in-progress:hover {
  background: rgba(88, 166, 255, 0.12);
}

.item-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1.5px solid var(--text-tertiary);
  margin-top: 5px;
  transition: all var(--transition-fast);
}

.item-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.85rem;
  font-weight: 500;
}

.item-title.dim {
  color: var(--text-tertiary);
  font-weight: 400;
}

.item-meta {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.item-tags-row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.item-tag-badge {
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text-tertiary);
  font-size: 0.65rem;
  border: 1px solid var(--border);
}

.item-tag-more {
  padding: 1px 4px;
  color: var(--text-tertiary);
  font-size: 0.65rem;
}

.item-priority-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 5px;
}

.dropdown-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 8px;
  opacity: 0.5;
  flex-shrink: 0;
}

.dropdown-empty {
  padding: 20px 12px;
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.clear-filter-link {
  display: inline;
  background: none;
  border: none;
  color: var(--accent);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.clear-filter-link:hover {
  color: var(--text);
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

/* ---- 自由计时外置设置面板 ---- */
.free-duration-setter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: -4px;
  margin-bottom: 4px;
}

/* 圆环滑块容器 */
.setter-ring {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
}

.ring-slider {
  width: 100%;
  height: 100%;
  cursor: pointer;
  overflow: visible;
}

.ring-slider-progress {
  transition: stroke-dashoffset 0.15s ease-out;
}

.ring-slider-progress.is-dragging {
  transition: none;
}

.ring-slider-thumb {
  cursor: grab;
  transition:
    r 0.15s ease,
    filter 0.15s ease;
  filter: drop-shadow(0 0 3px currentColor);
}

.ring-slider-thumb.is-dragging {
  cursor: grabbing;
  r: 7;
  filter: drop-shadow(0 0 7px currentColor);
}

/* 圆环中心分钟显示 */
.ring-center-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  pointer-events: none;
  user-select: none;
}

.ring-center-value {
  font-size: 1.4rem;
  font-weight: 300;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.ring-center-unit {
  font-size: 0.65rem;
  color: var(--text-tertiary);
  font-weight: 500;
}

/* 精确输入区 */
.setter-precision {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.precision-label {
  font-size: 0.65rem;
  color: var(--text-tertiary);
  font-weight: 500;
  letter-spacing: 0.05em;
  user-select: none;
}

.precision-inputs {
  display: flex;
  align-items: center;
  gap: 6px;
}

.precision-field {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.precision-num {
  width: 2.4em;
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 6px 4px;
  font-size: 1.2rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  text-align: center;
  outline: none;
  line-height: 1;
  transition: all var(--transition-fast);
  -moz-appearance: textfield;
}

.precision-num::-webkit-outer-spin-button,
.precision-num::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.precision-num:hover {
  border-color: var(--text-tertiary);
}

.precision-num:focus {
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 2px var(--accent-dim);
}

.precision-unit {
  font-size: 0.65rem;
  color: var(--text-tertiary);
  font-weight: 500;
  user-select: none;
}

.precision-sep {
  font-size: 1.1rem;
  font-weight: 300;
  color: var(--text-tertiary);
  opacity: 0.4;
  margin: 0 2px;
  align-self: center;
  user-select: none;
}

.editor-hint {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 8px;
  opacity: 0.7;
  user-select: none;
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

  .free-duration-setter {
    gap: 14px;
  }

  .setter-ring {
    width: 80px;
    height: 80px;
  }

  .ring-center-value {
    font-size: 1.1rem;
  }

  .precision-num {
    font-size: 1rem;
    padding: 4px;
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

  .free-duration-setter {
    gap: 12px;
    margin-top: -4px;
    margin-bottom: 4px;
  }

  .setter-ring {
    width: 68px;
    height: 68px;
  }

  .ring-center-value {
    font-size: 1rem;
  }

  .precision-label {
    font-size: 0.55rem;
  }

  .precision-num {
    font-size: 0.9rem;
    padding: 3px;
  }

  .editor-hint {
    margin-top: 4px;
    font-size: 0.65rem;
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
