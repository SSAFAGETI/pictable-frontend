<template>
  <div class="flex min-h-screen flex-col pb-24 lg:pb-0">
    <AuthRequiredState
      v-if="!isAuthenticated"
      icon="utensils"
      description="로그인하고 나만의 레시피를&#10;등록하고 관리해보세요."
    />
    <main v-else class="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <div v-if="isLoadingRecipe" class="mx-auto flex min-h-[420px] max-w-3xl items-center justify-center rounded-2xl border border-border bg-card text-sm font-semibold text-muted-foreground">
        레시피 정보를 불러오는 중...
      </div>

      <form v-else class="mx-auto max-w-3xl space-y-5 pb-16" @submit.prevent="submitRecipe">
        <section class="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <p class="mb-4 text-base font-bold">메인 이미지</p>
          <input ref="mainImageFileInput" class="hidden" type="file" accept="image/*" @change="handleMainImage" />
          <div class="relative flex h-72 w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/5 sm:h-80">
            <img v-if="mainImagePreview" :src="mainImagePreview" alt="" class="absolute inset-0 h-full w-full object-cover" />
            <span v-if="mainImagePreview" class="absolute inset-0 bg-black/25" />
            <span class="relative grid h-14 w-14 place-items-center rounded-2xl bg-card/90 text-muted-foreground shadow-sm">
              <Camera class="h-8 w-8" />
            </span>
            <span class="relative mt-3 text-sm font-semibold">{{ mainImagePreview ? '이미지 변경하기' : '메인 이미지를 추가해주세요' }}</span>
            <div class="relative mt-4 grid w-full max-w-sm grid-cols-2 gap-2 px-4">
              <button type="button" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card/95 px-3 text-sm font-bold text-foreground shadow-sm hover:border-primary/60 hover:text-primary" @click="mainImageFileInput?.click()">
                <ImageIcon class="h-4 w-4" />
                파일 선택
              </button>
              <button type="button" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90" @click="openCamera('main')">
                <Camera class="h-4 w-4" />
                카메라 촬영
              </button>
            </div>
          </div>
        </section>

        <section class="space-y-5 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <h1 class="text-xl font-bold">기본 정보</h1>
          <label class="grid gap-2 text-sm font-semibold">
            레시피 제목
            <input v-model="title" class="h-11 rounded-xl border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="예: 초간단 계란 볶음밥" />
          </label>
          <label class="grid gap-2 text-sm font-semibold">
            소개
            <textarea v-model="description" class="min-h-20 rounded-xl border border-input bg-background p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="레시피에 대한 간단한 소개를 작성해주세요." />
          </label>
          <div class="grid gap-2 text-sm font-semibold">
            <span>태그</span>
            <RecipeTagSelector v-model="selectedTagIds" wrap />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <label class="grid gap-2 text-sm font-semibold">
              <span class="inline-flex items-center gap-1.5"><Clock class="h-4 w-4" />시간</span>
              <select v-model.number="cookTime" class="h-11 min-w-0 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option :value="0">선택</option>
                <option v-for="time in timeOptions" :key="time" :value="time">{{ time }}분</option>
              </select>
            </label>
            <label class="grid gap-2 text-sm font-semibold">
              <span class="inline-flex items-center gap-1.5"><Users class="h-4 w-4" />인분</span>
              <select v-model.number="servings" class="h-11 min-w-0 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option :value="0">선택</option>
                <option v-for="count in servingOptions" :key="count" :value="count">{{ count }}인분</option>
              </select>
            </label>
          </div>
        </section>

        <section class="space-y-5 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold">재료</h2>
            <button type="button" class="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold hover:bg-muted" @click="addIngredient">
              <Plus class="h-4 w-4" />
              추가
            </button>
          </div>
          <div class="space-y-3">
            <div v-for="(item, index) in ingredients" :key="item.id" class="grid grid-cols-[1.25rem_minmax(0,1fr)_6rem_2rem] items-center gap-3">
              <span class="text-center text-sm font-medium text-muted-foreground">{{ index + 1 }}</span>
              <input v-model="item.name" maxlength="20" class="h-11 min-w-0 rounded-xl border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="재료명" />
              <input v-model="item.amount" class="h-11 min-w-0 rounded-xl border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="양" />
              <button type="button" class="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive" aria-label="재료 삭제" @click="removeIngredient(index)">
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section class="space-y-5 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold">조리 순서</h2>
            <button type="button" class="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold hover:bg-muted" @click="addStep">
              <Plus class="h-4 w-4" />
              추가
            </button>
          </div>
          <div class="space-y-4">
            <div v-for="(step, index) in steps" :key="step.id" class="rounded-xl border border-border bg-background p-3">
              <div class="mb-3 flex items-center justify-between">
                <p class="text-sm font-bold text-primary">Step {{ index + 1 }}</p>
                <button type="button" class="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive" aria-label="조리 순서 삭제" @click="removeStep(index)">
                  <X class="h-4 w-4" />
                </button>
              </div>
              <textarea v-model="step.text" class="min-h-20 w-full rounded-xl border border-input bg-card p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="조리 방법을 작성해주세요." />
              <div class="mt-3 grid grid-cols-2 gap-2">
                <label class="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/5 hover:text-primary">
                  <ImageIcon class="h-4 w-4" />
                  파일 선택
                  <input class="hidden" type="file" accept="image/*" @change="handleStepImage(index, $event)" />
                </label>
                <button type="button" class="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground" @click="openCamera('step', index)">
                  <Camera class="h-4 w-4" />
                  카메라 촬영

                </button>
              </div>
              <img v-if="step.image" :src="step.image" alt="" class="mt-3 h-32 w-full rounded-xl object-cover" />
            </div>
          </div>
        </section>

        <button
          type="submit"
          class="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? '저장 중...' : isEditMode ? '수정 저장하기' : '레시피 등록하기' }}
        </button>
      </form>
    </main>
    <div v-if="isCameraOpen" class="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center" @click.self="closeCamera">
      <div class="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div class="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p class="text-base font-bold">카메라 촬영</p>
            <p class="text-xs text-muted-foreground">사진을 촬영하면 현재 이미지 영역에 바로 적용됩니다.</p>
          </div>
          <button type="button" class="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted" aria-label="카메라 닫기" @click="closeCamera">
            <X class="h-5 w-5" />
          </button>
        </div>
        <div class="bg-black">
          <video ref="cameraVideoRef" class="aspect-[4/3] max-h-[68vh] w-full object-contain" autoplay muted playsinline />
        </div>
        <div class="grid grid-cols-2 gap-2 p-4">
          <button type="button" class="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-background text-sm font-bold hover:bg-muted" @click="closeCamera">취소</button>
          <button type="button" class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90" @click="captureCameraPhoto">
            <Camera class="h-4 w-4" />
            사진 사용하기
          </button>
        </div>
      </div>
    </div>
    <div v-if="isLeaveConfirmOpen" class="fixed inset-0 z-[90] flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="recipe-leave-title">
      <div class="w-full max-w-sm rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-2xl">
        <h2 id="recipe-leave-title" class="text-lg font-bold">작성한 레시피를 잃을 수 있어요!</h2>
        <p class="mt-2 text-sm leading-6 text-muted-foreground">저장하지 않고 나가면 지금 작성한 내용이 사라집니다. 정말 나갈까요?</p>
        <div class="mt-5 grid grid-cols-2 gap-2">
          <button type="button" class="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background text-sm font-bold hover:bg-muted" @click="cancelLeave">
            계속 작성
          </button>
          <button type="button" class="inline-flex h-11 items-center justify-center rounded-xl bg-destructive text-sm font-bold text-destructive-foreground hover:bg-destructive/90" @click="confirmLeave">
            나가기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Camera, Clock, Image as ImageIcon, Plus, Trash2, Users, X } from 'lucide-vue-next'
import { onMounted, onUnmounted, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import AuthRequiredState from '../components/AuthRequiredState.vue'
import RecipeTagSelector from '../components/RecipeTagSelector.vue'
import { useRecipeEditor } from '../features/recipe/composables/useRecipeEditor'

const {
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
} = useRecipeEditor()

const router = useRouter()
const isLeaveConfirmOpen = ref(false)
const pendingLeavePath = ref('')

const shouldBlockLeave = () => isAuthenticated.value && hasUnsavedChanges.value && !isSubmitComplete.value

const cancelLeave = () => {
  pendingLeavePath.value = ''
  isLeaveConfirmOpen.value = false
}

const confirmLeave = () => {
  const nextPath = pendingLeavePath.value
  isSubmitComplete.value = true
  isLeaveConfirmOpen.value = false
  pendingLeavePath.value = ''
  if (nextPath) void router.push(nextPath)
}

onBeforeRouteLeave((to) => {
  if (!shouldBlockLeave()) return true
  pendingLeavePath.value = to.fullPath
  isLeaveConfirmOpen.value = true
  return false
})

const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!shouldBlockLeave()) return
  event.preventDefault()
  event.returnValue = ''
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>
