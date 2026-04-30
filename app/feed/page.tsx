'use client'

import { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChefHat, Clock, Heart, MessageCircle, Search, SlidersHorizontal, TrendingUp } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { type PublicRecipeInteraction, useRecipes } from '@/contexts/recipe-context'
import { getCommentCount, userRecipeToRecipe } from '@/lib/recipe-adapters'
import { mockRecipes } from '@/lib/mock-data'
import { DIFFICULTY_LABELS, type Recipe, type UserRecipe } from '@/lib/types'
import { cn } from '@/lib/utils'

type SortOption = 'popular' | 'recent' | 'likes'
const PUBLIC_TAGS = ['자취요리', '초간단', '한식', '야식', '국물요리', '볶음밥', '반찬', '도시락', '라면', '안주']

function FeedContent() {
  const searchParams = useSearchParams()
  const source = searchParams.get('source')
  const initialTag = searchParams.get('tag') || ''
  const initialSort = (searchParams.get('sort') as SortOption) || 'popular'
  const { publicInteractions, userRecipes } = useRecipes()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTag ? [initialTag] : [])
  const [sortBy, setSortBy] = useState<SortOption>(initialSort)

  const isMyRecipeFeed = source === 'my'
  const recipeRows = useMemo(() => {
    const rows: Array<{ recipe: Recipe; userRecipe?: UserRecipe; interaction?: PublicRecipeInteraction }> = isMyRecipeFeed
      ? userRecipes.map((recipe) => ({ recipe: userRecipeToRecipe(recipe), userRecipe: recipe }))
      : mockRecipes.map((recipe) => ({ recipe, interaction: publicInteractions[recipe.id] }))

    return rows
      .filter(({ recipe }) => {
        const queryMatch =
          !searchQuery ||
          recipe.title.includes(searchQuery) ||
          recipe.description.includes(searchQuery) ||
          recipe.tags.some((tag) => tag.includes(searchQuery))
        const tagMatch = selectedTags.length === 0 || selectedTags.every((tag) => recipe.tags.includes(tag))
        return queryMatch && tagMatch
      })
      .sort((a, b) => {
        if (sortBy === 'recent') return b.recipe.createdAt.getTime() - a.recipe.createdAt.getTime()
        if (sortBy === 'likes') return b.recipe.likes - a.recipe.likes
        return b.recipe.likes + b.recipe.saves - (a.recipe.likes + a.recipe.saves)
      })
  }, [isMyRecipeFeed, publicInteractions, searchQuery, selectedTags, sortBy, userRecipes])

  const tags = isMyRecipeFeed ? Array.from(new Set(userRecipes.flatMap((recipe) => recipe.tags))).filter(Boolean) : PUBLIC_TAGS
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]))
  }
  const resetFilters = () => {
    setSearchQuery('')
    setSelectedTags([])
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header title={isMyRecipeFeed ? '최근 올라온 마이 레시피' : '피드'} />

      <main className="flex-1 lg:px-8 lg:py-6">
        <div className="sticky top-14 z-30 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-sm lg:top-16 lg:mx-auto lg:max-w-7xl lg:rounded-lg lg:border lg:shadow-sm">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="레시피 검색..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" aria-label="필터">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <Badge
              variant={selectedTags.length === 0 ? 'default' : 'outline'}
              className="shrink-0 cursor-pointer"
              onClick={resetFilters}
            >
              전체
            </Badge>
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className="shrink-0 cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-border px-4 py-2 lg:mx-auto lg:mt-4 lg:max-w-7xl lg:rounded-lg lg:border lg:bg-card">
          <Button
            variant="ghost"
            size="sm"
            className={cn('gap-1', sortBy === 'popular' && 'text-primary')}
            onClick={() => setSortBy('popular')}
          >
            <TrendingUp className="h-4 w-4" />
            인기
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn('gap-1', sortBy === 'recent' && 'text-primary')}
            onClick={() => setSortBy('recent')}
          >
            <Clock className="h-4 w-4" />
            최신
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn('gap-1', sortBy === 'likes' && 'text-primary')}
            onClick={() => setSortBy('likes')}
          >
            <Heart className="h-4 w-4" />
            좋아요
          </Button>
        </div>

        <div className="mx-auto grid max-w-7xl gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 lg:px-0">
          {recipeRows.length > 0 ? (
            recipeRows.map(({ recipe, userRecipe, interaction }) => (
              <FeedRecipeCard key={recipe.id} recipe={recipe} userRecipe={userRecipe} interaction={interaction} />
            ))
          ) : (
            <div className="col-span-full flex min-h-[320px] flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">검색 결과가 없습니다.</p>
              <Button variant="link" onClick={resetFilters}>
                검색 초기화
              </Button>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

function FeedRecipeCard({
  recipe,
  userRecipe,
  interaction,
}: {
  recipe: Recipe
  userRecipe?: UserRecipe
  interaction?: PublicRecipeInteraction
}) {
  const difficultyColors = {
    easy: 'bg-accent text-accent-foreground',
    medium: 'bg-chart-4/20 text-chart-4',
    hard: 'bg-destructive/20 text-destructive',
  }
  const likes = userRecipe?.likes ?? interaction?.likes ?? recipe.likes
  const comments = userRecipe ? getCommentCount(userRecipe) : interaction?.comments.reduce((total, comment) => total + 1 + (comment.replies?.length ?? 0), 0) ?? 0

  return (
    <Link href={`/recipe/${recipe.id}`} className="block h-full">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-[16/9]">
          <img src={recipe.image} alt={recipe.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 text-[11px] font-medium text-white">
              <span className="flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 backdrop-blur-sm">
                <Heart className="h-3 w-3" />
                {likes.toLocaleString()}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 backdrop-blur-sm">
                <MessageCircle className="h-3 w-3" />
                {comments.toLocaleString()}
              </span>
          </div>
        </div>
        <div className="flex min-h-44 flex-col p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', difficultyColors[recipe.difficulty])}>
              {DIFFICULTY_LABELS[recipe.difficulty]}
            </span>
            {recipe.tags.slice(0, 1).map((tag) => (
              <span key={tag} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
          <h3 className="mt-3 line-clamp-1 text-lg font-bold">{recipe.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{recipe.description}</p>
          <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {recipe.cookTime}분
            </span>
            <span className="flex items-center gap-1">
              <ChefHat className="h-4 w-4" />
              {recipe.servings}인분
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col">
          <Header title="피드" />
          <main className="flex-1 p-4">
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </main>
          <BottomNav />
        </div>
      }
    >
      <FeedContent />
    </Suspense>
  )
}
