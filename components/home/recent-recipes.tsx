'use client'

import Link from 'next/link'
import { ArrowRight, ChefHat, Clock, Heart, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useRecipes } from '@/contexts/recipe-context'
import { getCommentCount, userRecipeToRecipe } from '@/lib/recipe-adapters'
import { DIFFICULTY_LABELS, type Recipe, type UserRecipe } from '@/lib/types'
import { cn } from '@/lib/utils'

interface RecentRecipesProps {
  recipes?: Recipe[]
}

export function RecentRecipes({ recipes = [] }: RecentRecipesProps) {
  const { userRecipes } = useRecipes()
  const recentMyRecipes = userRecipes
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3)

  const fallbackRecipes: Array<{ recipe: Recipe; userRecipe?: UserRecipe }> =
    recentMyRecipes.length === 0 ? recipes.map((recipe) => ({ recipe })) : []
  const displayRecipes: Array<{ recipe: Recipe; userRecipe?: UserRecipe }> =
    recentMyRecipes.length > 0
      ? recentMyRecipes.map((userRecipe) => ({ recipe: userRecipeToRecipe(userRecipe), userRecipe }))
      : fallbackRecipes

  return (
    <section className="px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-bold lg:text-xl">최근 올라온 마이 레시피</h2>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-primary">
            <Link href="/feed?source=my&sort=recent">
              더보기 <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {displayRecipes.map(({ recipe, userRecipe }) => (
            <RecentRecipeCard key={recipe.id} recipe={recipe} userRecipe={userRecipe} />
          ))}
        </div>
      </div>
    </section>
  )
}

function RecentRecipeCard({ recipe, userRecipe }: { recipe: Recipe; userRecipe?: UserRecipe }) {
  const difficultyColors = {
    easy: 'bg-accent text-accent-foreground',
    medium: 'bg-chart-4/20 text-chart-4',
    hard: 'bg-destructive/20 text-destructive',
  }
  const likes = userRecipe?.likes ?? recipe.likes
  const comments = userRecipe ? getCommentCount(userRecipe) : recipe.saves

  return (
    <Link href={`/recipe/${recipe.id}`} className="block h-full">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="flex h-full lg:flex-col">
          <div className="relative h-28 w-28 shrink-0 lg:h-44 lg:w-full">
            <img src={recipe.image} alt={recipe.title} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-2">
              <div className="flex items-center justify-end gap-1.5 text-[11px] font-medium text-white">
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
          </div>
          <CardContent className="flex min-w-0 flex-1 flex-col p-3 lg:p-4">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className={cn('text-[10px]', difficultyColors[recipe.difficulty])}>
                  {DIFFICULTY_LABELS[recipe.difficulty]}
                </Badge>
                {recipe.tags.slice(0, 1).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px]">
                    #{tag}
                  </Badge>
                ))}
              </div>
              <h3 className="line-clamp-1 font-semibold">{recipe.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground lg:text-sm">{recipe.description}</p>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {recipe.cookTime}분
              </span>
              <span className="flex items-center gap-1">
                <ChefHat className="h-3.5 w-3.5" />
                {recipe.servings}인분
              </span>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  )
}
