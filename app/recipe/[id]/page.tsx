'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Bookmark, CheckCircle2, ChefHat, Circle, Clock, Heart, MessageCircle, Send, Share2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { BottomNav } from '@/components/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  } = useRecipes()
  const userRecipe = getRecipe(recipeId)
  const recipe: Recipe = userRecipe ? userRecipeToRecipe(userRecipe) : mockRecipes.find((item) => item.id === recipeId) || mockRecipes[0]
  const publicInteraction = userRecipe ? undefined : getPublicInteraction(recipe.id)
  const [isSaved, setIsSaved] = useState(recipe.isSaved || false)
  const [isLiked, setIsLiked] = useState(recipe.isLiked || false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const isUserRecipe = Boolean(userRecipe)
  const displayedLikes = userRecipe?.likes ?? publicInteraction?.likes ?? recipe.likes + (isLiked ? 1 : 0)
  const comments = useMemo(() => userRecipe?.comments ?? publicInteraction?.comments ?? [], [publicInteraction, userRecipe])
  const displayedComments = userRecipe ? getCommentCount(userRecipe) : comments.reduce((total, comment) => total + 1 + (comment.replies?.length ?? 0), 0)
  const isAuthor = Boolean(user && user.id === recipe.author.id)

  const difficultyColors = {
    easy: 'bg-accent text-accent-foreground',
    medium: 'bg-chart-4/20 text-chart-4',
    hard: 'bg-destructive/20 text-destructive',
  }

  const handleLike = () => {
    if (!user) {
      toast.error('로그인 후 좋아요를 누를 수 있습니다.')
      return
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
      return
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
    setCompletedSteps((prev) => (prev.includes(stepOrder) ? prev.filter((step) => step !== stepOrder) : [...prev, stepOrder]))
  }

  const scrollToComments = () => {
    document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    공유
                  </Button>
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
