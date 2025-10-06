import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Forward /proxy/... to your API host to avoid CORS in dev
      '/proxy': {
        target: 'https://gitlabnsclbio.jbnu.ac.kr',
        changeOrigin: true,
        secure: false,
        rewrite: p => p.replace(/^\/proxy/, ''),
      },
    },
  },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
})
