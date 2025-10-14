# Dependency Migration Guide - 2025 Modernization

This guide covers the migration from legacy dependencies to their latest 2025 versions.

## Overview

### Major Version Updates

| Package | Old Version | New Version | Breaking Changes |
|---------|-------------|-------------|------------------|
| React | 18.2.0 | 19.0.0 | ✅ Yes |
| React DOM | 18.2.0 | 19.0.0 | ✅ Yes |
| Next.js | 15.1.0 | 15.1.3 | ⚠️ Minor |
| React Native | 0.73.6 | 0.76.5 | ✅ Yes |
| Expo SDK | ~54.0.13 | ~52.0.11 | ✅ Yes |
| React Navigation | 6.x | 7.x | ✅ Yes |
| TypeScript | 5.3.0 | 5.7.2 | ⚠️ Minor |
| ESLint | 8.54.0 | 9.17.0 | ✅ Yes |
| Jest | 29.7.0 | 30.0.0-alpha.6 | ✅ Yes |
| Framer Motion | 10.18.0 | 11.15.0 | ✅ Yes |
| Turbo | 1.11.0 | 2.3.3 | ✅ Yes |

---

## React 19 Migration

### Key Breaking Changes

#### 1. **Automatic Batching Improvements**
React 19 extends automatic batching to all updates, including those in promises, timeouts, and native event handlers.

**Before (React 18):**
```tsx
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // Two separate re-renders
}, 1000);
```

**After (React 19):**
```tsx
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // Single batched re-render automatically
}, 1000);
```

#### 2. **New `use` Hook**
React 19 introduces the `use` hook for reading resources like Promises and Context.

```tsx
import { use } from 'react';

function Component({ dataPromise }) {
  const data = use(dataPromise);
  return <div>{data.name}</div>;
}
```

#### 3. **Server Components & Actions**
Enhanced support for Server Components and Server Actions (Next.js integration).

```tsx
// app/actions.ts
'use server';

export async function createPet(formData: FormData) {
  const name = formData.get('name');
  // Server-side logic
  return { success: true };
}

// app/components/PetForm.tsx
'use client';

import { createPet } from '../actions';

export function PetForm() {
  return (
    <form action={createPet}>
      <input name="name" />
      <button type="submit">Create</button>
    </form>
  );
}
```

#### 4. **Ref as Prop**
No more `forwardRef` needed in many cases.

**Before:**
```tsx
const Input = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});
```

**After:**
```tsx
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

#### 5. **Context as Prop**
Simplified Context API usage.

**Before:**
```tsx
<Context.Provider value={value}>
  <Component />
</Context.Provider>
```

**After:**
```tsx
<Context value={value}>
  <Component />
</Context>
```

### Migration Steps

1. **Update Dependencies**
   ```bash
   pnpm update react@19.0.0 react-dom@19.0.0
   pnpm update @types/react@19.0.1 @types/react-dom@19.0.1
   ```

2. **Remove Deprecated Patterns**
   - Replace `ReactDOM.render` with `createRoot` (if not already done)
   - Update `forwardRef` usage where applicable
   - Review and update Context providers

3. **Test Thoroughly**
   - Run full test suite
   - Check for console warnings
   - Verify SSR/SSG pages in Next.js

---

## Next.js 15.1.3 Migration

### Key Changes

#### 1. **Turbopack Stability**
Turbopack is now stable for development mode.

```js
// next.config.js
module.exports = {
  experimental: {
    turbo: {
      // Turbopack configuration
    }
  }
};
```

#### 2. **Enhanced Caching**
Improved caching strategies for better performance.

```tsx
// app/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 }
  });
  return <div>{/* ... */}</div>;
}
```

#### 3. **Metadata API Enhancements**
Better SEO and metadata handling.

```tsx
// app/layout.tsx
export const metadata = {
  title: {
    template: '%s | PawfectMatch',
    default: 'PawfectMatch - Find Your Pet\'s Perfect Match'
  },
  description: 'Premium pet matching platform',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pawfectmatch.com',
    siteName: 'PawfectMatch'
  }
};
```

### Migration Steps

1. **Update Next.js**
   ```bash
   pnpm update next@15.1.3 eslint-config-next@15.1.3
   ```

2. **Review Configuration**
   - Check `next.config.js` for deprecated options
   - Update middleware if using experimental features

3. **Test Build**
   ```bash
   pnpm run build
   pnpm run start
   ```

---

## React Native 0.76.5 & Expo 52 Migration

### Key Changes

#### 1. **New Architecture Enabled by Default**
The new architecture (Fabric + TurboModules) is now the default.

```js
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "newArchEnabled": true
          },
          "ios": {
            "newArchEnabled": true
          }
        }
      ]
    ]
  }
}
```

#### 2. **Bridgeless Mode**
Improved performance with bridgeless architecture.

#### 3. **Updated Metro Bundler**
Enhanced bundling and faster builds.

### Migration Steps

1. **Update Dependencies**
   ```bash
   pnpm update react-native@0.76.5 expo@~52.0.11
   ```

2. **Update Native Modules**
   ```bash
   cd apps/mobile
   npx expo install --fix
   ```

3. **Rebuild Native Code**
   ```bash
   pnpm run prebuild:clean
   pnpm run android
   pnpm run ios
   ```

---

## React Navigation 7 Migration

### Key Changes

#### 1. **TypeScript-First Design**
Better type safety out of the box.

```tsx
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

function ProfileScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  // ...
}
```

#### 2. **Improved Performance**
Optimized rendering and navigation transitions.

#### 3. **Enhanced Deep Linking**
Better support for universal links and deep links.

```tsx
const linking = {
  prefixes: ['pawfectmatch://', 'https://pawfectmatch.com'],
  config: {
    screens: {
      Home: '',
      Profile: 'profile/:userId',
      Match: 'match/:matchId'
    }
  }
};
```

### Migration Steps

1. **Update Dependencies**
   ```bash
   pnpm update @react-navigation/native@7.0.13
   pnpm update @react-navigation/native-stack@7.2.0
   pnpm update @react-navigation/bottom-tabs@7.2.0
   ```

2. **Update Type Definitions**
   - Review and update navigation type definitions
   - Ensure all screens have proper TypeScript types

3. **Test Navigation**
   - Verify all navigation flows
   - Test deep linking
   - Check screen transitions

---

## ESLint 9 Migration

### Key Changes

#### 1. **Flat Config Format**
New configuration format (eslint.config.js).

**Before (eslintrc.js):**
```js
module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    'no-console': 'warn'
  }
};
```

**After (eslint.config.js):**
```js
import nextPlugin from '@next/eslint-plugin-next';

export default [
  {
    plugins: {
      '@next/next': nextPlugin
    },
    rules: {
      'no-console': 'warn'
    }
  }
];
```

#### 2. **Removed Rules**
Some deprecated rules have been removed.

### Migration Steps

1. **Update ESLint**
   ```bash
   pnpm update eslint@9.17.0
   ```

2. **Migrate Configuration**
   - Convert `.eslintrc.js` to `eslint.config.js`
   - Update plugin imports
   - Review and update rules

3. **Run Linter**
   ```bash
   pnpm run lint:check
   ```

---

## Jest 30 Migration

### Key Changes

#### 1. **Native ESM Support**
Better support for ES modules.

```js
// jest.config.js
export default {
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true
    }]
  }
};
```

#### 2. **Improved Performance**
Faster test execution and better parallelization.

#### 3. **Enhanced Snapshot Testing**
Better snapshot diffing and updates.

### Migration Steps

1. **Update Jest**
   ```bash
   pnpm update jest@30.0.0-alpha.6
   pnpm update @types/jest@29.5.14
   pnpm update ts-jest@29.2.5
   ```

2. **Update Configuration**
   - Review `jest.config.js`
   - Update transform configuration
   - Check module resolution

3. **Run Tests**
   ```bash
   pnpm run test
   ```

---

## Framer Motion 11 Migration

### Key Changes

#### 1. **Improved Performance**
Optimized animations and reduced bundle size.

#### 2. **New Animation Features**
Enhanced animation capabilities.

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.8 }}
  transition={{
    type: 'spring',
    stiffness: 400,
    damping: 25
  }}
>
  Content
</motion.div>
```

### Migration Steps

1. **Update Framer Motion**
   ```bash
   pnpm update framer-motion@11.15.0
   ```

2. **Review Animations**
   - Check for deprecated animation properties
   - Test all animated components

---

## Common Issues & Solutions

### Issue 1: Type Errors After React 19 Update

**Problem:** TypeScript errors related to component props.

**Solution:**
```tsx
// Update component prop types
interface Props {
  children: React.ReactNode; // Use ReactNode instead of ReactChild
  ref?: React.Ref<HTMLDivElement>; // Explicit ref typing
}
```

### Issue 2: ESLint Flat Config Migration

**Problem:** ESLint configuration not working.

**Solution:**
1. Create `eslint.config.js` (not `.eslintrc.js`)
2. Use ES module syntax
3. Import plugins correctly

### Issue 3: Jest ESM Issues

**Problem:** Jest failing to import ES modules.

**Solution:**
```js
// jest.config.js
export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};
```

### Issue 4: React Native New Architecture

**Problem:** Native modules not working with new architecture.

**Solution:**
1. Check module compatibility
2. Update to compatible versions
3. Rebuild native code:
   ```bash
   cd android && ./gradlew clean
   cd ios && pod install --repo-update
   ```

---

## Post-Migration Checklist

- [ ] All dependencies updated
- [ ] TypeScript compilation successful
- [ ] ESLint passes without errors
- [ ] All tests passing
- [ ] Web app builds successfully
- [ ] Mobile app builds for iOS
- [ ] Mobile app builds for Android
- [ ] No console warnings in development
- [ ] Performance metrics acceptable
- [ ] Accessibility tests passing
- [ ] Security audit clean
- [ ] Documentation updated

---

## Rollback Plan

If issues arise, rollback steps:

1. **Revert package.json changes**
   ```bash
   git checkout HEAD -- package.json apps/*/package.json
   ```

2. **Reinstall dependencies**
   ```bash
   pnpm install
   ```

3. **Clear caches**
   ```bash
   pnpm run clean:all
   ```

4. **Rebuild**
   ```bash
   pnpm run build
   ```

---

## Additional Resources

- [React 19 Release Notes](https://react.dev/blog/2024/04/25/react-19)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React Native 0.76 Changelog](https://reactnative.dev/blog)
- [Expo SDK 52 Release](https://expo.dev/changelog)
- [React Navigation 7 Docs](https://reactnavigation.org/docs/getting-started)
- [ESLint 9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
- [Jest 30 Changelog](https://jestjs.io/blog)

---

## Support

For issues or questions:
1. Check the [GitHub Issues](https://github.com/your-org/pawfectmatch-premium/issues)
2. Review the [Troubleshooting Guide](./TROUBLESHOOTING.md)
3. Contact the development team

---

**Last Updated:** January 2025
**Migration Status:** In Progress
**Target Completion:** Q1 2025
