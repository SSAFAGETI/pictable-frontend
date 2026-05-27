import { apiRequest } from '../../shared/api/client'
import { getStoredTokens } from '../../shared/api/token'
import type { HomeSummaryResponse, RecipeCreatePayload, RecipeUpdatePayload } from '../../shared/api/types'
import { mapDjangoRecipeListWithMedia, mapDjangoRecipeWithMedia, unwrapDetail, unwrapList } from './mapper'

export const fetchHomeSummaryApi = async (): Promise<HomeSummaryResponse> => {
  const body = await apiRequest<Record<string, unknown>>('/home/summary/')
  const [recommended, popular, recent] = await Promise.all([
    body.recommended ? mapDjangoRecipeWithMedia(body.recommended) : Promise.resolve(null),
    mapDjangoRecipeListWithMedia(unwrapList(body.popular)),
    mapDjangoRecipeListWithMedia(unwrapList(body.recent)),
  ])

  return { recommended, popular, recent }
}

export const fetchFeedRecipesApi = async (params: { sort?: 'latest' | 'popular' | string; search?: string; tag?: string; tags?: string[] } = {}) => {
  const query = new URLSearchParams()
  if (params.sort) query.set('sort', params.sort)
  if (params.search) query.set('search', params.search)
  const firstTag = params.tag || params.tags?.find(Boolean)
  if (firstTag) query.set('tag', firstTag)
  const body = await apiRequest<unknown>(`/feeds/${query.toString() ? `?${query}` : ''}`)
  return mapDjangoRecipeListWithMedia(unwrapList(body))
}

export const fetchRecipesApi = async () => {
  const body = await apiRequest<unknown>('/recipes/')
  return mapDjangoRecipeListWithMedia(unwrapList(body))
}

export const fetchRecipeApi = async (id: string) => {
  const body = await apiRequest<unknown>(`/recipes/${id}/`, { auth: Boolean(getStoredTokens()) })
  return mapDjangoRecipeWithMedia(unwrapDetail(body))
}

export const createRecipeApi = async (payload: RecipeCreatePayload) => {
  const body = await apiRequest<unknown>('/recipes/', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: true,
  })
  return mapDjangoRecipeWithMedia(unwrapDetail(body))
}

export const updateRecipeApi = async (id: string, payload: RecipeUpdatePayload) => {
  const body = await apiRequest<unknown>(`/recipes/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    auth: true,
  })
  return mapDjangoRecipeWithMedia(unwrapDetail(body))
}

export const deleteRecipeApi = (id: string) =>
  apiRequest<null>(`/recipes/${id}/`, {
    method: 'DELETE',
    auth: true,
  })

export const toggleLikeApi = (id: string) =>
  apiRequest<{ liked?: boolean; like_count?: number }>(`/recipes/${id}/like/`, {
    method: 'POST',
    auth: true,
  })

export const toggleSaveApi = (id: string) =>
  apiRequest<{ saved?: boolean; save_count?: number }>(`/recipes/${id}/save/`, {
    method: 'POST',
    auth: true,
  })


export const fetchCommentsApi = async (recipeId: string) => unwrapList(await apiRequest<unknown>(`/recipes/${recipeId}/comments/`))

export const createCommentApi = (recipeId: string, content: string) =>
  apiRequest<Record<string, unknown>>(`/recipes/${recipeId}/comments/`, {
    method: 'POST',
    body: JSON.stringify({ content }),
    auth: true,
  })

export const createReplyApi = (recipeId: string, commentId: string, content: string) =>
  apiRequest<Record<string, unknown>>(`/recipes/${recipeId}/comments/${commentId}/replies/`, {
    method: 'POST',
    body: JSON.stringify({ content }),
    auth: true,
  })

export const updateCommentApi = (recipeId: string, commentId: string, content: string) =>
  apiRequest<Record<string, unknown>>(`/recipes/${recipeId}/comments/${commentId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
    auth: true,
  })

export const deleteCommentApi = (recipeId: string, commentId: string) =>
  apiRequest<null>(`/recipes/${recipeId}/comments/${commentId}/`, {
    method: 'DELETE',
    auth: true,
  })

