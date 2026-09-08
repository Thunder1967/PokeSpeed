import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // For GitHub Pages relative paths
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
