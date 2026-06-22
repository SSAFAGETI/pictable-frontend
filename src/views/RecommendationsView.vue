<template>
  <div class="flex min-h-screen flex-col pb-24 lg:pb-0">
    <main class="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <section class="mx-auto max-w-7xl rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
        <p class="text-sm font-semibold text-primary">Ingredient Match</p>
        <div class="mt-2 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <h1 class="text-2xl font-bold lg:text-3xl">가진 재료로 만들 수 있는 요리</h1>
            <p class="mt-2 text-sm leading-6 text-muted-foreground">
              입력한 재료가 많이 포함된 레시피부터 추천해드려요.
            </p>
          </div>
          <RouterLink
            :to="APP_ROUTES.ingredients"
            class="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90"
          >
            재료 다시 고르기
          </RouterLink>
        </div>

        <div v-if="selectedIngredients.length > 0" class="mt-4 flex flex-wrap gap-2">
          <span
            v-for="ingredient in selectedIngredients"
            :key="ingredient"
            class="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary"
          >
            #{{ ingredient }}
          </span>
        </div>

        <div class="mt-5 grid gap-3 sm:grid-cols-3">
          <div class="rounded-lg border border-border bg-background p-4">
            <p class="text-xs font-semibold text-muted-foreground">입력 재료</p>
            <p class="mt-1 text-2xl font-black">{{ selectedIngredients.length }}</p>
          </div>
          <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            <p class="text-xs font-semibold">바로 가능</p>
            <p class="mt-1 text-2xl font-black">{{ canMake.length }}</p>
          </div>
          <div class="rounded-lg border border-orange-200 bg-orange-50 p-4 text-orange-900">
            <p class="text-xs font-semibold">조금만 더</p>
            <p class="mt-1 text-2xl font-black">{{ almost.length }}</p>
          </div>
        </div>
      </section>

      <section v-if="isLoading" class="mx-auto mt-6 max-w-7xl">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="index in 6" :key="index" class="h-80 animate-pulse rounded-lg bg-muted" />
        </div>
      </section>

      <section v-else-if="errorMessage" class="mx-auto mt-6 max-w-7xl rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm font-semibold text-destructive">
        {{ errorMessage }}
      </section>

      <template v-else>
        <section class="mx-auto mt-6 max-w-7xl">
          <div class="flex items-end justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold lg:text-xl">지금 바로 만들 수 있어요</h2>
              <p class="mt-1 text-sm text-muted-foreground">부족한 재료 없이 시작할 수 있는 레시피입니다.</p>
            </div>
            <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">{{ canMake.length }}개</span>
          </div>

          <div v-if="canMake.length > 0" class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <RecommendationCard
              v-for="recipe in canMake"
              :key="recipe.id"
              :recipe="recipe"
              :input-ingredients="selectedIngredients"
              tone="ready"
            />
          </div>
          <EmptyRecommendation v-else message="아직 바로 만들 수 있는 레시피가 없어요. 아래 추천에서 부족한 재료를 확인해보세요." />
        </section>

        <section class="mx-auto mt-8 max-w-7xl">
          <div class="flex items-end justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold lg:text-xl">조금만 더 있으면 가능해요</h2>
              <p class="mt-1 text-sm text-muted-foreground">부족한 재료가 적은 순서로 정리했어요.</p>
            </div>
            <span class="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">{{ almost.length }}개</span>
          </div>

          <div v-if="almost.length > 0" class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <RecommendationCard
              v-for="recipe in almost"
              :key="recipe.id"
              :recipe="recipe"
              :input-ingredients="selectedIngredients"
              tone="almost"
            />
          </div>
          <EmptyRecommendation v-else message="부족한 재료가 적은 추천 결과가 아직 없어요." />
        </section>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ChefHat, Clock, Heart, Plus } from 'lucide-vue-next'
import { fetchRecipeRecommendationsApi } from '../features/recipe/api'
import type { RecipeRecommendation } from '../features/recipe/types'
import { APP_ROUTES, recipeDetailPath } from '../shared/constants/routes'

const route = useRoute()
const isLoading = ref(false)
const errorMessage = ref('')
const canMake = ref<RecipeRecommendation[]>([])
const almost = ref<RecipeRecommendation[]>([])

