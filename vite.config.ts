import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const repoBase = '/hnhiring/';

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_PUBLIC_BASE ?? (mode === 'production' ? repoBase : '/'),
  test: {
    globals: true,
    environment: 'jsdom',
    css: true,
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
    },
    typecheck: {
      tsconfig: './tsconfig.vitest.json',
    },
  },
}));
