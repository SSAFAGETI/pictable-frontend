'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Bookmark, ChefHat, Clock, Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DIFFICULTY_LABELS, type Recipe } from '@/lib/types'
import { cn } from '@/lib/utils'

interface RecipeCardProps {
  recipe: Recipe
  variant?: 'default' | 'compact' | 'horizontal'
  onLike?: (id: string) => void
  onSave?: (id: string) => void
}

export function RecipeCard({ recipe, variant = 'default', onLike, onSave }: RecipeCardProps) {
  const difficultyColors = {
    easy: 'bg-accent text-accent-foreground',
    medium: 'bg-chart-4/20 text-chart-4',
    hard: 'bg-destructive/20 text-destructive',
  }

  if (variant === 'horizontal') {
    return (
      <Link href={`/recipe/${recipe.id}`}>
        <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
          <div className="flex h-full lg:flex-col">
            <div className="relative h-24 w-24 shrink-0 lg:h-40 lg:w-full">
              <Image src={recipe.image} alt={recipe.title} fill className="object-cover" />
            </div>
            <CardContent className="flex min-w-0 flex-1 flex-col justify-center p-3 lg:p-4">
              <h3 className="line-clamp-1 font-semibold">{recipe.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground lg:text-sm">{recipe.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{recipe.cookTime}분</span>
                <Badge variant="secondary" className={cn('text-[10px]', difficultyColors[recipe.difficulty])}>
                  {DIFFICULTY_LABELS[recipe.difficulty]}
                </Badge>
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    )
  }

  if (variant === 'compact') {
    return (
      <Link href={`/recipe/${recipe.id}`}>
        <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
          <div className="relative aspect-square">
            <Image src={recipe.image} alt={recipe.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <h3 className="line-clamp-1 text-sm font-semibold text-white lg:text-base">{recipe.title}</h3>
              <div className="mt-1 flex items-center gap-1 text-xs text-white/85">
                <Clock className="h-3 w-3" />
                <span>{recipe.cookTime}분</span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/recipe/${recipe.id}`}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3]">
          <Image src={recipe.image} alt={recipe.title} fill className="object-cover" />
          <div className="absolute right-2 top-2 flex gap-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white"
              onClick={(e) => {
                e.preventDefault()
                onLike?.(recipe.id)
              }}
              aria-label="좋아요"
            >
              <Heart className={cn('h-4 w-4', recipe.isLiked && 'fill-primary text-primary')} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white"
              onClick={(e) => {
                e.preventDefault()
                onSave?.(recipe.id)
              }}
              aria-label="저장"
            >
              <Bookmark className={cn('h-4 w-4', recipe.isSaved && 'fill-primary text-primary')} />
            </Button>
          </div>
          <Badge variant="secondary" className={cn('absolute bottom-2 left-2', difficultyColors[recipe.difficulty])}>
            {DIFFICULTY_LABELS[recipe.difficulty]}
          </Badge>
        </div>
        <CardContent className="p-3">
          <h3 className="line-clamp-1 font-semibold">{recipe.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{recipe.description}</p>
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {recipe.cookTime}분
              </span>
              <span className="flex items-center gap-1">
                <ChefHat className="h-4 w-4" />
                {recipe.servings}인분
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {recipe.likes.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
