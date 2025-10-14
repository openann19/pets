'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React from 'react';

export interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  magneticEffect?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const PremiumButtonForwardRef = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      magneticEffect = false,
      icon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    // Filter out undefined values for exactOptionalPropertyTypes compliance
    const cleanProps: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
      if (value !== undefined) {
        cleanProps[key] = value;
      }
    }
    const baseClasses = `relative inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${fullWidth ? 'w-full' : ''}`;

    const variants = {
      primary:
        'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 focus:ring-pink-500 shadow-lg hover:shadow-xl',
      secondary:
        'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300 focus:ring-gray-500 shadow-md hover:shadow-lg',
      outline:
        'border-2 border-gradient-to-r from-pink-500 to-purple-600 text-pink-600 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 hover:text-white focus:ring-pink-500',
      ghost: 'text-pink-600 hover:bg-pink-50 focus:ring-pink-500',
      destructive:
        'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-4 py-2 text-sm rounded-lg',
      lg: 'px-6 py-3 text-base rounded-xl',
      xl: 'px-8 py-4 text-lg rounded-xl',
    };

    const buttonContent = (
      <>
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
        <div className={cn('flex items-center gap-2', loading && 'opacity-0')}>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </div>
      </>
    );

    if (magneticEffect) {
      return (
        <motion.button
          ref={ref}
          className={cn(baseClasses, variants[variant], sizes[size], className)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={Boolean(disabled || loading)}
          {...cleanProps}
        >
          {buttonContent}
        </motion.button>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        disabled={Boolean(disabled || loading)}
        {...cleanProps}
      >
        {buttonContent}
      </motion.button>
    );
  },
);

PremiumButtonForwardRef.displayName = 'PremiumButton';

// Named export and default export without any casting
export default PremiumButtonForwardRef;
