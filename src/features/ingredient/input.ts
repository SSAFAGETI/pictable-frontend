import { MAX_INGREDIENTS } from '../../shared/constants/ingredients'

export const sanitizeIngredientInput = (ingredient: string) => ingredient.replace(/[^\p{L}\p{N}\s]/gu, '')

export const normalizeIngredient = (ingredient: string) => sanitizeIngredientInput(ingredient).trim().replace(/\s+/g, ' ')

export const mergeIngredients = (current: string[], incoming: string[], limit = MAX_INGREDIENTS) => {
  const merged = [...current]

  incoming.forEach((ingredient) => {
    const normalized = normalizeIngredient(ingredient)
    if (!normalized || merged.includes(normalized) || merged.length >= limit) return
    merged.push(normalized)
  })

  return merged
}
