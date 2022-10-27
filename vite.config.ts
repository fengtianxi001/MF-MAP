import { defineConfig, loadEnv } from 'vite';
export default defineConfig(({ command, mode }) => {
  return {
    base: './',
    build: {
      outDir: './docs',
    },
  };
});
