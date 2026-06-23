import { afterEach, vi } from 'vitest'
import { clearServerError } from '../../src/serverStatus'

afterEach(() => {
  window.localStorage.clear()
  window.sessionStorage.clear()
  clearServerError()
  vi.restoreAllMocks()
})
