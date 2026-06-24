<template>
  <div class="flex min-h-screen flex-col pb-24 lg:pb-0">
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
                <img class="h-16 w-16 rounded-full object-cover" :src="displayUser.avatar" alt="profile" />
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
                  <div class="text-center lg:p-3"><p class="text-xl font-bold text-primary">{{ savedRecipes.length }}</p><p class="text-xs text-muted-foreground">저장</p></div>
                  <div class="text-center lg:p-3"><p class="text-xl font-bold text-primary">{{ likedRecipes.length }}</p><p class="text-xs text-muted-foreground">좋아요</p></div>
                  <div class="text-center lg:p-3"><p class="text-xl font-bold text-primary">{{ myRecipes.length }}</p><p class="text-xs text-muted-foreground">내 레시피</p></div>
                </div>
                <div class="grid grid-cols-2 divide-x divide-border border-t border-border p-3 lg:contents lg:divide-x-0 lg:border-t-0 lg:p-0">
                  <div class="text-center lg:p-3"><p class="text-xl font-bold text-primary">{{ followingProfiles.length }}</p><p class="text-xs text-muted-foreground">내가 구독한 사람</p></div>
                  <div class="text-center lg:p-3"><p class="text-xl font-bold text-primary">{{ followerProfiles.length }}</p><p class="text-xs text-muted-foreground">나를 구독한 사람</p></div>
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
            <RecipeCard v-for="recipe in visibleRecipes" :key="recipe.id" :recipe="recipe" variant="horizontal">
              <template v-if="activeTab === 'my'" #actions>
                <button
                  type="button"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-primary"
                  aria-label="레시피 수정"
                  @click.prevent.stop="editRecipe(recipe.id)"
                >
                  <Edit3 class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-destructive disabled:pointer-events-none disabled:opacity-60"
                  aria-label="레시피 삭제"
                  :disabled="deletingRecipeIds.has(recipe.id)"
                  @click.prevent.stop="confirmDeleteRecipe(recipe.id)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </template>
            </RecipeCard>
            <div ref="sentinelRef" class="col-span-full flex h-16 items-center justify-center text-sm text-muted-foreground">
              <span v-if="activeTabLoading">레시피를 더 불러오는 중...</span>
              <span v-else-if="activeTabHasNext">스크롤하면 더 불러와요</span>
            </div>
          </div>

          <RouterLink v-if="activeTab === 'my'" to="/my-recipe/new" class="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-bold shadow-sm hover:bg-muted">
            레시피 등록하기
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
import { computed, defineComponent, h, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, Bookmark, ChefHat, ChevronRight, Edit3, FileText, Heart, HelpCircle, LogOut, Server, Settings, Shield, Trash2, UserCheck } from 'lucide-vue-next'
import {
  deleteRecipeApi,
  fetchLikedRecipesPageApi,
  fetchMyRecipesPageApi,
  fetchSavedRecipesPageApi,
  fetchSubscribersApi,
  fetchSubscriptionsApi,
  RECIPE_PAGE_SIZE,
  type UserProfile,
} from '../api'
import AuthRequiredState from '../components/AuthRequiredState.vue'
import RecipeCard from '../components/RecipeCard.vue'
import { useAuth } from '../auth'
import type { Recipe } from '../data'
import { APP_ROUTES, myRecipeEditPath } from '../shared/constants/routes'
import { showToast } from '../toast'

type RecipeTab = 'saved' | 'liked' | 'my'

const router = useRouter()
const { user, isAuthenticated, logout } = useAuth()
const activeTab = ref<RecipeTab>('saved')
const savedRecipes = ref<Recipe[]>([])
const likedRecipes = ref<Recipe[]>([])
const myRecipes = ref<Recipe[]>([])
const tabCursors = ref<Record<RecipeTab, string | null>>({ saved: null, liked: null, my: null })
const tabHasNext = ref<Record<RecipeTab, boolean>>({ saved: true, liked: true, my: true })
const tabLoading = ref<Record<RecipeTab, boolean>>({ saved: false, liked: false, my: false })
const deletingRecipeIds = ref(new Set<string>())
const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
const followingProfiles = ref<UserProfile[]>([])
const followerProfiles = ref<UserProfile[]>([])
const tabs = [
  { value: 'saved', label: '저장', icon: Bookmark },
  { value: 'liked', label: '좋아요', icon: Heart },
  { value: 'my', label: '내 레시피', icon: ChefHat },
] as const

const menuItems = [
  { icon: Server, label: '백엔드 API 명세', href: APP_ROUTES.backendApi },
  { icon: Server, label: '백엔드 API 명세 v2', href: APP_ROUTES.backendApiV2 },
  { icon: FileText, label: '사용자 플로우 와이어프레임', href: '/user-flow-wireframe.html', external: true },
  { icon: FileText, label: '사용자 플로우 와이어프레임 v2', href: '/user-flow-wireframe-v2.html', external: true },
  { icon: Bell, label: '알림 설정', href: '/settings/notifications' },
  { icon: HelpCircle, label: '고객센터', href: '/help' },
  { icon: FileText, label: '이용약관', href: '/terms' },
  { icon: Shield, label: '개인정보 처리방침', href: '/privacy' },
]

const visibleRecipes = computed(() => {
  if (activeTab.value === 'liked') return likedRecipes.value
  if (activeTab.value === 'my') return myRecipes.value
  return savedRecipes.value
})

const activeTabLoading = computed(() => tabLoading.value[activeTab.value])
const activeTabHasNext = computed(() => tabHasNext.value[activeTab.value])

