import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiError, createRecipeApi, fetchRecipeApi, normalizeMediaUrl, updateRecipeApi, uploadMediaApi, type RecipeCreatePayload } from '../../../api'
import { useAuth } from '../../../auth'
import { type Ingredient, type Recipe } from '../../../data'
import { myRecipeFeedPath } from '../../../shared/constants/routes'
import { getRecipeTagIdsByNames, getRecipeTagNamesByIds } from '../../../tags'
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

const compressImageFile = (file: File, maxSize = 1600, quality = 0.82) =>
  new Promise<File>((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file)
      return
    }

    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)

      const ratio = Math.min(1, maxSize / Math.max(image.naturalWidth || 1, image.naturalHeight || 1))
      const width = Math.max(1, Math.round((image.naturalWidth || maxSize) * ratio))
      const height = Math.max(1, Math.round((image.naturalHeight || maxSize) * ratio))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')?.drawImage(image, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file)
            return
          }

          const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg') || `image-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          })
          resolve(compressed.size < file.size ? compressed : file)
        },
        'image/jpeg',
        quality,
      )
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(file)
    }

    image.src = objectUrl
  })

const getMediaId = (body: unknown, seen = new Set<unknown>()): string | number | '' => {
  if (!body || typeof body !== 'object' || seen.has(body)) return ''
  seen.add(body)

  const record = body as Record<string, unknown>
  const id = record.id || record.pk || record.media_id || record.mediaId || record.media_file_id || record.mediaFileId
  if (typeof id === 'number' || typeof id === 'string') return id

  for (const key of ['data', 'media', 'media_file', 'mediaFile', 'file', 'result']) {
    const nestedId = getMediaId(record[key], seen)
    if (nestedId) return nestedId
  }

  return ''
}

export const useRecipeEditor = () => {
  const route = useRoute()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const recipeId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
  const isEditMode = computed(() => Boolean(recipeId.value))
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
  const isLoadingRecipe = ref(false)
  const isSubmitting = ref(false)
  const isSubmitComplete = ref(false)
  const initialFormSnapshot = ref('')
  let cameraStream: MediaStream | null = null

  const timeOptions = [5, 10, 15, 20, 30, 45, 60]
  const servingOptions = [1, 2, 3, 4]

  const getFormSnapshot = () =>
    JSON.stringify({
      mainImagePreview: mainImagePreview.value,
      title: title.value.trim(),
      description: description.value.trim(),
      selectedTagIds: [...selectedTagIds.value].sort((a, b) => a - b),
      cookTime: cookTime.value,
      servings: servings.value,
      ingredients: ingredients.value
        .map((item) => ({ name: item.name.trim(), amount: item.amount.trim() }))
        .filter((item) => item.name || item.amount),
      steps: steps.value
        .map((step) => ({ text: step.text.trim(), image: step.image }))
        .filter((step) => step.text || step.image),
    })

  const hasUnsavedChanges = computed(() => {
    if (mainImageFile.value || steps.value.some((step) => step.imageFile)) return true
    return getFormSnapshot() !== initialFormSnapshot.value
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
    const uploadThumbnail = mainImageFile.value ? await uploadMediaApi(await compressImageFile(mainImageFile.value), 'thumbnail') : null
    if (uploadThumbnail) normalizeMediaUrl(uploadThumbnail, 'thumbnail')
    const thumbnailMediaId = getMediaId(uploadThumbnail)
    if (uploadThumbnail && !thumbnailMediaId) throw new Error('대표 이미지 업로드 응답에서 media id를 찾지 못했어요.')

    const stepMediaIds = await Promise.all(
      stepItems.map(async (step, index) => {
        if (!step.imageFile) return ''
        const uploadStep = await uploadMediaApi(await compressImageFile(step.imageFile), 'steps')
        normalizeMediaUrl(uploadStep, 'steps')
        const stepMediaId = getMediaId(uploadStep)
        if (!stepMediaId) throw new Error(`Step ${index + 1} 이미지 업로드 응답에서 media id를 찾지 못했어요.`)
        return stepMediaId
      }),
    )

    return { thumbnailMediaId, stepMediaIds }
  }

  const setInitialSnapshot = () => {
    initialFormSnapshot.value = getFormSnapshot()
  }

  const populateRecipeForm = (recipe: Recipe) => {
    title.value = recipe.title
    description.value = recipe.description
    mainImagePreview.value = recipe.image
    mainImageFile.value = null
    selectedTagIds.value = getRecipeTagIdsByNames(recipe.tags)
    cookTime.value = recipe.cookTime
    servings.value = recipe.servings
    ingredients.value = recipe.ingredients.length
      ? recipe.ingredients.map((item) => ({
          id: item.id || crypto.randomUUID(),
          name: item.name,
          amount: item.amount || '',
        }))
      : [{ id: crypto.randomUUID(), name: '', amount: '' }]
    steps.value = recipe.steps.length
      ? recipe.steps.map((step, index) => ({
          id: crypto.randomUUID(),
          text: step,
          image: recipe.stepImages[index] || '',
        }))
      : [{ id: crypto.randomUUID(), text: '', image: '' }]
    setInitialSnapshot()
  }

  const loadRecipeForEdit = async () => {
    if (!isEditMode.value) {
      setInitialSnapshot()
      return
    }

    isLoadingRecipe.value = true
    try {
      populateRecipeForm(await fetchRecipeApi(recipeId.value))
    } catch (error) {
      showToast({
        type: 'error',
        title: '레시피를 불러오지 못했어요',
        message: error instanceof ApiError && error.status < 500 ? error.message : '수정할 레시피 정보를 불러오지 못했습니다.',
      })
      void router.push(myRecipeFeedPath())
    } finally {
      isLoadingRecipe.value = false
    }
  }

  const submitRecipe = async () => {
    if (isSubmitting.value) return
    isSubmitting.value = true
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
        ...(thumbnailMediaId ? { thumbnail_media_id: thumbnailMediaId } : {}),
        ingredients: localRecipe.ingredients.map((item) => ({ name: item.name, amount: item.amount })),
        steps: localRecipe.steps.map((step, index) => ({
          order: index + 1,
          description: step,
          ...(stepMediaIds[index] ? { image_id: stepMediaIds[index] } : {}),
        })),
      }

      if (isEditMode.value) await updateRecipeApi(recipeId.value, payload)
      else await createRecipeApi(payload)
      showToast({
        type: 'success',
        title: isEditMode.value ? '레시피가 수정되었어요' : '레시피가 등록되었어요',
        message: isEditMode.value ? '마이레시피에 변경 내용이 반영되었어요.' : '피드와 마이페이지에서 방금 등록한 레시피를 확인할 수 있어요.',
      })
      isSubmitComplete.value = true
    } catch (error) {
      showToast({
        type: 'error',
        title: isEditMode.value ? '레시피 수정 실패' : '레시피 등록 실패',
        message: error instanceof ApiError && error.status < 500 ? error.message : '지금은 레시피를 저장할 수 없어요. 잠시 후 다시 시도해주세요.',
      })
      isSubmitting.value = false
      return
    }

    router.push(myRecipeFeedPath())
  }

  onUnmounted(() => {
    stopCameraStream()
  })

  onMounted(() => {
    void loadRecipeForEdit()
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
    isEditMode,
    isLoadingRecipe,
    isSubmitComplete,
    isSubmitting,
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
