import { afterEach, vi } from 'vitest'
import { initializeAuth } from '../../src/auth'
import { clearServerError } from '../../src/serverStatus'

afterEach(async () => {
  window.localStorage.clear()
  window.sessionStorage.clear()
  clearServerError()
  await initializeAuth()
  vi.restoreAllMocks()
})
