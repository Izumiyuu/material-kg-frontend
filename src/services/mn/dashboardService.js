import { request } from '@/utils/request'

export async function getDashboardSummary() {
  // 并行请求三个接口
  const [summary, health, logs] = await Promise.all([
    request('/api/manage/dashboard/summary'),
    request('/api/manage/dashboard/health'),
    request('/api/manage/dashboard/logs'),
  ])

  // 映射后端数据到前端期望的格式，避免破坏现有 UI 和 Store
  return {
    //   "literature_total": 19,
    //   "audit_pending": 19,
    //   "template_count": 1,
    //   "project_total": 0,
    //   "running_projects": 0,
    //   "kg_stats": {
    //     "total_entities": 6068,
    //     "total_relations": 8065,
    //     "doc_count": 19
    //   }
    stats: [
      {
        label: '项目总量',
        value: summary?.project_count || 0,
        badgeText: `${summary?.running_projects || 0} 运行中`,
        badgeClass: 'badge-audit-pending',
      },
      {
        label: '文献总量',
        value: summary?.document_count || 0,
        badgeText: `${summary?.audit_pending || 0} 待处理`,
        badgeClass: 'badge-completed',
      },
      {
        label: '实体总量',
        value: summary?.kg_stats?.total_entities || 0,
        badgeText: `从 ${summary?.kg_stats?.doc_count || 0} 篇提取`,
        badgeClass: 'badge-completed',
      },
      {
        label: '关系总量',
        value: summary?.kg_stats?.total_relations || 0,
        badgeText: `从 ${summary?.kg_stats?.doc_count || 0} 篇提取`,
        badgeClass: 'badge-completed',
      },
    ],
    healthStatus: (health || []).map((h) => ({
      name: h.name,
      status: h.status,
      progress: h.status === 'healthy' || h.status === 'reachable' ? 100 : 0,
      detail: h.detail || '',
    })),
    logs: (logs?.items || []).map((l) => ({
      time: l.time,
      type: l.type,
      typeClass: (l.type || 'info').toLowerCase(),
      message: l.message,
    })),
  }
}
