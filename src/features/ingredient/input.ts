export const sanitizeIngredientInput = (ingredient: string) => ingredient.replace(/[^\p{L}\p{N}\s]/gu, '')

export const normalizeIngredient = (ingredient: string) => sanitizeIngredientInput(ingredient).trim().replace(/\s+/g, ' ')
