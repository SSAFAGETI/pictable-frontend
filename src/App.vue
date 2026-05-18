<template>
  <div class="app-shell page-scrollbar">
    <DesktopSideNav v-if="!isAuthPage" />
    <div :class="!isAuthPage ? 'lg:pl-20' : ''">
      <AppHeader v-if="!isAuthPage" />
      <RouterView />
    </div>
    <BottomNav v-if="!isAuthPage" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import BottomNav from './components/BottomNav.vue'
import DesktopSideNav from './components/DesktopSideNav.vue'
import { initializeAuth } from './auth'
import { loadDjangoRecipes, loadFoodSafetyRecipes } from './data'

const route = useRoute()
const isAuthPage = computed(() => route.path.startsWith('/login') || route.path.startsWith('/signup'))

onMounted(() => {
  void initializeAuth()
  void loadDjangoRecipes().catch(() => loadFoodSafetyRecipes())
})
</script>
