import { computed, nextTick, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import {
  deleteConversation as apiDeleteConversation,
  formatQaError,
  listConversations,
  listMessages,
  sendFeedback,
  streamChatMessage,
} from '@/api/qa'
import { handleStreamEvent } from '@/utils/qaReasoning'

const USER_KEY = 'kg_qa_user_id'

export const SUGGESTIONS = [
  '离子电导率随热处理如何变化？请结合文献和知识图谱回答',
  '玻璃结晶过程中 ZrO2 起什么作用？',
  'Na2O-ZrO2-P2O5-SiO2 体系的主要表征方法有哪些？',
]

function getUserId() {
  let id = localStorage.getItem(USER_KEY)
  if (!id) {
    id = `u-${crypto.randomUUID()}`
    localStorage.setItem(USER_KEY, id)
  }
  return id
}

function createEmptyMessage(query) {
  return {
    query,
    answer: '',
    id: null,
    status: 'thinking',
    answerPhase: 'thinking',
    toolName: null,
    reasoning: [],
    reasoningExpanded: true,
    feedback: null,
  }
}

export function useChat() {
  const user = ref(getUserId())
  const conversationId = ref(null)
  const conversations = ref([])
  const messages = ref([])
  const streaming = ref(false)
  const loadingConversations = ref(false)
  const loadingMessages = ref(false)
  const convListError = ref('')
  const inputText = ref('')

  let abortCtrl = null
  let streamGen = 0

  const chatTitle = computed(() => {
    if (!conversationId.value) return '智能体知识问答'
    const conv = conversations.value.find((c) => c.id === conversationId.value)
    return conv?.name || '历史会话'
  })

  const showWelcome = computed(() => !messages.value.length)

  function abortStream() {
    streamGen += 1
    if (abortCtrl) {
      try {
        abortCtrl.abort()
      } catch {
        /* ignore */
      }
      abortCtrl = null
    }
    streaming.value = false
  }

  async function fetchConversations() {
    loadingConversations.value = true
    convListError.value = ''
    try {
      const data = await listConversations(user.value)
      conversations.value = data.data || []
    } catch (e) {
      convListError.value = formatQaError(e)
      conversations.value = []
    } finally {
      loadingConversations.value = false
    }
  }

  async function fetchMessages() {
    if (!conversationId.value) {
      messages.value = []
      return
    }
    loadingMessages.value = true
    try {
      const data = await listMessages(conversationId.value, user.value)
      messages.value = (data.data || []).reverse().map((m) => ({
        id: m.id,
        query: m.query,
        answer: m.answer,
        feedback: m.feedback,
        reasoning: [],
        reasoningExpanded: false,
        status: null,
        answerPhase: 'done',
        toolName: null,
      }))
    } catch (e) {
      ElMessage.error(`加载消息失败：${formatQaError(e)}`)
    } finally {
      loadingMessages.value = false
    }
  }

  function newChat() {
    if (streaming.value) abortStream()
    conversationId.value = null
    messages.value = []
  }

  async function openConversation(id) {
    if (streaming.value) return
    conversationId.value = id
    await fetchMessages()
  }

  async function removeConversation(id) {
    try {
      await ElMessageBox.confirm('确定删除此会话？', '提示', { type: 'warning' })
    } catch {
      return
    }
    try {
      await apiDeleteConversation(id, user.value)
      if (conversationId.value === id) newChat()
      await fetchConversations()
    } catch (e) {
      ElMessage.error(e.message)
    }
  }

  async function syncFinalAnswer(msgIdx) {
    const msg = messages.value[msgIdx]
    if (!msg?.id || !conversationId.value) return
    try {
      const data = await listMessages(conversationId.value, user.value, 20)
      const found = (data.data || []).find((m) => m.id === msg.id)
      if (found?.answer) msg.answer = found.answer
    } catch {
      /* ignore */
    }
  }

  async function streamChat(query, replaceIdx) {
    if (streaming.value) return

    const gen = ++streamGen
    let msgIdx

    if (replaceIdx !== undefined) {
      msgIdx = replaceIdx
      const msg = messages.value[msgIdx]
      msg.answer = ''
      msg.id = null
      msg.status = 'thinking'
      msg.answerPhase = 'thinking'
      msg.toolName = null
      msg.reasoning = []
      msg.reasoningExpanded = true
    } else {
      msgIdx = messages.value.length
      messages.value.push(createEmptyMessage(query))
    }

    streaming.value = true
    abortCtrl = new AbortController()

    const state = { conversationId: conversationId.value }

    try {
      const res = await streamChatMessage({
        user: user.value,
        query,
        conversationId: conversationId.value,
        signal: abortCtrl.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || res.statusText)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue
          const payload = trimmed.slice(5).trim()
          if (!payload || payload === '[DONE]') continue
          try {
            handleStreamEvent(JSON.parse(payload), messages.value[msgIdx], state)
            if (gen !== streamGen) break
            if (state.conversationId && !conversationId.value) {
              conversationId.value = state.conversationId
            }
          } catch {
            /* skip malformed */
          }
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError' && gen === streamGen) {
        const msg = messages.value[msgIdx]
        msg.answer = msg.answer || `请求失败：${formatQaError(e)}`
        ElMessage.error(formatQaError(e))
      }
    } finally {
      if (gen !== streamGen) return
      streaming.value = false
      abortCtrl = null
      const msg = messages.value[msgIdx]
      if (msg) {
        msg.status = null
        msg.toolName = null
        msg.reasoningExpanded = false
      }
      if (state.conversationId && !conversationId.value) {
        conversationId.value = state.conversationId
      }
      await syncFinalAnswer(msgIdx)
      try {
        await fetchConversations()
      } catch {
        /* ignore */
      }
    }
  }

  async function sendMessage(text) {
    const query = (text ?? inputText.value).trim()
    if (!query || streaming.value) return
    inputText.value = ''
    await streamChat(query)
  }

  async function copyAnswer(idx) {
    const msg = messages.value[idx]
    if (!msg?.answer) return
    try {
      await navigator.clipboard.writeText(msg.answer)
      ElMessage.success('已复制到剪贴板')
    } catch {
      ElMessage.error('复制失败')
    }
  }

  async function submitFeedback(idx, rating) {
    const msg = messages.value[idx]
    if (!msg?.id) return
    try {
      await sendFeedback(msg.id, user.value, rating)
      msg.feedback = { rating }
      ElMessage.success(rating === 'like' ? '感谢反馈 👍' : '已记录反馈')
    } catch (e) {
      ElMessage.error(e.message)
    }
  }

  function regenerate(idx) {
    const msg = messages.value[idx]
    if (!msg || streaming.value) return
    streamChat(msg.query, idx)
  }

  function toggleReasoning(idx) {
    const msg = messages.value[idx]
    if (msg) msg.reasoningExpanded = !msg.reasoningExpanded
  }

  onMounted(() => {
    fetchConversations()
  })

  return {
    user,
    conversationId,
    conversations,
    messages,
    streaming,
    loadingConversations,
    loadingMessages,
    convListError,
    inputText,
    chatTitle,
    showWelcome,
    fetchConversations,
    fetchMessages,
    newChat,
    openConversation,
    removeConversation,
    sendMessage,
    copyAnswer,
    submitFeedback,
    regenerate,
    toggleReasoning,
  }
}
