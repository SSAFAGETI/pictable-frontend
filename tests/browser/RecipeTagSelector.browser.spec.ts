import { defineComponent, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'
import RecipeTagSelector from '../../src/components/RecipeTagSelector.vue'

const Harness = defineComponent({
  components: { RecipeTagSelector },
  setup() {
    const selected = ref<number[]>([])
    return { selected }
  },
  template: `
    <div>
      <RecipeTagSelector v-model="selected" :show-all="true" />
      <output data-testid="selected">{{ selected.join(',') }}</output>
    </div>
  `,
})

const getButtons = () => Array.from(document.querySelectorAll<HTMLButtonElement>('button'))

describe('RecipeTagSelector', () => {
  it('toggles tags and resets the selection with the all button', async () => {
    const screen = await render(Harness)

    expect(getButtons()).toHaveLength(13)

    await getButtons()[1].click()
    await expect.element(screen.getByTestId('selected')).toHaveTextContent('1')

    await getButtons()[2].click()
    await expect.element(screen.getByTestId('selected')).toHaveTextContent('1,2')

    await getButtons()[0].click()
    await expect.element(screen.getByTestId('selected')).toBeEmptyDOMElement()
  })
})
