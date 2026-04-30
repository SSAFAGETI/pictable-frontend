'use client'

import Link from 'next/link'
import { ArrowRight, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RecipeCard } from '@/components/recipe-card'
import type { Recipe } from '@/lib/types'

interface PopularRecipesProps {
  recipes: Recipe[]
}

export function PopularRecipes({ recipes }: PopularRecipesProps) {
  return (
    <section className="px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold lg:text-xl">인기 레시피</h2>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-primary">
            <Link href="/feed?sort=popular">
              더보기 <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid auto-cols-[210px] grid-flow-col gap-4 overflow-x-auto pb-2 lg:grid-flow-row lg:grid-cols-4 lg:overflow-visible">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} variant="compact" />
          ))}
        </div>
      </div>
    </section>
  )
}
