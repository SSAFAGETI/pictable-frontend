import { createApp } from 'vue'
import App from './App.vue'
import { router } from './app/router'
import { fallbackImage } from './api'
import './styles.css'
if (typeof window !== 'undefined') {
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target
      if (!(target instanceof HTMLImageElement) || target.dataset.fallbackApplied === 'true') return

      const src = target.getAttribute('src') || ''
      const isBackendMedia = src.startsWith('/api/media/') || src.startsWith('/media/') || src.includes('15.164.170.144:8000/media/')
      if (!isBackendMedia) return

      target.dataset.fallbackApplied = 'true'
      target.src = fallbackImage
    },
    true,
  )
}

createApp(App).use(router).mount('#app')
