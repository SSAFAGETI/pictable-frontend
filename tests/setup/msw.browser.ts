import { afterAll, afterEach, beforeAll } from 'vitest'
import { worker } from '../msw/browser'

beforeAll(async () => {
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
  })
})

afterEach(() => {
  worker.resetHandlers()
})

afterAll(async () => {
  await worker.stop()
})
