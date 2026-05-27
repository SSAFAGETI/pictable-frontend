import { apiRequest } from '../../shared/api/client'
import { mapDjangoRecipeListWithMedia, unwrapList } from '../recipe/mapper'

export const fetchFeedRecipesApi = async (params: { sort?: 'latest' | 'popular' | string; search?: string; tag?: string; tags?: string[] } = {}) => {
  const query = new URLSearchParams()
  if (params.sort) query.set('sort', params.sort)
  if (params.search) query.set('search', params.search)
  const firstTag = params.tag || params.tags?.find(Boolean)
  if (firstTag) query.set('tag', firstTag)
  const body = await apiRequest<unknown>(`/feeds/${query.toString() ? `?${query}` : ''}`)
  return mapDjangoRecipeListWithMedia(unwrapList(body))
}

