import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchFeedRecipesApi } from '../api'
import { fetchMyRecipesApi } from '../../user/api'
import { useAuth } from '../../../auth'
import { recipes } from '../../../data'
import { getRecipeTagByName, getRecipeTagNamesByIds } from '../../../tags'

export type FeedSortOption = 'popular' | 'recent' | 'likes'

const normalizeSort = (value: unknown): FeedSortOption => {
  if (value === 'latest' || value === 'recent') return 'recent'
  if (value === 'likes') return 'likes'
  return 'popular'
}

export const useFeedRecipes = () => {
  const route = useRoute()
  const { isAuthenticated } = useAuth()
  const searchQuery = ref('')
  const initialTag = route.query.tag ? getRecipeTagByName(String(route.query.tag)) : undefined
  const selectedTagIds = ref<number[]>(initialTag ? [initialTag.id] : [])
  const feedRequestId = ref(0)
  const sortBy = ref<FeedSortOption>(normalizeSort(route.query.sort))

  const resetFilters = () => {
    searchQuery.value = ''
    selectedTagIds.value = []
  }

  const loadFeedFromApi = async () => {
    const requestId = feedRequestId.value + 1
    feedRequestId.value = requestId
    const selectedTags = getRecipeTagNamesByIds(selectedTagIds.value)

    try {
      const apiRecipes =
        route.query.source === 'my' && isAuthenticated.value
          ? await fetchMyRecipesApi()
          : await fetchFeedRecipesApi({
              sort: sortBy.value === 'recent' ? 'latest' : 'popular',
              search: searchQuery.value.trim() || undefined,
              tags: selectedTags,
            })

      if (requestId === feedRequestId.value && apiRecipes.length > 0) {
        recipes.value = apiRecipes
      }
    } catch {
      // Keep local/public fallback recipes visible when the Django API is not reachable.
    }
  }

  onMounted(() => {
    void loadFeedFromApi()
  })

  watch([searchQuery, selectedTagIds, sortBy], () => {
    void loadFeedFromApi()
  })

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
      void loadFeedFromApi()
    },
  )

  const filteredRecipes = computed(() => {
    const selectedTags = getRecipeTagNamesByIds(selectedTagIds.value)

    return recipes.value
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
    resetFilters,
    searchQuery,
    selectedTagIds,
    sortBy,
  }
}