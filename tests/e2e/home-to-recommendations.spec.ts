import { expect, test } from '@playwright/test'
import { createHomeSummaryResponse } from '../fixtures/recipes'

test.beforeEach(async ({ page }) => {
  await page.route('**/api/home/summary/', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(createHomeSummaryResponse()),
    })
  })
})

test('navigates to recommendations with the selected ingredient', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('textbox').fill('egg')
  await page.keyboard.press('Enter')
  await page.locator('button').filter({ has: page.locator('svg.lucide-sparkles') }).click()

  await expect(page).toHaveURL(/\/recommendations\?ingredients=egg$/)
  await expect(page.getByText('#egg')).toBeVisible()
})
