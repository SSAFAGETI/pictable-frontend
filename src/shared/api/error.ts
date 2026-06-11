export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, message: string, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)

const formatErrorValue = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(formatErrorValue).filter(Boolean).join('\n')
  if (isRecord(value)) {
    return Object.entries(value)
      .map(([field, item]) => {
        const message = formatErrorValue(item)
        return message ? `${field}: ${message}` : ''
      })
      .filter(Boolean)
      .join('\n')
  }
  return ''
}

export const getErrorMessage = (body: unknown, fallback: string) => {
  if (typeof body === 'string') return body
  if (!isRecord(body)) return fallback

  const detail = body.detail || body.message || body.error || body.non_field_errors
  if (Array.isArray(detail)) return formatErrorValue(detail) || fallback
  if (typeof detail === 'string') return detail

  const firstEntry = Object.entries(body)[0]
  if (firstEntry) {
    const [field, value] = firstEntry
    if (Array.isArray(value) || isRecord(value)) return `${field}: ${formatErrorValue(value) || fallback}`
    if (typeof value === 'string') return `${field}: ${value}`
  }

  return fallback
}
