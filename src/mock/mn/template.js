export const templates = [
  {
    id: 1,
    name: '材料专家抽取 V2',
    statusText: '预置',
    statusClass: 'badge-completed',
    description: '专为材料科学论文设计的抽取模板，针对烧结工艺、材料性质、化学成分进行了深度优化。',
    entities: ['材料', '性质', '工艺', '参数'],
    parseScope: ['文本', '表格', '公式'],
    configJson: JSON.stringify({
      entity_types: ['材料', '性质', '工艺', '参数'],
      relation_types: ['具有性质', '制备工艺', '属于'],
      llm_config: { temperature: 0.1, max_tokens: 4096, model: 'deepseek-chat' },
      parse_scope: ['text', 'table', 'formula'],
    }, null, 2),
  },
  {
    id: 2,
    name: '快速摘要模板',
    statusText: '草稿',
    statusClass: 'badge-pending',
    description: '仅提取核心摘要与结论，适用于大规模文献初步筛选与分类场景。',
    entities: ['研究领域', '核心结论'],
    parseScope: [],
    configJson: JSON.stringify({
      entity_types: ['研究领域', '核心结论'],
      llm_config: { temperature: 0.5, max_tokens: 1024 },
    }, null, 2),
  },
]
