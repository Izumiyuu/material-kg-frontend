import { defineStore } from 'pinia'

import { getLiteratureList } from '@/services/mn/literatureService'

export const useLiteratureStore = defineStore('mn-literature', {
  state: () => ({
    searchQuery: '',
    statusFilter: 'all',
    literature: [],
    showDetail: false,
    selectedDoc: null,
    modals: {
      batchImport: false,
      upload: false,
    },
    uploading: false,
    uploadPercent: 0,
    uploadStatus: '正在上传...',
    loaded: false,
  }),
  getters: {
    filteredLiterature(state) {
      return state.literature.filter((doc) => {
        const query = state.searchQuery.trim().toLowerCase()
        const matchesSearch = !query
          || doc.name.toLowerCase().includes(query)
          || doc.author.toLowerCase().includes(query)
        const matchesStatus = state.statusFilter === 'all' || doc.status === state.statusFilter
        return matchesSearch && matchesStatus
      })
    },
  },
  actions: {
    async fetchLiterature() {
      if (this.loaded) {
        return
      }

      this.literature = await getLiteratureList()
      this.loaded = true
    },
    openDetail(doc) {
      this.selectedDoc = doc
      this.showDetail = true
    },
    closeDetail() {
      this.showDetail = false
    },
    openModal(name) {
      this.modals[name] = true
    },
    closeModal(name) {
      this.modals[name] = false
    },
    startMockUpload() {
      this.uploading = true
      this.uploadPercent = 100
      this.uploadStatus = '上传成功！正在解压并自动提取元数据...'
    },
    finishMockUpload() {
      this.uploading = false
      this.uploadPercent = 0
      this.closeModal('batchImport')
    },
  },
})
