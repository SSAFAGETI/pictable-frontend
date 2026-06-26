import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../src/shared/api/client'
import { analyzeIngredientImageApi, uniqueIngredients } from '../../src/features/ingredient/api'
import { MAX_INGREDIENTS } from '../../src/shared/constants/ingredients'

vi.mock('../../src/shared/api/client', () => ({
  apiRequest: vi.fn(),
}))

const apiRequestMock = vi.mocked(apiRequest)

describe('ingredient API helpers', () => {
  beforeEach(() => {
    apiRequestMock.mockReset()
  })

  it('keeps up to twenty unique detected ingredients', () => {
    const ingredients = Array.from({ length: 25 }, (_, index) => `재료${index + 1}`)

    expect(uniqueIngredients(ingredients)).toHaveLength(MAX_INGREDIENTS)
    expect(uniqueIngredients(['마늘', '마늘', '양파'])).toEqual(['마늘', '양파'])
  })

  it('prefers detection job results over ingredient-like upload response fields', async () => {
    apiRequestMock
      .mockResolvedValueOnce({
        detection_job_id: 7,
        items: [{ name: 'ocr package text' }],
      })
      .mockResolvedValueOnce({
        status: 'completed',
        items: [{ name: 'tofu' }, { name: 'green onion' }],
      })

    const image = new Blob(['image'], { type: 'image/png' }) as File
    const ingredients = await analyzeIngredientImageApi(image)

    expect(ingredients).toEqual(['tofu', 'green onion'])
    expect(apiRequestMock).toHaveBeenNthCalledWith(
      2,
      '/media/detection/7/',
      expect.objectContaining({ auth: false }),
    )
  })
})
