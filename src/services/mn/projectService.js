import { availableDocs, availableTemplates, projects } from '@/mock/mn/project'

export async function getProjectList() {
  return Promise.resolve({
    projects,
    availableTemplates,
    availableDocs,
  })
}
