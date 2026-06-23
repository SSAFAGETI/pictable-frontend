import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { homeSummaryUnavailable, recipes } from '../../../data'
import { MAX_INGREDIENTS } from '../../../shared/constants/ingredients'
import { APP_ROUTES, recommendationsPath } from '../../../shared/constants/routes'
import { normalizeIngredient, sanitizeIngredientInput } from '../../ingredient/input'

export { MAX_INGREDIENTS, normalizeIngredient, sanitizeIngredientInput }

const CAROUSEL_INTERVAL_MS = 6000

export const useHomeRecipes = () => {
  const router = useRouter()
  const ingredients = ref<string[]>([])
  const recipeSearchQuery = ref('')
  const activeIndex = ref(0)
  const isServicePreparing = computed(() => homeSummaryUnavailable.value)
  const todayRecipes = computed(() => recipes.value.slice(0, 4))
  const popularRecipes = computed(() => recipes.value.slice(0, 4))
  const recentRecipes = computed(() => recipes.value.slice(2, 5))

  let timer: number | undefined

  const goRecommendations = () => {
    if (ingredients.value.length === 0) return
    router.push(recommendationsPath(ingredients.value))
  }

  const goRecipeSearch = () => {
    const search = recipeSearchQuery.value.trim()

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

  onUnmounted(() => {
    if (timer) window.clearInterval(timer)
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
    recipeSearchQuery,
    todayRecipes,
  }
}
