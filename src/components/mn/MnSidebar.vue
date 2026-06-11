<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import IconDashboard from './icons/IconDashboard.vue'
import IconLiterature from './icons/IconLiterature.vue'
import IconProject from './icons/IconProject.vue'
import IconTemplate from './icons/IconTemplate.vue'

const route = useRoute()

const menuItems = [
  { id: 'dashboard', name: '仪表盘', to: '/mn/manage', icon: IconDashboard },
  { id: 'literature', name: '文献管理', to: '/mn/literature', icon: IconLiterature },
  { id: 'template', name: '任务模板', to: '/mn/template', icon: IconTemplate },
  { id: 'project', name: '项目管理', to: '/mn/project', icon: IconProject },
]

const currentPath = computed(() => route.path)
</script>

<template>
  <aside class="sidebar">
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
          :class="{ 'is-active': currentPath === item.to }"
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
  </aside>
</template>
