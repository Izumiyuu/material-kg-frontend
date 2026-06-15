import { defineStore } from 'pinia'
import { 
  getProjectList, 
  getProjectProgress, 
  getTaskLogs 
} from '@/services/mn/projectService'

export const useProjectStore = defineStore('mn-project', {
  state: () => ({
    projects: [],
    availableTemplates: [],
    availableDocs: [],
    modals: {
      start: false,
    },
    loaded: false,
    loading: false,
    currentProjectProgress: null,
    currentTaskLogs: [],
  }),
  actions: {
    async fetchProjects(force = false) {
      if (this.loaded && !force) return
      this.loading = true
      try {
        const data = await getProjectList()
        this.projects = data.projects
        this.availableTemplates = data.availableTemplates
        this.availableDocs = data.availableDocs
        this.loaded = true
      } finally {
        this.loading = false
      }
    },
    async fetchProjectProgress(projectId) {
      this.currentProjectProgress = await getProjectProgress(projectId)
      // 同步更新列表中的进度
      const project = this.projects.find(p => p.id === projectId)
      if (project && this.currentProjectProgress) {
        project.progress = this.currentProjectProgress.progressPercent
        project.status = this.currentProjectProgress.status
        project.statusText = this.currentProjectProgress.statusText
        project.statusBadgeClass = this.currentProjectProgress.statusBadgeClass
        project.iconMode = this.currentProjectProgress.iconMode
        project.progressBarClass = this.currentProjectProgress.progressBarClass
        project.phaseText = this.currentProjectProgress.phaseText
        project.progressDetail = this.currentProjectProgress.progressDetail
        project.docsCount = this.currentProjectProgress.docsCount || project.docsCount
        project.latestTaskInstanceId = this.currentProjectProgress.latestTaskInstanceId || project.latestTaskInstanceId
        project.taskInstances = this.currentProjectProgress.taskInstances || project.taskInstances
      }
    },
    async fetchTaskLogs(projectId, taskInstanceId) {
      this.currentTaskLogs = await getTaskLogs(projectId, taskInstanceId)
    },
    resetTaskLogs() {
      this.currentTaskLogs = []
    },
    openStartModal() {
      this.modals.start = true
    },
    closeStartModal() {
      this.modals.start = false
    },
  },
})
