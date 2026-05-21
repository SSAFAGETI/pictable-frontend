import type { Difficulty, Ingredient, Recipe } from './data'
import { clearServerError, getServerErrorId, reportServerError } from './serverStatus'

const DEFAULT_API_BASE_URL = '/api'

export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '')
const BACKEND_ORIGIN = 'http://15.164.170.144:8000'
const TOKEN_STORAGE_KEY = 'chalkkak_tokens'
export const fallbackImage = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&h=800&fit=crop'

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginResponse extends AuthTokens {
  message?: string
  email?: string
  nickname?: string
  name?: string
}

export interface SignupResponse {
  message?: string
  email?: string
  nickname?: string
}

export interface GoogleAuthResponse extends AuthTokens {
  created?: boolean
  email?: string
  nickname?: string
  name?: string
}

export interface RecipeCreatePayload {
  title: string
  description: string
  cook_time: number
  servings: number
  is_public: boolean
  tag_ids?: number[]
  ingredients: Array<{ name: string; amount?: string }>
  steps: Array<{ order: number; description: string; image?: string }>
}

export type RecipeUpdatePayload = Partial<RecipeCreatePayload>

export interface HomeSummaryResponse {
  recommended: Recipe | null
  popular: Recipe[]
  recent: Recipe[]
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

type ApiRequestOptions = RequestInit & {
  auth?: boolean
}

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage)

export const getStoredTokens = (): AuthTokens | null => {
  if (!canUseStorage()) return null

  try {
    const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as Partial<AuthTokens>
    if (!parsed.access || !parsed.refresh) return null
    return { access: parsed.access, refresh: parsed.refresh }
  } catch {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    return null
  }
}

export const setStoredTokens = (tokens: AuthTokens) => {
  if (!canUseStorage()) return
  window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens))
}

