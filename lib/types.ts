export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
}

export interface Ingredient {
  id: string
  name: string
  category: 'vegetable' | 'meat' | 'seafood' | 'dairy' | 'grain' | 'seasoning' | 'other'
  icon?: string
}

export interface Recipe {
  id: string
  title: string
  description: string
  image: string
  cookTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  servings: number
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  nutrition?: NutritionInfo
  author: User
  likes: number
  saves: number
  isLiked?: boolean
  isSaved?: boolean
  createdAt: Date
  tags: string[]
}

export interface RecipeIngredient {
  ingredient: Ingredient
  amount: string
  isOptional?: boolean
  isMissing?: boolean
}

export interface RecipeStep {
  order: number
  description: string
  image?: string
  duration?: number
}

export interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: Date
  replies?: Comment[]
}

export interface UserRecipe {
  id: string
  title: string
  description: string
  image: string
  cookTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  servings: number
  ingredients: { name: string; amount: string }[]
  steps: { description: string; image?: string }[]
  author: User
  likes: number
  comments: Comment[]
  isLiked?: boolean
  createdAt: Date
  tags: string[]
}

export interface AIRecommendation {
  recipe: Recipe
  matchPercentage: number
  missingIngredients: Ingredient[]
  availableIngredients: Ingredient[]
}

export type DifficultyLabel = {
  [key in Recipe['difficulty']]: string
}

export const DIFFICULTY_LABELS: DifficultyLabel = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
}

export const INGREDIENT_CATEGORIES = {
  vegetable: '채소',
  meat: '고기',
  seafood: '해산물',
  dairy: '유제품',
  grain: '곡물',
  seasoning: '양념',
  other: '기타',
} as const
