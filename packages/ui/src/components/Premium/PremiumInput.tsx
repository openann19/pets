/**
 * 💎 PREMIUM INPUT COMPONENT
 * Advanced input with floating labels, glass morphism, and premium animations
 */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef, useState } from 'react';

import { transitions } from '../../animations/premium-motion';
import { BACKDROP, COLORS, GRADIENTS, RADIUS, SHADOWS } from '../../theme/design-system';

interface PremiumInputProps {
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  variant?: 'default' | 'glass' | 'gradient' | 'neon';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  className?: string;
  autoComplete?: string;
  maxLength?: number;
  glow?: boolean;
}

export function PremiumInput({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  variant = 'default',
  size = 'md',
  icon,
  rightIcon,
  helperText,
  className = '',
  autoComplete,
  maxLength,
  glow = false,
}: PremiumInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isFloating = isFocused || Boolean(value && value.length > 0);
  const hasError = !!error;

  // Focus management
  const handleFocus = () => {
    setIsFocused(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Get variant styles
  const getVariantStyles = () => {
    const variants = {
      default: {
        background: COLORS.neutral[0],
        border: hasError 
          ? `2px solid ${COLORS.error[500]}`
          : isFocused 
            ? `2px solid ${COLORS.primary[500]}`
            : `1px solid ${COLORS.neutral[300]}`,
        boxShadow: isFocused 
          ? hasError 
            ? SHADOWS.errorGlow
            : SHADOWS.primaryGlow
          : SHADOWS.sm,
      },
      glass: {
        background: GRADIENTS.glass.light,
        backdropFilter: `${BACKDROP.blur.lg} saturate(180%)`,
        border: hasError
          ? `2px solid ${COLORS.error[400]}80`
          : isFocused
            ? `2px solid ${COLORS.primary[400]}80`
            : '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: isFocused ? SHADOWS.glass : 'none',
      },
      gradient: {
        background: GRADIENTS.mesh.cool,
        border: 'none',
        color: COLORS.neutral[0],
        boxShadow: SHADOWS.xl,
      },
      neon: {
        background: COLORS.neutral[900],
        border: hasError
          ? `2px solid ${COLORS.error[400]}`
          : isFocused
            ? `2px solid ${COLORS.primary[400]}`
            : `1px solid ${COLORS.neutral[600]}`,
        boxShadow: isFocused 
          ? `0 0 20px ${hasError ? COLORS.error[400] : COLORS.primary[400]}40`
          : 'none',
        color: COLORS.neutral[0],
      },
    };
    
    return variants[variant];
  };

  // Get size styles
  const getSizeStyles = () => {
    const sizes = {
      sm: {
        height: '40px',
        fontSize: '14px',
        padding: '8px 12px',
      },
      md: {
        height: '48px',
        fontSize: '16px',
        padding: '12px 16px',
      },
      lg: {
        height: '56px',
        fontSize: '18px',
        padding: '16px 20px',
      },
    };
    
    return sizes[size];
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.spring}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Input Container */}
      <motion.div
        className="relative"
        style={{
          ...variantStyles,
          ...sizeStyles,
          borderRadius: RADIUS.xl,
        }}
        animate={{
          scale: isHovered && !disabled ? 1.01 : 1,
          y: isHovered && !disabled ? -1 : 0,
        }}
        transition={transitions.micro}
      >
        {/* Left Icon */}
        {Boolean(icon) && (
          <motion.div
            className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
            animate={{
              scale: isFocused ? 1.1 : 1,
              color: isFocused 
                ? hasError ? COLORS.error[500] : COLORS.primary[500]
                : COLORS.neutral[400],
            }}
            transition={transitions.micro}
          >
            {icon}
          </motion.div>
        )}

        {/* Floating Label */}
        <motion.label
          className="absolute pointer-events-none select-none"
          style={{
            left: icon ? '48px' : '16px',
            color: hasError 
              ? COLORS.error[500]
              : isFocused 
                ? COLORS.primary[500] 
                : COLORS.neutral[500],
            fontSize: isFloating ? '12px' : sizeStyles.fontSize,
            fontWeight: isFloating ? '500' : '400',
          }}
          animate={{
            top: isFloating ? '8px' : '50%',
            y: isFloating ? 0 : '-50%',
            scale: isFloating ? 1 : 1,
          }}
          transition={transitions.micro}
          onClick={handleFocus}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </motion.label>

        {/* Input Field */}
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={isFocused ? placeholder : ''}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className="w-full h-full bg-transparent border-none outline-none"
          style={{
            paddingTop: isFloating ? '20px' : '0',
            paddingBottom: isFloating ? '4px' : '0',
            paddingLeft: icon ? '48px' : '16px',
            paddingRight: rightIcon ? '48px' : '16px',
            fontSize: sizeStyles.fontSize,
            color: variant === 'gradient' || variant === 'neon' 
              ? COLORS.neutral[0] 
              : COLORS.neutral[800],
          }}
        />

        {/* Right Icon */}
        {rightIcon && (
          <motion.div
            className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
            animate={{
              scale: isFocused ? 1.1 : 1,
              color: isFocused 
                ? hasError ? COLORS.error[500] : COLORS.primary[500]
                : COLORS.neutral[400],
            }}
            transition={transitions.micro}
          >
            {rightIcon}
          </motion.div>
        )}

        {/* Character Count */}
        {Boolean(maxLength) && value.length > 0 && (
          <motion.div
            className="absolute bottom-1 right-3 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              color: value.length > (maxLength ?? 0) * 0.8
                ? COLORS.warning[500]
                : COLORS.neutral[400],
            }}
          >
            {value.length}/{maxLength}
          </motion.div>
        )}

        {/* Focus ring */}
        {isFocused && !hasError && (
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              boxShadow: variant === 'glass' 
                ? `0 0 0 3px ${COLORS.primary[200]}40`
                : `0 0 0 3px ${COLORS.primary[200]}`,
            }}
            transition={transitions.micro}
          />
        )}

        {/* Error ring */}
        {hasError && (
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              boxShadow: `0 0 0 3px ${COLORS.error[200]}`,
            }}
            transition={transitions.micro}
          />
        )}

        {/* Glow effect */}
        {glow === true && isFocused && !hasError && (
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: GRADIENTS.primary,
              filter: 'blur(20px)',
              zIndex: -1,
              transform: 'scale(1.05)',
            }}
            transition={transitions.micro}
          />
        )}
      </motion.div>

      {/* Helper Text */}
      <AnimatePresence>
        {(Boolean(helperText) || Boolean(error)) && (
          <motion.div
            className="mt-2 px-1"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={transitions.micro}
          >
            <p
              className="text-sm"
              style={{
                color: hasError ? COLORS.error[500] : COLORS.neutral[600],
              }}
            >
              {error ?? helperText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
