'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export interface AppNotification {
  id: string
  title: string
  message: string
  createdAt: Date
  read: boolean
  href?: string
}

interface NotificationContextType {
  notifications: AppNotification[]
  unreadCount: number
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void
  markAllRead: () => void
  clearNotifications: () => void
}

const STORAGE_KEY = 'chalkak_notifications'
const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

function reviveNotification(notification: AppNotification): AppNotification {
  return {
    ...notification,
    createdAt: new Date(notification.createdAt),
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return

    try {
      setNotifications(JSON.parse(stored).map(reviveNotification))
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  }, [notifications])

  const addNotification: NotificationContextType['addNotification'] = (notification) => {
    const nextNotification: AppNotification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date(),
      read: false,
    }
    setNotifications((prev) => [nextNotification, ...prev].slice(0, 30))
  }

  const markAllRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const value = useMemo(
    () => ({
      notifications,
      unreadCount: notifications.filter((notification) => !notification.read).length,
      addNotification,
      markAllRead,
      clearNotifications,
    }),
    [notifications]
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
