<template>
  <div class="page-scrollbar flex min-h-screen flex-col">
    <main class="flex-1 lg:px-8 lg:py-6">
      <div class="sticky top-14 z-30 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-sm lg:top-16 lg:mx-auto lg:max-w-7xl lg:rounded-lg lg:border lg:shadow-sm">
        <div class="flex gap-2">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              v-model="searchQuery"
              placeholder="레시피 검색..."
              class="flex h-10 w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <button class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-muted" aria-label="필터">
            <SlidersHorizontal class="h-4 w-4" />
          </button>
        </div>

        <div class="tag-filter-scroll mt-3 flex gap-2 overflow-x-auto pb-2">
          <button
            :class="[
              'shrink-0 cursor-pointer rounded-full border px-2.5 py-1 text-xs font-bold',
              selectedTags.length === 0 ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:bg-muted',
            ]"
            @click="resetFilters"
          >
            전체
          </button>
          <button
            v-for="tag in tags"
            :key="tag"
            :class="[
              'shrink-0 cursor-pointer rounded-full border px-2.5 py-1 text-xs font-bold',
              selectedTags.includes(tag) ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:bg-muted',
            ]"
            @click="toggleTag(tag)"
          >
            #{{ tag }}
          </button>
        </div>
      </div>

      <div class="flex items-center gap-1 border-b border-border px-4 py-2 lg:mx-auto lg:mt-4 lg:max-w-7xl lg:rounded-lg lg:border lg:bg-card">
        <button :class="sortButtonClass('popular')" @click="sortBy = 'popular'"><TrendingUp class="h-4 w-4" />인기</button>
        <button :class="sortButtonClass('recent')" @click="sortBy = 'recent'"><Clock class="h-4 w-4" />최신</button>
        <button :class="sortButtonClass('likes')" @click="sortBy = 'likes'"><Heart class="h-4 w-4" />좋아요</button>
      </div>

      <div class="mx-auto grid max-w-7xl gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 lg:px-0">
        <RouterLink v-for="recipe in filteredRecipes" :key="recipe.id" :to="`/recipe/${recipe.id}`" class="block h-full">
          <div class="h-full overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md">
            <div class="relative aspect-[16/9]">
              <img :src="recipe.image" :alt="recipe.title" class="h-full w-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div class="absolute bottom-2 right-2 flex items-center gap-1.5 text-[11px] font-medium text-white">
                <span class="flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 backdrop-blur-sm">
                  <Heart class="h-3 w-3" />
                  {{ recipe.likes.toLocaleString() }}
                </span>
                <span class="flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 backdrop-blur-sm">
                  <MessageCircle class="h-3 w-3" />
                  {{ recipe.comments.toLocaleString() }}
                </span>
              </div>
            </div>
            <div class="flex min-h-44 flex-col p-4">
              <div class="flex flex-wrap items-center gap-2">
                <span :class="['rounded-full px-2.5 py-1 text-xs font-medium', difficultyColors[recipe.difficulty]]">
                  {{ difficultyLabels[recipe.difficulty] }}
                </span>
                <span v-for="tag in recipe.tags.slice(0, 1)" :key="tag" class="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">#{{ tag }}</span>
              </div>
              <h3 class="mt-3 line-clamp-1 text-lg font-bold">{{ recipe.title }}</h3>
              <p class="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{{ recipe.description }}</p>
              <div class="mt-auto flex items-center justify-between border-t border-border pt-3 text-sm text-muted-foreground">
                <span class="flex items-center gap-1"><Clock class="h-4 w-4" />{{ recipe.cookTime }}분</span>
                <span class="flex items-center gap-1"><ChefHat class="h-4 w-4" />{{ recipe.servings }}인분</span>
              </div>
            </div>
          </div>
        </RouterLink>

        <div v-if="filteredRecipes.length === 0" class="col-span-full flex min-h-[320px] flex-col items-center justify-center py-12 text-center">
          <p class="text-muted-foreground">검색 결과가 없습니다.</p>
          <button class="inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-bold text-primary hover:underline" @click="resetFilters">검색 초기화</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ChefHat, Clock, Heart, MessageCircle, Search, SlidersHorizontal, TrendingUp } from 'lucide-vue-next'
import { difficultyLabels, popularTags, recipes, type Difficulty } from '../data'

type SortOption = 'popular' | 'recent' | 'likes'

const route = useRoute()
const searchQuery = ref('')
const selectedTags = ref<string[]>(route.query.tag ? [String(route.query.tag)] : [])
const sortBy = ref<SortOption>((route.query.sort as SortOption) || 'popular')
const tags = popularTags

const difficultyColors: Record<Difficulty, string> = {
  easy: 'bg-accent text-accent-foreground',
  medium: 'bg-chart-4/20 text-chart-4',
  hard: 'bg-destructive/20 text-destructive',
}

const toggleTag = (tag: string) => {
  selectedTags.value = selectedTags.value.includes(tag) ? selectedTags.value.filter((item) => item !== tag) : [...selectedTags.value, tag]
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedTags.value = []
}

const sortButtonClass = (sort: SortOption) => [
  'inline-flex h-9 items-center justify-center gap-1 rounded-md px-3 text-sm font-bold transition-colors hover:bg-muted',
  sortBy.value === sort ? 'text-primary' : 'text-foreground',
]

const filteredRecipes = computed(() => {
  return recipes
    .filter((recipe) => {
      const queryMatch =
        !searchQuery.value ||
        recipe.title.includes(searchQuery.value) ||
        recipe.description.includes(searchQuery.value) ||
        recipe.tags.some((tag) => tag.includes(searchQuery.value))
      const tagMatch = selectedTags.value.length === 0 || selectedTags.value.every((tag) => recipe.tags.includes(tag))
      return queryMatch && tagMatch
    })
    .sort((a, b) => {
      if (sortBy.value === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy.value === 'likes') return b.likes - a.likes
      return b.likes + b.saves - (a.likes + a.saves)
    })
})
</script>
