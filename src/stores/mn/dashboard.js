import { defineStore } from 'pinia'

import { getDashboardSummary } from '@/services/mn/dashboardService'

export const useDashboardStore = defineStore('mn-dashboard', {
  state: () => ({
    stats: [],
    healthStatus: [],
    logs: [],
    loaded: false,
  }),
  actions: {
    async fetchDashboard() {
      if (this.loaded) {
        return
      }

      const data = await getDashboardSummary()
      this.stats = data.stats
      this.healthStatus = data.healthStatus
      this.logs = data.logs
      this.loaded = true
    },
  },
})
