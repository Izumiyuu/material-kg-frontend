<script setup>
import { onMounted, onUnmounted, ref, reactive } from 'vue'
import { storeToRefs } from 'pinia'

import MnModal from '@/components/mn/MnModal.vue'
import MnSidebar from '@/components/mn/MnSidebar.vue'
import AddTaskModal from '@/components/mn/AddTaskModal.vue'
import { useProjectStore } from '@/stores/mn/project'
import { createProject, startProject, stopProject, addTaskToProject } from '@/services/mn/projectService'

const projectStore = useProjectStore()
const { availableDocs, availableTemplates, modals, projects, currentProjectProgress, currentTaskLogs } = storeToRefs(projectStore)

const showAddTask = ref(false)
const showLogModal = ref(false)
const targetProjectId = ref(null)
const activeLogProjectId = ref('')
const selectedTaskInstanceId = ref('')
const logModalLoading = ref(false)
const logModalError = ref('')

const newProject = reactive({
  name: '',
  description: '',
  template_id: null,
  document_ids: []
})

const selectedProjectId = ref(null)
const pollTimer = ref(null)

function toggleDoc(docId) {
  const index = newProject.document_ids.indexOf(docId)
  if (index > -1) {
    newProject.document_ids.splice(index, 1)
  } else {
    newProject.document_ids.push(docId)
  }
}

async function handleCreateProject() {
  if (!newProject.name) {
    alert('请填写项目名称')
    return
  }
  try {
    // 即使 document_ids 为空也可以创建项目
    await createProject({
      name: newProject.name,
      description: newProject.description,
      document_ids: newProject.document_ids || []
    })
    projectStore.closeStartModal()
    await projectStore.fetchProjects(true)
    // 重置表单
    newProject.name = ''
    newProject.description = ''
    newProject.document_ids = []
  } catch (e) {
    alert('创建失败: ' + e.message)
  }
}

function openCreateModal() {
  projectStore.fetchProjects(true)
  projectStore.openStartModal()
}

async function handleStartProject(id) {
  try {
    await startProject(id)
    await projectStore.fetchProjects(true)
    startPolling(id)
  } catch (e) {
    alert('启动失败: ' + e.message)
  }
}

async function handleStopProject(id) {
  try {
    await stopProject(id)
    await projectStore.fetchProjects(true)
    stopPolling()
  } catch (e) {
    alert('停止失败: ' + e.message)
  }
}

async function openAddTask(projectId) {
  targetProjectId.value = projectId
  await projectStore.fetchProjects(true)
  showAddTask.value = true
}

function closeAddTaskModal() {
  showAddTask.value = false
  targetProjectId.value = null
}

async function handleAddTask(taskData) {
  try {
    const projectId = targetProjectId.value
    await addTaskToProject(projectId, taskData)
    closeAddTaskModal()
    alert('任务已成功添加并触发')
    await projectStore.fetchProjects(true)
    startPolling(projectId)
  } catch (e) {
    alert('添加任务失败: ' + e.message)
  }
}

async function openLogModal(project) {
  activeLogProjectId.value = String(project.id)
  selectedTaskInstanceId.value = ''
  logModalError.value = ''
  showLogModal.value = true
  logModalLoading.value = true
  projectStore.resetTaskLogs()

  try {
    await projectStore.fetchProjectProgress(project.id)

    const taskInstances = currentProjectProgress.value?.taskInstances || project.taskInstances || []
    selectedTaskInstanceId.value =
      currentProjectProgress.value?.latestTaskInstanceId
      || project.latestTaskInstanceId
      || taskInstances[0]?.id
      || ''

    if (!selectedTaskInstanceId.value) {
      logModalError.value = '当前项目暂无可查看的任务实例日志'
      return
    }

    await projectStore.fetchTaskLogs(project.id, selectedTaskInstanceId.value)
  } catch (e) {
    logModalError.value = e.message || '加载日志失败'
  } finally {
    logModalLoading.value = false
  }
}

async function handleTaskInstanceChange() {
  if (!activeLogProjectId.value || !selectedTaskInstanceId.value) {
    return
  }

  logModalLoading.value = true
  logModalError.value = ''

  try {
    await projectStore.fetchTaskLogs(activeLogProjectId.value, selectedTaskInstanceId.value)
  } catch (e) {
    logModalError.value = e.message || '加载日志失败'
  } finally {
    logModalLoading.value = false
  }
}

function closeLogModal() {
  showLogModal.value = false
  activeLogProjectId.value = ''
  selectedTaskInstanceId.value = ''
  logModalError.value = ''
  logModalLoading.value = false
  projectStore.resetTaskLogs()
}

async function startPolling(projectId) {
  stopPolling()
  selectedProjectId.value = projectId

  try {
    await projectStore.fetchProjectProgress(projectId)
  } catch (e) {
    console.error('获取项目进度失败:', e)
  }

  pollTimer.value = setInterval(async () => {
    await projectStore.fetchProjectProgress(projectId)
    // 如果已完成或停止，则停止轮询
    if (currentProjectProgress.value?.status === 'completed' || currentProjectProgress.value?.status === 'stopped' || currentProjectProgress.value?.status === 'failed') {
      stopPolling()
    }
  }, 3000)
}

