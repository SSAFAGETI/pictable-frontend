<template>
  <div v-if="recipe" class="page-scrollbar min-h-screen pb-24 lg:pb-0">
    <main class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <section class="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div class="relative aspect-[16/10] max-h-[620px] min-h-[280px] lg:aspect-[21/9]">
          <img :src="recipe.image" :alt="recipe.title" class="h-full w-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </div>
        <div class="-mt-6 rounded-t-2xl bg-card p-4 sm:p-6 lg:p-8">
          <div class="flex flex-wrap gap-2">
            <span class="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">{{ difficultyLabels[recipe.difficulty] }}</span>
            <span v-for="tag in recipe.tags" :key="tag" class="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">#{{ tag }}</span>
          </div>
          <h1 class="mt-4 text-2xl font-bold lg:text-3xl">{{ recipe.title }}</h1>
          <p class="mt-3 text-sm leading-6 text-muted-foreground lg:text-base">{{ recipe.description }}</p>
          <div class="mt-5 flex flex-wrap items-center gap-4 border-b border-border pb-5 text-sm text-muted-foreground">
            <span class="flex items-center gap-1"><Clock class="h-4 w-4" />{{ recipe.cookTime }}분</span>
            <span class="flex items-center gap-1"><ChefHat class="h-4 w-4" />{{ recipe.servings }}인분</span>
            <span class="flex items-center gap-1"><Heart class="h-4 w-4" />{{ likes.toLocaleString() }}</span>
            <span class="flex items-center gap-1"><MessageCircle class="h-4 w-4" />{{ recipe.comments }}</span>
          </div>
          <div class="mt-5 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <img class="h-11 w-11 rounded-full object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" alt="" />
              <div>
                <p class="font-semibold">{{ recipe.author }}</p>
                <p class="text-sm text-muted-foreground">레시피 작성자</p>
              </div>
            </div>
            <RouterLink :to="`/my-recipe/new?edit=${recipe.id}`" class="rounded-md border border-input bg-background px-4 py-2 text-sm font-bold hover:bg-muted">수정</RouterLink>
          </div>
        </div>
      </section>

      <section class="mt-6 grid gap-5">
        <article class="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">
          <h2 class="flex items-center gap-2 text-lg font-bold"><Users class="h-5 w-5" />재료 · {{ recipe.servings }}인분 기준</h2>
          <ul class="mt-5 grid gap-3">
            <li v-for="item in recipe.ingredients" :key="item.id" class="flex items-center justify-between border-b border-border pb-3 last:border-b-0">
              <span class="before:mr-2 before:text-primary before:content-['•']">{{ item.name }}</span>
              <strong class="font-medium text-muted-foreground">{{ item.amount }}</strong>
            </li>
          </ul>
        </article>

        <article class="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">
          <h2 class="text-lg font-bold">조리법</h2>
          <ol class="mt-5 grid gap-4">
            <li v-for="(step, index) in recipe.steps" :key="step" class="grid gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-[minmax(160px,240px)_minmax(0,1fr)]">
              <div v-if="recipe.stepImages[index]" class="overflow-hidden rounded-md border border-border bg-muted">
                <img :src="recipe.stepImages[index]" :alt="`${recipe.title} ${index + 1}단계`" class="aspect-[4/3] h-full w-full object-cover" loading="lazy" />
              </div>
              <div class="flex gap-3">
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{{ index + 1 }}</span>
                <p class="leading-7">{{ step }}</p>
              </div>
            </li>
          </ol>
        </article>

        <article class="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">
          <h2 class="text-lg font-bold">댓글</h2>
          <div v-for="comment in commentsList" :key="comment.id" class="mt-4 rounded-lg border border-border bg-background p-4">
            <p class="font-semibold">{{ comment.author }}</p>
            <p class="mt-2 text-sm leading-6 text-muted-foreground">{{ comment.content }}</p>
            <div v-if="comment.reply" class="ml-4 mt-3 rounded-md bg-primary/10 p-3 text-sm text-primary">글쓴이 답글: {{ comment.reply }}</div>
          </div>
          <div class="mt-4 flex gap-2">
            <input v-model="commentText" class="h-11 min-w-0 flex-1 rounded-md border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="댓글을 입력하세요" @keyup.enter="handleCommentSubmit" />
            <button class="rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground" @click="handleCommentSubmit">등록</button>
          </div>
        </article>
      </section>
    </main>

    <div class="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-[min(520px,calc(100%-2rem))] gap-3">
      <button class="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-lg" @click="handleLike">
        <Heart class="h-4 w-4" />
        좋아요 {{ likes.toLocaleString() }}
      </button>
      <button class="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-bold shadow-lg">
        <MessageCircle class="h-4 w-4" />
        댓글
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ChefHat, Clock, Heart, MessageCircle, Users } from 'lucide-vue-next'
import { createCommentApi, fetchCommentsApi, fetchRecipeApi, toggleLikeApi } from '../api'
import { useAuth } from '../auth'
import { difficultyLabels, recipes } from '../data'

