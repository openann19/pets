import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

/**
 * Production-Grade "Strict" ESLint Configuration (2025)
 * This configuration enforces a zero-tolerance policy for code quality issues.
 */
export default [
  // 1. Global Ignores
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.config.js',
      '*.config.ts',
      '.expo/**',
      'ios/**',
      'android/**',
    ],
  },

  // 2. Base Recommended Rules
  js.configs.recommended,

  // 3. TypeScript Configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: [
          './tsconfig.json',
          './tsconfig.base.json',
          './apps/*/tsconfig.json',
          './packages/tsconfig.json',
          './packages/*/tsconfig.json',
        ],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@next/next': nextPlugin,
    },
    rules: {
      // --- Start with the strictest recommended rule sets ---
      ...typescriptPlugin.configs['strict-type-checked'].rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      // Note: Next.js plugin rules applied only in web-specific override below

      // --- Customize and enforce ZERO-TOLERANCE rules ---
      
      // Prevent 'any' and unsafe operations (ERROR level)
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',

      // Enforce promise handling (ERROR level)
      '@typescript-eslint/no-floating-promises': 'error',
      
      // Enforce strict boolean checks
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
        },
      ],

      // Enforce React Hooks best practices (ERROR level)
      'react-hooks/exhaustive-deps': 'error',

      // Disallow console logs in production code (ERROR level)
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // Enforce unused variables are an ERROR, allowing underscore prefix
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      
      // Allow for type inference
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // Disable rules that are stylistic or handled by Prettier
      'arrow-body-style': 'off',
      'react/prop-types': 'off', // Not needed with TypeScript
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // 3b. Web App Overrides (enable Next.js rules)
  {
    files: ['apps/web/src/**/*.{ts,tsx}', 'apps/web/pages/**/*.{ts,tsx}', 'apps/web/app/**/*.{ts,tsx}'],
    rules: {
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },

  // 3c. Mobile App Overrides (disable Next.js-specific rules)
  {
    files: ['apps/mobile/src/**/*.{ts,tsx}'],
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },

  // 4. Test Files Overrides (more lenient for tests)
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/__tests__/**/*', '**/*.spec.{js,jsx,ts,tsx}', '**/__mocks__/**/*'],
    languageOptions: {
      globals: {
        ...globals.jest,
        // Testing Library globals
        render: 'readonly',
        screen: 'readonly',
        fireEvent: 'readonly',
        waitFor: 'readonly',
        within: 'readonly',
      },
    },
    rules: {
      // It's common to use 'any' and non-null assertions in tests
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-require-imports': 'off', // jest.mock() uses require
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/unbound-method': 'off', // Mock methods don't need proper binding
      '@typescript-eslint/await-thenable': 'off', // await on mock functions
      '@typescript-eslint/no-confusing-void-expression': 'off', // test assertions may be void
      'react/no-unknown-property': 'off', // React Native props like testID
      'no-console': 'off', // console.log for debugging tests
      'no-undef': 'off', // Testing library and other test globals
    },
  },

  // 5. Setup Files Overrides (test configuration files)
  {
    files: ['**/setupTests.{ts,js}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-undef': 'off',
    },
  },
];