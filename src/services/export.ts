// ============================================================
// PomodoroX - Markdown 导出服务
// 生成美观的 Markdown 格式报告
// ============================================================

import type { Task, Reflection, Session, TaskStatus, Priority } from "@/types";
import {
  formatMinutes,
  formatDate,
  getWeekdayName,
  formatFriendlyDate,
} from "@/utils/format";
import { MOODS, PRIORITIES, STATUSES } from "@/utils/constants";

// ============================================================
// 通用高级导出器类型与基础设施
// ============================================================

export interface ExportOptions {
  type: "daily" | "weekly" | "biweekly" | "task";
  tasks: Task[];
  sessions?: Session[];
  reflections?: Reflection[];
  dateRange?: { start: string; end: string };
  filters?: {
    status?: TaskStatus | "all";
    priority?: Priority | "";
    tags?: string[];
    search?: string;
  };
  format: "markdown" | "csv" | "json";
  includeFields?: ("plan" | "completion")[];
}

/** 渲染番茄钟明细小节（复用于日报/周报） */
function renderSessionDetails(
  sessions: Session[],
  tasks: Task[],
  lines: string[]
): void {
  const workSessions = sessions
    .filter((s) => s.type === "work" && s.completed)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  if (workSessions.length === 0) return;

  lines.push("## 番茄钟明细");
  lines.push("");

  workSessions.forEach((session) => {
    const startTime = session.startedAt.split(" ")[1] || session.startedAt;
    const taskTitle = session.taskId
      ? tasks.find((t) => t.id === session.taskId)?.title || "未知任务"
      : null;
    const duration = formatMinutes(Math.round(session.duration / 60));

    const task = session.taskId
      ? tasks.find((t) => t.id === session.taskId)
      : null;
    const tagStr = task?.tags?.length
      ? task.tags.map((t) => `\`${t}\``).join(" ")
      : "";
    const priorityLabel = task
      ? PRIORITIES.find((p) => p.value === task.priority)?.label || ""
      : "";
    const endTime = session.endedAt?.split(" ")[1] || "";

    lines.push(
      `### ${startTime}${taskTitle ? ` - ${taskTitle}` : ""} (${duration})`
    );
    lines.push("");

    const metaParts: string[] = [];
    if (priorityLabel) metaParts.push(`优先级：${priorityLabel}`);
    if (tagStr) metaParts.push(`标签：${tagStr}`);
    if (endTime) metaParts.push(`结束：${endTime}`);
    if (metaParts.length) {
      lines.push(`*${metaParts.join(" | ")}*`);
      lines.push("");
    }

    if (session.plan) {
      lines.push(`**目标：** ${session.plan}`);
      lines.push("");
    }
    if (session.completion) {
      lines.push(`**总结：** ${session.completion}`);
      lines.push("");
    }
  });
}

/**
 * 导出每日报告
 * @param date 日期字符串 (YYYY-MM-DD)
 * @param tasks 当日任务
 * @param reflections 当日反思
 * @param sessions 当日会话
 * @returns Markdown 字符串
 */
