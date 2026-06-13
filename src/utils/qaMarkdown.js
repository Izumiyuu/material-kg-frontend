import { marked } from 'marked'

marked.setOptions({
  breaks: true,
  gfm: true,
})

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function renderRichContent(text) {
  if (!text) return ''
  try {
    return marked.parse(text)
  } catch {
    return escapeHtml(text)
  }
}
