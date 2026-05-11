<template>
  <div class="page-scrollbar flex min-h-screen flex-col">
    <main class="flex-1 pb-24 lg:pb-0">
      <section class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div class="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-stretch">
          <div class="overflow-hidden rounded-lg bg-card shadow-sm ring-1 ring-border lg:min-h-[360px]">
            <div class="relative h-full min-h-[260px]">
              <img
                src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&h=800&fit=crop"
                alt="신선한 재료와 조리 도구가 놓인 주방"
                class="h-full min-h-[260px] w-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5" />
              <div class="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6 lg:p-8">
                <h1 class="max-w-xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">찰칵밥상</h1>
                <p class="mt-3 max-w-xl text-sm leading-6 text-white/85 sm:text-base">
                  냉장고 속 재료를 입력하고 지금 만들 수 있는 레시피를 바로 찾아보세요.
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5 lg:flex lg:flex-col lg:justify-center lg:p-6">
            <div>
              <p class="text-sm font-semibold text-primary">재료로 시작하기</p>
              <h2 class="mt-1 text-xl font-bold">가지고 있는 재료를 추가하세요</h2>
              <p class="mt-2 text-sm leading-6 text-muted-foreground">직접 입력하거나 사진으로 재료를 인식해 맞춤 레시피를 추천받을 수 있습니다.</p>
            </div>

            <div class="mt-5 flex items-center gap-2">
              <input
                v-model="inputValue"
                type="text"
                placeholder="재료 입력 후 Enter"
                class="flex h-12 min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-base outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                @keydown.enter.prevent="addIngredient(inputValue.trim())"
              />
              <div class="relative">
                <button type="button" class="inline-flex h-12 w-12 items-center justify-center rounded-md border border-input bg-background hover:bg-muted" @click="showUploadMenu = !showUploadMenu">
                  <Plus class="h-5 w-5" />
                </button>
                <div v-if="showUploadMenu" class="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-border bg-card p-2 shadow-lg">
                  <button class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted" @click="simulateImageUpload">
                    <Camera class="h-4 w-4 text-muted-foreground" />
                    갤러리에서 선택
                  </button>
                  <button class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted" @click="simulateImageUpload">
                    <Camera class="h-4 w-4 text-muted-foreground" />
                    카메라로 촬영
                  </button>
                </div>
              </div>
            </div>

            <div v-if="ingredients.length > 0" class="mt-4 flex flex-wrap gap-2">
              <span v-for="ingredient in ingredients" :key="ingredient" class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                {{ ingredient }}
                <button class="ml-1 rounded-full p-0.5 hover:bg-primary/20" :aria-label="`${ingredient} 삭제`" @click="ingredients = ingredients.filter((item) => item !== ingredient)">
                  <X class="h-3 w-3" />
                </button>
              </span>
            </div>

            <button
              class="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-bold text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
              :disabled="ingredients.length === 0"
              @click="goRecommendations"
            >
              <Sparkles class="h-5 w-5" />
              {{ ingredients.length > 0 ? `${ingredients.length}개 재료로 추천받기` : '재료를 추가해주세요' }}
            </button>
          </div>
        </div>
      </section>

      <section class="px-4 py-2 sm:px-6 lg:px-8">
        <div class="mx-auto grid max-w-7xl grid-cols-5 gap-2 sm:flex sm:flex-wrap">
          <RouterLink v-for="tag in popularTags" :key="tag" :to="`/feed?tag=${encodeURIComponent(tag)}`" class="min-w-0">
            <span class="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-border bg-background px-2 py-2 text-xs font-bold transition-colors hover:bg-primary hover:text-primary-foreground sm:w-auto sm:px-4 sm:text-sm">
              #{{ tag }}
            </span>
          </RouterLink>
        </div>
      </section>

      <section class="px-4 py-5 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-7xl">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-bold lg:text-xl">오늘의 추천 요리</h2>
            <RouterLink to="/feed" class="inline-flex items-center rounded-md px-3 py-2 text-sm font-bold text-primary hover:bg-muted">
              더보기 <ArrowRight class="ml-1 h-4 w-4" />
            </RouterLink>
          </div>

          <div class="overflow-hidden rounded-lg">
            <div class="flex transition-transform duration-700 ease-out" :style="{ transform: `translateX(-${activeIndex * 100}%)` }">
              <div v-for="(recipe, index) in todayRecipes" :key="recipe.id" class="w-full shrink-0">
                <RouterLink :to="`/recipe/${recipe.id}`">
                  <div class="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-lg lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
                    <div class="relative aspect-[16/9] lg:aspect-auto lg:min-h-[300px]">
                      <img :src="recipe.image" :alt="recipe.title" class="h-full w-full object-cover" :loading="index === 0 ? 'eager' : 'lazy'" />
                    </div>
                    <div class="flex flex-col justify-center p-4 sm:p-5 lg:p-8">
                      <span class="mb-3 w-fit rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
                        {{ difficultyLabels[recipe.difficulty] }}
                      </span>
                      <h3 class="text-2xl font-bold lg:text-3xl">{{ recipe.title }}</h3>
                      <p class="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground lg:text-base">{{ recipe.description }}</p>
                      <div class="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span class="flex items-center gap-1"><Clock class="h-4 w-4" />{{ recipe.cookTime }}분</span>
                        <span class="flex items-center gap-1"><ChefHat class="h-4 w-4" />{{ recipe.servings }}인분</span>
                        <span v-for="tag in recipe.tags.slice(0, 2)" :key="tag" class="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">#{{ tag }}</span>
                      </div>
                    </div>
                  </div>
                </RouterLink>
              </div>
            </div>
          </div>

          <div class="mt-3 flex justify-center gap-2">
            <button
              v-for="(recipe, index) in todayRecipes"
              :key="recipe.id"
              type="button"
              :aria-label="`${index + 1}번째 추천 요리 보기`"
              :class="['h-2 rounded-full transition-all', activeIndex === index ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50']"
              @click="activeIndex = index"
            />
          </div>
        </div>
      </section>

      <section class="px-4 py-5 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-7xl">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <TrendingUp class="h-5 w-5 text-primary" />
              <h2 class="text-lg font-bold lg:text-xl">인기 레시피</h2>
            </div>
            <RouterLink to="/feed?sort=popular" class="inline-flex items-center rounded-md px-3 py-2 text-sm font-bold text-primary hover:bg-muted">
              더보기 <ArrowRight class="ml-1 h-4 w-4" />
            </RouterLink>
          </div>

          <div class="tag-filter-scroll grid auto-cols-[210px] grid-flow-col gap-4 overflow-x-auto pb-2 lg:grid-flow-row lg:grid-cols-4 lg:overflow-visible">
            <RecipeCard v-for="recipe in popularRecipes" :key="recipe.id" :recipe="recipe" variant="compact" />
          </div>
        </div>
      </section>

      <section class="px-4 py-5 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-7xl">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Clock class="h-5 w-5 text-muted-foreground" />
              <h2 class="text-lg font-bold lg:text-xl">최근 올라온 마이 레시피</h2>
            </div>
            <RouterLink to="/feed?source=my&sort=recent" class="inline-flex items-center rounded-md px-3 py-2 text-sm font-bold text-primary hover:bg-muted">
              더보기 <ArrowRight class="ml-1 h-4 w-4" />
            </RouterLink>
          </div>

          <div class="grid gap-4 lg:grid-cols-3">
            <RouterLink v-for="recipe in recentRecipes" :key="recipe.id" :to="`/recipe/${recipe.id}`" class="block h-full">
              <div class="h-full overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md">
                <div class="flex h-full lg:flex-col">
                  <div class="relative h-28 w-28 shrink-0 lg:h-44 lg:w-full">
                    <img :src="recipe.image" :alt="recipe.title" class="h-full w-full object-cover" />
                    <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-2">
                      <div class="flex items-center justify-end gap-1.5 text-[11px] font-medium text-white">
                        <span class="flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 backdrop-blur-sm"><Heart class="h-3 w-3" />{{ recipe.likes.toLocaleString() }}</span>
                        <span class="flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 backdrop-blur-sm"><MessageCircle class="h-3 w-3" />{{ recipe.comments.toLocaleString() }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex min-w-0 flex-1 flex-col p-3 lg:p-4">
                    <div class="min-w-0 flex-1">
                      <div class="mb-2 flex flex-wrap items-center gap-2">
                        <span class="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold text-accent-foreground">{{ difficultyLabels[recipe.difficulty] }}</span>
                        <span v-for="tag in recipe.tags.slice(0, 1)" :key="tag" class="rounded-full border border-border px-2.5 py-1 text-[10px] text-muted-foreground">#{{ tag }}</span>
                      </div>
                      <h3 class="line-clamp-1 font-semibold">{{ recipe.title }}</h3>
                      <p class="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground lg:text-sm">{{ recipe.description }}</p>
                    </div>
                    <div class="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                      <span class="flex items-center gap-1"><Clock class="h-3.5 w-3.5" />{{ recipe.cookTime }}분</span>
                      <span class="flex items-center gap-1"><ChefHat class="h-3.5 w-3.5" />{{ recipe.servings }}인분</span>
                    </div>
                  </div>
                </div>
              </div>
            </RouterLink>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Camera, ChefHat, Clock, Heart, MessageCircle, Plus, Sparkles, TrendingUp, X } from 'lucide-vue-next'