export const clearStoredTokens = () => {
  if (!canUseStorage()) return
  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, message: string, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
const asString = (value: unknown, fallback = '') => (typeof value === 'string' ? value : value == null ? fallback : String(value))
const asNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

const parseResponseBody = async (response: Response) => {
  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

const apiUrl = (path: string) => {
  if (/^https?:\/\//.test(path)) return path
  return `${API_BASE_URL}/${path.replace(/^\/+/, '')}`
}

const mediaUrlCache = new Map<string, string>()
const mediaUrlRequests = new Map<string, Promise<string>>()

const getMediaId = (value: unknown): string => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return String(value)
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) return value.trim()
  if (isRecord(value)) return getMediaId(value.id || value.pk || value.media_id)
  return ''
}

const cachedMediaUrlFromId = (value: unknown) => {
  const id = getMediaId(value)
  return id ? mediaUrlCache.get(id) || '' : ''
}

const resolveMediaUrl = async (value: unknown): Promise<string> => {
  const directUrl = normalizeMediaUrl(value)
  if (directUrl) return directUrl

  const id = getMediaId(value)
  if (!id) return ''

  const cached = mediaUrlCache.get(id)
  if (cached) return cached

  const pending = mediaUrlRequests.get(id)
  if (pending) return pending

  const request = apiRequest<Record<string, unknown>>(`/media/${id}/`)
    .then((media) => {
      const url = normalizeMediaUrl(media.url || media.file || media.image || media.src)
      if (url) mediaUrlCache.set(id, url)
      return url
    })
    .catch(() => '')
    .finally(() => {
      mediaUrlRequests.delete(id)
    })

  mediaUrlRequests.set(id, request)
  return request
}

const getErrorMessage = (body: unknown, fallback: string) => {
  if (typeof body === 'string') return body
  if (!isRecord(body)) return fallback

  const detail = body.detail || body.message || body.error || body.non_field_errors
  if (Array.isArray(detail)) return detail.join('\n')
  if (typeof detail === 'string') return detail

  const firstEntry = Object.entries(body)[0]
  if (firstEntry) {
    const [field, value] = firstEntry
    if (Array.isArray(value)) return `${field}: ${value.join('\n')}`
    if (typeof value === 'string') return `${field}: ${value}`
  }

  return fallback
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}, retryOnUnauthorized = true): Promise<T> {
  const tokens = getStoredTokens()
  const headers = new Headers(options.headers)
  const method = String(options.method || 'GET').toUpperCase()
  const endpoint = apiUrl(path)
  const errorId = getServerErrorId({ method, endpoint, title: path })

  if (options.auth && !tokens?.access) {
    if (tokens?.refresh && retryOnUnauthorized) {
      try {
        const refreshed = await refreshApi(tokens.refresh)
        setStoredTokens(refreshed)
        return apiRequest<T>(path, options, false)
      } catch {
        clearStoredTokens()
      }
    }

    throw new ApiError(401, '로그인이 필요합니다.', null)
  }

  if (!(options.body instanceof FormData) && options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.auth && tokens?.access && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${tokens.access}`)
  }

  let response: Response

  try {
    response = await fetch(endpoint, { ...options, headers })
  } catch (error) {
    reportServerError({
      id: errorId,
      title: '서버 API 연결 실패',
      message: '서버가 응답하지 않아 임시 데이터로 화면을 표시하고 있습니다.',
      detail: error instanceof Error ? error.message : String(error),
      endpoint,
      method,
    })
    throw error
  }

  const body = await parseResponseBody(response)

  if (response.status === 401 && options.auth && retryOnUnauthorized && tokens?.refresh) {
    try {
      const refreshed = await refreshApi(tokens.refresh)
      setStoredTokens(refreshed)
      return apiRequest<T>(path, options, false)
    } catch {
      clearStoredTokens()
    }
  }

  if (!response.ok) {
    if (response.status >= 500) {
      reportServerError({
        id: errorId,
        title: '서버 응답 오류',
        message: '서버에서 요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.',
        detail: getErrorMessage(body, `API 요청에 실패했습니다. (${response.status})`),
        endpoint,
        method,
        status: response.status,
      })
    }
    throw new ApiError(response.status, getErrorMessage(body, `API 요청에 실패했습니다. (${response.status})`), body)
  }

  clearServerError(errorId)
  return body as T
}

const unwrapList = (body: unknown): unknown[] => {
  if (Array.isArray(body)) return body
  if (!isRecord(body)) return []
  if (Array.isArray(body.results)) return body.results
  if (Array.isArray(body.data)) return body.data
  if (Array.isArray(body.items)) return body.items
  return []
}

const unwrapDetail = (body: unknown) => (isRecord(body) && body.data ? body.data : body)

export const normalizeMediaUrl = (value: unknown) => {
  const cachedMediaUrl = cachedMediaUrlFromId(value)
  if (cachedMediaUrl) return cachedMediaUrl

  const rawUrl = typeof value === 'string' ? value : isRecord(value) ? asString(value.url || value.file || value.thumbnail || value.src || value.image_url) : ''
  const url = rawUrl.trim()
  if (!url || getMediaId(url)) return ''
  if (/^(data|blob):/.test(url)) return url

  try {
    const parsed = new URL(url)
    if (parsed.origin === BACKEND_ORIGIN && parsed.pathname.startsWith('/media/')) {
      return `${parsed.pathname}${parsed.search}`
    }
    return url
  } catch {
    // Relative Django media paths must stay root-relative so Vite/Vercel can proxy them.
  }

  if (url.startsWith('/media/')) return url
  if (url.startsWith('media/')) return `/${url}`
  return url
}

const getMediaUrl = normalizeMediaUrl

const getRecipeImageSource = (record: Record<string, unknown>) =>
  record.thumbnail_media || record.thumbnail || record.image || record.main_image

const getStepImageSource = (step: unknown) => (isRecord(step) ? step.image || step.image_url || step.media : '')

const getSortedStepRecords = (value: unknown) =>
  asArray(value)
    .slice()
    .sort((a, b) => {
      const orderA = isRecord(a) ? asNumber(a.order, 0) : 0
      const orderB = isRecord(b) ? asNumber(b.order, 0) : 0
      return orderA - orderB
    })

const getAuthorName = (value: unknown) => {
  if (typeof value === 'string') return value
  if (!isRecord(value)) return '찰칵밥상'
  return asString(value.nickname || value.name || value.email || value.username, '찰칵밥상')
}

const getTags = (value: unknown) =>
  asArray(value)
    .map((tag) => (isRecord(tag) ? asString(tag.name || tag.title || tag.label) : asString(tag)))
    .filter(Boolean)

const getIngredients = (value: unknown, title: string): Ingredient[] => {
  const ingredients = asArray(value)
    .map((item, index): Ingredient | null => {
      if (typeof item === 'string') return { id: `${title}-ingredient-${index}`, name: item, amount: '' }
      if (!isRecord(item)) return null
      return {
        id: asString(item.id, `${title}-ingredient-${index}`),
        name: asString(item.name || item.title),
        amount: asString(item.amount || item.quantity || item.unit),
      }
    })
    .filter((item): item is Ingredient => Boolean(item?.name))

  return ingredients.length ? ingredients : [{ id: `${title}-ingredient`, name: '재료', amount: '적당량' }]
}

const getSteps = (value: unknown) => {
  const steps = getSortedStepRecords(value)

  const descriptions = steps
    .map((step) => (isRecord(step) ? asString(step.description || step.text || step.content) : asString(step)))
    .filter(Boolean)

  const images = steps.map((step) => getMediaUrl(getStepImageSource(step))).filter(Boolean)

  return {
    descriptions: descriptions.length ? descriptions : ['맛있게 조리해주세요.'],
    images,
  }
}

const normalizeDifficulty = (value: unknown): Difficulty => {
  if (value === 'medium' || value === 'hard' || value === 'easy') return value
  return 'easy'
}

export const mapDjangoRecipe = (raw: unknown): Recipe => {
  const record = isRecord(raw) ? raw : {}
  const title = asString(record.title || record.name, '이름 없는 레시피')
  const steps = getSteps(record.steps)
  const image = getMediaUrl(getRecipeImageSource(record)) || steps.images[0] || fallbackImage

  return {
    id: asString(record.id || record.pk || record.uuid, `recipe-${Date.now()}`),
    title,
    description: asString(record.description || record.summary, '맛있는 레시피입니다.'),
    image,
    cookTime: asNumber(record.cook_time || record.cookTime || record.time, 10),
    difficulty: normalizeDifficulty(record.difficulty),
    servings: asNumber(record.servings || record.serving, 1),
    ingredients: getIngredients(record.ingredients, title),
    steps: steps.descriptions,
    stepImages: steps.images,
    likes: asNumber(record.like_count || record.likes, 0),
    saves: asNumber(record.save_count || record.saves, 0),
    comments: asNumber(record.comment_count || record.comments, 0),
    isLiked: Boolean(record.is_liked || record.liked),
    isSaved: Boolean(record.is_saved || record.saved),
    tags: getTags(record.tags),
    author: getAuthorName(record.author),
    createdAt: asString(record.created_at || record.createdAt, new Date().toISOString()),
  }
}

const mapDjangoRecipeWithMedia = async (raw: unknown): Promise<Recipe> => {
  const record = isRecord(raw) ? raw : {}
  const recipe = mapDjangoRecipe(raw)
  const stepRecords = getSortedStepRecords(record.steps)
  const [mainImage, stepImages] = await Promise.all([
    resolveMediaUrl(getRecipeImageSource(record)),
    Promise.all(stepRecords.map((step) => resolveMediaUrl(getStepImageSource(step)))),
  ])
  const resolvedStepImages = stepImages.filter(Boolean)

  return {
    ...recipe,
    image: mainImage || resolvedStepImages[0] || recipe.image,
    stepImages: resolvedStepImages.length ? resolvedStepImages : recipe.stepImages,
  }
}

const mapDjangoRecipeListWithMedia = (items: unknown[]) => Promise.all(items.map(mapDjangoRecipeWithMedia))
const mapUserProfile = (raw: unknown, index = 0): UserProfile => {
  const record = isRecord(raw) ? raw : {}
  const email = asString(record.email || record.username, '')
  const name = asString(record.nickname || record.name || email.split('@')[0], '사용자')

  return {
    id: asString(record.id || record.pk || record.uuid, `user-${index}`),
    name,
    email,
    avatar: getMediaUrl(record.avatar || record.profile_image_url || record.profile_image || record.image) || undefined,
  }
}

const mapNotification = (raw: unknown, index = 0): NotificationItem => {
  const record = isRecord(raw) ? raw : {}
  const type = asString(record.type || record.kind, '알림')
  const actor = asString(record.actor || record.sender || record.author || '')
  const content = asString(record.message || record.content || record.body, '')

  return {
    id: asString(record.id || record.pk || `notification-${index}`),
    title: asString(record.title, actor ? `${actor}님의 ${type}` : type),
    message: content || '새로운 알림이 도착했어요.',
    isRead: Boolean(record.is_read || record.read),
    createdAt: asString(record.created_at || record.createdAt, new Date().toISOString()),
  }
}

export const signupApi = (body: { email: string; password: string; nickname?: string }) =>
  apiRequest<SignupResponse>('/auth/signup/', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const loginApi = (body: { email: string; password: string }) =>
  apiRequest<LoginResponse>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const logoutApi = (refresh: string) =>
  apiRequest<{ message?: string }>('/auth/logout/', {
    method: 'POST',
    body: JSON.stringify({ refresh }),
    auth: true,
  })

export const refreshApi = (refresh: string) =>
  apiRequest<AuthTokens>(
    '/auth/refresh/',
    {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    },
    false,
  )

export const googleAuthApi = (code: string, redirectUri?: string) =>
  apiRequest<GoogleAuthResponse>('/auth/google/', {
    method: 'POST',
    body: JSON.stringify(redirectUri ? { code, redirect_uri: redirectUri } : { code }),
  })

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

export const fetchNotificationsApi = async () => unwrapList(await apiRequest<unknown>('/notifications/', { auth: true })).map(mapNotification)

export const markNotificationReadApi = (id: string) =>
  apiRequest<Record<string, unknown>>(`/notifications/${id}/read/`, {
    method: 'PATCH',
    auth: true,
  })

export const markAllNotificationsReadApi = () =>
  apiRequest<{ message?: string }>('/notifications/read-all/', {
    method: 'PATCH',
    auth: true,
  })

export const searchIngredientsApi = async (search = '') => {
  const query = new URLSearchParams()
  if (search) query.set('search', search)
  const body = await apiRequest<unknown>(`/recipes/ingredients/${query.toString() ? `?${query}` : ''}`)

  return unwrapList(body)
    .map((item) => (isRecord(item) ? asString(item.name || item.title) : asString(item)))
    .filter(Boolean)
}

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
