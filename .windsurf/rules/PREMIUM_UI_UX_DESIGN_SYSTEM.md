---
trigger: manual
description:
globs:
---

## 📱 Mobile-First Approach

### Screen Size Strategy
```typescript
// Responsive breakpoints (mobile-first)
const BREAKPOINTS = {
  xs: '375px',    // Small phones
  sm: '640px',    // Large phones
  md: '768px',    // Tablets
  lg: '1024px',   // Small laptops
  xl: '1280px',   // Desktops
  '2xl': '1536px' // Large screens
};
```

### Touch Target Standards
```css
/* Minimum touch targets - 44px (iOS) / 48dp (Android) */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px; /* Ensures comfortable touch area */
}

/* Gesture-friendly spacing */
.gesture-area {
  padding: 16px; /* Prevents accidental touches */
  margin: 8px;   /* Clear separation between elements */
}
```

### Mobile Navigation Patterns
- **Bottom Navigation** - Primary actions at thumb level
- **Hamburger Menu** - Secondary navigation (web only)
- **Swipe Gestures** - Natural mobile interactions
- **Pull-to-Refresh** - Familiar mobile patterns

---

## 🧩 Component Architecture

### Current Premium Components Analysis

#### 1. PremiumButton Component
```typescript
// Advanced button with premium effects
interface PremiumButtonProps {
  variant: 'primary' | 'secondary' | 'glass' | 'holographic' | 'neon';
  size: 'sm' | 'md' | 'lg';
  haptic?: boolean;        // Mobile haptic feedback
  magneticEffect?: boolean; // Advanced interaction
  glow?: boolean;          // Premium visual effects
  loading?: boolean;       // Loading states
}
```

**Key Features:**
- Haptic feedback integration
- Magnetic mouse tracking
- Spring physics animations
- Multiple premium variants
- Sound feedback system
- Ripple effects

#### 2. PremiumCard Component
```typescript
// Glass morphism with 3D effects
interface PremiumCardProps {
  variant: 'glass' | 'elevated' | 'gradient' | 'holographic';
  tilt?: boolean;          // 3D perspective effects
  glow?: boolean;          // Dynamic glow effects
  shimmer?: boolean;       // Premium shimmer animation
  magnetic?: boolean;      // Interactive magnetic effects
}
```

**Key Features:**
- Advanced glass morphism
- 3D tilt interactions
- Multiple entrance animations
- Shimmer and glow effects
- Backdrop blur optimization

#### 3. SwipeCard (Mobile)
```typescript
// Professional mobile swipe component
interface SwipeCardProps {
  onSwipeLeft: (pet: Pet) => void;
  onSwipeRight: (pet: Pet) => void;
  onSwipeUp: (pet: Pet) => void;
  haptic?: boolean;        // Haptic feedback
  accessibility?: boolean; // Screen reader support
}
```

**Key Features:**
- Gesture-based interactions
- Haptic feedback integration
- Accessibility support
- Photo carousel navigation
- Real-time swipe overlays
- Performance optimized

---

## 🎨 Color System

### Current Color Palette Analysis
```typescript
// Comprehensive color system
export const COLORS = {
  primary: {
    500: '#ec4899',  // Pink - Brand primary
    600: '#db2777',  // Darker pink
  },
  secondary: {
    500: '#a855f7',  // Purple - Brand secondary
    600: '#9333ea',  // Darker purple
  },
  neutral: {
    0: '#ffffff',    // Pure white
    900: '#171717',  // Near black
  }
};
```

### Premium Gradients
```css
/* Sophisticated gradient system */
.premium-gradient {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
}

.mesh-gradient {
  background: linear-gradient(135deg, 
    #667eea 0%, #764ba2 25%, #f093fb 50%, 
    #f5576c 75%, #4facfe 100%);
  background-size: 400% 400%;
  animation: holographic 4s ease infinite;
}

.glass-morphism {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

### Color Usage Guidelines
- **Primary (Pink)** - Main actions, CTAs, active states
- **Secondary (Purple)** - Secondary actions, accents
- **Neutral** - Text, backgrounds, borders
- **Gradients** - Premium features, special states
- **Glass Effects** - Cards, modals, overlays

---

## ✍️ Typography & Spacing

### Font System
```css
/* Professional typography */
:root {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-display: swap; /* Performance optimization */
}

