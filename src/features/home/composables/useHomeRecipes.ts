import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { homeSummaryUnavailable, recipes } from '../../../data'
import { analyzeIngredientImageApi } from '../../ingredient/api'
import { ApiError } from '../../../shared/api/error'
import { recommendationsPath } from '../../../shared/constants/routes'

const MAX_INGREDIENTS = 10
const CAROUSEL_INTERVAL_MS = 6000

const readImageFile = (file: File, callback: (value: string) => void) => {
  const reader = new FileReader()
  reader.onload = () => callback(String(reader.result || ''))
  reader.readAsDataURL(file)
}

const normalizeIngredient = (ingredient: string) => ingredient.trim().replace(/\s+/g, ' ')

export const useHomeRecipes = () => {
  const router = useRouter()
  const inputValue = ref('')
  const ingredients = ref<string[]>([])
  const showUploadMenu = ref(false)
  const galleryImageInput = ref<HTMLInputElement | null>(null)
  const cameraImageInput = ref<HTMLInputElement | null>(null)
  const selectedImageName = ref('')
  const selectedImagePreview = ref('')
  const isAnalyzingImage = ref(false)
  const imageAnalyzeError = ref('')
  const activeIndex = ref(0)
  const isServicePreparing = computed(() => homeSummaryUnavailable.value)
  const todayRecipes = computed(() => recipes.value.slice(0, 4))
  const popularRecipes = computed(() => recipes.value.slice(0, 4))
  const recentRecipes = computed(() => recipes.value.slice(2, 5))
  let timer: number | undefined

  const addIngredient = (ingredient: string) => {
    const normalized = normalizeIngredient(ingredient)
    if (!normalized || ingredients.value.includes(normalized) || ingredients.value.length >= MAX_INGREDIENTS) return
    ingredients.value.push(normalized)
    inputValue.value = ''
  }

  const addIngredients = (items: string[]) => {
    items.forEach(addIngredient)
  }

  const removeIngredient = (ingredient: string) => {
    ingredients.value = ingredients.value.filter((item) => item !== ingredient)
  }

  const openGalleryPicker = () => {
    galleryImageInput.value?.click()
    showUploadMenu.value = false
  }

  const openCameraPicker = () => {
    cameraImageInput.value?.click()
    showUploadMenu.value = false
  }

  const handleImageUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return

    selectedImageName.value = file.name || 'camera-photo.jpg'
    imageAnalyzeError.value = ''
    readImageFile(file, (value) => {
      selectedImagePreview.value = value
    })

    isAnalyzingImage.value = true
    try {
      const detectedIngredients = await analyzeIngredientImageApi(file)
      if (detectedIngredients.length === 0) {
        imageAnalyzeError.value = '이미지에서 재료를 찾지 못했어요. 직접 입력으로 추가해주세요.'
        return
      }

      addIngredients(detectedIngredients)
    } catch (error) {
      imageAnalyzeError.value =
        error instanceof ApiError && error.status === 401
          ? '이미지 재료 인식은 로그인 후 사용할 수 있어요.'
          : '이미지 재료 인식에 실패했어요. 잠시 후 다시 시도해주세요.'
    } finally {
      isAnalyzingImage.value = false
    }
  }

  const removeSelectedImage = () => {
    selectedImageName.value = ''
    selectedImagePreview.value = ''
    imageAnalyzeError.value = ''
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
    cameraImageInput,
    galleryImageInput,
    goRecommendations,
    handleImageUpload,
    imageAnalyzeError,
    ingredients,
    inputValue,
    isAnalyzingImage,
    isServicePreparing,
    openCameraPicker,
    openGalleryPicker,
    popularRecipes,
    recentRecipes,
    removeIngredient,
    removeSelectedImage,
    selectedImageName,
    selectedImagePreview,
    showUploadMenu,
    todayRecipes,
  }
}
