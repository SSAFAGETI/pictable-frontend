import { describe, expect, it } from 'vitest'
import { getRecipeTagIdsByNames, getRecipeTagQueryNamesByIds, normalizeRecipeTagName, recipeTagNames } from '../../src/tags'

describe('recipe tags', () => {
  it('uses the actual recipe tags exposed by the backend', () => {
    expect(recipeTagNames).toEqual(['반찬', '기타', '국물요리', '후식', '일품', '볶음밥'])
  })

  it('normalizes legacy and external tag names to the supported tag set', () => {
    expect(normalizeRecipeTagName('자취요리')).toBe('기타')
    expect(normalizeRecipeTagName('국&찌개')).toBe('국물요리')
    expect(normalizeRecipeTagName('디저트')).toBe('후식')
    expect(normalizeRecipeTagName('덮밥')).toBe('볶음밥')
  })

  it('maps normalized tag names to ids and API query aliases', () => {
    expect(getRecipeTagIdsByNames(['국&찌개', '볶음밥', '한식'])).toEqual([3, 6, 2])
    expect(getRecipeTagQueryNamesByIds([3])).toEqual(['국물요리', '국', '찌개', '탕', '국&찌개', '국/찌개', '스프'])
  })
})