export function exportDailyReport(
  date: string,
  tasks: Task[],
  reflections: Reflection[],
  sessions: Session[]
): string {
  const lines: string[] = [];
  const friendlyDate = formatFriendlyDate(date);
  const weekday = getWeekdayName(date);

  // 标题
  lines.push(`# ${friendlyDate} ${weekday} - PomodoroX 日报`);
  lines.push("");

  // 统计摘要
  const workSessions = sessions.filter((s) => s.type === "work" && s.completed);
  const totalFocusMinutes = workSessions.reduce(
    (sum, s) => sum + Math.round(s.duration / 60),
    0
  );
  const completedTasks = tasks.filter((t) => t.status === "done");

  lines.push("## 概览");
  lines.push("");
  lines.push("| 指标 | 数值 |");
  lines.push("| --- | --- |");
  lines.push(`| 完成番茄钟 | ${workSessions.length} 个 |`);
  lines.push(`| 专注时长 | ${formatMinutes(totalFocusMinutes)} |`);
  lines.push(`| 完成任务 | ${completedTasks.length} 个 |`);
  lines.push(`| 总任务数 | ${tasks.length} 个 |`);
  lines.push("");

  // 番茄钟明细
  renderSessionDetails(sessions, tasks, lines);

  // 任务列表
  if (tasks.length > 0) {
    lines.push("## 任务");
    lines.push("");
    const todoTasks = tasks.filter((t) => t.status === "todo");
    const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
    const doneTasks = tasks.filter((t) => t.status === "done");

    if (doneTasks.length > 0) {
      lines.push("### 已完成");
      lines.push("");
      doneTasks.forEach((task) => {
        const priorityLabel =
          PRIORITIES.find((p) => p.value === task.priority)?.label || "";
        lines.push(
          `- [x] ${task.title} ${priorityLabel ? `(${priorityLabel})` : ""}`
        );
        if (task.tags.length > 0) {
          lines.push(`  标签: ${task.tags.map((t) => `\`${t}\``).join(" ")}`);
        }
        if (task.plan) {
          lines.push("");
          lines.push("  **规划：**");
          task.plan.split("\n").forEach((l) => lines.push(`  > ${l}`));
        }
        if (task.completion) {
          lines.push("");
          lines.push("  **总结：**");
          task.completion.split("\n").forEach((l) => lines.push(`  > ${l}`));
        }
      });
      lines.push("");
    }

    if (inProgressTasks.length > 0) {
      lines.push("### 进行中");
      lines.push("");
      inProgressTasks.forEach((task) => {
        const priorityLabel =
          PRIORITIES.find((p) => p.value === task.priority)?.label || "";
        lines.push(
          `- [ ] ${task.title} ${priorityLabel ? `(${priorityLabel})` : ""} (进行中)`
        );
        if (task.plan) {
          lines.push("");
          lines.push("  **规划：**");
          task.plan.split("\n").forEach((l) => lines.push(`  > ${l}`));
        }
        if (task.completion) {
          lines.push("");
          lines.push("  **总结：**");
          task.completion.split("\n").forEach((l) => lines.push(`  > ${l}`));
        }
      });
      lines.push("");
    }

    if (todoTasks.length > 0) {
      lines.push("### 待办");
      lines.push("");
      todoTasks.forEach((task) => {
        const priorityLabel =
          PRIORITIES.find((p) => p.value === task.priority)?.label || "";
        lines.push(
          `- [ ] ${task.title} ${priorityLabel ? `(${priorityLabel})` : ""}`
        );
        if (task.dueDate) {
          lines.push(`  截止: ${task.dueDate}`);
        }
        if (task.plan) {
          lines.push("");
          lines.push("  **规划：**");
          task.plan.split("\n").forEach((l) => lines.push(`  > ${l}`));
        }
        if (task.completion) {
          lines.push("");
          lines.push("  **总结：**");
          task.completion.split("\n").forEach((l) => lines.push(`  > ${l}`));
        }
      });
      lines.push("");
    }
  }

  // 反思
  if (reflections.length > 0) {
    lines.push("## 反思");
    lines.push("");
    reflections.forEach((r) => {
      const moodInfo = MOODS.find((m) => m.value === r.mood);
      lines.push(
        `### ${moodInfo ? `${moodInfo.emoji} ${moodInfo.label}` : r.mood}`
      );
      lines.push("");
      lines.push(r.content);
      lines.push("");
    });
  }

  // 页脚
  lines.push("---");
  lines.push(`*由 PomodoroX 生成 - ${date}*`);

  return lines.join("\n");
}

/**
 * 导出半月报告
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @param tasks 任务列表
 * @param reflections 反思列表
 * @param sessions 会话列表
 * @returns Markdown 字符串
 */
