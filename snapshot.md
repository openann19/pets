# PawfectMatch Premium - Complete Configuration & Directory Structure Snapshot

Generated on: October 24, 2025

## Project Overview
- **Name**: PawfectMatch Premium (v1.0.1-rc.0)
- **Type**: Monorepo with Turbo + pnpm workspaces
- **Architecture**: Full-stack pet matching platform
- **Technologies**: TypeScript, React 18, React Native, Next.js, Expo
- **Repository**: https://github.com/your-org/pawfectmatch-premium.git

## Directory Structure

### Root Level
```
pawfectmatch-premium/
├── .cursorignore
├── .env.example
├── .env.production
├── .gitignore
├── .gitleaks.toml
├── .husky/
│   └── pre-commit
├── .prettierrc
├── .windsurf/
│   ├── rules/
│   │   └── sa.md
│   └── workflows/
│       ├── refactor.md
│       └── xa.md
├── .turbo/
├── ai-service/
├── apps/
│   ├── mobile/
│   └── web/
├── babel.config.cjs
├── docs/
├── eslint.config.cjs
├── eslint.config.js
├── gradient.py
├── gradient_env/
├── jest.comprehensive.config.js
├── jest.config.base.js
├── jest.config.cjs
├── jest.config.js
├── jest.monorepo.config.js
├── lighthouse.config.js
├── lighthouserc.json
├── log-fixed.txt
├── log.txt
├── logs/
├── missings.md
├── node_modules/
├── package.json
├── packages/
├── pawfectmatch-premium.code-workspace
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── prompt.md
├── quality-report.html
├── reports/
├── rules.md
├── scripts/
├── server/
├── suggestions.md
├── tests/
├── tsconfig.base.json
├── tsconfig.eslint.json
├── tsconfig.json
├── turbo.json
├── ultimate-todos.md
├── ultimateworkflow.md
├── ultra-test-report.html
├── web-document.md
└── web-enhancements.csv
```

### AI Service Directory
```
ai-service/
├── Dockerfile
├── app.py
├── deepseek_app.py
├── requirements.txt
└── [1 file]
```

### Apps Directory
```
apps/
├── mobile/
│   ├── .detoxrc.cjs
│   ├── .env.example
│   ├── .turbo/
│   ├── @types/
│   ├── App.tsx
│   ├── android/
│   ├── app.config.cjs
│   ├── app.json
│   ├── assets/
│   ├── babel.config.cjs
│   ├── detox.config.cjs
│   ├── docs/
│   ├── e2e/
│   ├── eas.json
│   ├── ios/
│   ├── jest.config.js
│   ├── metro.config.cjs
│   ├── scripts/
│   ├── src/
│   ├── tsconfig.base.json
│   ├── tsconfig.eslint.json
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── tsconfig.tsbuildinfo
└── web/
    ├── .babelrc
    ├── .env.local
    ├── .env.production
    ├── .next/
    ├── .storybook/
    ├── __tests__/
    ├── app/
    ├── component-patterns-report.json
    ├── components/
    ├── coverage/
    ├── cypress/
    ├── cypress.config.ts
    ├── e2e/
    ├── eslint.config.js
    ├── fix-all-imports.sh
    ├── fix-all-react-fc.sh
    ├── fix-react-types.sh
    ├── hooks/
    ├── jest.api.config.js
    ├── jest.config.enhanced.js
    ├── jest.config.js
    ├── jest.setup.js
    ├── jest.setup.ts
    ├── lib/
    ├── logs/
    ├── messages/
    ├── middleware.ts
    ├── next-env.d.ts
    ├── next.config.js
    ├── next.config.mjs
    ├── package-lock.json
    ├── package-standalone.json
    ├── package.json
    ├── playwright.config.ts
    ├── postcss.config.js
    ├── public/
    ├── scripts/
    ├── setupTests.js
    ├── src/
    ├── stores/
    ├── tailwind.config.js
    ├── tailwind.config.mjs
    ├── test/
    ├── test-all-pages.js
    ├── test-runner.html
    ├── tests/
    ├── tsconfig.base.json
    ├── tsconfig.e2e.json
    ├── tsconfig.eslint.json
    ├── tsconfig.json
    ├── tsconfig.test.json
    ├── tsconfig.tsbuildinfo
    ├── types/
    ├── ultra-deep-test-swipecardv2.js
    ├── verify-pwa.js
    ├── verify-ux-pack.js
    └── web-enhancements.csv
```

### Packages Directory
```
packages/
├── ai/
│   ├── src/
│   ├── eslint.config.js
│   ├── jest.config.js
│   ├── package.json
│   └── tsconfig.json
├── analytics/
│   └── src/
├── core/
│   ├── dist-cjs/
│   ├── packages/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── design-tokens/
│   ├── .rollup.cache/
│   ├── src/
│   ├── build.js
│   ├── package.json
│   └── tsconfig.json
├── security/
│   ├── src/
│   ├── eslint.config.js
│   ├── jest.config.js
│   ├── package.json
│   └── tsconfig.json
├── testing/
│   └── src/
├── tsconfig.json
└── ui/
    ├── src/
    ├── eslint.config.js
    ├── package.json
    └── tsconfig.json
```

### Server Directory
```
server/
├── .env.example
├── .env.production
├── .env.test
├── .turbo/
├── <p align="center">
├── ANALYTICS_API_DOCUMENTATION.md
├── Dockerfile
├── ENVIRONMENT_VARIABLES.md
├── __tests__/
├── babel.jest.config.cjs
├── database-connection.js
├── docs/
├── eslint.config.js
├── jest.config.js
├── models/
├── node_modules/
├── package.json
├── routes/
├── scripts/
├── server.js
├── services/
├── setup-admin.js
├── socket.js
├── src/
├── tests/
└── tsconfig.test.json
```

### Scripts Directory
```
scripts/
├── README-design-token-scanner.md
├── README_LOGGER_MIGRATION.md
├── analyze-bundles.js
├── tests/
└── [37 files]
```

### Tests Directory
```
tests/
├── e2e/
│   ├── fixtures/
│   ├── performance/
│   ├── LoginPage.page.js
│   └── [2 files]
└── [2 files]
```

### Docs Directory
```
docs/
├── api/
│   ├── README.md
│   └── swagger.yaml
├── security/
│   ├── SECURITY_ACTION_PLAN.md
│   ├── SECURITY_HARDENING_PLAN.md
│   └── secrets-scan.md
├── MISSING_ASSETS_RECOVERY_LIST.md
├── MODULE_SYSTEM.md
└── [7 files]
```

### Reports Directory
```
reports/
└── gitleaks-baseline.json
```

## Configuration Files - Full Contents

