<template>
  <RouterLink :to="`/recipe/${recipe.id}`" class="block h-full">
    <div class="h-full overflow-hidden rounded-lg bg-card text-card-foreground shadow-[0_8px_28px_rgba(24,24,27,0.045)] ring-1 ring-border/70 transition-shadow hover:shadow-[0_14px_36px_rgba(24,24,27,0.08)]">
      <template v-if="variant === 'horizontal'">
        <div class="flex h-full lg:flex-col">
          <div class="relative h-24 w-24 shrink-0 lg:h-40 lg:w-full">
            <img :src="recipe.image" :alt="recipe.title" class="h-full w-full object-cover" :loading="imageLoading || 'eager'" decoding="async" />
            <div v-if="$slots.actions" class="absolute right-2 top-2 flex gap-1.5">
              <slot name="actions" />
            </div>
          </div>
          <div class="flex min-w-0 flex-1 flex-col justify-center p-3 lg:p-4">
            <h3 class="line-clamp-1 font-semibold">{{ recipe.title }}</h3>
            <p class="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground lg:text-sm">{{ recipe.description }}</p>
            <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Clock class="h-3.5 w-3.5" />
              <span>{{ recipe.cookTime }}분</span>
              <span :class="['rounded-full px-2 py-0.5 text-[10px] font-bold', difficultyColors[recipe.difficulty]]">
                {{ difficultyLabels[recipe.difficulty] }}
              </span>
              <RecipeTagChip v-for="tag in recipe.tags.slice(0, 1)" :key="tag" :label="tag" compact />
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="variant === 'compact'">
        <div class="relative aspect-square">
          <img :src="recipe.image" :alt="recipe.title" class="h-full w-full object-cover" :loading="imageLoading || 'eager'" decoding="async" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <div class="absolute bottom-2 left-2 right-2">
            <h3 class="line-clamp-1 text-sm font-semibold text-white lg:text-base">{{ recipe.title }}</h3>
            <div class="mt-1 flex items-center gap-1 text-xs text-white/85">
              <Clock class="h-3 w-3" />
              <span>{{ recipe.cookTime }}분</span>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="relative aspect-[4/3]">
          <img :src="recipe.image" :alt="recipe.title" class="h-full w-full object-cover" :loading="imageLoading || 'eager'" decoding="async" />
          <div class="absolute right-2 top-2 flex gap-1">
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-foreground backdrop-blur-sm hover:bg-white"
              aria-label="좋아요"
              @click.prevent.stop="$emit('like', recipe.id)"
            >
              <Heart :class="['h-4 w-4', recipe.isLiked && 'fill-primary text-primary']" />
            </button>
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-foreground backdrop-blur-sm hover:bg-white"
              :aria-label="recipe.isSaved ? '저장 해제' : '저장'"
              @click.prevent.stop="$emit('save', recipe.id)"
            >
              <Bookmark :class="['h-4 w-4', recipe.isSaved && 'fill-primary text-primary']" />
            </button>
          </div>
          <span :class="['absolute bottom-2 left-2 rounded-full px-2.5 py-1 text-xs font-bold', difficultyColors[recipe.difficulty]]">
            {{ difficultyLabels[recipe.difficulty] }}
          </span>
        </div>
        <div class="p-3">
          <h3 class="line-clamp-1 font-semibold">{{ recipe.title }}</h3>
          <p class="mt-1 line-clamp-2 text-sm text-muted-foreground">{{ recipe.description }}</p>
          <div class="mt-3 grid grid-cols-3 items-center gap-1 text-xs text-muted-foreground sm:text-sm">
            <span class="flex min-w-0 items-center gap-1 whitespace-nowrap">
              <Clock class="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              {{ recipe.cookTime }}분
            </span>
            <span class="flex min-w-0 items-center justify-center gap-1 whitespace-nowrap">
              <ChefHat class="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              {{ recipe.servings }}인분
            </span>
            <span class="flex min-w-0 items-center justify-end gap-1 whitespace-nowrap">
              <Heart class="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              {{ recipe.likes.toLocaleString() }}
            </span>
          </div>
        </div>
      </template>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { Bookmark, ChefHat, Clock, Heart } from 'lucide-vue-next'
import RecipeTagChip from './RecipeTagChip.vue'
import type { Recipe } from '../data'
import { difficultyLabels } from '../data'

defineProps<{
  recipe: Recipe
  variant?: 'default' | 'compact' | 'horizontal'
  imageLoading?: 'eager' | 'lazy'
}>()

defineEmits<{
  like: [id: string]
  save: [id: string]
}>()

const difficultyColors = {
  easy: 'bg-accent text-accent-foreground',
  medium: 'bg-chart-4/20 text-chart-4',
  hard: 'bg-destructive/20 text-destructive',
}
</script>
