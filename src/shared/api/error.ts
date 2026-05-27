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

export const getErrorMessage = (body: unknown, fallback: string) => {
  if (typeof body === 'string') return body
  if (!isRecord(body)) return fallback

  const detail = body.detail || body.message || body.error || body.non_field_errors
  if (Array.isArray(detail)) return detail.join('\n')
  if (typeof detail === 'string') return detail

  const firstEntry = Object.entries(body)[0]
  if (firstEntry) {
    const [field, value] = firstEntry
    if (Array.isArray(value)) return `${field}: ${value.join('\n')}`
    if (typeof value === 'string') return `${field}: ${value}`
  }

  return fallback
}