### Root Package.json
```json
{
  "name": "pawfectmatch-premium",
  "version": "1.0.1-rc.0",
  "type": "module",
  "description": "Premium pet matching platform with advanced features",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "start": "turbo run start",
    "lint": "turbo run lint -- --max-warnings 0",
    "lint:check": "turbo run lint -- --max-warnings 0",
    "lint:fix": "turbo run lint:fix && turbo run lint -- --max-warnings 0",
    "type-check": "turbo run type-check",
    "test": "turbo run test --",
    "test:coverage": "turbo run test -- --coverage",
    "test:e2e": "turbo run test:e2e",
    "test:a11y": "turbo run test:a11y",
    "format": "turbo run format",
    "format:check": "turbo run format:check",
    "quality:gate": "node scripts/quality-gate.js",
    "quality:report": "node scripts/quality-gate.js --report",
    "bundle:check": "turbo run bundle:check",
    "perf:check": "turbo run perf:check",
    "test:smoke": "turbo run test:smoke",
    "test:integration": "turbo run test:integration",
    "test:performance": "turbo run test:performance",
    "test:accessibility": "turbo run test:accessibility",
    "test:visual": "turbo run test:visual",
    "test:security": "turbo run test:security",
    "lighthouse": "lhci autorun",
    "bundle:analyze": "turbo run bundle:analyze",
    "bundle:compare": "node scripts/bundle-compare.js",
    "deps:audit": "pnpm audit",
    "deps:update": "pnpm update --latest",
    "code:quality": "pnpm run lint && pnpm run type-check && pnpm run format:check",
    "test:all": "pnpm run test:ci && pnpm run test:integration && pnpm run test:e2e",
    "security:audit": "pnpm audit --audit-level=moderate",
    "ci:full": "pnpm run code:quality && pnpm run test:all && pnpm run security:audit && pnpm run lighthouse",
    "deploy:validate": "node scripts/validate-deployment.cjs",
    "deploy:check": "pnpm run deploy:validate",
    "god-phase:complete": "echo '🎉 God-Phase Production Hardening Complete! All quality gates passed.'"
  },
  "devDependencies": {
    "@eslint/js": "^9.37.0",
    "@heroicons/react": "^2.2.0",
    "@jest/globals": "^29.7.0",
    "@next/eslint-plugin-next": "^14.2.33",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/react-hooks": "^8.0.1",
    "@testing-library/react-native": "^12.3.0",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.11.30",
    "@types/react-dom": "^18.2.0",
    "@types/validator": "^13.15.3",
    "@typescript-eslint/eslint-plugin": "^8.46.1",
    "@typescript-eslint/parser": "^8.46.1",
    "debug": "^4.4.3",
    "detox": "^20.0.0",
    "eslint": "^8.57.1",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-eslint-comments": "^3.2.0",
    "eslint-plugin-jsx-a11y": "^6.10.2",
    "eslint-plugin-react": "^7.37.2",
    "eslint-plugin-react-hooks": "^7.0.0",
    "gitleaks": "^1.0.0",
    "globals": "^16.4.0",
    "husky": "^8.0.3",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "jest-expo": "^51.0.0",
    "lint-staged": "^16.2.4",
    "msw": "^1.2.0",
    "prettier": "^3.6.2",
    "ts-jest": "^29.2.0",
    "turbo": "^2.3.3",
    "typescript-eslint": "^8.46.1",
    "whatwg-fetch": "^3.6.20"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.15.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/pawfectmatch-premium.git"
  },
  "keywords": [
    "pet",
    "matching",
    "premium",
    "typescript",
    "react",
    "mobile",
    "web"
  ],
  "author": "Your Organization",
  "license": "MIT",
  "pnpm": {
    "overrides": {
      "react": "18.2.0",
      "react-dom": "18.2.0",
      "@types/react": "18.2.0",
      "@types/react-dom": "18.2.0",
      "expect": "29.7.0",
      "@storybook/addon-docs": "8.6.14",
      "@storybook/blocks": "8.6.14",
      "@storybook/components": "8.6.14",
      "@storybook/manager-api": "8.6.14",
      "@storybook/preview-api": "8.6.14",
      "@storybook/react-dom-shim": "8.6.14",
      "@storybook/theming": "8.6.14",
      "@storybook/react": "8.6.14",
      "@storybook/test": "8.6.14",
      "storybook": "8.6.14",
      "react-test-renderer": "18.2.0",
      "form-data": "4.0.4",
      "dicer": "0.3.1",
      "semver": "7.5.4",
      "ip": "2.0.1",
      "lodash.set": "4.3.2",
      "got": "11.8.5",
      "tar": "6.2.1",
      "nanoid": "3.3.8",
      "esbuild": "0.25.0",
      "validator": "13.11.0",
      "send": "0.19.0",
      "cookie": "0.7.0",
      "jsdom": "22.1.0",
      "@auth/core": "0.18.1",
      "postcss": "8.5.6",
      "autoprefixer": "10.4.21"
    }
  },
  "resolutions": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@types/react": "18.2.0",
    "@types/react-dom": "18.2.0",
    "expect": "29.7.0",
    "@storybook/addon-docs": "8.6.14",
    "@storybook/blocks": "8.6.14",
    "@storybook/components": "8.6.14",
    "@storybook/manager-api": "8.6.14",
    "@storybook/preview-api": "8.6.14",
    "@storybook/react-dom-shim": "8.6.14",
    "@storybook/theming": "8.6.14",
    "@storybook/react": "8.6.14",
    "@storybook/test": "8.6.14",
    "storybook": "8.6.14",
    "react-test-renderer": "18.2.0"
  },
  "quality-gate": {
    "enabled": true,
    "checks": [
      "type-check",
      "lint-check",
      "format-check",
      "test-check",
      "security-check",
      "bundle-check",
      "performance-check",
      "accessibility-check",
      "dependency-check",
      "complexity-check"
    ],
    "thresholds": {
      "test-coverage": 80,
      "bundle-size": "2MB",
      "performance-score": 90,
      "accessibility-score": 95
    }
  },
  "dependencies": {
    "@simplewebauthn/server": "^13.2.2",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "react-native-reanimated": "^3.16.0",
    "tailwindcss": "^3.4.17"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix --max-warnings 0",
      "prettier --write"
    ],
    "*.{js,jsx}": [
      "eslint --fix --max-warnings 0",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

### Turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "dependsOn": ["^build"],
      "persistent": true
    },
    "start": {
      "cache": false,
      "dependsOn": ["build"],
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": [],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts", "test/**/*.tsx"]
    },
    "test:ci": {
      "dependsOn": ["^build"],
      "outputs": [],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts", "test/**/*.tsx"]
    },
    "test:critical": {
      "dependsOn": ["^build"],
      "outputs": [],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts", "test/**/*.tsx"]
    },
    "test:integration": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "lint:check": {
      "outputs": []
    },
    "lint:fix": {
      "outputs": []
    },
    "format": {
      "outputs": []
    },
    "format:check": {
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "bundle:check": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "perf:check": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "a11y:check": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "deps:check": {
      "outputs": []
    },
    "complexity:check": {
      "outputs": []
    },
    "analyze:bundle": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "clean": {
      "cache": false
    },
    "clean:all": {
      "cache": false
    },
    "@pawfectmatch/mobile#type-check": {
      "cache": false,
      "dependsOn": []
    }
  }
}
```

### Pnpm Workspace Configuration
```yaml
packages:
  - 'apps/*'
  - 'server'
  - 'ai-service'
  - 'packages/*'
```

