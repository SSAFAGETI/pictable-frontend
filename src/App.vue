<template>
  <div class="app-shell page-scrollbar">
    <AppHeader v-if="!isAuthPage" />
    <RouterView />
    <BottomNav v-if="!isAuthPage" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()
const isAuthPage = computed(() => route.path.startsWith('/login') || route.path.startsWith('/signup'))
</script>
