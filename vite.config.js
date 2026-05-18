import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    // Automatically uses '/' for localhost, and '/wedding-app/' for GitHub Pages!
    base: command === 'serve' ? '/' : '/wedding-app/',
  }
})