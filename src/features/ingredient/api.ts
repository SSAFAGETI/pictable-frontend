import { apiRequest } from '../../shared/api/client'
import { asString, isRecord, unwrapList } from '../recipe/mapper'

export const searchIngredientsApi = async (search = '') => {
  const query = new URLSearchParams()
  if (search) query.set('search', search)
  const body = await apiRequest<unknown>(`/recipes/ingredients/${query.toString() ? `?${query}` : ''}`)

  return unwrapList(body)
    .map((item) => (isRecord(item) ? asString(item.name || item.title) : asString(item)))
    .filter(Boolean)
}