/* Typography scale */
.text-xs { font-size: 0.75rem; line-height: 1rem; }    /* 12px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; } /* 14px */
.text-base { font-size: 1rem; line-height: 1.5rem; }    /* 16px */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; } /* 18px */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }  /* 20px */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }     /* 24px */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; } /* 30px */
```

### Spacing System
```css
/* Consistent spacing scale */
.spacing-1 { margin: 0.25rem; }  /* 4px */
.spacing-2 { margin: 0.5rem; }   /* 8px */
.spacing-3 { margin: 0.75rem; }  /* 12px */
.spacing-4 { margin: 1rem; }     /* 16px */
.spacing-6 { margin: 1.5rem; }   /* 24px */
.spacing-8 { margin: 2rem; }     /* 32px */
```

### Content Hierarchy
1. **H1** - Page titles (2.5rem, bold)
2. **H2** - Section headers (2rem, semibold)
3. **H3** - Subsection headers (1.5rem, semibold)
4. **Body** - Main content (1rem, regular)
5. **Caption** - Secondary text (0.875rem, regular)

---

## 🎬 Animation & Motion

### Current Animation System Analysis
```typescript
// Professional animation system
export const SPRING_CONFIGS = {
  gentle: { stiffness: 300, damping: 30, mass: 0.8 },
  standard: { stiffness: 400, damping: 25, mass: 1 },
  bouncy: { stiffness: 500, damping: 20, mass: 0.8 },
  snappy: { stiffness: 600, damping: 30, mass: 0.6 },
};
```

### Animation Principles
1. **Spring Physics** - Natural, bouncy movements
2. **Staggered Animations** - Sequential element reveals
3. **Micro-Interactions** - Subtle feedback for every action
4. **Performance First** - 60fps, GPU-accelerated animations
5. **Accessibility** - Respect `prefers-reduced-motion`

### Animation Guidelines
```css
/* ✅ EXCELLENT: Performance-optimized animations */
.animate-float {
  animation: float 3s ease-in-out infinite;
  will-change: transform; /* GPU acceleration */
}

.animate-shimmer {
  background: linear-gradient(90deg, 
    transparent, rgba(255, 255, 255, 0.4), transparent);
  background-size: 200% 100%;
  animation: shimmer 2s linear infinite;
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  .animate-float,
  .animate-shimmer {
    animation: none;
  }
}
```

---

## ♿ Accessibility Standards

### WCAG 2.1 AA Compliance
```typescript
// ✅ EXCELLENT: Accessibility-first approach
interface AccessibilityProps {
  'aria-label': string;
  'aria-describedby'?: string;
  'role'?: string;
  'tabIndex'?: number;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
}
```

### Color Contrast Requirements
- **Normal Text**: 4.5:1 minimum contrast ratio
- **Large Text**: 3:1 minimum contrast ratio
- **Interactive Elements**: 3:1 minimum contrast ratio
- **Focus Indicators**: 3:1 minimum contrast ratio

### Touch Accessibility
```css
/* ✅ EXCELLENT: Touch-friendly design */
.touch-accessible {
  min-height: 44px;        /* iOS minimum */
  min-width: 44px;         /* iOS minimum */
  padding: 12px;           /* Comfortable touch area */
  margin: 8px;             /* Prevents accidental touches */
}

/* Focus indicators */
.focus-visible {
  outline: 2px solid rgba(59, 130, 246, 0.9);
  outline-offset: 2px;
  border-radius: 4px;
}
```

### Screen Reader Support
```typescript
// ✅ EXCELLENT: Comprehensive ARIA support
<button
  aria-label="Like this pet profile"
  aria-describedby="pet-info"
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
>
  <HeartIcon aria-hidden="true" />
</button>
```

---

## 📐 Responsive Design

### Breakpoint Strategy
```css
/* ✅ EXCELLENT: Mobile-first responsive design */
.container {
  width: 100%;
  padding: 1rem;
}

@media (min-width: 640px) {
  .container {
    padding: 1.5rem;
  }
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
    max-width: 768px;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}
