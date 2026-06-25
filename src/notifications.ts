import { computed, ref } from 'vue'
import { fetchNotificationsApi, markAllNotificationsReadApi, markNotificationReadApi, type NotificationItem } from './api'

const apiNotifications = ref<NotificationItem[]>([])
const isEnabled = ref(false)
const NOTIFICATION_POLL_INTERVAL_MS = 30_000

let pollingTimer: number | null = null
let pendingLoad: Promise<void> | null = null

const visibleNotifications = computed(() => (isEnabled.value ? apiNotifications.value : []))
const unreadCount = computed(() => visibleNotifications.value.filter((notification) => !notification.isRead).length)

const stopPolling = () => {
  if (typeof window !== 'undefined' && pollingTimer !== null) window.clearInterval(pollingTimer)
  pollingTimer = null
}

const startPolling = () => {
  if (typeof window === 'undefined' || pollingTimer !== null) return
  pollingTimer = window.setInterval(() => {
    if (isEnabled.value) void refreshNotifications()
  }, NOTIFICATION_POLL_INTERVAL_MS)
}

const refreshNotifications = async () => {
  if (!isEnabled.value) return
  if (pendingLoad) return pendingLoad

  pendingLoad = fetchNotificationsApi()
    .then((items) => {
      apiNotifications.value = items
    })
    .catch(() => {
      apiNotifications.value = []
    })
    .finally(() => {
      pendingLoad = null
    })

  return pendingLoad
}

const loadNotifications = async (enabled: boolean) => {
  isEnabled.value = enabled

  if (!enabled) {
    stopPolling()
    apiNotifications.value = []
    return
  }

  await refreshNotifications()
  startPolling()
}

const markAsRead = async (id: string) => {
  if (!isEnabled.value) return

  const index = apiNotifications.value.findIndex((notification) => notification.id === id)
  if (index >= 0) apiNotifications.value[index] = { ...apiNotifications.value[index], isRead: true }

  try {
    await markNotificationReadApi(id)
  } catch {
    // The optimistic read state keeps the menu calm even if the server is briefly unavailable.
  }
}

const markAllAsRead = async () => {
  if (!isEnabled.value) return

  apiNotifications.value = apiNotifications.value.map((notification) => ({ ...notification, isRead: true }))

  try {
    await markAllNotificationsReadApi()
  } catch {
    // The optimistic read state keeps the menu calm even if the server is briefly unavailable.
  }
}

export const useNotifications = () => ({
  notifications: visibleNotifications,
  unreadCount,
  loadNotifications,
  refreshNotifications,
  markAsRead,
  markAllAsRead,
})
