<template>
  <div>
    <div>
      <p v-if="eyebrow" class="text-sm font-semibold text-primary">{{ eyebrow }}</p>
      <h2 class="mt-1 text-xl font-bold">{{ title }}</h2>
      <p v-if="description" class="mt-2 text-sm leading-6 text-muted-foreground">{{ description }}</p>
    </div>

    <form class="mt-5 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]" @submit.prevent="addIngredient(inputValue)">
      <div class="relative min-w-0">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref="textInputRef"
          :value="inputValue"
          type="text"
          placeholder="재료 입력 후 Enter"
          class="flex h-12 w-full min-w-0 rounded-xl border border-input bg-background py-2 pl-10 pr-3 text-base outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="재료 입력"
          :disabled="ingredients.length >= maxIngredients"
          @input="handleIngredientInput"
          @compositionend="handleIngredientCompositionEnd"
          @keydown.enter="handleIngredientEnter"
        />
      </div>

      <button
        type="submit"
        class="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-black text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        :disabled="ingredients.length >= maxIngredients || normalizeIngredient(inputValue).length === 0"
      >
        <Plus class="h-4 w-4" />
        추가
      </button>

      <div class="relative">
        <input ref="galleryImageInput" class="hidden" type="file" accept="image/*" @change="handleImageUpload" />
        <button
          type="button"
          class="inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-xl border border-input bg-background px-4 text-sm font-bold shadow-sm hover:bg-muted sm:w-12 sm:px-0"
          aria-label="사진으로 재료 추가"
          aria-haspopup="menu"
          :aria-expanded="showUploadMenu"
          @click="showUploadMenu = !showUploadMenu"
        >
          <ImageIcon class="h-4 w-4" />
          <span class="sm:sr-only">사진</span>
        </button>
        <div v-if="showUploadMenu" class="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-border bg-card p-2 shadow-lg" role="menu" aria-label="재료 이미지 추가 방식">
          <button type="button" class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted" role="menuitem" @click="openGalleryPicker">
            <ImageIcon class="h-4 w-4 text-muted-foreground" />
            갤러리에서 선택
          </button>
          <button type="button" class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted" role="menuitem" @click="openCameraPicker">
            <Camera class="h-4 w-4 text-muted-foreground" />
            카메라로 촬영
          </button>
        </div>
      </div>
    </form>

    <div v-if="suggestions.length > 0" class="mt-3 flex flex-wrap gap-2">
      <button
        v-for="ingredient in suggestions"
        :key="ingredient"
        type="button"
        class="rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-sm font-bold text-primary hover:bg-primary/10"
        @click="addIngredient(ingredient)"
      >
        {{ ingredient }}
      </button>
    </div>

    <div v-if="selectedImagePreview" class="mt-4 overflow-hidden rounded-xl border border-border bg-muted/30">
      <div class="flex items-center gap-3 p-3">
        <img :src="selectedImagePreview" :alt="selectedImageName" class="h-16 w-16 rounded-lg object-cover" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-bold">{{ selectedImageName || 'Selected image' }}</p>
          <p class="text-xs text-muted-foreground">이미지 1장이 선택되었습니다.</p>
        </div>
        <button type="button" class="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-background hover:text-destructive" aria-label="선택 이미지 제거" @click="removeSelectedImage">
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div v-if="isAnalyzingImage || imageAnalyzeError || (selectedImagePreview && ingredients.length > 0)" class="mt-3 rounded-xl border border-border bg-background px-3 py-2 text-sm">
      <p v-if="isAnalyzingImage" class="font-semibold text-primary">이미지에서 재료를 찾고 있어요...</p>
      <p v-else-if="imageAnalyzeError" class="font-semibold text-destructive">{{ imageAnalyzeError }}</p>
      <p v-else class="text-muted-foreground">인식된 재료를 확인하고 필요 없는 항목은 X로 제거해주세요.</p>
    </div>

    <div v-if="ingredients.length > 0" class="mt-4">
      <div class="mb-2 flex items-center justify-between gap-3">
        <p class="text-xs font-semibold text-muted-foreground">{{ ingredients.length }}/{{ maxIngredients }}개 선택됨</p>
        <button type="button" class="rounded-md px-2 py-1 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-destructive" @click="clearIngredients">
          모두 삭제
        </button>
      </div>
      <div class="flex flex-wrap gap-2">
        <span v-for="ingredient in ingredients" :key="ingredient" class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
          {{ ingredient }}
          <button class="ml-1 rounded-full p-0.5 hover:bg-primary/20" :aria-label="`${ingredient} 제거`" @click="removeIngredient(ingredient)">
            <X class="h-3 w-3" />
          </button>
        </span>
      </div>
    </div>

    <button
      v-if="showSubmit"
      class="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-black text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      :disabled="ingredients.length === 0"
      @click="$emit('submit')"
    >
      <Sparkles class="h-5 w-5" />
      {{ ingredients.length > 0 ? submitLabel : emptySubmitLabel }}
    </button>

    <div v-if="isCameraOpen" class="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="ingredient-camera-title" @click.self="closeCamera">
      <div class="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div class="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p id="ingredient-camera-title" class="text-base font-bold">카메라로 촬영</p>
            <p class="text-xs text-muted-foreground">재료 사진을 촬영하면 바로 이미지 인식을 시작합니다.</p>
          </div>
          <button type="button" class="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted" aria-label="카메라 닫기" @click="closeCamera">
            <X class="h-5 w-5" />
          </button>
        </div>
        <div class="relative bg-black">
          <video ref="cameraVideoRef" class="aspect-[4/3] max-h-[68vh] w-full object-contain" autoplay muted playsinline />
          <div v-if="isCameraStarting" class="absolute inset-0 grid place-items-center bg-black/50 text-sm font-bold text-white">
            카메라를 여는 중...
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 p-4">
          <button type="button" class="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-background text-sm font-bold hover:bg-muted" @click="closeCamera">취소</button>
          <button type="button" class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60" :disabled="isCameraStarting" @click="captureCameraPhoto">
            <Camera class="h-4 w-4" />
            사진 사용
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { Camera, Image as ImageIcon, Plus, Search, Sparkles, X } from 'lucide-vue-next'
import { searchIngredientsApi, analyzeIngredientImageApi } from '../features/ingredient/api'
import { normalizeIngredient, sanitizeIngredientInput } from '../features/ingredient/input'
import { ApiError } from '../shared/api/error'
import { MAX_INGREDIENTS } from '../shared/constants/ingredients'
import { showToast } from '../toast'

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    eyebrow?: string
    title?: string
    description?: string
    submitLabel?: string
    emptySubmitLabel?: string
    showSubmit?: boolean
    autofocus?: boolean
  }>(),
  {
    eyebrow: '재료로 시작하기',
    title: '가지고 있는 재료를 추가하세요',
    description: '직접 입력하거나 사진으로 재료를 인식해 맞춤 레시피를 추천받을 수 있습니다.',
    submitLabel: '레시피를 찾아볼게요',
    emptySubmitLabel: '재료를 추가해주세요',
    showSubmit: true,
    autofocus: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  submit: []
}>()

