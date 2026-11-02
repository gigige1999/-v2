import { defineConfig, mergeConfig, type ConfigEnv, type UserConfig } from 'vite';
import htmlv2Config from './vite.htmlv2.config';

// GitHub Pages 发布版：与 htmlv2 相同的相对路径打包，输出到 docs/，且不嵌入任何 API 密钥
export default defineConfig((env: ConfigEnv) =>
  mergeConfig((htmlv2Config as (e: ConfigEnv) => UserConfig)(env), {
    build: { outDir: 'docs', emptyOutDir: true },
    define: {
      'process.env.API_KEY': JSON.stringify(''),
      'process.env.GEMINI_API_KEY': JSON.stringify(''),
    },
  })
);
