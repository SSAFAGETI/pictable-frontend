'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bookmark, Home, PlusSquare, Search, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export const navItems = [
  { href: '/', icon: Home, label: '홈' },
  { href: '/feed', icon: Search, label: '피드' },
  { href: '/my-recipe/new', icon: PlusSquare, label: '등록' },
  { href: '/saved', icon: Bookmark, label: '저장' },
  { href: '/mypage', icon: User, label: '마이' },
]

export function BottomNav() {
  const pathname = usePathname()

  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return null
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm lg:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-12 flex-col items-center justify-center gap-1 px-2 py-2 text-xs transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'fill-primary/20')} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
