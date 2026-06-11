import { dashboardHealthStatus, dashboardLogs, dashboardStats } from '@/mock/mn/dashboard'

export async function getDashboardSummary() {
  return Promise.resolve({
    stats: dashboardStats,
    healthStatus: dashboardHealthStatus,
    logs: dashboardLogs,
  })
}
