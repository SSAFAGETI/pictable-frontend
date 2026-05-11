<template>
  <div class="flex min-h-screen flex-col pb-24 lg:pb-0">
    <main class="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <section class="w-full max-w-[520px] rounded-lg border border-border bg-card p-6 shadow-sm">
        <p class="text-sm font-semibold text-primary">Fridge</p>
        <h1 class="mt-1 text-2xl font-bold">냉장고 재료 입력</h1>
        <p class="mt-2 text-sm leading-6 text-muted-foreground">재료명은 20자까지 입력할 수 있어요.</p>
        <label class="mt-5 grid gap-2 text-sm font-semibold">
          재료 검색
          <div class="relative">
            <input v-model="value" maxlength="20" class="h-11 w-full rounded-md border border-input bg-background px-3 pr-14 outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="계란, 김치, 대파..." />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{{ value.length }}/20</span>
          </div>
        </label>
        <RouterLink to="/recommendations" class="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90">
          추천 레시피 찾기
        </RouterLink>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref('')
</script>
