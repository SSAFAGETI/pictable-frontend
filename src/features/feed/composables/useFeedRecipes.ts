import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchFeedRecipesPageApi, RECIPE_PAGE_SIZE } from '../api'
import { fetchMyRecipesPageApi } from '../../user/api'
import { resolveRecipePublicImage } from '../../recipe/mapper'
import { useAuth } from '../../../auth'
import type { Recipe } from '../../../data'
import { getRecipeTagByName, getRecipeTagNamesByIds } from '../../../tags'

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
  const sentinelRef = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null

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
    const selectedTags = getRecipeTagNamesByIds(selectedTagIds.value)

    try {
      const result =
        route.query.source === 'my' && isAuthenticated.value
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
    hasNextPage,
    isLoadingPage,
    isServicePreparing,
    resetFilters,
    searchQuery,
    selectedTagIds,
    sentinelRef,
    sortBy,
  }
}
