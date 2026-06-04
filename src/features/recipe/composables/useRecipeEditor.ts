import { computed, nextTick, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ApiError, createRecipeApi, uploadMediaApi, type RecipeCreatePayload } from '../../../api'
import { useAuth } from '../../../auth'
import { recipes, type Ingredient, type Recipe } from '../../../data'
import { myRecipeFeedPath } from '../../../shared/constants/routes'
import { getRecipeTagNamesByIds } from '../../../tags'
import { showToast } from '../../../toast'

interface EditableIngredient {
  id: string
  name: string
  amount: string
}

interface EditableStep {
  id: string
  text: string
  image: string
  imageFile?: File
}

const fallbackRecipeImage = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&h=800&fit=crop'

const readImage = (file: File, callback: (value: string) => void) => {
  const reader = new FileReader()
  reader.onload = () => callback(String(reader.result || ''))
  reader.readAsDataURL(file)
}

const dataUrlToFile = (dataUrl: string, fileName: string) => {
  const [header, data] = dataUrl.split(',')
  const mime = header.match(/data:(.*?);base64/)?.[1] || 'image/jpeg'
  const binary = window.atob(data || '')
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return new File([bytes], fileName, { type: mime })
}

const getMediaId = (body: unknown) => {
  if (!body || typeof body !== 'object') return ''
  const record = body as Record<string, unknown>
  const data = record.data && typeof record.data === 'object' ? (record.data as Record<string, unknown>) : {}
  const id = record.id || record.media_id || record.mediaId || data.id || data.media_id || data.mediaId
  return typeof id === 'number' || typeof id === 'string' ? id : ''
}

