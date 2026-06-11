import { literatureDocs } from '@/mock/mn/literature'

export async function getLiteratureList() {
  return Promise.resolve(literatureDocs)
}
