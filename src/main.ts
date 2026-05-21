import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import FeedView from './views/FeedView.vue'
import RecipeDetailView from './views/RecipeDetailView.vue'
import RecipeEditorView from './views/RecipeEditorView.vue'
import SavedView from './views/SavedView.vue'
import MyPageView from './views/MyPageView.vue'
import AuthView from './views/AuthView.vue'
import RecommendationsView from './views/RecommendationsView.vue'
import IngredientsView from './views/IngredientsView.vue'
import BackendApiView from './views/BackendApiView.vue'
import ServerErrorView from './views/ServerErrorView.vue'
import { fallbackImage } from './api'
import './styles.css'
if (typeof window !== 'undefined') {
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target
      if (!(target instanceof HTMLImageElement) || target.dataset.fallbackApplied === 'true') return

      const src = target.getAttribute('src') || ''
      const isBackendMedia = src.startsWith('/api/media/') || src.startsWith('/media/') || src.includes('15.164.170.144:8000/media/')
      if (!isBackendMedia) return

      target.dataset.fallbackApplied = 'true'
      target.src = fallbackImage
    },
    true,
  )
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/feed', component: FeedView },
    { path: '/recipe/:id', component: RecipeDetailView },
    { path: '/my-recipe/new', component: RecipeEditorView },
    { path: '/saved', component: SavedView },
    { path: '/mypage', component: MyPageView },
    { path: '/login', component: AuthView, props: { mode: 'login' } },
    { path: '/oauth/callback', component: AuthView, props: { mode: 'login' } },
    { path: '/signup', component: AuthView, props: { mode: 'signup' } },
    { path: '/recommendations', component: RecommendationsView },
    { path: '/ingredients', component: IngredientsView },
    { path: '/backend-api', component: BackendApiView },
    { path: '/server-error', component: ServerErrorView },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

createApp(App).use(router).mount('#app')
