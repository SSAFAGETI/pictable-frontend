<template>
  <div class="flex min-h-screen flex-col pb-20 lg:pb-0">
    <AuthRequiredState
      v-if="!isAuthenticated"
      icon="chef"
      description="로그인하고 저장한 레시피와&#10;나만의 레시피를 관리해보세요."
    />
    <main v-else class="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <div class="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
        <div class="space-y-6 lg:sticky lg:top-24">
          <div class="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
            <div class="p-4">
              <div class="flex items-center gap-4">
                <img class="h-16 w-16 rounded-full object-cover" :src="displayUser.avatar" alt="프로필" />
                <div class="min-w-0 flex-1">
                  <h2 class="truncate text-lg font-bold">{{ displayUser.name }}</h2>
                  <p class="truncate text-sm text-muted-foreground">{{ displayUser.email }}</p>
                </div>
                <RouterLink to="/settings/profile" class="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted" aria-label="프로필 설정">
                  <Settings class="h-5 w-5" />
                </RouterLink>
              </div>

              <div class="mt-4 overflow-hidden rounded-md bg-muted lg:grid lg:grid-cols-5 lg:divide-x lg:divide-border">
                <div class="grid grid-cols-3 divide-x divide-border p-3 lg:contents lg:divide-x-0 lg:p-0">
                  <div class="text-center lg:p-3"><p class="text-xl font-bold text-primary">3</p><p class="text-xs text-muted-foreground">저장</p></div>
                  <div class="text-center lg:p-3"><p class="text-xl font-bold text-primary">3</p><p class="text-xs text-muted-foreground">좋아요</p></div>
                  <div class="text-center lg:p-3"><p class="text-xl font-bold text-primary">3</p><p class="text-xs text-muted-foreground">내 레시피</p></div>
                </div>
                <div class="grid grid-cols-2 divide-x divide-border border-t border-border p-3 lg:contents lg:divide-x-0 lg:border-t-0 lg:p-0">
                  <div class="text-center lg:p-3"><p class="text-xl font-bold text-primary">2</p><p class="text-xs text-muted-foreground">구독</p></div>
                  <div class="text-center lg:p-3"><p class="text-xl font-bold text-primary">2</p><p class="text-xs text-muted-foreground">구독자</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="min-w-0">
          <div class="grid w-full grid-cols-3 rounded-lg bg-muted p-1">
            <button v-for="tab in tabs" :key="tab.value" :class="['inline-flex items-center justify-center gap-1 rounded-md px-1 py-2 text-xs font-bold transition-colors sm:text-sm', activeTab === tab.value ? 'bg-background shadow-sm' : 'text-muted-foreground']" @click="activeTab = tab.value">
              <component :is="tab.icon" class="h-4 w-4" />
              {{ tab.label }}
            </button>
          </div>

          <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <RecipeCard v-for="recipe in visibleRecipes" :key="recipe.id" :recipe="recipe" variant="horizontal" />
          </div>

          <RouterLink v-if="activeTab === 'my'" to="/my-recipe/new" class="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-bold shadow-sm hover:bg-muted">
            새 레시피 등록하기
          </RouterLink>

          <section class="mt-6 space-y-3">
            <div class="flex items-center gap-2">
              <UserCheck class="h-5 w-5 text-primary" />
              <h2 class="text-lg font-bold">구독 관리</h2>
            </div>
            <div class="grid gap-4 xl:grid-cols-2">
              <ProfileSection title="내가 구독한 사람" :profiles="followingProfiles" />
              <ProfileSection title="나를 구독한 사람" :profiles="followerProfiles" />
            </div>
          </section>
        </div>
      </div>

      <section class="mx-auto mt-6 max-w-7xl space-y-3">
        <h2 class="text-lg font-bold">계정 메뉴</h2>
        <div class="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
          <template v-for="(item, index) in menuItems" :key="item.label">
            <a v-if="item.external" :href="item.href" :class="['flex items-center justify-between p-4 transition-colors hover:bg-muted', index !== menuItems.length - 1 && 'border-b border-border']">
              <div class="flex items-center gap-3">
                <component :is="item.icon" class="h-5 w-5 text-muted-foreground" />
                <span>{{ item.label }}</span>
              </div>
              <ChevronRight class="h-5 w-5 text-muted-foreground" />
            </a>
            <RouterLink v-else :to="item.href" :class="['flex items-center justify-between p-4 transition-colors hover:bg-muted', index !== menuItems.length - 1 && 'border-b border-border']">
              <div class="flex items-center gap-3">
                <component :is="item.icon" class="h-5 w-5 text-muted-foreground" />
                <span>{{ item.label }}</span>
              </div>
              <ChevronRight class="h-5 w-5 text-muted-foreground" />
            </RouterLink>
          </template>
        </div>

        <button class="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-bold text-destructive hover:bg-destructive/10" @click="handleLogout">
          <LogOut class="h-5 w-5" />
          로그아웃
        </button>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, Bookmark, ChefHat, ChevronRight, FileText, Heart, HelpCircle, LogOut, Server, Settings, Shield, UserCheck } from 'lucide-vue-next'
