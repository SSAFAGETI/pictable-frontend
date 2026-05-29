import { createApp } from 'vue'
import App from './App.vue'
import { router } from './app/router'
import { fallbackImage } from './api'
import { reportServerError } from './serverStatus'
import './styles.css'

const reportedMediaImageErrors = new Set<string>()

const isBackendMediaSrc = (src: string) => {
  if (!src) return false

  try {
    const parsed = new URL(src, window.location.origin)
    return (
      parsed.pathname.startsWith('/media/') ||
      parsed.pathname.startsWith('/api/media/') ||
      parsed.origin === 'http://15.164.170.144:8000'
    )
  } catch {
    return src.startsWith('/api/media/') || src.startsWith('/media/') || src.includes('15.164.170.144:8000/media/')
  }
}

const getImageEndpoint = (src: string) => {
  try {
    const parsed = new URL(src, window.location.origin)
    return `${parsed.pathname}${parsed.search}`
  } catch {
    return src
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target
      if (!(target instanceof HTMLImageElement) || target.dataset.fallbackApplied === 'true') return

      const src = target.currentSrc || target.getAttribute('src') || ''
      if (!isBackendMediaSrc(src)) return

      const endpoint = getImageEndpoint(src)
      if (!reportedMediaImageErrors.has(endpoint)) {
        reportedMediaImageErrors.add(endpoint)
        reportServerError({
          id: `MEDIA GET ${endpoint}`,
          title: '이미지 파일을 불러오지 못했어요',
          message: '서버가 내려준 이미지 URL을 요청했지만 파일을 찾지 못해 기본 이미지로 대체했습니다.',
          detail: '프론트는 /api/media/{id}/ 응답의 url을 그대로 사용합니다. 같은 URL이 404라면 백엔드 media 파일 저장 또는 정적 파일 서빙 상태를 확인해야 합니다.',
          endpoint,
          method: 'GET',
          status: 404,
        })
      }

      target.dataset.fallbackApplied = 'true'
      target.src = fallbackImage
    },
    true,
  )
}

createApp(App).use(router).mount('#app')