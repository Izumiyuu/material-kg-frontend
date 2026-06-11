export const projects = [
  {
    id: 1,
    shortId: 'P1',
    name: '氧化铝陶瓷烧结工艺分析项目',
    templateName: '材料专家抽取 V2',
    status: 'running',
    statusText: '正在处理数据...',
    statusBadgeClass: 'badge-audit-pending',
    iconMode: 'running',
    phaseText: '当前阶段: 知识抽取 (Step 2/2)',
    progress: 75,
    progressBarClass: '',
    progressDetail: '文献解析已完成 (12/12)',
    docsCount: 12,
    actions: [
      { label: '查看详细日志', type: 'ghost' },
      { label: '终止项目', type: 'danger' },
    ],
    logs: [
      { time: '14:22:10', type: 'INFO', typeClass: 'info', message: "[Integration] Triggering Part 3: KG Build for doc_9921 using template '材料专家抽取 V2'..." },
    ],
  },
  {
    id: 2,
    shortId: 'P2',
    name: '压电陶瓷综述分析',
    templateName: '快速摘要模板',
    status: 'archived',
    statusText: '执行成功',
    statusBadgeClass: 'badge-completed',
    iconMode: 'success',
    phaseText: '项目状态: 已归档',
    progress: 100,
    progressBarClass: 'success',
    progressDetail: '全部步骤执行完成',
    docsCount: 4,
    actions: [
      { label: '下载分析报告', type: 'ghost' },
      { label: '再次运行', type: 'ghost' },
    ],
    logs: [],
  },
]

export const availableTemplates = ['材料专家抽取 V2 (推荐)', '快速摘要模板', '工艺参数提取']

export const availableDocs = [
  { id: 1, name: 'Sintering of Alumina Ceramics.pdf', selected: true },
  { id: 2, name: 'Piezoelectric properties of PZT.pdf', selected: true },
  { id: 3, name: 'Graphene Synthesis Review.pdf', selected: false },
]
