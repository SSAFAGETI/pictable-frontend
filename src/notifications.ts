import { computed, ref } from 'vue'
import { fetchNotificationsApi, markAllNotificationsReadApi, markNotificationReadApi, type NotificationItem } from './api'

const apiNotifications = ref<NotificationItem[]>([])
const isEnabled = ref(false)

const visibleNotifications = computed(() => (isEnabled.value ? apiNotifications.value : []))
const unreadCount = computed(() => visibleNotifications.value.filter((notification) => !notification.isRead).length)

const loadNotifications = async (enabled: boolean) => {
  isEnabled.value = enabled

  if (!enabled) {
    apiNotifications.value = []
    return
  }

  try {
    apiNotifications.value = await fetchNotificationsApi()
  } catch {
    apiNotifications.value = []
  }
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
  markAsRead,
  markAllAsRead,
})
