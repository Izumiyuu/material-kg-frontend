<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import MnSidebar from '@/components/mn/MnSidebar.vue'
import { useDashboardStore } from '@/stores/mn/dashboard'

const dashboardStore = useDashboardStore()
const { stats, healthStatus, logs } = storeToRefs(dashboardStore)

onMounted(() => {
  dashboardStore.fetchDashboard()
})
</script>

<template>
  <div class="mn-app">
    <MnSidebar />

    <main class="mn-main">
      <header class="mn-header">
        <div>
          <p class="mn-header-title-kicker">Control Center,</p>
          <h1 class="mn-header-title-main">业务管理仪表盘</h1>
        </div>
      </header>

      <section class="stats-grid">
        <article v-for="stat in stats" :key="stat.label" class="glass-card stats-card">
          <p class="stats-label mono">{{ stat.label }}</p>
          <p class="stats-value">{{ stat.value }}</p>
          <div class="stats-meta">
            <span class="badge" :class="stat.badgeClass">{{ stat.badgeText }}</span>
          </div>
        </article>
      </section>

      <section class="overview-grid">
        <article class="glass-card stats-card">
          <h2 class="section-title">系统调度状态</h2>
          <div class="log-list">
            <div v-for="health in healthStatus" :key="health.name">
              <div class="upload-progress-meta">
                <span class="mono small-text">{{ health.name }}</span>
                <span class="small-text" style="color: var(--success)">{{ health.status }}</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" :style="{ width: `${health.progress}%` }" />
              </div>
            </div>
          </div>
        </article>

        <article class="glass-card stats-card">
          <h2 class="section-title">实时流水日志</h2>
          <div class="log-terminal mono tiny-text">
            <div v-for="log in logs" :key="`${log.time}-${log.message}`" class="log-row">
              <span class="log-time">[{{ log.time }}]</span>
              <span class="log-type" :class="log.typeClass">{{ log.type }}</span>
              <span>{{ log.message }}</span>
            </div>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>
