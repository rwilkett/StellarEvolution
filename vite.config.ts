import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/StellarEvolution/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
