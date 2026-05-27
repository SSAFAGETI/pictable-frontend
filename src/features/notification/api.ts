import { apiRequest } from '../../shared/api/client'
import { mapNotification, unwrapList } from '../recipe/mapper'

export const fetchNotificationsApi = async () => unwrapList(await apiRequest<unknown>('/notifications/', { auth: true })).map(mapNotification)

export const markNotificationReadApi = (id: string) =>
  apiRequest<Record<string, unknown>>(`/notifications/${id}/read/`, {
    method: 'PATCH',
    auth: true,
  })

export const markAllNotificationsReadApi = () =>
  apiRequest<{ message?: string }>('/notifications/read-all/', {
    method: 'PATCH',
    auth: true,
  })

