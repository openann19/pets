/**
 * 💎 ENHANCED Premium Card Component - Ultra Elite UI
 * Advanced card with glass morphism, 3D effects, and jaw-dropping animations
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
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  entrance?: 'fadeInUp' | 'scaleIn' | 'slideInLeft' | 'slideInRight';
  delay?: number;
  shimmer?: boolean;
  magnetic?: boolean;
}

export default function PremiumCard({
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
  shimmer = false,
  magnetic = false,
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

  // Magnetic effect
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (magnetic && cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease';
    }
  };

  // Get enhanced variant styles with premium effects
  const getVariantClasses = () => {
    const variants = {
      default: "bg-white shadow-premium border border-gray-200 hover:shadow-premium-lg",
      glass: "glass-light shadow-glass border border-white/30 backdrop-blur-premium",
      elevated: "bg-white shadow-premium-lg hover:shadow-2xl transform hover:-translate-y-2",
      gradient: "bg-mesh-gradient text-white shadow-premium-lg border-none hover:animate-glow",
      neon: "bg-gray-900 border-2 border-pink-400 text-pink-400 hover:shadow-neon hover:border-pink-300",
      holographic: "bg-mesh-gradient text-white shadow-premium-lg border-none animate-holographic hover:animate-glow",
    };
    
    return variants[variant];
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

  return (
    <>
      <motion.div
        ref={cardRef}
        className={`
          relative rounded-2xl transition-all duration-300 transform-gpu
          ${variantClasses}
          ${paddingClasses}
          ${onClick ? 'cursor-pointer' : ''}
          ${tilt ? 'perspective-1000 preserve-3d' : ''}
          ${className}
        `}
        style={{
          rotateX: tilt ? rotateX : 0,
          rotateY: tilt ? rotateY : 0,
        }}
        initial={PREMIUM_VARIANTS[entrance]?.initial || PREMIUM_VARIANTS.fadeInUp.initial}
        animate={PREMIUM_VARIANTS[entrance]?.animate || PREMIUM_VARIANTS.fadeInUp.animate}
        transition={{
          ...(PREMIUM_VARIANTS[entrance]?.transition || SPRING_CONFIG),
          delay,
        }}
        whileHover={hover && !onClick ? { 
          scale: magnetic ? 1.05 : 1.02, 
          y: magnetic ? -8 : -4,
          transition: SPRING_CONFIG
        } : {}}
        whileTap={onClick ? { scale: 0.98, transition: SPRING_CONFIG } : {}}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        {/* Glow effect */}
        {glow && isHovered && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none bg-purple-500 opacity-20 blur-xl scale-110 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Blur overlay */}
        {blur && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none backdrop-blur-xl bg-white/10"
          />
        )}

        {/* Shimmer effect */}
        {shimmer && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
              animate={{ x: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
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
      </motion.div>
    </>
  );
}
