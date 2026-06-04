import { createRouter, createWebHistory } from 'vue-router'
import { APP_ROUTES } from '../shared/constants/routes'
import HomeView from '../views/HomeView.vue'
import FeedView from '../views/FeedView.vue'
import RecipeDetailView from '../views/RecipeDetailView.vue'
import RecipeEditorView from '../views/RecipeEditorView.vue'
import SavedView from '../views/SavedView.vue'
import MyPageView from '../views/MyPageView.vue'
import AuthView from '../views/AuthView.vue'
import RecommendationsView from '../views/RecommendationsView.vue'
import IngredientsView from '../views/IngredientsView.vue'
import BackendApiView from '../views/BackendApiView.vue'
import ServerErrorView from '../views/ServerErrorView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: APP_ROUTES.home, component: HomeView },
    { path: APP_ROUTES.feed, component: FeedView },
    { path: APP_ROUTES.recipeDetail, component: RecipeDetailView },
    { path: APP_ROUTES.myRecipeNew, component: RecipeEditorView },
    { path: APP_ROUTES.saved, component: SavedView },
    { path: APP_ROUTES.mypage, component: MyPageView },
    { path: APP_ROUTES.login, component: AuthView, props: { mode: 'login' } },
    { path: APP_ROUTES.oauthCallback, component: AuthView, props: { mode: 'login' } },
    { path: APP_ROUTES.signup, component: AuthView, props: { mode: 'signup' } },
    { path: APP_ROUTES.recommendations, component: RecommendationsView },
    { path: APP_ROUTES.ingredients, component: IngredientsView },
    { path: APP_ROUTES.backendApi, component: BackendApiView },
    { path: APP_ROUTES.serverError, component: ServerErrorView },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from) => {
  if (from.matched.length > 0 && to.fullPath === from.fullPath) return false
  return true
})
