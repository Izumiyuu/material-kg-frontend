<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import MnModal from '@/components/mn/MnModal.vue'
import MnSidebar from '@/components/mn/MnSidebar.vue'
import { useProjectStore } from '@/stores/mn/project'

const projectStore = useProjectStore()
const { availableDocs, availableTemplates, modals, projects } = storeToRefs(projectStore)

function buttonClass(type) {
  if (type === 'danger') {
    return 'industrial-btn industrial-btn-danger'
  }
  if (type === 'ghost') {
    return 'industrial-btn industrial-btn-ghost'
  }

  return 'industrial-btn industrial-btn-primary'
}

onMounted(() => {
  projectStore.fetchProjects()
})
</script>

<template>
  <div class="mn-app">
    <MnSidebar />

    <main class="mn-main">
      <header class="mn-header">
        <div>
          <p class="mn-header-title-kicker">Cooking,</p>
          <h1 class="mn-header-title-main">项目调度中心</h1>
        </div>

        <div class="mn-toolbar">
          <button class="industrial-btn industrial-btn-primary" @click="projectStore.openStartModal()">
            启动新项目
          </button>
        </div>
      </header>

      <section class="project-list">
        <article
          v-for="project in projects"
          :key="project.id"
          class="glass-card project-card"
          :class="{ 'is-archived': project.status === 'archived' }"
        >
          <div class="project-card-header">
            <div class="project-meta">
              <div class="project-icon" :class="project.iconMode">
                {{ project.shortId }}
              </div>
              <div>
                <h2 class="section-title" style="margin: 0">{{ project.name }}</h2>
                <p class="project-subtitle">
                  关联模板:
                  <span style="color: var(--primary)">{{ project.templateName }}</span>
                </p>
              </div>
            </div>

            <div class="project-actions">
              <button
                v-for="action in project.actions"
                :key="action.label"
                :class="buttonClass(action.type)"
              >
                {{ action.label }}
              </button>
            </div>
          </div>

          <div class="project-grid">
            <div>
              <p class="project-phase-label mono">{{ project.phaseText }}</p>
              <div class="progress-bar-bg">
                <div
                  class="progress-bar-fill"
                  :class="project.progressBarClass"
                  :style="{ width: `${project.progress}%` }"
                />
              </div>
              <div v-if="project.progressDetail" class="project-progress-meta">
                <span class="mono">{{ project.progressDetail }}</span>
                <span class="mono" style="color: var(--primary)">{{ project.progress }}% Overall</span>
              </div>
            </div>

            <div class="project-docs">
              <div class="doc-badges">
                <span v-for="index in Math.min(project.docsCount, 2)" :key="index" class="doc-badge">PDF</span>
                <span v-if="project.docsCount > 2" class="doc-badge more">+{{ project.docsCount - 2 }}</span>
              </div>
              <span class="small-text muted-text">
                {{ project.docsCount }} 篇文献{{ project.status === 'running' ? '执行中' : '已完成' }}
              </span>
            </div>

            <div class="status-slot">
              <span class="badge" :class="[project.statusBadgeClass, { 'is-running': project.status === 'running' }]">
                {{ project.statusText }}
              </span>
            </div>
          </div>

          <div v-if="project.logs && project.logs.length" class="log-terminal mono tiny-text">
            <div v-for="log in project.logs" :key="`${log.time}-${log.message}`" class="log-row">
              <span class="log-time">{{ log.time }}</span>
              <span class="log-type" :class="log.typeClass">{{ log.type }}</span>
              <span>{{ log.message }}</span>
            </div>
          </div>
        </article>
      </section>
    </main>

    <MnModal :show="modals.start" title="启动新任务项目" @close="projectStore.closeStartModal()">
      <div class="modal-stack">
        <div class="field-group">
          <label class="field-label">项目名称</label>
          <input type="text" placeholder="输入项目名称..." class="industrial-input full" />
        </div>

        <div class="modal-grid">
          <div class="field-group">
            <label class="field-label">选择任务模板</label>
            <select class="industrial-input full">
              <option v-for="template in availableTemplates" :key="template">{{ template }}</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">执行优先级</label>
            <select class="industrial-input full">
              <option>普通 (Normal)</option>
              <option>紧急 (High)</option>
            </select>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">选择待处理文献 (批量)</label>
          <div class="checklist">
            <label v-for="doc in availableDocs" :key="doc.id" class="check-item">
              <input type="checkbox" :checked="doc.selected">
              <span>{{ doc.name }}</span>
            </label>
          </div>
          <p class="tiny-text muted-text">* 仅展示已通过审计的文献</p>
        </div>

        <button class="industrial-btn industrial-btn-primary industrial-btn-block">立即启动项目流水线</button>
      </div>
    </MnModal>
  </div>
</template>
