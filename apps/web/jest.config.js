/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts', '<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/providers/(.*)$': '<rootDir>/src/providers/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@pawfectmatch/core$': '<rootDir>/../../packages/core/src',
    '^@stripe/stripe-js$': '<rootDir>/__mocks__/@stripe/stripe-js.ts',
    '^cloudinary$': '<rootDir>/__mocks__/cloudinary.ts',
    '^deepseek$': '<rootDir>/__mocks__/deepseek.ts'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        module: 'esnext',
        target: 'es2017',
        lib: ['dom', 'dom.iterable', 'es6'],
        allowJs: true,
        skipLibCheck: true,
        strict: false,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noImplicitAny: false,
      }
    }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '<rootDir>/tests/playwright/'],
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@testing-library|@emotion|@plaiceholder|sharp))',
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
};
