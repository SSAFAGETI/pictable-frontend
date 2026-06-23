import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { homeSummaryUnavailable, recipes } from '../../../data'
import { MAX_INGREDIENTS } from '../../../shared/constants/ingredients'
import { APP_ROUTES, recommendationsPath } from '../../../shared/constants/routes'
import { fetchFeedRecipesApi } from '../../feed/api'
import { normalizeIngredient, sanitizeIngredientInput } from '../../ingredient/input'

export { MAX_INGREDIENTS, normalizeIngredient, sanitizeIngredientInput }

const CAROUSEL_INTERVAL_MS = 6000

export const useHomeRecipes = () => {
  const router = useRouter()
  const ingredients = ref<string[]>([])
  const recipeSearchQuery = ref('')
  const recipeSearchSuggestions = ref<string[]>([])
  const activeIndex = ref(0)
  const isServicePreparing = computed(() => homeSummaryUnavailable.value)
  const todayRecipes = computed(() => recipes.value.slice(0, 4))
  const popularRecipes = computed(() => recipes.value.slice(0, 4))
  const recentRecipes = computed(() => recipes.value.slice(2, 5))

  let timer: number | undefined
  let suggestionTimer: number | undefined
  let suggestionRequestId = 0

  const goRecommendations = () => {
    if (ingredients.value.length === 0) return
    router.push(recommendationsPath(ingredients.value))
  }

  const goRecipeSearch = (searchOverride?: string) => {
    const search = (searchOverride ?? recipeSearchQuery.value).trim()
    recipeSearchQuery.value = search

    router.push({
      path: APP_ROUTES.feed,
      query: search ? { search } : {},
    })
  }

  onMounted(() => {
    timer = window.setInterval(() => {
      if (todayRecipes.value.length > 0) {
        activeIndex.value = (activeIndex.value + 1) % todayRecipes.value.length
      }
    }, CAROUSEL_INTERVAL_MS)
  })

  watch(recipeSearchQuery, (nextQuery) => {
    if (suggestionTimer) window.clearTimeout(suggestionTimer)

    const search = nextQuery.trim()
    suggestionRequestId += 1

    if (!search) {
      recipeSearchSuggestions.value = []
      return
    }

    const requestId = suggestionRequestId
    suggestionTimer = window.setTimeout(async () => {
      try {
        const recipes = await fetchFeedRecipesApi({ search, sort: 'popular', pageSize: 5 })
        if (requestId !== suggestionRequestId) return

        recipeSearchSuggestions.value = Array.from(new Set(recipes.map((recipe) => recipe.title).filter(Boolean))).slice(0, 5)
      } catch {
        if (requestId === suggestionRequestId) recipeSearchSuggestions.value = []
      }
    }, 250)
  })

  onUnmounted(() => {
    if (timer) window.clearInterval(timer)
    if (suggestionTimer) window.clearTimeout(suggestionTimer)
  })

  return {
    activeIndex,
    goRecipeSearch,
    goRecommendations,
    ingredients,
    isServicePreparing,
    maxIngredients: MAX_INGREDIENTS,
    popularRecipes,
    recentRecipes,
    recipeSearchSuggestions,
    recipeSearchQuery,
    todayRecipes,
  }
}
