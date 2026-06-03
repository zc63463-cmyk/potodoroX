/**
 * SessionNoteModal 行为测试
 *
 * 只测试通过公开接口（props / emits）可观测的行为，不测内部实现。
 * 注意：组件使用 Teleport to="body"，查询时用 document.querySelector。
 */

import { describe, it, expect, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import SessionNoteModal from "./SessionNoteModal.vue";

// ---- 挂载辅助 ----

function mountModal(
  overrides: {
    visible?: boolean;
    mode?: "plan" | "completion";
    initialContent?: string;
  } = {}
) {
  return mount(SessionNoteModal, {
    props: {
      visible: overrides.visible ?? true,
      mode: overrides.mode ?? "plan",
      initialContent: overrides.initialContent,
    },
    attachTo: document.body,
  });
}

/** 从 document 查询 teleported 的 DOM 元素 */
function qs(selector: string) {
  return document.querySelector(selector) as HTMLElement | null;
}
function qsa(selector: string) {
  return document.querySelectorAll(selector);
}

afterEach(() => {
  // 清理 body 中残留的 teleported 节点
  document.body.innerHTML = "";
});

// ============================================================
// 1. 显隐行为
// ============================================================

describe("SessionNoteModal 显隐", () => {
  it("visible=false 时不渲染到 DOM", () => {
    mountModal({ visible: false });
    expect(qs(".sn-modal-overlay")).toBeNull();
  });

  it("visible=true 时渲染到 DOM", () => {
    mountModal({ visible: true });
    expect(qs(".sn-modal-overlay")).not.toBeNull();
  });

  it("再次打开时 content 重置为 initialContent", async () => {
    const wrapper = mountModal({ visible: true, initialContent: "上次的内容" });
    // 输入新内容
    const ta = qs("textarea")!;
    (ta as HTMLTextAreaElement).value = "新的内容";
    ta.dispatchEvent(new Event("input"));

    // 关闭
    await (wrapper as any).setProps({ visible: false });
    await nextTick();

    // 重新打开，更换 initialContent
    await (wrapper as any).setProps({
      visible: true,
      initialContent: "重置内容",
    });
    await nextTick();

    const ta2 = qs("textarea")!;
    expect((ta2 as HTMLTextAreaElement).value).toBe("重置内容");
  });
});

// ============================================================
// 2. plan / completion 模式
// ============================================================

describe("SessionNoteModal 模式切换", () => {
  it('mode="plan" 显示"计时目标"标题和"开始计时"按钮', () => {
    mountModal({ mode: "plan" });
    const modal = qs(".sn-modal")!;
    expect(modal.textContent).toContain("计时目标");
    expect(modal.textContent).toContain("开始计时");
  });

  it('mode="completion" 显示"计时总结"标题和"保存总结"按钮', () => {
    mountModal({ mode: "completion" });
    const modal = qs(".sn-modal")!;
    expect(modal.textContent).toContain("计时总结");
    expect(modal.textContent).toContain("保存总结");
  });
});

// ============================================================
// 3. confirm / skip / close 事件
// ============================================================

describe("SessionNoteModal 事件", () => {
  it("点击确认按钮 emit confirm 事件并携带内容", async () => {
    const wrapper = mountModal({ mode: "plan" });
    const ta = qs("textarea")!;
    (ta as HTMLTextAreaElement).value = "完成登录页 UI";
    ta.dispatchEvent(new Event("input"));

    qs(".btn-primary")!.click();
    await nextTick();

    expect(wrapper.emitted("confirm")).toBeTruthy();
    expect(wrapper.emitted("confirm")![0]).toEqual(["完成登录页 UI"]);
  });

  it("点击跳过按钮 emit skip 事件", async () => {
    const wrapper = mountModal();
    qs(".btn-secondary")!.click();
    await nextTick();
    expect(wrapper.emitted("skip")).toBeTruthy();
  });

  it("点击遮罩 emit close 事件", async () => {
    const wrapper = mountModal();
    // 点击 overlay 自身（非 modal 卡片区域）
    const overlay = qs(".sn-modal-overlay")!;
    overlay.click();
    await nextTick();
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("点击关闭按钮 emit close 事件", async () => {
    const wrapper = mountModal();
    qs(".sn-modal-close")!.click();
    await nextTick();
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("按 Esc emit close 事件", async () => {
    const wrapper = mountModal();
    const overlay = qs(".sn-modal-overlay")!;
    overlay.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
    );
    await nextTick();
    expect(wrapper.emitted("close")).toBeTruthy();
  });
});

// ============================================================
// 4. 键盘快捷键
// ============================================================

describe("SessionNoteModal 键盘快捷键", () => {
  it("Ctrl+Enter emit confirm 事件", async () => {
    const wrapper = mountModal({ mode: "completion" });
    const ta = qs("textarea")! as HTMLTextAreaElement;
    ta.value = "总结内容";
    ta.dispatchEvent(new Event("input"));

    ta.dispatchEvent(
      new KeyboardEvent("keydown", {
        ctrlKey: true,
        key: "Enter",
        bubbles: true,
      })
    );
    await nextTick();

    expect(wrapper.emitted("confirm")).toBeTruthy();
    expect(wrapper.emitted("confirm")![0]).toEqual(["总结内容"]);
  });

  it("普通 Enter 不触发确认", async () => {
    const wrapper = mountModal();
    const ta = qs("textarea")! as HTMLTextAreaElement;
    ta.value = "内容";
    ta.dispatchEvent(new Event("input"));

    ta.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
    );
    await nextTick();

    expect(wrapper.emitted("confirm")).toBeFalsy();
  });
});

// ============================================================
// 5. 格式工具栏
// ============================================================

describe("SessionNoteModal 格式插入", () => {
  it("insertFormat 包裹选中文本（加粗）", async () => {
    mountModal({ mode: "plan" });
    const ta = qs("textarea")! as HTMLTextAreaElement;

    // 使用 textarea 元素自身的 setRangeText 模拟选中 + 插入
    ta.focus();
    ta.value = "选中";
    ta.dispatchEvent(new Event("input"));
    await nextTick();

    // 选中全部文字
    ta.setSelectionRange(0, 2);

    // 点击加粗按钮（第 0 个工具栏按钮）
    (qsa(".sn-toolbar-btn")[0] as HTMLElement).click();
    await nextTick();

    // insertFormat 通过 content.value 赋值 → Vue 更新 textarea
    // 需要等 Vue 下次 tick
    await nextTick();
    expect(ta.value).toBe("**选中**");
  });

  it("无选中文本时 insertFormat 插入前后缀（有序列表）", async () => {
    mountModal({ mode: "plan" });
    const ta = qs("textarea")! as HTMLTextAreaElement;
    ta.focus();
    ta.value = "";
    ta.dispatchEvent(new Event("input"));
    await nextTick();
    ta.setSelectionRange(0, 0);

    // 第 3 个按钮 = 有序列表
    (qsa(".sn-toolbar-btn")[3] as HTMLElement).click();
    await nextTick();
    await nextTick();

    expect(ta.value).toBe("\n1. ");
  });
});

// ============================================================
// 6. 预览切换
// ============================================================

describe("SessionNoteModal 预览", () => {
  it("点击预览按钮后 textarea 隐藏、预览区显示", async () => {
    mountModal({ mode: "plan" });
    // textarea 在编辑模式下可见
    expect(qs("textarea")).not.toBeNull();

    // 点击最后一个工具栏按钮（预览 eye icon）
    const toolbarBtns = Array.from(qsa(".sn-toolbar-btn"));
    const previewBtn = toolbarBtns[toolbarBtns.length - 1] as HTMLElement;
    previewBtn.click();
    await nextTick();

    // textarea 隐藏，预览区显示（v-show 隐藏只是 display:none，仍存在）
    const ta = qs("textarea")!;
    expect(ta.style.display).toBe("none");
    expect(qs(".sn-preview")).not.toBeNull();
  });
});

// ============================================================
// 7. 无障碍
// ============================================================

describe("SessionNoteModal 无障碍", () => {
  it("modal overlay 应有 role=dialog 和 aria-modal", () => {
    mountModal();
    const overlay = qs(".sn-modal-overlay")!;
    expect(overlay.getAttribute("role")).toBe("dialog");
    expect(overlay.getAttribute("aria-modal")).toBe("true");
  });

  it("标题应有 id 且 aria-labelledby 指向它", () => {
    mountModal();
    const overlay = qs(".sn-modal-overlay")!;
    const title = qs(".sn-modal-title");
    expect(title).not.toBeNull();
    expect(overlay.getAttribute("aria-labelledby")).toBe(
      title!.getAttribute("id")
    );
  });

  it("工具栏按钮应有 aria-label", () => {
    mountModal();
    const buttons = qsa(".sn-toolbar-btn");
    for (const btn of Array.from(buttons)) {
      expect(btn.getAttribute("aria-label")).toBeTruthy();
    }
  });

  it("textarea 应有 aria-label", () => {
    mountModal();
    const ta = qs("textarea")!;
    expect(ta.getAttribute("aria-label")).toBeTruthy();
  });

  it("工具栏应有 role=toolbar", () => {
    mountModal();
    const toolbar = qs(".sn-toolbar")!;
    expect(toolbar.getAttribute("role")).toBe("toolbar");
  });
});
