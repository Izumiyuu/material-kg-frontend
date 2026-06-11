export const dashboardStats = [
  { label: '文献总量', value: '1,284', badgeText: '42 待审计', badgeClass: 'badge-audit-pending' },
  { label: '任务模板', value: '8', badgeText: '3 预置', badgeClass: 'badge-completed' },
  { label: '活跃项目', value: '4', badgeText: '运行中', badgeClass: 'badge-pending' },
  { label: '知识入库', value: '12.5k', badgeText: '+1.2k Weekly', badgeClass: 'badge-completed' },
]

export const dashboardHealthStatus = [
  { name: 'Parse Queue (RabbitMQ)', status: 'Healthy', progress: 20 },
  { name: 'KG Builder Worker', status: 'Active', progress: 45 },
]

export const dashboardLogs = [
  { time: '13:05:22', type: 'INFO', typeClass: 'info', message: 'IntegrationService: Polling Part 2 status for doc_9921...' },
  { time: '13:05:25', type: 'SUCCESS', typeClass: 'success', message: 'Part 2: Parsing completed for doc_9921.' },
  { time: '13:05:26', type: 'TASK', typeClass: 'task', message: 'Project: P1 auto-triggering KG Build stage.' },
  { time: '13:06:01', type: 'INFO', typeClass: 'info', message: 'Audit: New literature uploaded: "Graphene Synthesis.pdf"' },
]