import AuthRequiredState from '../components/AuthRequiredState.vue'
import RecipeCard from '../components/RecipeCard.vue'
import { useAuth } from '../auth'
import { recipes } from '../data'

const router = useRouter()
const { user, isAuthenticated, logout } = useAuth()
const activeTab = ref<'saved' | 'liked' | 'my'>('saved')
const tabs = [
  { value: 'saved', label: '저장', icon: Bookmark },
  { value: 'liked', label: '좋아요', icon: Heart },
  { value: 'my', label: '내 레시피', icon: ChefHat },
] as const

const menuItems = [
  { icon: Server, label: '백엔드 API 명세', href: '/backend-api' },
  { icon: FileText, label: '웹/앱 플로우 프레임워크', href: '/user-flow-wireframe.html', external: true },
  { icon: Bell, label: '알림 설정', href: '/settings/notifications' },
  { icon: HelpCircle, label: '고객센터', href: '/help' },
  { icon: FileText, label: '이용약관', href: '/terms' },
  { icon: Shield, label: '개인정보 처리방침', href: '/privacy' },
]

const visibleRecipes = computed(() => {
  if (activeTab.value === 'liked') return recipes.value.slice(2, 5)
  if (activeTab.value === 'my') return recipes.value.slice(3, 6)
  return recipes.value.slice(0, 3)
})

const displayUser = computed(() => ({
  name: user.value?.name || '김요리',
  email: user.value?.email || 'user@example.com',
  avatar: user.value?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
}))

const handleLogout = async () => {
  await logout()
  router.push('/login')
}

const followingProfiles = [
  {
    id: 'following-reader-1',
    name: '든든한 하루',
    email: 'reader@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    id: 'following-cook-2',
    name: '초간단 식탁',
    email: 'easycook@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
  },
]

const followerProfiles = [
  {
    id: 'follower-reader-1',
    name: '든든한 하루',
    email: 'reader@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    id: 'follower-kitchen-2',
    name: '냉장고 탐험가',
    email: 'fridge@example.com',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
  },
]

const ProfileSection = defineComponent({
  props: {
    title: { type: String, required: true },
    profiles: {
      type: Array as () => Array<{ id: string; name: string; email: string; avatar: string }>,
      required: true,
    },
  },
  setup(props) {
    return () =>
      h('div', { class: 'rounded-lg border border-border bg-card text-card-foreground shadow-sm' }, [
        h('div', { class: 'p-4' }, [
          h('div', { class: 'mb-4 flex items-center justify-between' }, [
            h('h3', { class: 'font-semibold' }, props.title),
            h('span', { class: 'text-sm font-medium text-primary' }, `${props.profiles.length}명`),
          ]),
          h(
            'div',
            { class: 'space-y-3' },
            props.profiles.map((profile) =>
              h('div', { key: profile.id, class: 'flex items-center gap-3 rounded-md border border-border p-3' }, [
                h('img', { class: 'h-10 w-10 rounded-full object-cover', src: profile.avatar, alt: '' }),
                h('div', { class: 'min-w-0 flex-1' }, [
                  h('p', { class: 'truncate font-semibold' }, profile.name),
                  h('p', { class: 'truncate text-sm text-muted-foreground' }, profile.email),
                ]),
              ]),
            ),
          ),
        ]),
      ])
  },
})
</script>
