import type { Ref } from 'vue'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Ingredient {
  id: string
  name: string
  amount?: string
}

export interface Recipe {
  id: string
  title: string
  description: string
  image: string
  cookTime: number
  difficulty: Difficulty
  servings: number
  ingredients: Ingredient[]
  steps: string[]
  stepImages: string[]
  likes: number
  saves: number
  comments: number
  isLiked?: boolean
  isSaved?: boolean
  tags: string[]
  author: string
  authorId?: string
  needsPublicImageLookup?: boolean
  createdAt: string
}

export interface RecipeRecommendation extends Recipe {
  matchRate?: number
  matchedIngredients: string[]
  missingIngredients: string[]
}

export const difficultyLabels: Record<Difficulty, string> = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
}

export interface RecipeStoreState {
  recipes: Ref<Recipe[]>
  recipesLoading: Ref<boolean>
  recipesError: Ref<string>
}
