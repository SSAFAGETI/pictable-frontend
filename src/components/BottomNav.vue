<template>
  <nav class="fixed inset-x-0 bottom-0 z-50 h-[calc(64px+env(safe-area-inset-bottom))] border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden">
    <div class="grid h-16 grid-cols-5 items-stretch px-2">
      <RouterLink
        v-for="item in navItems"
        :key="item.href"
        :to="item.href"
        :class="[
          'flex h-16 min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 text-center text-xs leading-none transition-colors',
          isActive(item.href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
        ]"
      >
        <component :is="item.icon" :class="['h-5 w-5', isActive(item.href) && 'fill-primary/20']" />
        <span class="block h-3.5 truncate font-medium leading-none">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Bookmark, Home, PlusSquare, Search, User } from 'lucide-vue-next'
import { PRIMARY_NAV_LINKS, isActiveRoute } from '../shared/constants/routes'

const route = useRoute()

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
