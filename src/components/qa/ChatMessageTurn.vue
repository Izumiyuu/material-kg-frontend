<script setup>
import { computed } from 'vue'
import { CopyDocument, RefreshRight, CircleCheck, CircleClose } from '@element-plus/icons-vue'

import ReasoningPanel from './ReasoningPanel.vue'
import { renderRichContent } from '@/utils/qaMarkdown'

const props = defineProps({
  message: { type: Object, required: true },
  index: { type: Number, required: true },
  isStreaming: { type: Boolean, default: false },
})

const emit = defineEmits(['copy', 'feedback', 'regenerate', 'toggle-reasoning'])

const hasReasoning = computed(
  () =>
    (props.message.reasoning && props.message.reasoning.length > 0) ||
    (props.isStreaming && props.message.status === 'thinking')
)

const showAnswerBubble = computed(
  () => !props.isStreaming || props.message.status === 'responding' || !!props.message.answer
)

const showActions = computed(() => props.message.id && !props.isStreaming)

const renderedAnswer = computed(() => renderRichContent(props.message.answer || ''))

const likeActive = computed(() => props.message.feedback?.rating === 'like')
const dislikeActive = computed(() => props.message.feedback?.rating === 'dislike')
</script>

<template>
  <div class="turn">
    <div class="msg-row user">
      <div class="avatar user">我</div>
      <div class="msg-content">
        <div class="bubble">{{ message.query }}</div>
      </div>
    </div>

    <div class="msg-row assist">
      <div class="avatar assist">AI</div>
      <div class="msg-content">
        <ReasoningPanel
          v-if="hasReasoning"
          :steps="message.reasoning || []"
          :expanded="message.reasoningExpanded !== false"
          :streaming="isStreaming"
          :thinking="message.status === 'thinking'"
          :tool-name="message.toolName"
          @toggle="emit('toggle-reasoning')"
        />

        <div v-if="showAnswerBubble" class="bubble">
          <div
            v-if="isStreaming && message.status === 'responding'"
            class="markdown streaming-plain"
          >
            {{ message.answer }}<span v-if="message.answer" class="stream-cursor" />
          </div>
          <div v-else class="markdown" v-html="renderedAnswer" />
        </div>

        <div v-if="showActions" class="msg-actions pinned">
          <button class="action-btn" title="复制" @click="emit('copy')">
            <el-icon><CopyDocument /></el-icon>
            复制
          </button>
          <button
            class="action-btn"
            :class="{ 'active-like': likeActive }"
            title="点赞"
            @click="emit('feedback', 'like')"
          >
            <el-icon><CircleCheck /></el-icon>
          </button>
          <button
            class="action-btn"
            :class="{ 'active-dislike': dislikeActive }"
            title="点踩"
            @click="emit('feedback', 'dislike')"
          >
            <el-icon><CircleClose /></el-icon>
          </button>
          <button class="action-btn" title="重新生成" @click="emit('regenerate')">
            <el-icon><RefreshRight /></el-icon>
            重新生成
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
