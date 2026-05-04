'use client'

import { Suspense, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Camera, ChefHat, Clock, Plus, Trash2, Users, X } from 'lucide-react'
import { toast } from 'sonner'
import { AuthRequiredState } from '@/components/auth-required-state'
import { BottomNav } from '@/components/bottom-nav'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { useRecipes } from '@/contexts/recipe-context'

interface Ingredient {
  id: string
  name: string
  amount: string
}

interface Step {
  id: string
  description: string
  image?: string
}

const fallbackImage = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&h=400&fit=crop'

function NewRecipeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { addRecipe, getRecipe, updateRecipe } = useRecipes()
  const editRecipeId = searchParams.get('edit')
  const editingRecipe = editRecipeId ? getRecipe(editRecipeId) : undefined
  const isEditing = Boolean(editRecipeId)
  const mainImageRef = useRef<HTMLInputElement>(null)
  const stepImageRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cookTime: '',
    servings: '',
    difficulty: '',
    mainImage: '',
    tags: '',
  })
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ id: '1', name: '', amount: '' }])
  const [steps, setSteps] = useState<Step[]>([{ id: '1', description: '' }])

  useEffect(() => {
    if (!editRecipeId) return
    if (!editingRecipe) return

    if (user && editingRecipe.author.id !== user.id) {
      toast.error('내가 작성한 레시피만 수정할 수 있습니다.')
      router.replace(`/recipe/${editRecipeId}`)
      return
    }

    setFormData({
      title: editingRecipe.title,
      description: editingRecipe.description,
      cookTime: String(editingRecipe.cookTime),
      servings: String(editingRecipe.servings),
      difficulty: editingRecipe.difficulty,
      mainImage: editingRecipe.image,
      tags: editingRecipe.tags.join(', '),
    })
    setIngredients(
      editingRecipe.ingredients.length > 0
        ? editingRecipe.ingredients.map((ingredient, index) => ({
            id: `${index + 1}`,
            name: ingredient.name,
            amount: ingredient.amount,
          }))
        : [{ id: '1', name: '', amount: '' }]
    )
    setSteps(
      editingRecipe.steps.length > 0
        ? editingRecipe.steps.map((step, index) => ({
            id: `${index + 1}`,
            description: step.description,
            image: step.image,
          }))
        : [{ id: '1', description: '' }]
    )
  }, [editRecipeId, editingRecipe, router, user])

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col pb-24 lg:pb-0">
      <Header title={isEditing ? '레시피 수정' : '레시피 등록'} />
        <AuthRequiredState icon="utensils" description="나만의 레시피를 등록하려면 먼저 로그인해주세요." />
        <BottomNav />
      </div>
    )
  }

  const uploadImage = (e: ChangeEvent<HTMLInputElement>, onLoad: (src: string) => void) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => onLoad(reader.result as string)
    reader.readAsDataURL(file)
  }

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { id: Date.now().toString(), name: '', amount: '' }])
  }

  const addStep = () => {
    setSteps((prev) => [...prev, { id: Date.now().toString(), description: '' }])
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const validIngredients = ingredients.filter((item) => item.name.trim())
    const validSteps = steps.filter((step) => step.description.trim())

    if (!formData.title.trim()) {
      toast.error('레시피 제목을 입력해주세요.')
      return
    }

    if (validIngredients.length === 0) {
      toast.error('재료를 최소 1개 이상 입력해주세요.')
      return
    }

    if (validSteps.length === 0) {
      toast.error('조리 순서를 최소 1개 이상 입력해주세요.')
      return
    }

    if (isEditing && !editingRecipe) {
      toast.error('수정할 레시피를 찾을 수 없습니다.')
      return
    }

    setIsSubmitting(true)
    const recipePayload = {
      title: formData.title.trim(),
      description: formData.description.trim() || '직접 등록한 마이 레시피입니다.',
      image: formData.mainImage || fallbackImage,
      cookTime: Number(formData.cookTime || 10),
      servings: Number(formData.servings || 1),
      difficulty: (formData.difficulty || 'easy') as 'easy' | 'medium' | 'hard',
      ingredients: validIngredients.map(({ name, amount }) => ({ name: name.trim(), amount: amount.trim() || '적당량' })),
      steps: validSteps.map(({ description, image }) => ({ description: description.trim(), image })),
      author: {
        ...user,
        createdAt: new Date(user.createdAt),
      },
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 5),
    }
    if (isEditing && editRecipeId) {
      updateRecipe(editRecipeId, recipePayload)
      toast.success('레시피가 수정되었습니다.')
      router.push(`/recipe/${editRecipeId}`)
      setIsSubmitting(false)
      return
    }

    addRecipe(recipePayload)
    toast.success('레시피가 등록되었습니다.')
    router.push('/')
    setIsSubmitting(false)
  }

  return (
    <div className="flex min-h-screen flex-col pb-28 lg:pb-6">
      <Header title={isEditing ? '레시피 수정' : '레시피 등록'} />

      <main className="flex-1 px-4 py-4 pb-44 sm:px-6 lg:px-8 lg:py-6 lg:pb-16">
        <form onSubmit={handleSubmit} className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(340px,0.85fr)_minmax(0,1.15fr)] lg:items-start">
          <div className="space-y-6 lg:sticky lg:top-24">
          <Card>
            <CardContent className="p-4">
              <FieldLabel className="mb-2">메인 이미지</FieldLabel>
              <button
                type="button"
                onClick={() => mainImageRef.current?.click()}
                className="relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary/50"
              >
                {formData.mainImage ? (
                  <img src={formData.mainImage} alt="메인 이미지" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Camera className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">클릭해서 이미지를 업로드</p>
                  </div>
                )}
              </button>
              <input
                ref={mainImageRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => uploadImage(e, (src) => setFormData((prev) => ({ ...prev, mainImage: src })))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="mb-4 font-semibold text-foreground">기본 정보</h3>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="title">레시피 제목</FieldLabel>
                  <Input
                    id="title"
                    placeholder="예: 초간단 계란 볶음밥"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="description">소개</FieldLabel>
                  <Textarea
                    id="description"
                    rows={3}
                    placeholder="레시피에 대한 간단한 소개를 작성해주세요."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="tags">태그</FieldLabel>
                  <Input
                    id="tags"
                    placeholder="자취요리, 초간단, 아침"
                    value={formData.tags}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                  />
                </Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field>
                    <FieldLabel className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      시간
                    </FieldLabel>
                    <Select value={formData.cookTime} onValueChange={(value) => setFormData((prev) => ({ ...prev, cookTime: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5분</SelectItem>
                        <SelectItem value="10">10분</SelectItem>
                        <SelectItem value="20">20분</SelectItem>
                        <SelectItem value="30">30분</SelectItem>
                        <SelectItem value="60">1시간</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      인분
                    </FieldLabel>
                    <Select value={formData.servings} onValueChange={(value) => setFormData((prev) => ({ ...prev, servings: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1인분</SelectItem>
                        <SelectItem value="2">2인분</SelectItem>
                        <SelectItem value="3">3인분</SelectItem>
                        <SelectItem value="4">4인분</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel className="flex items-center gap-1">
                      <ChefHat className="h-3 w-3" />
                      난이도
                    </FieldLabel>
                    <Select value={formData.difficulty} onValueChange={(value) => setFormData((prev) => ({ ...prev, difficulty: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">쉬움</SelectItem>
                        <SelectItem value="medium">보통</SelectItem>
                        <SelectItem value="hard">어려움</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>
          </div>

          <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">재료</h3>
                <Button type="button" variant="ghost" size="sm" onClick={addIngredient}>
                  <Plus className="mr-1 h-4 w-4" />
                  추가
                </Button>
              </div>
              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div key={ingredient.id} className="flex items-center gap-2">
                    <span className="w-6 text-center text-sm text-muted-foreground">{index + 1}</span>
                    <Input
                      placeholder="재료명"
                      className="flex-1"
                      value={ingredient.name}
                      onChange={(e) =>
                        setIngredients((prev) => prev.map((item) => (item.id === ingredient.id ? { ...item, name: e.target.value } : item)))
                      }
                    />
                    <Input
                      placeholder="양"
                      className="w-24"
                      value={ingredient.amount}
                      onChange={(e) =>
                        setIngredients((prev) => prev.map((item) => (item.id === ingredient.id ? { ...item, amount: e.target.value } : item)))
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={ingredients.length === 1}
                      onClick={() => setIngredients((prev) => prev.filter((item) => item.id !== ingredient.id))}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">조리 순서</h3>
                <Button type="button" variant="ghost" size="sm" onClick={addStep}>
                  <Plus className="mr-1 h-4 w-4" />
                  추가
                </Button>
              </div>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="rounded-lg border border-border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">Step {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={steps.length === 1}
                        onClick={() => setSteps((prev) => prev.filter((item) => item.id !== step.id))}
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                    <Textarea
                      rows={2}
                      placeholder="조리 방법을 작성해주세요."
                      value={step.description}
                      onChange={(e) => setSteps((prev) => prev.map((item) => (item.id === step.id ? { ...item, description: e.target.value } : item)))}
                    />
                    <div className="mt-2">
                      {step.image ? (
                        <div className="relative">
                          <img src={step.image} alt={`Step ${index + 1}`} className="h-24 w-full rounded-md object-cover" />
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="absolute right-1 top-1 h-6 w-6"
                            onClick={() => setSteps((prev) => prev.map((item) => (item.id === step.id ? { ...item, image: undefined } : item)))}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => stepImageRefs.current[step.id]?.click()}
                          className="flex h-12 w-full items-center justify-center gap-2 rounded-md border border-dashed border-border text-sm text-muted-foreground hover:border-primary/50"
                        >
                          <Camera className="h-4 w-4" />
                          사진 추가
                        </button>
                      )}
                      <input
                        ref={(el) => {
                          stepImageRefs.current[step.id] = el
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          uploadImage(e, (src) => setSteps((prev) => prev.map((item) => (item.id === step.id ? { ...item, image: src } : item))))
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (isEditing ? '수정 중...' : '등록 중...') : isEditing ? '레시피 수정하기' : '레시피 등록하기'}
          </Button>
          </div>
        </form>
      </main>

      <BottomNav />
    </div>
  )
}

export default function NewRecipePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col pb-28 lg:pb-6">
          <Header title="레시피 등록" />
          <main className="flex-1 p-4">
            <Card>
              <CardContent className="h-48 animate-pulse bg-muted" />
            </Card>
          </main>
          <BottomNav />
        </div>
      }
    >
      <NewRecipeContent />
    </Suspense>
  )
}
