'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Bookmark,
  CheckCircle2,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Heart,
  ListChecks,
  MessageCircle,
  Pencil,
  Send,
  Share2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { BottomNav } from '@/components/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Header } from '@/components/header'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { useNotifications } from '@/contexts/notification-context'
import { useRecipes } from '@/contexts/recipe-context'
import { getCommentCount, userRecipeToRecipe } from '@/lib/recipe-adapters'
import { mockRecipes } from '@/lib/mock-data'
import { DIFFICULTY_LABELS, type Comment, type Recipe } from '@/lib/types'
import { cn } from '@/lib/utils'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric' }).format(date)
}

const COOK_MODE_HINT_STORAGE_KEY = 'chalcak:cook-mode-hint-seen'

export default function RecipeDetailPage() {
  const params = useParams()
  const recipeId = String(params.id)
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const {
    getRecipe,
    getPublicInteraction,
    toggleLike,
    togglePublicLike,
    addComment,
    addPublicComment,
    addReply,
    addPublicReply,
    toggleSubscription,
    isSubscribedTo,
  } = useRecipes()
  const userRecipe = getRecipe(recipeId)
  const recipe: Recipe = userRecipe ? userRecipeToRecipe(userRecipe) : mockRecipes.find((item) => item.id === recipeId) || mockRecipes[0]
  const publicInteraction = userRecipe ? undefined : getPublicInteraction(recipe.id)
  const [isSaved, setIsSaved] = useState(recipe.isSaved || false)
  const [isLiked, setIsLiked] = useState(recipe.isLiked || false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [activeCookStep, setActiveCookStep] = useState(0)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [isCookModeDismissed, setIsCookModeDismissed] = useState(false)
  const [showCookModeHint, setShowCookModeHint] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const isUserRecipe = Boolean(userRecipe)
  const displayedLikes = userRecipe?.likes ?? publicInteraction?.likes ?? recipe.likes + (isLiked ? 1 : 0)
  const comments = useMemo(() => userRecipe?.comments ?? publicInteraction?.comments ?? [], [publicInteraction, userRecipe])
  const displayedComments = userRecipe ? getCommentCount(userRecipe) : comments.reduce((total, comment) => total + 1 + (comment.replies?.length ?? 0), 0)
  const isAuthor = Boolean(user && user.id === recipe.author.id)
  const isSubscribed = Boolean(user && isSubscribedTo(user.id, recipe.author.id))

  const difficultyColors = {
    easy: 'bg-accent text-accent-foreground',
    medium: 'bg-chart-4/20 text-chart-4',
    hard: 'bg-destructive/20 text-destructive',
  }

  useEffect(() => {
    setShowCookModeHint(window.localStorage.getItem(COOK_MODE_HINT_STORAGE_KEY) !== 'true')
  }, [])

  const dismissCookModeHint = () => {
    window.localStorage.setItem(COOK_MODE_HINT_STORAGE_KEY, 'true')
    setShowCookModeHint(false)
  }

  const handleLike = () => {
    if (!user) {
      toast.error('로그인 후 좋아요를 누를 수 있습니다.')
      return false
    }

    if (userRecipe) {
      toggleLike(userRecipe.id, user?.id || 'guest')
      toast.success(userRecipe.isLiked ? '좋아요를 취소했습니다.' : '좋아요를 눌렀습니다.')
      if (!userRecipe.isLiked) {
        addNotification({
          title: '내 레시피에 좋아요가 달렸어요',
          message: `${user.name}님이 "${userRecipe.title}" 레시피를 좋아합니다.`,
          href: `/recipe/${userRecipe.id}`,
        })
      }
      return true
    }

    togglePublicLike(recipe.id, recipe.likes)
    toast.success(publicInteraction?.isLiked ? '좋아요를 취소했습니다.' : '좋아요를 눌렀습니다.')
  }

  const handleSave = () => {
    if (!user) {
      toast.error('로그인 후 레시피를 저장할 수 있습니다.')
      return
    }

    setIsSaved((prev) => !prev)
    toast.success(isSaved ? '저장을 취소했습니다.' : '레시피를 저장했습니다.')
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('링크가 복사되었습니다.')
    } catch {
      toast.error('링크 복사에 실패했습니다.')
    }
  }

  const handleSubscribe = () => {
    if (!user) {
      toast.error('로그인 후 구독할 수 있습니다.')
      return
    }

    if (isAuthor) {
      toast.error('내 레시피 작성자는 구독할 수 없습니다.')
      return
    }

    toggleSubscription(
      {
        ...user,
        createdAt: new Date(user.createdAt),
      },
      recipe.author
    )
    toast.success(isSubscribed ? '구독을 취소했습니다.' : `${recipe.author.name}님을 구독했습니다.`)
  }

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return
    if (!user) {
      toast.error('로그인 후 댓글을 남길 수 있습니다.')
      return
    }

    const newComment = {
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: commentText.trim(),
    }

    if (userRecipe) {
      addComment(userRecipe.id, newComment)
      addNotification({
        title: '내 레시피에 댓글이 달렸어요',
        message: `${user.name}님이 "${userRecipe.title}" 레시피에 댓글을 남겼습니다.`,
        href: `/recipe/${userRecipe.id}`,
      })
    } else {
      addPublicComment(recipe.id, recipe.likes, newComment)
    }
    setCommentText('')
    toast.success('댓글이 등록되었습니다.')
  }

  const handleReplySubmit = (commentId: string) => {
    if (!replyText.trim()) return
    if (!user) {
      toast.error('로그인 후 답글을 남길 수 있습니다.')
      return
    }

    const newReply = {
      userId: recipe.author.id,
      userName: recipe.author.name,
      userAvatar: recipe.author.avatar,
      content: replyText.trim(),
    }

    if (userRecipe) {
      addReply(userRecipe.id, commentId, newReply)
    } else {
      addPublicReply(recipe.id, recipe.likes, commentId, newReply)
    }
    setReplyText('')
    setReplyingTo(null)
    toast.success('답글이 등록되었습니다.')
  }

  const toggleStep = (stepOrder: number) => {
    setCompletedSteps((prev) => {
      const next = prev.includes(stepOrder) ? prev.filter((step) => step !== stepOrder) : [...prev, stepOrder]
      if (next.length === recipe.steps.length && prev.length !== recipe.steps.length) {
        setShowCompletionDialog(true)
      }
      return next
    })
  }

  const completeCookStep = (stepOrder: number) => {
    const currentIndex = recipe.steps.findIndex((step) => step.order === stepOrder)
    const isLastStep = currentIndex === recipe.steps.length - 1

    setCompletedSteps((prev) => {
      const next = prev.includes(stepOrder) ? prev : [...prev, stepOrder]
      if (next.length === recipe.steps.length) {
        setShowCompletionDialog(true)
        setShowCookModeHint(false)
      }
      return next
    })

    if (!isLastStep) {
      setActiveCookStep(currentIndex + 1)
    }
  }

  const scrollToComments = () => {
    document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const goToPrevCookStep = () => {
    setActiveCookStep((prev) => Math.max(prev - 1, 0))
  }

  const goToNextCookStep = () => {
    setActiveCookStep((prev) => Math.min(prev + 1, recipe.steps.length - 1))
  }

  return (
    <div className="flex min-h-screen flex-col pb-28">
      <Header showBack showNotification={false} />

      <main className="flex-1 lg:px-8 lg:py-6">
        <div className="relative aspect-[16/10] overflow-hidden lg:mx-auto lg:max-w-7xl lg:rounded-lg lg:shadow-sm">
          <img src={recipe.image} alt={recipe.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {!isUserRecipe && (
            <div className="absolute right-4 top-4 flex gap-2">
              <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full bg-white/90" onClick={handleLike}>
                <Heart className={cn('h-5 w-5', isLiked && 'fill-primary text-primary')} />
              </Button>
              <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full bg-white/90" onClick={handleSave}>
                <Bookmark className={cn('h-5 w-5', isSaved && 'fill-primary text-primary')} />
              </Button>
              <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full bg-white/90" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        <div className="px-4 lg:mx-auto lg:max-w-7xl lg:px-0">
          <div className="relative z-10 -mt-8">
            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge className={difficultyColors[recipe.difficulty]}>{DIFFICULTY_LABELS[recipe.difficulty]}</Badge>
                  {recipe.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                <h1 className="text-2xl font-bold lg:text-3xl">{recipe.title}</h1>
                <p className="mt-2 text-muted-foreground">{recipe.description}</p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {recipe.cookTime}분
                  </span>
                  <span className="flex items-center gap-1">
                    <ChefHat className="h-4 w-4" />
                    {recipe.servings}인분
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {displayedLikes.toLocaleString()}
                  </span>
                  {isUserRecipe && (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {displayedComments.toLocaleString()}
                    </span>
                  )}
                </div>

                <Separator className="my-4" />
                <div className="flex items-center justify-between">
                  <Link href="#" className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={recipe.author.avatar} />
                      <AvatarFallback>{recipe.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{recipe.author.name}</p>
                      <p className="text-xs text-muted-foreground">레시피 작성자</p>
                    </div>
                  </Link>
                  {isAuthor && isUserRecipe && (
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                      <Link href={`/my-recipe/new?edit=${recipe.id}`}>
                        <Pencil className="h-4 w-4" />
                        수정
                      </Link>
                    </Button>
                  )}
                  {!isAuthor && (
                    <Button variant={isSubscribed ? 'secondary' : 'outline'} size="sm" className="gap-1.5" onClick={handleSubscribe}>
                      {isSubscribed ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                      {isSubscribed ? '구독중' : '구독'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 space-y-6">
            <section id="ingredients-section" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-5 w-5" />
                    재료 · {recipe.servings}인분 기준
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {recipe.ingredients.map((item, index) => (
                      <li key={`${item.ingredient.name}-${index}`} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          {item.ingredient.name}
                        </span>
                        <span className="text-right text-muted-foreground">{item.amount}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section id="steps-section" className="scroll-mt-24 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">조리법</h2>
                <span className="text-sm text-muted-foreground">
                  {completedSteps.length}/{recipe.steps.length} 완료
                </span>
              </div>
              {recipe.steps.map((step) => (
                <Card
                  key={step.order}
                  className={cn('cursor-pointer transition-all', completedSteps.includes(step.order) && 'border-accent bg-accent/30')}
                  onClick={() => toggleStep(step.order)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        {completedSteps.includes(step.order) ? (
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                        ) : (
                          <Circle className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-semibold text-primary">Step {step.order}</span>
                        </div>
                        <p className={cn('text-sm', completedSteps.includes(step.order) && 'line-through opacity-60')}>{step.description}</p>
                        {step.image && <img src={step.image} alt="" className="mt-3 h-36 w-full rounded-md object-cover" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>

            <section id="comments-section" className="scroll-mt-24">
              <div className="mb-3 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">댓글</h2>
                <span className="text-sm text-muted-foreground">{displayedComments.toLocaleString()}개</span>
              </div>
              <CommentSection
                comments={comments}
                canComment={Boolean(user)}
                isAuthor={isAuthor}
                commentText={commentText}
                replyText={replyText}
                replyingTo={replyingTo}
                onCommentChange={setCommentText}
                onReplyChange={setReplyText}
                onCommentSubmit={handleCommentSubmit}
                onReplySubmit={handleReplySubmit}
                onReplyingToChange={setReplyingTo}
              />
            </section>
          </div>
        </div>
      </main>

      <CookingModeOverlay
        recipe={recipe}
        activeStep={activeCookStep}
        completedSteps={completedSteps}
        isDismissed={isCookModeDismissed}
        onStepChange={setActiveCookStep}
        onPrev={goToPrevCookStep}
        onNext={goToNextCookStep}
        onCompleteStep={completeCookStep}
      />

      <Dialog open={showCompletionDialog}>
        <DialogContent showCloseButton={false} className="max-w-[360px] text-center">
          <button
            type="button"
            aria-label="닫기"
            className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setShowCompletionDialog(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <DialogHeader className="items-center text-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ChefHat className="h-7 w-7" />
            </div>
            <DialogTitle className="text-xl">요리가 완성되었어요!</DialogTitle>
            <DialogDescription className="leading-6">
              레시피에 좋아요를 눌러볼까요?
            </DialogDescription>
          </DialogHeader>
          <Button
            size="lg"
            className="mt-2 w-full gap-2"
            onClick={() => {
              const didLike = handleLike()
              if (didLike === false) return
              setShowCompletionDialog(false)
              setIsCookModeDismissed(true)
              setShowCookModeHint(false)
              setActiveCookStep(0)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            <Heart className="h-5 w-5" />
            좋아요 누르기
          </Button>
        </DialogContent>
      </Dialog>

      {showCookModeHint && !showCompletionDialog && (
        <div className="cook-mode-hint fixed inset-x-0 top-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-[45] flex items-end bg-black/35 backdrop-blur-[2px] lg:left-72 lg:bottom-0">
          <div className="cook-mode-hint-sheet w-full rounded-t-[2rem] border-x border-t border-primary/15 bg-background shadow-2xl shadow-primary/20">
            <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-muted-foreground/20" />
            <div className="mx-auto flex max-h-[calc(100dvh-64px-env(safe-area-inset-bottom))] max-w-xl flex-col overflow-y-auto px-5 pb-5 pt-4">
              <div className="cook-mode-onboarding-visual">
                <img src={recipe.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/20" />
                <div className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-lg">
                  요리모드
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="mb-3 max-w-[14rem] text-white">
                    <p className="text-lg font-bold leading-6">큰 화면으로 보는 조리 단계</p>
                    <p className="mt-1 text-xs text-white/70">완료 버튼으로 다음 Step까지 이어져요</p>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/25">
                    <div className="cook-mode-progress-bar h-full rounded-full bg-primary" />
                  </div>
                </div>
                <div className="cook-mode-rotate-demo" aria-hidden="true">
                  <div className="cook-mode-device-outline">
                    <span className="h-1.5 w-7 rounded-full bg-muted" />
                    <span className="h-1.5 w-12 rounded-full bg-muted/80" />
                  </div>
                </div>
              </div>

              <div className="mt-5 text-center">
                <p className="text-xl font-bold leading-7">화면을 돌리면 요리모드가 열려요</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  단계별 사진과 조리법을 크게 보고, 완료 버튼으로 다음 단계까지 이어서 진행할 수 있어요.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-primary/10 bg-primary/5 p-3 text-xs font-semibold text-primary">
                <span>가로 화면 전용 조리 UX</span>
                <span className="rounded-full bg-primary px-2.5 py-1 text-primary-foreground">Cooking mode</span>
              </div>

              <Button className="mt-4 h-12 w-full rounded-2xl" onClick={dismissCookModeHint}>
                알겠어요
              </Button>
            </div>
          </div>
        </div>
      )}

      {true && (
        <div className="fixed inset-x-0 bottom-16 z-40 px-4 py-3 lg:bottom-4 lg:left-72">
          <div className="mx-auto flex max-w-lg items-center gap-3 rounded-lg border border-primary/25 bg-background/95 p-2 shadow-2xl shadow-primary/20 backdrop-blur">
            <Button
              className="flex-1 gap-2 bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90"
              size="lg"
              onClick={handleLike}
            >
              <Heart className={cn('h-5 w-5', (userRecipe?.isLiked || publicInteraction?.isLiked || isLiked) && 'fill-current')} />
              좋아요 {displayedLikes.toLocaleString()}
            </Button>
            <Button
              className="gap-2 border-2 border-accent bg-accent text-accent-foreground shadow-md shadow-accent/20 hover:bg-accent/90"
              size="lg"
              variant="outline"
              onClick={scrollToComments}
            >
              <MessageCircle className="h-5 w-5" />
              댓글
            </Button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

interface CommentSectionProps {
  comments: Comment[]
  canComment: boolean
  isAuthor: boolean
  commentText: string
  replyText: string
  replyingTo: string | null
  onCommentChange: (value: string) => void
  onReplyChange: (value: string) => void
  onCommentSubmit: () => void
  onReplySubmit: (commentId: string) => void
  onReplyingToChange: (commentId: string | null) => void
}

function CookingModeOverlay({
  recipe,
  activeStep,
  completedSteps,
  isDismissed,
  onStepChange,
  onPrev,
  onNext,
  onCompleteStep,
}: {
  recipe: Recipe
  activeStep: number
  completedSteps: number[]
  isDismissed: boolean
  onStepChange: (index: number) => void
  onPrev: () => void
  onNext: () => void
  onCompleteStep: (stepOrder: number) => void
}) {
  const step = recipe.steps[activeStep] || recipe.steps[0]
  const progress = `${activeStep + 1}/${recipe.steps.length}`
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  const handleTouchEnd = (clientX: number) => {
    if (touchStartX === null) return

    const deltaX = clientX - touchStartX
    if (Math.abs(deltaX) > 48) {
      if (deltaX < 0) onNext()
      else onPrev()
    }
    setTouchStartX(null)
  }

  if (!step || isDismissed) return null

  return (
    <div className="cook-mode-landscape fixed inset-0 z-[45] hidden h-[100dvh] max-h-[100dvh] bg-background text-foreground">
      <div className="cook-mode-grid grid h-[100dvh] max-h-[100dvh] min-h-0 grid-cols-[minmax(0,1fr)_clamp(220px,28vw,280px)] overflow-hidden">
        <section
          className="relative h-[100dvh] max-h-[100dvh] min-w-0 touch-pan-y overflow-hidden bg-black"
          onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
          onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? touchStartX ?? 0)}
        >
          <img src={step.image || recipe.image} alt="" className="h-full w-full object-cover opacity-95" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/15" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4 text-white sm:p-6">
            <Badge className="bg-primary text-primary-foreground">요리모드</Badge>
            <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur">Step {progress}</span>
          </div>
          <div className="cook-mode-step-panel absolute inset-x-0 text-white">
            <div className="cook-mode-step-card max-w-[min(680px,calc(100vw-340px))] space-y-3">
              <div className="flex items-end gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-black text-primary shadow-lg">
                  {step.order}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white/70">현재 조리 단계</p>
                  <h2 className="text-2xl font-bold">Step {step.order}</h2>
                </div>
              </div>
              <div className="cook-mode-step-copy rounded-xl bg-black/65 px-4 py-3 shadow-2xl backdrop-blur-md">
                <p className="text-lg leading-8 text-white">{step.description}</p>
              </div>
            </div>
          </div>
        </section>

        <aside className="flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden border-l border-border bg-card/95 backdrop-blur">
          <div className="shrink-0 border-b border-border p-4">
            <p className="line-clamp-1 text-sm font-semibold text-muted-foreground">{recipe.title}</p>
            <div className="mt-3 flex items-center justify-between">
              <Button size="icon" variant="outline" className="rounded-full" onClick={onPrev} disabled={activeStep === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <p className="text-xl font-bold">{progress}</p>
                <p className="text-xs text-muted-foreground">좌우 버튼 또는 단계 리스트</p>
              </div>
              <Button size="icon" variant="outline" className="rounded-full" onClick={onNext} disabled={activeStep === recipe.steps.length - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3 text-sm font-bold">
            <ListChecks className="h-4 w-4 text-primary" />
            레시피 순서
          </div>
          <div className="min-h-0 flex-1 snap-y overflow-y-auto p-3">
            {recipe.steps.map((item, index) => {
              const isActive = index === activeStep
              const isDone = completedSteps.includes(item.order)

              return (
                <button
                  key={item.order}
                  type="button"
                  className={cn(
                    'mb-2 flex w-full snap-start items-start gap-3 rounded-lg border p-3 text-left transition-all',
                    isActive ? 'border-primary bg-primary/10 shadow-sm' : 'border-border bg-background hover:border-primary/40',
                  )}
                  onClick={() => onStepChange(index)}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {item.order}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn('line-clamp-2 text-sm font-medium', isDone && 'line-through opacity-60')}>{item.description}</span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className="shrink-0 border-t border-border bg-card/95 p-3">
            <Button className="w-full gap-2" onClick={() => onCompleteStep(step.order)}>
              <CheckCircle2 className="h-4 w-4" />
              {completedSteps.includes(step.order) ? '다음 단계로' : '이 단계 완료'}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}

function CommentSection({
  comments,
  canComment,
  isAuthor,
  commentText,
  replyText,
  replyingTo,
  onCommentChange,
  onReplyChange,
  onCommentSubmit,
  onReplySubmit,
  onReplyingToChange,
}: CommentSectionProps) {
  if (!canComment) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">로그인 후 댓글을 남길 수 있습니다.</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 p-4">
          <Textarea placeholder="댓글을 남겨보세요." value={commentText} onChange={(e) => onCommentChange(e.target.value)} />
          <Button className="w-full gap-2" onClick={onCommentSubmit} disabled={!commentText.trim()}>
            <Send className="h-4 w-4" />
            댓글 등록
          </Button>
        </CardContent>
      </Card>

      {comments.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">아직 댓글이 없습니다.</CardContent>
        </Card>
      ) : (
        comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="space-y-3 p-4">
              <CommentItem comment={comment} />
              {comment.replies?.map((reply) => (
                <div key={reply.id} className="ml-8 border-l border-border pl-3">
                  <CommentItem comment={reply} isReply />
                </div>
              ))}
              {isAuthor && (
                <div className="ml-8">
                  {replyingTo === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="작성자로 답글을 남겨보세요."
                        value={replyText}
                        onChange={(e) => onReplyChange(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => onReplySubmit(comment.id)} disabled={!replyText.trim()}>
                          답글 등록
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onReplyingToChange(null)}>
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => onReplyingToChange(comment.id)}>
                      작성자로 답글 달기
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

function CommentItem({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) {
  return (
    <div className="flex gap-3">
      <Avatar className="h-9 w-9">
        <AvatarImage src={comment.userAvatar} />
        <AvatarFallback>{comment.userName[0]}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{comment.userName}</p>
          {isReply && <Badge variant="secondary">작성자</Badge>}
          <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{comment.content}</p>
      </div>
    </div>
  )
}