export function exportBiweeklyReport(
  startDate: string,
  endDate: string,
  tasks: Task[],
  reflections: Reflection[],
  sessions: Session[]
): string {
  const lines: string[] = [];

  lines.push(`# 半月报: ${startDate} ~ ${endDate}`);
  lines.push("");

  // 统计摘要
  const workSessions = sessions.filter((s) => s.type === "work" && s.completed);
  const totalFocusMinutes = workSessions.reduce(
    (sum, s) => sum + Math.round(s.duration / 60),
    0
  );
  const completedTasks = tasks.filter((t) => t.status === "done");

  lines.push("## 半月概览");
  lines.push("");
  lines.push("| 指标 | 数值 |");
  lines.push("| --- | --- |");
  lines.push(`| 完成番茄钟 | ${workSessions.length} 个 |`);
  lines.push(`| 专注时长 | ${formatMinutes(totalFocusMinutes)} |`);
  lines.push(`| 完成任务 | ${completedTasks.length} 个 |`);
  lines.push(`| 新增任务 | ${tasks.length} 个 |`);
  lines.push(`| 反思记录 | ${reflections.length} 条 |`);
  lines.push("");

  // 每日番茄钟统计
  const dailySessions = new Map<string, Session[]>();
  workSessions.forEach((s) => {
    const day = s.startedAt.split(" ")[0];
    if (!dailySessions.has(day)) dailySessions.set(day, []);
    dailySessions.get(day)!.push(s);
  });

  if (dailySessions.size > 0) {
    lines.push("## 每日专注统计");
    lines.push("");
    lines.push("| 日期 | 星期 | 番茄钟数 | 专注时长 |");
    lines.push("| --- | --- | --- | --- |");
    const sortedDays = Array.from(dailySessions.keys()).sort();
    sortedDays.forEach((day) => {
      const daySessions = dailySessions.get(day)!;
      const mins = daySessions.reduce(
        (sum, s) => sum + Math.round(s.duration / 60),
        0
      );
      lines.push(
        `| ${day} | ${getWeekdayName(day)} | ${daySessions.length} | ${formatMinutes(mins)} |`
      );
    });
    lines.push("");
  }

  // 番茄钟明细
  renderSessionDetails(sessions, tasks, lines);

  // 已完成任务
  if (completedTasks.length > 0) {
    lines.push("## 已完成任务");
    lines.push("");
    completedTasks.forEach((task) => {
      const priorityLabel =
        PRIORITIES.find((p) => p.value === task.priority)?.label || "";
      lines.push(
        `- [x] ${task.title} ${priorityLabel ? `(${priorityLabel})` : ""}`
      );
      if (task.plan) {
        lines.push("");
        lines.push("  **规划：**");
        task.plan.split("\n").forEach((l) => lines.push(`  > ${l}`));
      }
      if (task.completion) {
        lines.push("");
        lines.push("  **总结：**");
        task.completion.split("\n").forEach((l) => lines.push(`  > ${l}`));
      }
    });
    lines.push("");
  }

  // 未完成任务
  const incompleteTasks = tasks.filter(
    (t) => t.status !== "done" && t.status !== "archived"
  );
  if (incompleteTasks.length > 0) {
    lines.push("## 未完成任务");
    lines.push("");
    incompleteTasks.forEach((task) => {
      const statusLabel =
        STATUSES.find((s) => s.value === task.status)?.label || "";
      lines.push(`- [ ] ${task.title} (${statusLabel})`);
      if (task.plan) {
        lines.push("");
        lines.push("  **规划：**");
        task.plan.split("\n").forEach((l) => lines.push(`  > ${l}`));
      }
      if (task.completion) {
        lines.push("");
        lines.push("  **总结：**");
        task.completion.split("\n").forEach((l) => lines.push(`  > ${l}`));
      }
    });
    lines.push("");
  }

  // 反思汇总
  if (reflections.length > 0) {
    lines.push("## 反思汇总");
    lines.push("");
    reflections.forEach((r) => {
      const moodInfo = MOODS.find((m) => m.value === r.mood);
      const weekday = getWeekdayName(r.date);
      lines.push(
        `### ${r.date} ${weekday} - ${moodInfo ? `${moodInfo.emoji} ${moodInfo.label}` : r.mood}`
      );
      lines.push("");
      lines.push(r.content);
      lines.push("");
    });
  }

  lines.push("---");
  lines.push(`*由 PomodoroX 生成 - ${startDate} ~ ${endDate}*`);

  return lines.join("\n");
}

