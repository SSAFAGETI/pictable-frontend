import { apiRequest } from '../../shared/api/client'
import { RECIPE_PAGE_SIZE } from '../feed/api'
import { mapDjangoRecipeListWithMedia, mapUserProfile, unwrapCursorPagination, unwrapList } from '../recipe/mapper'

export interface UserRecipePageParams {
  cursor?: string | null
  pageSize?: number
}

const recipePageQuery = (params: UserRecipePageParams = {}) => {
  const pageSize = params.pageSize || RECIPE_PAGE_SIZE
  const query = new URLSearchParams()
  if (params.cursor) query.set('cursor', params.cursor)
  query.set('page_size', String(pageSize))
  return { query, pageSize }
}

const fetchUserRecipePage = async (path: string, params: UserRecipePageParams = {}) => {
  const { query, pageSize } = recipePageQuery(params)
  const body = await apiRequest<unknown>(`${path}${query.toString() ? `?${query}` : ''}`, { auth: true })
  const pagination = unwrapCursorPagination(body)
  const pageItems = pagination.isPaginated ? pagination.items : pagination.items.slice(0, pageSize)
  const items = await mapDjangoRecipeListWithMedia(pageItems)
  const hasNext = pagination.isPaginated ? Boolean(pagination.nextCursor) : false
  return { items, hasNext, nextCursor: pagination.nextCursor }
}

export const fetchMeApi = () =>
  apiRequest<Record<string, unknown>>('/users/me/', {
    method: 'GET',
    auth: true,
  })

export const updateMeApi = (body: Record<string, unknown>) =>
  apiRequest<Record<string, unknown>>('/users/me/', {
    method: 'PATCH',
    body: JSON.stringify(body),
    auth: true,
  })

export const fetchSavedRecipesPageApi = (params: UserRecipePageParams = {}) => fetchUserRecipePage('/users/me/saved-recipes/', params)

export const fetchLikedRecipesPageApi = (params: UserRecipePageParams = {}) => fetchUserRecipePage('/users/me/liked-recipes/', params)

export const fetchMyRecipesPageApi = (params: UserRecipePageParams = {}) => fetchUserRecipePage('/users/me/recipes/', params)

export const fetchSavedRecipesApi = async (params: UserRecipePageParams = {}) => (await fetchSavedRecipesPageApi(params)).items

export const fetchLikedRecipesApi = async (params: UserRecipePageParams = {}) => (await fetchLikedRecipesPageApi(params)).items

export const fetchMyRecipesApi = async (params: UserRecipePageParams = {}) => (await fetchMyRecipesPageApi(params)).items

export const toggleSubscribeApi = (id: string) =>
  apiRequest<Record<string, unknown>>(`/users/${id}/subscribe/`, {
    method: 'POST',
    auth: true,
  })

export const subscribeUserApi = toggleSubscribeApi

export const unsubscribeUserApi = toggleSubscribeApi

export const fetchSubscriptionsApi = async () => unwrapList(await apiRequest<unknown>('/users/me/subscriptions/', { auth: true })).map(mapUserProfile)

export const fetchSubscribersApi = async () => unwrapList(await apiRequest<unknown>('/users/me/subscribers/', { auth: true })).map(mapUserProfile)