```

### Grid System
```css
/* ✅ EXCELLENT: Flexible grid system */
.grid-responsive {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .grid-responsive {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .grid-responsive {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}
```

### Image Optimization
```typescript
// ✅ EXCELLENT: Responsive image handling
<Image
  src={petPhoto}
  alt={`${petName} profile photo`}
  width={400}
  height={600}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  priority={isTopCard}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

---

## 👆 Touch Interactions

### Gesture Support
```typescript
// ✅ EXCELLENT: Comprehensive gesture handling
const panResponder = PanResponder.create({
  onMoveShouldSetPanResponder: (evt, gestureState) => {
    return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
  },
  onPanResponderMove: (evt, gestureState) => {
    // Real-time gesture feedback
    updateSwipeOverlay(gestureState.dx, gestureState.dy);
  },
  onPanResponderRelease: (evt, gestureState) => {
    // Process swipe direction and trigger actions
    processSwipe(gestureState.dx, gestureState.dy);
  },
});
```

### Haptic Feedback
```typescript
// ✅ EXCELLENT: Platform-specific haptic feedback
const triggerHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy') => {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle[intensity]);
  } else if (Platform.OS === 'android') {
    // Android haptic feedback implementation
  }
}, []);
```

### Touch Target Optimization
- **Minimum Size**: 44px × 44px (iOS) / 48dp × 48dp (Android)
- **Spacing**: 8px minimum between touch targets
- **Visual Feedback**: Immediate response to touch
- **Error Prevention**: Confirmation for destructive actions

---

## ✨ Micro-Interactions

### Button Interactions
```typescript
// ✅ EXCELLENT: Premium button micro-interactions
<motion.button
  whileHover={{
    scale: 1.02,
    y: -2,
    rotateY: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }}
  whileTap={{
    scale: 0.98,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }}
  onMouseEnter={() => triggerSound('hover')}
  onClick={() => triggerHaptic('medium')}
>
```

### Loading States
```typescript
// ✅ EXCELLENT: Engaging loading animations
<motion.div
  className="loading-spinner"
  animate={{ rotate: 360 }}
  transition={{
    duration: 1,
    repeat: Infinity,
    ease: "linear"
  }}
>
  <SparklesIcon className="w-6 h-6 text-purple-500" />
</motion.div>
```

### Success Feedback
```typescript
// ✅ EXCELLENT: Delightful success animations
<motion.div
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0, opacity: 0 }}
  className="success-badge"
>
  <CheckIcon className="w-6 h-6 text-green-500" />
  <span>Match!</span>
</motion.div>
```

---

## ⚡ Performance Optimization

### Animation Performance
```css
/* ✅ EXCELLENT: GPU-accelerated animations */
.animate-gpu {
  will-change: transform, opacity;
  transform: translateZ(0); /* Force GPU layer */
  backface-visibility: hidden;
}

/* Optimized transitions */
.transition-optimized {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}
```

### Image Optimization
```typescript
// ✅ EXCELLENT: Advanced image optimization
const OptimizedImage = ({ src, alt, ...props }) => (
  <Image
    src={src}
    alt={alt}
    loading="lazy"
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    {...props}
  />
);
```

### Bundle Optimization
- **Code Splitting** - Lazy load components
- **Tree Shaking** - Remove unused code
- **Image Compression** - WebP format with fallbacks
- **Font Optimization** - `font-display: swap`

---

## 🧪 Testing & Quality Assurance

### Visual Regression Testing
```typescript
// ✅ EXCELLENT: Comprehensive visual testing
describe('PremiumButton Visual Tests', () => {
  it('should render primary variant correctly', () => {
    cy.get('[data-testid="premium-button"]')
      .should('be.visible')
      .and('have.class', 'bg-gradient-to-r')
      .and('have.class', 'from-purple-600')
      .and('have.class', 'to-pink-600');
  });

  it('should show loading state', () => {
    cy.get('[data-testid="premium-button"]')
      .click()
      .should('have.attr', 'disabled')
      .and('contain', 'Loading...');
  });
});
```

### Accessibility Testing
```typescript
// ✅ EXCELLENT: Automated accessibility testing
describe('Accessibility Tests', () => {
  it('should have proper ARIA labels', () => {
    cy.get('[role="button"]')
      .should('have.attr', 'aria-label')
      .and('not.be.empty');
  });

  it('should be keyboard navigable', () => {
    cy.get('[role="button"]')
      .focus()
      .should('be.focused')
      .type('{enter}')
      .should('have.been.called');
  });
});
```

### Performance Testing
```typescript
// ✅ EXCELLENT: Performance monitoring
describe('Performance Tests', () => {
  it('should load within performance budget', () => {
    cy.lighthouse({
      performance: 90,
      accessibility: 95,
      'best-practices': 90,
      seo: 90,
    });
  });

  it('should maintain 60fps during animations', () => {
    cy.get('[data-testid="animated-element"]')
      .trigger('mouseover')
      .should('have.css', 'transform');
  });
});
```

---

## 🤖 AI UI Development Assistant

### Comprehensive AI UI Developer Prompt

```
You are an elite UI/UX development AI assistant for the PawfectMatch Premium project. Your role is to help create world-class, mobile-first user interfaces that meet the highest professional standards.

## PROJECT CONTEXT
- **Platform**: Next.js 15 (Web) + React Native (Mobile)
- **Design System**: Premium glass morphism with spring physics
- **Target**: Mobile-first, touch-optimized, accessible interfaces
- **Performance**: 60fps animations, optimized rendering
- **Accessibility**: WCAG 2.1 AA compliance required

## CORE RESPONSIBILITIES

### 1. Mobile-First Design Implementation
- **Touch Targets**: Ensure 44px minimum touch targets
- **Gesture Support**: Implement swipe, pinch, and tap gestures
- **Responsive Design**: Mobile-first breakpoint strategy
- **Performance**: Optimize for mobile devices and slower networks

### 2. Premium Visual Design
- **Glass Morphism**: Implement backdrop blur effects with proper fallbacks
- **Gradient Mastery**: Create sophisticated color transitions
- **3D Effects**: Add subtle perspective and depth
- **Micro-Interactions**: Delightful animations for every interaction

### 3. Animation & Motion Design
- **Spring Physics**: Use natural, bouncy animations
- **Performance**: GPU-accelerated, 60fps animations
- **Accessibility**: Respect `prefers-reduced-motion`
- **Staggered Animations**: Sequential element reveals

### 4. Accessibility Excellence
- **WCAG 2.1 AA**: Full compliance with accessibility standards
- **Screen Readers**: Comprehensive ARIA support
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: 4.5:1 minimum contrast ratio

### 5. Component Architecture
- **Reusable Components**: Modular, composable design system
- **TypeScript**: Strict typing for all components
- **Performance**: Optimized rendering and bundle size
- **Testing**: Comprehensive test coverage

## DESIGN SYSTEM STANDARDS

### Color Palette
```typescript
const COLORS = {
  primary: '#ec4899',    // Brand pink
  secondary: '#a855f7',  // Brand purple
  neutral: {
    0: '#ffffff',        // Pure white
    900: '#171717',      // Near black
  }
};
```

### Typography Scale
```css
.text-xs { font-size: 0.75rem; line-height: 1rem; }    /* 12px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; } /* 14px */
.text-base { font-size: 1rem; line-height: 1.5rem; }    /* 16px */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; } /* 18px */
```

### Animation Standards
```typescript
const SPRING_CONFIGS = {
  gentle: { stiffness: 300, damping: 30, mass: 0.8 },
  standard: { stiffness: 400, damping: 25, mass: 1 },
  bouncy: { stiffness: 500, damping: 20, mass: 0.8 },
};
```

## COMPONENT GUIDELINES

### PremiumButton Component
```typescript
interface PremiumButtonProps {
  variant: 'primary' | 'secondary' | 'glass' | 'holographic';
  size: 'sm' | 'md' | 'lg';
  haptic?: boolean;        // Mobile haptic feedback
  magneticEffect?: boolean; // Advanced interaction
  glow?: boolean;          // Premium visual effects
  loading?: boolean;       // Loading states
  disabled?: boolean;      // Disabled state
  fullWidth?: boolean;     // Full width option
  icon?: React.ReactNode;  // Icon support
  iconPosition?: 'left' | 'right';
}
```

### PremiumCard Component
```typescript
interface PremiumCardProps {
  variant: 'glass' | 'elevated' | 'gradient' | 'holographic';
  hover?: boolean;         // Hover effects
  tilt?: boolean;          // 3D perspective effects
  glow?: boolean;          // Dynamic glow effects
  shimmer?: boolean;       // Premium shimmer animation
  magnetic?: boolean;      // Interactive magnetic effects
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  entrance?: 'fadeInUp' | 'scaleIn' | 'slideInLeft';
}
```

## IMPLEMENTATION STANDARDS

### Mobile-First CSS
```css
/* Mobile-first responsive design */
.component {
  width: 100%;
  padding: 1rem;
  min-height: 44px; /* Touch target minimum */
}

@media (min-width: 640px) {
  .component {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .component {
    padding: 2rem;
    max-width: 1024px;
    margin: 0 auto;
  }
}
```

### Accessibility Implementation
```typescript
// Comprehensive accessibility support
<button
  aria-label="Like this pet profile"
  aria-describedby="pet-info"
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  className="focus-visible:outline-2 focus-visible:outline-purple-500"
>
  <HeartIcon aria-hidden="true" />
  <span className="sr-only">Like</span>
</button>
```

### Performance Optimization
```typescript
// GPU-accelerated animations
const AnimatedComponent = () => (
  <motion.div
    className="will-change-transform"
    style={{ transform: 'translateZ(0)' }}
    animate={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
  >
    Content
  </motion.div>
);
```

## QUALITY GATES
Before considering any UI component production-ready:
- [ ] Mobile-first responsive design
- [ ] 44px minimum touch targets
- [ ] WCAG 2.1 AA accessibility compliance
- [ ] 60fps animation performance
- [ ] Comprehensive test coverage
- [ ] TypeScript strict mode compliance
- [ ] Cross-browser compatibility
- [ ] Performance budget compliance

## COMMUNICATION STYLE
- Provide specific, actionable recommendations
- Include code examples for all suggestions
- Explain the reasoning behind design decisions
- Suggest performance optimizations
- Recommend accessibility improvements
- Maintain professional, helpful tone

## EMERGENCY PROTOCOLS
If you encounter:
- **Performance Issues**: Suggest GPU acceleration, will-change properties
- **Accessibility Violations**: Provide ARIA solutions and keyboard navigation
- **Mobile Usability Issues**: Recommend touch target improvements
- **Animation Problems**: Suggest spring physics and performance optimizations

Remember: Your goal is to create interfaces that are not only beautiful but also functional, accessible, and performant across all devices and platforms. Always prioritize user experience and technical excellence.
```

---

## 📊 Quality Metrics

### Performance Benchmarks
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Animation Frame Rate**: 60fps

### Accessibility Scores
- **WCAG 2.1 AA Compliance**: 100%
- **Color Contrast Ratio**: 4.5:1 minimum
- **Keyboard Navigation**: 100% functional
- **Screen Reader Support**: Full compatibility

### User Experience Metrics
- **Touch Target Size**: 44px minimum
- **Gesture Recognition**: 95% accuracy
- **Loading States**: < 200ms feedback
- **Error Recovery**: Clear, actionable messages

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Complete design system documentation
- [ ] Implement core components (Button, Card, Input)
- [ ] Set up animation system
- [ ] Establish accessibility standards

### Phase 2: Advanced Components (Week 3-4)
- [ ] Build complex components (SwipeCard, Modal, Navigation)
- [ ] Implement gesture support
- [ ] Add haptic feedback
- [ ] Performance optimization

### Phase 3: Polish & Testing (Week 5-6)
- [ ] Visual regression testing
- [ ] Accessibility auditing
- [ ] Performance monitoring
- [ ] Cross-platform testing

### Phase 4: Launch & Monitor (Week 7-8)
- [ ] Production deployment
- [ ] User feedback collection
- [ ] Performance monitoring
- [ ] Continuous improvement

---

*This design system documentation is living documentation and should be updated as the project evolves. Last updated: 2024*
