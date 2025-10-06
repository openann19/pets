# Component Implementation Guide
## PawfectMatch Premium - Step-by-Step Component Development

### 📋 Table of Contents
1. [Component Development Workflow](#component-development-workflow)
2. [Premium Component Templates](#premium-component-templates)
3. [Animation Implementation](#animation-implementation)
4. [Accessibility Implementation](#accessibility-implementation)
5. [Testing Implementation](#testing-implementation)
6. [Performance Optimization](#performance-optimization)
7. [Mobile Optimization](#mobile-optimization)
8. [Code Examples](#code-examples)

---

## 🔄 Component Development Workflow

### 1. Planning Phase
```typescript
// Component Planning Checklist
interface ComponentPlan {
  // ✅ Define component purpose and use cases
  purpose: string;
  useCases: string[];
  
  // ✅ Identify required props and variants
  props: ComponentProps;
  variants: VariantDefinition[];
  
  // ✅ Plan accessibility requirements
  accessibility: AccessibilityPlan;
  
  // ✅ Design animation and interaction patterns
  animations: AnimationPlan;
  
  // ✅ Consider mobile-first requirements
  mobileOptimizations: MobilePlan;
}
```

### 2. Implementation Phase
```bash
# Component creation workflow
1. Create component file structure
2. Implement TypeScript interfaces
3. Add accessibility attributes
4. Implement animations
5. Add mobile optimizations
6. Write comprehensive tests
7. Document usage examples
8. Performance optimization
```

### 3. Testing Phase
```typescript
// Testing checklist for each component
const TESTING_CHECKLIST = {
  unit: [
    'Component renders correctly',
    'Props are handled properly',
    'State changes work as expected',
    'Event handlers fire correctly'
  ],
  integration: [
    'Works with other components',
    'Theme integration works',
    'Animation system integration',
    'Accessibility integration'
  ],
  visual: [
    'Visual regression tests pass',
    'Responsive design works',
    'Dark mode compatibility',
    'Animation performance'
  ],
  accessibility: [
    'Screen reader compatibility',
    'Keyboard navigation',
    'Color contrast compliance',
    'Focus management'
  ]
};
```

---

## 🧩 Premium Component Templates

### 1. Premium Button Template
```typescript
/**
 * Premium Button Component Template
 * Copy this template for creating new premium buttons
 */

'use client';

import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { SPRING_CONFIG } from '@/constants/animations';
import { COLORS, SHADOWS } from '@/constants/design-tokens';

interface PremiumButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'glass' | 'holographic';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  haptic?: boolean;
  sound?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  glow?: boolean;
  magneticEffect?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  haptic = true,
  sound = true,
  icon,
  iconPosition = 'left',
  glow = false,
  magneticEffect = false,
  fullWidth = false,
  type = 'button',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isPressed, setIsPressed] = useState(false);

  // Magnetic effect using motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 25 });
  const springY = useSpring(y, { stiffness: 400, damping: 25 });
  
  const baseClasses = "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none transform-gpu overflow-hidden backdrop-blur focus-visible:outline-2 focus-visible:outline-purple-500 focus-visible:outline-offset-2";
  
  const variantClasses = {
    primary: {
      background: 'rgba(59, 130, 246, 0.12)',
      color: COLORS.neutral[0],
      boxShadow: glow ? SHADOWS.primaryGlow : SHADOWS.lg,
      border: '1px solid rgba(255,255,255,0.12)',
    },
    secondary: {
      background: COLORS.secondary[700],
      color: COLORS.neutral[0],
      boxShadow: glow ? SHADOWS.secondaryGlow : SHADOWS.lg,
      border: 'none',
    },
    glass: {
      background: 'rgba(255,255,255,0.08)',
      backdropFilter: 'blur(12px) saturate(140%)',
      border: '1px solid rgba(255,255,255,0.12)',
      color: '#f1f5f9',
      boxShadow: SHADOWS.glass,
    },
    holographic: {
      background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(37,99,235,0.25))',
      color: '#f8fafc',
      border: '1px solid rgba(255,255,255,0.12)',
      boxShadow: SHADOWS['2xl'],
      backgroundSize: '200% 200%',
      animation: 'holographic 8s ease infinite',
      filter: 'saturate(105%)',
    },
  } as const;

  const sizeClasses = {
    sm: "px-4 py-2 text-sm min-h-[36px]",
    md: "px-6 py-3 text-base min-h-[44px]",
    lg: "px-8 py-4 text-lg min-h-[52px]"
  };

  // Enhanced haptic feedback
  const triggerHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!haptic || typeof window === 'undefined') return;
    
    if ('vibrate' in navigator) {
      const patterns = {
        light: [8],
        medium: [15],
        heavy: [25, 10, 15],
      };
      navigator.vibrate(patterns[intensity]);
    }
  }, [haptic]);

  // Enhanced sound feedback
  const triggerSound = useCallback((type: 'hover' | 'press' = 'press') => {
    if (!sound || typeof window === 'undefined') return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const frequencies = { hover: 800, press: 600 };
      oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.debug('Audio feedback not available');
    }
  }, [sound]);

  // Magnetic mouse tracking
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!magneticEffect || !buttonRef.current || disabled) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 50;
    
    if (distance < maxDistance) {
      const strength = 1 - distance / maxDistance;
      x.set(deltaX * strength * 0.2);
      y.set(deltaY * strength * 0.2);
    }
  }, [magneticEffect, x, y, disabled]);

  const handleMouseLeave = useCallback(() => {
    if (magneticEffect) {
      x.set(0);
      y.set(0);
    }
  }, [magneticEffect, x, y]);

  const handleClick = () => {
    if (disabled || loading) return;

    triggerHaptic('medium');
    triggerSound('press');
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);

    onClick?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const variantStyle = variantClasses[variant];
  const wrapperClass = fullWidth ? "relative block w-full" : "relative inline-block";

  return (
    <div className={wrapperClass}>
      <motion.button
        ref={buttonRef}
        type={type}
        className={`
          ${baseClasses}
          ${sizeClasses[size]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        style={{
          ...variantStyle,
          x: magneticEffect ? springX : 0,
          y: magneticEffect ? springY : 0,
        }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled || loading}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => triggerSound('hover')}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-disabled={disabled || loading}
        
        // Enhanced hover animation
        whileHover={!disabled && !loading ? {
          scale: 1.02,
          y: -2,
          rotateY: 1,
          transition: { type: "spring", stiffness: 400, damping: 25 },
        } : {}}
        
        // Enhanced tap animation  
        whileTap={!disabled && !loading ? {
          scale: 0.98,
          y: 0,
          transition: { type: "spring", stiffness: 400, damping: 25 },
        } : {}}
        
        // Entry animation
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: disabled ? 0.5 : 1, scale: 1 }}
        transition={SPRING_CONFIG}
      >
        {/* Shimmer overlay for holographic variant */}
        {variant === 'holographic' && (
          <div
            className="pointer-events-none absolute inset-0 rounded-xl animate-shimmer"
            style={{ opacity: 0.18 }}
          />
        )}
        
        {/* Glow effect */}
        {glow && !disabled && (
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            style={{
              background: variantStyle.background,
              filter: 'blur(12px)',
              zIndex: -1,
              transform: 'scale(1.1)',
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        )}

        {/* Loading overlay */}
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-inherit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <motion.div
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>
        )}

        {/* Enhanced content with icon support */}
        <motion.div
          className="flex items-center justify-center gap-2"
          animate={{ 
            scale: isPressed ? 0.95 : 1,
            opacity: loading ? 0 : 1,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {icon && iconPosition === 'left' && (
            <motion.span
              className="flex-shrink-0"
              whileHover={{ rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {icon}
            </motion.span>
          )}
          
          <span>{children}</span>
          
          {icon && iconPosition === 'right' && (
            <motion.span
              className="flex-shrink-0"
              whileHover={{ rotate: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {icon}
            </motion.span>
          )}
        </motion.div>

        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-inherit overflow-hidden pointer-events-none"
          initial={false}
          animate={isPressed ? { scale: 1 } : { scale: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-white opacity-20"
            initial={{ scale: 0 }}
            animate={isPressed ? { scale: 4 } : { scale: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              borderRadius: '50%',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </motion.div>
      </motion.button>
    </div>
  );
};

export default PremiumButton;
```

### 2. Premium Card Template
```typescript
/**
 * Premium Card Component Template
 * Copy this template for creating new premium cards
 */

'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { SPRING_CONFIG, PREMIUM_VARIANTS } from '@/constants/animations';
import { transitions } from '@/constants/design-tokens';

interface PremiumCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'gradient' | 'neon' | 'holographic';
  hover?: boolean;
  tilt?: boolean;
  glow?: boolean;
  blur?: boolean;
  shimmer?: boolean;
  magnetic?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  entrance?: 'fadeInUp' | 'scaleIn' | 'slideInLeft' | 'slideInRight';
  delay?: number;
  'aria-label'?: string;
  'aria-describedby'?: string;
  role?: string;
  tabIndex?: number;
}

export default function PremiumCard({
  children,
  variant = 'default',
  hover = false,
  tilt = false,
  glow = false,
  blur = false,
  shimmer = false,
  magnetic = false,
  padding = 'md',
  className = '',
  onClick,
  entrance = 'fadeInUp',
  delay = 0,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  role,
  tabIndex,
}: PremiumCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // 3D tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [15, -15]), transitions.micro);
  const rotateY = useSpring(useTransform(x, [-100, 100], [-15, 15]), transitions.micro);

  // Handle mouse move for tilt effect
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!tilt || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (tilt) {
      x.set(0);
      y.set(0);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  // Get enhanced variant styles with premium effects
  const getVariantClasses = () => {
    const variants = {
      default: "text-white border border-white/15",
      glass: "text-white border border-white/20",
      elevated: "text-white border border-white/15 shadow-premium-lg hover:shadow-2xl transform hover:-translate-y-2",
      gradient: "text-white border border-white/15",
      neon: "border border-blue-500/40 text-blue-300 hover:shadow-[0_0_24px_rgba(59,130,246,0.25)]",
      holographic: "text-white border border-white/15",
    };
    
    return variants[variant];
  };

  // Get enhanced background styles with better glassmorphism
  const getBackgroundStyle = () => {
    const backgrounds = {
      default: {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      },
      glass: {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
        backdropFilter: 'blur(24px) saturate(200%)',
        WebkitBackdropFilter: 'blur(24px) saturate(200%)',
      },
      elevated: {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      },
      gradient: {
        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      },
      neon: {
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      },
      holographic: {
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.15) 50%, rgba(236, 72, 153, 0.15) 100%)',
        backdropFilter: 'blur(24px) saturate(200%)',
        WebkitBackdropFilter: 'blur(24px) saturate(200%)',
      },
    };
    
    return backgrounds[variant];
  };

  // Get padding classes
  const getPaddingClasses = () => {
    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-7',
      xl: 'p-9',
    };
    
    return paddings[padding];
  };

  const variantClasses = getVariantClasses();
  const paddingClasses = getPaddingClasses();
  const backgroundStyle = getBackgroundStyle();

  return (
    <motion.div
      ref={cardRef}
      className={`
        relative rounded-2xl transition-all duration-300 transform-gpu
        ${variantClasses}
        ${paddingClasses}
        ${onClick ? 'cursor-pointer focus-visible:outline-2 focus-visible:outline-purple-500 focus-visible:outline-offset-2' : ''}
        ${tilt ? 'perspective-1000 preserve-3d' : ''}
        ${className}
      `}
      style={{
        ...backgroundStyle,
        rotateX: tilt ? rotateX : 0,
        rotateY: tilt ? rotateY : 0,
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      }}
      initial={PREMIUM_VARIANTS[entrance]?.initial || { opacity: 0, y: 10 }}
      animate={PREMIUM_VARIANTS[entrance]?.animate || { opacity: 1, y: 0 }}
      transition={{ ...(PREMIUM_VARIANTS[entrance]?.transition || SPRING_CONFIG), delay }}
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      role={role}
      tabIndex={tabIndex}
    >
      {/* Glow effect */}
      {glow && isHovered && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none bg-blue-500/20 blur-xl scale-110 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Blur overlay */}
      {blur && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none backdrop-blur-lg bg-white/5"
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Interactive shine effect */}
      {hover && isHovered && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -skew-x-12"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        </motion.div>
      )}

      {/* Shimmer effect */}
      {shimmer && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      )}

      {/* Magnetic effect */}
      {magnetic && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.div>
  );
}
```

---

## 🎬 Animation Implementation

### 1. Spring Physics Setup
```typescript
// Animation constants for consistent motion
export const SPRING_CONFIGS = {
  gentle: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  },
  standard: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
    mass: 1,
  },
  bouncy: {
    type: 'spring',
    stiffness: 500,
    damping: 20,
    mass: 0.8,
  },
  snappy: {
    type: 'spring',
    stiffness: 600,
    damping: 30,
    mass: 0.6,
  },
};

// Usage in components
<motion.div
  animate={{ scale: 1.02 }}
  transition={SPRING_CONFIGS.standard}
>
  Content
</motion.div>
```

### 2. Staggered Animations
```typescript
// Staggered animation implementation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
};

// Usage
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {items.map((item) => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### 3. Performance Optimization
```typescript
// GPU-accelerated animations
const OptimizedAnimation = () => (
  <motion.div
    className="will-change-transform"
    style={{ transform: 'translateZ(0)' }}
    animate={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
  >
    Content
  </motion.div>
);

// Respect user preferences
const AccessibleAnimation = () => (
  <motion.div
    animate={{ scale: 1.02 }}
    transition={{
      type: "spring",
      stiffness: 400,
      damping: 25,
    }}
    style={{
      // Respect reduced motion preference
      '@media (prefers-reduced-motion: reduce)': {
        animation: 'none',
      },
    }}
  >
    Content
  </motion.div>
);
```

---

## ♿ Accessibility Implementation

### 1. ARIA Attributes
```typescript
// Comprehensive ARIA implementation
interface AccessibilityProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  'aria-selected'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';
  role?: string;
  tabIndex?: number;
}

// Usage example
<button
  aria-label="Like this pet profile"
  aria-describedby="pet-info"
  aria-pressed={isLiked}
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
>
  <HeartIcon aria-hidden="true" />
  <span className="sr-only">Like</span>
</button>
```

### 2. Keyboard Navigation
```typescript
// Keyboard navigation implementation
const handleKeyDown = (event: React.KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      handleClick();
      break;
    case 'Escape':
      event.preventDefault();
      handleClose();
      break;
    case 'ArrowUp':
      event.preventDefault();
      handlePrevious();
      break;
    case 'ArrowDown':
      event.preventDefault();
      handleNext();
      break;
  }
};

// Focus management
const FocusManager = () => {
  const focusRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      focusRef.current?.focus();
    }
  }, [isOpen]);
  
  return (
    <div
      ref={focusRef}
      tabIndex={-1}
      aria-label="Modal content"
    >
      Content
    </div>
  );
};
```

### 3. Screen Reader Support
```typescript
// Screen reader optimized content
const ScreenReaderContent = () => (
  <div>
    {/* Visible content */}
    <h2>Pet Profile</h2>
    <img src={petPhoto} alt={`${petName} profile photo`} />
    
    {/* Screen reader only content */}
    <div className="sr-only">
      <p>Pet name: {petName}</p>
      <p>Age: {petAge} years old</p>
      <p>Breed: {petBreed}</p>
      <p>Distance: {petDistance} kilometers away</p>
      <p>Compatibility: {petCompatibility}% match</p>
    </div>
  </div>
);
```

---

## 🧪 Testing Implementation

### 1. Unit Tests
```typescript
// Component unit tests
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import PremiumButton from './PremiumButton';

expect.extend(toHaveNoViolations);

describe('PremiumButton', () => {
  it('renders correctly', () => {
    render(<PremiumButton>Click me</PremiumButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<PremiumButton onClick={handleClick}>Click me</PremiumButton>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation', () => {
    const handleClick = jest.fn();
    render(<PremiumButton onClick={handleClick}>Click me</PremiumButton>);
    
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not have accessibility violations', async () => {
    const { container } = render(<PremiumButton>Click me</PremiumButton>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 2. Visual Regression Tests
```typescript
// Visual regression tests with Cypress
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

  it('should match visual snapshot', () => {
    cy.get('[data-testid="premium-button"]')
      .should('matchImageSnapshot');
  });
});
```

### 3. Performance Tests
```typescript
// Performance testing
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

## ⚡ Performance Optimization

### 1. Bundle Optimization
```typescript
// Code splitting for components
const LazyPremiumButton = lazy(() => import('./PremiumButton'));

// Usage with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <LazyPremiumButton>Click me</LazyPremiumButton>
</Suspense>

// Tree shaking optimization
import { motion } from 'framer-motion';
// Instead of: import * as motion from 'framer-motion';
```

### 2. Image Optimization
```typescript
// Optimized image component
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

### 3. Animation Performance
```css
/* GPU-accelerated animations */
.animate-gpu {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Optimized transitions */
.transition-optimized {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  .animate-gpu,
  .transition-optimized {
    animation: none;
    transition: none;
  }
}
```

---

## 📱 Mobile Optimization

### 1. Touch Optimization
```typescript
// Touch-friendly component
const TouchOptimizedButton = () => (
  <button
    className="min-h-[44px] min-w-[44px] px-4 py-2 touch-manipulation"
    style={{
      WebkitTapHighlightColor: 'transparent',
      touchAction: 'manipulation',
    }}
  >
    Touch me
  </button>
);
```

### 2. Gesture Support
```typescript
// Gesture handling with React Native
import { PanResponder } from 'react-native';

const GestureHandler = () => {
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
    },
    onPanResponderMove: (evt, gestureState) => {
      // Handle gesture movement
    },
    onPanResponderRelease: (evt, gestureState) => {
      // Handle gesture release
    },
  });

  return (
    <View {...panResponder.panHandlers}>
      Content
    </View>
  );
};
```

### 3. Responsive Design
```css
/* Mobile-first responsive design */
.component {
  width: 100%;
  padding: 1rem;
  min-height: 44px;
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

---

## 📝 Code Examples

### 1. Complete Component Example
```typescript
// Complete premium component example
import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface LikeButtonProps {
  isLiked: boolean;
  onLike: () => void;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'glass';
  disabled?: boolean;
  loading?: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  isLiked,
  onLike,
  count,
  size = 'md',
  variant = 'primary',
  disabled = false,
  loading = false,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(() => {
    if (disabled || loading) return;
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
    
    onLike();
  }, [disabled, loading, onLike]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-3 text-base',
    lg: 'p-4 text-lg',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white',
  };

  return (
    <motion.button
      ref={buttonRef}
      className={`
        relative inline-flex items-center gap-2 rounded-xl font-semibold
        transition-all duration-200 focus:outline-none focus-visible:outline-2
        focus-visible:outline-purple-500 focus-visible:outline-offset-2
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      aria-label={isLiked ? 'Unlike this pet' : 'Like this pet'}
      aria-pressed={isLiked}
      whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Heart icon with animation */}
      <motion.div
        animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {isLiked ? (
          <HeartSolidIcon className="w-5 h-5 text-red-500" />
        ) : (
          <HeartIcon className="w-5 h-5" />
        )}
      </motion.div>

      {/* Like count */}
      {count !== undefined && (
        <span className="text-sm font-medium">{count}</span>
      )}

      {/* Loading overlay */}
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}
    </motion.button>
  );
};

export default LikeButton;
```

### 2. Usage Examples
```typescript
// Usage examples
const ComponentExamples = () => (
  <div className="space-y-4">
    {/* Basic usage */}
    <LikeButton
      isLiked={false}
      onLike={() => console.log('Liked!')}
      count={42}
    />

    {/* Different variants */}
    <LikeButton
      isLiked={true}
      onLike={() => console.log('Unliked!')}
      variant="glass"
      size="lg"
    />

    {/* Loading state */}
    <LikeButton
      isLiked={false}
      onLike={() => console.log('Liking...')}
      loading={true}
      disabled={true}
    />
  </div>
);
```

---

*This implementation guide provides comprehensive templates and examples for creating premium, accessible, and performant UI components. Use these templates as a foundation for all new components in the PawfectMatch Premium design system.*
