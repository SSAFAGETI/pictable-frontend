<template>
  <div class="app-shell page-scrollbar">
    <DesktopSideNav v-if="!isAuthPage" />
    <div :class="!isAuthPage ? 'lg:pl-20' : ''">
      <AppHeader v-if="!isAuthPage" />
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
import ToastViewport from './components/ToastViewport.vue'
import { initializeAuth } from './auth'
import { loadDjangoRecipes } from './data'
import { isAppChromeHiddenRoute, isAuthRoute } from './shared/constants/routes'

const route = useRoute()
const isAuthPage = computed(() => isAuthRoute(route.path))
const recipesLoaded = ref(false)

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
