import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './', // For GitHub Pages relative paths
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  test: {
    environment: 'jsdom',
  },
});
