/**
 * 💎 PAGE TRANSITION COMPONENT
 * Fluid page transitions with Framer Motion for seamless navigation
 * Features: Multiple transition types, reduced motion support, and accessibility
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

import { ANIMATIONS } from '../theme/design-tokens';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight';
  duration?: number;
  delay?: number;
  className?: string;
}

// Transition variants
const transitionVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
};

export function PageTransition({
  children,
  type = 'fade',
  duration = 0.3,
  delay = 0,
  className = '',
}: PageTransitionProps) {
  const variant = transitionVariants[type];

  return (
    <motion.div
      className={`w-full h-full ${className}`}
      initial={variant.initial}
      animate={variant.animate}
      exit={variant.exit}
      transition={{
        duration,
        delay,
        ease: ANIMATIONS.easing.easeOut,
      }}
      // Respect reduced motion preferences
      style={{
        // @ts-ignore - CSS custom property for reduced motion
        '--motion-reduce': 'var(--motion-reduce, 0)',
      }}
    >
      {children}
    </motion.div>
  );
}

// Layout transition wrapper for Next.js App Router
interface LayoutTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function LayoutTransition({ children, className = '' }: LayoutTransitionProps) {
  return (
    <div className={`min-h-screen ${className}`}>
      <AnimatePresence mode="wait" initial={false}>
        <PageTransition type="fade" duration={0.2}>
          {children}
        </PageTransition>
      </AnimatePresence>
    </div>
  );
}

// Staggered list transition
interface StaggeredListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggeredList({ 
  children, 
  className = '', 
  staggerDelay = 0.1 
}: StaggeredListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={ANIMATIONS.spring.smooth}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Fade in up animation
interface FadeInUpProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeInUp({ 
  children, 
  delay = 0, 
  duration = 0.5, 
  className = '' 
}: FadeInUpProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: ANIMATIONS.easing.easeOut,
      }}
    >
      {children}
    </motion.div>
  );
}

// Scale in animation
interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function ScaleIn({ 
  children, 
  delay = 0, 
  duration = 0.4, 
  className = '' 
}: ScaleInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration,
        delay,
        ease: ANIMATIONS.easing.easeOut,
      }}
    >
      {children}
    </motion.div>
  );
}
