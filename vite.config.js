import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Polyfill for simple-peer which uses node built-ins
      'readable-stream': 'vite-compatible-readable-stream',
    },
  },
  define: {
    // Polyfill global for simple-peer
    global: 'window',
    'process.env': {},
  },
})
