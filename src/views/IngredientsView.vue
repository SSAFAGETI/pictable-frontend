<template>
  <div class="flex min-h-screen flex-col pb-24 lg:pb-0">
    <main class="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <section class="w-full max-w-[560px] rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <IngredientPicker
          v-model="ingredients"
          eyebrow="Fridge"
          title="냉장고 재료 입력"
          description="재료를 검색하거나 직접 입력해서 추천 받을 재료 목록을 만들어보세요."
          submit-label="추천 레시피 찾기"
          @submit="goRecommendations"
        />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import IngredientPicker from '../components/IngredientPicker.vue'
import { recommendationsPath } from '../shared/constants/routes'

const router = useRouter()
const ingredients = ref<string[]>([])

const goRecommendations = () => {
  if (ingredients.value.length === 0) return
  router.push(recommendationsPath(ingredients.value))
}
</script>
