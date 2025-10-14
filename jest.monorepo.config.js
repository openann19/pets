module.exports = {
  projects: [
    {
      displayName: 'ui-package',
      testEnvironment: 'jsdom',
      rootDir: 'packages/ui',
      testMatch: [
        '**/__tests__/**/*.test.(ts|tsx)',
        '**/*.(test|spec).(ts|tsx)'
      ],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
      moduleNameMapper: {
        '^@pawfectmatch/(.*)$': '<rootDir>/../$1/src/index.ts'
      },
      collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/index.ts',
        '!src/**/*.stories.{ts,tsx}',
        '!src/**/types/**'
      ],
      coverageDirectory: 'coverage',
      coverageReporters: ['lcov', 'text', 'html'],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    {
      displayName: 'core-package',
      testEnvironment: 'node',
      rootDir: 'packages/core',
      testMatch: [
        '**/__tests__/**/*.test.(ts|tsx)',
        '**/*.(test|spec).(ts|tsx)'
      ],
      collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/index.ts',
        '!src/**/types/**'
      ],
      coverageDirectory: 'coverage'
    },
    {
      displayName: 'web-app',
      testEnvironment: 'jsdom',
      rootDir: 'apps/web',
      testMatch: [
        '**/__tests__/**/*.test.(ts|tsx)',
        '**/*.(test|spec).(ts|tsx)'
      ],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@pawfectmatch/(.*)$': '<rootDir>/../../packages/$1/src/index.ts'
      }
    },
    {
      displayName: 'mobile-app',
      testEnvironment: 'node',
      rootDir: 'apps/mobile',
      testMatch: [
        '**/__tests__/**/*.test.(ts|tsx)',
        '**/*.(test|spec).(ts|tsx)'
      ],
      preset: 'jest-expo'
    }
  ]
};
