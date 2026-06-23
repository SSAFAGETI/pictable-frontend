<template>
  <div class="page-scrollbar flex min-h-screen flex-col">
    <main class="home-gradient-surface flex-1 pb-24 lg:pb-0">
      <ServicePreparingState v-if="isServicePreparing" />

      <section v-if="!isServicePreparing" class="px-4 pb-2 pt-5 sm:px-6 lg:px-8 lg:pt-7">
        <div class="mx-auto max-w-7xl">
          <div class="relative mx-auto max-w-5xl">
            <form class="relative rounded-full border border-primary/25 bg-gradient-to-r from-primary/10 via-white/90 to-primary/5 p-1.5 shadow-sm shadow-primary/10 backdrop-blur" @submit.prevent="goRecipeSearch()">
              <Search class="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
              <input
                v-model="recipeSearchQuery"
                type="search"
                placeholder="먹고 싶은 레시피 이름을 입력해보세요"
                class="h-14 w-full rounded-full border-0 bg-white/70 py-2 pl-14 pr-12 text-base font-semibold text-foreground outline-none placeholder:text-muted-foreground focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-ring/40"
                aria-label="레시피 이름 검색"
                aria-controls="home-recipe-search-suggestions"
              />
              <button type="submit" class="sr-only">검색</button>
            </form>

            <div
              v-if="recipeSearchSuggestions.length > 0"
              id="home-recipe-search-suggestions"
              class="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-3xl border border-primary/15 bg-card/95 p-2 shadow-xl shadow-primary/10 backdrop-blur"
            >
              <button
                v-for="suggestion in recipeSearchSuggestions"
                :key="suggestion"
                type="button"
                class="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold hover:bg-primary/10 hover:text-primary"
                @click="goRecipeSearch(suggestion)"
              >
                <Search class="h-4 w-4 shrink-0 text-primary" />
                <span class="line-clamp-1">{{ suggestion }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section v-if="!isServicePreparing" class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div class="mx-auto max-w-7xl border border-primary/10 bg-white/80 shadow-xl shadow-primary/5 backdrop-blur">
          <div class="relative min-h-[300px] overflow-hidden lg:min-h-[360px]">
            <img
              src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=720&h=480&fit=crop&auto=format&q=75"
              srcset="https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=480&h=320&fit=crop&auto=format&q=75 480w, https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=720&h=480&fit=crop&auto=format&q=75 720w"
              sizes="(min-width: 1280px) 672px, (min-width: 1024px) 54vw, calc(100vw - 2rem)"
              alt="Kitchen tablet and cooking tools"
              width="720"
              height="480"
              fetchpriority="high"
              decoding="async"
              class="absolute inset-0 h-full w-full object-cover"
            />
            <div class="absolute inset-0 bg-[linear-gradient(110deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.52)_38%,rgba(240,74,36,0.12)_100%)]" />
            <div class="relative flex min-h-[300px] max-w-3xl flex-col justify-end p-6 text-white sm:p-8 lg:min-h-[360px] lg:p-10">
              <p class="mb-3 w-fit border border-white/30 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] backdrop-blur">Snap to Cook</p>
              <h1 class="max-w-xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">찰칵밥상</h1>
              <p class="mt-4 max-w-xl text-sm leading-6 text-white/85 sm:text-base">
                냉장고 속 재료를 입력하고 지금 만들 수 있는 레시피를 바로 찾아보세요.
              </p>
            </div>
          </div>

          <div class="home-ingredient-strip border-t border-primary/10 p-5 sm:p-6 lg:p-7">
            <IngredientPicker
              v-model="ingredients"
              title="가지고 있는 재료를 입력하세요"
              description="재료를 엔터로 추가하고, 바로 추천받을 수 있어요."
              @submit="goRecommendations"
            />
          </div>
        </div>
      </section>

      <section v-if="!isServicePreparing" class="px-4 py-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-7xl">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-lg font-bold lg:text-xl">오늘의 추천 요리</h2>
            <RouterLink to="/feed" class="inline-flex items-center rounded-md px-3 py-2 text-sm font-bold text-primary hover:bg-muted">
              더보기 <ArrowRight class="ml-1 h-4 w-4" />
            </RouterLink>
          </div>

          <div class="overflow-hidden rounded-lg">
            <div class="flex transition-transform duration-700 ease-out" :style="{ transform: `translateX(-${activeIndex * 100}%)` }">
              <div v-for="(recipe, index) in todayRecipes" :key="recipe.id" class="w-full shrink-0">
                <RouterLink :to="`/recipe/${recipe.id}`">
                  <div class="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-lg lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
                    <div class="relative h-[170px] sm:h-[220px] lg:h-[220px] xl:h-[240px]">
                      <img :src="recipe.image" :alt="recipe.title" class="h-full w-full object-cover" loading="lazy" decoding="async" />
                    </div>
                    <div class="flex flex-col justify-center p-3 sm:p-4 lg:p-5">
                      <span class="mb-2 w-fit rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
                        {{ difficultyLabels[recipe.difficulty] }}
                      </span>
                      <h3 class="line-clamp-1 text-lg font-bold sm:text-xl lg:text-2xl">{{ recipe.title }}</h3>
                      <p class="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{{ recipe.description }}</p>
                      <div class="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span class="flex items-center gap-1"><Clock class="h-4 w-4" />{{ recipe.cookTime }}분</span>
                        <span class="flex items-center gap-1"><ChefHat class="h-4 w-4" />{{ recipe.servings }}인분</span>
                        <RecipeTagChip v-for="tag in recipe.tags.slice(0, 2)" :key="tag" :label="tag" compact />
                      </div>
                    </div>
                  </div>
                </RouterLink>
              </div>
            </div>
          </div>

          <div class="mt-3 flex justify-center gap-2">
            <button
              v-for="(recipe, index) in todayRecipes"
              :key="recipe.id"
              type="button"
              :aria-label="`${index + 1}번째 추천 요리`"
              :aria-current="activeIndex === index ? 'true' : undefined"
              class="group grid h-6 w-6 place-items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              @click="activeIndex = index"
            >
              <span
                aria-hidden="true"
                :class="['h-2 rounded-full transition-all', activeIndex === index ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/40 group-hover:bg-muted-foreground/60']"
              />
            </button>
          </div>
        </div>
      </section>

      <section v-if="!isServicePreparing" class="px-4 py-5 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-7xl">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <TrendingUp class="h-5 w-5 text-primary" />
              <h2 class="text-lg font-bold lg:text-xl">인기 레시피</h2>
            </div>
            <RouterLink to="/feed?sort=popular" class="inline-flex items-center rounded-md px-3 py-2 text-sm font-bold text-primary hover:bg-muted">
              더보기 <ArrowRight class="ml-1 h-4 w-4" />
            </RouterLink>
          </div>

          <div class="tag-filter-scroll grid auto-cols-[210px] grid-flow-col gap-4 overflow-x-auto pb-2 lg:grid-flow-row lg:grid-cols-4 lg:overflow-visible">
            <RecipeCard v-for="recipe in popularRecipes" :key="recipe.id" :recipe="recipe" variant="compact" image-loading="lazy" />
          </div>
        </div>
      </section>

      <section v-if="!isServicePreparing" class="px-4 py-5 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-7xl">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Clock class="h-5 w-5 text-muted-foreground" />
              <h2 class="text-lg font-bold lg:text-xl">최근 올라온 마이 레시피</h2>
            </div>
            <RouterLink to="/feed?source=my&sort=recent" class="inline-flex items-center rounded-md px-3 py-2 text-sm font-bold text-primary hover:bg-muted">
              더보기 <ArrowRight class="ml-1 h-4 w-4" />
            </RouterLink>
          </div>

          <div class="grid gap-4 lg:grid-cols-3">
            <RouterLink v-for="recipe in recentRecipes" :key="recipe.id" :to="`/recipe/${recipe.id}`" class="block h-full">
              <div class="h-full overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md">
                <div class="flex h-full lg:flex-col">
                  <div class="relative h-28 w-28 shrink-0 lg:h-44 lg:w-full">
                    <img :src="recipe.image" :alt="recipe.title" class="h-full w-full object-cover" loading="lazy" decoding="async" />
                    <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-2">
                      <div class="flex items-center justify-end gap-1.5 text-[11px] font-medium text-white">
                        <span class="flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 backdrop-blur-sm"><Heart class="h-3 w-3" />{{ recipe.likes.toLocaleString() }}</span>
                        <span class="flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 backdrop-blur-sm"><MessageCircle class="h-3 w-3" />{{ recipe.comments.toLocaleString() }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex min-w-0 flex-1 flex-col p-3 lg:p-4">
                    <div class="min-w-0 flex-1">
                      <div class="mb-2 flex flex-wrap items-center gap-2">
                        <span class="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold text-accent-foreground">{{ difficultyLabels[recipe.difficulty] }}</span>
                        <RecipeTagChip v-for="tag in recipe.tags.slice(0, 1)" :key="tag" :label="tag" compact />
                      </div>
                      <h3 class="line-clamp-1 font-semibold">{{ recipe.title }}</h3>
                      <p class="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground lg:text-sm">{{ recipe.description }}</p>
                    </div>
                    <div class="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                      <span class="flex items-center gap-1"><Clock class="h-3.5 w-3.5" />{{ recipe.cookTime }}분</span>
                      <span class="flex items-center gap-1"><ChefHat class="h-3.5 w-3.5" />{{ recipe.servings }}인분</span>
                    </div>
                  </div>
                </div>
              </div>
            </RouterLink>
          </div>
        </div>
      </section>
    </main>

  </div>
</template>

<script setup lang="ts">
import { ArrowRight, ChefHat, Clock, Heart, MessageCircle, Search, TrendingUp } from 'lucide-vue-next'
import IngredientPicker from '../components/IngredientPicker.vue'
import RecipeCard from '../components/RecipeCard.vue'
import RecipeTagChip from '../components/RecipeTagChip.vue'
import ServicePreparingState from '../components/ServicePreparingState.vue'
import { useHomeRecipes } from '../features/home/composables/useHomeRecipes'
import { difficultyLabels } from '../data'

const {
  activeIndex,
  goRecipeSearch,
  goRecommendations,
  ingredients,
  isServicePreparing,
  popularRecipes,
  recentRecipes,
  recipeSearchSuggestions,
  recipeSearchQuery,
  todayRecipes,
} = useHomeRecipes()
</script>
