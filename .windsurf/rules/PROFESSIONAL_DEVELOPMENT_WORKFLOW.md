---
trigger: manual
description:
globs:
---

## 🔍 Code Quality & Linting

### Current ESLint Configuration
Our project uses a comprehensive ESLint setup with TypeScript support:

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  settings: {
    next: {
      rootDir: ['apps/*/'],
    },
    react: {
      version: 'detect',
    },
  },
  env: {
    node: true,
    browser: true,
    es2022: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './apps/*/tsconfig.json', './packages/*/tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'import', 'react', 'react-hooks'],
  rules: {
    // Enterprise-grade rules
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/consistent-type-exports': 'error',
    '@typescript-eslint/no-import-type-side-effects': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/prefer-includes': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/prefer-reduce-type-parameter': 'error',
    '@typescript-eslint/prefer-regexp-exec': 'error',
    '@typescript-eslint/prefer-promise-reject-errors': 'error',
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/no-array-constructor': 'error',
    '@typescript-eslint/no-duplicate-enum-values': 'error',
    '@typescript-eslint/no-empty-function': 'error',
    '@typescript-eslint/no-empty-interface': 'error',
    '@typescript-eslint/no-extra-non-null-assertion': 'error',
    '@typescript-eslint/no-extra-semi': 'error',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/no-loss-of-precision': 'error',
    '@typescript-eslint/no-namespace': 'error',
    '@typescript-eslint/no-this-alias': 'error',
    '@typescript-eslint/no-unnecessary-type-constraint': 'error',
    '@typescript-eslint/no-unsafe-declaration-merging': 'error',
    '@typescript-eslint/no-var-requires': 'error',
    '@typescript-eslint/triple-slash-reference': 'error',
    '@typescript-eslint/type-annotation-spacing': 'error',
    '@typescript-eslint/unified-signatures': 'error',
    '@typescript-eslint/restrict-template-expressions': 'error',
    '@typescript-eslint/restrict-plus-operands': 'error',
    '@typescript-eslint/unbound-method': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // React-specific rules
    'react/jsx-uses-react': 'off', // Not needed in React 17+
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'off', // Using TypeScript
    'react/jsx-props-no-spreading': 'warn',
    'react/jsx-no-bind': 'warn',
    'react/jsx-key': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-uses-vars': 'error',
    'react/no-children-prop': 'error',
    'react/no-danger-with-children': 'error',
    'react/no-deprecated': 'error',
    'react/no-direct-mutation-state': 'error',
    'react/no-find-dom-node': 'error',
    'react/no-is-mounted': 'error',
    'react/no-render-return-value': 'error',
    'react/no-string-refs': 'error',
    'react/no-unescaped-entities': 'error',
    'react/no-unknown-property': 'error',
    'react/require-render-return': 'error',
    'react/self-closing-comp': 'error',
    
    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Import/Export rules
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-duplicates': 'error',
    'import/no-unused-modules': 'warn',
    
    // Base ESLint rules
    'no-unused-vars': 'off', // Handled by TypeScript
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-constructor': 'error',
    'no-useless-rename': 'error',
    'object-shorthand': 'error',
    'prefer-destructuring': ['error', { object: true, array: false }],
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    'yoda': 'error',
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/unbound-method': 'off',
      },
    },
    {
      files: ['**/*.config.js', '**/*.config.ts'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'import/no-default-export': 'off',
      },
    },
  ],
};
```

### Linting Commands
```bash
# Lint all packages
pnpm lint

# Lint specific package
cd apps/web && pnpm lint

# Fix auto-fixable issues
pnpm lint --fix
```

### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": true,
  "proseWrap": "preserve",
  "htmlWhitespaceSensitivity": "css",
  "embeddedLanguageFormatting": "auto"
}
```

---

## 📝 TypeScript Configuration

### Strict TypeScript Settings
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    
    // Strict Type Checking - Enterprise Grade
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    // Module Resolution - Performance Optimized
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    
    // Performance & Bundle Optimization
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    "assumeChangesOnlyAffectDirectDependencies": true,
    "disableSourceOfProjectReferenceRedirect": true,
    "disableSolutionSearching": true,
    "disableReferencedProjectLoad": true
  },
  "exclude": [
    "node_modules",
    "**/dist/**",
    "**/build/**",
    "**/.next/**",
    "**/coverage/**",
    "**/cypress/**",
    "**/logs/**"
  ],
  "include": [
    "apps/**/*",
    "packages/**/*",
    "server/**/*",
    "tests/**/*"
  ]
}
```

### Type Safety Rules
1. **No `any` types** - Use proper type definitions
2. **Strict null checks** - Handle undefined/null cases
3. **Unused variables** - Remove or prefix with `_`
4. **Consistent naming** - Use PascalCase for types, camelCase for variables

### Type Definition Standards
```typescript
// ✅ Good: Proper interface definition
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

