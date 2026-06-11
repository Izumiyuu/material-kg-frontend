import { defineStore } from 'pinia'

import { getTemplateList } from '@/services/mn/templateService'

export const useTemplateStore = defineStore('mn-template', {
  state: () => ({
    templates: [],
    modals: {
      create: false,
    },
    showEditor: false,
    editingTpl: null,
    loaded: false,
  }),
  actions: {
    async fetchTemplates() {
      if (this.loaded) {
        return
      }

      this.templates = await getTemplateList()
      this.loaded = true
    },
    openCreateModal() {
      this.modals.create = true
    },
    closeCreateModal() {
      this.modals.create = false
    },
    editTemplate(template) {
      this.editingTpl = { ...template }
      this.showEditor = true
    },
    closeEditor() {
      this.showEditor = false
    },
  },
})
