'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Comment, User, UserRecipe } from '@/lib/types'

export interface PublicRecipeInteraction {
  recipeId: string
  likes: number
  isLiked: boolean
  comments: Comment[]
}

export interface Subscription {
  subscriber: User
  author: User
  subscribedAt: Date
}

interface RecipeContextType {
  userRecipes: UserRecipe[]
  publicInteractions: Record<string, PublicRecipeInteraction>
  subscriptions: Subscription[]
  addRecipe: (recipe: Omit<UserRecipe, 'id' | 'likes' | 'comments' | 'isLiked' | 'createdAt'>) => void
  toggleLike: (recipeId: string, userId: string) => void
  addComment: (recipeId: string, comment: Omit<Comment, 'id' | 'createdAt' | 'replies'>) => void
  addReply: (recipeId: string, commentId: string, reply: Omit<Comment, 'id' | 'createdAt' | 'replies'>) => void
  getRecipe: (recipeId: string) => UserRecipe | undefined
  getPublicInteraction: (recipeId: string) => PublicRecipeInteraction | undefined
  togglePublicLike: (recipeId: string, baseLikes: number) => void
  addPublicComment: (recipeId: string, baseLikes: number, comment: Omit<Comment, 'id' | 'createdAt' | 'replies'>) => void
  addPublicReply: (recipeId: string, baseLikes: number, commentId: string, reply: Omit<Comment, 'id' | 'createdAt' | 'replies'>) => void
  toggleSubscription: (subscriber: User, author: User) => void
  isSubscribedTo: (subscriberId: string, authorId: string) => boolean
  getSubscribedAuthors: (subscriberId: string) => User[]
  getFollowers: (user: User) => User[]
}

const USER_RECIPES_KEY = 'chalkak_user_recipes'
const PUBLIC_INTERACTIONS_KEY = 'chalkak_public_recipe_interactions'
const SUBSCRIPTIONS_KEY = 'chalkak_subscriptions'

const RecipeContext = createContext<RecipeContextType | undefined>(undefined)

const seedAuthor: User = {
  id: 'author-1',
  email: 'cook@example.com',
  name: '밥상 연구가',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  createdAt: new Date('2024-01-15'),
}

const initialRecipes: UserRecipe[] = [
  {
    id: 'user-1',
    title: '초간단 참치마요 덮밥',
    description: '5분이면 완성되는 자취생 최애 한 그릇 메뉴',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
    cookTime: 5,
    difficulty: 'easy',
    servings: 1,
    ingredients: [
      { name: '참치캔', amount: '1개' },
      { name: '밥', amount: '1공기' },
      { name: '마요네즈', amount: '2큰술' },
      { name: '간장', amount: '1작은술' },
    ],
    steps: [
      { description: '참치캔의 기름을 빼주세요.' },
      { description: '마요네즈와 간장을 섞어 참치와 버무려주세요.' },
      { description: '따뜻한 밥 위에 올리면 완성입니다.' },
    ],
    author: seedAuthor,
    likes: 42,
    comments: [
      {
        id: 'c1',
        userId: 'reader-1',
        userName: '든든한 하루',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        content: '진짜 맛있어요. 퇴근하고 바로 해먹기 좋네요.',
        createdAt: new Date('2024-03-10'),
        replies: [
          {
            id: 'r1',
            userId: 'author-1',
            userName: '밥상 연구가',
            userAvatar: seedAuthor.avatar,
            content: '감사합니다! 김가루를 조금 올리면 더 맛있어요.',
            createdAt: new Date('2024-03-10'),
          },
        ],
      },
    ],
    isLiked: false,
    createdAt: new Date('2024-03-08'),
    tags: ['자취요리', '초간단', '참치'],
  },
  {
    id: 'user-2',
    title: '전자레인지 계란찜',
    description: '냄비 없이 전자레인지로 만드는 부드러운 계란찜',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop',
    cookTime: 8,
    difficulty: 'easy',
    servings: 1,
    ingredients: [
      { name: '계란', amount: '2개' },
      { name: '물', amount: '계란과 같은 양' },
      { name: '참기름', amount: '약간' },
      { name: '소금', amount: '약간' },
    ],
    steps: [
      { description: '계란을 물과 잘 섞어주세요.' },
      { description: '소금으로 간을 맞춰주세요.' },
      { description: '전자레인지에서 2분 30초 돌려주세요.' },
      { description: '참기름을 살짝 둘러 완성합니다.' },
    ],
    author: {
      id: 'author-2',
      email: 'easy@example.com',
      name: '원룸요리사',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      createdAt: new Date('2024-02-01'),
    },
    likes: 128,
    comments: [],
    isLiked: false,
    createdAt: new Date('2024-03-05'),
    tags: ['전자레인지', '계란', '초간단'],
  },
  {
    id: 'user-3',
    title: '라면 업그레이드 레시피',
    description: '평범한 라면을 식당 스타일로 바꾸는 작은 팁',
    image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=600&h=400&fit=crop',
    cookTime: 10,
    difficulty: 'easy',
    servings: 1,
    ingredients: [
      { name: '라면', amount: '1봉' },
      { name: '계란', amount: '1개' },
      { name: '파', amount: '약간' },
      { name: '치즈', amount: '1장' },
    ],
    steps: [
      { description: '물을 평소보다 조금 적게 넣어주세요.' },
      { description: '면이 거의 익으면 계란을 넣어주세요.' },
      { description: '불을 끄고 치즈를 올린 뒤 뚜껑을 덮어주세요.' },
      { description: '파를 올려 마무리합니다.' },
    ],
    author: {
      id: 'author-3',
      email: 'ramen@example.com',
      name: '라면마스터',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      createdAt: new Date('2024-01-20'),
    },
    likes: 256,
    comments: [],
    isLiked: false,
    createdAt: new Date('2024-03-01'),
    tags: ['라면', '분식', '치즈'],
  },
]

