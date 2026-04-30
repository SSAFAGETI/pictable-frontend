'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChefHat, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DIFFICULTY_LABELS, type Recipe } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TodayRecipeProps {
  recipes: Recipe[]
}

export function TodayRecipe({ recipes }: TodayRecipeProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (recipes.length <= 1) return

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % recipes.length)
    }, 6000)

    return () => window.clearInterval(timer)
  }, [recipes.length])

  if (recipes.length === 0) return null

  return (
    <section className="px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold lg:text-xl">오늘의 추천 요리</h2>
          <Button variant="ghost" size="sm" asChild className="text-primary">
            <Link href="/feed">
              더보기 <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {recipes.map((recipe, index) => (
              <div key={recipe.id} className="w-full shrink-0">
                <Link href={`/recipe/${recipe.id}`}>
                  <Card className="overflow-hidden transition-shadow hover:shadow-lg lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
                    <div className="relative aspect-[16/9] lg:aspect-auto lg:min-h-[300px]">
                      <Image
                        src={recipe.image}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                    </div>
                    <CardContent className="flex flex-col justify-center p-4 sm:p-5 lg:p-8">
                      <Badge className="mb-3 w-fit bg-primary text-primary-foreground">
                        {DIFFICULTY_LABELS[recipe.difficulty]}
                      </Badge>
                      <h3 className="text-2xl font-bold lg:text-3xl">{recipe.title}</h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground lg:text-base">
                        {recipe.description}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {recipe.cookTime}분
                        </span>
                        <span className="flex items-center gap-1">
                          <ChefHat className="h-4 w-4" />
                          {recipe.servings}인분
                        </span>
                        {recipe.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {recipes.length > 1 && (
          <div className="mt-3 flex justify-center gap-2">
            {recipes.map((recipe, index) => (
              <button
                key={recipe.id}
                type="button"
                aria-label={`${index + 1}번째 추천 요리 보기`}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'h-2 rounded-full transition-all',
                  activeIndex === index ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
