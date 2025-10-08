import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./apps/web/src/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/setupTests.*',
        '**/test-utils.*',
        '**/__mocks__/**',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.spec.*'
      ]
    },
    include: [
      'apps/web/src/**/*.{test,spec}.{js,ts,tsx}',
      'packages/core/src/**/*.{test,spec}.{js,ts,tsx}',
      'packages/ui/src/**/*.{test,spec}.{js,ts,tsx}',
      'server/src/**/*.{test,spec}.{js,ts}'
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      '**/cypress/**',
      '**/playwright/**',
      '**/e2e/**'
    ]
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './apps/web/src'),
      '@core': resolve(__dirname, './packages/core/src'),
      '@ui': resolve(__dirname, './packages/ui/src')
    }
  }
})
