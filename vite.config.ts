import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './', // For GitHub Pages relative paths
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // Separate large, rarely-changing format data into pokemon-data chunk
          if ((id.includes('src/data/formats') || id.includes('src\\data\\formats')) && id.endsWith('.json')) {
            return 'pokemon-data';
          }
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    pool: 'threads',
  },
});
