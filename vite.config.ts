import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // 代理所有 /api 请求到后端，并移除 /api 前缀
      '/api/': {
        target: 'http://113.45.24.31:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying request:', req.method, req.url, '->', options.target + proxyReq.path);
          });
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  define: {
    // 兼容 process.env
    'process.env': {}
  }
})