type ApiRecipeOverrides = Record<string, unknown>

export const createApiRecipe = (id: string, overrides: ApiRecipeOverrides = {}) => ({
  id,
  title: `Recipe ${id}`,
  description: `Recipe ${id} description`,
  image_url: '/placeholder.jpg',
  cook_time: 15,
  difficulty: 'easy',
  servings: 2,
  ingredients: [
    { id: `${id}-ingredient-1`, name: 'Egg', amount: '1' },
    { id: `${id}-ingredient-2`, name: 'Milk', amount: '200ml' },
  ],
  steps: [{ order: 1, description: 'Mix ingredients.' }],
  like_count: 3,
  save_count: 1,
  comment_count: 0,
  tags: [{ id: 1, name: 'Quick' }],
  created_at: '2026-06-23T00:00:00.000Z',
  ...overrides,
})

export const createHomeSummaryResponse = () => ({
  recommended: createApiRecipe('1', { title: 'One-pan Eggs' }),
  popular: [
    createApiRecipe('2', { title: 'Crunch Salad' }),
    createApiRecipe('3', { title: 'Spicy Noodles' }),
  ],
  recent: [
    createApiRecipe('4', { title: 'Toast Bowl' }),
    createApiRecipe('5', { title: 'Late-night Soup' }),
  ],
})

export const createRecommendationsResponse = (ingredients: string[]) => ({
  input_ingredients: ingredients,
  can_make: [
    createApiRecipe('10', {
      title: 'Egg Rice',
      match_rate: 1,
      missing_ingredients: [],
      tags: ['Quick'],
    }),
  ],
  almost: [
    createApiRecipe('11', {
      title: 'Milk Pasta',
      match_rate: 0.5,
      missing_ingredients: ['Pasta'],
      tags: ['Comfort'],
    }),
  ],
})
