'use client'

import Link from 'next/link'
import { Bookmark, ChefHat, LockKeyhole, Utensils, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type AuthRequiredStateProps = {
  title?: string
  description: string
  icon?: 'chef' | 'bookmark' | 'lock' | 'utensils'
  className?: string
}

const icons: Record<NonNullable<AuthRequiredStateProps['icon']>, LucideIcon> = {
  chef: ChefHat,
  bookmark: Bookmark,
  lock: LockKeyhole,
  utensils: Utensils,
}

export function AuthRequiredState({
  title = '로그인이 필요합니다',
  description,
  icon = 'lock',
  className,
}: AuthRequiredStateProps) {
  const Icon = icons[icon]

  return (
    <main className={cn('flex flex-1 items-center justify-center px-4 py-12 pb-28 sm:px-6 lg:px-8 lg:py-16 lg:pb-16', className)}>
      <section className="flex h-[380px] w-full max-w-[420px] flex-col rounded-lg border border-border bg-card px-5 py-9 text-center shadow-sm sm:h-[408px] sm:px-8 sm:py-11">
        <div className="mx-auto flex h-16 w-16 shrink-0 aspect-square items-center justify-center rounded-full bg-primary/10 text-primary sm:h-[72px] sm:w-[72px]">
          <Icon className="h-8 w-8 sm:h-9 sm:w-9" />
        </div>
        <h2 className="mt-5 text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
        <p className="mx-auto mt-2 max-w-[300px] whitespace-pre-line text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
        <div className="mt-auto grid gap-3 pt-7">
          <Button asChild size="lg" className="h-11 w-full rounded-lg text-base font-bold">
            <Link href="/login">로그인하러 가기</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11 w-full rounded-lg bg-background text-base font-bold">
            <Link href="/signup">회원가입</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
