import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchFeedRecipesPageApi, RECIPE_PAGE_SIZE } from '../api'
import { fetchMyRecipesPageApi } from '../../user/api'
import { deleteRecipeApi, toggleSaveApi } from '../../recipe/api'
import { resolveRecipePublicImage } from '../../recipe/mapper'
import { ApiError } from '../../../shared/api/error'
import { useAuth } from '../../../auth'
import type { Recipe } from '../../../data'
import { getRecipeTagByName, getRecipeTagNamesByIds, getRecipeTagQueryNamesByIds } from '../../../tags'
import { showToast } from '../../../toast'

export type FeedSortOption = 'popular' | 'recent' | 'likes'

const normalizeSort = (value: unknown): FeedSortOption => {
  if (value === 'latest' || value === 'recent') return 'recent'
  if (value === 'likes') return 'likes'
  return 'popular'
}

const mergeRecipes = (current: Recipe[], next: Recipe[]) => {
  const seen = new Set(current.map((recipe) => recipe.id))
  return [...current, ...next.filter((recipe) => !seen.has(recipe.id))]
}

const mergeRecipeImage = (recipes: Recipe[], id: string, image: string) =>
  recipes.map((recipe) => (recipe.id === id ? { ...recipe, image, needsPublicImageLookup: false } : recipe))

