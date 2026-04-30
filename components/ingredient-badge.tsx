'use client'

import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Ingredient } from '@/lib/types'

interface IngredientBadgeProps {
  ingredient: Ingredient
  onRemove?: () => void
  variant?: 'default' | 'outline' | 'missing'
  size?: 'sm' | 'md' | 'lg'
}

const categoryColors: Record<string, string> = {
  vegetable: 'bg-accent/20 text-accent-foreground border-accent/30',
  meat: 'bg-chart-5/20 text-chart-5 border-chart-5/30',
  seafood: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  dairy: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
  grain: 'bg-chart-1/20 text-chart-1 border-chart-1/30',
  seasoning: 'bg-muted text-muted-foreground border-muted',
  other: 'bg-secondary text-secondary-foreground border-secondary',
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
}

export function IngredientBadge({ 
  ingredient, 
  onRemove, 
  variant = 'default',
  size = 'md' 
}: IngredientBadgeProps) {
  const baseClasses = cn(
    'inline-flex items-center gap-1 rounded-full border font-medium transition-colors',
    sizeClasses[size],
    variant === 'missing' 
      ? 'bg-destructive/10 text-destructive border-destructive/30 line-through opacity-60'
      : variant === 'outline'
      ? 'bg-transparent border-border text-foreground'
      : categoryColors[ingredient.category]
  )

  return (
    <Badge className={baseClasses} variant="outline">
      <span>{ingredient.name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 rounded-full p-0.5 hover:bg-black/10"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  )
}
