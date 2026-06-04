<template>
  <div class="app-shell page-scrollbar">
    <DesktopSideNav v-if="!isAuthPage" />
    <div :class="!isAuthPage ? 'lg:pl-20' : ''">
      <AppHeader v-if="!isAuthPage" />
      <ServerErrorBanner v-if="showServerErrorBanner" />
      <RouterView />
    </div>
    <BottomNav v-if="!isAuthPage" />
    <ToastViewport />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import BottomNav from './components/BottomNav.vue'
import DesktopSideNav from './components/DesktopSideNav.vue'
import ServerErrorBanner from './components/ServerErrorBanner.vue'
import ToastViewport from './components/ToastViewport.vue'
import { initializeAuth, useAuth } from './auth'
import { loadDjangoRecipes } from './data'
import { APP_ROUTES, isAppChromeHiddenRoute, isAuthRoute } from './shared/constants/routes'

const route = useRoute()
const { isAuthenticated } = useAuth()
const isAuthPage = computed(() => isAuthRoute(route.path))
const recipesLoaded = ref(false)
const protectedAuthRequiredRoutes = new Set<string>([APP_ROUTES.myRecipeNew, APP_ROUTES.saved, APP_ROUTES.mypage])
const showServerErrorBanner = computed(
  () =>
    route.path !== APP_ROUTES.home &&
    route.path !== APP_ROUTES.feed &&
    !isAuthPage.value &&
    (isAuthenticated.value || !protectedAuthRequiredRoutes.has(route.path)),
)

const shouldLoadRecipes = computed(() => !isAppChromeHiddenRoute(route.path))

const loadRecipesOnce = async () => {
  if (!shouldLoadRecipes.value || recipesLoaded.value) return

  recipesLoaded.value = true
  await loadDjangoRecipes().catch(() => undefined)
}

onMounted(() => {
  void initializeAuth()
})

watch(
  shouldLoadRecipes,
  () => {
    void loadRecipesOnce()
  },
  { immediate: true },
)
</script>
