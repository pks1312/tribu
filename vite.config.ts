import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'firebase/storage': path.resolve(__dirname, './src/mocks/firebase.ts'),
      '@/services/firebase/config': path.resolve(__dirname, './src/mocks/firebase.ts'),
      '@/services/firebase/auth': path.resolve(__dirname, './src/mocks/firebase.ts'),
    },
  },
})
