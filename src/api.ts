import type { Difficulty, Ingredient, Recipe } from './data'

const DEFAULT_API_BASE_URL = '/api'

export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '')
const TOKEN_STORAGE_KEY = 'chalkkak_tokens'
const fallbackImage = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&h=800&fit=crop'

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

  if (!(options.body instanceof FormData) && options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.auth && tokens?.access && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${tokens.access}`)
  }

  const response = await fetch(apiUrl(path), { ...options, headers })
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
    throw new ApiError(response.status, getErrorMessage(body, `API 요청에 실패했습니다. (${response.status})`), body)
  }

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

const getMediaUrl = (value: unknown) => {
  if (typeof value === 'string') return value
  if (!isRecord(value)) return ''
  return asString(value.url || value.image || value.file || value.thumbnail || value.src)
}

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
  const steps = asArray(value)
    .slice()
    .sort((a, b) => {
      const orderA = isRecord(a) ? asNumber(a.order, 0) : 0
      const orderB = isRecord(b) ? asNumber(b.order, 0) : 0
      return orderA - orderB
    })

  const descriptions = steps
    .map((step) => (isRecord(step) ? asString(step.description || step.text || step.content) : asString(step)))
    .filter(Boolean)

  const images = steps.map((step) => (isRecord(step) ? getMediaUrl(step.image || step.image_url || step.media) : '')).filter(Boolean)

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
  const image = getMediaUrl(record.thumbnail_media || record.thumbnail || record.image || record.main_image) || steps.images[0] || fallbackImage

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

export const googleAuthApi = (code: string) =>
  apiRequest<GoogleAuthResponse>('/auth/google/', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })

export const fetchMeApi = () =>
  apiRequest<Record<string, unknown>>('/users/me/', {
    method: 'GET',
    auth: true,
  })

export const fetchFeedRecipesApi = async (params: { sort?: string; search?: string; tag?: string } = {}) => {
  const query = new URLSearchParams()
  if (params.sort) query.set('sort', params.sort)
  if (params.search) query.set('search', params.search)
  if (params.tag) query.set('tag', params.tag)
  const body = await apiRequest<unknown>(`/feeds/${query.toString() ? `?${query}` : ''}`)
  return unwrapList(body).map(mapDjangoRecipe)
}

export const fetchRecipesApi = async () => {
  const body = await apiRequest<unknown>('/recipes/')
  return unwrapList(body).map(mapDjangoRecipe)
}

export const fetchRecipeApi = async (id: string) => {
  const body = await apiRequest<unknown>(`/recipes/${id}/`, { auth: Boolean(getStoredTokens()) })
  return mapDjangoRecipe(isRecord(body) && body.data ? body.data : body)
}

export const createRecipeApi = async (payload: RecipeCreatePayload) => {
  const body = await apiRequest<unknown>('/recipes/', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: true,
  })
  return mapDjangoRecipe(isRecord(body) && body.data ? body.data : body)
}

export const updateRecipeApi = async (id: string, payload: Partial<RecipeCreatePayload>) => {
  const body = await apiRequest<unknown>(`/recipes/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    auth: true,
  })
  return mapDjangoRecipe(isRecord(body) && body.data ? body.data : body)
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

export const fetchCommentsApi = (recipeId: string) => apiRequest<unknown[]>(`/recipes/${recipeId}/comments/`)

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

export const fetchTagsApi = async () => {
  const body = await apiRequest<unknown>('/feeds/tags/')
  return unwrapList(body)
    .map((tag) => (isRecord(tag) ? asString(tag.name) : asString(tag)))
    .filter(Boolean)
}
