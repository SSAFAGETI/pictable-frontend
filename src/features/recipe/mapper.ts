import type { Difficulty, Ingredient, Recipe } from '../../data'
import { apiRequest } from '../../shared/api/client'
import type { NotificationItem, UserProfile } from '../../shared/api/types'
import { normalizeRecipeTagName } from '../../tags'

const BACKEND_ORIGIN = 'http://3.38.26.186'

export const fallbackImage = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&h=800&fit=crop&auto=format&q=75'

export const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
export const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
export const asString = (value: unknown, fallback = '') => (typeof value === 'string' ? value : value == null ? fallback : String(value))
export const asNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

const mediaUrlCache = new Map<string, string>()
const mediaUrlRequests = new Map<string, Promise<string>>()
const foodSafetyImageCache = new Map<string, Promise<string>>()
let foodSafetyCatalogRequest: Promise<unknown[]> | null = null
let foodSafetyLookupQueue = Promise.resolve()

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

const normalizeCursor = (value: unknown) => {
  const cursor = asString(value).trim()
  if (!cursor) return null
  return getCursorFromUrl(cursor) || cursor
}

export const unwrapCursorPagination = (body: unknown) => {
  const items = unwrapList(body)
  if (!isRecord(body)) return { items, hasNext: false, nextCursor: null, isPaginated: false }

  const nextCursor =
    normalizeCursor(body.next_cursor || body.nextCursor || body.cursor) ||
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
const FOODSAFETY_ORIGIN = 'https://www.foodsafetykorea.go.kr'
const FOODSAFETY_API_KEY = import.meta.env.VITE_FOODSAFETY_API_KEY || '1db71fdb6a3e4d9593eb'

const toFoodSafetyImageUrl = (value: string) => encodeURI(`${FOODSAFETY_ORIGIN}/${value.replace(/^\/+/, '')}`)

const isFoodSafetyFileViewPath = (value: string) => value.startsWith('/common/ecmFileView.do') || value.startsWith('common/ecmFileView.do')

const hasFoodSafetyFileQuery = (value: string) => value.includes('?') || value.includes('ecm_file_no=')

const isUnresolvedFoodSafetyFileView = (value: unknown) => {
  const record = isRecord(value) ? value : null
  const rawUrl =
    typeof value === 'string'
      ? value
      : record
        ? asString(record.url || record.file || record.thumbnail || record.src || record.image_url || record.path)
        : ''
  const url = rawUrl.trim()
  return isFoodSafetyFileViewPath(url) && !hasFoodSafetyFileQuery(url)
}

const normalizeRecipeName = (value: string) => value.replace(/\s+/g, '').trim()

const getFoodSafetySearchTerms = (title: string) => {
  const normalizedTitle = title.trim()
  const words = normalizedTitle.split(/\s+/).filter(Boolean)
  const firstWord = words[0] || normalizedTitle
  const lastWord = words[words.length - 1] || normalizedTitle
  const firstTwoWords = words.slice(0, 2).join(' ')
  return Array.from(
    new Set([normalizedTitle, firstTwoWords, firstWord, lastWord, normalizedTitle.slice(0, 6), normalizeRecipeName(normalizedTitle)].filter((term) => term.length >= 2)),
  )
}

const getFoodSafetyImageFromRow = (row: unknown) => {
  if (!isRecord(row)) return ''
  return normalizeMediaUrl(row.ATT_FILE_NO_MAIN || row.ATT_FILE_NO_MK || row.MANUAL_IMG01)
}

const readFoodSafetyRows = (body: unknown) => {
  const serviceBody = isRecord(body) && isRecord(body.COOKRCP01) ? body.COOKRCP01 : {}
  return asArray(serviceBody.row)
}

const fetchFoodSafetyCatalog = async () => {
  if (foodSafetyCatalogRequest) return foodSafetyCatalogRequest

  foodSafetyCatalogRequest = fetch(`https://openapi.foodsafetykorea.go.kr/api/${FOODSAFETY_API_KEY}/COOKRCP01/json/1/1500`)
    .then((response) => (response.ok ? response.json() : null))
    .then(readFoodSafetyRows)
    .catch(() => [])

  return foodSafetyCatalogRequest
}

const findFoodSafetyImageInRows = (rows: unknown[], title: string) => {
  const normalizedTitle = normalizeRecipeName(title)
  const matched =
    rows.find((row) => isRecord(row) && normalizeRecipeName(asString(row.RCP_NM)) === normalizedTitle) ||
    rows.find((row) => isRecord(row) && normalizeRecipeName(asString(row.RCP_NM)).includes(normalizedTitle)) ||
    rows.find((row) => isRecord(row) && normalizedTitle.includes(normalizeRecipeName(asString(row.RCP_NM))))

  return getFoodSafetyImageFromRow(matched)
}

const fetchFoodSafetyImageByTitle = async (title: string) => {
  const normalizedTitle = normalizeRecipeName(title)
  if (!normalizedTitle) return ''

  const catalogImage = findFoodSafetyImageInRows(await fetchFoodSafetyCatalog(), title)
  if (catalogImage) return catalogImage

  for (const term of getFoodSafetySearchTerms(title)) {
    try {
      const response = await fetch(
        `https://openapi.foodsafetykorea.go.kr/api/${FOODSAFETY_API_KEY}/COOKRCP01/json/1/8/RCP_NM=${encodeURIComponent(term)}`,
      )
      if (!response.ok) continue

      const rows = readFoodSafetyRows(await response.json())
      const image = findFoodSafetyImageInRows(rows, title) || getFoodSafetyImageFromRow(rows[0])
      if (image) return image
    } catch {
      // Keep the feed usable even when the public image lookup is unavailable.
    }
  }

  return ''
}

const resolveFoodSafetyImageByTitle = (title: string) => {
  const normalizedTitle = normalizeRecipeName(title)
  if (!normalizedTitle) return Promise.resolve('')
  const key = `food-safety-title-v4:${normalizedTitle}`

  const cached = foodSafetyImageCache.get(key)
  if (cached) return cached

  const request = foodSafetyLookupQueue.then(() => fetchFoodSafetyImageByTitle(title))
  foodSafetyLookupQueue = request.then(
    () => undefined,
    () => undefined,
  )
  foodSafetyImageCache.set(key, request)
  return request
}

export const normalizeMediaUrl = (value: unknown, _fallbackPurpose: MediaPurpose = 'thumbnail') => {
  const cachedMediaUrl = cachedMediaUrlFromId(value)
  if (cachedMediaUrl) return cachedMediaUrl

  const record = isRecord(value) ? value : null
  const recordMediaId = record ? getMediaId(record) : ''
  const rememberRecordMediaUrl = (normalizedUrl: string) => {
    if (recordMediaId && normalizedUrl) mediaUrlCache.set(recordMediaId, normalizedUrl)
    return normalizedUrl
  }
  const rawUrl =
    typeof value === 'string'
      ? value
      : record
        ? asString(record.url || record.file || record.thumbnail || record.src || record.image_url || record.path)
        : ''
  const url = rawUrl.trim()
  if (!url || getMediaId(url)) return ''
  if (/^(data|blob):/.test(url)) return url
  if (isFoodSafetyFileViewPath(url)) return hasFoodSafetyFileQuery(url) ? toFoodSafetyImageUrl(url) : ''
  if (url.startsWith('/uploadimg/')) return toFoodSafetyImageUrl(url)
  if (url.startsWith('uploadimg/')) return toFoodSafetyImageUrl(url)

  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'www.foodsafetykorea.go.kr' && parsed.pathname === '/common/ecmFileView.do') {
      return parsed.search ? rememberRecordMediaUrl(encodeURI(parsed.toString())) : ''
    }
    if (parsed.hostname === 'www.foodsafetykorea.go.kr' && parsed.pathname.startsWith('/uploadimg/')) {
      parsed.protocol = 'https:'
      return rememberRecordMediaUrl(encodeURI(parsed.toString()))
    }
    if (parsed.origin === BACKEND_ORIGIN && parsed.pathname.startsWith('/media/')) {
      return rememberRecordMediaUrl(`${parsed.pathname}${parsed.search}`)
    }
    return rememberRecordMediaUrl(url)
  } catch {
    // Relative Django media paths must stay root-relative so Vite/Vercel can proxy them.
  }

  if (url.startsWith('/media/')) return rememberRecordMediaUrl(url)
  if (url.startsWith('media/')) return rememberRecordMediaUrl(`/${url}`)
  if (url.startsWith('/')) return rememberRecordMediaUrl(url)

  const cleanUrl = url.replace(/^\/+/, '')
  const firstSegment = cleanUrl.split('/')[0]
  if (mediaPurposes.includes(firstSegment as MediaPurpose)) return rememberRecordMediaUrl(`/media/${cleanUrl}`)

  // The API contract says upload/detail responses must include a usable url.
  // Do not invent /media/{purpose}/{filename}; it creates false 404s when only
  // a bare filename leaks through from a legacy record.
  return ''
}
const getMediaUrl = normalizeMediaUrl

