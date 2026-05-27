import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { recipes } from '../../../data'
import { recommendationsPath } from '../../../shared/constants/routes'

const MAX_INGREDIENTS = 10
const CAROUSEL_INTERVAL_MS = 6000
const SAMPLE_UPLOAD_INGREDIENTS = ['양파', '달걀', '감자']

export const useHomeRecipes = () => {
  const router = useRouter()
  const inputValue = ref('')
  const ingredients = ref<string[]>([])
  const showUploadMenu = ref(false)
  const activeIndex = ref(0)
  const todayRecipes = computed(() => recipes.value.slice(0, 4))
  const popularRecipes = computed(() => recipes.value.slice(0, 4))
  const recentRecipes = computed(() => recipes.value.slice(2, 5))
  let timer: number | undefined

  const addIngredient = (ingredient: string) => {
    if (!ingredient || ingredients.value.includes(ingredient) || ingredients.value.length >= MAX_INGREDIENTS) return
    ingredients.value.push(ingredient)
    inputValue.value = ''
  }

  const removeIngredient = (ingredient: string) => {
    ingredients.value = ingredients.value.filter((item) => item !== ingredient)
  }

  const simulateImageUpload = () => {
    SAMPLE_UPLOAD_INGREDIENTS.forEach((ingredient) => {
      if (!ingredients.value.includes(ingredient)) ingredients.value.push(ingredient)
    })
    showUploadMenu.value = false
  }

  const goRecommendations = () => {
    if (ingredients.value.length === 0) return
    router.push(recommendationsPath(ingredients.value))
  }

  onMounted(() => {
    timer = window.setInterval(() => {
      if (todayRecipes.value.length > 0) activeIndex.value = (activeIndex.value + 1) % todayRecipes.value.length
    }, CAROUSEL_INTERVAL_MS)
  })

  onUnmounted(() => {
    if (timer) window.clearInterval(timer)
  })

  return {
    activeIndex,
    addIngredient,
    goRecommendations,
    ingredients,
    inputValue,
    popularRecipes,
    recentRecipes,
    removeIngredient,
    showUploadMenu,
    simulateImageUpload,
    todayRecipes,
  }
}