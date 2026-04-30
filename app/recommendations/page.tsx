'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, Clock, ChefHat, Check, X, ArrowRight, RefreshCw } from 'lucide-react'
import { Header } from '@/components/header'
import { BottomNav } from '@/components/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { IngredientBadge } from '@/components/ingredient-badge'
import { mockRecipes, mockIngredients } from '@/lib/mock-data'
import { DIFFICULTY_LABELS } from '@/lib/types'
import type { Recipe, Ingredient } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AIRecommendation {
  recipe: Recipe
  matchPercentage: number
  availableIngredients: Ingredient[]
  missingIngredients: Ingredient[]
}

function RecommendationsContent() {
  const searchParams = useSearchParams()
  const ingredientIds = searchParams.get('ingredients')?.split(',') || []
  
  const [isLoading, setIsLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([])

  useEffect(() => {
    // Get selected ingredients from IDs
    const selected = mockIngredients.filter((ing) => ingredientIds.includes(ing.id))
    setSelectedIngredients(selected)

    // Simulate AI recommendation loading
    const loadRecommendations = async () => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate mock recommendations based on selected ingredients
      const recs: AIRecommendation[] = mockRecipes.map((recipe) => {
        const availableCount = Math.floor(Math.random() * selected.length) + 1
        const available = selected.slice(0, availableCount)
        const missingCount = Math.floor(Math.random() * 3)
        const missing = mockIngredients
          .filter((ing) => !selected.some((s) => s.id === ing.id))
          .slice(0, missingCount)

        return {
          recipe,
          matchPercentage: Math.floor(70 + Math.random() * 30),
          availableIngredients: available,
          missingIngredients: missing,
        }
      })

      // Sort by match percentage
      recs.sort((a, b) => b.matchPercentage - a.matchPercentage)
      setRecommendations(recs)
      setIsLoading(false)
    }

    loadRecommendations()
  }, [ingredientIds])

  const handleRefresh = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    // Shuffle recommendations
    setRecommendations((prev) => {
      const shuffled = [...prev]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      // Update match percentages
      return shuffled.map((rec) => ({
        ...rec,
        matchPercentage: Math.floor(70 + Math.random() * 30),
      })).sort((a, b) => b.matchPercentage - a.matchPercentage)
    })
    
    setIsLoading(false)
  }

  const difficultyColors = {
    easy: 'bg-accent text-accent-foreground',
    medium: 'bg-chart-4/20 text-chart-4',
    hard: 'bg-destructive/20 text-destructive',
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header title="AI 추천 결과" showBack />

      <main className="flex-1 px-4 py-4">
        {/* Selected Ingredients Summary */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">입력한 재료</h2>
              </div>
              <Link href="/ingredients" className="text-sm text-primary hover:underline">
                수정하기
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedIngredients.map((ingredient) => (
                <IngredientBadge key={ingredient.id} ingredient={ingredient} size="sm" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            추천 요리 {!isLoading && `(${recommendations.length}개)`}
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            다시 추천
          </Button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="h-24 w-24 flex-shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <Link key={rec.recipe.id} href={`/recipe/${rec.recipe.id}`}>
                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="relative h-32 w-32 flex-shrink-0">
                        <Image
                          src={rec.recipe.image}
                          alt={rec.recipe.title}
                          fill
                          className="object-cover"
                        />
                        {index === 0 && (
                          <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground">
                            Best
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between p-3">
                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <h3 className="font-semibold">{rec.recipe.title}</h3>
                            <Badge
                              variant="secondary"
                              className={difficultyColors[rec.recipe.difficulty]}
                            >
                              {DIFFICULTY_LABELS[rec.recipe.difficulty]}
                            </Badge>
                          </div>
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {rec.recipe.description}
                          </p>
                        </div>

                        {/* Match Progress */}
                        <div className="mt-2">
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">재료 일치율</span>
                            <span className="font-medium text-primary">{rec.matchPercentage}%</span>
                          </div>
                          <Progress value={rec.matchPercentage} className="h-1.5" />
                        </div>

                        {/* Ingredients Info */}
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Check className="h-3 w-3 text-accent" />
                            <span>{rec.availableIngredients.length}개 보유</span>
                          </div>
                          {rec.missingIngredients.length > 0 && (
                            <div className="flex items-center gap-1">
                              <X className="h-3 w-3 text-destructive" />
                              <span>{rec.missingIngredients.length}개 부족</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{rec.recipe.cookTime}분</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

export default function RecommendationsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col">
        <Header title="AI 추천 결과" showBack />
        <main className="flex-1 px-4 py-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="h-24 w-24 flex-shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    }>
      <RecommendationsContent />
    </Suspense>
  )
}
