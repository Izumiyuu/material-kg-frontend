import { request } from '@/utils/request'
import { getLiteratureList } from './literatureService'
import { getTemplateList } from './templateService'

/**
 * 获取项目列表及关联数据
 */
export async function getProjectList() {
  // 并行获取项目、可用文献、可用模板
  const [res, docs, templates] = await Promise.all([
    request('/api/manage/projects/'),
    getLiteratureList().catch(() => []),
    getTemplateList().catch(() => []),
  ])

  // 映射项目数据
  const projects = (res || []).map((p) => mapProjectResponse(p))

  // 映射新建项目表单所需的可用模板和文献
  const availableTemplates = templates
    .map((t) => ({
      id: t.id,
      name: t.name
    }))

  const availableDocs = docs
    .filter(t => t.status === "approved")
    .map((d) => ({
      id: d.id,
      name: d.title,
      selected: false,
      is_parse: d.is_parse,
      is_extract: d.is_extract,
    }))

  return {
    projects,
    availableTemplates,
    availableDocs,
  }
}

/**
 * 创建项目
 */
export async function createProject(data) {
  return request('/api/manage/projects/', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      description: data.description || '',
      document_ids: data.document_ids || [],
    }),
  })
}

/**
 * 手动添加任务
 */
export async function addTaskToProject(projectId, data) {
  return request(`/api/manage/projects/${projectId}/tasks`, {
    method: 'POST',
    body: JSON.stringify({
      step_name: data.step_name,
      document_ids: data.document_ids,
      template_id: data.template_id
    }),
  })
}

/**
 * 获取项目统计概览
 */
export async function getProjectStatistics() {
  return request('/api/manage/projects/statistics')
}

/**
 * 启动项目
 */
export async function startProject(projectId) {
  return request(`/api/manage/projects/${projectId}/start`, {
    method: 'POST',
  })
}

/**
 * 停止项目
 */
export async function stopProject(projectId) {
  return request(`/api/manage/projects/${projectId}/stop`, {
    method: 'POST',
  })
}

/**
 * 获取项目进度详情
 */
export async function getProjectProgress(projectId) {
  const res = await request(`/api/manage/projects/${projectId}/progress`)
  return mapProjectProgressResponse(res)
}

/**
 * 获取详细任务流水日志
 */
export async function getTaskLogs(projectId, taskInstanceId) {
  const res = await request(`/api/manage/projects/${projectId}/tasks/${taskInstanceId}/logs`)
  return normalizeTaskLogs(res)
}

/**
 * 后端项目响应映射
 */
function mapProjectResponse(p) {
  const state = getProjectStatusMeta(p.status)
  const docs = Array.isArray(p.document_ids) ? p.document_ids : []
  const taskInstances = normalizeTaskInstances(p)

  return {
    id: p.id,
    shortId: p.id.toString().substring(0, 4).toUpperCase(),
    name: p.name,
    status: p.status,
    statusText: state.text,
    statusBadgeClass: state.badge,
    iconMode: state.icon,
    phaseText: `项目状态: ${state.text}`,
    progress: normalizeProgress(p.progress),
    progressBarClass: state.progress,
    progressDetail: p.progress_detail || p.current_step || '',
    templateName: p.template_name || p.templateName || '未指定模板',
    docsCount: p.document_count ?? p.docsCount ?? docs.length,
    created_at: p.created_at,
    updated_at: p.updated_at,
    latestTaskInstanceId: p.latest_task_instance_id || p.latestTaskInstanceId || taskInstances[0]?.id || '',
    taskInstances,
    actions: [{ label: '查看详情', type: 'ghost' }],
    logs: [],
  }
}

function mapProjectProgressResponse(progress) {
  const state = getProjectStatusMeta(progress?.status)
  const taskInstances = normalizeTaskInstances(progress)

  return {
    ...progress,
    progressPercent: normalizeProgress(progress?.progress),
    statusText: state.text,
    statusBadgeClass: state.badge,
    iconMode: state.icon,
    progressBarClass: state.progress,
    phaseText: progress?.current_step
      ? `当前阶段: ${progress.current_step}`
      : `项目状态: ${state.text}`,
    progressDetail: progress?.detail || progress?.progress_detail || progress?.message || '',
    docsCount: progress?.document_count ?? progress?.docsCount ?? 0,
    taskInstances,
    latestTaskInstanceId:
      progress?.latest_task_instance_id
      || progress?.latestTaskInstanceId
      || taskInstances[0]?.id
      || '',
  }
}

function getProjectStatusMeta(status) {
  const statusMap = {
    queued: { text: '等待中', badge: 'badge-pending', icon: 'pending', progress: '' },
    running: { text: '运行中', badge: 'badge-audit-pending', icon: 'running', progress: '' },
    completed: { text: '已完成', badge: 'badge-completed', icon: 'success', progress: 'success' },
    failed: { text: '失败', badge: 'badge-failed', icon: 'failed', progress: 'failed' },
    stopped: { text: '已停止', badge: 'badge-failed', icon: 'failed', progress: 'failed' },
    archived: { text: '已归档', badge: 'badge-completed', icon: 'success', progress: 'success' },
  }

  return statusMap[status] || { text: status || '未知', badge: 'badge-pending', icon: 'pending', progress: '' }
}

function normalizeProgress(value) {
  const numericValue = Number(value || 0)

  if (numericValue > 1) {
    return Math.max(0, Math.min(100, Math.floor(numericValue)))
  }

  return Math.max(0, Math.min(100, Math.floor(numericValue * 100)))
}

function normalizeTaskInstances(source) {
  const candidates = source?.task_instances || source?.taskInstances || source?.tasks || source?.items || []

  if (!Array.isArray(candidates)) {
    return []
  }

  return candidates
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null
      }

      const id = item.task_instance_id || item.instance_id || item.id || item.task_id

      if (!id) {
        return null
      }

      return {
        id: String(id),
        stepName: item.step_name || item.stepName || item.name || `任务 ${index + 1}`,
        status: item.status || 'unknown',
        createdAt: item.created_at || item.createdAt || '',
      }
    })
    .filter(Boolean)
}

function normalizeTaskLogs(source) {
  const candidates = Array.isArray(source) ? source : source?.items || source?.logs || []

  if (!Array.isArray(candidates)) {
    return []
  }

  return candidates.map((item, index) => {
    if (typeof item === 'string') {
      return {
        id: `${index}-${item}`,
        time: '',
        level: 'LOG',
        message: item,
      }
    }

    return {
      id: item.id || item.log_id || `${index}-${item.time || item.message || item.detail || 'log'}`,
      time: item.time || item.timestamp || item.created_at || '',
      level: item.level || item.type || item.status || 'LOG',
      message: item.message || item.detail || JSON.stringify(item),
    }
  })
}