// ❌ Bad: Using any
const userData: any = await fetchUser();

// ✅ Good: Proper typing
const userData: User = await fetchUser();
```

---

## 🧪 Testing Strategy

### Multi-Layer Testing Approach

#### 1. Unit Tests (Jest)
```bash
# Run unit tests
pnpm test:unit

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

**Jest Configuration:**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/__tests__', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
    '**/tests/**/*.test.(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        noUnusedLocals: false, // Disable for tests
        noUnusedParameters: false, // Disable for tests
      }
    }],
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@core/(.*)$': '<rootDir>/../packages/core/src/$1',
    '^@ui/(.*)$': '<rootDir>/../packages/ui/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/setupTests.ts',
    '!src/**/__mocks__/**',
    '!src/**/__tests__/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.ts',
    '@testing-library/jest-dom'
  ],
  testTimeout: 10000,
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  // Performance optimizations
  maxWorkers: '50%',
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Test result processing
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-results',
      outputName: 'junit.xml',
      ancestorSeparator: ' › ',
      uniqueOutputName: 'false',
      suiteNameTemplate: '{filepath}',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}'
    }]
  ],
  
  // Global test configuration
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  
  // Module resolution
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@testing-library|@emotion))'
  ],
  
  // Test file patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/.next/',
    '/coverage/'
  ],
  
  // Watch mode configuration
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/.next/',
    '/coverage/',
    '/.jest-cache/'
  ]
};
```

#### 2. Integration Tests
```bash
# Run integration tests
pnpm test:integration

# Contract testing
pnpm test:contract
```

#### 3. End-to-End Tests
```bash
# Cypress E2E tests
pnpm test:e2e:cypress

# Playwright E2E tests
pnpm test:e2e:playwright
```

#### 4. Visual Regression Tests
```bash
# Visual testing with Percy
pnpm test:visual
```

#### 5. Performance Tests
```bash
# Load testing with k6
pnpm test:load

# Stress testing
pnpm test:stress

# Lighthouse performance
pnpm test:performance
```

#### 6. Chaos Engineering
```bash
# Chaos testing
pnpm test:chaos
```

### Test Coverage Requirements
- **Minimum Coverage**: 80%
- **Target Coverage**: 90%
- **Critical Paths**: 95%+

---

## 🚀 CI/CD Pipeline

### TurboRepo Pipeline
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local", "**/.env", "**/tsconfig.json", "**/.eslintrc.js", "**/.prettierrc"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "build/**", "!.next/cache/**"],
      "env": ["NODE_ENV", "NEXT_PUBLIC_*", "API_URL", "MONGODB_URI"]
    },
    "dev": {
      "cache": false,
      "dependsOn": ["^build"],
      "persistent": true,
      "env": ["NODE_ENV", "NEXT_PUBLIC_*", "API_URL", "MONGODB_URI"]
    },
    "start": {
      "cache": false,
      "dependsOn": ["build"],
      "persistent": true,
      "env": ["NODE_ENV", "PORT", "API_URL", "MONGODB_URI"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**", "test-results/**"],
      "inputs": [
        "src/**/*.tsx", 
        "src/**/*.ts", 
        "test/**/*.ts", 
        "test/**/*.tsx",
        "tests/**/*.ts",
        "tests/**/*.tsx",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx"
      ],
      "env": ["NODE_ENV", "CI", "TEST_ENV"]
    },
    "test:unit": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "inputs": [
        "src/**/*.tsx", 
        "src/**/*.ts", 
        "**/*.test.ts",
        "**/*.test.tsx"
      ],
      "env": ["NODE_ENV", "CI"]
    },
    "test:integration": {
      "dependsOn": ["^build", "build"],
      "outputs": ["test-results/**"],
      "inputs": [
        "tests/integration/**/*.ts",
        "tests/integration/**/*.tsx"
      ],
      "env": ["NODE_ENV", "CI", "API_URL", "MONGODB_URI"]
    },
    "test:e2e": {
      "dependsOn": ["^build", "build"],
      "outputs": ["test-results/**", "playwright-report/**"],
      "inputs": [
        "tests/e2e/**/*.ts",
        "tests/e2e/**/*.tsx",
        "cypress/**/*.ts",
        "cypress/**/*.js"
      ],
      "env": ["NODE_ENV", "CI", "BASE_URL", "API_URL"]
    },
    "test:visual": {
      "dependsOn": ["^build", "build"],
      "outputs": ["test-results/**", "percy/**"],
      "inputs": [
        "tests/visual/**/*.ts",
        "tests/visual/**/*.tsx"
      ],
      "env": ["NODE_ENV", "CI", "PERCY_TOKEN"]
    },
    "test:load": {
      "dependsOn": ["^build", "build"],
      "outputs": ["test-results/**"],
      "inputs": [
        "tests/load/**/*.js"
      ],
      "env": ["NODE_ENV", "CI", "BASE_URL", "API_URL"]
    },
    "test:chaos": {
      "dependsOn": ["^build", "build"],
      "outputs": ["test-results/**"],
      "inputs": [
        "tests/chaos/**/*.ts",
        "tests/chaos/**/*.tsx"
      ],
      "env": ["NODE_ENV", "CI", "BASE_URL", "API_URL"]
    },
    "lint": {
      "outputs": [],
      "inputs": [
        "src/**/*.tsx",
        "src/**/*.ts",
        "**/*.tsx",
        "**/*.ts",
        "**/*.js",
        "**/*.jsx"
      ]
    },
    "format": {
      "outputs": [],
      "inputs": [
        "src/**/*.tsx",
        "src/**/*.ts",
        "**/*.tsx",
        "**/*.ts",
        "**/*.js",
        "**/*.jsx",
        "**/*.json",
        "**/*.md"
      ]
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": [],
      "inputs": [
        "src/**/*.tsx",
        "src/**/*.ts",
        "**/*.tsx",
        "**/*.ts"
      ]
    },
    "clean": {
      "cache": false,
      "outputs": []
    },
    "quality-gate": {
      "dependsOn": ["build", "test", "lint", "type-check"],
      "outputs": ["sonar/**"],
      "env": ["SONAR_TOKEN", "SONAR_HOST_URL"]
    },
    "security-scan": {
      "dependsOn": ["^build"],
      "outputs": ["security-reports/**"],
      "env": ["NODE_ENV", "CI"]
    },
    "performance-test": {
      "dependsOn": ["^build", "build"],
      "outputs": ["lighthouse-reports/**"],
      "inputs": [
        "tests/performance/**/*.js"
      ],
      "env": ["NODE_ENV", "CI", "BASE_URL"]
    }
  }
}
```