const displayUser = computed(() => ({
  name: user.value?.name || '김요리',
  email: user.value?.email || 'user@example.com',
  avatar: user.value?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&auto=format&q=75',
}))

const handleLogout = async () => {
  await logout()
  router.push(APP_ROUTES.login)
}

const editRecipe = (id: string) => {
  void router.push(myRecipeEditPath(id))
}

const confirmDeleteRecipe = (id: string) => {
  if (!window.confirm('이 레시피를 삭제할까요? 삭제한 레시피는 되돌릴 수 없어요.')) return
  void deleteMyRecipe(id)
}

const deleteMyRecipe = async (id: string) => {
  if (deletingRecipeIds.value.has(id)) return

  deletingRecipeIds.value = new Set(deletingRecipeIds.value).add(id)
  try {
    await deleteRecipeApi(id)
    myRecipes.value = myRecipes.value.filter((recipe) => recipe.id !== id)
    showToast({
      type: 'success',
      title: '레시피를 삭제했어요',
      message: '내 레시피 목록에서 삭제된 레시피를 제거했습니다.',
    })
  } catch (error) {
    showToast({
      type: 'error',
      title: '레시피 삭제 실패',
      message: error instanceof Error && error.message ? error.message : '지금은 레시피를 삭제할 수 없어요.',
    })
  } finally {
    const nextIds = new Set(deletingRecipeIds.value)
    nextIds.delete(id)
    deletingRecipeIds.value = nextIds
  }
}

const getTabRecipes = (tab: RecipeTab) => {
  if (tab === 'liked') return likedRecipes.value
  if (tab === 'my') return myRecipes.value
  return savedRecipes.value
}

const setTabRecipes = (tab: RecipeTab, next: Recipe[]) => {
  if (tab === 'liked') likedRecipes.value = next
  else if (tab === 'my') myRecipes.value = next
  else savedRecipes.value = next
}

const mergeRecipes = (current: Recipe[], next: Recipe[]) => {
  const seen = new Set(current.map((recipe) => recipe.id))
  return [...current, ...next.filter((recipe) => !seen.has(recipe.id))]
}

const fetchRecipeTabPage = (tab: RecipeTab) => {
  const params = { cursor: tabCursors.value[tab], pageSize: RECIPE_PAGE_SIZE }
  if (tab === 'liked') return fetchLikedRecipesPageApi(params)
  if (tab === 'my') return fetchMyRecipesPageApi(params)
  return fetchSavedRecipesPageApi(params)
}

const resetRecipeTabs = () => {
  savedRecipes.value = []
  likedRecipes.value = []
  myRecipes.value = []
  tabCursors.value = { saved: null, liked: null, my: null }
  tabHasNext.value = { saved: true, liked: true, my: true }
  tabLoading.value = { saved: false, liked: false, my: false }
}

const loadRecipeTab = async (tab: RecipeTab, reset = false) => {
  if (!isAuthenticated.value) {
    resetRecipeTabs()
    return
  }
  if (tabLoading.value[tab]) return
  if (!reset && !tabHasNext.value[tab]) return

  if (reset) {
    setTabRecipes(tab, [])
    tabCursors.value[tab] = null
    tabHasNext.value[tab] = true
  }

  tabLoading.value[tab] = true
  try {
    const result = await fetchRecipeTabPage(tab)
    const current = getTabRecipes(tab)
    const nextRecipes = reset ? result.items : mergeRecipes(current, result.items)
    const addedCount = nextRecipes.length - current.length
    setTabRecipes(tab, nextRecipes)
    tabCursors.value[tab] = result.nextCursor
    tabHasNext.value[tab] = result.hasNext && Boolean(result.nextCursor) && (reset ? result.items.length > 0 : addedCount > 0)
  } catch {
    if (reset) setTabRecipes(tab, [])
    tabHasNext.value[tab] = false
  } finally {
    tabLoading.value[tab] = false
  }
}

const loadMyPageData = async () => {
  if (!isAuthenticated.value) {
    resetRecipeTabs()
    followingProfiles.value = []
    followerProfiles.value = []
    return
  }

  resetRecipeTabs()
  const [followingResult, followerResult] = await Promise.allSettled([fetchSubscriptionsApi(), fetchSubscribersApi()])

  followingProfiles.value = followingResult.status === 'fulfilled' ? followingResult.value : []
  followerProfiles.value = followerResult.status === 'fulfilled' ? followerResult.value : []
  await Promise.all([loadRecipeTab('saved', true), loadRecipeTab('liked', true), loadRecipeTab('my', true)])
}

const setupObserver = () => {
  observer?.disconnect()
  if (!sentinelRef.value) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void loadRecipeTab(activeTab.value)
    },
    { rootMargin: '480px 0px' },
  )
  observer.observe(sentinelRef.value)
}

onMounted(setupObserver)
onUnmounted(() => observer?.disconnect())
watch(sentinelRef, setupObserver)
watch(activeTab, () => {
  if (getTabRecipes(activeTab.value).length === 0) void loadRecipeTab(activeTab.value)
})
watch(isAuthenticated, () => void loadMyPageData(), { immediate: true })

const ProfileSection = defineComponent({
  props: {
    title: { type: String, required: true },
    profiles: {
      type: Array as () => Array<{ id: string; name: string; email: string; avatar?: string }>,
      required: true,
    },
  },
  setup(props) {
    const fallbackAvatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&auto=format&q=75'

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
                h('img', { class: 'h-10 w-10 rounded-full object-cover', src: profile.avatar || fallbackAvatar, alt: '' }),
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
