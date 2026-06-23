import { defineComponent } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'
import HomeView from '../../src/views/HomeView.vue'

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
  })
})
