<template>
  <div v-if="recipe" class="page-scrollbar min-h-screen pb-24 lg:pb-0">
    <main class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <section class="overflow-hidden rounded-lg bg-card">
        <div class="relative aspect-[16/10] max-h-[620px] min-h-[280px] overflow-hidden bg-muted lg:aspect-[21/9]">
          <img :src="recipe.image" :alt="recipe.title" class="block h-full w-full object-cover object-center" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </div>
        <div class="-mt-3 rounded-t-2xl bg-card p-4 sm:p-6 lg:p-8">
          <div class="flex flex-wrap gap-2">
            <span class="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">{{ difficultyLabels[recipe.difficulty] }}</span>
            <RecipeTagChip v-for="tag in recipe.tags" :key="tag" :label="tag" />
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
            <button
              type="button"
              :class="[
                'inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60',
                isSubscribed ? 'border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15' : 'bg-primary text-primary-foreground hover:bg-primary/90',
              ]"
              :disabled="isSubscribing || !recipe.authorId"
              @click="handleSubscribe"
            >
              <LoaderCircle v-if="isSubscribing" class="h-4 w-4 animate-spin" />
              <UserPlus v-else class="h-4 w-4" />
              {{ isSubscribed ? '구독중' : '구독' }}
            </button>
          </div>
        </div>
      </section>

      <section class="mt-6 grid gap-6">
        <article class="rounded-lg bg-card p-4 sm:p-6">
          <h2 class="flex items-center gap-2 text-lg font-bold"><Users class="h-5 w-5" />재료 · {{ recipe.servings }}인분 기준</h2>
          <ul class="mt-5 grid gap-3">
            <li v-for="item in recipe.ingredients" :key="item.id" class="flex items-center justify-between border-b border-border pb-3 last:border-b-0">
              <span class="before:mr-2 before:text-primary before:content-['•']">{{ item.name }}</span>
              <strong class="font-medium text-muted-foreground">{{ item.amount }}</strong>
            </li>
          </ul>
        </article>

        <article class="rounded-lg bg-card p-4 sm:p-6">
          <h2 class="text-lg font-bold">조리법</h2>
          <ol class="mt-5 grid gap-4">
            <li v-for="(step, index) in recipe.steps" :key="step" class="grid gap-3 rounded-lg bg-muted/35 p-4 sm:grid-cols-[minmax(160px,240px)_minmax(0,1fr)]">
              <div v-if="recipe.stepImages[index]" class="aspect-[4/3] overflow-hidden rounded-md bg-muted">
                <img :src="recipe.stepImages[index]" :alt="`${recipe.title} ${index + 1}단계`" class="block h-full w-full object-cover object-center" loading="lazy" />
              </div>
              <div class="flex gap-3">
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{{ index + 1 }}</span>
                <p class="leading-7">{{ step }}</p>
              </div>
            </li>
          </ol>
        </article>

        <article ref="commentsSection" class="rounded-lg bg-card p-4 sm:p-6">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-bold">댓글</h2>
            <span class="text-sm text-muted-foreground">{{ commentsList.length.toLocaleString() }}개</span>
          </div>

          <div v-if="commentsList.length === 0" class="mt-4 rounded-lg bg-muted/35 p-6 text-center text-sm text-muted-foreground">
            아직 댓글이 없습니다.
          </div>

          <div v-for="comment in commentsList" :key="comment.id" class="mt-4 rounded-lg bg-muted/35 p-4">
            <div class="flex items-start justify-between gap-3">
              <p class="min-w-0 font-semibold">{{ comment.author }}</p>
              <div v-if="comment.canManage" class="flex shrink-0 items-center gap-1">
                <button
                  class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  title="댓글 수정"
                  :disabled="deletingCommentId === comment.id"
                  @click="startCommentEdit(comment)"
                >
                  <Pencil class="h-4 w-4" />
                </button>
                <button
                  class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  title="댓글 삭제"
                  :disabled="deletingCommentId === comment.id || updatingCommentId === comment.id"
                  @click="handleCommentDelete(comment.id)"
                >
                  <LoaderCircle v-if="deletingCommentId === comment.id" class="h-4 w-4 animate-spin" />
                  <Trash2 v-else class="h-4 w-4" />
                </button>
              </div>
            </div>

            <div v-if="editingCommentId === comment.id" class="mt-3 grid gap-2">
              <textarea
                v-model="editingCommentText"
                class="min-h-24 w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="댓글을 수정하세요"
              />
              <div class="flex justify-end gap-2">
                <button
                  class="inline-flex h-9 items-center justify-center rounded-md border border-input px-3 text-sm font-bold hover:bg-muted"
                  type="button"
                  :disabled="updatingCommentId === comment.id"
                  @click="cancelCommentEdit"
                >
                  취소
                </button>
                <button
                  class="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  :disabled="!editingCommentText.trim() || updatingCommentId === comment.id"
                  @click="handleCommentUpdate(comment.id)"
                >
                  <LoaderCircle v-if="updatingCommentId === comment.id" class="h-4 w-4 animate-spin" />
                  <Check v-else class="h-4 w-4" />
                  저장
                </button>
              </div>
            </div>

            <p v-else class="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">{{ comment.content }}</p>
            <div v-if="comment.reply" class="ml-4 mt-3 rounded-md bg-primary/10 p-3 text-sm text-primary">글쓴이 답글: {{ comment.reply }}</div>
          </div>

          <div v-if="isAuthenticated" class="mt-4 flex gap-2">
            <input
              ref="commentInput"
              v-model="commentText"
              class="h-11 min-w-0 flex-1 rounded-md border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="댓글을 입력하세요"
              @keyup.enter="handleCommentSubmit"
            />
            <button class="rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50" :disabled="!commentText.trim()" @click="handleCommentSubmit">
              등록
            </button>
          </div>
          <div v-else class="mt-4 flex flex-col gap-3 rounded-lg border border-dashed border-border bg-muted/25 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>댓글 작성은 로그인 후 사용할 수 있어요.</span>
            <RouterLink to="/login" class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-bold text-primary-foreground hover:bg-primary/90">
              로그인하러 가기
            </RouterLink>
          </div>
        </article>
      </section>
    </main>

    <div class="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-[min(520px,calc(100%-2rem))] gap-3">
      <button
        :class="[
          'group relative inline-flex h-11 flex-1 items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-lg transition-all duration-200 active:scale-[0.98]',
          likeBurst && 'shadow-primary/40 ring-4 ring-primary/20',
        ]"
        @click="handleLike"
      >
        <span v-if="likeBurst" class="pointer-events-none absolute inset-0 animate-like-ripple rounded-lg bg-white/25" />
        <Heart :class="['h-4 w-4 transition-transform duration-300', isLiked && 'fill-current', likeBurst && 'animate-heart-pop']" />
        좋아요 {{ likes.toLocaleString() }}
      </button>
      <button class="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-bold shadow-lg transition-all duration-200 hover:border-primary/50 hover:text-primary active:scale-[0.98]" @click="focusComments">
        <MessageCircle class="h-4 w-4" />
        댓글
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, ChefHat, Clock, Heart, LoaderCircle, MessageCircle, Pencil, Trash2, UserPlus, Users } from 'lucide-vue-next'
import RecipeTagChip from '../components/RecipeTagChip.vue'
import { difficultyLabels } from '../data'
import { useRecipeDetail } from '../features/recipe/composables/useRecipeDetail'

const {
  cancelCommentEdit,
  commentInput,
  commentsList,
  commentsSection,
  commentText,
  deletingCommentId,
  editingCommentId,
  editingCommentText,
  focusComments,
  handleCommentDelete,
  handleCommentSubmit,
  handleCommentUpdate,
  handleLike,
  handleSubscribe,
  isAuthenticated,
  isSubscribed,
  isSubscribing,
  isLiked,
  likeBurst,
  likes,
  recipe,
  startCommentEdit,
  updatingCommentId,
} = useRecipeDetail()
</script>

<style scoped>
@keyframes heart-pop {
  0% { transform: scale(0.82); }
  45% { transform: scale(1.45) rotate(-8deg); }
  72% { transform: scale(0.94) rotate(4deg); }
  100% { transform: scale(1); }
}

@keyframes like-ripple {
  0% { transform: scaleX(0); opacity: 0.85; }
  100% { transform: scaleX(1); opacity: 0; }
}

.animate-heart-pop {
  animation: heart-pop 520ms cubic-bezier(0.2, 0.9, 0.2, 1);
}

.animate-like-ripple {
  transform-origin: center;
  animation: like-ripple 520ms ease-out;
}
</style>
