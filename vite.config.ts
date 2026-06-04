import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages: https://<user>.github.io/magazyn_biala/
const base = process.env.GITHUB_PAGES === 'true' ? '/magazyn_biala/' : '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
