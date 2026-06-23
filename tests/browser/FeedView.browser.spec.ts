import { defineComponent } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { render } from 'vitest-browser-vue'
import FeedView from '../../src/views/FeedView.vue'
import { initializeAuth } from '../../src/auth'
import { setStoredTokens } from '../../src/shared/api/token'
import { createApiRecipe } from '../fixtures/recipes'
import { worker } from '../msw/browser'

const Placeholder = defineComponent({ template: '<div />' })

const createTestRouter = async (path = '/feed') => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/feed', component: FeedView },
      { path: '/recipe/:id', component: Placeholder },
      { path: '/my-recipe/:id/edit', component: Placeholder },
    ],
  })

  await router.push(path)
  await router.isReady()
  return router
}

const setInputValue = (input: HTMLInputElement, value: string) => {
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('FeedView', () => {
  it('loads feed recipes, filters them locally, and calls the save API', async () => {
    const feedRequests: string[] = []
    const saveRequests: string[] = []

    setStoredTokens({ access: 'access-token', refresh: 'refresh-token' })
    await initializeAuth()

    worker.use(
      http.get('/api/feeds/', ({ request }) => {
        feedRequests.push(new URL(request.url).search)

        return HttpResponse.json({
          results: [
            createApiRecipe('feed-1', { title: 'Apple Soup', like_count: 1, save_count: 0 }),
            createApiRecipe('feed-2', { title: 'Banana Rice', like_count: 7, save_count: 3 }),
          ],
          next: null,
        })
      }),
      http.post('/api/recipes/:id/save/', ({ params }) => {
        saveRequests.push(String(params.id))
        return HttpResponse.json({ saved: true, save_count: 4 })
      }),
    )

    const router = await createTestRouter()
    const screen = await render(FeedView, { global: { plugins: [router] } })

    await expect.element(screen.getByText('Apple Soup')).toBeInTheDocument()
    await expect.element(screen.getByText('Banana Rice')).toBeInTheDocument()
    expect(feedRequests[0]).toContain('sort=popular')
    expect(feedRequests[0]).toContain('page_size=12')

    const searchInput = document.querySelector<HTMLInputElement>('input:not([type="file"])')
    expect(searchInput).toBeTruthy()
    setInputValue(searchInput!, 'Banana')

    await expect.element(screen.getByText('Banana Rice')).toBeInTheDocument()
    await vi.waitFor(() => expect(document.body.textContent).not.toContain('Apple Soup'))

    const saveButton = document.querySelector<HTMLButtonElement>('a[href="/recipe/feed-2"] button[aria-label]')
    expect(saveButton).toBeTruthy()
    await saveButton!.click()

    await vi.waitFor(() => expect(saveRequests).toEqual(['feed-2']))
  })

  it('hydrates recipe-name search from the route query', async () => {
    const feedRequests: string[] = []

    worker.use(
      http.get('/api/feeds/', ({ request }) => {
        feedRequests.push(new URL(request.url).search)

        return HttpResponse.json({
          results: [
            createApiRecipe('feed-1', { title: 'Apple Soup' }),
            createApiRecipe('feed-2', { title: 'Banana Rice' }),
          ],
          next: null,
        })
      }),
    )

    const router = await createTestRouter('/feed?search=Banana')
    const screen = await render(FeedView, { global: { plugins: [router] } })
    const searchInput = document.querySelector<HTMLInputElement>('input:not([type="file"])')

    expect(searchInput).toBeTruthy()
    expect(searchInput!.value).toBe('Banana')
    await vi.waitFor(() => expect(feedRequests[0]).toContain('search=Banana'))
    await expect.element(screen.getByText('Banana Rice')).toBeInTheDocument()
    await vi.waitFor(() => expect(document.body.textContent).not.toContain('Apple Soup'))
  })
})
