import { apiRequest } from '../../shared/api/client'
import { asString, isRecord, unwrapList } from '../recipe/mapper'

export const uploadMediaApi = (file: File, purpose: 'thumbnail' | 'steps' | 'ingredient' | string = 'thumbnail') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('purpose', purpose)

  return apiRequest<Record<string, unknown>>('/media/upload/', {
    method: 'POST',
    body: formData,
    auth: true,
  })
}

export const fetchTagsApi = async () => {
  const body = await apiRequest<unknown>('/feeds/tags/')
  return unwrapList(body)
    .map((tag) => (isRecord(tag) ? asString(tag.name) : asString(tag)))
    .filter(Boolean)
}

export const createTagApi = (name: string) =>
  apiRequest<{ id: number; name: string }>('/feeds/tags/', {
    method: 'POST',
    body: JSON.stringify({ name }),
    auth: true,
  })
