const QA_BASE = (import.meta.env.VITE_QA_API_BASE_URL || '/qa-api').replace(/\/$/, '')

function qaUrl(path) {
  return `${QA_BASE}${path}`
}

function networkHint(err) {
  if (err?.message === 'Failed to fetch' || err?.name === 'TypeError') {
    return '无法连接问答网关 (localhost:8010)，请先启动：cd kg/module5/qa-gateway && uvicorn app.main:app --port 8010'
  }
  return err?.message || '请求失败'
}

export function formatQaError(err) {
  return networkHint(err)
}

async function parseError(res) {
  const body = await res.json().catch(() => ({}))
  return body.detail || res.statusText || '请求失败'
}

export async function listConversations(user, limit = 50) {
  const res = await fetch(
    `${qaUrl('/api/v1/chat/conversations')}?user=${encodeURIComponent(user)}&limit=${limit}`
  )
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function listMessages(conversationId, user, limit = 50) {
  const res = await fetch(
    `${qaUrl(`/api/v1/chat/conversations/${conversationId}/messages`)}?user=${encodeURIComponent(user)}&limit=${limit}`
  )
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function deleteConversation(conversationId, user) {
  const res = await fetch(
    `${qaUrl(`/api/v1/chat/conversations/${conversationId}`)}?user=${encodeURIComponent(user)}`,
    { method: 'DELETE' }
  )
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function sendFeedback(messageId, user, rating) {
  const res = await fetch(qaUrl(`/api/v1/chat/messages/${messageId}/feedbacks`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, rating }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export function streamChatMessage({ user, query, conversationId, signal }) {
  return fetch(qaUrl('/api/v1/chat/messages'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, query, conversation_id: conversationId }),
    signal,
  })
}
