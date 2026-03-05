import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.{js,mjs}'],
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, '.'),
    },
  },
});
