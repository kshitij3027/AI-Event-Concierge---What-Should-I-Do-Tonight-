import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    fs: {
      // Allow serving files from the project root
      allow: ['.'],
    },
  },
  // Use a cache directory without special characters
  cacheDir: '/tmp/vite-cache-event-concierge',
})

