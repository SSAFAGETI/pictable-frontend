import { describe, expect, it } from 'vitest'
import { mergeIngredients } from '../../src/features/ingredient/input'
import { MAX_INGREDIENTS } from '../../src/shared/constants/ingredients'

describe('ingredient input helpers', () => {
  it('merges detected ingredients in one state update', () => {
    expect(mergeIngredients(['tomato'], ['corn', 'flour', 'corn', '  rice  '])).toEqual([
      'tomato',
      'corn',
      'flour',
      'rice',
    ])
  })

  it('keeps merged ingredients within the max ingredient count', () => {
    const current = Array.from({ length: MAX_INGREDIENTS - 1 }, (_, index) => `item${index}`)
    const merged = mergeIngredients(current, ['last', 'overflow'])

    expect(merged).toHaveLength(MAX_INGREDIENTS)
    expect(merged[merged.length - 1]).toBe('last')
  })
})