### Root TypeScript Configuration
```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "composite": false,
    "declaration": false,
    "declarationMap": false,
    "tsBuildInfoFile": "./tsconfig.tsbuildinfo"
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "**/*.js",
    "**/*.jsx"
  ],
  "exclude": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.next/**",
    "**/.expo/**",
    "**/coverage/**",
    "**/*.config.js",
    "**/*.config.cjs",
    "**/*.config.mjs",
    "**/jest.config.js",
    "**/jest.config.cjs",
    "**/babel.config.cjs",
    "**/metro.config.cjs",
    "**/detox.config.cjs",
    "**/app.config.cjs",
    "**/next.config.js",
    "**/next.config.mjs",
    "**/tailwind.config.js",
    "**/tailwind.config.mjs",
    "**/postcss.config.js",
    "**/lighthouse.config.js",
    "**/.storybook/**"
  ]
}
```

### Base TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "checkJs": false,
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,
    "noEmitOnError": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": false,
    "noUncheckedIndexedAccess": false,
    "strict": true,
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": false,
    "incremental": true,
    "tsBuildInfoFile": "./tsconfig.tsbuildinfo"
  },
  "include": [
    "**/*.ts",
    "**/*.tsx"
  ],
  "exclude": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**"
  ]
}
```

### ESLint Base Configuration
```json
{
  "extends": [
    "@eslint/js/recommended",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.eslint.json"
  },
  "plugins": [
    "@typescript-eslint",
    "eslint-comments",
    "jsx-a11y",
    "react",
    "react-hooks"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/no-confusing-void-expression": "error",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/no-type-alias": "off",
    "@typescript-eslint/no-dynamic-delete": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/prefer-readonly-parameter-types": "off",
    "@typescript-eslint/prefer-regexp-exec": "error",
    "@typescript-eslint/prefer-string-starts-ends-with": "error",
    "@typescript-eslint/promise-function-async": "error",
    "@typescript-eslint/require-array-sort-compare": "error",
    "@typescript-eslint/restrict-plus-operands": "error",
    "@typescript-eslint/return-await": "error",
    "@typescript-eslint/strict-boolean-expressions": "error",
    "@typescript-eslint/triple-slash-reference": "error",
    "@typescript-eslint/unbound-method": "error",
    "@typescript-eslint/no-duplicate-enum-values": "error",
    "@typescript-eslint/no-duplicate-type-constituents": "error",
    "@typescript-eslint/no-meaningless-void-operator": "error",
    "@typescript-eslint/no-mixed-enums": "error",
    "@typescript-eslint/no-redundant-type-constituents": "error",
    "@typescript-eslint/no-type-alias": "off",
    "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
    "@typescript-eslint/no-unnecessary-condition": "error",
    "@typescript-eslint/no-unnecessary-qualifier": "error",
    "@typescript-eslint/no-unnecessary-type-arguments": "error",
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/no-unnecessary-type-constraint": "error",
    "@typescript-eslint/no-unsafe-argument": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "@typescript-eslint/no-unsafe-unary-minus": "error",
    "@typescript-eslint/prefer-as-const": "error",
    "@typescript-eslint/prefer-enum-initializers": "error",
    "@typescript-eslint/prefer-includes": "error",
    "@typescript-eslint/prefer-literal-enum-member": "error",
    "@typescript-eslint/prefer-namespace-keyword": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/prefer-readonly-parameter-types": "off",
    "@typescript-eslint/prefer-reduce-type-parameter": "error",
    "@typescript-eslint/prefer-regexp-exec": "error",
    "@typescript-eslint/prefer-return-this-type": "error",
    "@typescript-eslint/prefer-string-starts-ends-with": "error",
    "@typescript-eslint/prefer-ts-expect-error": "error",
    "@typescript-eslint/promise-function-async": "error",
    "@typescript-eslint/require-array-sort-compare": "error",
    "@typescript-eslint/restrict-plus-operands": "error",
    "@typescript-eslint/return-await": "error",
    "@typescript-eslint/strict-boolean-expressions": "error",
    "@typescript-eslint/triple-slash-reference": "error",
    "@typescript-eslint/unbound-method": "error",
    "eslint-comments/no-unused-disable": "error",
    "eslint-comments/require-description": "error",
    "jsx-a11y/accessible-emoji": "error",
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/anchor-has-content": "error",
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/aria-activedescendant-has-tabindex": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-proptypes": "error",
    "jsx-a11y/aria-role": "error",
    "jsx-a11y/aria-unsupported-elements": "error",
    "jsx-a11y/autocomplete-valid": "error",
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/control-has-associated-label": "error",
    "jsx-a11y/heading-has-content": "error",
    "jsx-a11y/html-has-lang": "error",
    "jsx-a11y/img-redundant-alt": "error",
    "jsx-a11y/interactive-supports-focus": "error",
    "jsx-a11y/label-has-associated-control": "error",
    "jsx-a11y/label-has-for": "off",
    "jsx-a11y/media-has-caption": "error",
    "jsx-a11y/mouse-events-have-key-events": "error",
    "jsx-a11y/no-access-key": "error",
    "jsx-a11y/no-autofocus": "error",
    "jsx-a11y/no-distracting-elements": "error",
    "jsx-a11y/no-interactive-element-to-noninteractive-role": "error",
    "jsx-a11y/no-noninteractive-element-interactions": "error",
    "jsx-a11y/no-noninteractive-element-to-interactive-role": "error",
    "jsx-a11y/no-noninteractive-tabindex": "error",
    "jsx-a11y/no-onchange": "error",
    "jsx-a11y/no-redundant-roles": "error",
    "jsx-a11y/no-static-element-interactions": "error",
    "jsx-a11y/role-has-required-aria-props": "error",
    "jsx-a11y/role-supports-aria-props": "error",
    "jsx-a11y/scope": "error",
    "jsx-a11y/tabindex-no-positive": "error",
    "react/display-name": "off",
    "react/jsx-key": "error",
    "react/jsx-no-comment-textnodes": "error",
    "react/jsx-no-duplicate-props": "error",
    "react/jsx-no-target-blank": "error",
    "react/jsx-no-undef": "error",
    "react/jsx-pascal-case": "error",
    "react/jsx-uses-react": "off",
    "react/jsx-uses-vars": "error",
    "react/no-children-prop": "error",
    "react/no-danger-with-children": "error",
    "react/no-deprecated": "error",
    "react/no-direct-mutation-state": "error",
    "react/no-find-dom-node": "error",
    "react/no-is-mounted": "error",
    "react/no-render-return-value": "error",
    "react/no-string-refs": "error",
    "react/no-unescaped-entities": "error",
    "react/no-unknown-property": "error",
    "react/no-unsafe": "off",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react/require-render-return": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
    "no-console": "warn",
    "no-debugger": "error",
    "no-alert": "error",
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    "no-script-url": "error",
    "no-sequences": "error",
    "no-throw-literal": "error",
    "no-unmodified-loop-condition": "error",
    "no-unused-labels": "error",
    "no-useless-call": "error",
    "no-useless-catch": "error",
    "no-useless-concat": "error",
    "no-useless-escape": "error",
    "no-useless-return": "error",
    "no-void": "error",
    "no-with": "error",
    "prefer-promise-reject-errors": "error",
    "require-await": "off",
    "no-floating-promises": "error",
    "no-return-await": "error"
  },
  "settings": {
    "react": {
      "version": "18.2.0"
    }
  }
}
```

### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "embeddedLanguageFormatting": "auto"
}
```

