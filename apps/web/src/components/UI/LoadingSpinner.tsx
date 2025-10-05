'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'neon' | 'holographic';
  color?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  color,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const variantStyles = {
    default: {
      borderColor: color || '#e5e7eb',
      borderTopColor: color || '#3b82f6',
    },
    gradient: {
      background: 'conic-gradient(from 180deg at 50% 50%, #667eea 0deg, #ec4899 180deg, #667eea 360deg)',
    },
    neon: {
      borderColor: '#3b82f6',
      borderTopColor: '#60a5fa',
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
    },
    holographic: {
      background: 'conic-gradient(from 0deg at 50% 50%, #ff6b6b, #4ecdc4, #45b7b8, #96ceb4, #ffeaa7, #ff6b6b)',
    },
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className} border-2 border-solid rounded-full animate-spin`}
      style={variantStyles[variant]}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
};

export default LoadingSpinner;
