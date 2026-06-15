import { defineStore } from 'pinia'

import { getLiteratureList, getLiteratureDetail, approveLiterature, rejectLiterature } from '@/services/mn/literatureService'

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
    async fetchLiterature(force = false) {
      if (this.loaded && !force) {
        return
      }

      const items = await getLiteratureList()
      this.literature = items
      this.loaded = true
    },

    async fetchLiteratureDetail(document_id) {

      const detail = await getLiteratureDetail(document_id)
      return detail
    },
    openDetail(doc) {
      this.selectedDoc = doc

      this.showDetail = true
      this.fetchLiteratureDetail(doc.id).then((detail) => {
        this.selectedDoc.detail = detail
      }).catch((err) => {
        console.error('获取文献详情失败:', err)
      })
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
    async approveLiterature(documentId) {
      await approveLiterature(documentId)
      // 找到对应文献并更新状态为已通过
      const doc = this.literature.find(item => item.id === documentId)
      if (doc) {
        doc.status = 'approved'
        doc.statusText = '已通过'
        doc.statusClass = 'badge-completed'
      }
      this.showDetail = false

    },
    async rejectLiterature(documentId) {
      await rejectLiterature(documentId)
      // 找到对应文献并更新状态为已驳回
      const doc = this.literature.find(item => item.id === documentId)
      if (doc) {
        doc.status = 'rejected'
        doc.statusText = '已驳回'
        doc.statusClass = 'badge-audit-rejected'
      }
      this.showDetail = false

    },
  },
})
