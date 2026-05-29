import { apiRequest } from '../../shared/api/client'
import { mapDjangoRecipeListWithMedia, unwrapCursorPagination } from '../recipe/mapper'

export const RECIPE_PAGE_SIZE = 12

export interface RecipePageParams {
  sort?: 'latest' | 'popular' | string
  search?: string
  tag?: string
  tags?: string[]
  cursor?: string | null
  pageSize?: number
}

export const fetchFeedRecipesPageApi = async (params: RecipePageParams = {}) => {
  const pageSize = params.pageSize || RECIPE_PAGE_SIZE
  const query = new URLSearchParams()
  if (params.sort) query.set('sort', params.sort)
  if (params.search) query.set('search', params.search)
  const firstTag = params.tag || params.tags?.find(Boolean)
  if (firstTag) query.set('tag', firstTag)
  if (params.cursor) query.set('cursor', params.cursor)
  query.set('page_size', String(pageSize))

  const body = await apiRequest<unknown>(`/feeds/${query.toString() ? `?${query}` : ''}`)
  const pagination = unwrapCursorPagination(body)
  const pageItems = pagination.isPaginated ? pagination.items : pagination.items.slice(0, pageSize)
  const items = await mapDjangoRecipeListWithMedia(pageItems)
  const hasNext = pagination.isPaginated ? Boolean(pagination.nextCursor) : false

  return { items, hasNext, nextCursor: pagination.nextCursor }
}

export const fetchFeedRecipesApi = async (params: RecipePageParams = {}) => {
  const page = await fetchFeedRecipesPageApi(params)
  return page.items
}