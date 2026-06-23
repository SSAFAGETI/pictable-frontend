import { defineComponent } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { render } from 'vitest-browser-vue'
import RecommendationsView from '../../src/views/RecommendationsView.vue'
import { setStoredTokens } from '../../src/shared/api/token'
import { createRecommendationsResponse } from '../fixtures/recipes'
import { worker } from '../msw/browser'

const Placeholder = defineComponent({ template: '<div />' })

const createTestRouter = async (path: string) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/recommendations', component: RecommendationsView },
      { path: '/ingredients', component: Placeholder },
      { path: '/login', component: Placeholder },
      { path: '/', component: Placeholder },
      { path: '/recipe/:id', component: Placeholder },
    ],
  })

  await router.push(path)
  await router.isReady()
  return router
}

describe('RecommendationsView', () => {
  it('shows a login-required state without tokens', async () => {
    const recommendationRequests: string[] = []
    worker.use(
      http.get('/api/recipes/recommendations/', ({ request }) => {
        recommendationRequests.push(request.url)
        return HttpResponse.json(createRecommendationsResponse(['egg']))
      }),
    )

    const router = await createTestRouter('/recommendations?ingredients=egg,milk')
    const screen = await render(RecommendationsView, { global: { plugins: [router] } })

    await expect.element(screen.getByText('#egg')).toBeInTheDocument()
    await expect.element(screen.getByText('#milk')).toBeInTheDocument()
    await vi.waitFor(() => expect(recommendationRequests).toHaveLength(0))
    expect(document.body.textContent).not.toContain('Egg Rice')
  })

  it('loads recommendations with auth and renders ready and almost sections', async () => {
    const authHeaders: string[] = []

    setStoredTokens({ access: 'access-token', refresh: 'refresh-token' })
    worker.use(
      http.get('/api/recipes/recommendations/', ({ request }) => {
        authHeaders.push(request.headers.get('Authorization') ?? '')

        const url = new URL(request.url)
        const ingredients = (url.searchParams.get('ingredients') || '').split(',').filter(Boolean)
        return HttpResponse.json(createRecommendationsResponse(ingredients))
      }),
    )

    const router = await createTestRouter('/recommendations?ingredients=egg,milk')
    const screen = await render(RecommendationsView, { global: { plugins: [router] } })

    await expect.element(screen.getByText('Egg Rice')).toBeInTheDocument()
    await expect.element(screen.getByText('Milk Pasta')).toBeInTheDocument()
    await expect.element(screen.getByText('#egg')).toBeInTheDocument()
    await expect.element(screen.getByText('#milk')).toBeInTheDocument()
    expect(authHeaders).toEqual(['Bearer access-token'])
  })
})
