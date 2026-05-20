<template>
  <div class="flex min-h-screen flex-col pb-24 lg:pb-0">
    <AuthRequiredState
      v-if="!isAuthenticated"
      icon="bookmark"
      description="로그인하고 저장한 레시피를&#10;언제든 다시 확인해보세요."
    />
    <main v-else class="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        <RecipeCard v-for="recipe in savedRecipes" :key="recipe.id" :recipe="{ ...recipe, isSaved: true }" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import AuthRequiredState from '../components/AuthRequiredState.vue'
import RecipeCard from '../components/RecipeCard.vue'
import { fetchSavedRecipesApi } from '../api'
import { useAuth } from '../auth'
import type { Recipe } from '../data'

const { isAuthenticated } = useAuth()
const savedRecipes = ref<Recipe[]>([])

const loadSavedRecipes = async () => {
  if (!isAuthenticated.value) {
    savedRecipes.value = []
    return
  }

  try {
    savedRecipes.value = await fetchSavedRecipesApi()
  } catch {
    savedRecipes.value = []
  }
}

watch(isAuthenticated, () => void loadSavedRecipes(), { immediate: true })
</script>
