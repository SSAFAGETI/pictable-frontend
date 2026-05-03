'use client'

import Link from 'next/link'
import { Bookmark } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { Header } from '@/components/header'
import { RecipeCard } from '@/components/recipe-card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { mockRecipes } from '@/lib/mock-data'

export default function SavedPage() {
  const { user, isLoading } = useAuth()
  const savedRecipes = mockRecipes.slice(0, 4)

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header title="저장한 레시피" />
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
        <BottomNav />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col pb-24 lg:pb-0">
        <Header title="저장한 레시피" />
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Bookmark className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-bold">로그인이 필요합니다</h2>
          <p className="mb-6 max-w-sm text-center text-muted-foreground">로그인하고 마음에 드는 레시피를 저장해보세요.</p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/login">로그인</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/signup">회원가입</Link>
            </Button>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col pb-24 lg:pb-0">
      <Header title="저장한 레시피" />

      <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        {savedRecipes.length > 0 ? (
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {savedRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={{ ...recipe, isSaved: true }} />
            ))}
          </div>
        ) : (
          <div className="mx-auto flex max-w-md flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Bookmark className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-lg font-bold">저장한 레시피가 없습니다</h2>
            <p className="mb-6 text-center text-muted-foreground">마음에 드는 레시피를 저장하고 언제든 다시 확인해보세요.</p>
            <Button asChild>
              <Link href="/feed">레시피 둘러보기</Link>
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
