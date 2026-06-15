import { request } from '@/utils/request'

/**
 * 获取模板列表
 */
export async function getTemplateList() {
  const res = await request('/api/manage/templates/')
  return (res || []).map((t) => mapTemplateResponse(t))
}

/**
 * 获取模板详情
 */
export async function getTemplateDetail(templateId) {
  const t = await request(`/api/manage/templates/${templateId}`)
  return mapTemplateResponse(t)
}

/**
 * 创建模板
 */
export async function createTemplate(data) {
  return request('/api/manage/templates/', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      template_type: data.template_type || 'relation_extraction',
      description: data.description || '',
      config: data.config || {
        entity_types: (data.entities || []).map((name) => ({ name, examples: [] })),
        relation_types: [],
      },
      prompt_content: data.prompt_content || '',
      applicable_doc_type: data.applicable_doc_type || '',
      output_format: data.output_format || 'JSON',
      is_preset: data.is_preset || false,
      creator: data.creator || '',
    }),
  })
}

/**
 * 更新模板
 */
export async function updateTemplate(templateId, data) {
  return request(`/api/manage/templates/${templateId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * 克隆模板
 */
export async function cloneTemplate(templateId, newName) {
  return request(`/api/manage/templates/${templateId}/clone?new_name=${encodeURIComponent(newName)}`, {
    method: 'POST',
  })
}

/**
 * 导出模板
 */
export async function exportTemplate(templateId) {
  return request(`/api/manage/templates/${templateId}/export`)
}

/**
 * 导入模板
 */
export async function importTemplate(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request('/api/manage/templates/import', {
    method: 'POST',
    body: formData,
  })
}

/**
 * 后端响应对象到前端模型映射
 */
function mapTemplateResponse(t) {
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    template_type: t.template_type,
    statusText: t.is_preset ? '预置' : '自定义',
    statusClass: t.is_preset ? 'badge-completed' : 'badge-audit-approved',
    entities: (t.config?.entity_types || []).map((e) => (typeof e === 'string' ? e : e.name)),
    config: t.config || {},
    configJson: JSON.stringify(t.config || {}, null, 2),
    prompt_content: t.prompt_content,
    applicable_doc_type: t.applicable_doc_type,
    output_format: t.output_format,
    is_preset: t.is_preset,
    creator: t.creator,
    created_at: t.created_at,
  }
}
