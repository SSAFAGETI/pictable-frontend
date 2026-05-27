import { apiRequest } from '../../shared/api/client'
import { mapDjangoRecipeListWithMedia, mapUserProfile, unwrapList } from '../recipe/mapper'

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

export const fetchSavedRecipesApi = async () => mapDjangoRecipeListWithMedia(unwrapList(await apiRequest<unknown>('/users/me/saved-recipes/', { auth: true })))

export const fetchLikedRecipesApi = async () => mapDjangoRecipeListWithMedia(unwrapList(await apiRequest<unknown>('/users/me/liked-recipes/', { auth: true })))

export const fetchMyRecipesApi = async () => mapDjangoRecipeListWithMedia(unwrapList(await apiRequest<unknown>('/users/me/recipes/', { auth: true })))

export const toggleSubscribeApi = (id: string) =>
  apiRequest<Record<string, unknown>>(`/users/${id}/subscribe/`, {
    method: 'POST',
    auth: true,
  })

export const subscribeUserApi = toggleSubscribeApi

export const unsubscribeUserApi = toggleSubscribeApi

export const fetchSubscriptionsApi = async () => unwrapList(await apiRequest<unknown>('/users/me/subscriptions/', { auth: true })).map(mapUserProfile)

export const fetchSubscribersApi = async () => unwrapList(await apiRequest<unknown>('/users/me/subscribers/', { auth: true })).map(mapUserProfile)