const demoFollowers: User[] = [
  {
    id: 'follower-1',
    email: 'reader1@example.com',
    name: '든든한 하루',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    createdAt: new Date('2024-03-10'),
  },
  {
    id: 'follower-2',
    email: 'reader2@example.com',
    name: '야식탐험가',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    createdAt: new Date('2024-03-18'),
  },
]

function reviveUser(user: User): User {
  return {
    ...user,
    createdAt: new Date(user.createdAt),
  }
}

function reviveComment(comment: Comment): Comment {
  return {
    ...comment,
    createdAt: new Date(comment.createdAt),
    replies: comment.replies?.map(reviveComment) ?? [],
  }
}

function reviveRecipe(recipe: UserRecipe): UserRecipe {
  return {
    ...recipe,
    createdAt: new Date(recipe.createdAt),
    author: reviveUser(recipe.author),
    comments: recipe.comments.map(reviveComment),
  }
}

function reviveInteraction(interaction: PublicRecipeInteraction): PublicRecipeInteraction {
  return {
    ...interaction,
    comments: interaction.comments.map(reviveComment),
  }
}

function reviveSubscription(subscription: Subscription): Subscription {
  return {
    ...subscription,
    subscriber: reviveUser(subscription.subscriber),
    author: reviveUser(subscription.author),
    subscribedAt: new Date(subscription.subscribedAt),
  }
}