### Quality Gates (SonarQube)
```properties
# Coverage thresholds
sonar.coverage.minimum=80
sonar.coverage.target=90

# Quality ratings (A = Excellent)
sonar.reliability.rating.minimum=A
sonar.security.rating.minimum=A
sonar.maintainability.rating.minimum=A

# Zero tolerance for critical issues
sonar.bugs.minimum=0
sonar.vulnerabilities.minimum=0
sonar.security.hotspots.minimum=0
```

### Build Commands
```bash
# Development
pnpm dev

# Production build
pnpm build

# Type checking
pnpm type-check

# Quality gate
pnpm quality-gate

# Full test suite
pnpm test:all
```

---

## 👥 Code Review Process

### Pre-Commit Checklist
- [ ] All tests pass
- [ ] TypeScript compilation successful
- [ ] ESLint passes with no errors
- [ ] Code coverage maintained
- [ ] Security scan passes
- [ ] Performance benchmarks met

### Review Criteria
1. **Code Quality**
   - No TypeScript errors
   - Proper error handling
   - Clean, readable code
   - No code smells

2. **Security**
   - No hardcoded secrets
   - Proper input validation
   - SQL injection prevention
   - XSS protection

3. **Performance**
   - No memory leaks
   - Efficient algorithms
   - Proper caching
   - Bundle size impact

4. **Testing**
   - Adequate test coverage
   - Edge cases covered
   - Integration tests updated

### Automated Checks
```bash
# Pre-commit hook (recommended setup)
npm install --save-dev husky lint-staged

# package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

---

## 🔒 Performance & Security

### Performance Monitoring
```bash
# Lighthouse CI
pnpm test:performance

# Bundle analysis
pnpm build --analyze

# Memory profiling
node --inspect-brk dist/server.js
```

### Security Scanning
```bash
# Dependency audit
pnpm audit --audit-level=high

# Security testing
pnpm test:security

# SAST scanning (SonarQube)
pnpm quality-gate
```

### Performance Budgets
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Bundle Size**: < 500KB gzipped

---

## 🤖 AI Development Assistant Prompt

### Comprehensive AI Developer Prompt

```
You are an elite TypeScript/React development AI assistant for the PawfectMatch Premium project. Your role is to help fix TypeScript errors, resolve linting issues, and ensure production-ready code quality.

## PROJECT CONTEXT
- **Framework**: Next.js 15 with React 18
- **Language**: TypeScript with strict mode enabled
- **Architecture**: Monorepo with TurboRepo
- **Testing**: Jest, Cypress, Playwright, k6
- **Quality**: SonarQube integration with A-grade requirements

## CORE RESPONSIBILITIES

### 1. TypeScript Error Resolution
- **NEVER use `any` types** - Always provide proper type definitions
- **Fix interface mismatches** - Ensure all properties match defined interfaces
- **Handle null/undefined** - Use proper null checks and optional chaining
- **Import/Export issues** - Verify all imports are correctly typed
- **Generic constraints** - Use proper generic type constraints

