import { http, HttpResponse } from 'msw'
import { createHomeSummaryResponse, createRecommendationsResponse, createApiRecipe } from '../fixtures/recipes'

export const handlers = [
  http.get('/api/home/summary/', () => HttpResponse.json(createHomeSummaryResponse())),
  http.get('/api/feeds/', () =>
    HttpResponse.json({
      results: [createApiRecipe('20', { title: 'Feed Recipe 20' }), createApiRecipe('21', { title: 'Feed Recipe 21' })],
      next: null,
    }),
  ),
  http.get('/api/recipes/recommendations/', ({ request }) => {
    const url = new URL(request.url)
    const ingredients = (url.searchParams.get('ingredients') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    return HttpResponse.json(createRecommendationsResponse(ingredients))
  }),
]
