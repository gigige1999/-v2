import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './'：构建产物用相对路径，dist/ 可直接放任意静态目录
export default defineConfig({
  base: './',
  server: { port: 3011, host: '0.0.0.0' },
  plugins: [react()],
});
