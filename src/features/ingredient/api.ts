import { apiRequest } from '../../shared/api/client'
import { asString, isRecord, unwrapList } from '../recipe/mapper'

const DEFAULT_IMAGE_INGREDIENT_ENDPOINT = '/ai/ingredients/'
const imageIngredientEndpoint = String(
  import.meta.env.VITE_INGREDIENT_IMAGE_ENDPOINT ||
    import.meta.env.VITE_VLM_INGREDIENT_ENDPOINT ||
    DEFAULT_IMAGE_INGREDIENT_ENDPOINT,
).trim() || DEFAULT_IMAGE_INGREDIENT_ENDPOINT

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

const cleanIngredientName = (value: unknown) => {
  const text = asString(value)
    .replace(/[\[\]{}"']/g, '')
    .replace(/^[\s,.:;|-]+|[\s,.:;|-]+$/g, '')
    .trim()

  if (!text || /^https?:\/\//i.test(text) || text.length > 30) return ''
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

const uniqueIngredients = (items: string[]) =>
  Array.from(new Set(items.map((item) => item.trim()).filter(Boolean))).slice(0, 10)

export const searchIngredientsApi = async (search = '') => {
  const query = new URLSearchParams()
  if (search) query.set('search', search)
  const body = await apiRequest<unknown>(`/recipes/ingredients/${query.toString() ? `?${query}` : ''}`)

  return unwrapList(body)
    .map((item) => (isRecord(item) ? asString(item.name || item.title) : asString(item)))
    .filter(Boolean)
}

export const analyzeIngredientImageApi = async (file: File) => {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('purpose', 'ingredient')

  const body = await apiRequest<unknown>(imageIngredientEndpoint, {
    method: 'POST',
    body: formData,
  })

  const candidates = collectIngredientNames(body)
  return uniqueIngredients(candidates)
}
