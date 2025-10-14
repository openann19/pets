# React 19 Migration Guide

## Breaking Changes Summary

### 1. React.FC No Longer Includes Implicit Children

**Before (React 18):**
```tsx
const MyComponent: React.FC<{ title: string }> = ({ title, children }) => {
  return <div>{title}{children}</div>;
};
```

**After (React 19):**
```tsx
// Option A: Inline props (Recommended)
const MyComponent = ({ title, children }: { 
  title: string; 
  children?: React.ReactNode 
}): JSX.Element => {
  return <div>{title}{children}</div>;
};

// Option B: Interface with explicit children
interface MyComponentProps {
  title: string;
  children?: React.ReactNode;
}

const MyComponent = ({ title, children }: MyComponentProps): JSX.Element => {
  return <div>{title}{children}</div>;
};
```

### 2. Files That Need Updating

Run this command to find all React.FC usage:
```bash
grep -r "React.FC" src/ --include="*.tsx" --include="*.ts"
```

**Files to fix:**
1. `src/components/admin/UIEnhancements.tsx` - 9 components
2. `src/app/(protected)/map/page.tsx` - 1 component
3. Any other files found by the grep command

### 3. Automated Fix Script

Run the provided script:
```bash
chmod +x fix-react-types.sh
./fix-react-types.sh
```

Or manually fix each component using the pattern above.

### 4. Manual Fix Steps

For each component:

1. **Remove React.FC type:**
   ```tsx
   // BEFORE
   export const MyComponent: React.FC<Props> = (props) => {
   ```
   
   ```tsx
   // AFTER
   export const MyComponent = (props: Props): JSX.Element => {
   ```

2. **Add explicit children to Props if needed:**
   ```tsx
   interface Props {
     title: string;
     children?: React.ReactNode; // Add this if component uses children
   }
   ```

3. **Add return type:**
   ```tsx
   const MyComponent = (props: Props): JSX.Element => {
     // ^^ Add explicit return type
   ```

### 5. Testing Changes

After fixing:
```bash
# Type check
pnpm run type-check

# Run tests
pnpm run test:compat

# Lint check
pnpm run lint

# Build check
pnpm run build
```

### 6. Peer Dependency Warnings

Some packages haven't updated to React 19 yet. These warnings are **non-blocking**:
- `@stripe/react-stripe-js` - works with React 19
- `react-leaflet` - works with React 19

To suppress warnings, add to `package.json`:
```json
{
  "pnpm": {
    "peerDependencyRules": {
      "ignoreMissing": [
        "react@^18.0.0"
      ]
    }
  }
}
```

## Quick Fix Commands

```bash
# 1. Analyze patterns
pnpm run analyze:patterns

# 2. Run automated fix
./fix-react-types.sh

# 3. Verify fixes
pnpm run type-check
pnpm run lint:fix

# 4. Test
pnpm run test:compat
```

## Common Patterns to Replace

### Pattern 1: Simple Component
```tsx
// OLD
const Button: React.FC<{ label: string }> = ({ label }) => <button>{label}</button>;

// NEW
const Button = ({ label }: { label: string }): JSX.Element => <button>{label}</button>;
```

### Pattern 2: Component with Children
```tsx
// OLD
const Card: React.FC<{ title: string }> = ({ title, children }) => (
  <div><h2>{title}</h2>{children}</div>
);

// NEW
const Card = ({ title, children }: { 
  title: string; 
  children?: React.ReactNode 
}): JSX.Element => (
  <div><h2>{title}</h2>{children}</div>
);
```

### Pattern 3: With Props Interface
```tsx
// OLD
interface ButtonProps {
  label: string;
  onClick: () => void;
}
const Button: React.FC<ButtonProps> = ({ label, onClick }) => (
  <button onClick={onClick}>{label}</button>
);

// NEW
interface ButtonProps {
  label: string;
  onClick: () => void;
}
const Button = ({ label, onClick }: ButtonProps): JSX.Element => (
  <button onClick={onClick}>{label}</button>
);
```

## References

- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [React.FC Changes](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/function_components/)