export const useFeedRecipes = () => {
  const route = useRoute()
  const { isAuthenticated } = useAuth()
  const searchQuery = ref('')
  const initialTag = route.query.tag ? getRecipeTagByName(String(route.query.tag)) : undefined
  const selectedTagIds = ref<number[]>(initialTag ? [initialTag.id] : [])
  const feedRequestId = ref(0)
  const sortBy = ref<FeedSortOption>(normalizeSort(route.query.sort))
  const feedRecipes = ref<Recipe[]>([])
  const nextCursor = ref<string | null>(null)
  const hasNextPage = ref(true)
  const isLoadingPage = ref(false)
  const isServicePreparing = ref(false)
  const deletingRecipeIds = ref(new Set<string>())
  const savingRecipeIds = ref(new Set<string>())
  const sentinelRef = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null
  const isMyRecipeFeed = computed(() => route.query.source === 'my' && isAuthenticated.value)

  const resetFilters = () => {
    searchQuery.value = ''
    selectedTagIds.value = []
  }

  const loadFeedPage = async (reset = false) => {
    if (isLoadingPage.value) return
    if (!reset && !hasNextPage.value) return

    const requestId = reset ? feedRequestId.value + 1 : feedRequestId.value
    if (reset) {
      feedRequestId.value = requestId
      nextCursor.value = null
      hasNextPage.value = true
      feedRecipes.value = []
      isServicePreparing.value = false
    }

    isLoadingPage.value = true
    const selectedTags = getRecipeTagQueryNamesByIds(selectedTagIds.value)

    try {
      const result =
        isMyRecipeFeed.value && isAuthenticated.value
          ? await fetchMyRecipesPageApi({ cursor: nextCursor.value, pageSize: RECIPE_PAGE_SIZE })
          : await fetchFeedRecipesPageApi({
              sort: sortBy.value === 'recent' ? 'latest' : 'popular',
              search: searchQuery.value.trim() || undefined,
              tags: selectedTags,
              cursor: nextCursor.value,
              pageSize: RECIPE_PAGE_SIZE,
            })

      if (requestId !== feedRequestId.value) return

      const previousLength = feedRecipes.value.length
      feedRecipes.value = reset ? result.items : mergeRecipes(feedRecipes.value, result.items)
      void hydratePublicImages(result.items, requestId)
      const addedCount = feedRecipes.value.length - previousLength
      nextCursor.value = result.nextCursor
      hasNextPage.value = result.hasNext && Boolean(result.nextCursor) && (reset ? result.items.length > 0 : addedCount > 0)
    } catch {
      if (reset) feedRecipes.value = []
      if (reset) isServicePreparing.value = true
      hasNextPage.value = false
    } finally {
      if (requestId === feedRequestId.value) isLoadingPage.value = false
    }
  }

  const hydratePublicImages = async (recipes: Recipe[], requestId: number) => {
    const targets = recipes.filter((recipe) => recipe.needsPublicImageLookup)
    if (!targets.length) return

    for (const recipe of targets) {
      const image = await resolveRecipePublicImage(recipe)
      if (!image || requestId !== feedRequestId.value) continue
      feedRecipes.value = mergeRecipeImage(feedRecipes.value, recipe.id, image)
    }
  }

  const setupObserver = () => {
    observer?.disconnect()
    if (!sentinelRef.value) return

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadFeedPage(false)
      },
      { rootMargin: '480px 0px' },
    )
    observer.observe(sentinelRef.value)
  }

  const deleteMyRecipe = async (id: string) => {
    if (deletingRecipeIds.value.has(id)) return

    deletingRecipeIds.value = new Set(deletingRecipeIds.value).add(id)
    try {
      await deleteRecipeApi(id)
      feedRecipes.value = feedRecipes.value.filter((recipe) => recipe.id !== id)
      showToast({
        type: 'success',
        title: '레시피를 삭제했어요',
        message: '마이레시피 목록에서 삭제된 레시피를 제거했습니다.',
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: '레시피 삭제 실패',
        message: error instanceof Error && error.message ? error.message : '지금은 레시피를 삭제할 수 없어요.',
      })
    } finally {
      const nextIds = new Set(deletingRecipeIds.value)
      nextIds.delete(id)
      deletingRecipeIds.value = nextIds
    }
  }

  const updateRecipeSaveState = (id: string, saved: boolean, saveCount?: number) => {
    feedRecipes.value = feedRecipes.value.map((recipe) => {
      if (recipe.id !== id) return recipe

      const nextSaves =
        typeof saveCount === 'number'
          ? saveCount
          : Math.max(0, recipe.saves + (saved ? 1 : -1))

      return {
        ...recipe,
        isSaved: saved,
        saves: nextSaves,
      }
    })
  }

  const toggleSaveRecipe = async (id: string) => {
    if (savingRecipeIds.value.has(id)) return

    if (!isAuthenticated.value) {
      showToast({
        type: 'info',
        title: '로그인이 필요해요',
        message: '레시피 저장은 로그인 후 사용할 수 있어요.',
      })
      return
    }

    const target = feedRecipes.value.find((recipe) => recipe.id === id)
    if (!target) return

    const previousSaved = Boolean(target.isSaved)
    const previousSaves = target.saves
    const optimisticSaved = !previousSaved

    savingRecipeIds.value = new Set(savingRecipeIds.value).add(id)
    updateRecipeSaveState(id, optimisticSaved)

    try {
      const result = await toggleSaveApi(id)
      const nextSaved = typeof result.saved === 'boolean' ? result.saved : optimisticSaved
      updateRecipeSaveState(id, nextSaved, result.save_count)
      showToast({
        type: 'success',
        title: nextSaved ? '레시피를 저장했어요' : '저장을 해제했어요',
        message: nextSaved ? '저장 탭에서 다시 볼 수 있어요.' : '저장 탭에서 제거됐어요.',
      })
    } catch (error) {
      feedRecipes.value = feedRecipes.value.map((recipe) =>
        recipe.id === id ? { ...recipe, isSaved: previousSaved, saves: previousSaves } : recipe,
      )
      showToast({
        type: 'error',
        title: '저장 처리 실패',
        message: error instanceof ApiError && error.status < 500 ? error.message : '지금은 저장 상태를 바꿀 수 없어요. 잠시 후 다시 시도해주세요.',
      })
    } finally {
      const nextIds = new Set(savingRecipeIds.value)
      nextIds.delete(id)
      savingRecipeIds.value = nextIds
    }
  }

  onMounted(() => {
    void loadFeedPage(true)
    setupObserver()
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  watch([searchQuery, selectedTagIds, sortBy], () => {
    void loadFeedPage(true)
  })

  watch(sentinelRef, setupObserver)

  watch(
    () => route.query.tag,
    (tag) => {
      const nextTag = typeof tag === 'string' ? getRecipeTagByName(tag) : undefined
      selectedTagIds.value = nextTag ? [nextTag.id] : []
    },
  )

  watch(
    () => route.query.sort,
    (sort) => {
      sortBy.value = normalizeSort(sort)
    },
  )

  watch(
    () => route.query.source,
    () => {
      void loadFeedPage(true)
    },
  )

  const filteredRecipes = computed(() => {
    const selectedTags = getRecipeTagNamesByIds(selectedTagIds.value)

    return feedRecipes.value
      .filter((recipe) => {
        const queryMatch =
          !searchQuery.value ||
          recipe.title.includes(searchQuery.value) ||
          recipe.description.includes(searchQuery.value) ||
          recipe.tags.some((tag) => tag.includes(searchQuery.value))
        const tagMatch = selectedTags.length === 0 || selectedTags.every((tag) => recipe.tags.includes(tag))
        return queryMatch && tagMatch
      })
      .sort((a, b) => {
        if (sortBy.value === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        if (sortBy.value === 'likes') return b.likes - a.likes
        return b.likes + b.saves - (a.likes + a.saves)
      })
  })

  return {
    filteredRecipes,
    deleteMyRecipe,
    deletingRecipeIds,
    hasNextPage,
    isMyRecipeFeed,
    isLoadingPage,
    isServicePreparing,
    resetFilters,
    savingRecipeIds,
    searchQuery,
    selectedTagIds,
    sentinelRef,
    sortBy,
    toggleSaveRecipe,
  }
}
