import { defineStore } from 'pinia'
import { 
  getTemplateList, 
  cloneTemplate, 
  exportTemplate, 
  importTemplate 
} from '@/services/mn/templateService'

export const useTemplateStore = defineStore('mn-template', {
  state: () => ({
    templates: [],
    modals: {
      create: false,
    },
    showEditor: false,
    editingTpl: null,
    loaded: false,
    loading: false
  }),
  actions: {
    async fetchTemplates(force = false) {
      if (this.loaded && !force) return
      this.loading = true
      try {
        this.templates = await getTemplateList()
        this.loaded = true
      } finally {
        this.loading = false
      }
    },
    async cloneTemplate(id, newName) {
      await cloneTemplate(id, newName)
      await this.fetchTemplates(true)
    },
    async exportTemplate(id) {
      const data = await exportTemplate(id)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `template_${id}.json`
      a.click()
      URL.revokeObjectURL(url)
    },
    async importTemplate(file) {
      await importTemplate(file)
      await this.fetchTemplates(true)
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
