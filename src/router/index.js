import { createRouter, createWebHistory } from 'vue-router'

import LiteratureView from '@/views/mn/LiteratureView.vue'
import ManageView from '@/views/mn/ManageView.vue'
import ProjectView from '@/views/mn/ProjectView.vue'
import TemplateView from '@/views/mn/TemplateView.vue'

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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
