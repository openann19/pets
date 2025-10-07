/**
 * 💎 UNIFIED PREMIUM INPUT COMPONENT
 * Uses the unified design system for consistent styling across web and mobile
 * Enhanced with validation states and unified visual feedback
 */

'use client';

import { motion } from 'framer-motion';
import React, { useState } from 'react';

interface UnifiedPremiumInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glass' | 'outline';
  disabled?: boolean;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  required?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export function UnifiedPremiumInput({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  size = 'md',
  variant = 'default',
  disabled = false,
  error,
  success = false,
  icon,
  required = false,
  className = '',
  autoFocus = false,
}: UnifiedPremiumInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Get unified input styles
  const getInputStyles = () => {
    const baseStyles = {
      // Size styles
      sm: 'px-3 py-2 text-sm rounded-lg',
      md: 'px-4 py-3 text-base rounded-xl',
      lg: 'px-5 py-4 text-lg rounded-2xl',
    };

    const variantStyles = {
      default: {
        base: 'bg-white/5 backdrop-blur-md border border-white/20 text-white placeholder-white/60',
        focus: 'focus:bg-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20',
        error: 'border-red-500 bg-red-500/10',
        success: 'border-green-500 bg-green-500/10',
        disabled: 'opacity-50 cursor-not-allowed',
      },
      glass: {
        base: 'bg-white/10 backdrop-blur-lg border border-white/30 text-white placeholder-white/60',
        focus: 'focus:bg-white/15 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30',
        error: 'border-red-400 bg-red-400/15',
        success: 'border-green-400 bg-green-400/15',
        disabled: 'opacity-50 cursor-not-allowed',
      },
      outline: {
        base: 'bg-transparent border-2 border-pink-500 text-white placeholder-pink-300',
        focus: 'focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30',
        error: 'border-red-500 text-red-500',
        success: 'border-green-500 text-green-500',
        disabled: 'opacity-50 cursor-not-allowed border-pink-300',
      },
    };

    const sizeStyle = baseStyles[size] ?? '';
    const variantStyle = variantStyles[variant] ?? variantStyles.default;

    const stateStyle = error != null && error !== ''
      ? variantStyle.error 
      : success === true
      ? variantStyle.success 
      : isFocused === true
      ? variantStyle.focus 
      : '';

    const disabledStyle = disabled === true ? variantStyle.disabled : '';

    return [
      sizeStyle,
      variantStyle.base,
      stateStyle,
      disabledStyle,
      'transition-all duration-200',
      'focus:outline-none',
      'w-full',
    ].join(' ');
  };

  const inputStyles = getInputStyles();

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label != null && label !== '' && (
        <label className="block text-sm font-medium text-white/80 mb-2">
          {label}
          {required && <span className="text-pink-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Input Field */}
        <motion.input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={inputStyles}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />

        {/* Icon */}
        {icon != null && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60">
            {icon}
          </div>
        )}

        {/* Validation Indicators */}
        {error != null && error !== '' ? (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        ) : null}

        {success && (error == null || error === '') ? (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        ) : null}
      </div>

      {/* Error Message */}
      {error != null && error !== '' ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 text-red-400 text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.div>
      ) : null}

      {/* Success Message */}
      {success && (error == null || error === '') ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 text-green-400 text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Valid input
        </motion.div>
      ) : null}
    </div>
  );
}
