<script setup>
import { nextTick, ref, watch } from 'vue'
import { DArrowLeft, DArrowRight, Menu, Promotion, Refresh, Plus } from '@element-plus/icons-vue'

import MnSidebar from '@/components/mn/MnSidebar.vue'
import ChatMessageTurn from '@/components/qa/ChatMessageTurn.vue'
import ChatWelcome from '@/components/qa/ChatWelcome.vue'
import { useChat } from '@/composables/useChat'

const NAV_KEY = 'qa_nav_sidebar_collapsed'
const CONV_KEY = 'qa_conv_sidebar_collapsed'

const navCollapsed = ref(localStorage.getItem(NAV_KEY) === 'true')
const convCollapsed = ref(localStorage.getItem(CONV_KEY) === 'true')

const {
  conversationId,
  conversations,
  messages,
  streaming,
  loadingConversations,
  loadingMessages,
  convListError,
  inputText,
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
} = useChat()

const chatBodyRef = ref(null)
const inputRef = ref(null)

function scrollToBottom() {
  nextTick(() => {
    const el = chatBodyRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

watch(messages, scrollToBottom, { deep: true })

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

function autoResize() {
  const el = inputRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 160)}px`
}

function refreshAll() {
  fetchConversations()
  if (conversationId.value) fetchMessages()
}

watch(navCollapsed, (v) => localStorage.setItem(NAV_KEY, String(v)))
watch(convCollapsed, (v) => localStorage.setItem(CONV_KEY, String(v)))
</script>

<template>
  <div class="mn-app qa-app">
    <MnSidebar v-model:collapsed="navCollapsed" collapsible />

    <button
      v-if="navCollapsed"
      type="button"
      class="qa-edge-toggle qa-edge-toggle--nav"
      title="展开导航"
      @click="navCollapsed = false"
    >
      <el-icon><Menu /></el-icon>
    </button>

    <main class="qa-main-wrap">
      <div class="qa-layout">
        <aside class="qa-conv-sidebar" :class="{ 'qa-conv-sidebar--collapsed': convCollapsed }">
          <div class="qa-conv-inner">
          <div class="qa-conv-brand-row">
            <div class="qa-conv-brand mono">会话历史</div>
            <button
              type="button"
              class="qa-conv-collapse-btn"
              title="收起会话列表"
              @click="convCollapsed = true"
            >
              <el-icon><DArrowLeft /></el-icon>
            </button>
          </div>
          <div class="qa-conv-header">
            <el-button type="primary" plain class="qa-btn-new" @click="newChat">
              <el-icon><Plus /></el-icon>
              新对话
            </el-button>
            <el-button
              :loading="loadingConversations || loadingMessages"
              class="qa-btn-refresh"
              title="刷新"
              @click="refreshAll"
            >
              <el-icon><Refresh /></el-icon>
            </el-button>
          </div>

          <div v-if="convListError" class="qa-conv-empty">
            会话列表不可用<br />{{ convListError }}
          </div>
          <div v-else-if="!conversations.length" class="qa-conv-empty">
            暂无历史会话<br />发送第一条消息后自动创建
          </div>
          <div v-else class="qa-conv-list">
            <div
              v-for="conv in conversations"
              :key="conv.id"
              class="qa-conv-item"
              :class="{ active: conv.id === conversationId }"
              @click="!streaming && openConversation(conv.id)"
            >
              <span class="title">{{ conv.name || '新对话' }}</span>
              <button
                class="del"
                title="删除"
                @click.stop="removeConversation(conv.id)"
              >
                ×
              </button>
            </div>
          </div>

          <div class="qa-conv-footer mono">Dify Agent · RAG + KG</div>
          </div>
        </aside>

        <button
          v-if="convCollapsed"
          type="button"
          class="qa-edge-toggle qa-edge-toggle--conv"
          title="展开会话列表"
          @click="convCollapsed = false"
        >
          <el-icon><DArrowRight /></el-icon>
        </button>

        <section class="qa-chat-panel">
          <div class="qa-chat-toolbar">
            <button
              type="button"
              class="qa-toolbar-btn"
              :title="navCollapsed ? '展开导航' : '收起导航'"
              @click="navCollapsed = !navCollapsed"
            >
              <el-icon><Menu /></el-icon>
              <span>导航</span>
            </button>
            <button
              type="button"
              class="qa-toolbar-btn"
              :title="convCollapsed ? '展开会话' : '收起会话'"
              @click="convCollapsed = !convCollapsed"
            >
              <el-icon><DArrowRight v-if="convCollapsed" /><DArrowLeft v-else /></el-icon>
              <span>会话</span>
            </button>
          </div>
          <div class="qa-chat-body-wrap">
            <div v-if="loadingMessages" class="qa-loading">加载消息中…</div>
            <div ref="chatBodyRef" class="qa-chat-body">
              <div class="qa-chat-inner">
                <ChatWelcome v-if="showWelcome" @select="sendMessage" />
                <ChatMessageTurn
                  v-for="(msg, idx) in messages"
                  :key="`${msg.id || 'new'}-${idx}`"
                  :message="msg"
                  :index="idx"
                  :is-streaming="streaming && idx === messages.length - 1 && !msg.id"
                  @copy="copyAnswer(idx)"
                  @feedback="(rating) => submitFeedback(idx, rating)"
                  @regenerate="regenerate(idx)"
                  @toggle-reasoning="toggleReasoning(idx)"
                />
              </div>
            </div>

            <div class="qa-chat-footer">
              <div class="qa-input-wrap">
                <textarea
                  ref="inputRef"
                  v-model="inputText"
                  rows="1"
                  placeholder="输入问题，Enter 发送，Shift+Enter 换行…"
                  :disabled="streaming"
                  @keydown="handleKeydown"
                  @input="autoResize"
                />
                <button
                  class="qa-btn-send"
                  :disabled="streaming || !inputText.trim()"
                  title="发送"
                  @click="sendMessage()"
                >
                  <el-icon><Promotion /></el-icon>
                </button>
              </div>
              <p class="qa-input-hint">
                智能体可调用文献检索与知识图谱工具，回答材料科学相关问题
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.qa-app {
  position: relative;
}

.qa-main-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  background: var(--bg);
}

.qa-layout {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.qa-conv-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  transition: width 0.22s ease, opacity 0.22s ease;
  overflow: hidden;
}

.qa-conv-inner {
  width: 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.qa-conv-sidebar--collapsed {
  width: 0;
  opacity: 0;
  border-right: none;
  pointer-events: none;
}

.qa-conv-brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 12px 8px 16px;
  gap: 8px;
}

.qa-conv-collapse-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text-muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
}

.qa-conv-collapse-btn:hover {
  color: var(--primary);
  border-color: var(--primary);
  background: var(--surface-2);
}

.qa-edge-toggle {
  position: absolute;
  z-index: 20;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 48px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: all 0.15s;
}

.qa-edge-toggle:hover {
  color: var(--primary);
  border-color: var(--primary);
}

.qa-edge-toggle--nav {
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 0 8px 8px 0;
  border-left: none;
}

.qa-edge-toggle--conv {
  left: 0;
  top: calc(50% + 40px);
  transform: translateY(-50%);
  border-radius: 0 8px 8px 0;
  border-left: none;
}

.qa-chat-toolbar {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.qa-toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.qa-toolbar-btn:hover {
  color: var(--primary);
  border-color: var(--primary);
  background: var(--surface-2);
}

.qa-conv-brand {
  padding: 0;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}

.qa-conv-header {
  display: flex;
  gap: 8px;
  padding: 0 12px 10px;
}

.qa-btn-new {
  flex: 1;
}

.qa-btn-refresh {
  flex: 0 0 40px;
  padding: 8px;
}

.qa-conv-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 10px 12px;
}

.qa-conv-empty {
  padding: 20px 16px;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.7;
}

.qa-conv-item {
  padding: 10px 12px;
  margin-bottom: 2px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid transparent;
  transition: background 0.12s;
}

.qa-conv-item:hover {
  background: var(--surface-2);
}

.qa-conv-item.active {
  background: var(--surface-2);
  border-color: var(--primary);
}

.qa-conv-item .title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.qa-conv-item .del {
  opacity: 0;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0 2px;
}

.qa-conv-item:hover .del {
  opacity: 0.65;
}

.qa-conv-footer {
  padding: 12px 16px;
  font-size: 10px;
  color: var(--text-muted);
  border-top: 1px solid var(--border-soft);
}

.qa-chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg);
}

.qa-chat-body-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
}

.qa-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(248, 250, 252, 0.75);
  z-index: 5;
  font-size: 14px;
  color: var(--text-muted);
}

.qa-chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 0;
}

.qa-chat-inner {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 24px;
}

.qa-chat-footer {
  flex-shrink: 0;
  padding: 16px 24px 20px;
  background: var(--surface);
  border-top: 1px solid var(--border);
}

.qa-input-wrap {
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  gap: 10px;
  align-items: flex-end;
  padding: 10px 14px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.qa-input-wrap textarea {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-size: 14px;
  line-height: 1.5;
  max-height: 160px;
  color: var(--text);
}

.qa-btn-send {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: var(--primary);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;
}

.qa-btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qa-btn-send:not(:disabled):hover {
  background: var(--primary-hover);
}

.qa-input-hint {
  max-width: 820px;
  margin: 8px auto 0;
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
}
</style>
