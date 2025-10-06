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
  shimmer?: boolean;
  magnetic?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  entrance?: 'fadeInUp' | 'scaleIn' | 'slideInLeft' | 'slideInRight';
  delay?: number;
}

export default function PremiumCard({
  children,
  variant = 'default',
  hover = false,
  tilt = false,
  glow = false,
  blur = false,
  shimmer = false,
  magnetic = false,
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

  // Get enhanced variant styles with premium effects
  const getVariantClasses = () => {
    const variants = {
      default: "text-white border border-white/15",
      glass: "text-white border border-white/20",
      elevated: "text-white border border-white/15 shadow-premium-lg hover:shadow-2xl transform hover:-translate-y-2",
      gradient: "text-white border border-white/15",
      neon: "border border-blue-500/40 text-blue-300 hover:shadow-[0_0_24px_rgba(59,130,246,0.25)]",
      holographic: "text-white border border-white/15",
    };
    
    return variants[variant];
  };

  // Get enhanced background styles with better glassmorphism
  const getBackgroundStyle = () => {
    const backgrounds = {
      default: {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      },
      glass: {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
        backdropFilter: 'blur(24px) saturate(200%)',
        WebkitBackdropFilter: 'blur(24px) saturate(200%)',
      },
      elevated: {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      },
      gradient: {
        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      },
      neon: {
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      },
      holographic: {
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.15) 50%, rgba(236, 72, 153, 0.15) 100%)',
        backdropFilter: 'blur(24px) saturate(200%)',
        WebkitBackdropFilter: 'blur(24px) saturate(200%)',
      },
    };
    
    return backgrounds[variant];
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
  const backgroundStyle = getBackgroundStyle();

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
          ...backgroundStyle,
          rotateX: tilt ? rotateX : 0,
          rotateY: tilt ? rotateY : 0,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        }}
        initial={PREMIUM_VARIANTS[entrance]?.initial || { opacity: 0, y: 10 }}
        animate={PREMIUM_VARIANTS[entrance]?.animate || { opacity: 1, y: 0 }}
        transition={{ ...(PREMIUM_VARIANTS[entrance]?.transition || SPRING_CONFIG), delay }}
        whileHover={hover ? { scale: 1.02, y: -4 } : {}}
        whileTap={onClick ? { scale: 0.98 } : {}}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        {/* Glow effect */}
        {glow && isHovered && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none bg-blue-500/20 blur-xl scale-110 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Blur overlay */}
        {blur && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none backdrop-blur-lg bg-white/5"
          />
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

        {/* Shimmer effect */}
        {shimmer && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        )}

        {/* Magnetic effect */}
        {magnetic && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.1) 0%, transparent 50%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    </>
  );
}
