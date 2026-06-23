import { describe, expect, it, vi, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { apiRequest, configureApiClient } from '../../src/shared/api/client'
import { clearServerError, useServerStatus } from '../../src/serverStatus'
import { getStoredTokens, setStoredTokens } from '../../src/shared/api/token'
import { worker } from '../msw/browser'

describe('apiRequest', () => {
  beforeEach(() => {
    window.localStorage.clear()
    clearServerError()
  })

  it('refreshes expired auth tokens and retries the request once', async () => {
    const refreshTokens = vi.fn(async (refresh: string) => ({
      access: 'access-2',
      refresh: `${refresh}-rotated`,
    }))
    const receivedAuthHeaders: string[] = []

    configureApiClient({ refreshTokens })
    setStoredTokens({ access: 'access-1', refresh: 'refresh-1' })

    worker.use(
      http.get('/api/protected/', ({ request }) => {
        receivedAuthHeaders.push(request.headers.get('Authorization') ?? '')

        if (receivedAuthHeaders.length === 1) {
          return HttpResponse.json({ detail: 'expired' }, { status: 401 })
        }

        return HttpResponse.json({ ok: true })
      }),
    )

    await expect(apiRequest<{ ok: boolean }>('/protected/', { auth: true })).resolves.toEqual({ ok: true })
    expect(receivedAuthHeaders).toEqual(['Bearer access-1', 'Bearer access-2'])
    expect(refreshTokens).toHaveBeenCalledWith('refresh-1')
    expect(getStoredTokens()).toEqual({ access: 'access-2', refresh: 'refresh-1-rotated' })
  })

  it('stores a server error when the network request fails', async () => {
    worker.use(http.get('/api/offline/', () => HttpResponse.error()))

    await expect(apiRequest('/offline/')).rejects.toThrow()

    const { serverErrors } = useServerStatus()
    expect(serverErrors.value[0]).toMatchObject({
      endpoint: '/api/offline/',
      method: 'GET',
    })
  })
})
