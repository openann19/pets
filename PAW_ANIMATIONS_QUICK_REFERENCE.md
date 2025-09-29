# 🐾 Paw Animations - Quick Reference Guide

## 🚀 Quick Start

### Import
```tsx
import LoadingSpinner from '@/components/UI/LoadingSpinner';
```

### Basic Usage
```tsx
<LoadingSpinner />
```

## 📐 Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size variant |
| `color` | `string` | `'#3B82F6'` | Hex color code |
| `className` | `string` | `undefined` | Additional CSS classes |

## 🎨 Common Patterns

### Full Page Loading
```tsx
<div className="min-h-screen flex items-center justify-center">
  <LoadingSpinner size="large" color="#9333EA" />
</div>
```

### Inline Loading
```tsx
<div className="flex items-center gap-2">
  <LoadingSpinner size="small" color="#EC4899" />
  <span>Loading pets...</span>
</div>
```

### Button Loading
```tsx
<PremiumButton loading={isSubmitting}>
  Submit
</PremiumButton>
```

### Conditional Rendering
```tsx
{isLoading && <LoadingSpinner size="medium" />}
```

## 🎨 Color Palette

| Color | Hex | Use Case |
|-------|-----|----------|
| Pink | `#EC4899` | Primary brand, pets, matches |
| Purple | `#9333EA` | Premium features, analytics |
| Blue | `#3B82F6` | AI features, technical |
| White | `#ffffff` | Dark backgrounds |
| Green | `#10B981` | Success states |

## 📏 Size Guide

| Size | Pixels | Use Case |
|------|--------|----------|
| Small | 24px | Inline, buttons, compact spaces |
| Medium | 40px | Cards, modals, standard loading |
| Large | 60px | Full page, splash screens |

## 🔍 Troubleshooting

### Hydration Error
**Problem**: Console shows hydration mismatch
**Solution**: Already fixed with `suppressHydrationWarning`

### Animation Not Smooth
**Problem**: Choppy 30fps animation
**Solution**: Check GPU acceleration, reduce concurrent animations

### Wrong Color
**Problem**: Paws not visible on background
**Solution**: Use contrasting color (`color="#ffffff"` for dark BG)

### Too Large/Small
**Problem**: Size doesn't fit context
**Solution**: Use appropriate size prop or custom className

## ✅ Best Practices

### DO ✓
- Use semantic loading states
- Match colors to context
- Provide descriptive text nearby
- Consider dark mode
- Test on real devices

### DON'T ✗
- Use without fallback loading state
- Ignore accessibility (ARIA labels)
- Animate excessively (battery drain)
- Block critical content unnecessarily
- Forget to test hydration

## 🧪 Testing

### Unit Test Example
```tsx
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

test('renders with custom color', () => {
  const { container } = render(<LoadingSpinner color="#EC4899" />);
  const svg = container.querySelector('svg');
  expect(svg).toHaveAttribute('fill', '#EC4899');
});
```

### E2E Test Example
```tsx
cy.visit('/page-with-loading');
cy.get('[data-testid="loading-spinner"]').should('be.visible');
```

## 📦 Components Using Paw Animations

| Component | Location | Size | Color |
|-----------|----------|------|-------|
| LoadingSpinner | `src/components/UI/` | Variable | Variable |
| PremiumButton | `src/components/UI/` | Small | White |
| Analytics Page | `app/(protected)/analytics/` | Large | Purple |
| SwipeStack | `src/components/Pet/` | Small | Pink |
| MapView | `src/components/Map/` | Large | Pink |
| AIMapFeatures | `src/components/Map/` | Small | Blue |
| VideoCallRoom | `src/components/VideoCall/` | Large | White |
| HydrationBoundary | `src/components/` | Large | Purple |

## 🔗 Related Files

- **Component**: `src/components/UI/LoadingSpinner.tsx`
- **Tests**: `src/components/UI/__tests__/PawAnimations.test.tsx`
- **Integration**: `src/__tests__/paw-animations-integration.test.tsx`
- **E2E**: `cypress/e2e/paw-animations.cy.ts`
- **Demo**: `app/test-paws/page.tsx`

## 📞 Support

### Common Questions

**Q: Can I use multiple spinners on one page?**
A: Yes, they're optimized for multiple instances.

**Q: Does it work with SSR?**
A: Yes, fully compatible with Next.js SSR.

**Q: Is it accessible?**
A: Yes, includes ARIA labels and screen reader support.

**Q: What about performance?**
A: GPU-accelerated, 60fps, minimal bundle impact (~2KB).

**Q: Can I customize the animation?**
A: Currently no, but size and color are customizable.

## 🐾 Animation Details

### Timing
- **Duration**: 1.5s per cycle
- **Delay Pattern**: 0s → 0.3s → 0.6s
- **Easing**: `easeInOut`
- **Repeat**: Infinite

### Transform
- **Opacity**: Fade 0 → 1 → 1 → 0
- **Scale**: Pulse 0.5 → 1 → 1 → 0.5
- **Position**: Fixed (no translation)

### Layout
```
┌──────────────┐
│   L  C  R    │  L=Left, C=Center, R=Right
│   🐾 🐾 🐾   │  Three paw prints
│              │  Staggered animation
└──────────────┘
```

## 💡 Pro Tips

1. **Loading Text**: Always pair with descriptive text
2. **Color Contrast**: Ensure 4.5:1 contrast ratio
3. **Loading Time**: Show after 200-300ms delay
4. **Skeleton Loaders**: Consider for content-specific loading
5. **Error States**: Always handle failed loads

## 🎯 Quick Commands

```bash
# Run tests
npm test LoadingSpinner

# E2E tests
npm run cy:run

# View demo
npm run dev
# Visit: http://localhost:3000/test-paws

# Build
npm run build
```

---

**Need help?** Check `/PAW_ANIMATIONS_COMPLETE.md` for full documentation.
