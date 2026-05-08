import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Bot,
  CheckCircle2,
  Code2,
  Database,
  FileJson,
  Heart,
  ImageIcon,
  KeyRound,
  Layers3,
  MessageCircle,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserRound,
  Utensils,
  Zap,
} from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

type ApiEndpoint = {
  method: Method
  path: string
  title: string
  description: string
  request: unknown | null
  success: unknown
  failure: unknown
}

type ApiGroup = {
  id: string
  title: string
  summary: string
  icon: LucideIcon
  endpoints: ApiEndpoint[]
}

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
    summary: '이메일, 구글 가입, 로그인, 내 정보 조회까지 앱 진입에 필요한 인증 계약입니다.',
    icon: ShieldCheck,
    endpoints: [
      {
        method: 'POST',
        path: '/auth/signup/',
        title: '이메일 회원가입',
        description: '가입 즉시 환영 알림을 생성하고 로그인 가능한 사용자 세션을 반환합니다.',
        request: {
          name: '홍길동',
          email: 'example@email.com',
          password: 'password123',
          passwordConfirm: 'password123',
        },
        success: {
          ok: true,
          data: {
            user: { id: 'user_1', name: '홍길동', email: 'example@email.com', provider: 'email' },
            accessToken: 'jwt.access.token',
            welcomeNotificationId: 'noti_1',
          },
        },
        failure: {
          ok: false,
          error: { code: 'EMAIL_ALREADY_EXISTS', message: '이미 가입된 이메일입니다.' },
        },
      },
      {
        method: 'POST',
        path: '/auth/google/',
        title: '구글 회원가입 / 로그인',
        description: '구글 OAuth 사용자를 생성하거나 기존 계정을 로그인 처리하고 동일하게 환영 알림을 만듭니다.',
        request: {
          idToken: 'google.id.token',
          profile: { name: '구글유저', email: 'google@email.com', avatarUrl: 'https://...' },
        },
        success: {
          ok: true,
          data: {
            isNewUser: true,
            user: { id: 'user_google_1', name: '구글유저', provider: 'google' },
            accessToken: 'jwt.access.token',
          },
        },
        failure: {
          ok: false,
          error: { code: 'GOOGLE_TOKEN_INVALID', message: '구글 인증 정보가 유효하지 않습니다.' },
        },
      },
      {
        method: 'GET',
        path: '/users/me/',
        title: '내 정보 조회',
        description: '마이페이지, 등록/저장 접근 제어, 작성자 권한 판별에 사용하는 현재 사용자 정보입니다.',
        request: null,
        success: {
          ok: true,
          data: {
            id: 'user_1',
            name: '홍길동',
            email: 'example@email.com',
            avatarUrl: 'https://...',
            stats: { recipeCount: 8, savedCount: 12, followerCount: 5 },
          },
        },
        failure: {
          ok: false,
          error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' },
        },
      },
    ],
  },
  {
    id: 'recipe',
    title: '레시피 / 피드',
    summary: '홈, 피드, 상세, 수정, 가로 요리모드까지 이어지는 핵심 레시피 API입니다.',
    icon: BookOpen,
    endpoints: [
      {
        method: 'POST',
        path: '/recipes/',
        title: '레시피 등록',
        description: '등록된 레시피는 최근 올라온 마이 레시피와 피드에 즉시 노출됩니다.',
        request: {
          title: '초간단 참치마요 덮밥',
          description: '5분이면 완성되는 자취생 한 그릇 메뉴',
          imageIds: ['media_1'],
          tags: ['자취요리', '초간단', '한식'],
          servings: 1,
          cookTimeMinutes: 5,
          difficulty: 'easy',
          ingredients: [{ name: '밥', amount: '1공기' }],
          steps: [{ order: 1, description: '밥 위에 참치마요를 올립니다.', imageId: 'media_2' }],
        },
        success: {
          ok: true,
          data: {
            id: 'recipe_1',
            authorId: 'user_1',
            title: '초간단 참치마요 덮밥',
            createdAt: '2026-05-06T09:00:00.000Z',
          },
        },
        failure: {
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: '필수 입력값을 확인해주세요.', fieldErrors: { title: ['제목은 필수입니다.'] } },
        },
      },
      {
        method: 'GET',
        path: '/recipes/{recipeId}/',
        title: '상세 레시피 조회',
        description: '재료, 조리법, 댓글, 좋아요/저장 상태, 작성자 수정 권한을 한 번에 내려줍니다.',
        request: null,
        success: {
          ok: true,
          data: {
            id: 'recipe_1',
            title: '라면 업그레이드 레시피',
            isMine: true,
            isLiked: false,
            isSaved: true,
            likeCount: 256,
            commentCount: 3,
            cookMode: { enabled: true, stepCount: 3 },
          },
        },
        failure: {
          ok: false,
          error: { code: 'RECIPE_NOT_FOUND', message: '레시피를 찾을 수 없습니다.' },
        },
      },
      {
        method: 'PATCH',
        path: '/recipes/{recipeId}/',
        title: '내 레시피 수정',
        description: '작성자만 레시피 본문, 이미지, 재료, 조리 순서를 수정할 수 있습니다.',
        request: {
          title: '피카츄 돈까스 만들기',
          description: '추억의 간식을 집에서 만드는 레시피',
          tags: ['간식', '자취요리'],
          ingredients: [{ name: '돈까스', amount: '1장' }],
          steps: [{ order: 1, description: '돈까스를 노릇하게 튀깁니다.' }],
        },
        success: {
          ok: true,
          data: { id: 'recipe_1', updatedAt: '2026-05-06T10:00:00.000Z' },
        },
        failure: {
          ok: false,
          error: { code: 'FORBIDDEN', message: '내가 작성한 레시피만 수정할 수 있습니다.' },
        },
      },
      {
        method: 'GET',
        path: '/recipes/?source=my&sort=recent&tags=한식,초간단',
        title: '피드 / 태그 AND 검색',
        description: '태그는 AND 조건으로 필터링하며 검색 결과 없음 상태도 동일 계약으로 처리합니다.',
        request: null,
        success: {
          ok: true,
          data: {
            items: [
              { id: 'recipe_1', title: '초간단 참치마요 덮밥', likeCount: 42, commentCount: 4, tags: ['한식', '초간단'] },
            ],
            meta: { total: 1, page: 1, hasNext: false },
          },
        },
        failure: {
          ok: false,
          error: { code: 'INVALID_TAG_QUERY', message: '태그 검색 조건이 올바르지 않습니다.' },
        },
      },
      {
        method: 'GET',
        path: '/home/summary/',
        title: '홈 요약 콘텐츠',
        description: '인기 레시피, 오늘의 추천 요리 캐러셀, 최근 마이 레시피 섹션을 구성합니다.',
        request: null,
        success: {
          ok: true,
          data: {
            popularRecipes: [{ id: 'recipe_popular_1', title: '라면', likeCount: 3421 }],
            recommendedRecipes: [{ id: 'recipe_today_1', title: '김치볶음밥' }],
            recentMyRecipes: [{ id: 'recipe_my_1', title: '전자레인지 계란찜' }],
          },
        },
        failure: {
          ok: false,
          error: { code: 'HOME_SUMMARY_FAILED', message: '홈 콘텐츠를 불러오지 못했습니다.' },
        },
      },
    ],
  },
  {
    id: 'social',
    title: '좋아요 / 댓글 / 저장',
    summary: '로그인 후 인기 레시피, 추천 요리, 피드, 상세에서 동일하게 작동하는 소셜 액션입니다.',
    icon: Heart,
    endpoints: [
      {
        method: 'POST',
        path: '/recipes/{recipeId}/like/',
        title: '좋아요 토글',
        description: '내 레시피가 아닌 경우 작성자에게 좋아요 알림을 생성합니다.',
        request: { liked: true },
        success: {
          ok: true,
          data: { recipeId: 'recipe_1', isLiked: true, likeCount: 257, notificationCreated: true },
        },
        failure: {
          ok: false,
          error: { code: 'UNAUTHORIZED', message: '좋아요는 로그인 후 사용할 수 있습니다.' },
        },
      },
      {
        method: 'POST',
        path: '/recipes/{recipeId}/save/',
        title: '저장 토글',
        description: '저장 섹션과 마이페이지에서 저장한 레시피 목록을 관리합니다.',
        request: { saved: true },
        success: {
          ok: true,
          data: { recipeId: 'recipe_1', isSaved: true, savedCount: 33 },
        },
        failure: {
          ok: false,
          error: { code: 'UNAUTHORIZED', message: '저장은 로그인 후 사용할 수 있습니다.' },
        },
      },
      {
        method: 'GET',
        path: '/recipes/{recipeId}/comments/',
        title: '댓글 목록',
        description: '댓글과 작성자 답글을 인터랙티브 스레드 형태로 반환합니다.',
        request: null,
        success: {
          ok: true,
          data: {
            items: [
              {
                id: 'comment_1',
                content: '따라 만들기 쉬웠어요!',
                author: { id: 'user_2', name: '자취러' },
                replies: [{ id: 'reply_1', content: '맛있게 드셨다니 좋아요!', isAuthorReply: true }],
              },
            ],
          },
        },
        failure: {
          ok: false,
          error: { code: 'COMMENTS_LOAD_FAILED', message: '댓글을 불러오지 못했습니다.' },
        },
      },
      {
        method: 'POST',
        path: '/recipes/{recipeId}/comments/',
        title: '댓글 작성',
        description: '댓글 작성 시 레시피 작성자에게 알림을 생성합니다.',
        request: { content: '오늘 저녁으로 바로 해볼게요!' },
        success: {
          ok: true,
          data: { id: 'comment_2', recipeId: 'recipe_1', content: '오늘 저녁으로 바로 해볼게요!', notificationCreated: true },
        },
        failure: {
          ok: false,
          error: { code: 'COMMENT_TOO_LONG', message: '댓글은 500자 이하로 입력해주세요.' },
        },
      },
      {
        method: 'POST',
        path: '/comments/{commentId}/replies/',
        title: '작성자 답글',
        description: '레시피 작성자만 댓글에 공식 답글을 남길 수 있습니다.',
        request: { content: '참치 기름을 조금 빼면 더 담백해요.' },
        success: {
          ok: true,
          data: { id: 'reply_2', commentId: 'comment_1', isAuthorReply: true },
        },
        failure: {
          ok: false,
          error: { code: 'FORBIDDEN', message: '작성자만 답글을 남길 수 있습니다.' },
        },
      },
    ],
  },
  {
    id: 'notifications',
    title: '알림 / 마이페이지',
    summary: '환영 알림, 좋아요/댓글 알림, 읽음 처리, 빨간 카운트 배지를 위한 데이터입니다.',
    icon: Bell,
    endpoints: [
      {
        method: 'GET',
        path: '/notifications/',
        title: '알림 목록',
        description: '웹/앱에 맞는 알림 카드와 카운트 배지를 구성합니다.',
        request: null,
        success: {
          ok: true,
          data: {
            unreadCount: 3,
            items: [
              { id: 'noti_1', type: 'WELCOME', title: '찰칵밥상에 오신 걸 환영해요!', isRead: false },
              { id: 'noti_2', type: 'LIKE', title: '내 레시피에 좋아요가 눌렸어요.', isRead: false },
            ],
          },
        },
        failure: {
          ok: false,
          error: { code: 'UNAUTHORIZED', message: '알림은 로그인 후 확인할 수 있습니다.' },
        },
      },
      {
        method: 'PATCH',
        path: '/notifications/read/',
        title: '알림 읽음 처리',
        description: '읽음 처리 후 빨간 카운트 배지를 즉시 갱신합니다.',
        request: { notificationIds: ['noti_1', 'noti_2'] },
        success: {
          ok: true,
          data: { unreadCount: 0, updatedIds: ['noti_1', 'noti_2'] },
        },
        failure: {
          ok: false,
          error: { code: 'NOTIFICATION_NOT_FOUND', message: '읽음 처리할 알림을 찾을 수 없습니다.' },
        },
      },
      {
        method: 'GET',
        path: '/users/me/saved-recipes/',
        title: '저장한 레시피',
        description: '저장 섹션과 마이페이지 저장 탭에서 같은 카드 레이아웃으로 사용합니다.',
        request: null,
        success: {
          ok: true,
          data: { items: [{ id: 'recipe_1', title: '김치볶음밥', isSaved: true }], meta: { total: 1 } },
        },
        failure: {
          ok: false,
          error: { code: 'UNAUTHORIZED', message: '저장한 레시피는 로그인 후 볼 수 있습니다.' },
        },
      },
      {
        method: 'GET',
        path: '/users/me/summary/',
        title: '마이페이지 요약',
        description: '내 레시피, 저장, 좋아요, 구독/팔로워 카운트를 한 번에 내려줍니다.',
        request: null,
        success: {
          ok: true,
          data: { recipeCount: 8, savedCount: 12, likedCount: 21, followerCount: 5, followingCount: 4 },
        },
        failure: {
          ok: false,
          error: { code: 'UNAUTHORIZED', message: '마이페이지는 로그인 후 사용할 수 있습니다.' },
        },
      },
    ],
  },
  {
    id: 'ingredients',
    title: '재료 / 추천 / 업로드',
    summary: '재료 입력 제한, AI 인식, 냉장고 기반 추천, 레시피 이미지 업로드를 연결합니다.',
    icon: Utensils,
    endpoints: [
      {
        method: 'GET',
        path: '/ingredients/search/?q=계란',
        title: '재료 검색',
        description: '프론트는 20자 제한을 두고, 서버도 동일하게 검증합니다.',
        request: null,
        success: {
          ok: true,
          data: { items: [{ id: 'ingredient_1', name: '계란', aliases: ['달걀'] }], maxQueryLength: 20 },
        },
        failure: {
          ok: false,
          error: { code: 'QUERY_TOO_LONG', message: '재료 검색어는 20자 이하로 입력해주세요.' },
        },
      },
      {
        method: 'POST',
        path: '/ingredients/detect/',
        title: 'AI 재료 인식',
        description: '냉장고 사진에서 재료 후보를 추출해 추천 검색으로 넘깁니다.',
        request: { imageId: 'media_fridge_1' },
        success: {
          ok: true,
          data: { ingredients: [{ name: '계란', confidence: 0.94 }, { name: '김치', confidence: 0.88 }] },
        },
        failure: {
          ok: false,
          error: { code: 'DETECTION_FAILED', message: '재료를 인식하지 못했습니다. 다시 촬영해주세요.' },
        },
      },
      {
        method: 'POST',
        path: '/recommendations/by-ingredients/',
        title: '재료 기반 추천',
        description: '사용자가 가진 재료와 부족한 재료를 함께 보여주는 추천 결과입니다.',
        request: { ingredients: ['계란', '김치', '밥'], serving: 1 },
        success: {
          ok: true,
          data: {
            items: [
              { id: 'recipe_2', title: '김치볶음밥', matchRate: 0.92, missingIngredients: ['대파'] },
            ],
          },
        },
        failure: {
          ok: false,
          error: { code: 'NOT_ENOUGH_INGREDIENTS', message: '추천을 위해 최소 1개 이상의 재료가 필요합니다.' },
        },
      },
      {
        method: 'POST',
        path: '/media/upload/',
        title: '이미지 업로드',
        description: '레시피 대표 이미지, 단계 이미지, 재료 인식 이미지에 공통으로 사용합니다.',
        request: { file: 'multipart/form-data', purpose: 'recipe-step' },
        success: {
          ok: true,
          data: { id: 'media_1', url: 'https://cdn.example.com/media_1.jpg', width: 1200, height: 900 },
        },
        failure: {
          ok: false,
          error: { code: 'FILE_TOO_LARGE', message: '이미지는 10MB 이하만 업로드할 수 있습니다.' },
        },
      },
    ],
  },
  {
    id: 'cook-mode',
    title: '요리모드',
    summary: '모바일 가로 화면에서 단계별 진행, 완료, 좋아요 팝업을 서버와 동기화할 때 사용할 선택 API입니다.',
    icon: Zap,
    endpoints: [
      {
        method: 'POST',
        path: '/recipes/{recipeId}/cook-sessions/',
        title: '요리모드 시작',
        description: '가로모드 진입 시 세션을 만들고 현재 단계 진행률을 기록합니다.',
        request: { device: 'mobile-landscape', startedAt: '2026-05-06T11:00:00.000Z' },
        success: {
          ok: true,
          data: { sessionId: 'cook_1', recipeId: 'recipe_1', currentStep: 1, totalSteps: 3 },
        },
        failure: {
          ok: false,
          error: { code: 'RECIPE_NOT_FOUND', message: '요리모드를 시작할 레시피를 찾을 수 없습니다.' },
        },
      },
      {
        method: 'PATCH',
        path: '/cook-sessions/{sessionId}/steps/',
        title: '단계 완료',
        description: '이 단계 완료 버튼을 누르면 다음 단계로 이동하고 마지막 단계에서는 완료 팝업을 띄웁니다.',
        request: { completedStep: 2 },
        success: {
          ok: true,
          data: { sessionId: 'cook_1', completedStep: 2, nextStep: 3, isFinished: false },
        },
        failure: {
          ok: false,
          error: { code: 'INVALID_STEP', message: '요리 단계 정보가 올바르지 않습니다.' },
        },
      },
      {
        method: 'PATCH',
        path: '/cook-sessions/{sessionId}/finish/',
        title: '요리모드 완료',
        description: '모든 단계 완료 후 좋아요 팝업 액션과 상세페이지 복귀 흐름을 기록합니다.',
        request: { likedRecipe: true, finishedAt: '2026-05-06T11:08:00.000Z' },
        success: {
          ok: true,
          data: { sessionId: 'cook_1', isFinished: true, recipeLiked: true, likeCount: 258 },
        },
        failure: {
          ok: false,
          error: { code: 'SESSION_NOT_FOUND', message: '요리모드 세션을 찾을 수 없습니다.' },
        },
      },
    ],
  },
]

