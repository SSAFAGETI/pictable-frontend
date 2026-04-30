'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, ChefHat, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useNotifications } from '@/contexts/notification-context'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
  showBack?: boolean
  showNotification?: boolean
}

function formatNotificationTime(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}

export function Header({ title, showBack = false, showNotification = true }: HeaderProps) {
  const pathname = usePathname()
  const { notifications, unreadCount, markAllRead, clearNotifications } = useNotifications()

  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return null
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm lg:bg-background/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-16 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          {showBack && (
            <Button variant="ghost" size="icon" onClick={() => window.history.back()} aria-label="뒤로가기">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          {title ? (
            <h1 className="truncate text-lg font-semibold lg:text-xl">{title}</h1>
          ) : (
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <ChefHat className="h-4 w-4" />
              </div>
              <span className="text-xl font-bold text-foreground">찰칵밥상</span>
            </Link>
          )}
        </div>
        {showNotification && (
          <Popover onOpenChange={(open) => open && markAllRead()}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'relative h-10 w-10 rounded-full',
                  unreadCount > 0 && 'bg-primary/10 text-primary hover:bg-primary/15'
                )}
                aria-label="알림"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute -right-2 -top-2 h-5 min-w-5 animate-ping rounded-full bg-red-500 opacity-70" />
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-md shadow-red-500/30">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={10} className="w-[calc(100vw-2rem)] max-w-[420px] p-0 sm:w-[420px]">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <p className="text-base font-semibold">알림</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}개` : `${notifications.length}개 알림`}
                  </p>
                </div>
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearNotifications}>
                    비우기
                  </Button>
                )}
              </div>
              <div className="max-h-[70vh] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-muted-foreground">아직 알림이 없습니다.</div>
                ) : (
                  notifications.map((notification) => {
                    const content = (
                      <div className="border-b border-border px-5 py-4 last:border-b-0 hover:bg-muted/60">
                        <div className="flex items-start gap-3">
                          {!notification.read && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500 shadow-sm shadow-red-500/40" />}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold leading-5 sm:text-base">{notification.title}</p>
                            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{notification.message}</p>
                            <p className="mt-2 text-xs text-muted-foreground">{formatNotificationTime(notification.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    )

                    return notification.href ? (
                      <Link key={notification.id} href={notification.href}>
                        {content}
                      </Link>
                    ) : (
                      <div key={notification.id}>{content}</div>
                    )
                  })
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </header>
  )
}
