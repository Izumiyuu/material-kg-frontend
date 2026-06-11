import { createRouter, createWebHistory } from 'vue-router'

import LiteratureView from '@/views/mn/LiteratureView.vue'
import ManageView from '@/views/mn/ManageView.vue'
import ProjectView from '@/views/mn/ProjectView.vue'
import TemplateView from '@/views/mn/TemplateView.vue'

// 知识图谱模块页面
import GraphViewer from '@/views/kg/GraphViewer.vue'
import TaskManager from '@/views/kg/TaskManager.vue'
import KGTemplateManager from '@/views/kg/TemplateManager.vue'
import TripleSearch from '@/views/kg/TripleSearch.vue'
import Statistics from '@/views/kg/Statistics.vue'

const routes = [
  {
    path: '/',
    redirect: '/mn/manage',
  },
  {
    path: '/mn/manage',
    name: 'mn-manage',
    component: ManageView,
  },
  {
    path: '/mn/literature',
    name: 'mn-literature',
    component: LiteratureView,
  },
  {
    path: '/mn/template',
    name: 'mn-template',
    component: TemplateView,
  },
  {
    path: '/mn/project',
    name: 'mn-project',
    component: ProjectView,
  },
    // 知识图谱模块（路径前缀 /kg）
  {
    path: '/kg/graph',
    name: 'kg-graph',
    component: GraphViewer,
    meta: { title: '图谱可视化' }
  },
  {
    path: '/kg/tasks',
    name: 'kg-tasks',
    component: TaskManager,
    meta: { title: '构建任务' }
  },
  {
    path: '/kg/templates',
    name: 'kg-templates',
    component: KGTemplateManager,
    meta: { title: '模板管理' }
  },
  {
    path: '/kg/triples',
    name: 'kg-triples',
    component: TripleSearch,
    meta: { title: '三元组检索' }
  },
  {
    path: '/kg/stats',
    name: 'kg-stats',
    component: Statistics,
    meta: { title: '统计信息' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
