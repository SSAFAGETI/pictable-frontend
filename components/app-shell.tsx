'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChefHat } from 'lucide-react'
import { navItems } from '@/components/bottom-nav'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="w-full">{children}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 lg:flex">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border bg-card/95 px-5 py-6 backdrop-blur lg:flex lg:flex-col">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">찰칵밥상</p>
            <p className="text-xs text-muted-foreground">재료 기반 레시피 앱</p>
          </div>
        </Link>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto rounded-md border border-border bg-background p-4">
          <p className="text-sm font-semibold">오늘 뭐 먹지?</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">냉장고 재료를 입력하면 지금 만들 수 있는 레시피를 추천해드려요.</p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mx-auto min-h-screen w-full max-w-7xl bg-background lg:bg-transparent">
          {children}
        </div>
      </div>
    </div>
  )
}
