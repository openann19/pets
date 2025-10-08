'use client';

import { motion } from 'framer-motion';
import React from 'react';

import { THEME } from '@/theme/unified-design-system';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  hover = false,
  children,
  className = '',
  ...props
}) => {
  const cardStyle = THEME.variants.card[variant];
  
  const getPadding = () => {
    switch (padding) {
      case 'none': return '0';
      case 'sm': return THEME.spacing[4];
      case 'md': return THEME.spacing[6];
      case 'lg': return THEME.spacing[8];
      default: return THEME.spacing[6];
    }
  };

  return (
    <motion.div
      className={className}
      style={{
        ...cardStyle,
        padding: getPadding(),
        transition: `all ${THEME.transitions.duration.normal} ${THEME.transitions.easing.easeOut}`,
      }}
      whileHover={hover ? {
        transform: 'translateY(-4px)',
        boxShadow: THEME.shadows.xl,
      } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
