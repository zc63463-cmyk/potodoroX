import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import { sanitizeHtml } from "@/utils/sanitize";

const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

md.use(anchor, {
  slugify,
  permalink: false,
});

export interface TocItem {
  level: number;
  text: string;
  id: string;
}

export function useMarkdown() {
  function renderMarkdown(text: string): string {
    const html = md.render(text);
    // Defense-in-depth: DOM-based sanitization strips dangerous elements,
    // event handlers, and protocol-based attacks that may have slipped through
    return sanitizeHtml(html);
  }

  function extractToc(text: string): TocItem[] {
    const tokens = md.parse(text, {});
    const toc: TocItem[] = [];
    const seenIds = new Set<string>();
    for (let i = 0; i < tokens.length; i++) {
      if (
        tokens[i].type === "heading_open" &&
        tokens[i].tag.match(/^h[1-3]$/)
      ) {
        const level = parseInt(tokens[i].tag[1]);
        const textToken = tokens[i + 1];
        if (textToken && textToken.type === "inline") {
          const rawText = textToken.content;
          const id = slugify(rawText);
          if (seenIds.has(id)) continue;
          seenIds.add(id);
          toc.push({ level, text: rawText, id });
        }
      }
    }
    return toc;
  }

  return { renderMarkdown, extractToc };
}
