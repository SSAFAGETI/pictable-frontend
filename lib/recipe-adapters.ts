import type { Recipe, UserRecipe } from '@/lib/types'

export function userRecipeToRecipe(recipe: UserRecipe): Recipe {
  return {
    ...recipe,
    saves: recipe.comments.length,
    ingredients: recipe.ingredients.map((item, index) => ({
      ingredient: {
        id: `${recipe.id}-ingredient-${index}`,
        name: item.name,
        category: 'other',
      },
      amount: item.amount,
    })),
    steps: recipe.steps.map((step, index) => ({
      order: index + 1,
      description: step.description,
      image: step.image,
    })),
  }
}

export function getCommentCount(recipe: UserRecipe) {
  return recipe.comments.reduce((total, comment) => total + 1 + (comment.replies?.length ?? 0), 0)
}
