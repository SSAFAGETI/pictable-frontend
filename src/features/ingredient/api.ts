import { apiRequest } from '../../shared/api/client'
import { getStoredTokens } from '../../shared/api/token'
import { MAX_INGREDIENTS } from '../../shared/constants/ingredients'
import { asString, isRecord, unwrapList } from '../recipe/mapper'

const DETECTION_POLL_COUNT = 6
const DETECTION_POLL_DELAY_MS = 800

const INGREDIENT_RESPONSE_KEYS = [
  'ingredients',
  'ingredient_names',
  'items',
  'words',
  'detected',
  'detections',
  'objects',
  'labels',
  'result',
  'results',
  'data',
  'json',
] as const

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

const cleanIngredientName = (value: unknown) => {
  const text = asString(value)
    .replace(/[\[\]{}"']/g, '')
    .replace(/^[\s,.:;|-]+|[\s,.:;|-]+$/g, '')
    .trim()

  if (!text || /^https?:\/\//i.test(text) || /<\/?[a-z][\s\S]*>/i.test(text) || text.length > 30) return ''
  return text
}

const pushIngredientText = (value: unknown, results: string[]) => {
  const text = asString(value)
  const parts = text.includes(',') || text.includes('\n') ? text.split(/[,\n]/) : [text]

  parts.forEach((part) => {
    const name = cleanIngredientName(part)
    if (name) results.push(name)
  })
}

const collectIngredientNames = (value: unknown, results: string[] = []): string[] => {
  if (Array.isArray(value)) {
    value.forEach((item) => collectIngredientNames(item, results))
    return results
  }

  if (typeof value === 'string' || typeof value === 'number') {
    pushIngredientText(value, results)
    return results
  }

  if (!isRecord(value)) return results

  const directName = value.name || value.title || value.label || value.ingredient || value.text
  if (directName) pushIngredientText(directName, results)

  INGREDIENT_RESPONSE_KEYS.forEach((key) => {
    if (value[key] !== undefined) collectIngredientNames(value[key], results)
  })

  return results
}

export const uniqueIngredients = (items: string[]) =>
  Array.from(new Set(items.map((item) => item.trim()).filter(Boolean))).slice(0, MAX_INGREDIENTS)

const getDetectionJobId = (body: unknown): string => {
  if (!isRecord(body)) return ''
  const data = isRecord(body.data) ? body.data : {}
  return asString(
    body.job_id ||
      body.jobId ||
      body.detection_job_id ||
      body.detectionJobId ||
      body.task_id ||
      body.taskId ||
      data.job_id ||
      data.jobId ||
      data.detection_job_id ||
      data.detectionJobId ||
      data.task_id ||
      data.taskId,
  )
}

const isDetectionPending = (body: unknown) => {
  if (!isRecord(body)) return false
  const status = asString(body.status || body.state || body.phase).toLowerCase()
  return ['pending', 'queued', 'running', 'processing', 'started'].includes(status)
}

const requestWithOptionalAuth = <T>(path: string, options = {}) =>
  apiRequest<T>(path, {
    ...options,
    auth: Boolean(getStoredTokens()?.access),
  })

const uploadIngredientImage = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('purpose', 'ingredient_detection')

  return requestWithOptionalAuth<unknown>('/media/upload/', {
    method: 'POST',
    body: formData,
  })
}

const fetchDetectionResult = (jobId: string) =>
  requestWithOptionalAuth<unknown>(`/media/detection/${encodeURIComponent(jobId)}/`)

export const searchIngredientsApi = async (search = '') => {
  const query = new URLSearchParams()
  if (search) query.set('search', search)
  const body = await apiRequest<unknown>(`/recipes/ingredients/${query.toString() ? `?${query}` : ''}`)

  return unwrapList(body)
    .map((item) => (isRecord(item) ? asString(item.name || item.title) : asString(item)))
    .filter(Boolean)
}

export const analyzeIngredientImageApi = async (file: File) => {
  const uploadBody = await uploadIngredientImage(file)
  const uploadIngredients = uniqueIngredients(collectIngredientNames(uploadBody))
  const jobId = getDetectionJobId(uploadBody)

  if (!jobId && uploadIngredients.length > 0) return uploadIngredients
  if (!jobId) throw new Error('이미지 업로드는 완료됐지만 재료 인식 작업 ID를 받지 못했어요.')

  let lastBody: unknown = null
  for (let attempt = 0; attempt < DETECTION_POLL_COUNT; attempt += 1) {
    if (attempt > 0) await delay(DETECTION_POLL_DELAY_MS)
    lastBody = await fetchDetectionResult(jobId)
    const ingredients = uniqueIngredients(collectIngredientNames(lastBody))
    if (ingredients.length > 0) return ingredients
    if (!isDetectionPending(lastBody)) return []
  }

  const lastIngredients = uniqueIngredients(collectIngredientNames(lastBody))
  return lastIngredients.length > 0 ? lastIngredients : uploadIngredients
}
