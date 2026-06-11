import { defineStore } from 'pinia'

import { getProjectList } from '@/services/mn/projectService'

export const useProjectStore = defineStore('mn-project', {
  state: () => ({
    projects: [],
    availableTemplates: [],
    availableDocs: [],
    modals: {
      start: false,
    },
    loaded: false,
  }),
  actions: {
    async fetchProjects() {
      if (this.loaded) {
        return
      }

      const data = await getProjectList()
      this.projects = data.projects
      this.availableTemplates = data.availableTemplates
      this.availableDocs = data.availableDocs
      this.loaded = true
    },
    openStartModal() {
      this.modals.start = true
    },
    closeStartModal() {
      this.modals.start = false
    },
  },
})
