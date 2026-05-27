import { nextTick, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ApiError, createRecipeApi, type RecipeCreatePayload } from '../../../api'
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
}

export const useRecipeEditor = () => {
  const router = useRouter()
const { user, isAuthenticated } = useAuth()
const mainImageFileInput = ref<HTMLInputElement | null>(null)
const mainImagePreview = ref('')
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
let cameraStream: MediaStream | null = null

const timeOptions = [5, 10, 15, 20, 30, 45, 60]
const servingOptions = [1, 2, 3, 4]

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

const readImage = (file: File, callback: (value: string) => void) => {
  const reader = new FileReader()
  reader.onload = () => callback(String(reader.result || ''))
  reader.readAsDataURL(file)
}

const handleMainImage = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) readImage(file, (value) => (mainImagePreview.value = value))
}

const handleStepImage = (index: number, event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) readImage(file, (value) => (steps.value[index].image = value))
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
  } else if (typeof target.index === 'number' && steps.value[target.index]) {
    steps.value[target.index].image = image
  }

  closeCamera()
}

const submitRecipe = async () => {
  const normalizedTitle = title.value.trim() || '나만의 새 레시피'
  const normalizedIngredients: Ingredient[] = ingredients.value
    .map((item, index) => ({ id: `${Date.now()}-${index}`, name: item.name.trim(), amount: item.amount.trim() }))
    .filter((item) => item.name)
  const normalizedSteps = steps.value.map((step) => step.text.trim()).filter(Boolean)
  const normalizedTags = getRecipeTagNamesByIds(selectedTagIds.value)

  const localRecipe: Recipe = {
    id: `user-${Date.now()}`,
    title: normalizedTitle,
    description: description.value.trim() || '직접 등록한 나만의 레시피입니다.',
    image: mainImagePreview.value || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&h=800&fit=crop',
    cookTime: cookTime.value || 10,
    difficulty: 'easy',
    servings: servings.value || 1,
    ingredients: normalizedIngredients.length ? normalizedIngredients : [{ id: 'ingredient-1', name: '재료', amount: '적당량' }],
    steps: normalizedSteps.length ? normalizedSteps : ['맛있게 조리해주세요.'],
    stepImages: steps.value.map((step) => step.image).filter(Boolean),
    likes: 0,
    saves: 0,
    comments: 0,
    tags: normalizedTags,
    author: user.value?.name || '김요리',
    createdAt: new Date().toISOString().slice(0, 10),
  }

  const payload: RecipeCreatePayload = {
    title: localRecipe.title,
    description: localRecipe.description,
    cook_time: localRecipe.cookTime,
    servings: localRecipe.servings,
    is_public: true,
    tag_ids: selectedTagIds.value,
    ingredients: localRecipe.ingredients.map((item) => ({ name: item.name, amount: item.amount })),
    steps: localRecipe.steps.map((step, index) => ({ order: index + 1, description: step })),
  }

  try {
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
  ingredients,
  isAuthenticated,
  isCameraOpen,
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