import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  ApiError,
  createCommentApi,
  deleteCommentApi,
  fetchCommentsApi,
  fetchRecipeApi,
  toggleLikeApi,
  toggleSubscribeApi,
  updateCommentApi,
} from '../../../api'
import { useAuth } from '../../../auth'
import { recipes } from '../../../data'
import { showToast } from '../../../toast'

interface ViewComment {
  id: string
  author: string
  authorId?: string
  content: string
  reply?: string
  canManage?: boolean
}

const readId = (record: Record<string, unknown> | null | undefined, keys: string[]) => {
  if (!record) return ''
  for (const key of keys) {
    const value = record[key]
    if (value !== undefined && value !== null && value !== '') return String(value)
  }
  return ''
}

const readName = (record: Record<string, unknown> | null | undefined, keys: string[]) => {
  if (!record) return ''
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim() && !value.includes('@')) return value.trim()
  }
  return ''
}

export const useRecipeDetail = () => {
  const route = useRoute()
  const { user, isAuthenticated } = useAuth()
  const recipe = computed(() => recipes.value.find((item) => item.id === route.params.id) || recipes.value[0])
  const likes = ref(recipe.value.likes)
  const isLiked = ref(Boolean(recipe.value.isLiked))
  const likeBurst = ref(false)
  const commentText = ref('')
  const editingCommentId = ref<string | null>(null)
  const editingCommentText = ref('')
  const updatingCommentId = ref<string | null>(null)
  const deletingCommentId = ref<string | null>(null)
  const isSubscribed = ref(false)
  const isSubscribing = ref(false)
  const commentsSection = ref<HTMLElement | null>(null)
  const commentInput = ref<HTMLInputElement | null>(null)
  const commentsList = ref<ViewComment[]>([])

  const canManageComment = (comment: ViewComment) =>
    Boolean(comment.canManage || (comment.authorId && user.value?.id && comment.authorId === user.value.id))

  const normalizeComment = (raw: unknown, index: number): ViewComment | null => {
    if (!raw || typeof raw !== 'object') return null

    const record = raw as Record<string, unknown>
    const author = record.author
    const authorRecord = typeof author === 'object' && author ? (author as Record<string, unknown>) : null
    const userRecord = typeof record.user === 'object' && record.user ? (record.user as Record<string, unknown>) : null
    const reply = Array.isArray(record.replies) ? record.replies[0] : record.reply
    const authorId =
      readId(authorRecord, ['id', 'pk', 'user_id']) ||
      readId(userRecord, ['id', 'pk', 'user_id']) ||
      readId(record, ['author_id', 'author_user_id', 'user_id', 'created_by_id'])
    const authorName =
      readName(authorRecord, ['nickname', 'display_name', 'name', 'username']) ||
      readName(userRecord, ['nickname', 'display_name', 'name', 'username']) ||
      readName(record, ['nickname', 'display_name', 'author_nickname', 'user_nickname', 'name', 'username'])

    return {
      id: String(record.id || `comment-${index}`),
      authorId: authorId || undefined,
      author: authorName || '사용자',
      content: String(record.content || record.message || ''),
      reply: typeof reply === 'object' && reply ? String((reply as Record<string, unknown>).content || '') : typeof reply === 'string' ? reply : undefined,
      canManage: Boolean(authorId && user.value?.id && authorId === user.value.id),
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
      commentsList.value = apiComments.map(normalizeComment).filter((item): item is ViewComment => Boolean(item?.content))
    } catch {
      commentsList.value = []
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
      authorId: user.value?.id,
      author: user.value?.name || '사용자',
      content,
      canManage: true,
    }

    try {
      const created = await createCommentApi(currentRecipe.id, content)
      const normalized = normalizeComment(created, commentsList.value.length) || localComment
      commentsList.value = [{ ...normalized, canManage: true }, ...commentsList.value]
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

  const handleSubscribe = async () => {
    const authorId = recipe.value.authorId
    if (!isAuthenticated.value) {
      showToast({
        type: 'info',
        title: '로그인이 필요해요',
        message: '구독은 로그인 후 사용할 수 있어요.',
      })
      return
    }
    if (!authorId || authorId === user.value?.id || isSubscribing.value) return

    isSubscribing.value = true

    try {
      const result = await toggleSubscribeApi(authorId)
      const nextSubscribed =
        typeof result.subscribed === 'boolean'
          ? result.subscribed
          : typeof result.is_subscribed === 'boolean'
            ? result.is_subscribed
            : !isSubscribed.value
      isSubscribed.value = nextSubscribed
      showToast({
        type: 'success',
        title: nextSubscribed ? '구독 완료' : '구독 해제',
        message: nextSubscribed ? `${recipe.value.author}님을 구독했습니다.` : `${recipe.value.author}님 구독을 해제했습니다.`,
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: '구독 처리 실패',
        message: error instanceof ApiError && error.status < 500 ? error.message : '지금은 구독 상태를 변경할 수 없어요. 잠시 후 다시 시도해주세요.',
      })
    } finally {
      isSubscribing.value = false
    }
  }

  const startCommentEdit = (comment: ViewComment) => {
    if (!canManageComment(comment)) return
    editingCommentId.value = comment.id
    editingCommentText.value = comment.content
  }

  const cancelCommentEdit = () => {
    editingCommentId.value = null
    editingCommentText.value = ''
  }

  const handleCommentUpdate = async (commentId: string) => {
    const content = editingCommentText.value.trim()
    if (!content) return

    updatingCommentId.value = commentId

    try {
      const updated = await updateCommentApi(recipe.value.id, commentId, content)
      const normalized = normalizeComment(updated, commentsList.value.findIndex((comment) => comment.id === commentId))

      commentsList.value = commentsList.value.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              ...normalized,
              id: comment.id,
              content: normalized?.content || content,
              canManage: true,
            }
          : comment,
      )
      cancelCommentEdit()
      showToast({
        type: 'success',
        title: '댓글 수정 완료',
        message: '댓글 내용이 수정되었습니다.',
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: '댓글 수정 실패',
        message: error instanceof ApiError && error.status < 500 ? error.message : '지금은 댓글을 수정할 수 없어요. 잠시 후 다시 시도해주세요.',
      })
    } finally {
      updatingCommentId.value = null
    }
  }

  const handleCommentDelete = async (commentId: string) => {
    const target = commentsList.value.find((comment) => comment.id === commentId)
    if (!target || !canManageComment(target)) return
    if (!window.confirm('댓글을 삭제할까요?')) return

    deletingCommentId.value = commentId

    try {
      await deleteCommentApi(recipe.value.id, commentId)
      commentsList.value = commentsList.value.filter((comment) => comment.id !== commentId)
      recipe.value.comments = Math.max(0, recipe.value.comments - 1)
      if (editingCommentId.value === commentId) cancelCommentEdit()
      showToast({
        type: 'success',
        title: '댓글 삭제 완료',
        message: '댓글이 삭제되었습니다.',
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: '댓글 삭제 실패',
        message: error instanceof ApiError && error.status < 500 ? error.message : '지금은 댓글을 삭제할 수 없어요. 잠시 후 다시 시도해주세요.',
      })
    } finally {
      deletingCommentId.value = null
    }
  }

  watch(
    () => route.params.id,
    () => {
      likes.value = recipe.value.likes
      isLiked.value = Boolean(recipe.value.isLiked)
      isSubscribed.value = false
      cancelCommentEdit()
      void loadRecipeDetail()
      void loadComments()
    },
    { immediate: true },
  )

  return {
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
    isLiked,
    likeBurst,
    likes,
    recipe,
    startCommentEdit,
    isSubscribed,
    isSubscribing,
    updatingCommentId,
  }
}
