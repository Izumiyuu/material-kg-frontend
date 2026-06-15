<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  widthClass: {
    type: String,
    default: 'mn-modal-card',
  },
})

defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="fade-panel">
      <div v-if="show" class="mn-modal-backdrop" @click.self="$emit('close')">
        <div :class="['mn-modal-card', widthClass]">
          <div class="mn-modal-header">
            <h3 class="mn-modal-title">{{ title }}</h3>
            <button class="icon-button" type="button" @click="$emit('close')">
              
            </button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mn-modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  z-index: 2000;
}

.mn-modal-card {
  width: min(720px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  padding: 32px;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.2);
}

.mn-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
}

.mn-modal-title {
  margin: 0;
  font-size: 1.75rem;
  color: #1e293b;
}
</style>