function createInteraction(recipeId: string, baseLikes: number): PublicRecipeInteraction {
  return {
    recipeId,
    likes: baseLikes,
    isLiked: false,
    comments: [],
  }
}

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [userRecipes, setUserRecipes] = useState<UserRecipe[]>(initialRecipes)
  const [publicInteractions, setPublicInteractions] = useState<Record<string, PublicRecipeInteraction>>({})
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])

  useEffect(() => {
    const storedRecipes = localStorage.getItem(USER_RECIPES_KEY)
    const storedInteractions = localStorage.getItem(PUBLIC_INTERACTIONS_KEY)
    const storedSubscriptions = localStorage.getItem(SUBSCRIPTIONS_KEY)

    if (storedRecipes) {
      try {
        setUserRecipes(JSON.parse(storedRecipes).map(reviveRecipe))
      } catch {
        setUserRecipes(initialRecipes)
      }
    }

    if (storedInteractions) {
      try {
        const parsed = JSON.parse(storedInteractions) as Record<string, PublicRecipeInteraction>
        setPublicInteractions(
          Object.fromEntries(Object.entries(parsed).map(([id, interaction]) => [id, reviveInteraction(interaction)]))
        )
      } catch {
        setPublicInteractions({})
      }
    }

    if (storedSubscriptions) {
      try {
        setSubscriptions(JSON.parse(storedSubscriptions).map(reviveSubscription))
      } catch {
        setSubscriptions([])
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(USER_RECIPES_KEY, JSON.stringify(userRecipes))
  }, [userRecipes])

  useEffect(() => {
    localStorage.setItem(PUBLIC_INTERACTIONS_KEY, JSON.stringify(publicInteractions))
  }, [publicInteractions])

  useEffect(() => {
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions))
  }, [subscriptions])

  const addRecipe: RecipeContextType['addRecipe'] = (recipe) => {
    const newRecipe: UserRecipe = {
      ...recipe,
      id: `user-${Date.now()}`,
      likes: 0,
      comments: [],
      isLiked: false,
      createdAt: new Date(),
    }
    setUserRecipes((prev) => [newRecipe, ...prev])
  }

  const toggleLike = (recipeId: string) => {
    setUserRecipes((prev) =>
      prev.map((recipe) =>
        recipe.id === recipeId
          ? { ...recipe, isLiked: !recipe.isLiked, likes: recipe.isLiked ? Math.max(0, recipe.likes - 1) : recipe.likes + 1 }
          : recipe
      )
    )
  }

  const addComment: RecipeContextType['addComment'] = (recipeId, comment) => {
    const newComment: Comment = {
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: new Date(),
      replies: [],
    }
    setUserRecipes((prev) =>
      prev.map((recipe) => (recipe.id === recipeId ? { ...recipe, comments: [...recipe.comments, newComment] } : recipe))
    )
  }

  const addReply: RecipeContextType['addReply'] = (recipeId, commentId, reply) => {
    const newReply: Comment = {
      ...reply,
      id: `reply-${Date.now()}`,
      createdAt: new Date(),
    }
    setUserRecipes((prev) =>
      prev.map((recipe) =>
        recipe.id === recipeId
          ? {
              ...recipe,
              comments: recipe.comments.map((comment) =>
                comment.id === commentId ? { ...comment, replies: [...(comment.replies ?? []), newReply] } : comment
              ),
            }
          : recipe
      )
    )
  }

  const togglePublicLike = (recipeId: string, baseLikes: number) => {
    setPublicInteractions((prev) => {
      const current = prev[recipeId] ?? createInteraction(recipeId, baseLikes)
      return {
        ...prev,
        [recipeId]: {
          ...current,
          isLiked: !current.isLiked,
          likes: current.isLiked ? Math.max(0, current.likes - 1) : current.likes + 1,
        },
      }
    })
  }

  const addPublicComment: RecipeContextType['addPublicComment'] = (recipeId, baseLikes, comment) => {
    const newComment: Comment = {
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: new Date(),
      replies: [],
    }
    setPublicInteractions((prev) => {
      const current = prev[recipeId] ?? createInteraction(recipeId, baseLikes)
      return {
        ...prev,
        [recipeId]: {
          ...current,
          comments: [...current.comments, newComment],
        },
      }
    })
  }

  const addPublicReply: RecipeContextType['addPublicReply'] = (recipeId, baseLikes, commentId, reply) => {
    const newReply: Comment = {
      ...reply,
      id: `reply-${Date.now()}`,
      createdAt: new Date(),
    }
    setPublicInteractions((prev) => {
      const current = prev[recipeId] ?? createInteraction(recipeId, baseLikes)
      return {
        ...prev,
        [recipeId]: {
          ...current,
          comments: current.comments.map((comment) =>
            comment.id === commentId ? { ...comment, replies: [...(comment.replies ?? []), newReply] } : comment
          ),
        },
      }
    })
  }

  const toggleSubscription: RecipeContextType['toggleSubscription'] = (subscriber, author) => {
    if (subscriber.id === author.id) return

    setSubscriptions((prev) => {
      const exists = prev.some((subscription) => subscription.subscriber.id === subscriber.id && subscription.author.id === author.id)

      if (exists) {
        return prev.filter((subscription) => !(subscription.subscriber.id === subscriber.id && subscription.author.id === author.id))
      }

      return [
        {
          subscriber,
          author,
          subscribedAt: new Date(),
        },
        ...prev,
      ]
    })
  }

  const isSubscribedTo: RecipeContextType['isSubscribedTo'] = (subscriberId, authorId) =>
    subscriptions.some((subscription) => subscription.subscriber.id === subscriberId && subscription.author.id === authorId)

  const getSubscribedAuthors: RecipeContextType['getSubscribedAuthors'] = (subscriberId) =>
    subscriptions.filter((subscription) => subscription.subscriber.id === subscriberId).map((subscription) => subscription.author)

  const getFollowers: RecipeContextType['getFollowers'] = (user) => {
    const subscribers = subscriptions
      .filter((subscription) => subscription.author.id === user.id)
      .map((subscription) => subscription.subscriber)
    const followerMap = new Map([...demoFollowers, ...subscribers].map((follower) => [follower.id, follower]))
    return Array.from(followerMap.values())
  }

  const value = useMemo(
    () => ({
      userRecipes,
      publicInteractions,
      subscriptions,
      addRecipe,
      toggleLike,
      addComment,
      addReply,
      getRecipe: (recipeId: string) => userRecipes.find((recipe) => recipe.id === recipeId),
      getPublicInteraction: (recipeId: string) => publicInteractions[recipeId],
      togglePublicLike,
      addPublicComment,
      addPublicReply,
      toggleSubscription,
      isSubscribedTo,
      getSubscribedAuthors,
      getFollowers,
    }),
    [publicInteractions, subscriptions, userRecipes]
  )

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>
}

export function useRecipes() {
  const context = useContext(RecipeContext)
  if (!context) {
    throw new Error('useRecipes must be used within a RecipeProvider')
  }
  return context
}