const highlights = [
  { label: 'API 그룹', value: '6', icon: Layers3 },
  { label: '엔드포인트', value: '24', icon: Server },
  { label: '공통 응답', value: 'ok/data/error', icon: FileJson },
  { label: '프론트 연결', value: '완료 기준', icon: CheckCircle2 },
]

function JsonBlock({
  title,
  value,
  tone,
}: {
  title: string
  value: unknown | null
  tone: 'request' | 'success' | 'failure'
}) {
  const toneClass = {
    request: 'border-sky-200 bg-sky-50/70 text-sky-950',
    success: 'border-emerald-200 bg-emerald-50/70 text-emerald-950',
    failure: 'border-rose-200 bg-rose-50/70 text-rose-950',
  }[tone]

  const Icon = tone === 'request' ? Code2 : tone === 'success' ? CheckCircle2 : AlertTriangle

  return (
    <div className={cn('overflow-hidden rounded-xl border', toneClass)}>
      <div className="flex items-center gap-2 border-b border-current/10 px-3 py-2 text-xs font-bold">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      <pre className="max-h-72 overflow-auto p-3 text-[11px] leading-relaxed text-foreground/85">
        <code>{value === null ? 'Request Body 없음' : JSON.stringify(value, null, 2)}</code>
      </pre>
    </div>
  )
}

