<template>
  <div class="flex min-h-screen flex-col pb-24 lg:pb-0">
    <main class="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        <RecipeCard v-for="recipe in savedRecipes" :key="recipe.id" :recipe="{ ...recipe, isSaved: true }" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import RecipeCard from '../components/RecipeCard.vue'
import { recipes } from '../data'

const savedRecipes = recipes.slice(0, 4)
</script>