### 2. Linting & Code Quality
- **ESLint compliance** - Fix all ESLint errors and warnings
- **Prettier formatting** - Ensure consistent code formatting
- **Unused variables** - Remove or prefix with underscore
- **Console statements** - Only allow warn, error, info levels
- **Code smells** - Identify and fix maintainability issues

### 3. Testing Requirements
- **Unit test coverage** - Maintain 80%+ coverage
- **Integration tests** - Update when APIs change
- **Type safety in tests** - Use proper TypeScript in test files
- **Mock implementations** - Create proper mocks for external dependencies

### 4. Performance & Security
- **Bundle size impact** - Consider performance implications
- **Memory leaks** - Identify potential memory issues
- **Security vulnerabilities** - Flag potential security risks
- **Accessibility** - Ensure WCAG compliance

## WORKFLOW INSTRUCTIONS

### When Fixing TypeScript Errors:
1. **Analyze the error** - Understand the root cause
2. **Check type definitions** - Verify interface/type definitions
3. **Provide proper types** - Never use `any` as a quick fix
4. **Test the solution** - Ensure the fix doesn't break other code
5. **Document changes** - Explain why the fix is necessary

### When Resolving Linting Issues:
1. **Read the linting rule** - Understand what the rule is checking
2. **Apply the fix** - Use the most appropriate solution
3. **Maintain consistency** - Follow existing code patterns
4. **Consider performance** - Ensure fixes don't impact performance

### Code Quality Standards:
```typescript
// ✅ GOOD: Proper typing and error handling
interface UserResponse {
  data: User;
  success: boolean;
  message?: string;
}

const fetchUser = async (id: string): Promise<UserResponse> => {
  try {
    const response = await api.get(`/users/${id}`);
    return {
      data: response.data,
      success: true
    };
  } catch (error) {
    return {
      data: {} as User,
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// ❌ BAD: Using any and poor error handling
const fetchUser = async (id: any): Promise<any> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};
```

### Testing Standards:
```typescript
// ✅ GOOD: Comprehensive test with proper typing
describe('UserService', () => {
  it('should fetch user successfully', async () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    };

    jest.spyOn(api, 'get').mockResolvedValue({ data: mockUser });

    const result = await userService.fetchUser('1');

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockUser);
  });
});
```

## QUALITY GATES
Before considering any code production-ready, ensure:
- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors
- [ ] All tests pass
- [ ] Code coverage maintained
- [ ] No security vulnerabilities
- [ ] Performance benchmarks met
- [ ] Accessibility standards met

## COMMUNICATION STYLE
- Be direct and specific about issues
- Provide code examples for fixes
- Explain the reasoning behind solutions
- Suggest improvements beyond just fixing errors
- Maintain professional, helpful tone

## EMERGENCY PROTOCOLS
If you encounter:
- **Critical security issues**: Flag immediately with severity level
- **Performance regressions**: Suggest optimization strategies
- **Breaking changes**: Recommend migration paths
- **Complex type issues**: Break down into smaller, manageable steps

Remember: Your goal is to help create maintainable, secure, and performant code that meets enterprise-grade standards. Always prioritize type safety, code quality, and user experience.
```

---

## 📊 Monitoring & Metrics

### Key Performance Indicators
- **Build Success Rate**: > 95%
- **Test Coverage**: > 80%
- **TypeScript Errors**: 0
- **ESLint Errors**: 0
- **Security Vulnerabilities**: 0
- **Performance Score**: > 90

### Quality Metrics Dashboard
```bash
# Generate quality report
pnpm quality-gate

# Coverage report
pnpm test:coverage

# Performance report
pnpm test:performance

# Security report
pnpm audit
```

---

## 🚨 Emergency Procedures

### Critical Issues Response
1. **TypeScript Compilation Failure**
   - Check for breaking changes in dependencies
   - Verify type definitions are up to date
   - Review recent code changes

2. **Security Vulnerability**
   - Run `pnpm audit --audit-level=high`
   - Update vulnerable dependencies
   - Review affected code paths

3. **Performance Regression**
   - Run Lighthouse CI
   - Analyze bundle size changes
   - Check for memory leaks

4. **Test Suite Failure**
   - Identify failing tests
   - Check for environment issues
   - Review recent changes

---

## 📚 Additional Resources

### Documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

### Tools & Extensions
- **VS Code Extensions**: TypeScript, ESLint, Prettier, GitLens
- **Browser DevTools**: React DevTools, Redux DevTools
- **Testing Tools**: Jest, Cypress, Playwright, k6
- **Quality Tools**: SonarQube, Lighthouse, Bundle Analyzer

---

*This document is living documentation and should be updated as the project evolves. Last updated: 2024*