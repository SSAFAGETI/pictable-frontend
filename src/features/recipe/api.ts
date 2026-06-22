import { apiRequest } from '../../shared/api/client'
import { getStoredTokens } from '../../shared/api/token'
import type { HomeSummaryResponse, RecipeCreatePayload, RecipeUpdatePayload } from '../../shared/api/types'
import type { RecipeRecommendation } from './types'
import { asArray, asNumber, asString, isRecord, mapDjangoRecipeListWithMedia, mapDjangoRecipeWithMedia, unwrapDetail, unwrapList } from './mapper'

export const fetchHomeSummaryApi = async (): Promise<HomeSummaryResponse> => {
  const body = await apiRequest<Record<string, unknown>>('/home/summary/')
  const [recommended, popular, recent] = await Promise.all([
    body.recommended ? mapDjangoRecipeWithMedia(body.recommended) : Promise.resolve(null),
    mapDjangoRecipeListWithMedia(unwrapList(body.popular)),
    mapDjangoRecipeListWithMedia(unwrapList(body.recent)),
  ])

  return { recommended, popular, recent }
}

export const fetchRecipesApi = async () => {
  const body = await apiRequest<unknown>('/recipes/')
  return mapDjangoRecipeListWithMedia(unwrapList(body))
}

const normalizeRecommendationItem = (raw: unknown, inputIngredients: string[]) => {
  const record = isRecord(raw) ? raw : {}
  const missingIngredients = asArray(record.missing_ingredients || record.missingIngredients)
    .map((item) => asString(item).trim())
    .filter(Boolean)
  const missingSet = new Set(missingIngredients.map((item) => item.replace(/\s+/g, '').toLowerCase()))
  const matchedIngredients = inputIngredients.filter((item) => !missingSet.has(item.replace(/\s+/g, '').toLowerCase()))

  return {
    ...record,
    id: record.id || record.recipe_id,
    thumbnail_media: record.thumbnail_media || record.thumbnail_media_id,
    like_count: record.like_count,
    match_rate: asNumber(record.match_rate || record.matchRate, 0),
    missing_ingredients: missingIngredients,
    missing_count: asNumber(record.missing_count || record.missingCount, missingIngredients.length),
    matched_ingredients: matchedIngredients,
  }
}

const mapRecommendationItem = async (raw: unknown, inputIngredients: string[]): Promise<RecipeRecommendation> => {
  const normalized = normalizeRecommendationItem(raw, inputIngredients)
  const recipe = await mapDjangoRecipeWithMedia(normalized)
  const record = normalized as Record<string, unknown>
  const missingIngredients = asArray(record.missing_ingredients)
    .map((item) => asString(item).trim())
    .filter(Boolean)
  const matchedIngredients = asArray(record.matched_ingredients)
    .map((item) => asString(item).trim())
    .filter(Boolean)

  return {
    ...recipe,
    matchRate: asNumber(record.match_rate, 0),
    matchedIngredients,
    missingIngredients,
  }
}

export const fetchRecipeRecommendationsApi = async (ingredients: string[]) => {
  const normalizedIngredients = Array.from(new Set(ingredients.map((item) => item.trim()).filter(Boolean)))
  const query = new URLSearchParams()
  query.set('ingredients', normalizedIngredients.join(','))

  const body = await apiRequest<unknown>(`/recipes/recommendations/?${query}`, {
    auth: true,
  })
  const record = isRecord(body) ? body : {}
  const canMake = await Promise.all(asArray(record.can_make || record.canMake).map((item) => mapRecommendationItem(item, normalizedIngredients)))
  const almost = await Promise.all(asArray(record.almost).map((item) => mapRecommendationItem(item, normalizedIngredients)))

  return {
    inputIngredients: asArray(record.input_ingredients || record.inputIngredients)
      .map((item) => asString(item).trim())
      .filter(Boolean),
    canMake,
    almost,
  }
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
