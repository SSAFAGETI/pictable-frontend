import { describe, expect, it } from 'vitest'
import { uniqueIngredients } from '../../src/features/ingredient/api'
import { MAX_INGREDIENTS } from '../../src/shared/constants/ingredients'

describe('ingredient API helpers', () => {
  it('keeps up to twenty unique detected ingredients', () => {
    const ingredients = Array.from({ length: 25 }, (_, index) => `재료${index + 1}`)

    expect(uniqueIngredients(ingredients)).toHaveLength(MAX_INGREDIENTS)
    expect(uniqueIngredients(['마늘', '마늘', '양파'])).toEqual(['마늘', '양파'])
  })
})
