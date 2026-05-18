<template>
  <div class="flex min-h-screen flex-col pb-24 lg:pb-0">
    <AuthRequiredState
      v-if="!isAuthenticated"
      icon="utensils"
      description="로그인하고 나만의 레시피를&#10;등록하고 관리해보세요."
    />
    <main v-else class="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <form class="mx-auto max-w-3xl space-y-5 pb-16" @submit.prevent="submitRecipe">
        <section class="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <p class="mb-4 text-base font-bold">메인 이미지</p>
          <input ref="mainImageInput" class="hidden" type="file" accept="image/*" @change="handleMainImage" />
          <button
            type="button"
            class="relative flex h-72 w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/5 sm:h-80"
            @click="mainImageInput?.click()"
          >
            <img v-if="mainImagePreview" :src="mainImagePreview" alt="" class="absolute inset-0 h-full w-full object-cover" />
            <span v-if="mainImagePreview" class="absolute inset-0 bg-black/25" />
            <span class="relative grid h-14 w-14 place-items-center rounded-2xl bg-card/90 text-muted-foreground shadow-sm">
              <Camera class="h-8 w-8" />
            </span>
            <span class="relative mt-3 text-sm font-semibold">{{ mainImagePreview ? '이미지 변경하기' : '클릭해서 이미지를 업로드' }}</span>
          </button>
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
              <label class="mt-3 flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/5 hover:text-primary">
                <ImageIcon class="h-4 w-4" />
                사진 추가
                <input class="hidden" type="file" accept="image/*" @change="handleStepImage(index, $event)" />
              </label>
              <img v-if="step.image" :src="step.image" alt="" class="mt-3 h-32 w-full rounded-xl object-cover" />
            </div>
          </div>
        </section>

        <button type="submit" class="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90">
          레시피 등록하기
        </button>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Camera, Clock, Image as ImageIcon, Plus, Trash2, Users, X } from 'lucide-vue-next'
import AuthRequiredState from '../components/AuthRequiredState.vue'
import RecipeTagSelector from '../components/RecipeTagSelector.vue'
import { createRecipeApi, type RecipeCreatePayload } from '../api'
import { useAuth } from '../auth'
import { recipes, type Ingredient, type Recipe } from '../data'
import { getRecipeTagNamesByIds } from '../tags'

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

const router = useRouter()
const { user, isAuthenticated } = useAuth()
const mainImageInput = ref<HTMLInputElement | null>(null)
const mainImagePreview = ref('')
const title = ref('')
const description = ref('')
const selectedTagIds = ref<number[]>([])
const cookTime = ref(0)
const servings = ref(0)
const ingredients = ref<EditableIngredient[]>([{ id: crypto.randomUUID(), name: '', amount: '' }])
const steps = ref<EditableStep[]>([{ id: crypto.randomUUID(), text: '', image: '' }])

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
  } catch {
    recipes.value.unshift(localRecipe)
  }

  router.push('/feed?source=my&sort=recent')
}
</script>