### Jest Base Configuration
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,tsx,js,jsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@pawfectmatch/(.*)$': '<rootDir>/packages/$1/src',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js|jsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx|js|jsx)',
    '<rootDir>/test/**/*.(test|spec).(ts|tsx|js|jsx)',
    '<rootDir>/tests/**/*.(test|spec).(ts|tsx|js|jsx)',
  ],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
  watchPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.test.json',
    },
  },
};
```

### Root Jest Configuration
```javascript
const baseConfig = require('./jest.config.base');

module.exports = {
  ...baseConfig,
  projects: [
    '<rootDir>/apps/*/jest.config.js',
    '<rootDir>/packages/*/jest.config.js',
    '<rootDir>/server/jest.config.js',
  ],
  collectCoverageFrom: [
    'apps/**/*.{ts,tsx,js,jsx}',
    'packages/**/*.{ts,tsx,js,jsx}',
    'server/**/*.{ts,tsx,js,jsx}',
    '!**/*.d.ts',
    '!**/*/index.{ts,tsx,js,jsx}',
    '!**/__tests__/**',
    '!**/__mocks__/**',
    '!**/dist/**',
    '!**/build/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Comprehensive Jest Configuration
```javascript
const baseConfig = require('./jest.config.base');

module.exports = {
  ...baseConfig,
  projects: [
    '<rootDir>/apps/mobile/jest.config.js',
    '<rootDir>/apps/web/jest.config.js',
    '<rootDir>/packages/ai/jest.config.js',
    '<rootDir>/packages/core/jest.config.js',
    '<rootDir>/packages/security/jest.config.js',
    '<rootDir>/packages/ui/jest.config.js',
    '<rootDir>/server/jest.config.js',
  ],
  collectCoverageFrom: [
    'apps/mobile/src/**/*.{ts,tsx}',
    'apps/web/src/**/*.{ts,tsx}',
    'packages/ai/src/**/*.{ts,tsx}',
    'packages/core/src/**/*.{ts,tsx}',
    'packages/security/src/**/*.{ts,tsx}',
    'packages/ui/src/**/*.{ts,tsx}',
    'server/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*/index.{ts,tsx}',
    '!**/__tests__/**',
    '!**/__mocks__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testResultsProcessor: './scripts/jest-results-processor.js',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'reports/junit',
        outputName: 'jest-junit.xml',
        suiteName: 'PawfectMatch Comprehensive Test Suite',
      },
    ],
  ],
};
```

### Monorepo Jest Configuration
```javascript
const baseConfig = require('./jest.config.base');

module.exports = {
  ...baseConfig,
  projects: [
    '<rootDir>/apps/mobile/jest.config.js',
    '<rootDir>/apps/web/jest.config.js',
    '<rootDir>/packages/ai/jest.config.js',
    '<rootDir>/packages/core/jest.config.js',
    '<rootDir>/packages/security/jest.config.js',
    '<rootDir>/packages/ui/jest.config.js',
    '<rootDir>/server/jest.config.js',
  ],
  collectCoverageFrom: [
    'apps/mobile/src/**/*.{ts,tsx}',
    'apps/web/src/**/*.{ts,tsx}',
    'packages/ai/src/**/*.{ts,tsx}',
    'packages/core/src/**/*.{ts,tsx}',
    'packages/security/src/**/*.{ts,tsx}',
    'packages/ui/src/**/*.{ts,tsx}',
    'server/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*/index.{ts,tsx}',
    '!**/__tests__/**',
    '!**/__mocks__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Babel Root Configuration
```javascript
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '20',
        },
        modules: 'commonjs',
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
  ],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
          },
        ],
      ],
    },
  },
};
```

### Lighthouse Configuration
```javascript
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: 'pnpm dev',
      startServerReadyPattern: 'ready - started server on',
      url: ['http://localhost:3000'],
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['error', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### Lighthouserc Configuration
```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "pnpm dev",
      "startServerReadyPattern": "ready - started server on",
      "url": [
        "http://localhost:3000"
      ]
    },
    "assert": {
      "assertions": {
        "categories:performance": [
          "error",
          {
            "minScore": 0.9
          }
        ],
        "categories:accessibility": [
          "error",
          {
            "minScore": 0.95
          }
        ],
        "categories:best-practices": [
          "error",
          {
            "minScore": 0.9
          }
        ],
        "categories:seo": [
          "error",
          {
            "minScore": 0.9
          }
        ],
        "categories:pwa": [
          "error",
          {
            "minScore": 0.8
          }
        ]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### GitLeaks Configuration
```toml
title = "gitleaks config"

[extend]
# useDefault will extend the base configuration with the default gitleaks config
useDefault = true

[allowlist]
description = "global allow lists"
paths = [
    '''\.env\.example$''',
    '''\.env\.production$''',
    '''\.env\.local$''',
    '''node_modules''',
    '''\.git''',
    '''coverage''',
    '''dist''',
    '''build''',
    '''\.next''',
    '''\.expo''',
    '''android''',
    '''ios''',
    '''reports''',
    '''logs''',
]

# Rules for secrets that should be allowed (test keys, example keys, etc.)
[[rules]]
id = "test-keys"
description = "Test API keys and tokens"
regex = '''(?i)test[_-]?key|dummy[_-]?key|example[_-]?key|fake[_-]?key|mock[_-]?key'''
path = '''\.env\.example$'''

[[rules]]
id = "placeholder-secrets"
description = "Placeholder secrets in example files"
regex = '''YOUR[_-].*[_-]KEY|PLACEHOLDER|EXAMPLE|REPLACE[_-].*'''
path = '''\.env\.example$'''

[[rules]]
id = "common-test-tokens"
description = "Common test tokens and API keys"
regex = '''sk_test_|pk_test_|test_token|demo_token'''
path = '''\.env\.example$'''

[[rules]]
id = "documentation-secrets"
description = "Secrets in documentation files"
regex = '''.*'''
path = '''.*\.md$'''

[[rules]]
id = "test-files"
description = "Test files with mock data"
regex = '''.*'''
paths = [
    '''__tests__''',
    '''__mocks__''',
    '''\.test\.''',
    '''\.spec\.''',
]

[[rules]]
id = "config-files"
description = "Configuration files"
regex = '''.*'''
paths = [
    '''jest\.config\..*''',
    '''babel\.config\..*''',
    '''webpack\.config\..*''',
    '''next\.config\..*''',
    '''tailwind\.config\..*''',
    '''postcss\.config\..*''',
    '''metro\.config\..*''',
    '''detox\.config\..*''',
    '''app\.config\..*''',
    '''eas\.json''',
]
```

### Root ESLint Configuration
```javascript
const baseConfig = require('./eslint.config.cjs');

module.exports = {
  ...baseConfig,
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.next/',
    '.expo/',
    'coverage/',
    'reports/',
    '**/*.config.js',
    '**/*.config.cjs',
    '**/*.config.mjs',
    '**/*.config.ts',
    '**/*.config.tsx',
    'jest.config.js',
    'jest.config.cjs',
    'babel.config.cjs',
    'metro.config.cjs',
    'detox.config.cjs',
    'app.config.cjs',
    'next.config.js',
    'next.config.mjs',
    'tailwind.config.js',
    'tailwind.config.mjs',
    'postcss.config.js',
    'lighthouse.config.js',
    '.storybook/',
    'public/',
    'android/',
    'ios/',
    'scripts/',
    'docs/',
    'reports/',
    'logs/',
    'gradient.py',
    'gradient_env/',
    'pawfectmatch-premium.code-workspace',
    'quality-report.html',
    'ultra-test-report.html',
    'test-runner.html',
    'log-fixed.txt',
    'log.txt',
    'ultimate-todos.md',
    'ultimateworkflow.md',
    'web-document.md',
    'prompt.md',
    'rules.md',
    'suggestions.md',
    'missings.md',
    'docyment1.md',
    'document.md',
    'document2.md',
    'document3.md',
    'Cat_and_Dog_Video_Generation.mp4',
  ],
};
```

### ESLint CJS Configuration
```javascript
module.exports = {
  extends: [
    '@eslint/js/recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.eslint.json',
  },
  plugins: [
    '@typescript-eslint',
    'eslint-comments',
    'jsx-a11y',
    'react',
    'react-hooks',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/no-confusing-void-expression': 'error',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-type-alias': 'off',
    '@typescript-eslint/no-dynamic-delete': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    '@typescript-eslint/prefer-regexp-exec': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/promise-function-async': 'error',
    '@typescript-eslint/require-array-sort-compare': 'error',
    '@typescript-eslint/restrict-plus-operands': 'error',
    '@typescript-eslint/return-await': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/triple-slash-reference': 'error',
    '@typescript-eslint/unbound-method': 'error',
    '@typescript-eslint/no-duplicate-enum-values': 'error',
    '@typescript-eslint/no-duplicate-type-constituents': 'error',
    '@typescript-eslint/no-meaningless-void-operator': 'error',
    '@typescript-eslint/no-mixed-enums': 'error',
    '@typescript-eslint/no-redundant-type-constituents': 'error',
    '@typescript-eslint/no-type-alias': 'off',
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
    '@typescript-eslint/no-unnecessary-condition': 'error',
    '@typescript-eslint/no-unnecessary-qualifier': 'error',
    '@typescript-eslint/no-unnecessary-type-arguments': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-unnecessary-type-constraint': 'error',
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/no-unsafe-unary-minus': 'error',
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/prefer-enum-initializers': 'error',
    '@typescript-eslint/prefer-includes': 'error',
    '@typescript-eslint/prefer-literal-enum-member': 'error',
    '@typescript-eslint/prefer-namespace-keyword': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    '@typescript-eslint/prefer-reduce-type-parameter': 'error',
    '@typescript-eslint/prefer-regexp-exec': 'error',
    '@typescript-eslint/prefer-return-this-type': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/prefer-ts-expect-error': 'error',
    '@typescript-eslint/promise-function-async': 'error',
    '@typescript-eslint/require-array-sort-compare': 'error',
    '@typescript-eslint/restrict-plus-operands': 'error',
    '@typescript-eslint/return-await': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/triple-slash-reference': 'error',
    '@typescript-eslint/unbound-method': 'error',
    'eslint-comments/no-unused-disable': 'error',
    'eslint-comments/require-description': 'error',
    'jsx-a11y/accessible-emoji': 'error',
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/autocomplete-valid': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/control-has-associated-label': 'error',
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/html-has-lang': 'error',
    'jsx-a11y/img-redundant-alt': 'error',
    'jsx-a11y/interactive-supports-focus': 'error',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/label-has-for': 'off',
    'jsx-a11y/media-has-caption': 'error',
    'jsx-a11y/mouse-events-have-key-events': 'error',
    'jsx-a11y/no-access-key': 'error',
    'jsx-a11y/no-autofocus': 'error',
    'jsx-a11y/no-distracting-elements': 'error',
    'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
    'jsx-a11y/no-noninteractive-element-interactions': 'error',
    'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
    'jsx-a11y/no-noninteractive-tabindex': 'error',
    'jsx-a11y/no-onchange': 'error',
    'jsx-a11y/no-redundant-roles': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
    'jsx-a11y/scope': 'error',
    'jsx-a11y/tabindex-no-positive': 'error',
    'react/display-name': 'off',
    'react/jsx-key': 'error',
    'react/jsx-no-comment-textnodes': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-target-blank': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-pascal-case': 'error',
    'react/jsx-uses-react': 'off',
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
    'react/no-unsafe': 'off',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/require-render-return': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unused-labels': 'error',
    'no-useless-call': 'error',
    'no-useless-catch': 'error',
    'no-useless-concat': 'error',
    'no-useless-escape': 'error',
    'no-useless-return': 'error',
    'no-void': 'error',
    'no-with': 'error',
    'prefer-promise-reject-errors': 'error',
    'require-await': 'off',
    'no-floating-promises': 'error',
    'no-return-await': 'error',
  },
  settings: {
    react: {
      version: '18.2.0',
    },
  },
};
```

## Mobile App Configuration Files

### Mobile App Package.json
```json
{
  "name": "@pawfectmatch/mobile",
  "version": "1.0.0",
  "type": "module",
  "main": "App.tsx",
  "scripts": {
    "start": "expo start",
    "dev": "expo start --dev-client",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "build": "expo export",
    "build:dev": "eas build --platform all --profile development",
    "build:preview": "eas build --platform all --profile preview",
    "build:production": "eas build --platform all --profile production",
    "build:android": "eas build --platform android --profile production",
    "build:android-apk": "eas build --platform android --profile production-apk",
    "build:ios": "eas build --platform ios --profile production",
    "submit:android": "eas submit --platform android",
    "submit:ios": "eas submit --platform ios",
    "submit:all": "eas submit --platform all",
    "update": "eas update",
    "update:production": "eas update --branch production",
    "clean": "rm -rf dist node_modules/.cache .expo",
    "clean:all": "rm -rf dist node_modules/.cache .expo node_modules",
    "reset": "npx expo install --fix && npm run clean",
    "lint": "eslint src --max-warnings 0",
    "lint:check": "eslint src --max-warnings 0",
    "lint:fix": "eslint src --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --coverage --watchAll=false",
    "test:critical": "jest --testPathPatterns=\"(critical|integration)\" --ci --watchAll=false",
    "test:e2e": "detox test --configuration ios.sim.debug",
    "test:e2e:android": "detox test --configuration android.emu.debug",
    "test:e2e:build": "detox build --configuration ios.sim.debug",
    "test:e2e:build:android": "detox build --configuration android.emu.debug",
    "test:integration": "jest --testPathPatterns=\"integration\" --ci --watchAll=false",
    "test:accessibility": "jest --testPathPatterns=\"a11y\" --ci --watchAll=false",
    "test:comprehensive": "jest --testPathPatterns=\"comprehensive\" --ci --watchAll=false",
    "test:performance": "jest --testPathPatterns=\"performance\" --ci --watchAll=false",
    "test:security": "jest --testPathPatterns=\"security\" --ci --watchAll=false",
    "test:unit": "jest --testPathPatterns='(?!integration|performance|security|a11y|comprehensive)' --ci --watchAll=false",
    "test:all": "jest --ci --watchAll=false --coverage",
    "test:suite": "../../scripts/test-mobile.sh",
    "bundle:check": "echo 'Bundle check not applicable for mobile app'",
    "perf:check": "echo 'Performance check not applicable for mobile app'",
    "a11y:check": "echo 'Accessibility check not applicable for mobile app'",
    "deps:check": "npm audit --audit-level moderate",
    "complexity:check": "echo 'Complexity check not implemented'",
    "bundle:analyze": "node scripts/bundle-analyzer.js",
    "prebuild": "expo prebuild",
    "prebuild:clean": "expo prebuild --clean"
  },
  "dependencies": {
    "@babel/runtime": "^7.28.4",
    "@expo/vector-icons": "^13.0.0",
    "@pawfectmatch/core": "workspace:*",
    "@pawfectmatch/design-tokens": "workspace:*",
    "@react-native-async-storage/async-storage": "1.18.2",
    "@react-native-community/blur": "^4.4.1",
    "@react-native-community/geolocation": "^3.4.0",
    "@react-native-community/netinfo": "^9.3.10",
    "@react-native-community/slider": "^4.4.2",
    "@react-native-picker/picker": "^2.4.10",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.17",
    "@react-navigation/stack": "^6.3.20",
    "@sentry/react-native": "^7.4.0",
    "@tanstack/react-query": "^5.90.5",
    "axios": "^1.12.2",
    "expo": "^49.0.21",
    "expo-av": "~13.4.1",
    "expo-blur": "~12.4.1",
    "expo-camera": "~13.4.4",
    "expo-constants": "~14.4.2",
    "expo-device": "~5.4.0",
    "expo-file-system": "~15.4.5",
    "expo-font": "~11.4.0",
    "expo-gl": "~13.0.1",
    "expo-haptics": "~12.4.0",
    "expo-image-manipulator": "~11.3.0",
    "expo-image-picker": "~14.3.2",
    "expo-linear-gradient": "~12.3.0",
    "expo-local-authentication": "~13.4.1",
    "expo-location": "~16.1.0",
    "expo-notifications": "~0.20.1",
    "expo-secure-store": "~12.3.1",
    "expo-splash-screen": "~0.20.5",
    "expo-status-bar": "~1.6.0",
    "form-data": "^4.0.4",
    "gzip-size": "^7.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-native": "0.72.10",
    "react-native-aes-crypto": "^3.2.1",
    "react-native-encrypted-storage": "^4.0.3",
    "react-native-fast-image": "^8.6.3",
    "react-native-gesture-handler": "^2.12.1",
    "react-native-incall-manager": "^4.2.1",
    "react-native-keychain": "^10.0.0",
    "react-native-linear-gradient": "^2.8.3",
    "react-native-maps": "^1.7.1",
    "react-native-modal": "^13.0.1",
    "react-native-permissions": "^4.1.1",
    "react-native-push-notification": "^8.1.1",
    "react-native-reanimated": "~3.3.0",
    "react-native-safe-area-context": "4.6.3",
    "react-native-screen-capture": "^0.2.3",
    "react-native-screen-recorder": "^1.0.6",
    "react-native-screens": "~3.22.1",
    "react-native-ssl-pinning": "^1.6.0",
    "react-native-svg": "13.9.0",
    "react-native-vector-icons": "^10.3.0",
    "react-native-web": "~0.19.6",
    "react-native-webrtc": "^124.0.7",
    "semver": "^7.5.2",
    "socket.io-client": "^4.8.1",
    "zod": "^4.1.12",
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@babel/core": "^7.28.4",
    "@babel/plugin-proposal-export-namespace-from": "^7.18.9",
    "@babel/plugin-transform-react-jsx": "^7.27.1",
    "@babel/plugin-transform-typescript": "^7.28.0",
    "@babel/preset-typescript": "^7.27.1",
    "@expo/ngrok": "^4.1.3",
    "@testing-library/jest-native": "^5.4.3",
    "@testing-library/react-hooks": "^8.0.1",
    "@testing-library/react-native": "^13.3.3",
    "@types/gzip-size": "^5.1.1",
    "@types/jest": "^29.5.0",
    "@types/react": "18.2.79",
    "@types/react-dom": "18.0.11",
    "@types/react-native": "~0.72.0",
    "@types/react-native-push-notification": "^8.1.4",
    "babel-preset-expo": "~9.5.2",
    "detox": "^20.11.4",
    "eas-cli": "^5.9.1",
    "identity-obj-proxy": "^3.0.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "jest-expo": "~49.0.0",
    "metro-react-native-babel-transformer": "^0.76.8",
    "react-test-renderer": "18.2.0",
    "typescript": "^5.1.3"
  },
  "private": true
}
```

### Mobile App.json
```json
{
  "expo": {
    "name": "PawfectMatch",
    "slug": "pawfectmatch",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.pawfectmatch.mobile",
      "buildNumber": "1.0.0"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.pawfectmatch.mobile",
      "versionCode": 1,
      "permissions": [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.CAMERA",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS",
        "android.permission.VIBRATE",
        "android.permission.WAKE_LOCK",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.POST_NOTIFICATIONS"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "buildToolsVersion": "34.0.0"
          },
          "ios": {
            "deploymentTarget": "13.4"
          }
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Allow PawfectMatch to access your camera to take photos and videos of your pets.",
          "microphonePermission": "Allow PawfectMatch to access your microphone for video calls and recordings.",
          "recordAudioAndroid": true
        }
      ],
      [
        "expo-media-library",
        {
          "photosPermission": "Allow PawfectMatch to access your photos to share pet pictures.",
          "savePhotosPermission": "Allow PawfectMatch to save photos to your device.",
          "isAccessMediaLocationEnabled": true
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#FF6B6B",
          "defaultChannel": "default",
          "sounds": [
            "./assets/notification-sound.wav"
          ]
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow PawfectMatch to access your location to find nearby pet services and matches."
        }
      ]
    ],
    "scheme": "pawfectmatch",
    "extra": {
      "eas": {
        "projectId": "pawfectmatch-mobile"
      }
    }
  }
}
```

### EAS Configuration
```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "channel": "production"
    },
    "production-apk": {
      "extends": "production",
      "buildType": "apk"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account-key.json",
        "track": "internal"
      }
    }
  }
}
```

### Mobile Metro Configuration
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
  '@pawfectmatch/core': path.resolve(__dirname, '../../packages/core/src'),
  '@pawfectmatch/design-tokens': path.resolve(__dirname, '../../packages/design-tokens/src'),
  '@pawfectmatch/ui': path.resolve(__dirname, '../../packages/ui/src'),
};

config.resolver.extraNodeModules = {
  'react': path.resolve(__dirname, 'node_modules/react'),
  'react-native': path.resolve(__dirname, 'node_modules/react-native'),
};

module.exports = config;
```

