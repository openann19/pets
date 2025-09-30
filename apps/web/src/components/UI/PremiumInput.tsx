'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SPRING_CONFIG } from '@/constants/animations';

interface PremiumInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  variant?: 'default' | 'floating' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  maxLength?: number;
  showCharacterCount?: boolean;
  className?: string;
  autoComplete?: string;
  name?: string;
  id?: string;
}

export default function PremiumInput({
  type = 'text',
  label,
  placeholder,
  value = '',
  onChange,
  onFocus,
  onBlur,
  error,
  helperText,
  disabled = false,
  required = false,
  variant = 'default',
  size = 'md',
  icon,
  iconPosition = 'left',
  maxLength,
  showCharacterCount = false,
  className = '',
  autoComplete,
  name,
  id,
}: PremiumInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(!!value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsFilled(!!value);
  }, [value]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange?.(newValue);
    setIsFilled(!!newValue);
  };

  // Size classes
  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    };
    return sizes[size];
  };

  // Variant classes
  const getVariantClasses = () => {
    const baseClasses = 'w-full rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20';
    
    if (error) {
      return `${baseClasses} border-red-400 bg-red-50/50 focus:border-red-500`;
    }
    
    if (disabled) {
      return `${baseClasses} border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed`;
    }

    const variants = {
      default: `${baseClasses} border-gray-200 bg-white hover:border-gray-300 focus:border-purple-500`,
      floating: `${baseClasses} border-gray-200 bg-white hover:border-gray-300 focus:border-purple-500`,
      outlined: `${baseClasses} border-gray-300 bg-transparent hover:border-gray-400 focus:border-purple-500`,
      filled: `${baseClasses} border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:border-purple-500`,
    };
    
    return variants[variant];
  };

  const inputClasses = `${getSizeClasses()} ${getVariantClasses()} ${className}`;

  // Floating label animation
  const shouldFloatLabel = isFocused || isFilled || variant === 'floating';

  return (
    <div className="relative w-full">
      {/* Container with icon support */}
      <div className="relative">
        {/* Left icon */}
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10">
            {icon}
          </div>
        )}

        {/* Input field */}
        <input
          ref={inputRef}
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={variant === 'floating' ? ' ' : placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className={`${inputClasses} ${icon && iconPosition === 'left' ? 'pl-10' : ''} ${icon && iconPosition === 'right' ? 'pr-10' : ''}`}
        />

        {/* Right icon */}
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10">
            {icon}
          </div>
        )}

        {/* Floating label */}
        {label && variant === 'floating' && (
          <motion.label
            htmlFor={id}
            className={`absolute left-3 transition-all duration-300 pointer-events-none ${
              icon && iconPosition === 'left' ? 'left-10' : ''
            } ${
              shouldFloatLabel
                ? 'top-2 text-xs text-purple-600 font-medium'
                : 'top-1/2 transform -translate-y-1/2 text-gray-500'
            }`}
            animate={{
              y: shouldFloatLabel ? 0 : 0,
              scale: shouldFloatLabel ? 0.85 : 1,
            }}
            transition={SPRING_CONFIG}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </motion.label>
        )}

        {/* Focus ring effect */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-purple-500 pointer-events-none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={SPRING_CONFIG}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Character count */}
      {showCharacterCount && maxLength && (
        <div className="flex justify-end mt-1 text-xs text-gray-500">
          <span className={value.length > maxLength * 0.9 ? 'text-orange-500' : ''}>
            {value.length}/{maxLength}
          </span>
        </div>
      )}

      {/* Helper text and error */}
      <AnimatePresence>
        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={SPRING_CONFIG}
            className="mt-2"
          >
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
            {helperText && !error && (
              <p className="text-sm text-gray-600">{helperText}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}