import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  // 1) Global ignores (lint scope)
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.expo/**',
      'ios/**',
      'android/**',
      'public/app-components/**',
      'cypress/**',
      '**/*.cy.ts',
      '**/*.cy.tsx',
    ],
  },

  // 2) JS Recommended (за .js/.jsx извън TS)
  js.configs.recommended,

  // 3) JavaScript files (web app)
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@next/next': nextPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,

      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'error',
      'no-undef': 'error',
    },
    settings: { react: { version: 'detect' } },
  },

  // 4) TypeScript Production Code (src/ only, type-aware strict)
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: false, // Disable type-aware for now; use recommended rules only
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@next/next': nextPlugin,
    },
    rules: {
      // React / Hooks / Next:
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,

      // --- Core safety (ERROR) ---
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // --- Unused vars (ERROR) ---
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],

      // --- Helpful warnings (non-blocking) ---
      'prefer-const': 'warn',
      'no-useless-escape': 'warn',

      // --- Disabled (stylistic or handled by Prettier) ---
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'arrow-body-style': 'off',
      'react/prop-types': 'off',
      '@next/next/no-html-link-for-pages': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'react/function-component-definition': 'off',
      'react/jsx-no-leaked-render': 'off',
      'react/jsx-curly-brace-presence': 'off',
      'react/jsx-boolean-value': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
    settings: { react: { version: 'detect' } },
  },

  // 4b) TypeScript Non-Production (tests, storybook, scripts, mocks — type-aware OFF)
  {
    files: [
      '**/*.test.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/__tests__/**/*.{ts,tsx,js,jsx}',
      '**/*.stories.{ts,tsx,js,jsx}',
      '**/storybook/**/*',
      '**/mocks/**/*',
      'scripts/**/*',
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: null, // <— NO type service for tests
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      // Recommended (non-type-aware) for tests
      ...typescriptPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,

      // Keep core safety, but relax unsafe-* in tests
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': ['error', { allow: ['warn', 'error', 'log'] }],
    },
  },

  // 5) Cypress (изключи project)
  {
    files: ['cypress/**/*.cy.{ts,tsx,js,jsx}'],
    languageOptions: {
      parserOptions: { project: null },
    },
    rules: {},
  },
];