<template>
  <div class="flex min-h-screen flex-col pb-24 lg:pb-0">
    <AuthRequiredState
      v-if="!isAuthenticated"
      icon="bookmark"
      description="로그인하고 저장한 레시피를&#10;언제든 다시 확인해보세요."
    />
    <main v-else class="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        <RecipeCard
          v-for="recipe in savedRecipes"
          :key="recipe.id"
          :recipe="{ ...recipe, isSaved: true }"
          @save="removeSavedRecipe"
        />
        <div ref="sentinelRef" class="col-span-full flex h-16 items-center justify-center text-sm text-muted-foreground">
          <span v-if="isLoadingPage">저장한 레시피를 더 불러오는 중...</span>
          <span v-else-if="hasNextPage">스크롤하면 더 불러와요</span>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import AuthRequiredState from '../components/AuthRequiredState.vue'
import RecipeCard from '../components/RecipeCard.vue'
import { ApiError, fetchSavedRecipesPageApi, RECIPE_PAGE_SIZE, toggleSaveApi } from '../api'
import { useAuth } from '../auth'
import type { Recipe } from '../data'
import { showToast } from '../toast'

const { isAuthenticated } = useAuth()
const savedRecipes = ref<Recipe[]>([])
const nextCursor = ref<string | null>(null)
const hasNextPage = ref(true)
const isLoadingPage = ref(false)
const removingRecipeIds = ref(new Set<string>())
const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const mergeRecipes = (current: Recipe[], next: Recipe[]) => {
  const seen = new Set(current.map((recipe) => recipe.id))
  return [...current, ...next.filter((recipe) => !seen.has(recipe.id))]
}

const loadSavedRecipes = async (reset = false) => {
  if (!isAuthenticated.value) {
    savedRecipes.value = []
    nextCursor.value = null
    hasNextPage.value = false
    return
  }
  if (isLoadingPage.value) return
  if (!reset && !hasNextPage.value) return

  if (reset) {
    savedRecipes.value = []
    nextCursor.value = null
    hasNextPage.value = true
  }

  isLoadingPage.value = true
  try {
    const result = await fetchSavedRecipesPageApi({ cursor: nextCursor.value, pageSize: RECIPE_PAGE_SIZE })
    const previousLength = savedRecipes.value.length
    savedRecipes.value = reset ? result.items : mergeRecipes(savedRecipes.value, result.items)
    const addedCount = savedRecipes.value.length - previousLength
    nextCursor.value = result.nextCursor
    hasNextPage.value = result.hasNext && Boolean(result.nextCursor) && (reset ? result.items.length > 0 : addedCount > 0)
  } catch {
    if (reset) savedRecipes.value = []
    hasNextPage.value = false
  } finally {
    isLoadingPage.value = false
  }
}

const setupObserver = () => {
  observer?.disconnect()
  if (!sentinelRef.value) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void loadSavedRecipes(false)
    },
    { rootMargin: '480px 0px' },
  )
  observer.observe(sentinelRef.value)
}

const removeSavedRecipe = async (id: string) => {
  if (removingRecipeIds.value.has(id)) return

  const previousRecipes = savedRecipes.value
  removingRecipeIds.value = new Set(removingRecipeIds.value).add(id)
  savedRecipes.value = savedRecipes.value.filter((recipe) => recipe.id !== id)

  try {
    await toggleSaveApi(id)
    showToast({
      type: 'success',
      title: '저장을 해제했어요',
      message: '저장 탭에서 제거됐어요.',
    })
  } catch (error) {
    savedRecipes.value = previousRecipes
    showToast({
      type: 'error',
      title: '저장 해제 실패',
      message: error instanceof ApiError && error.status < 500 ? error.message : '지금은 저장 상태를 바꿀 수 없어요. 잠시 후 다시 시도해주세요.',
    })
  } finally {
    const nextIds = new Set(removingRecipeIds.value)
    nextIds.delete(id)
    removingRecipeIds.value = nextIds
  }
}

onMounted(setupObserver)
onUnmounted(() => observer?.disconnect())
watch(sentinelRef, setupObserver)
watch(isAuthenticated, () => void loadSavedRecipes(true), { immediate: true })
</script>
