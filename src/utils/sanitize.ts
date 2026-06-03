// ============================================================
// PomodoroX - HTML Sanitizer（轻量、零依赖）
// 基于浏览器 DOMParser，针对 markdown-it 输出做防御性清洗
// ============================================================

/** 需要完全移除的危险标签 */
const REMOVE_TAGS = new Set([
  "script",
  "iframe",
  "object",
  "embed",
  "applet",
  "form",
  "input",
  "button",
  "select",
  "textarea",
  "link",
  "meta",
  "base",
  "style",
]);

/** 需要从所有元素上移除的属性（事件处理器 + 危险协议载体） */
const STRIP_ATTRS = /^on\w+|^formaction$/i;

/** 危险协议（href / src / action / formaction） */
const DANGEROUS_PROTOCOLS = /^(javascript|data|vbscript|file):/i;

/**
 * 清洗 HTML 字符串，移除 XSS 攻击向量
 *
 * @param html 原始 HTML 字符串
 * @returns 清洗后的安全 HTML 字符串。解析失败时返回空字符串
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== "string") return "";

  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(html, "text/html");
  } catch {
    return "";
  }

  // 遍历整个 DOM 树（排除 #document / html / head / body 自身）
  walkAndClean(doc.documentElement);

  // 只返回 body 内的内容
  return doc.body ? doc.body.innerHTML : "";
}

/**
 * 递归遍历 DOM 节点，清理危险元素和属性
 */
function walkAndClean(node: Node): void {
  let child = node.firstChild;

  while (child) {
    const next = child.nextSibling;

    if (child.nodeType === Node.ELEMENT_NODE) {
      walkAndClean(child);
    }

    // 删除危险元素
    if (
      child.nodeType === Node.ELEMENT_NODE &&
      REMOVE_TAGS.has((child as Element).tagName.toLowerCase())
    ) {
      node.removeChild(child);
      child = next;
      continue;
    }

    // 清理危险属性
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      const attrs = [...el.attributes];

      for (const attr of attrs) {
        const name = attr.name.toLowerCase();
        const value = attr.value;

        // 移除事件处理器属性
        if (STRIP_ATTRS.test(name)) {
          el.removeAttribute(name);
          continue;
        }

        // 移除危险协议
        const isUrlAttr =
          name === "href" ||
          name === "src" ||
          name === "action" ||
          name === "formaction" ||
          (name === "data" && el.tagName.toLowerCase() === "object");

        if (isUrlAttr && DANGEROUS_PROTOCOLS.test(value.trim())) {
          el.removeAttribute(name);
        }
      }
    }

    child = next;
  }
}
