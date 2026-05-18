<template>
  <header class="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm lg:hidden">
    <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-16 lg:px-8">
      <div class="flex min-w-0 items-center gap-2">
        <button
          v-if="showBack"
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
          aria-label="뒤로가기"
          @click="router.back()"
        >
          <ChevronLeft class="h-5 w-5" />
        </button>
        <h1 v-if="pageTitle" class="truncate text-lg font-semibold lg:text-xl">{{ pageTitle }}</h1>
        <RouterLink v-else to="/" class="flex items-center gap-2 lg:hidden">
          <div class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ChefHat class="h-4 w-4" />
          </div>
          <span class="text-xl font-bold text-foreground">찰칵밥상</span>
        </RouterLink>
        <RouterLink to="/" class="hidden items-center gap-3 lg:flex">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ChefHat class="h-5 w-5" />
          </div>
          <div>
            <p class="text-base font-extrabold leading-none">찰칵밥상</p>
            <p class="mt-1 text-xs text-muted-foreground">재료 기반 레시피 앱</p>
          </div>
        </RouterLink>
      </div>

      <nav class="hidden items-center gap-1 lg:flex">
        <RouterLink
          v-for="item in navItems"
          :key="item.href"
          :to="item.href"
          :class="[
            'rounded-lg px-4 py-2 text-sm font-bold transition-colors',
            isActive(item.href) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          ]"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="relative">
        <button
          type="button"
          :class="[
            'relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted',
            unreadCount > 0 && 'bg-primary/10 text-primary hover:bg-primary/15',
          ]"
          aria-label="알림"
          @click="open = !open"
        >
          <Bell class="h-5 w-5" />
          <template v-if="unreadCount > 0">
            <span class="absolute -right-2 -top-2 h-5 min-w-5 animate-ping rounded-full bg-red-500 opacity-70" />
            <span class="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-md shadow-red-500/30">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </template>
        </button>
        <div
          v-if="open"
          class="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-[420px] overflow-hidden rounded-lg border border-border bg-card p-0 shadow-lg sm:w-[420px]"
        >
          <div class="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p class="text-base font-semibold">알림</p>
              <p class="mt-0.5 text-sm text-muted-foreground">읽지 않은 알림 {{ unreadCount }}개</p>
            </div>
            <button type="button" class="rounded-md px-3 py-2 text-sm font-bold text-muted-foreground hover:bg-muted" @click="open = false">닫기</button>
          </div>
          <div class="max-h-[70vh] overflow-y-auto">
            <RouterLink v-for="notification in notifications" :key="notification.id" to="/mypage" class="block border-b border-border px-5 py-4 last:border-b-0 hover:bg-muted/60">
              <div class="flex items-start gap-3">
                <span class="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500 shadow-sm shadow-red-500/40" />
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold leading-5 sm:text-base">{{ notification.title }}</p>
                  <p class="mt-1.5 text-sm leading-6 text-muted-foreground">{{ notification.message }}</p>
                  <p class="mt-2 text-xs text-muted-foreground">방금 전</p>
                </div>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell, ChefHat, ChevronLeft } from 'lucide-vue-next'
import { notifications } from '../data'

const route = useRoute()
const router = useRouter()
const open = ref(false)
const unreadCount = computed(() => notifications.length)

const titleMap: Record<string, string> = {
  '/feed': route.query.source === 'my' ? '최근 올라온 마이 레시피' : '피드',
  '/my-recipe/new': '레시피 등록',
  '/saved': '저장',
  '/mypage': '마이',
  '/recommendations': '추천',
  '/ingredients': '재료',
  '/backend-api': '백엔드 API 명세',
}

const pageTitle = computed(() => {
  if (route.path.startsWith('/recipe/')) return ''
  return titleMap[route.path] ?? ''
})

const showBack = computed(() => route.path.startsWith('/recipe/'))

const navItems = [
  { href: '/', label: '홈' },
  { href: '/feed', label: '피드' },
  { href: '/my-recipe/new', label: '등록' },
  { href: '/saved', label: '저장' },
  { href: '/mypage', label: '마이' },
]

const isActive = (href: string) => route.path === href || (href !== '/' && route.path.startsWith(href))
</script>
