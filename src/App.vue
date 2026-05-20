<template>
  <div class="app-shell page-scrollbar">
    <DesktopSideNav v-if="!isAuthPage" />
    <div :class="!isAuthPage ? 'lg:pl-20' : ''">
      <AppHeader v-if="!isAuthPage" />
      <ServerErrorBanner v-if="!isAuthPage" />
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
import { initializeAuth } from './auth'
import { loadDjangoRecipes, loadFoodSafetyRecipes } from './data'

const route = useRoute()
const isAuthPage = computed(() => route.path.startsWith('/login') || route.path.startsWith('/signup'))
const recipesLoaded = ref(false)

const shouldLoadRecipes = computed(() => {
  if (isAuthPage.value) return false
  if (route.path.startsWith('/server-error')) return false
  if (route.path.startsWith('/backend-api')) return false
  return true
})

const loadRecipesOnce = async () => {
  if (!shouldLoadRecipes.value || recipesLoaded.value) return

  recipesLoaded.value = true
  await loadDjangoRecipes().catch(() => loadFoodSafetyRecipes())
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
