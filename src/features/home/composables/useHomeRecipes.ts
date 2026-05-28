import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { recipes } from '../../../data'
import { recommendationsPath } from '../../../shared/constants/routes'

const MAX_INGREDIENTS = 10
const CAROUSEL_INTERVAL_MS = 6000

const readImageFile = (file: File, callback: (value: string) => void) => {
  const reader = new FileReader()
  reader.onload = () => callback(String(reader.result || ''))
  reader.readAsDataURL(file)
}

export const useHomeRecipes = () => {
  const router = useRouter()
  const inputValue = ref('')
  const ingredients = ref<string[]>([])
  const showUploadMenu = ref(false)
  const galleryImageInput = ref<HTMLInputElement | null>(null)
  const cameraImageInput = ref<HTMLInputElement | null>(null)
  const selectedImageName = ref('')
  const selectedImagePreview = ref('')
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

  const openGalleryPicker = () => {
    galleryImageInput.value?.click()
    showUploadMenu.value = false
  }

  const openCameraPicker = () => {
    cameraImageInput.value?.click()
    showUploadMenu.value = false
  }

  const handleImageUpload = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return

    selectedImageName.value = file.name || 'camera-photo.jpg'
    readImageFile(file, (value) => {
      selectedImagePreview.value = value
    })
  }

  const removeSelectedImage = () => {
    selectedImageName.value = ''
    selectedImagePreview.value = ''
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
    ingredients,
    inputValue,
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