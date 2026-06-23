import { describe, expect, it } from 'vitest'
import {
  isActiveRoute,
  isAppChromeHiddenRoute,
  isAuthRoute,
  myRecipeFeedPath,
  recommendationsPath,
  recipeDetailPath,
} from '../../src/shared/constants/routes'

describe('route helpers', () => {
  it('builds application links with encoded params', () => {
    expect(recipeDetailPath('my recipe')).toBe('/recipe/my%20recipe')
    expect(recommendationsPath(['egg', 'milk powder'])).toBe('/recommendations?ingredients=egg%2Cmilk%20powder')
    expect(myRecipeFeedPath()).toBe('/feed?source=my&sort=recent')
  })

  it('detects active and hidden routes correctly', () => {
    expect(isActiveRoute('/feed', '/feed')).toBe(true)
    expect(isActiveRoute('/feed/trending', '/feed')).toBe(true)
    expect(isActiveRoute('/saved', '/feed')).toBe(false)
    expect(isAuthRoute('/login')).toBe(true)
    expect(isAuthRoute('/signup')).toBe(true)
    expect(isAuthRoute('/feed')).toBe(false)
    expect(isAppChromeHiddenRoute('/backend-api')).toBe(true)
    expect(isAppChromeHiddenRoute('/server-error')).toBe(true)
    expect(isAppChromeHiddenRoute('/feed')).toBe(false)
  })
})
