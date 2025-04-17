import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@sandbox/comet-sdk-wagmi': path.resolve(__dirname, '../comet-sdk-wagmi/src'),
      '@sandbox/comet-sdk': path.resolve(__dirname, '../comet-sdk/src')
    }
  }
})