import { defineComponent } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { render } from 'vitest-browser-vue'
import HomeView from '../../src/views/HomeView.vue'
import { createApiRecipe } from '../fixtures/recipes'
import { worker } from '../msw/browser'

const Placeholder = defineComponent({ template: '<div />' })

const createTestRouter = async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/recommendations', component: Placeholder },
      { path: '/feed', component: Placeholder },
      { path: '/recipe/:id', component: Placeholder },
    ],
  })

  await router.push('/')
  await router.isReady()

  return router
}

const setIngredientInput = (input: HTMLInputElement, value: string) => {
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

const submitIngredient = async (input: HTMLInputElement, value: string) => {
  setIngredientInput(input, value)
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true }))
  await new Promise((resolve) => {
    window.requestAnimationFrame(resolve)
  })
}

const pressComposingEnter = async (input: HTMLInputElement) => {
  const event = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true })
  Object.defineProperty(event, 'isComposing', { value: true })
  input.dispatchEvent(event)
  await new Promise((resolve) => {
    window.requestAnimationFrame(resolve)
  })
}

const waitForDomUpdate = () =>
  new Promise((resolve) => {
    window.requestAnimationFrame(resolve)
  })

describe('HomeView ingredient input', () => {
  it('sanitizes punctuation and caps ingredients at twenty', async () => {
    const router = await createTestRouter()
    const screen = await render(HomeView, { global: { plugins: [router] } })
    const input = document.querySelector<HTMLInputElement>('input[type="text"]')

    expect(input).toBeTruthy()

    setIngredientInput(input!, '마늘, 장아찌!')

    expect(input!.value).toBe('마늘 장아찌')

    await submitIngredient(input!, '마늘, 장아찌!')
    await expect.element(screen.getByText('마늘 장아찌')).toBeInTheDocument()

    for (let index = 2; index <= 21; index += 1) {
      await submitIngredient(input!, `재료${index}`)
    }

    expect(document.body.textContent).toContain('재료20')
    expect(document.body.textContent).not.toContain('재료21')
    expect(input!.disabled).toBe(true)

    const clearButton = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find((button) =>
      button.textContent?.includes('모두 삭제'),
    )
    expect(clearButton).toBeTruthy()

    clearButton!.click()
    await waitForDomUpdate()

    expect(document.body.textContent).not.toContain('재료20')
    expect(input!.disabled).toBe(false)
  })

  it('keeps IME composition enter from swallowing the final Korean ingredient', async () => {
    const router = await createTestRouter()
    const screen = await render(HomeView, { global: { plugins: [router] } })
    const input = document.querySelector<HTMLInputElement>('input[type="text"]')

    expect(input).toBeTruthy()

    setIngredientInput(input!, '캐')
    await pressComposingEnter(input!)

    expect(document.body.textContent).not.toContain('캐')
    expect(input!.value).toBe('캐')

    input!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true }))

    await expect.element(screen.getByText('캐')).toBeInTheDocument()
  })

  it('routes recipe-name searches to the feed page', async () => {
    const router = await createTestRouter()
    await render(HomeView, { global: { plugins: [router] } })
    const searchInput = document.querySelector<HTMLInputElement>('input[type="search"]')

    expect(searchInput).toBeTruthy()

    setIngredientInput(searchInput!, '볶음밥')
    searchInput!.closest('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await waitForDomUpdate()

    expect(router.currentRoute.value.path).toBe('/feed')
    expect(router.currentRoute.value.query.search).toBe('볶음밥')
  })

  it('loads recipe-name suggestions from the feed search API', async () => {
    const feedRequests: string[] = []

    worker.use(
      http.get('/api/feeds/', ({ request }) => {
        feedRequests.push(new URL(request.url).search)

        return HttpResponse.json({
          results: [
            createApiRecipe('suggestion-1', { title: 'Garlic Butter Rice' }),
            createApiRecipe('suggestion-2', { title: 'Garlic Soup' }),
          ],
          next: null,
        })
      }),
    )

    const router = await createTestRouter()
    const screen = await render(HomeView, { global: { plugins: [router] } })
    const searchInput = document.querySelector<HTMLInputElement>('input[type="search"]')

    expect(searchInput).toBeTruthy()

    setIngredientInput(searchInput!, 'garlic')

    await vi.waitFor(() => expect(feedRequests.some((search) => search.includes('search=garlic'))).toBe(true))
    await expect.element(screen.getByText('Garlic Butter Rice')).toBeInTheDocument()

    await screen.getByText('Garlic Butter Rice').click()

    await vi.waitFor(() => expect(router.currentRoute.value.query.search).toBe('Garlic Butter Rice'))
  })
})
