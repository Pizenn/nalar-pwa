import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
  name: 'NALAR Project Station', // Nama panjang saat instalasi
  short_name: 'NALAR',           // Nama pendek di layar HP
  description: 'Pusat Kendali Asisten Laboratorium',
  theme_color: '#ffffff',
  icons: [
    {
      src: 'pwa-192x192.png', // <-- Pastikan kamu menaruh gambar ukuran 192x192 di folder public/
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: 'pwa-512x512.png', // <-- Pastikan kamu menaruh gambar ukuran 512x512 di folder public/
      sizes: '512x512',
      type: 'image/png'
    }
  ]
}
    })
  ]
})