/**
 * 导出每周报告
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @param tasks 任务列表
 * @param reflections 反思列表
 * @param sessions 会话列表
 * @returns Markdown 字符串
 */
export function exportWeeklyReport(
  startDate: string,
  endDate: string,
  tasks: Task[],
  reflections: Reflection[],
  sessions: Session[]
): string {
  const lines: string[] = [];

  lines.push(`# 周报: ${startDate} ~ ${endDate}`);
  lines.push("");

  // 统计摘要
  const workSessions = sessions.filter((s) => s.type === "work" && s.completed);
  const totalFocusMinutes = workSessions.reduce(
    (sum, s) => sum + Math.round(s.duration / 60),
    0
  );
  const completedTasks = tasks.filter((t) => t.status === "done");

  lines.push("## 本周概览");
  lines.push("");
  lines.push("| 指标 | 数值 |");
  lines.push("| --- | --- |");
  lines.push(`| 完成番茄钟 | ${workSessions.length} 个 |`);
  lines.push(`| 专注时长 | ${formatMinutes(totalFocusMinutes)} |`);
  lines.push(`| 完成任务 | ${completedTasks.length} 个 |`);
  lines.push(`| 新增任务 | ${tasks.length} 个 |`);
  lines.push(`| 反思记录 | ${reflections.length} 条 |`);
  lines.push("");

  // 每日番茄钟统计
  const dailySessions = new Map<string, Session[]>();
  workSessions.forEach((s) => {
    const day = s.startedAt.split(" ")[0];
    if (!dailySessions.has(day)) dailySessions.set(day, []);
    dailySessions.get(day)!.push(s);
  });

  if (dailySessions.size > 0) {
    lines.push("## 每日专注统计");
    lines.push("");
    lines.push("| 日期 | 星期 | 番茄钟数 | 专注时长 |");
    lines.push("| --- | --- | --- | --- |");
    const sortedDays = Array.from(dailySessions.keys()).sort();
    sortedDays.forEach((day) => {
      const daySessions = dailySessions.get(day)!;
      const mins = daySessions.reduce(
        (sum, s) => sum + Math.round(s.duration / 60),
        0
      );
      lines.push(
        `| ${day} | ${getWeekdayName(day)} | ${daySessions.length} | ${formatMinutes(mins)} |`
      );
    });
    lines.push("");
  }

  // 番茄钟明细
  renderSessionDetails(sessions, tasks, lines);

  // 已完成任务
  if (completedTasks.length > 0) {
    lines.push("## 已完成任务");
    lines.push("");
    completedTasks.forEach((task) => {
      const priorityLabel =
        PRIORITIES.find((p) => p.value === task.priority)?.label || "";
      lines.push(
        `- [x] ${task.title} ${priorityLabel ? `(${priorityLabel})` : ""}`
      );
      if (task.plan) {
        lines.push("");
        lines.push("  **规划：**");
        task.plan.split("\n").forEach((l) => lines.push(`  > ${l}`));
      }
      if (task.completion) {
        lines.push("");
        lines.push("  **总结：**");
        task.completion.split("\n").forEach((l) => lines.push(`  > ${l}`));
      }
    });
    lines.push("");
  }

  // 未完成任务
  const incompleteTasks = tasks.filter(
    (t) => t.status !== "done" && t.status !== "archived"
  );
  if (incompleteTasks.length > 0) {
    lines.push("## 未完成任务");
    lines.push("");
    incompleteTasks.forEach((task) => {
      const statusLabel =
        STATUSES.find((s) => s.value === task.status)?.label || "";
      lines.push(`- [ ] ${task.title} (${statusLabel})`);
      if (task.plan) {
        lines.push("");
        lines.push("  **规划：**");
        task.plan.split("\n").forEach((l) => lines.push(`  > ${l}`));
      }
      if (task.completion) {
        lines.push("");
        lines.push("  **总结：**");
        task.completion.split("\n").forEach((l) => lines.push(`  > ${l}`));
      }
    });
    lines.push("");
  }

  // 反思汇总
  if (reflections.length > 0) {
    lines.push("## 反思汇总");
    lines.push("");
    reflections.forEach((r) => {
      const moodInfo = MOODS.find((m) => m.value === r.mood);
      const weekday = getWeekdayName(r.date);
      lines.push(
        `### ${r.date} ${weekday} - ${moodInfo ? `${moodInfo.emoji} ${moodInfo.label}` : r.mood}`
      );
      lines.push("");
      lines.push(r.content);
      lines.push("");
    });
  }

  lines.push("---");
  lines.push(`*由 PomodoroX 生成 - ${startDate} ~ ${endDate}*`);

  return lines.join("\n");
}