const selectedIngredients = computed(() => {
  const raw = Array.isArray(route.query.ingredients) ? route.query.ingredients.join(',') : String(route.query.ingredients || '')
  return Array.from(
    new Set(
      raw
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  )
})

const loadRecommendations = async () => {
  if (selectedIngredients.value.length === 0) {
    canMake.value = []
    almost.value = []
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await fetchRecipeRecommendationsApi(selectedIngredients.value)
    canMake.value = result.canMake
    almost.value = result.almost
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '추천 레시피를 불러오지 못했어요. 잠시 후 다시 시도해주세요.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadRecommendations)
watch(() => route.query.ingredients, loadRecommendations)

const formatPercent = (value?: number) => `${Math.round(Math.max(0, Math.min(1, value || 0)) * 100)}%`

const getMatchedIngredients = (recipe: RecipeRecommendation, inputIngredients: string[]) => {
  if (recipe.matchedIngredients.length > 0) return recipe.matchedIngredients
  const missing = new Set(recipe.missingIngredients.map((item) => item.replace(/\s+/g, '').toLowerCase()))
  return inputIngredients.filter((item) => !missing.has(item.replace(/\s+/g, '').toLowerCase()))
}

const EmptyRecommendation = defineComponent({
  props: {
    message: { type: String, required: true },
  },
  setup(props) {
    return () =>
      h('div', { class: 'mt-4 rounded-lg border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground' }, props.message)
  },
})

const RecommendationCard = defineComponent({
  props: {
    recipe: { type: Object as () => RecipeRecommendation, required: true },
    inputIngredients: { type: Array as () => string[], required: true },
    tone: { type: String as () => 'ready' | 'almost', required: true },
  },
  setup(props) {
    return () => {
      const recipe = props.recipe
      const matchedIngredients = getMatchedIngredients(recipe, props.inputIngredients)
      const percent = formatPercent(recipe.matchRate)
      const isReady = props.tone === 'ready'

      return h(
        RouterLink,
        {
          to: recipeDetailPath(recipe.id),
          class:
            'group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
        },
        {
          default: () => [
            h('div', { class: 'relative aspect-[4/3] overflow-hidden bg-muted' }, [
              h('img', {
                src: recipe.image,
                alt: recipe.title,
                class: 'h-full w-full object-cover transition duration-300 group-hover:scale-105',
              }),
              h('div', { class: 'absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent' }),
              h(
                'span',
                {
                  class: [
                    'absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-black text-white shadow',
                    isReady ? 'bg-emerald-500' : 'bg-primary',
                  ],
                },
                isReady ? '바로 가능' : `부족 ${recipe.missingIngredients.length}개`,
              ),
              h('div', { class: 'absolute bottom-3 left-3 right-3' }, [
                h('div', { class: 'flex items-center justify-between text-xs font-bold text-white' }, [
                  h('span', '재료 일치도'),
                  h('span', percent),
                ]),
                h('div', { class: 'mt-1 h-2 overflow-hidden rounded-full bg-white/30' }, [
                  h('div', {
                    class: isReady ? 'h-full rounded-full bg-emerald-400' : 'h-full rounded-full bg-primary',
                    style: { width: percent },
                  }),
                ]),
              ]),
            ]),
            h('div', { class: 'flex flex-1 flex-col p-4' }, [
              h('h3', { class: 'line-clamp-1 text-lg font-black' }, recipe.title),
              h('p', { class: 'mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground' }, recipe.description),
              h('div', { class: 'mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground' }, [
                h('span', { class: 'inline-flex items-center gap-1' }, [h(Clock, { class: 'h-3.5 w-3.5' }), `${recipe.cookTime}분`]),
                h('span', { class: 'inline-flex items-center gap-1' }, [h(ChefHat, { class: 'h-3.5 w-3.5' }), `${recipe.servings}인분`]),
                h('span', { class: 'inline-flex items-center gap-1' }, [h(Heart, { class: 'h-3.5 w-3.5' }), recipe.likes.toLocaleString()]),
              ]),
              h('div', { class: 'mt-4 space-y-3 border-t border-border pt-3' }, [
                h('div', [
                  h('p', { class: 'text-xs font-bold text-emerald-700' }, `있는 재료 ${matchedIngredients.length}개`),
                  h(
                    'div',
                    { class: 'mt-2 flex flex-wrap gap-1.5' },
                    matchedIngredients.length
                      ? matchedIngredients.slice(0, 6).map((item) =>
                          h('span', { class: 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700' }, item),
                        )
                      : [h('span', { class: 'text-xs text-muted-foreground' }, '일치 재료를 계산 중이에요.')],
                  ),
                ]),
                h('div', [
                  h('p', { class: 'text-xs font-bold text-orange-700' }, `부족한 재료 ${recipe.missingIngredients.length}개`),
                  h(
                    'div',
                    { class: 'mt-2 flex flex-wrap gap-1.5' },
                    recipe.missingIngredients.length
                      ? recipe.missingIngredients.slice(0, 6).map((item) =>
                          h('span', { class: 'inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700' }, [
                            h(Plus, { class: 'h-3 w-3' }),
                            item,
                          ]),
                        )
                      : [h('span', { class: 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700' }, '부족한 재료 없음')],
                  ),
                ]),
              ]),
            ]),
          ],
        },
      )
    }
  },
})
</script>
