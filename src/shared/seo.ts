import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { Recipe } from '../data'
import { APP_ROUTES, PAGE_TITLES } from './constants/routes'

const SITE_NAME = '찰칵밥상'
const SITE_URL = 'https://pictable.online'
const DEFAULT_TITLE = '찰칵밥상 - 오늘 뭐 먹지? 레시피 추천과 요리 기록'
const DEFAULT_DESCRIPTION =
  '찰칵밥상은 가진 재료와 취향에 맞는 레시피를 찾고, 직접 만든 요리를 기록하고 관리할 수 있는 레시피 서비스입니다.'
const DEFAULT_IMAGE = '/og-image.svg?v=5'

interface SeoInput {
  title?: string
  description?: string
  image?: string
  canonicalPath?: string
  type?: 'website' | 'article'
  robots?: string
  jsonLd?: Record<string, unknown>
}

const stripTags = (value: string) => value.replace(/<[^>]*>/g, ' ')
const collapseWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim()
const truncate = (value: string, length: number) => (value.length > length ? `${value.slice(0, length - 1).trim()}…` : value)

const getBrowserOrigin = () => {
  if (typeof window === 'undefined') return SITE_URL
  return window.location.origin
}

const absoluteUrl = (value: string) => {
  try {
    return new URL(value, getBrowserOrigin()).toString()
  } catch {
    return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`
  }
}

const upsertMeta = (selector: string, attrs: Record<string, string>) => {
  if (typeof document === 'undefined') return
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    const name = selector.match(/\[(name|property)="([^"]+)"\]/)
    if (name) element.setAttribute(name[1], name[2])
    document.head.appendChild(element)
  }
  Object.entries(attrs).forEach(([key, value]) => element?.setAttribute(key, value))
}

const upsertLink = (rel: string, href: string) => {
  if (typeof document === 'undefined') return
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!element) {
    element = document.createElement('link')
    element.rel = rel
    document.head.appendChild(element)
  }
  element.href = href
}

const upsertJsonLd = (id: string, data: Record<string, unknown>) => {
  if (typeof document === 'undefined') return
  let element = document.getElementById(id) as HTMLScriptElement | null
  if (!element) {
    element = document.createElement('script')
    element.id = id
    element.type = 'application/ld+json'
    document.head.appendChild(element)
  }
  element.textContent = JSON.stringify(data)
}

const removeJsonLd = (id: string) => {
  if (typeof document === 'undefined') return
  document.getElementById(id)?.remove()
}

export const setSeo = (input: SeoInput = {}) => {
  if (typeof document === 'undefined') return

  const title = truncate(collapseWhitespace(input.title || DEFAULT_TITLE), 62)
  const description = truncate(collapseWhitespace(stripTags(input.description || DEFAULT_DESCRIPTION)), 155)
  const canonicalPath = input.canonicalPath || (window.location.pathname === '/' ? '/' : window.location.pathname)
  const canonical = absoluteUrl(canonicalPath)
  const image = absoluteUrl(input.image || DEFAULT_IMAGE)
  const type = input.type || 'website'
  const robots = input.robots || 'index,follow,max-image-preview:large'

  document.title = title
  upsertMeta('meta[name="description"]', { name: 'description', content: description })
  upsertMeta('meta[name="robots"]', { name: 'robots', content: robots })
  upsertMeta('meta[name="googlebot"]', {
    name: 'googlebot',
    content: 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1',
  })
  upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME })
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
  upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type })
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical })
  upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image })
  upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: `${SITE_NAME} 대표 이미지` })
  upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
  upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image })
  upsertMeta('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt', content: `${SITE_NAME} 대표 이미지` })
  upsertLink('canonical', canonical)

  if (input.jsonLd) upsertJsonLd('route-jsonld', input.jsonLd)
  else removeJsonLd('route-jsonld')
}

const routeTitle = (route: RouteLocationNormalizedLoaded) => {
  if (route.path === APP_ROUTES.home) return DEFAULT_TITLE
  if (route.path === APP_ROUTES.feed && route.query.source === 'my') return `마이 레시피 - ${SITE_NAME}`
  if (route.path.startsWith('/recipe/')) return `레시피 상세 - ${SITE_NAME}`
  return `${PAGE_TITLES[route.path] || '레시피'} - ${SITE_NAME}`
}

const routeDescription = (route: RouteLocationNormalizedLoaded) => {
  if (route.path === APP_ROUTES.feed) return '인기순과 최신순, 태그별로 다양한 레시피를 둘러보고 오늘 먹을 요리를 찾아보세요.'
  if (route.path.startsWith('/recipe/')) return '재료, 조리 순서, 시간과 인분 정보를 한눈에 확인할 수 있는 찰칵밥상 레시피 상세 페이지입니다.'
  if (route.path === APP_ROUTES.recommendations) return '가진 재료를 바탕으로 만들 수 있는 요리를 추천받아보세요.'
  if (route.path === APP_ROUTES.ingredients) return '재료를 검색하고 나에게 맞는 레시피 추천을 준비해보세요.'
  return DEFAULT_DESCRIPTION
}

export const applyRouteSeo = (route: RouteLocationNormalizedLoaded) => {
  setSeo({
    title: routeTitle(route),
    description: routeDescription(route),
    canonicalPath: route.path,
    robots: 'index,follow,max-image-preview:large',
    jsonLd:
      route.path === APP_ROUTES.home
        ? {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            alternateName: 'Pictable',
            url: SITE_URL,
            inLanguage: 'ko-KR',
            potentialAction: {
              '@type': 'SearchAction',
              target: `${SITE_URL}/feed?search={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }
        : undefined,
  })
}

export const applyRecipeSeo = (recipe: Recipe) => {
  const path = `/recipe/${encodeURIComponent(recipe.id)}`
  const description = `${recipe.description} 조리 시간 ${recipe.cookTime}분, ${recipe.servings}인분 레시피입니다.`

  setSeo({
    title: `${recipe.title} 레시피 - ${SITE_NAME}`,
    description,
    image: recipe.image,
    canonicalPath: path,
    type: 'article',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: recipe.title,
      description: collapseWhitespace(stripTags(recipe.description)),
      image: [absoluteUrl(recipe.image)],
      author: {
        '@type': 'Person',
        name: recipe.author,
      },
      datePublished: recipe.createdAt,
      recipeYield: `${recipe.servings}인분`,
      prepTime: `PT${Math.max(1, recipe.cookTime)}M`,
      cookTime: `PT${Math.max(1, recipe.cookTime)}M`,
      totalTime: `PT${Math.max(1, recipe.cookTime)}M`,
      recipeIngredient: recipe.ingredients.map((item) => `${item.name}${item.amount ? ` ${item.amount}` : ''}`),
      recipeInstructions: recipe.steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
      })),
      keywords: recipe.tags.join(', '),
      mainEntityOfPage: `${SITE_URL}${path}`,
    },
  })
}
