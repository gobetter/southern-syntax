import { defineConfig } from 'vitest/config';
import path from 'path';
import dotenv from 'dotenv';

// โหลด .env ก่อน define config
dotenv.config({ path: './.env' });

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/__setupTests.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'src/**/__tests__/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