interface ViewComment {
  id: string
  author: string
  content: string
  reply?: string
}

const route = useRoute()
const { user } = useAuth()
const recipe = computed(() => recipes.value.find((item) => item.id === route.params.id) || recipes.value[0])
const likes = ref(recipe.value.likes)
const commentText = ref('')
const commentsList = ref<ViewComment[]>([
  {
    id: 'fallback-comment',
    author: '든든한 하루',
    content: '이 레시피 그대로 해봤는데 진짜 간단하고 맛있어요.',
    reply: '감사합니다! 김가루를 조금 올리면 더 맛있어요.',
  },
])

const normalizeComment = (raw: unknown, index: number): ViewComment | null => {
  if (!raw || typeof raw !== 'object') return null
  const record = raw as Record<string, unknown>
  const author = record.author
  const reply = Array.isArray(record.replies) ? record.replies[0] : record.reply

  return {
    id: String(record.id || `comment-${index}`),
    author:
      typeof author === 'object' && author
        ? String((author as Record<string, unknown>).nickname || (author as Record<string, unknown>).email || '사용자')
        : String(author || record.nickname || '사용자'),
    content: String(record.content || record.message || ''),
    reply: typeof reply === 'object' && reply ? String((reply as Record<string, unknown>).content || '') : typeof reply === 'string' ? reply : undefined,
  }
}

const loadRecipeDetail = async () => {
  const recipeId = String(route.params.id || '')
  if (!recipeId) return

  try {
    const apiRecipe = await fetchRecipeApi(recipeId)
    const index = recipes.value.findIndex((item) => item.id === apiRecipe.id)
    if (index >= 0) recipes.value[index] = apiRecipe
    else recipes.value.unshift(apiRecipe)
    likes.value = apiRecipe.likes
  } catch {
    likes.value = recipe.value.likes
  }
}

const loadComments = async () => {
  const recipeId = String(route.params.id || '')
  if (!recipeId) return

  try {
    const apiComments = await fetchCommentsApi(recipeId)
    const normalized = apiComments.map(normalizeComment).filter((item): item is ViewComment => Boolean(item?.content))
    if (normalized.length > 0) commentsList.value = normalized
  } catch {
    // Leave the local sample comments in place if the comments API is unavailable.
  }
}

const handleLike = async () => {
  const currentRecipe = recipe.value

  try {
    const result = await toggleLikeApi(currentRecipe.id)
    if (typeof result.like_count === 'number') {
      likes.value = result.like_count
    } else if (typeof result.liked === 'boolean') {
      likes.value = Math.max(0, likes.value + (result.liked ? 1 : -1))
    } else {
      likes.value += 1
    }
    currentRecipe.likes = likes.value
    currentRecipe.isLiked = typeof result.liked === 'boolean' ? result.liked : true
  } catch {
    currentRecipe.isLiked = !currentRecipe.isLiked
    likes.value = Math.max(0, likes.value + (currentRecipe.isLiked ? 1 : -1))
    currentRecipe.likes = likes.value
  }
}

const handleCommentSubmit = async () => {
  const content = commentText.value.trim()
  if (!content) return

  const currentRecipe = recipe.value
  const localComment: ViewComment = {
    id: `local-comment-${Date.now()}`,
    author: user.value?.name || '사용자',
    content,
  }

  try {
    const created = await createCommentApi(currentRecipe.id, content)
    const normalized = normalizeComment(created, commentsList.value.length) || localComment
    commentsList.value = [normalized, ...commentsList.value]
  } catch {
    commentsList.value = [localComment, ...commentsList.value]
  }

  commentText.value = ''
  currentRecipe.comments += 1
}

watch(
  () => route.params.id,
  () => {
    likes.value = recipe.value.likes
    void loadRecipeDetail()
    void loadComments()
  },
  { immediate: true },
)
</script>
