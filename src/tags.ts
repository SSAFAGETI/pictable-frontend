export interface RecipeTag {
  id: number
  name: string
}

export const RECIPE_TAGS: RecipeTag[] = [
  { id: 1, name: '자취요리' },
  { id: 2, name: '한식' },
  { id: 3, name: '초간단' },
  { id: 4, name: '국물요리' },
  { id: 5, name: '다이어트' },
  { id: 6, name: '야식' },
  { id: 7, name: '볶음밥' },
  { id: 8, name: '반찬' },
  { id: 9, name: '도시락' },
  { id: 10, name: '라면' },
  { id: 11, name: '안주' },
  { id: 12, name: '기타' },
]

export const recipeTagNames = RECIPE_TAGS.map((tag) => tag.name)

export const getRecipeTagById = (id: number) => RECIPE_TAGS.find((tag) => tag.id === id)

export const getRecipeTagByName = (name: string) => RECIPE_TAGS.find((tag) => tag.name === name)

export const getRecipeTagNamesByIds = (ids: number[]) =>
  ids.map((id) => getRecipeTagById(id)?.name).filter((name): name is string => Boolean(name))

export const getRecipeTagIdsByNames = (names: string[]) =>
  names.map((name) => getRecipeTagByName(name)?.id).filter((id): id is number => typeof id === 'number')