### Mobile Babel Configuration
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@pawfectmatch/core': '../../packages/core/src',
            '@pawfectmatch/design-tokens': '../../packages/design-tokens/src',
            '@pawfectmatch/ui': '../../packages/ui/src',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
```

### Mobile App Configuration CJS
```javascript
module.exports = {
  expo: {
    name: 'PawfectMatch',
    slug: 'pawfectmatch',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.pawfectmatch.mobile',
      buildNumber: '1.0.0',
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.pawfectmatch.mobile',
      versionCode: 1,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
      permissions: [
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.CAMERA',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.RECORD_AUDIO',
        'android.permission.MODIFY_AUDIO_SETTINGS',
        'android.permission.VIBRATE',
        'android.permission.WAKE_LOCK',
        'android.permission.FOREGROUND_SERVICE',
        'android.permission.POST_NOTIFICATIONS',
      ],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: '34.0.0',
            kotlinVersion: '1.8.0',
          },
          ios: {
            deploymentTarget: '13.4',
            useFrameworks: 'static',
          },
        },
      ],
      [
        'expo-camera',
        {
          cameraPermission:
            'Allow PawfectMatch to access your camera to take photos and videos of your pets.',
          microphonePermission:
            'Allow PawfectMatch to access your microphone for video calls and recordings.',
          recordAudioAndroid: true,
        },
      ],
      [
        'expo-media-library',
        {
          photosPermission:
            'Allow PawfectMatch to access your photos to share pet pictures.',
          savePhotosPermission:
            'Allow PawfectMatch to save photos to your device.',
          isAccessMediaLocationEnabled: true,
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#FF6B6B',
          defaultChannel: 'default',
          sounds: ['./assets/notification-sound.wav'],
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Allow PawfectMatch to access your location to find nearby pet services and matches.',
        },
      ],
      [
        'expo-secure-store',
        {
          faceIDPermission:
            'Allow PawfectMatch to use Face ID to securely access your account.',
        },
      ],
    ],
    scheme: 'pawfectmatch',
    extra: {
      eas: {
        projectId: 'pawfectmatch-mobile',
      },
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001',
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    },
  },
};
```

### Mobile Detox Configuration
```javascript
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: './e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.sim.debug': {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14',
      },
      build: 'xcodebuild -workspace ios/PawfectMatch.xcworkspace -scheme PawfectMatch -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'ios.sim.release': {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14',
      },
      build: 'xcodebuild -workspace ios/PawfectMatch.xcworkspace -scheme PawfectMatch -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.emu.debug': {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_5_API_33',
      },
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      testBinaryPath: 'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
    },
    'android.emu.release': {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_5_API_33',
      },
      build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      testBinaryPath: 'android/app/build/outputs/apk/androidTest/release/app-release-androidTest.apk',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_5_API_33',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.sim.debug',
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.sim.release',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.emu.debug',
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.emu.release',
    },
  },
};
```

### Mobile Detox RC Configuration
```javascript
module.exports = {
  testRunner: 'jest',
  runnerConfig: './e2e/jest.config.js',
  skipLegacyWorkersInjection: true,
  apps: {
    'ios.sim.debug': {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14',
      },
      build: 'xcodebuild -workspace ios/PawfectMatch.xcworkspace -scheme PawfectMatch -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'ios.sim.release': {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14',
      },
      build: 'xcodebuild -workspace ios/PawfectMatch.xcworkspace -scheme PawfectMatch -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.emu.debug': {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_5_API_33',
      },
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      testBinaryPath: 'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
    },
    'android.emu.release': {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_5_API_33',
      },
      build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      testBinaryPath: 'android/app/build/outputs/apk/androidTest/release/app-release-androidTest.apk',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_5_API_33',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.sim.debug',
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.sim.release',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.emu.debug',
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.emu.release',
    },
  },
};
```

### Mobile Jest Configuration
```javascript
const baseConfig = require('../../jest.config.base');