const getRecipeImageSource = (record: Record<string, unknown>) =>
  record.thumbnail_media ||
  record.thumbnail_media_id ||
  record.media_id ||
  record.thumbnail_url ||
  record.thumbnail ||
  record.image_url ||
  record.image ||
  record.main_image_url ||
  record.main_image

const getStepImageSource = (step: unknown) =>
  isRecord(step)
    ? step.image ||
      step.image_url ||
      step.image_media ||
      step.media_url ||
      step.media ||
      step.step_image ||
      step.step_image_url
    : ''

const hasUnresolvedFoodSafetyImage = (record: Record<string, unknown>) =>
  isUnresolvedFoodSafetyFileView(getRecipeImageSource(record)) ||
  getSortedStepRecords(record.steps).some((step) => isUnresolvedFoodSafetyFileView(getStepImageSource(step)))

const getSortedStepRecords = (value: unknown) =>
  asArray(value)
    .slice()
    .sort((a, b) => {
      const orderA = isRecord(a) ? asNumber(a.order, 0) : 0
      const orderB = isRecord(b) ? asNumber(b.order, 0) : 0
      return orderA - orderB
    })

const getAuthorName = (value: unknown) => {
  if (typeof value === 'string') return value.includes('@') ? value.split('@')[0] : value
  if (!isRecord(value)) return 'Chalkakbabsang'
  return asString(value.nickname || value.display_name || value.name || value.username || asString(value.email).split('@')[0], 'Chalkakbabsang')
}

