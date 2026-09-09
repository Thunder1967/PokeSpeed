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
          // Separate the large, rarely-changing Pokemon data (~113KB)
          // into its own chunk for independent long-term caching.
          if (id.includes('champion-m-b.json')) {
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
