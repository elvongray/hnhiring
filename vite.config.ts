import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const repoName =
    process.env.VITE_REPO_NAME ??
    process.env.GITHUB_REPOSITORY?.split('/')[1] ??
    'hnhiring';

  const base =
    process.env.VITE_PUBLIC_BASE ??
    (mode === 'production' ? `/${repoName}/` : '/');

  return {
    plugins: [react(), tailwindcss()],
    base,
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
  };
});
