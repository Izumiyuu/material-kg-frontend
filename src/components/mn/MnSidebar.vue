<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import IconChat from './icons/IconChat.vue'
import IconDashboard from './icons/IconDashboard.vue'
import IconLiterature from './icons/IconLiterature.vue'
import IconProject from './icons/IconProject.vue'
import IconTemplate from './icons/IconTemplate.vue'

defineProps({
  collapsible: { type: Boolean, default: false },
  collapsed: { type: Boolean, default: false },
})

const route = useRoute()

const menuItems = [
  { id: 'dashboard', name: '仪表盘', to: '/mn/manage', icon: IconDashboard },
  { id: 'literature', name: '文献管理', to: '/mn/literature', icon: IconLiterature },
  { id: 'template', name: '任务模板', to: '/mn/template', icon: IconTemplate },
  { id: 'project', name: '项目管理', to: '/mn/project', icon: IconProject },
  { id: 'qa', name: '智能问答', to: '/qa/chat', icon: IconChat },
]

const currentPath = computed(() => route.path)

function isActive(item) {
  if (item.id === 'qa') return currentPath.value.startsWith('/qa')
  return currentPath.value === item.to
}
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': collapsible && collapsed }">
    <div class="sidebar-inner">
    <div class="sidebar-top">
      <div class="brand">
        <div class="brand-mark">
          <IconProject class="nav-icon" />
        </div>
        <div>
          <h1 class="brand-title">MANAGE</h1>
          <p class="brand-subtitle mono">Material KG Center</p>
        </div>
      </div>

      <nav class="nav-list">
        <router-link
          v-for="item in menuItems"
          :key="item.id"
          :to="item.to"
          class="nav-item"
          :class="{ 'is-active': isActive(item) }"
        >
          <component :is="item.icon" class="nav-icon" />
          <span>{{ item.name }}</span>
        </router-link>
      </nav>
    </div>

    <div class="sidebar-bottom">
      <a href="/" class="back-link mono">
        <span>←</span>
        <span>返回主系统</span>
      </a>
    </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  transition: width 0.22s ease, opacity 0.22s ease;
  overflow: hidden;
}

.sidebar-inner {
  width: 256px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.sidebar-top {
  flex: 1;
}

.sidebar--collapsed {
  width: 0 !important;
  opacity: 0;
  border-right: none;
  pointer-events: none;
}
</style>
