import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build', // важно для GitHub Actions: билд будет идти в /build
    emptyOutDir: true // очищает старые файлы перед сборкой
  }
})
