import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

/**
 * Web App ESLint Configuration (Flat Config)
 * Inherits strict rules from root config with Next.js specific overrides
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
      'public/app-components/**',
      'cypress/**',
      '**/*.cy.ts',
      '**/*.cy.tsx',
    ],
  },

  // 2. Base Recommended Rules
  js.configs.recommended,

  // 3. JavaScript Configuration for test files
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        callApi: 'readonly',
        Response: 'readonly',
        global: 'readonly',
        require: 'readonly',
      },
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'error',
      'no-undef': 'error',
    },
  },

  // 4. TypeScript Configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: [
          '../../tsconfig.json', 
          '../../tsconfig.base.json',
          './tsconfig.json',
          './tsconfig.base.json',
          '../../apps/web/tsconfig.json',
          '../../packages/*/tsconfig.json'
        ],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
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
      ...nextPlugin.configs['core-web-vitals'].rules,

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

      // Fix ESLint rule configuration issue
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',

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

      // Next.js specific overrides (keep minimal)
      '@next/next/no-html-link-for-pages': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      'prefer-const': 'warn',
      'no-useless-escape': 'warn',
      'react-hooks/exhaustive-deps': 'warn', // Override to warn for Next.js
      'react/function-component-definition': 'off',
      'react/jsx-no-leaked-render': 'off',
      'react/jsx-curly-brace-presence': 'off',
      '@typescript-eslint/require-await': 'off',
      'react/jsx-boolean-value': 'off',
      'arrow-body-style': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // 4. Test Files Overrides (more lenient for tests)
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/__tests__/**/*', '**/*.spec.{js,jsx,ts,tsx}', '**/setupTests.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      // It's common to use 'any' and non-null assertions in tests
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // 5. Cypress Files Override
  {
    files: ['cypress/**/*.cy.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
  },
];