import RecipeCard from '../components/RecipeCard.vue'
import { difficultyLabels, popularTags, recipes } from '../data'

const router = useRouter()
const inputValue = ref('')
const ingredients = ref<string[]>([])
const showUploadMenu = ref(false)
const activeIndex = ref(0)
const todayRecipes = recipes.slice(0, 4)
const popularRecipes = recipes.slice(0, 4)
const recentRecipes = recipes.slice(2, 5)
let timer: number | undefined

const addIngredient = (ingredient: string) => {
  if (!ingredient || ingredients.value.includes(ingredient) || ingredients.value.length >= 10) return
  ingredients.value.push(ingredient)
  inputValue.value = ''
}

const simulateImageUpload = () => {
  ;['양파', '달걀', '감자'].forEach((ingredient) => {
    if (!ingredients.value.includes(ingredient)) ingredients.value.push(ingredient)
  })
  showUploadMenu.value = false
}

const goRecommendations = () => {
  if (ingredients.value.length === 0) return
  router.push(`/recommendations?ingredients=${encodeURIComponent(ingredients.value.join(','))}`)
}

onMounted(() => {
  timer = window.setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % todayRecipes.length
  }, 6000)
})

onUnmounted(() => {
  if (timer) window.clearInterval(timer)
})
</script>
