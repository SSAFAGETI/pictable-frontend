'use client'

import Link from 'next/link'
import { Bell, Bookmark, ChefHat, ChevronRight, FileText, Heart, HelpCircle, LogOut, Settings, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BottomNav } from '@/components/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/header'
import { RecipeCard } from '@/components/recipe-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/auth-context'
import { useRecipes } from '@/contexts/recipe-context'
import { userRecipeToRecipe } from '@/lib/recipe-adapters'
import { mockRecipes } from '@/lib/mock-data'

const menuItems = [
  { icon: Bell, label: '알림 설정', href: '/settings/notifications' },
  { icon: HelpCircle, label: '고객센터', href: '/help' },
  { icon: FileText, label: '이용약관', href: '/terms' },
  { icon: Shield, label: '개인정보 처리방침', href: '/privacy' },
]

export default function MyPage() {
  const { user, logout, isLoading } = useAuth()
  const { userRecipes } = useRecipes()
  const savedRecipes = mockRecipes.slice(0, 3)
  const likedRecipes = mockRecipes.slice(2, 5)
  const myRecipes = userRecipes.map(userRecipeToRecipe)

  const handleLogout = () => {
    logout()
    toast.success('로그아웃 되었습니다.')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header title="마이페이지" />
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
        <BottomNav />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header title="마이페이지" />
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <ChefHat className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-bold">로그인이 필요합니다</h2>
          <p className="mb-6 text-center text-muted-foreground">로그인하고 저장한 레시피와 나만의 레시피를 관리해보세요.</p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/login">로그인</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signup">회원가입</Link>
            </Button>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col pb-20 lg:pb-0">
      <Header title="마이페이지" showNotification={false} />

      <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
          <div className="space-y-6 lg:sticky lg:top-24">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xl">{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-bold">{user.name}</h2>
                    <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/settings/profile" aria-label="프로필 설정">
                      <Settings className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-4 grid grid-cols-3 divide-x divide-border rounded-md bg-muted p-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-primary">{savedRecipes.length}</p>
                    <p className="text-xs text-muted-foreground">저장</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-primary">{likedRecipes.length}</p>
                    <p className="text-xs text-muted-foreground">좋아요</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-primary">{myRecipes.length}</p>
                    <p className="text-xs text-muted-foreground">내 레시피</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                {menuItems.map((item, index) => (
                  <Link key={item.label} href={item.href}>
                    <div className={`flex items-center justify-between p-4 transition-colors hover:bg-muted ${index !== menuItems.length - 1 ? 'border-b border-border' : ''}`}>
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Button variant="ghost" className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              로그아웃
            </Button>
          </div>

          <Tabs defaultValue="saved">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="saved" className="gap-1">
                <Bookmark className="h-4 w-4" />
                저장
              </TabsTrigger>
              <TabsTrigger value="liked" className="gap-1">
                <Heart className="h-4 w-4" />
                좋아요
              </TabsTrigger>
              <TabsTrigger value="my" className="gap-1">
                <ChefHat className="h-4 w-4" />
                내 레시피
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved" className="mt-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {savedRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} variant="horizontal" />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="liked" className="mt-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {likedRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} variant="horizontal" />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="my" className="mt-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {myRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} variant="horizontal" />
                ))}
              </div>
              <Button variant="outline" className="mt-4 w-full" asChild>
                <Link href="/my-recipe/new">새 레시피 등록하기</Link>
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
