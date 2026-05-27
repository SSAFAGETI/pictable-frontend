export interface AuthTokens {
  access: string
  refresh: string
}

const TOKEN_STORAGE_KEY = 'chalkkak_tokens'

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage)

export const getStoredTokens = (): AuthTokens | null => {
  if (!canUseStorage()) return null

  try {
    const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as Partial<AuthTokens>
    if (!parsed.access || !parsed.refresh) return null
    return { access: parsed.access, refresh: parsed.refresh }
  } catch {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    return null
  }
}

export const setStoredTokens = (tokens: AuthTokens) => {
  if (!canUseStorage()) return
  window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens))
}

export const clearStoredTokens = () => {
  if (!canUseStorage()) return
  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
}