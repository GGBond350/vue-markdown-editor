import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { join  } from 'path'
import svgLoader from 'vite-svg-loader'
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), svgLoader()],
  base: './', // 设置基础路径
  resolve: {
    alias: {
      '@': join (__dirname, 'src') // 路径别名
    },
    extensions: ['.js', '.json', '.ts', '.vue'] // 使用路径别名时想要省略的后缀名
  },
})
