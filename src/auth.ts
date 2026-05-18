import { computed, ref } from 'vue'
import {
  clearStoredTokens,
  fetchMeApi,
  getStoredTokens,
  googleAuthApi,
  loginApi,
  logoutApi,
  setStoredTokens,
  signupApi,
} from './api'
import { notifications } from './data'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  provider: 'email' | 'google'
  createdAt: string
}

const STORAGE_KEY = 'chalkkak_user'
const user = ref<User | null>(null)
const isLoading = ref(true)

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage)

const saveUser = (nextUser: User) => {
  user.value = nextUser
  if (canUseStorage()) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
}

const removeUser = () => {
  user.value = null
  if (canUseStorage()) window.localStorage.removeItem(STORAGE_KEY)
}

const userFromApi = (raw: Record<string, unknown>, provider: User['provider'], fallbackEmail = ''): User => {
  const email = String(raw.email || fallbackEmail || '')
  const name = String(raw.nickname || raw.name || raw.username || email.split('@')[0] || '찰칵밥상 유저')

  return {
    id: String(raw.id || raw.pk || `${provider}-${email || Date.now()}`),
    name,
    email,
    avatar: typeof raw.avatar === 'string' ? raw.avatar : typeof raw.profile_image === 'string' ? raw.profile_image : undefined,
    provider,
    createdAt: String(raw.created_at || new Date().toISOString()),
  }
}

const addWelcomeNotification = (name: string, provider: 'email' | 'google') => {
  notifications.unshift({
    id: `welcome-${Date.now()}`,
    title: '찰칵밥상에 오신 것을 환영합니다',
    message:
      provider === 'google'
        ? `${name}님, 구글 계정으로 시작하셨어요. 오늘 만들 레시피를 찾아보세요.`
        : `${name}님, 회원가입이 완료되었습니다. 나만의 레시피를 등록해보세요.`,
  })
}

const fallbackLogin = (email: string) => {
  saveUser({
    id: `local-${Date.now()}`,
    name: email.split('@')[0] || '찰칵밥상 유저',
    email,
    provider: 'email',
    createdAt: new Date().toISOString(),
  })
}

export const initializeAuth = async () => {
  if (!canUseStorage()) {
    isLoading.value = false
    return
  }

  const storedUser = window.localStorage.getItem(STORAGE_KEY)
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser) as User
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  if (getStoredTokens()) {
    try {
      const me = await fetchMeApi()
      const nextUser = userFromApi(me, user.value?.provider || 'email', user.value?.email)
      saveUser(nextUser)
    } catch {
      clearStoredTokens()
    }
  }

  isLoading.value = false
}

export const useAuth = () => {
  const login = async (email: string, password: string) => {
    if (!email || !password) throw new Error('이메일과 비밀번호를 입력해주세요.')

    try {
      const response = await loginApi({ email, password })
      setStoredTokens({ access: response.access, refresh: response.refresh })
      saveUser(
        userFromApi(
          {
            email: response.email || email,
            nickname: response.nickname || response.name,
          },
          'email',
          email,
        ),
      )
    } catch (error) {
      if (error instanceof TypeError) {
        fallbackLogin(email)
        return
      }
      throw error
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    if (!name || !email || !password) throw new Error('모든 필드를 입력해주세요.')
    if (password.length < 8) throw new Error('비밀번호는 8자 이상이어야 합니다.')

    try {
      const response = await signupApi({ email, password, nickname: name })
      const nextUser = userFromApi({ email: response.email || email, nickname: response.nickname || name }, 'email', email)
      addWelcomeNotification(nextUser.name, 'email')
      await login(email, password)
    } catch (error) {
      if (error instanceof TypeError) {
        const nextUser: User = {
          id: `local-${Date.now()}`,
          name,
          email,
          provider: 'email',
          createdAt: new Date().toISOString(),
        }
        saveUser(nextUser)
        addWelcomeNotification(nextUser.name, 'email')
        return
      }
      throw error
    }
  }

  const loginWithGoogle = async (code?: string) => {
    if (code) {
      try {
        const response = await googleAuthApi(code)
        setStoredTokens({ access: response.access, refresh: response.refresh })
        const nextUser = userFromApi(
          {
            email: response.email,
            nickname: response.nickname || response.name,
          },
          'google',
        )
        saveUser(nextUser)
        if (response.created) addWelcomeNotification(nextUser.name, 'google')
        return
      } catch (error) {
        if (!(error instanceof TypeError)) throw error
      }
    }

    const nextUser: User = {
      id: `google-${Date.now()}`,
      name: '구글 사용자',
      email: 'user@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
      provider: 'google',
      createdAt: new Date().toISOString(),
    }
    saveUser(nextUser)
    addWelcomeNotification(nextUser.name, 'google')
  }

  const logout = async () => {
    const tokens = getStoredTokens()
    if (tokens?.refresh) {
      try {
        await logoutApi(tokens.refresh)
      } catch {
        // Logout must clear the local session even if the server is temporarily unreachable.
      }
    }
    clearStoredTokens()
    removeUser()
  }

  return {
    user,
    isLoading,
    isAuthenticated: computed(() => Boolean(user.value)),
    login,
    signup,
    logout,
    loginWithGoogle,
  }
}
