'use client'

import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Plus, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function HeroSection() {
  const router = useRouter()
  const [inputValue, setInputValue] = useState('')
  const [ingredients, setIngredients] = useState<string[]>([])
  const [showUploadMenu, setShowUploadMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const addIngredient = (ingredient: string) => {
    if (ingredients.includes(ingredient)) {
      toast.error('이미 추가한 재료입니다.')
      return
    }
    if (ingredients.length >= 10) {
      toast.error('재료는 최대 10개까지 추가할 수 있습니다.')
      return
    }
    setIngredients((prev) => [...prev, ingredient])
    setInputValue('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addIngredient(inputValue.trim())
    }
  }

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    toast.success('사진이 업로드되었습니다. 재료를 분석하는 중입니다.')
    setTimeout(() => {
      ;['양파', '달걀', '감자'].forEach((ingredient) => {
        setIngredients((prev) => (prev.includes(ingredient) ? prev : [...prev, ingredient]))
      })
      toast.success('재료 인식이 완료되었습니다.')
    }, 900)
    setShowUploadMenu(false)
  }

  const handleGetRecommendations = () => {
    if (ingredients.length === 0) {
      toast.error('재료를 최소 1개 이상 입력해주세요.')
      return
    }
    const params = new URLSearchParams()
    params.set('ingredients', ingredients.join(','))
    router.push(`/recommendations?${params.toString()}`)
  }

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-stretch">
        <div className="overflow-hidden rounded-lg bg-card shadow-sm ring-1 ring-border lg:min-h-[360px]">
          <div className="relative h-full min-h-[260px]">
            <img
              src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&h=800&fit=crop"
              alt="신선한 재료와 조리 도구가 놓인 주방"
              className="h-full min-h-[260px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6 lg:p-8">
              <h1 className="max-w-xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">찰칵밥상</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 sm:text-base">
                냉장고 속 재료를 입력하고 지금 만들 수 있는 레시피를 바로 찾아보세요.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5 lg:flex lg:flex-col lg:justify-center lg:p-6">
          <div>
            <p className="text-sm font-semibold text-primary">재료로 시작하기</p>
            <h2 className="mt-1 text-xl font-bold">가지고 있는 재료를 추가하세요</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">직접 입력하거나 사진으로 재료를 인식해 맞춤 레시피를 추천받을 수 있습니다.</p>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="재료 입력 후 Enter"
              className="h-12 text-base"
            />
            <div className="relative">
              <Button type="button" size="icon" variant="outline" className="h-12 w-12" onClick={() => setShowUploadMenu((prev) => !prev)}>
                <Plus className="h-5 w-5" />
              </Button>
              {showUploadMenu && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-border bg-card p-2 shadow-lg">
                  <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="h-4 w-4 text-muted-foreground" />
                    갤러리에서 선택
                  </button>
                  <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted" onClick={() => cameraInputRef.current?.click()}>
                    <Camera className="h-4 w-4 text-muted-foreground" />
                    카메라로 촬영
                  </button>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
          </div>

          {ingredients.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {ingredients.map((ingredient) => (
                <span key={ingredient} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                  {ingredient}
                  <button onClick={() => setIngredients((prev) => prev.filter((item) => item !== ingredient))} className="ml-1 rounded-full p-0.5 hover:bg-primary/20" aria-label={`${ingredient} 삭제`}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <Button onClick={handleGetRecommendations} size="lg" className="mt-5 w-full gap-2" disabled={ingredients.length === 0}>
            <Sparkles className="h-5 w-5" />
            {ingredients.length > 0 ? `${ingredients.length}개 재료로 추천받기` : '재료를 추가해주세요'}
          </Button>
        </div>
      </div>
    </section>
  )
}
