import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 新浪股票行情API
      '/api/sina': {
        target: 'https://hq.sinajs.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sina/, ''),
        headers: {
          'Referer': 'https://finance.sina.com.cn',
        }
      },
      // 东方财富搜索API
      '/api/eastmoney/search': {
        target: 'https://searchapi.eastmoney.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/eastmoney\/search/, ''),
      },
      // 东方财富财务数据API
      '/api/eastmoney/data': {
        target: 'https://datacenter.eastmoney.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/eastmoney\/data/, ''),
      },
      // 腾讯股票行情API (备用)
      '/api/tencent': {
        target: 'https://qt.gtimg.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tencent/, ''),
      },
      // 东方财富搜索API (兼容旧路径)
      '/api/suggest': {
        target: 'https://searchapi.eastmoney.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/suggest/, '/api/suggest'),
      }
    }
  }
})