module.exports = {
  ...baseConfig,
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.ts',
    '@testing-library/jest-native/extend-expect',
  ],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))',
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@pawfectmatch/core': '<rootDir>/../../packages/core/src',
    '^@pawfectmatch/design-tokens': '<rootDir>/../../packages/design-tokens/src',
    '^@pawfectmatch/ui': '<rootDir>/../../packages/ui/src',
    '^\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js|jsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx|js|jsx)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/**/types/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
    '/.expo/',
    '/coverage/',
  ],
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
    '/.expo/',
    '/coverage/',
  ],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.test.json',
    },
  },
};
```

### Mobile TypeScript Configuration
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": false,
    "declaration": false,
    "declarationMap": false,
    "tsBuildInfoFile": "./tsconfig.tsbuildinfo",
    "lib": ["ES2022"],
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "resolveJsonModule": true,
    "allowJs": true,
    "noEmit": true,
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@pawfectmatch/core": ["../../packages/core/src"],
      "@pawfectmatch/design-tokens": ["../../packages/design-tokens/src"],
      "@pawfectmatch/ui": ["../../packages/ui/src"]
    },
    "types": ["jest", "@types/jest", "node", "react-native"],
    "typeRoots": ["./node_modules/@types", "../../node_modules/@types"]
  },
  "include": [
    "src/**/*",
    "**/*.ts",
    "**/*.tsx",
    "App.tsx",
    "jest.setup.ts",
    "../../packages/core/src/**/*.ts",
    "../../packages/design-tokens/src/**/*.ts",
    "../../packages/ui/src/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "android",
    "ios",
    ".expo",
    "dist",
    "build",
    "coverage",
    "**/*.config.js",
    "**/*.config.cjs",
    "**/*.config.mjs",
    "jest.config.js",
    "babel.config.cjs",
    "metro.config.cjs",
    "detox.config.cjs",
    "app.config.cjs",
    "next.config.js",
    "next.config.mjs",
    "tailwind.config.js",
    "tailwind.config.mjs",
    "postcss.config.js"
  ]
}
```

