import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 3000,
    proxy: {
      '/server/workpulse-api/api': {
        target: 'https://work-60077520352.development.catalystserverless.in',
        changeOrigin: true,
      }
    }
  }
})
