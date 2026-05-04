'use client'

import { Suspense, useState, useRef, useCallback, type ChangeEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Camera, Upload, X, Plus, Sparkles, Search } from 'lucide-react'
import { Header } from '@/components/header'
import { BottomNav } from '@/components/bottom-nav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IngredientBadge } from '@/components/ingredient-badge'
import { toast } from 'sonner'
import { mockIngredients } from '@/lib/mock-data'
import { INGREDIENT_CATEGORIES } from '@/lib/types'
import type { Ingredient } from '@/lib/types'

const MAX_INGREDIENT_QUERY_LENGTH = 20

function IngredientsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialMode = searchParams.get('mode') === 'manual' ? 'manual' : 'photo'
  
  const [activeTab, setActiveTab] = useState(initialMode)
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredIngredients = mockIngredients.filter(
    (ing) =>
      ing.name.includes(searchQuery) &&
      !selectedIngredients.some((s) => s.id === ing.id)
  )

  const groupedIngredients = Object.entries(INGREDIENT_CATEGORIES).reduce(
    (acc, [key, label]) => {
      const items = filteredIngredients.filter((ing) => ing.category === key)
      if (items.length > 0) {
        acc[label] = items
      }
      return acc
    },
    {} as Record<string, Ingredient[]>
  )

  const handleFileUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleCameraCapture = useCallback(() => {
    // In a real app, this would open the device camera
    toast.info('카메라 기능은 모바일에서 사용 가능합니다.')
    fileInputRef.current?.click()
  }, [])

  const analyzeImage = useCallback(async () => {
    if (!uploadedImage) return
    
    setIsAnalyzing(true)
    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    // Mock detected ingredients
    const detected = mockIngredients.slice(0, 4)
    setSelectedIngredients((prev) => {
      const newIngredients = detected.filter(
        (d) => !prev.some((p) => p.id === d.id)
      )
      return [...prev, ...newIngredients]
    })
    
    toast.success(`${detected.length}개의 재료를 인식했습니다!`)
    setIsAnalyzing(false)
  }, [uploadedImage])

  const handleSearchQueryChange = useCallback((value: string) => {
    if (value.length > MAX_INGREDIENT_QUERY_LENGTH) {
      toast.warning(`재료명은 ${MAX_INGREDIENT_QUERY_LENGTH}자까지만 입력할 수 있어요.`)
    }
    setSearchQuery(value.slice(0, MAX_INGREDIENT_QUERY_LENGTH))
  }, [])

  const addIngredient = useCallback((ingredient: Ingredient) => {
    setSelectedIngredients((prev) => [...prev, ingredient])
  }, [])

  const removeIngredient = useCallback((id: string) => {
    setSelectedIngredients((prev) => prev.filter((ing) => ing.id !== id))
  }, [])

  const handleGetRecommendations = () => {
    if (selectedIngredients.length === 0) {
      toast.error('최소 1개 이상의 재료를 선택해주세요.')
      return
    }
    
    const ingredientIds = selectedIngredients.map((ing) => ing.id).join(',')
    router.push(`/recommendations?ingredients=${ingredientIds}`)
  }

  return (
    <div className="flex min-h-screen flex-col pb-32">
      <Header title="재료 등록" showBack />
      
      <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="photo" className="gap-2">
              <Camera className="h-4 w-4" />
              사진으로 등록
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2">
              <Plus className="h-4 w-4" />
              직접 입력
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photo" className="mt-4 space-y-4">
            <Card>
              <CardContent className="p-4">
                {uploadedImage ? (
                  <div className="relative">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                      <Image
                        src={uploadedImage}
                        alt="업로드된 이미지"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() => setUploadedImage(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="mt-4 flex gap-2">
                      <Button
                        className="flex-1 gap-2"
                        onClick={analyzeImage}
                        disabled={isAnalyzing}
                      >
                        <Sparkles className="h-4 w-4" />
                        {isAnalyzing ? 'AI 분석 중...' : 'AI로 재료 인식'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary hover:bg-muted"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">
                        클릭하여 사진 업로드
                      </p>
                      <p className="text-xs text-muted-foreground">
                        또는 드래그 앤 드롭
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={handleCameraCapture}
                    >
                      <Camera className="h-4 w-4" />
                      카메라로 촬영
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="재료 검색..."
                className="pl-10 pr-14"
                maxLength={MAX_INGREDIENT_QUERY_LENGTH}
                value={searchQuery}
                onChange={(e) => handleSearchQueryChange(e.target.value)}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                {searchQuery.length}/{MAX_INGREDIENT_QUERY_LENGTH}
              </span>
            </div>

            <div className="space-y-4">
              {Object.entries(groupedIngredients).map(([category, ingredients]) => (
                <div key={category}>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map((ingredient) => (
                      <button
                        key={ingredient.id}
                        onClick={() => addIngredient(ingredient)}
                        className="rounded-full border border-border bg-card px-3 py-1.5 text-sm transition-colors hover:border-primary hover:bg-primary/10"
                      >
                        + {ingredient.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Selected Ingredients */}
        {selectedIngredients.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-medium">
              선택된 재료 ({selectedIngredients.length}개)
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedIngredients.map((ingredient) => (
                <IngredientBadge
                  key={ingredient.id}
                  ingredient={ingredient}
                  onRemove={() => removeIngredient(ingredient.id)}
                />
              ))}
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Fixed Bottom CTA */}
      <div className="sticky bottom-16 border-t border-border bg-card/95 p-4 backdrop-blur-sm lg:bottom-0">
        <div className="mx-auto max-w-7xl">
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handleGetRecommendations}
            disabled={selectedIngredients.length === 0}
          >
            <Sparkles className="h-5 w-5" />
            AI 요리 추천 받기 ({selectedIngredients.length}개 재료)
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

export default function IngredientsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col">
          <Header title="재료 등록" showBack />
          <main className="flex-1 p-4">
            <Card>
              <CardContent className="h-48 animate-pulse bg-muted" />
            </Card>
          </main>
          <BottomNav />
        </div>
      }
    >
      <IngredientsContent />
    </Suspense>
  )
}