### Mobile TypeScript Base Configuration
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": false,
    "declaration": false,
    "declarationMap": false,
    "tsBuildInfoFile": "./tsconfig.tsbuildinfo",
    "lib": ["ES2022"],
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "resolveJsonModule": true,
    "allowJs": true,
    "noEmit": true,
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@pawfectmatch/core": ["../../packages/core/src"],
      "@pawfectmatch/design-tokens": ["../../packages/design-tokens/src"],
      "@pawfectmatch/ui": ["../../packages/ui/src"]
    },
    "types": ["jest", "@types/jest", "node", "react-native"],
    "typeRoots": ["./node_modules/@types", "../../node_modules/@types"]
  },
  "include": [
    "src/**/*",
    "**/*.ts",
    "**/*.tsx",
    "App.tsx",
    "jest.setup.ts",
    "../../packages/core/src/**/*.ts",
    "../../packages/design-tokens/src/**/*.ts",
    "../../packages/ui/src/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "android",
    "ios",
    ".expo",
    "dist",
    "build",
    "coverage",
    "**/*.config.js",
    "**/*.config.cjs",
    "**/*.config.mjs",
    "jest.config.js",
    "babel.config.cjs",
    "metro.config.cjs",
    "detox.config.cjs",
    "app.config.cjs",
    "next.config.js",
    "next.config.mjs",
    "tailwind.config.js",
    "tailwind.config.mjs",
    "postcss.config.js"
  ]
}
```

### Mobile TypeScript ESLint Configuration
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": false,
    "declaration": false,
    "declarationMap": false,
    "tsBuildInfoFile": "./tsconfig.tsbuildinfo",
    "lib": ["ES2022"],
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "resolveJsonModule": true,
    "allowJs": true,
    "noEmit": true,
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@pawfectmatch/core": ["../../packages/core/src"],
      "@pawfectmatch/design-tokens": ["../../packages/design-tokens/src"],
      "@pawfectmatch/ui": ["../../packages/ui/src"]
    },
    "types": ["jest", "@types/jest", "node", "react-native"],
    "typeRoots": ["./node_modules/@types", "../../node_modules/@types"]
  },
  "include": [
    "src/**/*",
    "**/*.ts",
    "**/*.tsx",
    "App.tsx",
    "jest.setup.ts",
    "../../packages/core/src/**/*.ts",
    "../../packages/design-tokens/src/**/*.ts",
    "../../packages/ui/src/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "android",
    "ios",
    ".expo",
    "dist",
    "build",
    "coverage",
    "**/*.config.js",
    "**/*.config.cjs",
    "**/*.config.mjs",
    "jest.config.js",
    "babel.config.cjs",
    "metro.config.cjs",
    "detox.config.cjs",
    "app.config.cjs",
    "next.config.js",
    "next.config.mjs",
    "tailwind.config.js",
    "tailwind.config.mjs",
    "postcss.config.js"
  ]
}
```

