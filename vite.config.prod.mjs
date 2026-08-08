import { copyFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.GH_PAGES_BASE || '/',
  logLevel: 'silent',
  plugins: [
    vue(),
    {
      name: 'gh-pages-spa-fallback',
      closeBundle() {
        const distDir = fileURLToPath(new URL('./dist', import.meta.url))
        copyFileSync(`${distDir}/index.html`, `${distDir}/404.html`)
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
