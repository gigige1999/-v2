import { defineConfig, mergeConfig, type ConfigEnv, type UserConfig } from 'vite';
import baseConfig from './vite.config';

// 导出到 ../htmlv2：相对路径 + IIFE 普通脚本，可直接双击 index.html 打开
export default defineConfig((env: ConfigEnv) =>
  mergeConfig((baseConfig as (e: ConfigEnv) => UserConfig)(env), {
    base: './',
    build: {
      outDir: '../htmlv2',
      emptyOutDir: true,
      modulePreload: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: { output: { format: 'iife', inlineDynamicImports: true } },
    },
    plugins: [
      {
        name: 'htmlv2-classic-script',
        transformIndexHtml: {
          order: 'post',
          handler: (html: string) =>
            html
              .replace(/<script type="module" crossorigin src=/g, '<script defer src=')
              .replace(/<link rel="stylesheet" crossorigin /g, '<link rel="stylesheet" '),
        },
      },
    ],
  })
);
