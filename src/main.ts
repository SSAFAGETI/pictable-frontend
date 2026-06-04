import { createApp } from 'vue'
import App from './App.vue'
import { router } from './app/router'
import { fallbackImage } from './api'
import { reportServerError } from './serverStatus'
import './styles.css'

const reportedMediaImageErrors = new Set<string>()

const isPublicRecipeImageSrc = (src: string) =>
  src.includes('foodsafetykorea.go.kr') || src.includes('/uploadimg/') || src.includes('/common/ecmFileView.do')

const enhancePublicRecipeImage = (image: HTMLImageElement) => {
  const src = image.currentSrc || image.getAttribute('src') || ''
  if (!isPublicRecipeImageSrc(src)) return

  image.classList.add('food-image-auto')
  if (image.naturalWidth > 0 && image.naturalWidth <= 420) {
    image.dataset.lowRes = 'true'
  }
}

const isBackendMediaSrc = (src: string) => {
  if (!src) return false

  try {
    const parsed = new URL(src, window.location.origin)
    return (
      parsed.pathname.startsWith('/media/') ||
      parsed.pathname.startsWith('/api/media/') ||
      parsed.origin === 'http://3.38.26.186'
    )
  } catch {
    return src.startsWith('/api/media/') || src.startsWith('/media/') || src.includes('3.38.26.186/media/')
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
  const interactiveSelector = 'button, a[href], [role="button"], input[type="button"], input[type="submit"], input[type="reset"]'

  const getInteractiveElement = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return null
    const element = target.closest<HTMLElement>(interactiveSelector)
    if (!element) return null
    if (element.matches('[disabled], [aria-disabled="true"]')) return null
    if (element instanceof HTMLButtonElement || element instanceof HTMLInputElement) {
      if (element.disabled) return null
    }
    return element
  }

  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) navigator.vibrate(12)
  }

  const pressInteractiveElement = (element: HTMLElement) => {
    element.classList.add('is-pressing')
    window.setTimeout(() => element.classList.remove('is-pressing'), 180)
  }

  window.addEventListener(
    'pointerdown',
    (event) => {
      if (event.button !== 0) return
      const element = getInteractiveElement(event.target)
      if (!element) return

      triggerHapticFeedback()
      pressInteractiveElement(element)
    },
    { passive: true },
  )

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    if (event.repeat) return
    const element = getInteractiveElement(event.target)
    if (!element) return

    triggerHapticFeedback()
    pressInteractiveElement(element)
  })

  window.addEventListener(
    'load',
    (event) => {
      if (event.target instanceof HTMLImageElement) enhancePublicRecipeImage(event.target)
    },
    true,
  )

  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll<HTMLImageElement>('img').forEach(enhancePublicRecipeImage)

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLImageElement) enhancePublicRecipeImage(node)
          if (node instanceof Element) node.querySelectorAll<HTMLImageElement>('img').forEach(enhancePublicRecipeImage)
        })
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
  })

  window.addEventListener(
    'error',
    (event) => {
      const target = event.target
      if (!(target instanceof HTMLImageElement) || target.dataset.fallbackApplied === 'true') return

      const src = target.currentSrc || target.getAttribute('src') || ''
      if (!isBackendMediaSrc(src) && !isPublicRecipeImageSrc(src)) return

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
