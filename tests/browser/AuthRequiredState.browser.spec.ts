import { defineComponent } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'
import AuthRequiredState from '../../src/components/AuthRequiredState.vue'

const Placeholder = defineComponent({
  template: '<div />',
})

const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Placeholder },
      { path: '/login', component: Placeholder },
      { path: '/signup', component: Placeholder },
    ],
  })

describe('AuthRequiredState', () => {
  it('renders the custom copy and auth navigation links', async () => {
    const router = createTestRouter()
    await router.push('/')
    await router.isReady()

    const screen = await render(AuthRequiredState, {
      props: {
        title: 'Sign in to continue',
        description: 'Save recipes to your list.',
      },
      global: {
        plugins: [router],
      },
    })

    await expect.element(screen.getByText('Sign in to continue')).toBeInTheDocument()
    await expect.element(screen.getByText('Save recipes to your list.')).toBeInTheDocument()

    const hrefs = Array.from(document.querySelectorAll('a')).map((link) => link.getAttribute('href'))
    expect(hrefs).toContain('/login')
    expect(hrefs).toContain('/signup')
  })
})
