import { computed, ref } from 'vue'
import { fetchNotificationsApi, markAllNotificationsReadApi, markNotificationReadApi, type NotificationItem } from './api'
import { notifications as fallbackNotifications } from './data'

const apiNotifications = ref<NotificationItem[]>([])
const loaded = ref(false)

const fallbackItems = computed<NotificationItem[]>(() =>
  fallbackNotifications.map((notification, index) => ({
    id: notification.id || `fallback-notification-${index}`,
    title: notification.title,
    message: notification.message,
    isRead: false,
    createdAt: new Date().toISOString(),
  })),
)

const visibleNotifications = computed(() => (loaded.value ? apiNotifications.value : fallbackItems.value))
const unreadCount = computed(() => visibleNotifications.value.filter((notification) => !notification.isRead).length)

const loadNotifications = async (enabled: boolean) => {
  if (!enabled) {
    apiNotifications.value = []
    loaded.value = false
    return
  }

  try {
    apiNotifications.value = await fetchNotificationsApi()
    loaded.value = true
  } catch {
    loaded.value = false
  }
}

const markAsRead = async (id: string) => {
  const index = apiNotifications.value.findIndex((notification) => notification.id === id)
  if (index >= 0) apiNotifications.value[index] = { ...apiNotifications.value[index], isRead: true }

  try {
    await markNotificationReadApi(id)
  } catch {
    // The optimistic read state keeps the menu calm even if the server is briefly unavailable.
  }
}

const markAllAsRead = async () => {
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
  markAsRead,
  markAllAsRead,
})
