import { computed, ref } from 'vue'

export interface ServerErrorState {
  id: string
  title: string
  message: string
  detail?: string
  endpoint?: string
  method?: string
  status?: number
  happenedAt: string
}

type ServerErrorInput = Omit<ServerErrorState, 'id' | 'happenedAt'> & {
  id?: string
}

const STORAGE_KEY = 'chalkkak_server_errors'
const LEGACY_STORAGE_KEY = 'chalkkak_server_error'
const SHOW_SERVER_ERROR_DEBUG_UI = import.meta.env.DEV || import.meta.env.VITE_SHOW_SERVER_ERROR_DEBUG_UI === 'true'

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage)

const clearStoredErrors = () => {
  if (!canUseStorage()) return
  window.localStorage.removeItem(STORAGE_KEY)
  window.localStorage.removeItem(LEGACY_STORAGE_KEY)
}

const readStoredErrors = (): ServerErrorState[] => {
  if (!canUseStorage()) return []
  if (!SHOW_SERVER_ERROR_DEBUG_UI) {
    clearStoredErrors()
    return []
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored) as ServerErrorState[]

    const legacyStored = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!legacyStored) return []

    const legacyError = JSON.parse(legacyStored) as Omit<ServerErrorState, 'id'>
    window.localStorage.removeItem(LEGACY_STORAGE_KEY)

    return [
      {
        ...legacyError,
        id: `${legacyError.method || 'GET'} ${legacyError.endpoint || legacyError.title}`,
      },
    ]
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    window.localStorage.removeItem(LEGACY_STORAGE_KEY)
    return []
  }
}

const persistErrors = (errors: ServerErrorState[]) => {
  if (!canUseStorage()) return
  if (!SHOW_SERVER_ERROR_DEBUG_UI) {
    clearStoredErrors()
    return
  }

  if (errors.length === 0) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(errors))
}

const serverErrors = ref<ServerErrorState[]>(readStoredErrors())
const serverError = computed(() => serverErrors.value[0] ?? null)

export const getServerErrorId = (error: Pick<ServerErrorInput, 'id' | 'endpoint' | 'method' | 'title'>) =>
  error.id || `${error.method || 'GET'} ${error.endpoint || error.title}`

export const reportServerError = (error: ServerErrorInput) => {
  if (!SHOW_SERVER_ERROR_DEBUG_UI) {
    clearStoredErrors()
    return
  }

  const id = getServerErrorId(error)
  const nextError: ServerErrorState = {
    ...error,
    id,
    happenedAt: new Date().toISOString(),
  }

  serverErrors.value = [nextError, ...serverErrors.value.filter((item) => item.id !== id)].slice(0, 12)
  persistErrors(serverErrors.value)
}

export const clearServerError = (idOrEndpoint?: string) => {
  if (!idOrEndpoint) {
    serverErrors.value = []
    persistErrors(serverErrors.value)
    return
  }

  serverErrors.value = serverErrors.value.filter((item) => item.id !== idOrEndpoint && item.endpoint !== idOrEndpoint)
  persistErrors(serverErrors.value)
}

export const useServerStatus = () => ({
  serverError,
  serverErrors,
  hasServerError: computed(() => serverErrors.value.length > 0),
  reportServerError,
  clearServerError,
})
