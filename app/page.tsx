import { Header } from '@/components/header'
import { BottomNav } from '@/components/bottom-nav'
import { HeroSection } from '@/components/home/hero-section'
import { TodayRecipe } from '@/components/home/today-recipe'
import { PopularRecipes } from '@/components/home/popular-recipes'
import { QuickTags } from '@/components/home/quick-tags'
import { RecentRecipes } from '@/components/home/recent-recipes'
import { mockRecipes, popularTags } from '@/lib/mock-data'

export default function HomePage() {
  const todayRecipes = mockRecipes.slice(0, 4)
  const popularRecipes = mockRecipes.slice(0, 4)
  const recentRecipes = mockRecipes.slice(2, 5)

  return (
    <div className="page-scrollbar flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-24 lg:pb-0">
        <HeroSection />
        <QuickTags tags={popularTags} />
        <TodayRecipe recipes={todayRecipes} />
        <PopularRecipes recipes={popularRecipes} />
        <RecentRecipes recipes={recentRecipes} />
      </main>
      <BottomNav />
    </div>
  )
}
