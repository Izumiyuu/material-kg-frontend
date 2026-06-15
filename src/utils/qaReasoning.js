const TOOL_LABELS = {
  searchDocuments: '文献检索',
  searchKnowledgeGraph: '知识图谱检索',
  search_documents: '文献检索',
  search_knowledge_graph: '知识图谱检索',
}

export function getToolLabel(tool) {
  return TOOL_LABELS[tool] || tool || '工具'
}

function tryParseJson(str) {
  if (str == null) return null
  if (typeof str === 'object') return str
  const t = String(str).trim()
  if (!t.startsWith('{') && !t.startsWith('[')) return null
  try {
    return JSON.parse(t)
  } catch {
    return null
  }
}

export function humanizeThought(text) {
  if (!text || typeof text !== 'string') return ''
  const t = text.trim()
  const parsed = tryParseJson(t)
  if (parsed) {
    if (parsed.query) return `分析问题：${parsed.query}`
    if (parsed.text) return String(parsed.text)
    return ''
  }
  if (t.startsWith('{') || t.startsWith('[')) return ''
  return t
}

export function humanizeToolInput(raw) {
  if (!raw) return ''
  const inp = tryParseJson(raw) || (typeof raw === 'object' ? raw : null)
  if (!inp) return ''
  const parts = []
  if (inp.query) parts.push(`关键词：${inp.query}`)
  if (inp.document_id) parts.push(`文档 ID：${inp.document_id}`)
  if (inp.top_k) parts.push(`条数：${inp.top_k}`)
  return parts.join(' · ')
}

export function humanizeObservation(raw, toolName) {
  if (!raw) return null
  const obs = tryParseJson(raw)
  if (!obs) {
    const t = String(raw).trim()
    if (t.startsWith('{') || t.startsWith('[')) return null
    return { summary: '', preview: t.slice(0, 600) }
  }
  const label = getToolLabel(toolName)
  if (typeof obs.context === 'string' && obs.context.trim()) {
    const n = Array.isArray(obs.sources) ? obs.sources.length : null
    const summary =
      obs.success === false
        ? `${label}：未找到相关内容`
        : `${label}：找到 ${n != null ? `${n} 条` : '相关'}结果`
    return { summary, preview: obs.context.trim().slice(0, 600) }
  }
  if (obs.result && typeof obs.result === 'string') {
    return { summary: `${label}完成`, preview: obs.result.slice(0, 600) }
  }
  if (obs.text && typeof obs.text === 'string') {
    return { summary: `${label}完成`, preview: obs.text.slice(0, 600) }
  }
  return null
}

export function mergeAnswer(current, chunk) {
  if (!chunk) return current || ''
  if (!current) return chunk
  if (chunk === current) return current
  if (chunk.length >= current.length && chunk.startsWith(current)) return chunk
  if (current.endsWith(chunk)) return current
  return current + chunk
}

export function upsertReasoningStep(msg, evt) {
  if (!msg.reasoning) msg.reasoning = []
  const stepId = evt.id != null ? String(evt.id) : `p${evt.position ?? msg.reasoning.length}`
  let step = msg.reasoning.find((s) => s.id === stepId)
  if (!step) {
    step = { id: stepId, thought: '', tool: '', toolInput: '', observation: '' }
    msg.reasoning.push(step)
  }
  if (evt.thought) step.thought = evt.thought
  const tool = evt.tool || evt.tool_name
  if (tool) step.tool = tool
  if (evt.tool_input) {
    step.toolInput =
      typeof evt.tool_input === 'string' ? evt.tool_input : JSON.stringify(evt.tool_input)
  }
  if (evt.observation) step.observation = evt.observation
}

export function handleStreamEvent(evt, msg, state) {
  const event = evt.event

  if (event === 'error') {
    msg.answer = msg.answer || `错误：${evt.message || '未知错误'}`
    msg.status = null
    return
  }

  if (event === 'agent_thought') {
    msg.status = 'thinking'
    msg.answerPhase = 'thinking'
    upsertReasoningStep(msg, evt)
    msg.toolName = evt.tool || evt.tool_name || null
    return 'statusOnly'
  }

  if (event === 'message' || event === 'agent_message') {
    if (msg.answerPhase === 'thinking') msg.answer = ''
    msg.answerPhase = 'responding'
    msg.status = 'responding'
    msg.toolName = null
    if (evt.answer) msg.answer = mergeAnswer(msg.answer, evt.answer)
    if (evt.conversation_id && !state.conversationId) {
      state.conversationId = evt.conversation_id
    }
    if (evt.message_id) msg.id = evt.message_id
    return
  }

  if (event === 'message_replace') {
    if (evt.answer) msg.answer = evt.answer
    return 'content'
  }

  if (event === 'message_end') {
    msg.status = null
    msg.toolName = null
    msg.answerPhase = 'done'
    msg.reasoningExpanded = false
    if (evt.id) msg.id = evt.id
    if (evt.message_id) msg.id = evt.message_id
    if (evt.conversation_id && !state.conversationId) {
      state.conversationId = evt.conversation_id
    }
    return 'done'
  }

  if (event === 'workflow_started' || event === 'node_started') {
    msg.status = 'thinking'
    msg.answerPhase = 'thinking'
  }
}
