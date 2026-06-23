import { http, HttpResponse } from 'msw'
import { createHomeSummaryResponse, createRecommendationsResponse, createApiRecipe } from '../fixtures/recipes'

export const handlers = [
  http.get('/api/users/me/', () =>
    HttpResponse.json({
      id: 'user-1',
      email: 'tester@example.com',
      nickname: 'Tester',
      created_at: '2026-06-23T00:00:00.000Z',
    }),
  ),
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
  http.post('/api/recipes/:id/save/', () => HttpResponse.json({ saved: true, save_count: 2 })),
  http.post('/api/recipes/', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>

    return HttpResponse.json(createApiRecipe('created-1', body), { status: 201 })
  }),
]
