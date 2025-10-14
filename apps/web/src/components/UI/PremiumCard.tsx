'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React from 'react';

export interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'outline';
  hover?: boolean;
  children: React.ReactNode;
}

const PremiumCardForwardRef = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, variant = 'default', hover = false, children, ...props }, ref) => {
    // Filter out undefined values for exactOptionalPropertyTypes compliance
    const cleanProps: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
      if (value !== undefined) {
        cleanProps[key] = value;
      }
    }
    const baseClasses = 'relative rounded-2xl transition-all duration-200';

    const variants = {
      default: 'bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700',
      glass: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-xl',
      gradient:
        'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-xl border border-gray-200 dark:border-gray-700',
      outline: 'bg-transparent border-2 border-gradient-to-r from-pink-500 to-purple-600 shadow-lg',
    };

    const hoverClasses = hover ? 'hover:shadow-2xl hover:scale-[1.02]' : '';

    if (hover) {
      return (
        <motion.div
          ref={ref}
          className={cn(baseClasses, variants[variant], hoverClasses, className)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          {...cleanProps}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variants[variant], hoverClasses, className)}
        {...cleanProps}
      >
        {children}
      </div>
    );
  },
);

PremiumCardForwardRef.displayName = 'PremiumCard';

export default PremiumCardForwardRef;
