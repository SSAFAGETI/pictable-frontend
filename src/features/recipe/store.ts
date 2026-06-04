import { ref } from 'vue'
import { fetchFeedRecipesApi } from '../feed/api'
import { fetchHomeSummaryApi, fetchRecipesApi } from './api'
import type { Recipe } from './types'
import { fallbackRecipes } from './mock'
import { fetchFoodSafetyRecipes } from './foodSafety'

export const recipes = ref<Recipe[]>(fallbackRecipes)
export const recipesLoading = ref(false)
export const recipesError = ref('')
export const homeSummaryUnavailable = ref(false)

export async function loadFoodSafetyRecipes(start = 1, end = 30) {
  if (recipesLoading.value) return

  recipesLoading.value = true
  recipesError.value = ''
  homeSummaryUnavailable.value = false

  try {
    const apiRecipes = await fetchFoodSafetyRecipes(start, end)
    if (apiRecipes.length > 0) recipes.value = apiRecipes
  } catch (error) {
    recipesError.value = error instanceof Error ? error.message : '레시피를 불러오지 못했습니다.'
  } finally {
    recipesLoading.value = false
  }
}

export async function loadDjangoRecipes() {
  if (recipesLoading.value) return

  recipesLoading.value = true
  recipesError.value = ''
  homeSummaryUnavailable.value = false

  try {
    let apiRecipes: Recipe[] = []

    try {
      const summary = await fetchHomeSummaryApi()
      const seenIds = new Set<string>()
      apiRecipes = [summary.recommended, ...summary.popular, ...summary.recent]
        .filter((recipe): recipe is Recipe => Boolean(recipe))
        .filter((recipe) => {
          if (seenIds.has(recipe.id)) return false
          seenIds.add(recipe.id)
          return true
        })
    } catch {
      apiRecipes = []
    }

    if (apiRecipes.length === 0) apiRecipes = await fetchFeedRecipesApi({ sort: 'popular' })
    if (apiRecipes.length === 0) apiRecipes = await fetchRecipesApi()
    if (apiRecipes.length > 0) {
      recipes.value = apiRecipes
      homeSummaryUnavailable.value = false
    }
  } catch (error) {
    recipesError.value = error instanceof Error ? error.message : 'Django API에서 레시피를 불러오지 못했습니다.'
    homeSummaryUnavailable.value = true
    throw error
  } finally {
    recipesLoading.value = false
  }
}
