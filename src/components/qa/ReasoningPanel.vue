<script setup>
import { computed } from 'vue'

import {
  getToolLabel,
  humanizeObservation,
  humanizeThought,
  humanizeToolInput,
} from '@/utils/qaReasoning'

const props = defineProps({
  steps: { type: Array, default: () => [] },
  expanded: { type: Boolean, default: false },
  streaming: { type: Boolean, default: false },
  thinking: { type: Boolean, default: false },
  toolName: { type: String, default: null },
})

const emit = defineEmits(['toggle'])

const renderedSteps = computed(() =>
  props.steps
    .map((step) => {
      const thought = humanizeThought(step.thought)
      const params = humanizeToolInput(step.toolInput)
      const obs = humanizeObservation(step.observation, step.tool)
      return { id: step.id, thought, tool: step.tool, params, obs }
    })
    .filter((step) => step.thought || step.tool || step.params || step.obs)
)

const label = computed(() => {
  if (props.thinking) {
    return props.toolName
      ? `正在调用 ${getToolLabel(props.toolName)}…`
      : '深度思考中…'
  }
  const count = renderedSteps.value.length || props.steps.length || 1
  return `已深度思考（${count} 步）`
})
</script>

<template>
  <div
    class="reasoning-panel"
    :class="{ expanded, streaming: thinking }"
  >
    <button type="button" class="reasoning-toggle" @click="emit('toggle')">
      <span class="rt-icon">{{ thinking ? '⏳' : '💭' }}</span>
      <span class="rt-label">{{ label }}</span>
      <span class="rt-chevron">▼</span>
    </button>
    <div class="reasoning-body">
      <template v-if="renderedSteps.length">
        <div v-for="(step, i) in renderedSteps" :key="step.id || i" class="reasoning-step">
          <div v-if="step.thought" class="rs-thought">{{ step.thought }}</div>
          <div v-if="step.tool" class="rs-tool">🔧 {{ getToolLabel(step.tool) }}</div>
          <div v-if="step.params" class="rs-param">{{ step.params }}</div>
          <template v-if="step.obs">
            <div v-if="step.obs.summary" class="rs-result-label">{{ step.obs.summary }}</div>
            <div v-if="step.obs.preview" class="rs-obs">
              {{ step.obs.preview }}{{ step.obs.preview.length >= 600 ? '…' : '' }}
            </div>
          </template>
        </div>
      </template>
      <div v-else-if="thinking" class="reasoning-step">
        <div class="rs-thought">正在分析您的问题…</div>
      </div>
    </div>
  </div>
</template>
