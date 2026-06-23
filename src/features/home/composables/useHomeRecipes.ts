import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { homeSummaryUnavailable, recipes } from '../../../data'
import { ApiError } from '../../../shared/api/error'
import { MAX_INGREDIENTS } from '../../../shared/constants/ingredients'
import { recommendationsPath } from '../../../shared/constants/routes'
import { showToast } from '../../../toast'
import { analyzeIngredientImageApi } from '../../ingredient/api'

export { MAX_INGREDIENTS }
const CAROUSEL_INTERVAL_MS = 6000

const readImageFile = (file: File, callback: (value: string) => void) => {
  const reader = new FileReader()
  reader.onload = () => callback(String(reader.result || ''))
  reader.readAsDataURL(file)
}

const dataUrlToFile = (dataUrl: string, filename: string) => {
  const [header, data] = dataUrl.split(',')
  const mime = header.match(/data:(.*?);base64/)?.[1] || 'image/jpeg'
  const binary = window.atob(data || '')
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return new File([bytes], filename, { type: mime })
}

export const sanitizeIngredientInput = (ingredient: string) => ingredient.replace(/[^\p{L}\p{N}\s]/gu, '')

export const normalizeIngredient = (ingredient: string) => sanitizeIngredientInput(ingredient).trim().replace(/\s+/g, ' ')

const getCameraErrorMessage = (error: unknown) => {
  const errorName = error instanceof DOMException ? error.name : ''

  if (!window.isSecureContext) {
    return {
      title: '카메라를 열 수 없어요',
      message: '카메라는 HTTPS 또는 localhost 환경에서만 사용할 수 있어요.',
    }
  }

  if (errorName === 'NotAllowedError' || errorName === 'SecurityError') {
    return {
      title: '카메라 권한이 차단되어 있어요',
      message: '브라우저 주소창의 사이트 설정에서 카메라 권한을 허용한 뒤 다시 시도해주세요.',
    }
  }

  if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
    return {
      title: '사용 가능한 카메라가 없어요',
      message: '웹캠 또는 휴대폰 카메라가 연결되어 있는지 확인해주세요.',
    }
  }

  if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
    return {
      title: '카메라를 사용할 수 없어요',
      message: '다른 앱에서 카메라를 사용 중일 수 있어요. 잠시 후 다시 시도해주세요.',
    }
  }

  if (errorName === 'OverconstrainedError' || errorName === 'ConstraintNotSatisfiedError') {
    return {
      title: '카메라 설정을 맞출 수 없어요',
      message: '현재 기기에서 요청한 카메라 설정을 지원하지 않습니다.',
    }
  }

  return {
    title: '카메라를 열 수 없어요',
    message: '브라우저 카메라 권한 또는 장치 상태를 확인한 뒤 다시 시도해주세요.',
  }
}

export const useHomeRecipes = () => {
  const router = useRouter()
  const inputValue = ref('')
  const ingredients = ref<string[]>([])
  const showUploadMenu = ref(false)
  const galleryImageInput = ref<HTMLInputElement | null>(null)
  const cameraVideoRef = ref<HTMLVideoElement | null>(null)
  const isCameraOpen = ref(false)
  const isCameraStarting = ref(false)
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
  let cameraStream: MediaStream | null = null

  const addIngredient = (ingredient: string) => {
    const normalized = normalizeIngredient(ingredient)
    if (!normalized || ingredients.value.includes(normalized) || ingredients.value.length >= MAX_INGREDIENTS) return

    ingredients.value.push(normalized)
    inputValue.value = ''
  }

  const handleIngredientInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    const sanitized = sanitizeIngredientInput(input.value)
    if (input.value !== sanitized) input.value = sanitized
    inputValue.value = sanitized
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

  const processSelectedImageFile = async (file: File) => {
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

  const stopCameraStream = () => {
    cameraStream?.getTracks().forEach((track) => track.stop())
    cameraStream = null
  }

  const closeCamera = () => {
    stopCameraStream()
    isCameraOpen.value = false
    isCameraStarting.value = false
  }

  const openCameraPicker = async () => {
    showUploadMenu.value = false

    if (!window.isSecureContext) {
      showToast({
        type: 'error',
        title: '카메라를 열 수 없어요',
        message: '카메라는 HTTPS 또는 localhost 환경에서만 사용할 수 있어요.',
      })
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      showToast({
        type: 'error',
        title: '카메라를 열 수 없어요',
        message: '현재 브라우저에서 카메라 촬영을 지원하지 않습니다. 갤러리에서 선택해주세요.',
      })
      return
    }

    try {
      stopCameraStream()
      isCameraOpen.value = true
      isCameraStarting.value = true
      await nextTick()

      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })

      if (cameraVideoRef.value) {
        cameraVideoRef.value.srcObject = cameraStream
        await cameraVideoRef.value.play()
      }
    } catch (error) {
      closeCamera()
      const cameraError = getCameraErrorMessage(error)
      showToast({
        type: 'error',
        title: cameraError.title,
        message: cameraError.message,
      })
    } finally {
      isCameraStarting.value = false
    }
  }

  const captureCameraPhoto = async () => {
    const video = cameraVideoRef.value
    if (!video) return

    if (!video.videoWidth || !video.videoHeight) {
      showToast({
        type: 'error',
        title: '촬영할 수 없어요',
        message: '카메라 화면이 준비된 뒤 다시 눌러주세요.',
      })
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')
    if (!context) return

    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const image = canvas.toDataURL('image/jpeg', 0.9)
    const file = dataUrlToFile(image, `ingredient-camera-${Date.now()}.jpg`)

    closeCamera()
    await processSelectedImageFile(file)
  }

  const handleImageUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return

    await processSelectedImageFile(file)
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
      if (todayRecipes.value.length > 0) {
        activeIndex.value = (activeIndex.value + 1) % todayRecipes.value.length
      }
    }, CAROUSEL_INTERVAL_MS)
  })

  onUnmounted(() => {
    if (timer) window.clearInterval(timer)
    closeCamera()
  })

  return {
    activeIndex,
    addIngredient,
    cameraVideoRef,
    captureCameraPhoto,
    closeCamera,
    galleryImageInput,
    goRecommendations,
    handleImageUpload,
    handleIngredientInput,
    imageAnalyzeError,
    ingredients,
    inputValue,
    isAnalyzingImage,
    isCameraOpen,
    isCameraStarting,
    isServicePreparing,
    maxIngredients: MAX_INGREDIENTS,
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