const ingredients = computed({
  get: () => props.modelValue,
  set: (value: string[]) => emit('update:modelValue', value),
})

const inputValue = ref('')
const suggestions = ref<string[]>([])
const textInputRef = ref<HTMLInputElement | null>(null)
const showUploadMenu = ref(false)
const galleryImageInput = ref<HTMLInputElement | null>(null)
const cameraVideoRef = ref<HTMLVideoElement | null>(null)
const isCameraOpen = ref(false)
const isCameraStarting = ref(false)
const selectedImageName = ref('')
const selectedImagePreview = ref('')
const isAnalyzingImage = ref(false)
const imageAnalyzeError = ref('')
const maxIngredients = MAX_INGREDIENTS

let suggestionTimer: number | undefined
let cameraStream: MediaStream | null = null

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

const addIngredient = (ingredient: string) => {
  const normalized = normalizeIngredient(ingredient)
  if (!normalized || ingredients.value.includes(normalized) || ingredients.value.length >= MAX_INGREDIENTS) return

  ingredients.value = [...ingredients.value, normalized]
  inputValue.value = ''
  suggestions.value = []
}

const addIngredients = (items: string[]) => {
  items.forEach(addIngredient)
}

const removeIngredient = (ingredient: string) => {
  ingredients.value = ingredients.value.filter((item) => item !== ingredient)
}

const clearIngredients = () => {
  ingredients.value = []
  inputValue.value = ''
  suggestions.value = []
}

const handleIngredientInput = (event: Event) => {
  const input = event.target as HTMLInputElement

  if (event instanceof InputEvent && event.isComposing) {
    inputValue.value = input.value
    return
  }

  const sanitized = sanitizeIngredientInput(input.value)
  if (input.value !== sanitized) input.value = sanitized
  inputValue.value = sanitized
}

const handleIngredientCompositionEnd = (event: Event) => {
  handleIngredientInput(event)
}

const handleIngredientEnter = (event: KeyboardEvent) => {
  if (event.isComposing || event.keyCode === 229) return

  event.preventDefault()
  addIngredient((event.target as HTMLInputElement).value || inputValue.value)
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
  } catch {
    closeCamera()
    showToast({
      type: 'error',
      title: '카메라를 열 수 없어요',
      message: '브라우저 카메라 권한 또는 장치 상태를 확인한 뒤 다시 시도해주세요.',
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

watch(inputValue, (nextValue) => {
  if (suggestionTimer) window.clearTimeout(suggestionTimer)

  const search = normalizeIngredient(nextValue).slice(0, 20)
  if (!search) {
    suggestions.value = []
    return
  }

  suggestionTimer = window.setTimeout(async () => {
    try {
      suggestions.value = (await searchIngredientsApi(search))
        .map(normalizeIngredient)
        .filter((ingredient) => ingredient && !ingredients.value.includes(ingredient))
        .slice(0, 6)
    } catch {
      suggestions.value = []
    }
  }, 250)
})

onMounted(() => {
  if (props.autofocus) {
    window.requestAnimationFrame(() => textInputRef.value?.focus())
  }
})

onUnmounted(() => {
  if (suggestionTimer) window.clearTimeout(suggestionTimer)
  closeCamera()
})
</script>