function EndpointCard({ endpoint }: { endpoint: ApiEndpoint }) {
  return (
    <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
      <CardContent className="p-0">
        <div className="border-b border-border/70 bg-muted/30 p-4 sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={cn('rounded-md px-2.5 py-1 text-[11px] font-black', methodStyles[endpoint.method])}>
                  {endpoint.method}
                </Badge>
                <code className="rounded-md bg-background px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-border">
                  {endpoint.path}
                </code>
              </div>
              <div>
                <h3 className="text-base font-black text-foreground sm:text-lg">{endpoint.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{endpoint.description}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-3 p-4 sm:p-5 xl:grid-cols-3">
          <JsonBlock title="Request Body" value={endpoint.request} tone="request" />
          <JsonBlock title="Success Response" value={endpoint.success} tone="success" />
          <JsonBlock title="Failure Response" value={endpoint.failure} tone="failure" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function BackendApiPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background pb-24 lg:pb-0">
      <Header title="백엔드 API 명세" showBack />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-[#211814] px-5 py-7 text-white shadow-xl sm:px-8 lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,92,0,0.38),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(255,213,164,0.22),transparent_22%),linear-gradient(135deg,rgba(245,92,0,0.22),transparent_45%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="space-y-5">
              <Badge className="rounded-full bg-white/12 px-3 py-1 text-white ring-1 ring-white/20">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                찰칵밥상 Frontend x Backend Contract
              </Badge>
              <div className="max-w-3xl space-y-3">
                <h1 className="text-3xl font-black tracking-normal sm:text-4xl lg:text-5xl">
                  지금 만든 프론트 기능을 백엔드 API로 바로 연결하는 명세서
                </h1>
                <p className="text-sm leading-7 text-white/72 sm:text-base">
                  회원가입 환영 알림부터 레시피 등록, 피드 태그 AND 검색, 좋아요/댓글 알림,
                  모바일 가로 요리모드까지 실제 구현 기준으로 정리했습니다.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {highlights.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur">
                  <item.icon className="mb-3 h-5 w-5 text-primary-foreground" />
                  <p className="text-xs text-white/60">{item.label}</p>
                  <p className="mt-1 text-xl font-black">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <Card className="border-primary/15 bg-primary/5">
            <CardContent className="p-5">
              <Database className="mb-3 h-5 w-5 text-primary" />
              <h2 className="font-black">공통 성공 응답</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                모든 성공 응답은 <code className="rounded bg-background px-1">ok: true</code>와
                <code className="ml-1 rounded bg-background px-1">data</code>를 기준으로 통일합니다.
              </p>
            </CardContent>
          </Card>
          <Card className="border-rose-200 bg-rose-50/70">
            <CardContent className="p-5">
              <AlertTriangle className="mb-3 h-5 w-5 text-rose-600" />
              <h2 className="font-black">공통 실패 응답</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                실패 응답은 <code className="rounded bg-background px-1">ok: false</code>와
                <code className="ml-1 rounded bg-background px-1">error.code/message</code>로 처리합니다.
              </p>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50/70">
            <CardContent className="p-5">
              <KeyRound className="mb-3 h-5 w-5 text-emerald-700" />
              <h2 className="font-black">인증 원칙</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                등록, 저장, 마이, 좋아요, 댓글, 알림은 인증이 필요한 기능으로 서버에서 한 번 더 권한을 검증합니다.
              </p>
            </CardContent>
          </Card>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr] lg:items-start">
          <aside className="hidden lg:sticky lg:top-20 lg:block">
            <Card className="border-border/70 bg-card/90">
              <CardContent className="p-3">
                <p className="px-2 py-2 text-xs font-bold text-muted-foreground">API INDEX</p>
                <nav className="space-y-1">
                  {apiGroups.map((group) => (
                    <a
                      key={group.id}
                      href={`#${group.id}`}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <group.icon className="h-4 w-4" />
                      {group.title}
                    </a>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </aside>

          <div className="space-y-8">
            {apiGroups.map((group) => (
              <section key={group.id} id={group.id} className="scroll-mt-24 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                    <group.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black sm:text-2xl">{group.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{group.summary}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {group.endpoints.map((endpoint) => (
                    <EndpointCard key={`${endpoint.method}-${endpoint.path}-${endpoint.title}`} endpoint={endpoint} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
