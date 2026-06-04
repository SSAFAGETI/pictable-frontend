import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://3.38.26.186:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://3.38.26.186:8000',
        changeOrigin: true,
      },
    },
  },
})
