<template>
  <div class="flex min-h-screen flex-col pb-24 lg:pb-0">
    <main class="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <section class="mx-auto max-w-7xl rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
        <p class="text-sm font-semibold text-primary">AI Ingredient Match</p>
        <div class="mt-2 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <h1 class="text-2xl font-bold lg:text-3xl">가지고 있는 재료로 가능한 요리</h1>
            <p class="mt-2 text-sm leading-6 text-muted-foreground">입력하거나 인식한 재료가 많이 포함된 레시피부터 추천합니다.</p>
          </div>
          <RouterLink to="/ingredients" class="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90">
            재료 사진 업로드
          </RouterLink>
        </div>
        <div v-if="selectedIngredients.length > 0" class="mt-4 flex flex-wrap gap-2">
          <span v-for="ingredient in selectedIngredients" :key="ingredient" class="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
            #{{ ingredient }}
          </span>
        </div>
      </section>

      <section class="mx-auto mt-6 max-w-7xl">
        <h2 class="text-lg font-bold lg:text-xl">지금 만들 수 있어요</h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <RecipeCard v-for="recipe in canMake" :key="recipe.id" :recipe="recipe" />
        </div>
      </section>

      <section class="mx-auto mt-6 max-w-7xl">
        <h2 class="text-lg font-bold lg:text-xl">1~2개만 더 있으면 가능해요</h2>
        <div class="mt-4 grid gap-4 lg:grid-cols-3">
          <div v-for="item in substitutes" :key="item.missing" class="rounded-lg border border-border bg-card p-4 shadow-sm">
            <p class="font-bold">{{ item.missing }} 대신 {{ item.substitute }}</p>
            <p class="mt-2 text-sm leading-6 text-muted-foreground">{{ item.reason }}</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import RecipeCard from '../components/RecipeCard.vue'
import { recipes, substitutes, type Recipe } from '../data'

const route = useRoute()

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '')

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

const getRecipeIngredientText = (recipe: Recipe) =>
  [
    recipe.title,
    recipe.description,
    ...recipe.ingredients.map((ingredient) => `${ingredient.name} ${ingredient.amount || ''}`),
    ...recipe.tags,
  ]
    .map(normalize)
    .join(' ')

const matchScore = (recipe: Recipe) => {
  const recipeText = getRecipeIngredientText(recipe)
  return selectedIngredients.value.reduce((score, ingredient) => {
    const normalizedIngredient = normalize(ingredient)
    return normalizedIngredient && recipeText.includes(normalizedIngredient) ? score + 1 : score
  }, 0)
}

const canMake = computed(() =>
  recipes.value
    .slice()
    .sort((a, b) => {
      const scoreDiff = matchScore(b) - matchScore(a)
      if (scoreDiff !== 0) return scoreDiff
      return b.likes - a.likes
    })
    .slice(0, 6),
)
</script>
