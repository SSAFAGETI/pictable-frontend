<template>
  <main :class="['flex flex-1 items-center justify-center px-4 py-12 pb-28 sm:px-6 lg:px-8 lg:py-16 lg:pb-16', className]">
    <section class="flex h-[380px] w-full max-w-[420px] flex-col rounded-lg border border-border bg-card px-5 py-9 text-center shadow-sm sm:h-[408px] sm:px-8 sm:py-11">
      <div class="mx-auto flex aspect-square h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-[72px] sm:w-[72px]">
        <component :is="iconComponent" class="h-8 w-8 sm:h-9 sm:w-9" />
      </div>
      <h2 class="mt-5 text-xl font-bold text-foreground sm:text-2xl">{{ title }}</h2>
      <p class="mx-auto mt-2 max-w-[300px] whitespace-pre-line text-sm leading-6 text-muted-foreground sm:text-base">{{ description }}</p>
      <div class="mt-auto grid gap-3 pt-7">
        <RouterLink to="/login" class="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-base font-bold text-primary-foreground shadow hover:bg-primary/90">
          로그인하러 가기
        </RouterLink>
        <RouterLink to="/signup" class="inline-flex h-11 w-full items-center justify-center rounded-lg border border-input bg-background px-4 text-base font-bold shadow-sm hover:bg-muted">
          회원가입
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bookmark, ChefHat, LockKeyhole, Utensils } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    title?: string
    description: string
    icon?: 'chef' | 'bookmark' | 'lock' | 'utensils'
    className?: string
  }>(),
  {
    title: '로그인이 필요합니다',
    icon: 'lock',
    className: '',
  }
)

const icons = {
  chef: ChefHat,
  bookmark: Bookmark,
  lock: LockKeyhole,
  utensils: Utensils,
}

const iconComponent = computed(() => icons[props.icon])
</script>
