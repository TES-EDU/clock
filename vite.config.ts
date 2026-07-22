import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['온글잎 박다현체.ttf'],
      manifest: {
        name: 'TES 시계 보기',
        short_name: '시계 보기',
        description: '초등학생을 위한 아날로그 시계 읽기 연습',
        theme_color: '#FFFEEA',
        background_color: '#FFFEEA',
        display: 'standalone',
        orientation: 'landscape',
        start_url: './',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})
