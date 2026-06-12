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

const TAG_NAME_ALIASES: Record<string, string> = {
  '국&찌개': '국물요리',
  '국/찌개': '국물요리',
  국찌개: '국물요리',
  국: '국물요리',
  찌개: '국물요리',
  탕: '국물요리',
  찜: '반찬',
  나물: '반찬',
  김치: '반찬',
  밑반찬: '반찬',
  밥: '볶음밥',
  덮밥: '볶음밥',
  면: '라면',
  면요리: '라면',
  샐러드: '다이어트',
  저칼로리: '다이어트',
  술안주: '안주',
}

const TAG_QUERY_ALIASES: Record<string, string[]> = {
  국물요리: ['국&찌개', '국물요리'],
  반찬: ['반찬', '밑반찬'],
  볶음밥: ['볶음밥', '밥', '덮밥'],
  라면: ['라면', '면요리', '면'],
  다이어트: ['다이어트', '샐러드', '저칼로리'],
  안주: ['안주', '술안주'],
}

export const normalizeRecipeTagName = (name: string) => {
  const trimmed = name.trim()
  return TAG_NAME_ALIASES[trimmed] || trimmed
}

export const recipeTagNames = RECIPE_TAGS.map((tag) => tag.name)

export const getRecipeTagById = (id: number) => RECIPE_TAGS.find((tag) => tag.id === id)

export const getRecipeTagByName = (name: string) => {
  const normalizedName = normalizeRecipeTagName(name)
  return RECIPE_TAGS.find((tag) => tag.name === normalizedName)
}

export const getRecipeTagNamesByIds = (ids: number[]) =>
  ids.map((id) => getRecipeTagById(id)?.name).filter((name): name is string => Boolean(name))

export const getRecipeTagQueryNamesByIds = (ids: number[]) =>
  getRecipeTagNamesByIds(ids).flatMap((name) => TAG_QUERY_ALIASES[name] || [name])

export const getRecipeTagIdsByNames = (names: string[]) =>
  names
    .map((name) => getRecipeTagByName(name)?.id)
    .filter((id): id is number => typeof id === 'number')
