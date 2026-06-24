export const APP_ROUTES = {
  home: '/',
  feed: '/feed',
  recipeDetail: '/recipe/:id',
  myRecipeNew: '/my-recipe/new',
  myRecipeEdit: '/my-recipe/:id/edit',
  saved: '/saved',
  mypage: '/mypage',
  login: '/login',
  oauthCallback: '/oauth/callback',
  signup: '/signup',
  recommendations: '/recommendations',
  ingredients: '/ingredients',
  backendApi: '/backend-api',
  backendApiV2: '/backend-api-v2',
  serverError: '/server-error',
} as const

export const PRIMARY_NAV_LINKS = [
  { key: 'home', href: APP_ROUTES.home, label: '홈' },
  { key: 'feed', href: APP_ROUTES.feed, label: '피드' },
  { key: 'register', href: APP_ROUTES.myRecipeNew, label: '등록' },
  { key: 'saved', href: APP_ROUTES.saved, label: '저장' },
  { key: 'mypage', href: APP_ROUTES.mypage, label: '마이' },
] as const

export const MY_RECIPE_FEED_TITLE = '최근 올라온 마이 레시피'

export const PAGE_TITLES: Record<string, string> = {
  [APP_ROUTES.feed]: '피드',
  [APP_ROUTES.myRecipeNew]: '레시피 등록',
  [APP_ROUTES.saved]: '저장',
  [APP_ROUTES.mypage]: '마이',
  [APP_ROUTES.recommendations]: '추천',
  [APP_ROUTES.ingredients]: '재료',
  [APP_ROUTES.backendApi]: '백엔드 API 명세',
  [APP_ROUTES.backendApiV2]: '백엔드 API 명세 v2',
}

export const isRecipeDetailRoute = (path: string) => path.startsWith('/recipe/')

export const isAuthRoute = (path: string) =>
  path.startsWith(APP_ROUTES.login) ||
  path.startsWith(APP_ROUTES.signup) ||
  path.startsWith(APP_ROUTES.oauthCallback)

export const isAppChromeHiddenRoute = (path: string) =>
  isAuthRoute(path) || path.startsWith(APP_ROUTES.serverError) || path.startsWith(APP_ROUTES.backendApi)

export const isActiveRoute = (currentPath: string, href: string) =>
  currentPath === href || (href !== APP_ROUTES.home && currentPath.startsWith(href))

export const recipeDetailPath = (id: string | number) => `/recipe/${encodeURIComponent(String(id))}`

export const myRecipeEditPath = (id: string | number) => `/my-recipe/${encodeURIComponent(String(id))}/edit`

export const recommendationsPath = (ingredients: string[]) =>
  `${APP_ROUTES.recommendations}?ingredients=${encodeURIComponent(ingredients.join(','))}`

export const myRecipeFeedPath = () => `${APP_ROUTES.feed}?source=my&sort=recent`
