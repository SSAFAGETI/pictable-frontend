import { apiRequest, configureApiClient } from '../../shared/api/client'
import type { AuthTokens } from '../../shared/api/token'
import type { GoogleAuthResponse, LoginResponse, SignupResponse } from '../../shared/api/types'

export const signupApi = (body: { email: string; password: string; nickname?: string }) =>
  apiRequest<SignupResponse>('/auth/signup/', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const loginApi = (body: { email: string; password: string }) =>
  apiRequest<LoginResponse>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const logoutApi = (refresh: string) =>
  apiRequest<{ message?: string }>('/auth/logout/', {
    method: 'POST',
    body: JSON.stringify({ refresh }),
    auth: true,
  })

export const refreshApi = (refresh: string) =>
  apiRequest<AuthTokens>(
    '/auth/refresh/',
    {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    },
    false,
  )

configureApiClient({ refreshTokens: refreshApi })

export const googleAuthApi = (code: string, redirectUri?: string) =>
  apiRequest<GoogleAuthResponse>('/auth/google/', {
    method: 'POST',
    body: JSON.stringify(redirectUri ? { code, redirect_uri: redirectUri } : { code }),
  })