### Mobile TypeScript Test Configuration
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "composite": false,
    "declaration": false,
    "declarationMap": false,
    "tsBuildInfoFile": "./tsconfig.tsbuildinfo",
    "types": ["jest", "@types/jest", "node", "react-native", "detox"],
    "typeRoots": ["./node_modules/@types", "../../node_modules/@types"]
  },
  "include": [
    "src/**/*",
    "**/*.ts",
    "**/*.tsx",
    "App.tsx",
    "jest.setup.ts",
    "e2e/**/*",
    "../../packages/core/src/**/*.ts",
    "../../packages/design-tokens/src/**/*.ts",
    "../../packages/ui/src/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "android",
    "ios",
    ".expo",
    "dist",
    "build",
    "coverage",
    "**/*.config.js",
    "**/*.config.cjs",
    "**/*.config.mjs",
    "jest.config.js",
    "babel.config.cjs",
    "metro.config.cjs",
    "detox.config.cjs",
    "app.config.cjs",
    "next.config.js",
    "next.config.mjs",
    "tailwind.config.js",
    "tailwind.config.mjs",
    "postcss.config.js"
  ]
}
```

## Quality Assurance Summary

This PawfectMatch monorepo is configured with:

### **Quality Gates**
- **Type Checking**: 100% strict TypeScript with no `any` types
- **Linting**: Zero warnings with comprehensive ESLint rules
- **Testing**: 80%+ coverage with unit, integration, and E2E tests
- **Security**: Automated secret scanning and dependency auditing
- **Performance**: Lighthouse CI with accessibility and performance checks
- **Bundle Analysis**: Automated bundle size monitoring

### **Build & Deployment**
- **Turbo Monorepo**: Optimized build pipeline with caching
- **Multi-platform**: Web (Next.js), Mobile (Expo), Server (Node.js), AI (Python)
- **Containerized**: Docker support for all services
- **CI/CD Ready**: GitHub Actions workflows for automated testing and deployment

### **Development Experience**
- **Hot Reloading**: Fast development with instant feedback
- **Code Quality**: Automated formatting, linting, and type checking
- **Testing**: Comprehensive test suites with visual regression testing
- **Documentation**: Extensive inline documentation and API docs

### **Production Ready Features**
- **Security**: JWT authentication, rate limiting, CORS, helmet
- **Monitoring**: Comprehensive logging and error tracking
- **Scalability**: Redis caching, database optimization
- **Reliability**: Error boundaries, retry logic, graceful degradation

This configuration ensures a production-ready, maintainable, and scalable codebase for the PawfectMatch premium pet matching platform.

---

*Generated on October 24, 2025 - Complete Configuration & Directory Structure Snapshot*

```snapshot
# -------- ROOT (configs you want frozen) ----------
package.json
pnpm-workspace.yaml
turbo.json
tsconfig.base.json
tsconfig.json
tsconfig.eslint.json
eslint.config.cjs
eslint.config.js
.prettierrc
babel.config.cjs
jest.config.base.js
jest.config.js
jest.comprehensive.config.js
jest.monorepo.config.js
lighthouse.config.js
lighthouserc.json
.gitleaks.toml
.husky/pre-commit
.github/workflows/strict-prod.yml
.github/workflows/resign-config-lock.yml
.sops.yaml

# -------- WEB APP ----------
apps/web/.babelrc
apps/web/cypress.config.ts
apps/web/playwright.config.ts
apps/web/eslint.config.js
apps/web/jest.api.config.js
apps/web/jest.config.enhanced.js
apps/web/jest.config.js
apps/web/jest.setup.js
apps/web/jest.setup.ts
apps/web/next.config.js
apps/web/next.config.mjs
apps/web/postcss.config.js
apps/web/tailwind.config.js
apps/web/tailwind.config.mjs
apps/web/tsconfig.base.json
apps/web/tsconfig.e2e.json
apps/web/tsconfig.eslint.json
apps/web/tsconfig.json
apps/web/tsconfig.test.json
apps/web/middleware.ts
apps/web/.env.production.enc

# -------- MOBILE APP ----------
apps/mobile/.detoxrc.cjs
apps/mobile/app.config.cjs
apps/mobile/app.json
apps/mobile/babel.config.cjs
apps/mobile/detox.config.cjs
apps/mobile/eas.json
apps/mobile/jest.config.js
apps/mobile/metro.config.cjs
apps/mobile/tsconfig.base.json
apps/mobile/tsconfig.eslint.json
apps/mobile/tsconfig.json
apps/mobile/tsconfig.test.json
apps/mobile/.env.production.enc

# -------- SERVER ----------
server/Dockerfile
server/babel.jest.config.cjs
server/eslint.config.js
server/jest.config.js
server/tsconfig.test.json
server/.env.production.enc

# -------- AI SERVICE ----------
ai-service/Dockerfile
ai-service/requirements.txt
ai-service/.env.production.enc

# -------- PACKAGES ----------
packages/tsconfig.json
packages/ai/eslint.config.js
packages/ai/jest.config.js
packages/ai/tsconfig.json
packages/core/tsconfig.json
packages/design-tokens/build.js
packages/design-tokens/tsconfig.json
packages/ui/eslint.config.js
packages/ui/tsconfig.json
```
```