const getAuthorId = (record: Record<string, unknown>) => {
  const author = record.author
  if (isRecord(author)) return asString(author.id || author.pk || author.uuid || author.user_id)
  return asString(record.author_id || record.author_user_id || record.user_id || record.created_by_id)
}
const getTags = (value: unknown) =>
  asArray(value)
    .map((tag) => (isRecord(tag) ? asString(tag.name || tag.title || tag.label) : asString(tag)))
    .map(normalizeRecipeTagName)
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
    descriptions: descriptions.length ? descriptions : ['Cook this recipe step by step.'],
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
    description: asString(record.description || record.summary, 'Recipe description is not available.'),
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
    authorId: getAuthorId(record) || undefined,
    needsPublicImageLookup: hasUnresolvedFoodSafetyImage(record) || undefined,
    createdAt: asString(record.created_at || record.createdAt, new Date().toISOString()),
  }
}

export const mapDjangoRecipeWithMedia = async (raw: unknown): Promise<Recipe> => {
  const record = isRecord(raw) ? raw : {}
  const recipe = mapDjangoRecipe(raw)
  const stepRecords = getSortedStepRecords(record.steps)
  const shouldResolvePublicImage = hasUnresolvedFoodSafetyImage(record)
  const [mainImage, stepImages, publicRecipeImage] = await Promise.all([
    resolveMediaUrl(getRecipeImageSource(record), 'thumbnail'),
    Promise.all(stepRecords.map((step) => resolveMediaUrl(getStepImageSource(step), 'steps'))),
    shouldResolvePublicImage ? resolveFoodSafetyImageByTitle(recipe.title) : Promise.resolve(''),
  ])
  const resolvedStepImages = stepImages.filter(Boolean)

  return {
    ...recipe,
    image: mainImage || resolvedStepImages[0] || publicRecipeImage || recipe.image,
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

export const resolveRecipePublicImage = (recipe: Recipe) => (recipe.needsPublicImageLookup ? resolveFoodSafetyImageByTitle(recipe.title) : Promise.resolve(''))
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
  const type = asString(record.type || record.kind, 'Notification')
  const actor = asString(record.actor || record.sender || record.author || '')
  const content = asString(record.message || record.content || record.body, '')

  return {
    id: asString(record.id || record.pk || `notification-${index}`),
    title: asString(record.title, actor ? `${actor}'s ${type}` : type),
    message: content || 'A new notification has arrived.',
    isRead: Boolean(record.is_read || record.read),
    createdAt: asString(record.created_at || record.createdAt, new Date().toISOString()),
  }
}