function stopPolling() {
  if (pollTimer.value) {
    clearInterval(pollTimer.value)
    pollTimer.value = null
  }
}

onMounted(() => {
  projectStore.fetchProjects()
})

onUnmounted(() => {
  stopPolling()
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
          <button class="industrial-btn industrial-btn-primary" @click="openCreateModal">
            创建新项目
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
                v-if="project.status === 'queued' || project.status === 'stopped' || project.status === 'failed'"
                class="industrial-btn industrial-btn-primary"
                @click="handleStartProject(project.id)"
              >
                启动
              </button>
              <button
                v-if="project.status === 'running'"
                class="industrial-btn industrial-btn-danger"
                @click="handleStopProject(project.id)"
              >
                停止
              </button>
              <button
                v-if="project.status !== 'archived'"
                class="industrial-btn industrial-btn-primary"
                @click="openAddTask(project.id)"
              >
                添加手动任务
              </button>
              <button
                class="industrial-btn industrial-btn-ghost"
                @click="openLogModal(project)"
              >
                查看日志
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
                {{ project.docsCount }} 篇关联文献
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

    <MnModal :show="modals.start" title="创建项目" @close="projectStore.closeStartModal()">
      <div class="modal-stack">
        <div class="field-group">
          <label class="field-label">项目名称</label>
          <input v-model="newProject.name" type="text" placeholder="输入项目名称..." class="industrial-input full" />
        </div>

        <div class="field-group">
          <label class="field-label">项目描述</label>
          <textarea v-model="newProject.description" placeholder="输入项目描述..." class="industrial-input full" rows="3"></textarea>
        </div>

        <div class="field-group">
          <label class="field-label">选择待处理文献 (批量 - 可选)</label>
          <div class="checklist">
            <label v-for="doc in availableDocs" :key="doc.id" class="check-item">
              <input type="checkbox" :value="doc.id" :checked="newProject.document_ids.includes(doc.id)" @change="toggleDoc(doc.id)">
              <span>{{ doc.title }}</span>
            </label>
            <div v-if="!availableDocs || availableDocs.length === 0" class="muted-text tiny-text" style="padding: 10px;">
              暂无可用文献，可稍后在项目详情中添加任务。
            </div>
          </div>
          <p class="tiny-text muted-text">* 仅展示系统内已有的文献</p>
        </div>

        <button class="industrial-btn industrial-btn-primary industrial-btn-block" @click="handleCreateProject">立即创建项目</button>
      </div>
    </MnModal>
    <AddTaskModal 
      :show="showAddTask" 
      :project-id="targetProjectId"
      :available-docs="availableDocs"
      :available-templates="availableTemplates"
      @close="closeAddTaskModal"
      @submit="handleAddTask"
    />
    <MnModal :show="showLogModal" title="日志详情弹窗" width-class="log-modal-card" @close="closeLogModal">
      <div class="modal-stack">
        <div class="detail-grid">
          <div>
            <p class="field-label">项目 ID</p>
            <p class="mono">{{ activeLogProjectId || '-' }}</p>
          </div>
          <div>
            <p class="field-label">当前状态</p>
            <p>{{ currentProjectProgress?.statusText || '-' }}</p>
          </div>
        </div>

        <div class="field-group" v-if="currentProjectProgress?.taskInstances?.length">
          <label class="field-label">任务实例</label>
          <select v-model="selectedTaskInstanceId" class="industrial-input full" @change="handleTaskInstanceChange">
            <option v-for="instance in currentProjectProgress.taskInstances" :key="instance.id" :value="instance.id">
              {{ instance.stepName }} / {{ instance.id }} / {{ instance.status }}
            </option>
          </select>
        </div>

        <div class="log-terminal project-log-modal mono tiny-text">
          <div v-if="logModalLoading" class="log-row">
            <span class="log-type info">INFO</span>
            <span>正在加载日志...</span>
          </div>
          <div v-else-if="logModalError" class="log-row">
            <span class="log-type failed">ERROR</span>
            <span>{{ logModalError }}</span>
          </div>
          <div v-else-if="!currentTaskLogs.length" class="log-row">
            <span class="log-type info">INFO</span>
            <span>当前任务实例暂无日志输出</span>
          </div>
          <template v-else>
            <div v-for="log in currentTaskLogs" :key="log.id" class="log-row">
              <span class="log-time">{{ log.time || '--:--:--' }}</span>
              <span class="log-type" :class="String(log.level || 'log').toLowerCase()">{{ log.level }}</span>
              <span>{{ log.message }}</span>
            </div>
          </template>
        </div>
      </div>
    </MnModal>
  </div>
</template>

<style scoped>
.log-modal-card {
  width: min(960px, 100%);
}

.project-log-modal {
  min-height: 360px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 20px;
  border-radius: 12px;
  background: #020617;
  color: #e2e8f0;
}
</style>
