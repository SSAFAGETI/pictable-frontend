import { defineComponent, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { render } from 'vitest-browser-vue'
import RecipeEditorView from '../../src/views/RecipeEditorView.vue'
import { initializeAuth } from '../../src/auth'
import { setStoredTokens } from '../../src/shared/api/token'
import { createApiRecipe } from '../fixtures/recipes'
import { worker } from '../msw/browser'

const Placeholder = defineComponent({ template: '<div />' })

const createTestRouter = async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/my-recipe/new', component: RecipeEditorView },
      { path: '/feed', component: Placeholder },
      { path: '/login', component: Placeholder },
      { path: '/signup', component: Placeholder },
    ],
  })

  await router.push('/my-recipe/new')
  await router.isReady()
  return router
}

const setText = (field: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  field.value = value
  field.dispatchEvent(new Event('input', { bubbles: true }))
}

const setSelect = (field: HTMLSelectElement, value: string) => {
  field.value = value
  field.dispatchEvent(new Event('change', { bubbles: true }))
}

describe('RecipeEditorView', () => {
  it('submits a new recipe payload and returns to the my-recipes feed', async () => {
    let createPayload: Record<string, unknown> | null = null
    const authHeaders: string[] = []

    setStoredTokens({ access: 'access-token', refresh: 'refresh-token' })
    await initializeAuth()

    worker.use(
      http.post('/api/recipes/', async ({ request }) => {
        authHeaders.push(request.headers.get('Authorization') ?? '')
        createPayload = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(createApiRecipe('created-1', createPayload), { status: 201 })
      }),
    )

    const router = await createTestRouter()
    await render(RecipeEditorView, { global: { plugins: [router] } })

    const textInputs = Array.from(document.querySelectorAll<HTMLInputElement>('input:not([type="file"])'))
    const textareas = Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea'))
    const selects = Array.from(document.querySelectorAll<HTMLSelectElement>('select'))
    const tagButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.tag-filter-scroll button'))
    const submitButton = document.querySelector<HTMLButtonElement>('button[type="submit"]')

    expect(textInputs.length).toBeGreaterThanOrEqual(3)
    expect(textareas.length).toBeGreaterThanOrEqual(2)
    expect(selects).toHaveLength(2)
    expect(tagButtons.length).toBeGreaterThan(0)
    expect(submitButton).toBeTruthy()

    setText(textInputs[0], 'Kimchi Fried Rice')
    setText(textareas[0], 'Fast weeknight rice.')
    await tagButtons[0].click()
    setSelect(selects[0], '15')
    setSelect(selects[1], '2')
    setText(textInputs[1], 'Kimchi')
    setText(textInputs[2], '1 cup')
    setText(textareas[1], 'Stir-fry rice and kimchi together.')
    await nextTick()

    await submitButton!.click()

    await vi.waitFor(() => {
      expect(createPayload).toMatchObject({
        title: 'Kimchi Fried Rice',
        description: 'Fast weeknight rice.',
        cook_time: 15,
        servings: 2,
        is_public: true,
        tag_ids: [1],
      })
    })

    const submittedPayload = createPayload as unknown as Record<string, unknown>
    expect(submittedPayload.ingredients).toEqual([{ name: 'Kimchi', amount: '1 cup' }])
    expect(submittedPayload.steps).toEqual([{ order: 1, description: 'Stir-fry rice and kimchi together.' }])
    expect(authHeaders).toEqual(['Bearer access-token'])
    await vi.waitFor(() => expect(router.currentRoute.value.fullPath).toBe('/feed?source=my&sort=recent'))
  })
})
