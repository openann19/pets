/**
 * 💎 PREMIUM CARD COMPONENT  
 * Advanced card with glass morphism, 3D effects, and premium animations
 */

'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { COLORS, GRADIENTS, SHADOWS, RADIUS, BACKDROP } from '../../theme/design-system';
import { transitions, entranceVariants, hoverVariants } from '../../animations/premium-motion';

interface PremiumCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'gradient' | 'neon' | 'holographic';
  hover?: boolean;
  tilt?: boolean;
  glow?: boolean;
  blur?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  entrance?: keyof typeof entranceVariants;
  delay?: number;
}

export function PremiumCard({
  children,
  variant = 'default',
  hover = true,
  tilt = false,
  glow = false,
  blur = false,
  padding = 'md',
  className = '',
  onClick,
  entrance = 'fadeInUp',
  delay = 0,
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

  // Get variant styles
  const getVariantStyles = () => {
    const variants = {
      default: {
        background: COLORS.neutral[0],
        boxShadow: SHADOWS.lg,
        border: `1px solid ${COLORS.neutral[200]}`,
      },
      glass: {
        background: GRADIENTS.glass.light,
        backdropFilter: `${BACKDROP.blur.lg} saturate(180%)`,
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: SHADOWS.glass,
      },
      elevated: {
        background: COLORS.neutral[0],
        boxShadow: SHADOWS['2xl'],
        transform: 'translateY(-4px)',
      },
      gradient: {
        background: GRADIENTS.mesh.cool,
        color: COLORS.neutral[0],
        boxShadow: SHADOWS['2xl'],
        border: 'none',
      },
      neon: {
        background: COLORS.neutral[900],
        border: `2px solid ${COLORS.primary[400]}`,
        boxShadow: `0 0 20px ${COLORS.primary[400]}40, inset 0 0 20px ${COLORS.primary[400]}20`,
        color: COLORS.neutral[0],
      },
      holographic: {
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7b8, #96ceb4, #ffeaa7)',
        backgroundSize: '400% 400%',
        animation: 'holographic 4s ease infinite',
        color: COLORS.neutral[0],
        boxShadow: SHADOWS['2xl'],
        border: 'none',
      },
    };
    
    return variants[variant];
  };

  // Get padding styles
  const getPaddingStyles = () => {
    const paddings = {
      none: '0',
      sm: '12px',
      md: '20px',
      lg: '28px', 
      xl: '36px',
    };
    
    return { padding: paddings[padding] };
  };

  const variantStyles = getVariantStyles();
  const paddingStyles = getPaddingStyles();

  return (
    <>
      <motion.div
        ref={cardRef}
        className={`
          relative rounded-2xl transition-all duration-300 transform-gpu
          ${onClick ? 'cursor-pointer' : ''}
          ${className}
        `}
        style={{
          ...variantStyles,
          ...paddingStyles,
          borderRadius: RADIUS['2xl'],
          rotateX: tilt ? rotateX : 0,
          rotateY: tilt ? rotateY : 0,
          transformStyle: tilt ? 'preserve-3d' : 'flat',
        }}
        initial={entranceVariants[entrance]?.initial}
        animate={entranceVariants[entrance]?.animate}
        transition={{
          ...entranceVariants[entrance]?.transition,
          delay,
        }}
        whileHover={hover && !onClick ? hoverVariants.gentleLift : {}}
        whileTap={onClick ? tapVariants.press : {}}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        {/* Glow effect */}
        {glow && isHovered && (
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: variantStyles.background,
              filter: 'blur(20px)',
              zIndex: -1,
              transform: 'scale(1.1)',
            }}
            transition={transitions.micro}
          />
        )}

        {/* Blur overlay */}
        {blur && (
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none"
            style={{
              backdropFilter: BACKDROP.blur.xl,
              background: 'rgba(255, 255, 255, 0.1)',
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Interactive shine effect */}
        {hover && isHovered && (
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{ transform: 'skewX(-20deg)' }}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Holographic animation styles */}
      {variant === 'holographic' && (
        <style jsx>{`
          @keyframes holographic {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      )}
    </>
  );
}
