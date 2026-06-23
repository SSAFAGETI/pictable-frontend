export interface RecipeTag {
  id: number
  name: string
}

export const RECIPE_TAGS: RecipeTag[] = [
  { id: 1, name: '반찬' },
  { id: 2, name: '기타' },
  { id: 3, name: '국물요리' },
  { id: 4, name: '후식' },
  { id: 5, name: '일품' },
  { id: 6, name: '볶음밥' },
]

export const recipeTagNames = RECIPE_TAGS.map((tag) => tag.name)

const normalizeTagKey = (name: string) => name.replace(/^#/, '').replace(/\s+/g, '').trim().toLowerCase()

const TAG_NAME_ALIASES: Record<string, string> = {
  밑반찬: '반찬',
  김치: '반찬',
  나물: '반찬',
  무침: '반찬',
  국: '국물요리',
  찌개: '국물요리',
  탕: '국물요리',
  국탕: '국물요리',
  국찌개: '국물요리',
  '국&찌개': '국물요리',
  '국/찌개': '국물요리',
  '국·찌개': '국물요리',
  국물: '국물요리',
  국물요리: '국물요리',
  스프: '국물요리',
  soup: '국물요리',
  후식: '후식',
  디저트: '후식',
  간식: '후식',
  음료: '후식',
  dessert: '후식',
  일품: '일품',
  일품요리: '일품',
  메인: '일품',
  메인요리: '일품',
  볶음밥: '볶음밥',
  덮밥: '볶음밥',
  비빔밥: '볶음밥',
  밥: '볶음밥',
  자취요리: '기타',
  한식: '기타',
  초간단: '기타',
  다이어트: '기타',
  야식: '기타',
  도시락: '기타',
  라면: '기타',
  안주: '기타',
  분식: '기타',
  집밥: '기타',
  기타: '기타',
}

const TAG_QUERY_ALIASES: Record<string, string[]> = {
  반찬: ['반찬', '밑반찬', '김치', '나물', '무침'],
  기타: ['기타'],
  국물요리: ['국물요리', '국', '찌개', '탕', '국&찌개', '국/찌개', '스프'],
  후식: ['후식', '디저트', '간식', '음료'],
  일품: ['일품', '일품요리', '메인요리'],
  볶음밥: ['볶음밥', '덮밥', '비빔밥', '밥'],
}

export const normalizeRecipeTagName = (name: string) => {
  const trimmed = name.trim()
  const normalizedKey = normalizeTagKey(trimmed)
  return TAG_NAME_ALIASES[normalizedKey] || (recipeTagNames.includes(trimmed) ? trimmed : '기타')
}

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
  Array.from(
    new Set(
      names
        .map((name) => getRecipeTagByName(name)?.id)
        .filter((id): id is number => typeof id === 'number'),
    ),
  )
