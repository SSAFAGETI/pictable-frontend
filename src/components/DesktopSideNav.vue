<template>
  <aside class="group fixed inset-y-0 left-0 z-50 hidden w-20 flex-col border-r border-border bg-card/95 px-3 py-5 shadow-sm backdrop-blur-xl transition-[width] duration-300 ease-out hover:w-60 lg:flex">
    <RouterLink
      :to="APP_ROUTES.home"
      class="flex h-12 w-full items-center justify-center gap-0 overflow-hidden rounded-2xl text-foreground transition-all duration-200 hover:bg-muted/70 group-hover:justify-start group-hover:gap-3 group-hover:px-2"
    >
      <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
        <ChefHat class="h-5 w-5" />
      </span>
      <span class="max-w-0 overflow-hidden whitespace-nowrap text-lg font-black opacity-0 transition-all duration-200 group-hover:max-w-[140px] group-hover:opacity-100">
        찰칵밥상
      </span>
    </RouterLink>

    <nav class="mt-12 grid gap-2" aria-label="웹 사이드 메뉴">
      <RouterLink
        v-for="item in navItems"
        :key="item.href"
        :to="item.href"
        :class="[
          'relative flex h-12 w-full items-center justify-center gap-0 overflow-hidden rounded-2xl text-sm font-bold transition-all duration-200 group-hover:justify-start group-hover:gap-3 group-hover:px-2',
          isActive(item.href) ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25' : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
        ]"
      >
        <span
          :class="[
            'grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-colors',
            isActive(item.href) ? 'text-primary-foreground' : 'text-muted-foreground',
          ]"
        >
          <component :is="item.icon" class="h-5 w-5" />
        </span>
        <span class="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:max-w-[120px] group-hover:opacity-100">{{ item.label }}</span>
      </RouterLink>

    </nav>

    <div class="mt-5 border-t border-border pt-4">
      <button
        type="button"
        class="relative flex h-12 w-full items-center justify-center gap-0 overflow-hidden rounded-2xl text-left text-sm font-bold text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/70 hover:text-foreground hover:shadow-sm group-hover:justify-start group-hover:gap-3 group-hover:px-2"
        @click="toggleNotifications"
      >
        <span class="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl">
          <Bell class="h-5 w-5" />
          <template v-if="unreadCount > 0">
            <span class="absolute right-1 top-1 h-4 w-4 rounded-full bg-red-500/20" />
            <span class="absolute right-1 top-1 h-4 w-4 animate-ping rounded-full bg-red-500/70" />
            <span class="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[9px] font-black leading-none text-white shadow-sm shadow-red-500/40">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
          </template>
        </span>
        <span class="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:max-w-[120px] group-hover:opacity-100">알림</span>
      </button>
    </div>

    <div class="mt-auto" aria-hidden="true" />

    <div
      v-if="noticeOpen"
      class="absolute left-[calc(100%+12px)] top-24 w-[360px] overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
    >
      <div class="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <p class="text-base font-bold">알림</p>
          <p class="mt-0.5 text-sm text-muted-foreground">읽지 않은 알림 {{ unreadCount }}개</p>
        </div>
        <div class="flex items-center gap-1">
          <button v-if="unreadCount > 0" class="rounded-lg px-3 py-2 text-sm font-bold text-primary hover:bg-muted" @click="markAllAsRead">모두 읽음</button>
          <button class="rounded-lg px-3 py-2 text-sm font-bold text-muted-foreground hover:bg-muted" @click="noticeOpen = false">닫기</button>
        </div>
      </div>
      <RouterLink v-for="notification in notifications" :key="notification.id" :to="APP_ROUTES.mypage" class="block border-b border-border px-5 py-4 last:border-b-0 hover:bg-muted/60" @click="markAsRead(notification.id)">
        <div class="flex items-start gap-3">
          <span class="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500 shadow-sm shadow-red-500/40" />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold leading-5">{{ notification.title }}</p>
            <p class="mt-1.5 text-sm leading-6 text-muted-foreground">{{ notification.message }}</p>
            <p class="mt-2 text-xs text-muted-foreground">방금 전</p>
          </div>
        </div>
      </RouterLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Bell, Bookmark, ChefHat, Home, PlusSquare, Search, User } from 'lucide-vue-next'
import { useAuth } from '../auth'
import { useNotifications } from '../notifications'
import { APP_ROUTES, PRIMARY_NAV_LINKS, isActiveRoute } from '../shared/constants/routes'

const route = useRoute()
const noticeOpen = ref(false)
const { isAuthenticated } = useAuth()
const { notifications, unreadCount, loadNotifications, refreshNotifications, markAsRead, markAllAsRead } = useNotifications()

watch(isAuthenticated, (authenticated) => void loadNotifications(authenticated), { immediate: true })

const toggleNotifications = () => {
  noticeOpen.value = !noticeOpen.value
  if (noticeOpen.value && isAuthenticated.value) void refreshNotifications()
}

const navIconMap = {
  home: Home,
  feed: Search,
  register: PlusSquare,
  saved: Bookmark,
  mypage: User,
} as const

const navItems = PRIMARY_NAV_LINKS.map((item) => ({ ...item, icon: navIconMap[item.key] }))
const isActive = (href: string) => isActiveRoute(route.path, href)
</script>
