import { ref } from 'vue'

export type ToastType = 'info' | 'success' | 'error'

export interface ToastMessage {
  id: string
  type: ToastType
  title: string
  message?: string
}

const toasts = ref<ToastMessage[]>([])

export const showToast = (toast: Omit<ToastMessage, 'id'>, duration = 4200) => {
  const nextToast: ToastMessage = {
    ...toast,
    id: `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  }

  toasts.value = [nextToast, ...toasts.value].slice(0, 4)

  window.setTimeout(() => {
    dismissToast(nextToast.id)
  }, duration)
}

export const dismissToast = (id: string) => {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

export const useToast = () => ({
  toasts,
  showToast,
  dismissToast,
})