/**
 * 导出任务报告
 * @param tasks 任务列表
 * @returns Markdown 字符串
 */
export function exportTaskReport(tasks: Task[]): string {
  const lines: string[] = [];

  lines.push("# PomodoroX 任务报告");
  lines.push("");
  lines.push(`*生成时间: ${formatDate(new Date())}*`);
  lines.push("");

  // 统计
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    archived: tasks.filter((t) => t.status === "archived").length,
    totalEstimated: tasks.reduce((sum, t) => sum + t.estimatedPomodoros, 0),
    totalActual: tasks.reduce((sum, t) => sum + t.actualPomodoros, 0),
  };

  lines.push("## 统计概览");
  lines.push("");
  lines.push("| 状态 | 数量 |");
  lines.push("| --- | --- |");
  lines.push(`| 待办 | ${stats.todo} |`);
  lines.push(`| 进行中 | ${stats.inProgress} |`);
  lines.push(`| 已完成 | ${stats.done} |`);
  lines.push(`| 已归档 | ${stats.archived} |`);
  lines.push(`| **总计** | **${stats.total}** |`);
  lines.push("");
  lines.push(
    `预估番茄钟: ${stats.totalEstimated} | 实际番茄钟: ${stats.totalActual}`
  );
  lines.push("");

  // 按优先级分组
  const priorityGroups = new Map<string, Task[]>();
  tasks
    .filter((t) => t.status !== "archived")
    .forEach((t) => {
      const group = priorityGroups.get(t.priority) || [];
      group.push(t);
      priorityGroups.set(t.priority, group);
    });

  const priorityOrder = ["urgent", "high", "medium", "low"];
  priorityOrder.forEach((priority) => {
    const group = priorityGroups.get(priority);
    if (!group || group.length === 0) return;
    const priorityInfo = PRIORITIES.find((p) => p.value === priority);
    lines.push(`## ${priorityInfo?.label || priority}优先级`);
    lines.push("");
    group.forEach((task) => {
      const checkbox = task.status === "done" ? "[x]" : "[ ]";
      const statusLabel =
        STATUSES.find((s) => s.value === task.status)?.label || "";
      lines.push(`- ${checkbox} ${task.title} [${statusLabel}]`);
      if (task.description) {
        lines.push(`  > ${task.description}`);
      }
      if (task.tags.length > 0) {
        lines.push(`  标签: ${task.tags.map((t) => `\`${t}\``).join(" ")}`);
      }
      if (task.dueDate) {
        lines.push(`  截止: ${task.dueDate}`);
      }
      lines.push(
        `  番茄钟: ${task.actualPomodoros}/${task.estimatedPomodoros}`
      );
    });
    lines.push("");
  });

  lines.push("---");
  lines.push("*由 PomodoroX 生成*");

  return lines.join("\n");
}

/**
 * 导出反思报告
 * @param reflections 反思列表
 * @returns Markdown 字符串
 */
export function exportReflectionReport(reflections: Reflection[]): string {
  const lines: string[] = [];

  lines.push("# PomodoroX 反思报告");
  lines.push("");
  lines.push(`*生成时间: ${formatDate(new Date())}*`);
  lines.push("");

  // 心情统计
  const moodCounts = new Map<string, number>();
  reflections.forEach((r) => {
    moodCounts.set(r.mood, (moodCounts.get(r.mood) || 0) + 1);
  });

  if (moodCounts.size > 0) {
    lines.push("## 心情统计");
    lines.push("");
    lines.push("| 心情 | 次数 |");
    lines.push("| --- | --- |");
    MOODS.forEach((mood) => {
      const count = moodCounts.get(mood.value) || 0;
      if (count > 0) {
        lines.push(`| ${mood.emoji} ${mood.label} | ${count} |`);
      }
    });
    lines.push("");
  }

  // 标签统计
  const tagCounts = new Map<string, number>();
  reflections.forEach((r) => {
    r.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  if (tagCounts.size > 0) {
    lines.push("## 标签统计");
    lines.push("");
    lines.push("| 标签 | 次数 |");
    lines.push("| --- | --- |");
    Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([tag, count]) => {
        lines.push(`| ${tag} | ${count} |`);
      });
    lines.push("");
  }

  // 按时间倒序排列
  const sorted = [...reflections].sort((a, b) => b.date.localeCompare(a.date));

  lines.push("## 反思记录");
  lines.push("");

  sorted.forEach((r) => {
    const moodInfo = MOODS.find((m) => m.value === r.mood);
    const weekday = getWeekdayName(r.date);
    lines.push(`### ${r.date} ${weekday}`);
    lines.push("");
    lines.push(
      `**心情**: ${moodInfo ? `${moodInfo.emoji} ${moodInfo.label}` : r.mood}`
    );
    if (r.tags.length > 0) {
      lines.push(`**标签**: ${r.tags.map((t) => `\`${t}\``).join(" ")}`);
    }
    lines.push("");
    lines.push(r.content);
    lines.push("");
  });

  lines.push("---");
  lines.push("*由 PomodoroX 生成*");

  return lines.join("\n");
}

// ============================================================
// 数据筛选引擎
// ============================================================

/**
 * 判断任务在指定日期范围内是否有任何活动
 * 活动 = 创建于区间内 | 更新于区间内 | 有番茄钟 session 在区间内
 */
export function isTaskActiveInRange(
  task: Task,
  sessions: Session[],
  start: Date,
  end: Date
): boolean {
  const created = new Date(task.createdAt);
  const updated = new Date(task.updatedAt);

  if (created >= start && created <= end) return true;
  if (updated >= start && updated <= end) return true;

  const hasSessionInRange = sessions.some(
    (s) =>
      s.taskId === task.id &&
      new Date(s.startedAt) >= start &&
      new Date(s.startedAt) <= end
  );
  return hasSessionInRange;
}

/** 筛选任务的多维条件 */
export function filterTasks(
  tasks: Task[],
  filters?: ExportOptions["filters"],
  dateRange?: { start: string; end: string }
): Task[] {
  return tasks.filter((t) => {
    // 状态
    if (
      filters?.status &&
      filters.status !== "all" &&
      t.status !== filters.status
    )
      return false;
    // 优先级
    if (filters?.priority && t.priority !== filters.priority) return false;
    // 标签
    if (filters?.tags && filters.tags.length > 0) {
      if (!filters.tags.some((tag) => t.tags.includes(tag))) return false;
    }
    // 搜索（匹配 title / description / plan / completion）
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.plan.toLowerCase().includes(q) ||
        t.completion.toLowerCase().includes(q);
      if (!match) return false;
    }
    // 时间范围
    if (dateRange) {
      const start = new Date(dateRange.start + "T00:00:00");
      const end = new Date(dateRange.end + "T23:59:59");
      if (!isTaskActiveInRange(t, [], start, end)) return false;
    }
    return true;
  });
}

// ============================================================
// 通用高级导出器
// ============================================================

function renderToCsv(tasks: Task[]): string {
  const headers = [
    "ID",
    "Title",
    "Status",
    "Priority",
    "Tags",
    "DueDate",
    "Estimated",
    "Actual",
    "Plan",
    "Completion",
    "CreatedAt",
    "UpdatedAt",
  ];

  function escapeCsv(value: string): string {
    // 防御 CSV 公式注入：前缀危险字符
    if (/^[=+\-@]/.test(value)) {
      value = "'" + value;
    }
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  const rows = tasks.map((t) =>
    [
      t.id,
      escapeCsv(t.title),
      t.status,
      t.priority,
      escapeCsv(t.tags.join(",")),
      t.dueDate || "",
      String(t.estimatedPomodoros),
      String(t.actualPomodoros),
      escapeCsv(t.plan.replace(/\n/g, "\\n")),
      escapeCsv(t.completion.replace(/\n/g, "\\n")),
      t.createdAt,
      t.updatedAt,
    ].join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

function renderToJson(
  type: string,
  tasks: Task[],
  sessions: Session[],
  reflections: Reflection[],
  dateRange?: { start: string; end: string }
): string {
  const workSessions = sessions.filter((s) => s.type === "work" && s.completed);
  const totalFocusMinutes = workSessions.reduce(
    (sum, s) => sum + Math.round(s.duration / 60),
    0
  );

  return JSON.stringify(
    {
      meta: {
        generatedAt: new Date().toISOString(),
        type,
        dateRange,
      },
      summary: {
        totalSessions: workSessions.length,
        totalFocusMinutes,
        completedTasks: tasks.filter((t) => t.status === "done").length,
        totalTasks: tasks.length,
        totalReflections: reflections.length,
      },
      tasks,
      sessions,
      reflections,
    },
    null,
    2
  );
}

export function exportAdvancedReport(options: ExportOptions): string {
  const {
    type,
    format,
    tasks,
    sessions = [],
    reflections = [],
    dateRange,
    filters,
  } = options;

  const filteredTasks = filters
    ? filterTasks(tasks, filters, dateRange)
    : tasks;

  switch (format) {
    case "markdown": {
      if (type === "daily") {
        const date = dateRange?.start || formatDate(new Date());
        return exportDailyReport(date, filteredTasks, reflections, sessions);
      }
      if (type === "weekly") {
        const start = dateRange?.start || formatDate(new Date());
        const end = dateRange?.end || start;
        return exportWeeklyReport(
          start,
          end,
          filteredTasks,
          reflections,
          sessions
        );
      }
      if (type === "biweekly") {
        const start = dateRange?.start || formatDate(new Date());
        const end = dateRange?.end || start;
        return exportBiweeklyReport(
          start,
          end,
          filteredTasks,
          reflections,
          sessions
        );
      }
      if (type === "task") {
        return exportTaskReport(filteredTasks);
      }
      throw new Error(`Unsupported type: ${type} for markdown`);
    }
    case "csv":
      return renderToCsv(filteredTasks);
    case "json":
      return renderToJson(
        type,
        filteredTasks,
        sessions,
        reflections,
        dateRange
      );
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
