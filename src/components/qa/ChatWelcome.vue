<script setup>
import { SUGGESTIONS } from '@/composables/useChat'

defineProps({
  suggestions: { type: Array, default: () => SUGGESTIONS },
})

const emit = defineEmits(['select'])
</script>

<template>
  <div class="welcome">
    <div class="welcome-icon">🔬</div>
    <h2>材料文献智能问答</h2>
    <p>基于 Dify 智能体 · 文献 RAG · 知识图谱，分析材料科学问题</p>
    <div class="suggestions">
      <button
        v-for="item in suggestions"
        :key="item"
        class="suggestion"
        @click="emit('select', item)"
      >
        {{ item }}
      </button>
    </div>
  </div>
</template>
