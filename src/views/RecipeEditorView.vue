<template>
  <div class="flex min-h-screen flex-col pb-24 lg:pb-0">
    <main class="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <form class="mx-auto max-w-3xl space-y-5 pb-12">
        <section class="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">
          <p class="text-sm font-semibold text-primary">마이 레시피</p>
          <h1 class="mt-1 text-2xl font-bold">레시피 등록</h1>
          <p class="mt-2 text-sm leading-6 text-muted-foreground">내가 만든 레시피는 최근 올라온 마이 레시피에 바로 반영됩니다.</p>
        </section>

        <section class="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">
          <label class="grid gap-2 text-sm font-semibold">
            레시피 이름
            <input class="h-11 rounded-md border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="예: 냉털 계란 덮밥" />
          </label>
          <label class="grid gap-2 text-sm font-semibold">
            설명
            <textarea class="min-h-24 rounded-md border border-input bg-background p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="레시피를 짧게 소개해주세요" />
          </label>
          <label class="grid gap-2 text-sm font-semibold">
            대표 이미지 URL
            <input class="h-11 rounded-md border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="https://..." />
          </label>
        </section>

        <section class="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">
          <div class="flex items-center justify-between">
            <h2 class="font-bold">재료</h2>
            <span class="text-xs text-muted-foreground">{{ ingredient.length }}/20</span>
          </div>
          <div class="flex gap-2">
            <input v-model="ingredient" maxlength="20" class="h-11 min-w-0 flex-1 rounded-md border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="재료 입력 후 Enter" @keydown.enter.prevent="addIngredient" />
            <button type="button" class="inline-flex h-11 w-11 items-center justify-center rounded-md border border-input bg-background hover:bg-muted" @click="addIngredient">
              <Plus class="h-5 w-5" />
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <span v-for="item in ingredients" :key="item" class="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">{{ item }}</span>
          </div>
        </section>

        <section class="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">
          <h2 class="font-bold">조리법</h2>
          <div v-for="(step, index) in steps" :key="index" class="flex gap-3">
            <span class="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{{ index + 1 }}</span>
            <textarea v-model="steps[index]" class="min-h-20 flex-1 rounded-md border border-input bg-background p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="조리 단계를 입력해주세요" />
          </div>
          <button type="button" class="inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background text-sm font-bold hover:bg-muted" @click="steps.push('')">단계 추가</button>
        </section>

        <button type="button" class="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground shadow hover:bg-primary/90">
          등록하기
        </button>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from 'lucide-vue-next'

const ingredient = ref('')
const ingredients = ref<string[]>(['계란', '밥'])
const steps = ref([''])

const addIngredient = () => {
  const value = ingredient.value.trim()
  if (!value) return
  ingredients.value.push(value)
  ingredient.value = ''
}
</script>
