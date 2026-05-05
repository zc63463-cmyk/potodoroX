import { marked } from 'marked'

marked.setOptions({
  breaks: true,
  gfm: true,
})

export function useMarkdown() {
  function sanitize(html: string): string {
    const temp = document.createElement('div')
    temp.innerHTML = html
    temp.querySelectorAll('script').forEach((el) => el.remove())
    temp.querySelectorAll('*').forEach((el) => {
      for (const attr of Array.from(el.attributes)) {
        if (/^on/i.test(attr.name) || attr.value.includes('javascript:')) {
          el.removeAttribute(attr.name)
        }
      }
    })
    return temp.innerHTML
  }

  function renderMarkdown(text: string): string {
    try {
      const raw = marked.parse(text, { async: false }) as string
      return sanitize(raw)
    } catch {
      return text.replace(/\n/g, '<br>')
    }
  }

  return { renderMarkdown }
}
