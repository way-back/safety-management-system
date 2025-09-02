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
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        // 去掉 console.log, console.info, console.warn, console.error
        drop_console: true,
        // 去掉 debugger
        drop_debugger: true,
        // 去掉所有 console 方法
        pure_funcs: ['console.log', 'console.info', 'console.warn', 'console.error', 'console.debug'],
      },
      mangle: {
        // 混淆变量名
        safari10: true,
        // 保留函数名（可选，用于调试）
        keep_fnames: false,
        // 保留类名（可选，用于调试）
        keep_classnames: false,
      },
      format: {
        // 去掉注释
        comments: false,
        // 美化输出（生产环境建议 false）
        beautify: false,
        // 去掉分号
        semicolons: true,
      },
    },
  },
  define: {
    // 兼容 process.env
    'process.env': {}
  }
})