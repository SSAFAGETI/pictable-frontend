<template>
  <div class="min-h-screen bg-background pb-24 lg:pb-0">
    <main class="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <section class="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-[#211814] px-5 py-7 text-white shadow-xl sm:px-8 lg:px-10">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,92,0,0.38),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(255,213,164,0.22),transparent_22%),linear-gradient(135deg,rgba(245,92,0,0.22),transparent_45%)]" />
        <div class="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div class="space-y-5">
            <span class="inline-flex w-fit items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-sm font-bold text-white ring-1 ring-white/20">
              <Sparkles class="h-3.5 w-3.5" />
              찰칵밥상 API Contract {{ isV2 ? 'v2' : 'latest' }}
            </span>
            <div class="max-w-3xl space-y-3">
              <h1 class="text-3xl font-black tracking-normal sm:text-4xl lg:text-5xl">
                실제 구현 기준 프론트-백엔드 API 명세
              </h1>
              <p class="text-sm leading-7 text-white/72 sm:text-base">
                Vue SPA가 사용하는 Django REST API를 최신 구현 기준으로 정리했습니다.
                인증, 레시피, 피드, 추천, 미디어, 알림까지 실제 라우팅과 요청 흐름에 맞춰 업데이트했습니다.
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <a href="/backend-api-v2" class="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white/90 transition-colors hover:bg-white/18">
                API v2 별도 페이지
              </a>
              <a href="/user-flow-wireframe.html" class="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white/90 transition-colors hover:bg-white/18">
                사용자 흐름 보기
              </a>
              <a href="/user-flow-wireframe-v2.html" class="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white/90 transition-colors hover:bg-white/18">
                사용자 흐름 v2
              </a>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div v-for="item in highlights" :key="item.label" class="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur">
              <component :is="item.icon" class="mb-3 h-5 w-5 text-primary-foreground" />
              <p class="text-xs text-white/60">{{ item.label }}</p>
              <p class="mt-1 text-xl font-black">{{ item.value }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-5 grid gap-4 md:grid-cols-3">
        <article class="rounded-xl border border-primary/15 bg-primary/5 p-5">
          <Database class="mb-3 h-5 w-5 text-primary" />
          <h2 class="font-black">응답 포맷</h2>
          <p class="mt-2 text-sm leading-6 text-muted-foreground">
            백엔드는 DRF 기본 JSON을 반환하고, 프론트는 mapper와 apiRequest에서 화면용 데이터로 정규화합니다.
          </p>
        </article>
        <article class="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5">
          <KeyRound class="mb-3 h-5 w-5 text-emerald-700" />
          <h2 class="font-black">인증 방식</h2>
          <p class="mt-2 text-sm leading-6 text-muted-foreground">
            JWT Access/Refresh Token과 Google OAuth code exchange를 사용합니다.
          </p>
        </article>
        <article class="rounded-xl border border-sky-200 bg-sky-50/70 p-5">
          <RouteIcon class="mb-3 h-5 w-5 text-sky-700" />
          <h2 class="font-black">프록시 경로</h2>
          <p class="mt-2 text-sm leading-6 text-muted-foreground">
            Vercel은 <code class="rounded bg-background px-1">/api</code>와 <code class="rounded bg-background px-1">/media</code> 요청을 백엔드로 전달합니다.
          </p>
        </article>
      </section>

      <div class="mt-8 grid gap-6 lg:grid-cols-[240px_1fr] lg:items-start">
        <aside class="hidden lg:sticky lg:top-8 lg:block">
          <div class="rounded-xl border border-border/70 bg-card/90 p-3">
            <p class="px-2 py-2 text-xs font-bold text-muted-foreground">API INDEX</p>
            <nav class="space-y-1">
              <a
                v-for="group in apiGroups"
                :key="group.id"
                :href="`#${group.id}`"
                class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <component :is="group.icon" class="h-4 w-4" />
                {{ group.title }}
              </a>
            </nav>
          </div>
        </aside>

        <div class="space-y-8">
          <section v-for="group in apiGroups" :id="group.id" :key="group.id" class="scroll-mt-24 space-y-4">
            <div class="flex items-start gap-3">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <component :is="group.icon" class="h-5 w-5" />
              </div>
              <div>
                <h2 class="text-xl font-black sm:text-2xl">{{ group.title }}</h2>
                <p class="mt-1 text-sm leading-6 text-muted-foreground">{{ group.summary }}</p>
              </div>
            </div>

            <article v-for="endpoint in group.endpoints" :key="`${endpoint.method}-${endpoint.path}-${endpoint.title}`" class="overflow-hidden rounded-xl border border-border/70 bg-card/95 shadow-sm">
              <div class="border-b border-border/70 bg-muted/30 p-4 sm:p-5">
                <div class="flex flex-wrap items-center gap-2">
                  <span :class="['rounded-md px-2.5 py-1 text-[11px] font-black', methodStyles[endpoint.method]]">
                    {{ endpoint.method }}
                  </span>
                  <code class="rounded-md bg-background px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-border">
                    {{ endpoint.path }}
                  </code>
                </div>
                <h3 class="mt-3 text-base font-black text-foreground sm:text-lg">{{ endpoint.title }}</h3>
                <p class="mt-1 text-sm leading-relaxed text-muted-foreground">{{ endpoint.description }}</p>
              </div>
              <div class="grid gap-3 p-4 sm:p-5 xl:grid-cols-3">
                <JsonPanel title="Request" tone="request" :value="endpoint.request" />
                <JsonPanel title="Success" tone="success" :value="endpoint.success" />
                <JsonPanel title="Failure" tone="failure" :value="endpoint.failure" />
              </div>
            </article>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, type Component } from 'vue'
import { useRoute } from 'vue-router'
import {
  AlertTriangle,
  Bell,
  BookOpen,
  CheckCircle2,
  Code2,
  Database,
  FileJson,
  Heart,
  KeyRound,
  Layers3,
  Route as RouteIcon,
  Server,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserRound,
  Utensils,
} from 'lucide-vue-next'

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

interface ApiEndpoint {
  method: Method
  path: string
  title: string
  description: string
  request: unknown | null
  success: unknown
  failure: unknown
}

interface ApiGroup {
  id: string
  title: string
  summary: string
  icon: Component
  endpoints: ApiEndpoint[]
}

const route = useRoute()
const isV2 = computed(() => route.path.includes('v2'))

const methodStyles: Record<Method, string> = {
  GET: 'bg-emerald-500 text-white',
  POST: 'bg-primary text-primary-foreground',
  PATCH: 'bg-sky-500 text-white',
  DELETE: 'bg-rose-500 text-white',
}

const apiGroups: ApiGroup[] = [
  {
    id: 'auth',
    title: '인증 / 회원',
    summary: '이메일 인증, JWT 토큰, Google OAuth code exchange를 담당합니다.',
    icon: ShieldCheck,
    endpoints: [
      {
        method: 'POST',
        path: '/auth/signup/',
        title: '회원가입',
        description: '신규 사용자를 생성하고 환영 알림을 함께 생성합니다.',
        request: { email: 'user@example.com', nickname: '자취요리러', password: 'password123' },
        success: { message: '회원가입이 완료되었습니다.', email: 'user@example.com', nickname: '자취요리러' },
        failure: { email: ['이미 가입된 이메일입니다.'] },
      },
      {
        method: 'POST',
        path: '/auth/login/',
        title: '이메일 로그인',
        description: '이메일과 비밀번호를 검증하고 Access/Refresh Token을 발급합니다.',
        request: { email: 'user@example.com', password: 'password123' },
        success: { message: '로그인 성공', access: 'jwt.access.token', refresh: 'jwt.refresh.token', email: 'user@example.com', nickname: '자취요리러' },
        failure: { non_field_errors: ['이메일 또는 비밀번호가 올바르지 않습니다.'] },
      },
      {
        method: 'POST',
        path: '/auth/google/',
        title: 'Google OAuth 로그인',
        description: '프론트가 받은 authorization code를 백엔드로 전달하고, 백엔드는 Google token/userinfo API로 사용자 정보를 확인합니다.',
        request: { code: 'google_authorization_code', redirect_uri: 'https://pictable.online/oauth/callback' },
        success: { access: 'jwt.access.token', refresh: 'jwt.refresh.token', created: false },
        failure: { error: '구글 토큰 요청 실패', detail: { error: 'invalid_grant' } },
      },
      {
        method: 'POST',
        path: '/auth/refresh/',
        title: '토큰 갱신',
        description: 'Refresh Token으로 새 Access Token을 발급합니다.',
        request: { refresh: 'jwt.refresh.token' },
        success: { access: 'new.jwt.access.token' },
        failure: { detail: 'Token is invalid or expired', code: 'token_not_valid' },
      },
      {
        method: 'POST',
        path: '/auth/logout/',
        title: '로그아웃',
        description: 'Refresh Token을 blacklist 처리해 로그아웃합니다.',
        request: { refresh: 'jwt.refresh.token' },
        success: { message: '로그아웃 되었습니다.' },
        failure: { refresh: ['유효하지 않은 토큰입니다.'] },
      },
    ],
  },
  {
    id: 'users',
    title: '사용자 / 마이페이지',
    summary: '내 정보, 저장/좋아요/작성 레시피, 구독 관계를 관리합니다.',
    icon: UserRound,
    endpoints: [
      {
        method: 'GET',
        path: '/users/me/',
        title: '내 정보 조회',
        description: '마이페이지와 작성자 권한 판별에 사용하는 현재 사용자 정보입니다.',
        request: null,
        success: { id: 1, email: 'user@example.com', nickname: '자취요리러', provider: 'google' },
        failure: { detail: 'Authentication credentials were not provided.' },
      },
      {
        method: 'PATCH',
        path: '/users/me/',
        title: '내 정보 수정',
        description: '닉네임 등 사용자 프로필 정보를 수정합니다.',
        request: { nickname: '집밥러' },
        success: { id: 1, email: 'user@example.com', nickname: '집밥러' },
        failure: { nickname: ['이 필드는 blank일 수 없습니다.'] },
      },
      {
        method: 'GET',
        path: '/users/me/saved-recipes/',
        title: '저장한 레시피',
        description: '저장 페이지와 마이페이지 저장 탭에서 사용합니다.',
        request: null,
        success: { results: [{ id: 12, title: '김치볶음밥', is_saved: true }] },
        failure: { detail: 'Authentication credentials were not provided.' },
      },
      {
        method: 'GET',
        path: '/users/me/liked-recipes/',
        title: '좋아요한 레시피',
        description: '마이페이지 좋아요 탭에서 사용합니다.',
        request: null,
        success: { results: [{ id: 15, title: '라면 업그레이드', is_liked: true }] },
        failure: { detail: 'Authentication credentials were not provided.' },
      },
      {
        method: 'GET',
        path: '/users/me/recipes/',
        title: '내가 작성한 레시피',
        description: '마이페이지 내 레시피와 마이 피드에서 사용합니다.',
        request: null,
        success: { results: [{ id: 21, title: '전자레인지 계란찜', author: '자취요리러' }] },
        failure: { detail: 'Authentication credentials were not provided.' },
      },
      {
        method: 'POST',
        path: '/users/{userId}/subscribe/',
        title: '사용자 구독',
        description: '레시피 작성자를 구독하거나 구독을 해제합니다.',
        request: null,
        success: { subscribed: true, follower_count: 12 },
        failure: { detail: '자기 자신은 구독할 수 없습니다.' },
      },
    ],
  },
  {
    id: 'recipes',
    title: '레시피 / 추천',
    summary: '레시피 CRUD, 재료 검색, 재료 기반 추천 알고리즘을 제공합니다.',
    icon: BookOpen,
    endpoints: [
      {
        method: 'GET',
        path: '/recipes/',
        title: '레시피 목록',
        description: '전체 공개 레시피 목록을 조회합니다.',
        request: null,
        success: [{ id: 1, title: '김치볶음밥', ingredients: [{ name: '김치', amount: '1/2컵' }] }],
        failure: { detail: '레시피를 불러오지 못했습니다.' },
      },
      {
        method: 'POST',
        path: '/recipes/',
        title: '레시피 등록',
        description: '로그인 사용자가 직접 레시피를 등록합니다.',
        request: { title: '참치마요덮밥', description: '5분 완성 한 그릇', ingredients: [{ name: '참치', amount: '1캔' }], steps: [{ order: 1, description: '밥 위에 재료를 올립니다.' }] },
        success: { id: 33, title: '참치마요덮밥', author: 1 },
        failure: { title: ['이 필드는 필수입니다.'] },
      },
      {
        method: 'GET',
        path: '/recipes/{recipeId}/',
        title: '레시피 상세',
        description: '재료, 조리 단계, 좋아요/저장/댓글 수를 상세 화면에 제공합니다.',
        request: null,
        success: { id: 33, title: '참치마요덮밥', like_count: 10, save_count: 4, comment_count: 2 },
        failure: { detail: 'Not found.' },
      },
      {
        method: 'PATCH',
        path: '/recipes/{recipeId}/',
        title: '레시피 수정',
        description: '작성자만 레시피 내용을 수정할 수 있습니다.',
        request: { title: '초간단 참치마요덮밥' },
        success: { id: 33, title: '초간단 참치마요덮밥' },
        failure: { detail: '작성자만 수정할 수 있습니다.' },
      },
      {
        method: 'DELETE',
        path: '/recipes/{recipeId}/',
        title: '레시피 삭제',
        description: '작성자만 레시피를 삭제할 수 있습니다.',
        request: null,
        success: { status: 204 },
        failure: { detail: '작성자만 삭제할 수 있습니다.' },
      },
      {
        method: 'GET',
        path: '/recipes/ingredients/?search=계란',
        title: '재료 검색',
        description: '레시피 재료명에서 검색어와 일치하는 후보를 반환합니다.',
        request: null,
        success: [{ id: 516, name: '계란', amount: '1개' }],
        failure: { detail: '검색어가 올바르지 않습니다.' },
      },
      {
        method: 'GET',
        path: '/recipes/recommendations/?ingredients=계란,김치,밥',
        title: '재료 기반 추천',
        description: 'ingredient_aliases로 재료를 정규화하고 match_rate와 부족 재료를 계산합니다.',
        request: null,
        success: { input_ingredients: ['계란', '김치', '밥'], can_make: [{ recipe_id: 1, title: '김치볶음밥', match_rate: 1, missing_ingredients: [] }], almost: [{ recipe_id: 2, title: '계란볶음밥', match_rate: 0.75, missing_ingredients: ['대파'] }] },
        failure: { detail: 'ingredients를 입력해주세요.' },
      },
    ],
  },
  {
    id: 'feed-social',
    title: '피드 / 소셜 액션',
    summary: '피드 탐색, 태그, 좋아요, 저장, 댓글/답글을 담당합니다.',
    icon: Heart,
    endpoints: [
      {
        method: 'GET',
        path: '/feeds/?sort=popular&search=김치&tag=한식&cursor=...',
        title: '피드 조회',
        description: '검색어, 정렬, 태그 필터와 cursor 기반 페이지네이션으로 피드를 조회합니다.',
        request: null,
        success: { results: [{ id: 1, title: '김치볶음밥', tags: ['한식', '초간단'] }], next_cursor: 'cursor-token' },
        failure: { detail: '피드를 불러오지 못했습니다.' },
      },
      {
        method: 'GET',
        path: '/feeds/tags/',
        title: '태그 목록',
        description: '피드 필터와 레시피 등록 화면에서 사용할 태그를 조회합니다.',
        request: null,
        success: [{ id: 1, name: '한식' }, { id: 2, name: '초간단' }],
        failure: { detail: '태그를 불러오지 못했습니다.' },
      },
      {
        method: 'POST',
        path: '/recipes/{recipeId}/like/',
        title: '좋아요 토글',
        description: '좋아요 생성/삭제를 토글하고 작성자에게 알림을 생성합니다.',
        request: null,
        success: { liked: true, like_count: 11 },
        failure: { detail: 'Authentication credentials were not provided.' },
      },
      {
        method: 'POST',
        path: '/recipes/{recipeId}/save/',
        title: '저장 토글',
        description: '저장 생성/삭제를 토글하고 저장 페이지에 반영합니다.',
        request: null,
        success: { saved: true, save_count: 5 },
        failure: { detail: 'Authentication credentials were not provided.' },
      },
      {
        method: 'GET',
        path: '/recipes/{recipeId}/comments/',
        title: '댓글 목록',
        description: '레시피 상세 댓글과 답글 스레드를 조회합니다.',
        request: null,
        success: [{ id: 1, content: '따라 만들기 쉬웠어요!', replies: [{ id: 2, content: '감사합니다!' }] }],
        failure: { detail: '댓글을 불러오지 못했습니다.' },
      },
      {
        method: 'POST',
        path: '/recipes/{recipeId}/comments/',
        title: '댓글 작성',
        description: '댓글을 작성하고 레시피 작성자에게 알림을 생성합니다.',
        request: { content: '오늘 저녁으로 해볼게요!' },
        success: { id: 3, content: '오늘 저녁으로 해볼게요!' },
        failure: { content: ['이 필드는 필수입니다.'] },
      },
      {
        method: 'POST',
        path: '/recipes/{recipeId}/comments/{commentId}/replies/',
        title: '답글 작성',
        description: '댓글에 답글을 작성하고 알림을 생성합니다.',
        request: { content: '맛있게 드세요!' },
        success: { id: 4, content: '맛있게 드세요!', parent_comment: 3 },
        failure: { detail: 'Not found.' },
      },
    ],
  },
  {
    id: 'media',
    title: '미디어 / AI 재료 감지',
    summary: '이미지 업로드와 Gemini 기반 재료 감지 결과를 제공합니다.',
    icon: UploadCloud,
    endpoints: [
      {
        method: 'POST',
        path: '/media/upload/',
        title: '이미지 업로드',
        description: '레시피 대표 이미지, 단계 이미지, 재료 감지 이미지를 업로드합니다.',
        request: { file: 'multipart/form-data', purpose: 'thumbnail | step | ingredient_detection' },
        success: { id: 8889, url: '/media/thumbnail/file.jpg', detection_job_id: 7 },
        failure: { error: '파일이 없습니다.' },
      },
      {
        method: 'GET',
        path: '/media/{mediaId}/',
        title: '미디어 상세',
        description: '업로드된 미디어의 url, 원본 파일명, mime type을 조회합니다.',
        request: null,
        success: { id: 8889, url: '/media/thumbnail/file.jpg', original_name: 'food.jpg', mime_type: 'image/jpeg' },
        failure: { detail: 'Not found.' },
      },
      {
        method: 'GET',
        path: '/media/detection/{jobId}/',
        title: '재료 감지 결과',
        description: 'Gemini가 인식한 재료 목록을 조회합니다.',
        request: null,
        success: { status: 'completed', items: [{ name: '계란' }, { name: '대파' }] },
        failure: { detail: 'Not found.' },
      },
    ],
  },
  {
    id: 'home-notifications',
    title: '홈 / 알림',
    summary: '홈 요약 콘텐츠와 사용자 알림을 제공합니다.',
    icon: Bell,
    endpoints: [
      {
        method: 'GET',
        path: '/home/summary/',
        title: '홈 요약',
        description: '오늘의 추천, 인기 레시피, 최근 레시피를 홈 화면에 제공합니다.',
        request: null,
        success: { recommended: { id: 1, title: '김치볶음밥' }, popular: [{ id: 2, title: '라면 업그레이드' }], recent: [{ id: 3, title: '참치마요덮밥' }] },
        failure: { detail: '홈 데이터를 불러오지 못했습니다.' },
      },
      {
        method: 'GET',
        path: '/notifications/',
        title: '알림 목록',
        description: '환영, 좋아요, 댓글, 답글, 구독 알림을 조회합니다.',
        request: null,
        success: [{ id: 1, type: 'LIKE', title: '내 레시피에 좋아요가 눌렸어요.', is_read: false }],
        failure: { detail: 'Authentication credentials were not provided.' },
      },
      {
        method: 'PATCH',
        path: '/notifications/{notificationId}/read/',
        title: '알림 읽음',
        description: '단일 알림을 읽음 처리합니다.',
        request: null,
        success: { id: 1, is_read: true },
        failure: { detail: 'Not found.' },
      },
      {
        method: 'PATCH',
        path: '/notifications/read-all/',
        title: '전체 알림 읽음',
        description: '읽지 않은 모든 알림을 읽음 처리합니다.',
        request: null,
        success: { message: '전체 읽음 처리 완료' },
        failure: { detail: 'Authentication credentials were not provided.' },
      },
    ],
  },
]

const endpointCount = computed(() => apiGroups.reduce((total, group) => total + group.endpoints.length, 0))

const highlights = computed(() => [
  { label: 'API 그룹', value: String(apiGroups.length), icon: Layers3 },
  { label: '엔드포인트', value: String(endpointCount.value), icon: Server },
  { label: '응답 스타일', value: 'DRF JSON', icon: FileJson },
  { label: '최신 추천 API', value: '/recipes/recommendations', icon: Utensils },
])

const stringify = (value: unknown | null) => (value === null ? 'Request Body 없음' : JSON.stringify(value, null, 2))

const JsonPanel = defineComponent({
  props: {
    title: { type: String, required: true },
    value: { type: null, required: false },
    tone: { type: String as () => 'request' | 'success' | 'failure', required: true },
  },
  setup(props) {
    return () => {
      const toneClass = {
        request: 'border-sky-200 bg-sky-50/70 text-sky-950',
        success: 'border-emerald-200 bg-emerald-50/70 text-emerald-950',
        failure: 'border-rose-200 bg-rose-50/70 text-rose-950',
      }[props.tone]
      const Icon = props.tone === 'request' ? Code2 : props.tone === 'success' ? CheckCircle2 : AlertTriangle

      return h('div', { class: `overflow-hidden rounded-xl border ${toneClass}` }, [
        h('div', { class: 'flex items-center gap-2 border-b border-current/10 px-3 py-2 text-xs font-bold' }, [
          h(Icon, { class: 'h-3.5 w-3.5' }),
          props.title,
        ]),
        h('pre', { class: 'max-h-72 overflow-auto p-3 text-[11px] leading-relaxed text-foreground/85' }, [h('code', stringify(props.value))]),
      ])
    }
  },
})
</script>
