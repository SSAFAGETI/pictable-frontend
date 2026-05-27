import type { Difficulty, Ingredient, Recipe } from './types'
import { fallbackImage } from './mock'

const apiKey = import.meta.env.VITE_FOODSAFETY_API_KEY || '1db71fdb6a3e4d9593eb'
const apiBaseUrl = 'https://openapi.foodsafetykorea.go.kr/api'

const textOf = (row: Element, tagName: string) => row.getElementsByTagName(tagName)[0]?.textContent?.trim() ?? ''
const normalizeUrl = (value: string) => value.replace('http://www.foodsafetykorea.go.kr', 'https://www.foodsafetykorea.go.kr')

const cleanManualText = (value: string) => value.replace(/^\d+\.\s*/, '').replace(/[a-z]$/, '').trim()

const getManualSteps = (row: Element) => {
  return Array.from({ length: 20 }, (_, index) => textOf(row, `MANUAL${String(index + 1).padStart(2, '0')}`))
    .map(cleanManualText)
    .filter(Boolean)
}

const getManualImages = (row: Element) => {
  return Array.from({ length: 20 }, (_, index) => normalizeUrl(textOf(row, `MANUAL_IMG${String(index + 1).padStart(2, '0')}`)))
}

const parseIngredients = (value: string, recipeTitle: string): Ingredient[] => {
  const normalized = value
    .replace(recipeTitle, '')
    .replace(/\[[^\]]+\]/g, '')
    .replace(/[·ㆍ]/g, '\n')

  return normalized
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 1 && !item.endsWith(':'))
    .slice(0, 12)
    .map((item, index) => {
      const match = item.match(/^(.+?)\s+([\d./⅓⅔¼½¾]+.*)$/)
      return {
        id: `${recipeTitle}-${index}`,
        name: match?.[1]?.trim() || item,
        amount: match?.[2]?.trim() || '',
      }
    })
}

const getTags = (row: Element) => {
  return [textOf(row, 'RCP_PAT2'), textOf(row, 'RCP_WAY2'), textOf(row, 'HASH_TAG')]
    .filter(Boolean)
    .flatMap((tag) => tag.split(/[,#\s]+/))
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 4)
}

const getDifficulty = (steps: string[]): Difficulty => {
  if (steps.length <= 3) return 'easy'
  if (steps.length <= 6) return 'medium'
  return 'hard'
}

const mapApiRowToRecipe = (row: Element, index: number): Recipe => {
  const title = textOf(row, 'RCP_NM') || '이름 없는 레시피'
  const sequence = textOf(row, 'RCP_SEQ') || String(index + 1)
  const steps = getManualSteps(row)
  const stepImages = getManualImages(row)
  const image = normalizeUrl(textOf(row, 'ATT_FILE_NO_MAIN') || textOf(row, 'ATT_FILE_NO_MK') || textOf(row, 'MANUAL_IMG01')) || fallbackImage
  const calories = textOf(row, 'INFO_ENG')
  const sodiumTip = textOf(row, 'RCP_NA_TIP')
  const parts = textOf(row, 'RCP_PARTS_DTLS')
  const servingsMatch = parts.match(/\[(\d+)인분\]/)

  return {
    id: sequence,
    title,
    description: sodiumTip || `${title}의 식품안전나라 공식 조리 레시피입니다.${calories ? ` 열량은 ${calories}kcal입니다.` : ''}`,
    image,
    cookTime: Math.max(10, steps.length * 8),
    difficulty: getDifficulty(steps),
    servings: Number(servingsMatch?.[1] ?? 1),
    ingredients: parseIngredients(parts, title),
    steps,
    stepImages,
    likes: 100 + Number(sequence) * 3,
    saves: 40 + Number(sequence),
    comments: index % 8,
    tags: getTags(row),
    author: '식품안전나라',
    createdAt: `2026-05-${String(Math.max(1, 13 - index)).padStart(2, '0')}`,
  }
}

export async function fetchFoodSafetyRecipes(start = 1, end = 30) {
  try {
    const response = await fetch(`${apiBaseUrl}/${apiKey}/COOKRCP01/xml/${start}/${end}`)
    if (!response.ok) throw new Error(`API 응답 오류: ${response.status}`)

    const xmlText = await response.text()
    const xml = new DOMParser().parseFromString(xmlText, 'application/xml')
    const resultCode = xml.getElementsByTagName('CODE')[0]?.textContent
    const resultMessage = xml.getElementsByTagName('MSG')[0]?.textContent

    if (resultCode && resultCode !== 'INFO-000') {
      throw new Error(resultMessage || '레시피 API 호출에 실패했습니다.')
    }

    const apiRecipes = Array.from(xml.getElementsByTagName('row')).map(mapApiRowToRecipe).filter((recipe) => recipe.steps.length > 0)
    return apiRecipes
  } catch (error) {
    throw error
  }
}