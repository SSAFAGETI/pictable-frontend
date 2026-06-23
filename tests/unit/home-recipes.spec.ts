import { describe, expect, it } from 'vitest'
import { MAX_INGREDIENTS, normalizeIngredient, sanitizeIngredientInput } from '../../src/features/home/composables/useHomeRecipes'

describe('home recipe ingredient input helpers', () => {
  it('allows letters, numbers, and spaces while removing punctuation', () => {
    expect(sanitizeIngredientInput('마늘, 장아찌! 2개')).toBe('마늘 장아찌 2개')
    expect(normalizeIngredient('  garlic!!!   powder  ')).toBe('garlic powder')
  })

  it('supports up to twenty ingredients', () => {
    expect(MAX_INGREDIENTS).toBe(20)
  })
})
