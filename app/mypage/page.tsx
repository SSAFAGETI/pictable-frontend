'use client'

import Link from 'next/link'
import { Bell, Bookmark, ChefHat, ChevronRight, FileText, Heart, HelpCircle, LogOut, Settings, Shield, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { AuthRequiredState } from '@/components/auth-required-state'
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
  const { userRecipes, getSubscribedAuthors, getFollowers } = useRecipes()
  const savedRecipes = mockRecipes.slice(0, 3)
  const likedRecipes = mockRecipes.slice(2, 5)
  const myRecipes = userRecipes.map(userRecipeToRecipe)
  const subscribedAuthors = user ? getSubscribedAuthors(user.id) : []
  const followers = user ? getFollowers({ ...user, createdAt: new Date(user.createdAt) }) : []

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
      <div className="flex min-h-screen flex-col pb-24 lg:pb-0">
        <Header title="마이페이지" />
        <AuthRequiredState icon="chef" description={"로그인하고 저장한 레시피와\n 나만의 레시피를 관리해보세요."} />
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

                <div className="mt-4 overflow-hidden rounded-md bg-muted lg:grid lg:grid-cols-5 lg:divide-x lg:divide-border">
                  <div className="grid grid-cols-3 divide-x divide-border p-3 lg:contents lg:divide-x-0 lg:p-0">
                    <div className="text-center lg:p-3">
                      <p className="text-xl font-bold text-primary">{savedRecipes.length}</p>
                      <p className="text-xs text-muted-foreground">저장</p>
                    </div>
                    <div className="text-center lg:p-3">
                      <p className="text-xl font-bold text-primary">{likedRecipes.length}</p>
                      <p className="text-xs text-muted-foreground">좋아요</p>
                    </div>
                    <div className="text-center lg:p-3">
                      <p className="text-xl font-bold text-primary">{myRecipes.length}</p>
                      <p className="text-xs text-muted-foreground">내 레시피</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-border border-t border-border p-3 lg:contents lg:divide-x-0 lg:border-t-0 lg:p-0">
                    <div className="text-center lg:p-3">
                      <p className="text-xl font-bold text-primary">{subscribedAuthors.length}</p>
                      <p className="text-xs text-muted-foreground">구독</p>
                    </div>
                    <div className="text-center lg:p-3">
                      <p className="text-xl font-bold text-primary">{followers.length}</p>
                      <p className="text-xs text-muted-foreground">구독자</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          <div className="min-w-0">
            <Tabs defaultValue="saved">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="saved" className="gap-1 px-1 text-xs sm:text-sm">
                  <Bookmark className="h-4 w-4" />
                  저장
                </TabsTrigger>
                <TabsTrigger value="liked" className="gap-1 px-1 text-xs sm:text-sm">
                  <Heart className="h-4 w-4" />
                  좋아요
                </TabsTrigger>
                <TabsTrigger value="my" className="gap-1 px-1 text-xs sm:text-sm">
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

            <section className="mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">구독 관리</h2>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                <ProfileSection
                  title="구독한 사람"
                  count={subscribedAuthors.length}
                  users={subscribedAuthors}
                  emptyTitle="구독한 사람이 없습니다"
                  emptyDescription="마음에 드는 레시피 작성자를 구독하면 여기에 표시됩니다."
                />
                <ProfileSection
                  title="나를 구독한 사람"
                  count={followers.length}
                  users={followers}
                  emptyTitle="아직 구독자가 없습니다"
                  emptyDescription="나만의 레시피를 올리고 구독자를 만나보세요."
                />
              </div>
            </section>
          </div>
        </div>

        <section className="mx-auto mt-6 max-w-7xl space-y-3">
          <h2 className="text-lg font-bold">계정 메뉴</h2>
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
        </section>
      </main>

      <BottomNav />
    </div>
  )
}

function ProfileSection({
  title,
  count,
  users,
  emptyTitle,
  emptyDescription,
}: {
  title: string
  count: number
  users: Array<{ id: string; name: string; email: string; avatar?: string }>
  emptyTitle: string
  emptyDescription: string
}) {
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">{title}</h3>
            <span className="text-sm font-medium text-primary">{count}명</span>
          </div>
          <div className="rounded-md bg-muted p-5 text-center">
            <p className="font-semibold">{emptyTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <span className="text-sm font-medium text-primary">{count}명</span>
        </div>
        <div className="space-y-3">
          {users.map((profile) => (
            <div key={profile.id} className="flex items-center gap-3 rounded-md border border-border p-3">
              <Avatar>
                <AvatarImage src={profile.avatar} />
                <AvatarFallback>{profile.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{profile.name}</p>
                <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
