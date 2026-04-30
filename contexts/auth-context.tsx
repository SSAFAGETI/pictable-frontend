'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNotifications } from '@/contexts/notification-context'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loginWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'chalkkak_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { addNotification } = useNotifications()

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem(STORAGE_KEY)
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Mock login - in production, call your auth API
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // Simulate validation
    if (!email || !password) {
      throw new Error('이메일과 비밀번호를 입력해주세요.')
    }

    const mockUser: User = {
      id: 'user_' + Date.now(),
      name: email.split('@')[0],
      email,
      createdAt: new Date().toISOString(),
    }

    setUser(mockUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser))
    addNotification({
      title: '찰칵밥상에 오신 것을 환영합니다',
      message: `${name}님, 회원가입이 완료되었습니다. 나만의 레시피를 등록해보세요.`,
      href: '/my-recipe/new',
    })
  }

  const signup = async (name: string, email: string, password: string) => {
    // Mock signup - in production, call your auth API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (!name || !email || !password) {
      throw new Error('모든 필드를 입력해주세요.')
    }

    if (password.length < 8) {
      throw new Error('비밀번호는 8자 이상이어야 합니다.')
    }

    const mockUser: User = {
      id: 'user_' + Date.now(),
      name,
      email,
      createdAt: new Date().toISOString(),
    }

    setUser(mockUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser))
    addNotification({
      title: '찰칵밥상에 오신 것을 환영합니다',
      message: `${mockUser.name}님, 구글 계정으로 시작되었습니다. 오늘 만들 레시피를 찾아보세요.`,
      href: '/',
    })
  }

  const loginWithGoogle = async () => {
    // Mock Google OAuth - in production, use actual OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockUser: User = {
      id: 'google_' + Date.now(),
      name: '구글 사용자',
      email: 'user@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
      createdAt: new Date().toISOString(),
    }

    setUser(mockUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
