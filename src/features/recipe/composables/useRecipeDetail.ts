import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ApiError, createCommentApi, fetchCommentsApi, fetchRecipeApi, toggleLikeApi } from '../../../api'
import { useAuth } from '../../../auth'
import { recipes } from '../../../data'
import { showToast } from '../../../toast'

interface ViewComment {
    id: string
    author: string
    content: string
    reply?: string
}

export const useRecipeDetail = () => {
  const route = useRoute()
  const { user, isAuthenticated } = useAuth()
  const recipe = computed(() => recipes.value.find((item) => item.id === route.params.id) || recipes.value[0])
  const likes = ref(recipe.value.likes)
  const isLiked = ref(Boolean(recipe.value.isLiked))
  const likeBurst = ref(false)
  const commentText = ref('')
  const commentsSection = ref<HTMLElement | null>(null)
  const commentInput = ref<HTMLInputElement | null>(null)
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
  
  const triggerLikeAnimation = () => {
    likeBurst.value = false
    window.setTimeout(() => {
      likeBurst.value = true
      window.setTimeout(() => {
        likeBurst.value = false
      }, 520)
    }, 0)
}
  
  const focusComments = () => {
    commentsSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => commentInput.value?.focus(), 360)
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
      isLiked.value = Boolean(apiRecipe.isLiked)
    } catch {
      likes.value = recipe.value.likes
      isLiked.value = Boolean(recipe.value.isLiked)
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
    if (!isAuthenticated.value) {
      showToast({
        type: 'info',
        title: '로그인이 필요해요',
        message: '좋아요는 로그인 후 사용할 수 있어요.',
      })
      return
    }
  
    triggerLikeAnimation()
  
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
      currentRecipe.isLiked = typeof result.liked === 'boolean' ? result.liked : !isLiked.value
      isLiked.value = Boolean(currentRecipe.isLiked)
    } catch (error) {
      showToast({
        type: 'error',
        title: '좋아요 처리 실패',
        message: error instanceof ApiError && error.status < 500 ? error.message : '지금은 좋아요를 반영할 수 없어요. 잠시 후 다시 시도해주세요.',
      })
    }
}
  
  const handleCommentSubmit = async () => {
    const content = commentText.value.trim()
    if (!content) return
    if (!isAuthenticated.value) {
      showToast({
        type: 'info',
        title: '로그인이 필요해요',
        message: '댓글은 로그인 후 작성할 수 있어요.',
      })
      return
    }
  
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
      commentText.value = ''
      currentRecipe.comments += 1
      window.setTimeout(() => commentsSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
    } catch (error) {
      showToast({
        type: 'error',
        title: '댓글 등록 실패',
        message: error instanceof ApiError && error.status < 500 ? error.message : '지금은 댓글을 등록할 수 없어요. 잠시 후 다시 시도해주세요.',
      })
    }
}
  
  watch(
    () => route.params.id,
    () => {
      likes.value = recipe.value.likes
      isLiked.value = Boolean(recipe.value.isLiked)
      void loadRecipeDetail()
      void loadComments()
    },
    { immediate: true },
  )
  
    return {
      commentInput,
      commentsList,
      commentsSection,
      commentText,
      focusComments,
      handleCommentSubmit,
      handleLike,
      isLiked,
      likeBurst,
      likes,
      recipe,
    }
}