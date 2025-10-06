# Unified Design System Documentation

## Overview
The Unified Design System provides consistent visual design and interaction patterns across both web and mobile platforms in PawfectMatch.

## Design Tokens

### Colors
```typescript
// Primary Brand Colors
primary: {
  50: '#fdf2f8',
  100: '#fce7f3',
  200: '#fbcfe8',
  300: '#f9a8d4',
  400: '#f472b6',
  500: '#ec4899', // Main brand color
  600: '#db2777',
  700: '#be185d',
  800: '#9d174d',
  900: '#831843',
  950: '#500724'
}

// Secondary Colors
secondary: {
  50: '#f0f9ff',
  100: '#e0f2fe',
  200: '#bae6fd',
  300: '#7dd3fc',
  400: '#38bdf8',
  500: '#0ea5e9', // Secondary brand color
  600: '#0284c7',
  700: '#0369a1',
  800: '#075985',
  900: '#0c4a6e',
  950: '#082f49'
}

// Semantic Colors
success: '#10b981',
warning: '#f59e0b',
error: '#ef4444',
info: '#3b82f6'
```

### Typography
```typescript
// Font Sizes
text: {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem'
}

// Font Weights
font: {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700
}
```

### Spacing & Layout
```typescript
// Spacing Scale
spacing: {
  0: '0px',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem'
}

// Border Radius
radius: {
  sm: '0.25rem',
  base: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
  full: '9999px'
}
```

## Components

### UnifiedPremiumButton
A highly customizable button component with unified styling across platforms.

**Features:**
- Dynamic validation states
- Multiple variants (primary, secondary, glass, outline)
- Multiple sizes (sm, md, lg, xl)
- Loading states with animations
- Haptic and sound feedback
- Magnetic effect
- Particle animations
- WCAG 2.1 AA compliant

**Usage:**
```tsx
<UnifiedPremiumButton
  variant="primary"
  size="lg"
  loading={isLoading}
  isValid={formIsValid}
  glow
  onClick={handleSubmit}
>
  Create Account
</UnifiedPremiumButton>
```

### UnifiedPremiumInput
A consistent input component with validation states and visual feedback.

**Features:**
- Multiple variants (default, glass, outline)
- Multiple sizes (sm, md, lg)
- Validation states (error, success)
- Icon support
- Focus animations
- Accessible error messages

**Usage:**
```tsx
<UnifiedPremiumInput
  label="Email Address"
  placeholder="Enter your email"
  value={email}
  onChange={setEmail}
  type="email"
  variant="glass"
  error={emailError}
  required
/>
```

## Animation System

### Transitions
```typescript
transitions: {
  fast: { duration: 0.15, ease: 'easeOut' },
  medium: { duration: 0.3, ease: 'easeOut' },
  slow: { duration: 0.5, ease: 'easeOut' },
  spring: { type: 'spring', stiffness: 300, damping: 30 }
}
```

### Micro-interactions
- Button press: Scale down 0.98
- Button hover: Scale up 1.02
- Input focus: Scale up 1.01
- Icon hover: Rotate ±10 degrees

## Responsive Design

### Breakpoints
```css
sm: 640px    /* Mobile */
md: 768px    /* Tablet */
lg: 1024px   /* Desktop */
xl: 1280px   /* Large Desktop */
```

### Mobile-First Approach
- All components are mobile-optimized by default
- Use fluid typography and spacing
- Minimum touch target: 44px × 44px
- Responsive font sizes using clamp()

## Accessibility (WCAG 2.1 AA)

### Color Contrast
- Text contrast: ≥ 4.5:1
- Large text contrast: ≥ 3:1
- Interactive elements: ≥ 3:1

### Focus Management
- Visible focus indicators
- Logical tab order
- Skip navigation links
- ARIA labels for screen readers

### Screen Reader Support
- Semantic HTML structure
- Descriptive ARIA labels
- Live regions for dynamic content
- Proper heading hierarchy

## Implementation Guidelines

### 1. Use Design Tokens
Always use design tokens instead of hardcoded values:
```tsx
// ✅ Good
className="bg-primary-500 text-white"

// ❌ Bad
className="bg-[#ec4899] text-[#ffffff]"
```

### 2. Consistent Spacing
Use the spacing scale for consistent layouts:
```tsx
// ✅ Good
className="p-4 m-2"

// ❌ Bad
className="p-[16px] m-[8px]"
```

### 3. Responsive Design
Implement mobile-first responsive design:
```tsx
// ✅ Good
className="text-sm md:text-base lg:text-lg"

// ❌ Bad
className="text-[14px] desktop:text-[16px]"
```

### 4. Accessibility First
Always consider accessibility:
```tsx
// ✅ Good
<button aria-label="Close menu">×</button>

// ❌ Bad
<div onClick={handleClose}>×</div>
```

## Testing

### Visual Regression
- Use snapshot testing for components
- Test across different screen sizes
- Verify color contrast ratios
- Check focus management

### Interaction Testing
- Test keyboard navigation
- Verify screen reader compatibility
- Test touch interactions on mobile
- Validate form validation states

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile 90+)