export const useRecipeEditor = () => {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const mainImageFileInput = ref<HTMLInputElement | null>(null)
  const mainImagePreview = ref('')
  const mainImageFile = ref<File | null>(null)
  const title = ref('')
  const description = ref('')
  const selectedTagIds = ref<number[]>([])
  const cookTime = ref(0)
  const servings = ref(0)
  const ingredients = ref<EditableIngredient[]>([{ id: crypto.randomUUID(), name: '', amount: '' }])
  const steps = ref<EditableStep[]>([{ id: crypto.randomUUID(), text: '', image: '' }])
  const cameraVideoRef = ref<HTMLVideoElement | null>(null)
  const isCameraOpen = ref(false)
  const cameraTarget = ref<{ type: 'main' | 'step'; index?: number } | null>(null)
  const isSubmitComplete = ref(false)
  let cameraStream: MediaStream | null = null

  const timeOptions = [5, 10, 15, 20, 30, 45, 60]
  const servingOptions = [1, 2, 3, 4]

  const hasUnsavedChanges = computed(() => {
    const hasIngredient = ingredients.value.some((item) => item.name.trim() || item.amount.trim())
    const hasStep = steps.value.some((step) => step.text.trim() || step.image || step.imageFile)
    return Boolean(
      mainImagePreview.value ||
        mainImageFile.value ||
        title.value.trim() ||
        description.value.trim() ||
        selectedTagIds.value.length ||
        cookTime.value ||
        servings.value ||
        hasIngredient ||
        hasStep,
    )
  })

  const addIngredient = () => {
    ingredients.value.push({ id: crypto.randomUUID(), name: '', amount: '' })
  }

  const removeIngredient = (index: number) => {
    if (ingredients.value.length === 1) {
      ingredients.value[0] = { id: crypto.randomUUID(), name: '', amount: '' }
      return
    }
    ingredients.value.splice(index, 1)
  }

  const addStep = () => {
    steps.value.push({ id: crypto.randomUUID(), text: '', image: '' })
  }

  const removeStep = (index: number) => {
    if (steps.value.length === 1) {
      steps.value[0] = { id: crypto.randomUUID(), text: '', image: '' }
      return
    }
    steps.value.splice(index, 1)
  }

  const handleMainImage = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    mainImageFile.value = file
    readImage(file, (value) => (mainImagePreview.value = value))
  }

  const handleStepImage = (index: number, event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file || !steps.value[index]) return
    steps.value[index].imageFile = file
    readImage(file, (value) => (steps.value[index].image = value))
  }

  const stopCameraStream = () => {
    cameraStream?.getTracks().forEach((track) => track.stop())
    cameraStream = null
  }

  const closeCamera = () => {
    stopCameraStream()
    isCameraOpen.value = false
    cameraTarget.value = null
  }

  const openCamera = async (type: 'main' | 'step', index?: number) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      showToast({
        type: 'error',
        title: '카메라를 열 수 없어요',
        message: '현재 브라우저에서는 카메라 촬영을 지원하지 않습니다. 파일 선택을 이용해주세요.',
      })
      return
    }

    try {
      stopCameraStream()
      cameraTarget.value = { type, index }
      isCameraOpen.value = true
      await nextTick()
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      if (cameraVideoRef.value) {
        cameraVideoRef.value.srcObject = cameraStream
        await cameraVideoRef.value.play()
      }
    } catch {
      closeCamera()
      showToast({
        type: 'error',
        title: '카메라 권한이 필요해요',
        message: '브라우저 카메라 권한을 허용한 뒤 다시 시도해주세요.',
      })
    }
  }

  const captureCameraPhoto = () => {
    const video = cameraVideoRef.value
    const target = cameraTarget.value
    if (!video || !target) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const context = canvas.getContext('2d')
    if (!context) return

    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const image = canvas.toDataURL('image/jpeg', 0.9)

    if (target.type === 'main') {
      mainImagePreview.value = image
      mainImageFile.value = dataUrlToFile(image, `thumbnail-${Date.now()}.jpg`)
    } else if (typeof target.index === 'number' && steps.value[target.index]) {
      steps.value[target.index].image = image
      steps.value[target.index].imageFile = dataUrlToFile(image, `step-${target.index + 1}-${Date.now()}.jpg`)
    }

    closeCamera()
  }

  const uploadRecipeImages = async (stepItems: Array<{ imageFile?: File }>) => {
    const thumbnailMediaId = mainImageFile.value ? getMediaId(await uploadMediaApi(mainImageFile.value, 'thumbnail')) : ''
    const stepMediaIds = await Promise.all(
      stepItems.map(async (step) => (step.imageFile ? getMediaId(await uploadMediaApi(step.imageFile, 'steps')) : '')),
    )

    return { thumbnailMediaId, stepMediaIds }
  }

  const submitRecipe = async () => {
    const normalizedTitle = title.value.trim() || '나만의 레시피'
    const normalizedIngredients: Ingredient[] = ingredients.value
      .map((item, index) => ({ id: `${Date.now()}-${index}`, name: item.name.trim(), amount: item.amount.trim() }))
      .filter((item) => item.name)
    const normalizedStepItems = steps.value
      .map((step) => ({ description: step.text.trim(), image: step.image, imageFile: step.imageFile }))
      .filter((step) => step.description)
    const normalizedSteps = normalizedStepItems.map((step) => step.description)
    const normalizedTags = getRecipeTagNamesByIds(selectedTagIds.value)

    const localRecipe: Recipe = {
      id: `user-${Date.now()}`,
      title: normalizedTitle,
      description: description.value.trim() || '직접 등록한 나만의 레시피입니다.',
      image: mainImagePreview.value || fallbackRecipeImage,
      cookTime: cookTime.value || 10,
      difficulty: 'easy',
      servings: servings.value || 1,
      ingredients: normalizedIngredients.length ? normalizedIngredients : [{ id: 'ingredient-1', name: '재료', amount: '적당량' }],
      steps: normalizedSteps.length ? normalizedSteps : ['맛있게 조리해주세요.'],
      stepImages: normalizedStepItems.map((step) => step.image).filter(Boolean),
      likes: 0,
      saves: 0,
      comments: 0,
      tags: normalizedTags,
      author: user.value?.name || '김요리',
      createdAt: new Date().toISOString().slice(0, 10),
    }

    try {
      const { thumbnailMediaId, stepMediaIds } = await uploadRecipeImages(normalizedStepItems)
      const payload: RecipeCreatePayload = {
        title: localRecipe.title,
        description: localRecipe.description,
        cook_time: localRecipe.cookTime,
        servings: localRecipe.servings,
        is_public: true,
        tag_ids: selectedTagIds.value,
        ...(thumbnailMediaId ? { thumbnail_media: thumbnailMediaId } : {}),
        ingredients: localRecipe.ingredients.map((item) => ({ name: item.name, amount: item.amount })),
        steps: localRecipe.steps.map((step, index) => ({
          order: index + 1,
          description: step,
          ...(stepMediaIds[index] ? { image: stepMediaIds[index] } : {}),
        })),
      }

      const createdRecipe = await createRecipeApi(payload)
      recipes.value.unshift({
        ...createdRecipe,
        image: createdRecipe.image || localRecipe.image,
        tags: createdRecipe.tags.length ? createdRecipe.tags : localRecipe.tags,
        stepImages: createdRecipe.stepImages.length ? createdRecipe.stepImages : localRecipe.stepImages,
        author: createdRecipe.author || localRecipe.author,
      })
      showToast({
        type: 'success',
        title: '레시피가 등록되었어요',
        message: '피드와 마이페이지에서 방금 등록한 레시피를 확인할 수 있어요.',
      })
      isSubmitComplete.value = true
    } catch (error) {
      showToast({
        type: 'error',
        title: '레시피 등록 실패',
        message: error instanceof ApiError && error.status < 500 ? error.message : '지금은 레시피를 등록할 수 없어요. 잠시 후 다시 시도해주세요.',
      })
      return
    }

    router.push(myRecipeFeedPath())
  }

  onUnmounted(() => {
    stopCameraStream()
  })

  return {
    addIngredient,
    addStep,
    cookTime,
    description,
    cameraVideoRef,
    captureCameraPhoto,
    closeCamera,
    handleMainImage,
    handleStepImage,
    hasUnsavedChanges,
    ingredients,
    isAuthenticated,
    isCameraOpen,
    isSubmitComplete,
    mainImageFileInput,
    mainImagePreview,
    openCamera,
    removeIngredient,
    removeStep,
    selectedTagIds,
    servingOptions,
    servings,
    steps,
    submitRecipe,
    timeOptions,
    title,
  }
}
