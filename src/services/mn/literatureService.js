import { request } from '@/utils/request'

export async function getLiteratureList(params = {}) {
  const query = new URLSearchParams(params).toString()
  const res = await request(`/api/manage/literature/list${query ? '?' + query : ''}`)

  const items = res.items || []
  return items.map((item) => {
    let statusClass = 'badge-pending'
    let statusText = '待处理'

    if (item.audit_status === 'pending') {
      statusClass = 'badge-audit-pending'
      statusText = '待审核'
    } else if (item.audit_status === 'approved') {
      statusClass = 'badge-completed'
      statusText = '已通过'
    } else if (item.audit_status === 'rejected') {
      statusClass = 'badge-failed'
      statusText = '已驳回'
    }

    return {
      id: item.document_id,
      name: item.name,
      title: item.title,
      author: item.authors,
      uploadTime: item.upload_time,
      status: item.audit_status,
      parseStatus: item.parse_status,
      is_parse: item.is_parse,
      is_extract: item.is_extract,
      statusText,
      statusClass,
    }
  })
}

export async function uploadLiterature(file, materialType = '陶瓷') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('material_type', materialType)

  return request('/api/manage/literature/upload', {
    method: 'POST',
    body: formData,
  })
}

export async function uploadLiteratureZip(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request('/api/manage/literature/upload-zip', {
    method: 'POST',
    body: formData,
  })
}

export async function auditLiterature(documentId, status, comment = '') {
  const query = new URLSearchParams({ status, comment }).toString()
  return request(`/api/manage/literature/${documentId}/audit?${query}`, {
    method: 'POST',
  })
}

export async function getLiteratureDetail(document_id) {
  // /api/parse/status/{document_id}
  return request(`/api/parse/status/${document_id}`, {
    method: 'GET',
  })
}
export function approveLiterature(documentId) {
  return auditLiterature(documentId, 'approved')
}
export function rejectLiterature(documentId) {

  return auditLiterature(documentId, 'rejected')
}