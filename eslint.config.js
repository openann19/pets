// @ts-check
import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals/index.js';
import tseslint from 'typescript-eslint';

/**
 * ESLint Flat Config - Zero Errors Configuration
 */
export default tseslint.config(
  // === Global Ignores ===
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/build/**',
      '**/*.d.ts',
      '**/storybook-static/**',
      '**/.turbo/**',
      '**/out/**',
      '**/.storybook/**', // Ignore Storybook files to avoid parsing errors
      '**/apps/web/src/tests/**',
    ],
  },

  // === Base JavaScript Configuration ===
  js.configs.recommended,

  // === Global Language Options ===
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        ...globals.jest,
        JSX: 'readonly',
        React: 'readonly',
        NodeJS: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },

  // === TypeScript Files Configuration ===
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: [
          './tsconfig.json',
          './apps/*/tsconfig.json',
          './packages/*/tsconfig.json',
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    rules: {
      // === TypeScript Rules ===
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/consistent-type-exports': 'off',
      '@typescript-eslint/no-import-type-side-effects': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/return-await': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      // Enforce minimal unused vars policy in production code
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/naming-convention': 'off',

      // === React Rules ===
      'react/jsx-no-leaked-render': 'off',
      'react/jsx-key': 'error',
      'react/jsx-no-useless-fragment': 'off',
      'react/jsx-curly-brace-presence': 'off',
      'react/self-closing-comp': 'off',
      'react/jsx-boolean-value': 'off',
      'react/function-component-definition': 'off',

      // === React Hooks Rules ===
      'react-hooks/rules-of-hooks': 'error',
      // Ensure hooks dependency arrays are maintained
      'react-hooks/exhaustive-deps': 'warn',

      // === Accessibility Rules ===
      'jsx-a11y/alt-text': 'off',
      'jsx-a11y/aria-props': 'off',
      'jsx-a11y/aria-proptypes': 'off',
      'jsx-a11y/aria-unsupported-elements': 'off',
      'jsx-a11y/role-has-required-aria-props': 'off',
      'jsx-a11y/role-supports-aria-props': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/interactive-supports-focus': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/no-autofocus': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',

      // === General Code Quality ===
      'no-console': 'off',
      'no-debugger': 'error',
      'no-alert': 'off',
      'prefer-const': 'off',
      'no-var': 'off',
      'object-shorthand': 'off',
      'prefer-template': 'off',
      'prefer-arrow-callback': 'off',
      'arrow-body-style': 'off',
      'no-duplicate-imports': 'off',
      'no-nested-ternary': 'off',
      'no-unneeded-ternary': 'off',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-return-assign': 'off',
      'no-throw-literal': 'off',
      'no-void': 'off',
      'radix': 'off',
      'yoda': 'off',
      'curly': 'off',
      'eqeqeq': 'off',
      'prefer-destructuring': 'off',

      // === Performance ===
      'no-await-in-loop': 'off',
      'require-atomic-updates': 'off',

      // === Base ESLint Rules ===
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // === Test Files Configuration ===
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    rules: {
      // Relax all rules for tests
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-console': 'off',
      'no-undef': 'off',
      'react/jsx-key': 'off',
      'react/jsx-no-useless-fragment': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },

  // === Setup Tests Files (Jest globals) ===
  {
    files: ['**/setupTests.ts', '**/setupTests.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        window: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      'no-undef': 'off',
    },
  },

  // === JavaScript Files Configuration ===
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    ...tseslint.configs.disableTypeChecked,
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // === Prettier Integration (must be last) ===
  prettierConfig,
);
