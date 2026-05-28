import type { Recipe } from '../../data'
import type { AuthTokens } from './token'

export interface LoginResponse extends AuthTokens {
  message?: string
  email?: string
  nickname?: string
  name?: string
}

export interface SignupResponse {
  message?: string
  email?: string
  nickname?: string
}

export interface GoogleAuthResponse extends AuthTokens {
  created?: boolean
  email?: string
  nickname?: string
  name?: string
}

export interface RecipeCreatePayload {
  title: string
  description: string
  cook_time: number
  servings: number
  is_public: boolean
  tag_ids?: number[]
  thumbnail_media?: string | number
  ingredients: Array<{ name: string; amount?: string }>
  steps: Array<{ order: number; description: string; image?: string | number }>
}

export type RecipeUpdatePayload = Partial<RecipeCreatePayload>

export interface HomeSummaryResponse {
  recommended: Recipe | null
  popular: Recipe[]
  recent: Recipe[]
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}


