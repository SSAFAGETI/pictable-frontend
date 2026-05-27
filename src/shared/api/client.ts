import { clearServerError, getServerErrorId, reportServerError } from '../../serverStatus'
import { ApiError, getErrorMessage } from './error'
import { clearStoredTokens, getStoredTokens, setStoredTokens, type AuthTokens } from './token'

const DEFAULT_API_BASE_URL = '/api'

const isHttpsBrowser = () => typeof window !== 'undefined' && window.location.protocol === 'https:'

const normalizeApiBaseUrl = () => {
  const configured = String(import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).trim()
  if (!configured) return DEFAULT_API_BASE_URL

  // Never let the HTTPS Vercel app call the HTTP EC2 API directly. Keep it on
  // same-origin /api so Vercel can proxy the request server-to-server.
  if (isHttpsBrowser() && configured.startsWith('http://')) return DEFAULT_API_BASE_URL

  return configured.replace(/\/+$/, '')
}

export const API_BASE_URL = normalizeApiBaseUrl()

type ApiRequestOptions = RequestInit & {
  auth?: boolean
}

type RefreshTokens = (refresh: string) => Promise<AuthTokens>

let refreshTokens: RefreshTokens | null = null

export const configureApiClient = (options: { refreshTokens: RefreshTokens }) => {
  refreshTokens = options.refreshTokens
}

const parseResponseBody = async (response: Response) => {
  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

const apiUrl = (path: string) => {
  if (/^https?:\/\//.test(path)) return path
  return `${API_BASE_URL}/${path.replace(/^\/+/, '')}`
}

const tryRefreshTokens = async (refresh: string) => {
  if (!refreshTokens) throw new ApiError(401, '로그인이 필요합니다.', null)
  const refreshed = await refreshTokens(refresh)
  setStoredTokens(refreshed)
  return refreshed
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}, retryOnUnauthorized = true): Promise<T> {
  const tokens = getStoredTokens()
  const headers = new Headers(options.headers)
  const method = String(options.method || 'GET').toUpperCase()
  const endpoint = apiUrl(path)
  const errorId = getServerErrorId({ method, endpoint, title: path })

  if (options.auth && !tokens?.access) {
    if (tokens?.refresh && retryOnUnauthorized) {
      try {
        await tryRefreshTokens(tokens.refresh)
        return apiRequest<T>(path, options, false)
      } catch {
        clearStoredTokens()
      }
    }

    throw new ApiError(401, '로그인이 필요합니다.', null)
  }

  if (!(options.body instanceof FormData) && options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.auth && tokens?.access && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${tokens.access}`)
  }

  let response: Response

  try {
    response = await fetch(endpoint, { ...options, headers })
  } catch (error) {
    reportServerError({
      id: errorId,
      title: '서버 API 연결 실패',
      message: '서버가 응답하지 않아 임시 데이터로 화면을 표시하고 있습니다.',
      detail: error instanceof Error ? error.message : String(error),
      endpoint,
      method,
    })
    throw error
  }

  const body = await parseResponseBody(response)

  if (response.status === 401 && options.auth && retryOnUnauthorized && tokens?.refresh) {
    try {
      await tryRefreshTokens(tokens.refresh)
      return apiRequest<T>(path, options, false)
    } catch {
      clearStoredTokens()
    }
  }

  if (!response.ok) {
    if (response.status >= 500) {
      reportServerError({
        id: errorId,
        title: '서버 응답 오류',
        message: '서버에서 요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.',
        detail: getErrorMessage(body, `API 요청에 실패했습니다. (${response.status})`),
        endpoint,
        method,
        status: response.status,
      })
    }
    throw new ApiError(response.status, getErrorMessage(body, `API 요청에 실패했습니다. (${response.status})`), body)
  }

  clearServerError(errorId)
  return body as T
}