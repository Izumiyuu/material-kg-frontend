import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000
})

// ==================== 模板管理 ====================
export const getTemplates = () => api.get('/kg/templates')
export const getTemplate = (id) => api.get(`/kg/templates/${id}`)
export const createTemplate = (data) => api.post('/kg/templates', data)
export const updateTemplate = (id, data) => api.put(`/kg/templates/${id}`, data)
export const deleteTemplate = (id) => api.delete(`/kg/templates/${id}`)

// ==================== 构建任务 ====================
export const buildKG = (data) => api.post('/kg/build', data)
export const batchBuildKG = (data) => api.post('/kg/batch-build', data)
export const getTaskStatus = (taskId) => api.get(`/kg/build/task/${taskId}`)
export const getBatchStatus = (batchId) => api.get(`/kg/batch-build/${batchId}/status`)

// ==================== 图谱查询 ====================
export const queryGraph = (params) => api.post('/kg/query', params)
export const getEntityNeighbors = (entityName, depth = 2, limit = 100) =>
  api.get(`/kg/entity/${encodeURIComponent(entityName)}/neighbors`, { params: { depth, limit } })

// ==================== 三元组检索 ====================
export const searchTriples = (params) => api.get('/kg/triples/search', { params })
export const getDocTriples = (docId, limit = 500) => api.get(`/kg/triples/doc/${docId}`, { params: { limit } })

// ==================== 统计 ====================
export const getStats = () => api.get('/kg/stats')

// ==================== 删除 ====================
export const deleteDocGraph = (docId) => api.delete(`/kg/doc/${docId}`)

// ==================== SSE 进度 ====================
export function getBuildProgressStream(taskId) {
  const url = `${api.defaults.baseURL}/kg/build/progress/${taskId}`
  return new EventSource(url)
}