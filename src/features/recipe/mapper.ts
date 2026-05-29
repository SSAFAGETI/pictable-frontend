import type { Difficulty, Ingredient, Recipe } from '../../data'
import { apiRequest } from '../../shared/api/client'
import type { NotificationItem, UserProfile } from '../../shared/api/types'

const BACKEND_ORIGIN = 'http://15.164.170.144:8000'

export const fallbackImage = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&h=800&fit=crop'

export const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
export const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
export const asString = (value: unknown, fallback = '') => (typeof value === 'string' ? value : value == null ? fallback : String(value))
export const asNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
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

const resolveMediaUrl = async (value: unknown, fallbackPurpose: MediaPurpose = 'thumbnail'): Promise<string> => {
  const directUrl = normalizeMediaUrl(value, fallbackPurpose)
  if (directUrl) return directUrl

  const id = getMediaId(value)
  if (!id) return ''

  const cached = mediaUrlCache.get(id)
  if (cached) return cached

  const pending = mediaUrlRequests.get(id)
  if (pending) return pending

  const request = apiRequest<Record<string, unknown>>(`/media/${id}/`)
    .then((media) => {
      const url = normalizeMediaUrl(media, fallbackPurpose)
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

export const unwrapList = (body: unknown): unknown[] => {
  if (Array.isArray(body)) return body
  if (!isRecord(body)) return []
  if (Array.isArray(body.results)) return body.results
  if (Array.isArray(body.data)) return body.data
  if (Array.isArray(body.items)) return body.items
  return []
}

export const unwrapDetail = (body: unknown) => (isRecord(body) && body.data ? body.data : body)

export const unwrapPagination = (body: unknown) => {
  const items = unwrapList(body)
  if (!isRecord(body)) return { items, hasNext: false, count: items.length, isPaginated: false }
  const isPaginated =
    body.next !== undefined ||
    body.previous !== undefined ||
    body.count !== undefined ||
    body.total !== undefined ||
    body.has_next !== undefined ||
    body.hasNext !== undefined
  return {
    items,
    hasNext: Boolean(body.next || body.has_next || body.hasNext),
    count: asNumber(body.count || body.total, items.length),
    isPaginated,
  }
}

const getCursorFromUrl = (value: unknown) => {
  const url = asString(value).trim()
  if (!url) return null
  try {
    const parsed = new URL(url, window.location.origin)
    return parsed.searchParams.get('cursor')
  } catch {
    return null
  }
}

export const unwrapCursorPagination = (body: unknown) => {
  const items = unwrapList(body)
  if (!isRecord(body)) return { items, hasNext: false, nextCursor: null, isPaginated: false }

  const nextCursor =
    asString(body.next_cursor || body.nextCursor || body.cursor || '').trim() ||
    getCursorFromUrl(body.next) ||
    null
  const isPaginated =
    body.next !== undefined ||
    body.previous !== undefined ||
    body.next_cursor !== undefined ||
    body.nextCursor !== undefined ||
    body.cursor !== undefined ||
    body.results !== undefined

  return {
    items,
    hasNext: Boolean(nextCursor || body.has_next || body.hasNext),
    nextCursor,
    isPaginated,
  }
}
type MediaPurpose = 'thumbnail' | 'steps' | 'ingredient' | 'ingredient_detection'

const mediaPurposes: MediaPurpose[] = ['thumbnail', 'steps', 'ingredient', 'ingredient_detection']

const normalizePurpose = (value: unknown, fallback: MediaPurpose = 'thumbnail'): MediaPurpose => {
  const purpose = asString(value).trim()
  if (purpose === 'step') return 'steps'
  return mediaPurposes.includes(purpose as MediaPurpose) ? (purpose as MediaPurpose) : fallback
}

const looksLikeFilePath = (value: string) => /\.[a-z0-9]{2,8}(\?.*)?$/i.test(value)

export const normalizeMediaUrl = (value: unknown, fallbackPurpose: MediaPurpose = 'thumbnail') => {
  const cachedMediaUrl = cachedMediaUrlFromId(value)
  if (cachedMediaUrl) return cachedMediaUrl

  const record = isRecord(value) ? value : null
  const rawUrl =
    typeof value === 'string'
      ? value
      : record
        ? asString(record.url || record.file || record.thumbnail || record.src || record.image_url || record.path || record.original_name)
        : ''
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
  if (url.startsWith('/')) return url

  const cleanUrl = url.replace(/^\/+/, '')
  const firstSegment = cleanUrl.split('/')[0]
  if (mediaPurposes.includes(firstSegment as MediaPurpose)) return `/media/${cleanUrl}`
  if (looksLikeFilePath(cleanUrl)) return `/media/${normalizePurpose(record?.purpose || record?.type, fallbackPurpose)}/${cleanUrl}`
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
  if (!isRecord(value)) return '李곗뭇諛μ긽'
  return asString(value.nickname || value.name || value.email || value.username, '李곗뭇諛μ긽')
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

  return ingredients.length ? ingredients : [{ id: `${title}-ingredient`, name: 'ingredient', amount: 'as needed' }]
}

const getSteps = (value: unknown) => {
  const steps = getSortedStepRecords(value)

  const descriptions = steps
    .map((step) => (isRecord(step) ? asString(step.description || step.text || step.content) : asString(step)))
    .filter(Boolean)

  const images = steps.map((step) => getMediaUrl(getStepImageSource(step), 'steps')).filter(Boolean)

  return {
    descriptions: descriptions.length ? descriptions : ['留쏆엳寃?議곕━?댁＜?몄슂.'],
    images,
  }
}

const normalizeDifficulty = (value: unknown): Difficulty => {
  if (value === 'medium' || value === 'hard' || value === 'easy') return value
  return 'easy'
}

export const mapDjangoRecipe = (raw: unknown): Recipe => {
  const record = isRecord(raw) ? raw : {}
  const title = asString(record.title || record.name, 'Untitled recipe')
  const steps = getSteps(record.steps)
  const image = getMediaUrl(getRecipeImageSource(record)) || steps.images[0] || fallbackImage

  return {
    id: asString(record.id || record.pk || record.uuid, `recipe-${Date.now()}`),
    title,
    description: asString(record.description || record.summary, '留쏆엳???덉떆?쇱엯?덈떎.'),
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

export const mapDjangoRecipeWithMedia = async (raw: unknown): Promise<Recipe> => {
  const record = isRecord(raw) ? raw : {}
  const recipe = mapDjangoRecipe(raw)
  const stepRecords = getSortedStepRecords(record.steps)
  const [mainImage, stepImages] = await Promise.all([
    resolveMediaUrl(getRecipeImageSource(record), 'thumbnail'),
    Promise.all(stepRecords.map((step) => resolveMediaUrl(getStepImageSource(step), 'steps'))),
  ])
  const resolvedStepImages = stepImages.filter(Boolean)

  return {
    ...recipe,
    image: mainImage || resolvedStepImages[0] || recipe.image,
    stepImages: resolvedStepImages.length ? resolvedStepImages : recipe.stepImages,
  }
}

export const mapDjangoRecipeListItemWithMedia = async (raw: unknown): Promise<Recipe> => {
  const record = isRecord(raw) ? raw : {}
  const recipe = mapDjangoRecipe(raw)
  const mainImage = await resolveMediaUrl(getRecipeImageSource(record), 'thumbnail')

  return {
    ...recipe,
    image: mainImage || recipe.image,
  }
}

export const mapDjangoRecipeListWithMedia = (items: unknown[]) => Promise.all(items.map(mapDjangoRecipeListItemWithMedia))
export const mapUserProfile = (raw: unknown, index = 0): UserProfile => {
  const record = isRecord(raw) ? raw : {}
  const email = asString(record.email || record.username, '')
  const name = asString(record.nickname || record.name || email.split('@')[0], 'User')

  return {
    id: asString(record.id || record.pk || record.uuid, `user-${index}`),
    name,
    email,
    avatar: getMediaUrl(record.avatar || record.profile_image_url || record.profile_image || record.image) || undefined,
  }
}

export const mapNotification = (raw: unknown, index = 0): NotificationItem => {
  const record = isRecord(raw) ? raw : {}
  const type = asString(record.type || record.kind, '?뚮┝')
  const actor = asString(record.actor || record.sender || record.author || '')
  const content = asString(record.message || record.content || record.body, '')

  return {
    id: asString(record.id || record.pk || `notification-${index}`),
    title: asString(record.title, actor ? `${actor}??瑜곷꺄 ${type}` : type),
    message: content || '?덈줈???뚮┝???꾩갑?덉뼱??',
    isRead: Boolean(record.is_read || record.read),
    createdAt: asString(record.created_at || record.createdAt, new Date().toISOString()),
  }
}
