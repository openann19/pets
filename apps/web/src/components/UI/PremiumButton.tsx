'use client';
import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { SPRING_CONFIG } from '@/constants/animations';
import { COLORS, SHADOWS } from '@/constants/design-tokens';

interface PremiumButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass' | 'solid' | 'outline' | 'holographic' | 'neon' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  haptic?: boolean;
  sound?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  glow?: boolean;
  magneticEffect?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Premium Button with Phase 2 compliance:
 * - Spring physics animations (not duration-based)
 * - Haptic feedback integration
 * - Sound effects
 * - 3D perspective on hover
 * - Consistent tactile feedback
 */
const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  haptic = true,
  sound = true,
  icon,
  iconPosition = 'left',
  glow = false,
  magneticEffect = false,
  fullWidth = false,
  type = 'button',
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isPressed, setIsPressed] = useState(false);

  // Magnetic effect using motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 25 });
  const springY = useSpring(y, { stiffness: 400, damping: 25 });
  
  const baseClasses = "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none transform-gpu overflow-hidden backdrop-blur";
  
  const variantClasses = {
    primary: {
      background: 'rgba(59, 130, 246, 0.12)',
      color: COLORS.neutral[0],
      boxShadow: glow ? SHADOWS.primaryGlow : SHADOWS.lg,
      border: '1px solid rgba(255,255,255,0.12)',
    },
    secondary: {
      background: COLORS.secondary[700],
      color: COLORS.neutral[0],
      boxShadow: glow ? SHADOWS.secondaryGlow : SHADOWS.lg,
      border: 'none',
    },
    danger: {
      background: COLORS.error[600],
      color: COLORS.neutral[0],
      boxShadow: glow ? SHADOWS.errorGlow : SHADOWS.lg,
      border: 'none',
    },
    ghost: {
      background: 'transparent',
      color: '#e5e7eb',
      border: '1px solid rgba(255,255,255,0.12)',
      boxShadow: 'none',
    },
    glass: {
      background: 'rgba(255,255,255,0.08)',
      backdropFilter: 'blur(12px) saturate(140%)',
      border: '1px solid rgba(255,255,255,0.12)',
      color: '#f1f5f9',
      boxShadow: SHADOWS.glass,
    },
    solid: {
      background: COLORS.neutral[900],
      color: COLORS.neutral[0],
      border: 'none',
      boxShadow: SHADOWS.lg,
    },
    outline: {
      background: 'transparent',
      color: '#e5e7eb',
      border: '1px solid rgba(255,255,255,0.12)',
      boxShadow: 'none',
    },
    holographic: {
      background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(37,99,235,0.25))',
      color: '#f8fafc',
      border: '1px solid rgba(255,255,255,0.12)',
      boxShadow: SHADOWS['2xl'],
      backgroundSize: '200% 200%',
      animation: 'holographic 8s ease infinite',
      filter: 'saturate(105%)',
    },
    neon: {
      background: 'rgba(2,6,23,0.6)',
      color: COLORS.primary[500],
      border: '1px solid rgba(59,130,246,0.4)',
      boxShadow: `0 0 20px rgba(59,130,246,0.25)`,
    },
    gradient: {
      background: 'linear-gradient(135deg, #667eea, #ec4899)',
      color: '#ffffff',
      border: 'none',
      boxShadow: SHADOWS['2xl'],
    },
  } as const;

  const sizeClasses = {
    sm: "px-4 py-2 text-sm min-h-[36px]",
    md: "px-6 py-3 text-base min-h-[44px]",
    lg: "px-8 py-4 text-lg min-h-[52px]"
  };

  // Enhanced haptic feedback
  const triggerHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!haptic || typeof window === 'undefined') return;
    
    if ('vibrate' in navigator) {
      const patterns = {
        light: [8],
        medium: [15],
        heavy: [25, 10, 15],
      };
      navigator.vibrate(patterns[intensity]);
    }
  }, [haptic]);

  // Enhanced sound feedback
  const triggerSound = useCallback((type: 'hover' | 'press' = 'press') => {
    if (!sound || typeof window === 'undefined') return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const frequencies = { hover: 800, press: 600 };
      oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.debug('Audio feedback not available');
    }
  }, [sound]);

  // Magnetic mouse tracking
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!magneticEffect || !buttonRef.current || disabled) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 50;
    
    if (distance < maxDistance) {
      const strength = 1 - distance / maxDistance;
      x.set(deltaX * strength * 0.2);
      y.set(deltaY * strength * 0.2);
    }
  }, [magneticEffect, x, y, disabled]);

  const handleMouseLeave = useCallback(() => {
    if (magneticEffect) {
      x.set(0);
      y.set(0);
    }
  }, [magneticEffect, x, y]);

  const handleClick = () => {
    if (disabled || loading) return;

    triggerHaptic('medium');
    triggerSound('press');
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);

    onClick?.();
  };

  const variantStyle = variantClasses[variant];

  const wrapperClass = fullWidth ? "relative block w-full" : "relative inline-block";

  return (
    <div className={wrapperClass}>
      <motion.button
        ref={buttonRef}
        type={type}
        className={`
          ${baseClasses}
          ${sizeClasses[size]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        style={{
          ...variantStyle,
          x: magneticEffect ? springX : 0,
          y: magneticEffect ? springY : 0,
        }}
        onClick={handleClick}
        disabled={disabled || loading}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => triggerSound('hover')}
        
        // Enhanced hover animation
        whileHover={!disabled && !loading ? {
          scale: 1.02,
          y: -2,
          rotateY: 1,
          transition: { type: "spring", stiffness: 400, damping: 25 },
        } : {}}
        
        // Enhanced tap animation  
        whileTap={!disabled && !loading ? {
          scale: 0.98,
          y: 0,
          transition: { type: "spring", stiffness: 400, damping: 25 },
        } : {}}
        
        // Entry animation
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: disabled ? 0.5 : 1, scale: 1 }}
        transition={SPRING_CONFIG}
      >
        {/* Shimmer overlay for holographic variant */}
        {variant === 'holographic' && (
          <div
            className="pointer-events-none absolute inset-0 rounded-xl animate-shimmer"
            style={{ opacity: 0.18 }}
          />
        )}
        {/* Glow effect */}
        {glow && !disabled && (
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            style={{
              background: variantStyle.background,
              filter: 'blur(12px)',
              zIndex: -1,
              transform: 'scale(1.1)',
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        )}

        {/* Loading overlay */}
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-inherit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <motion.div
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>
        )}

        {/* Enhanced content with icon support */}
        <motion.div
          className="flex items-center justify-center gap-2"
          animate={{ 
            scale: isPressed ? 0.95 : 1,
            opacity: loading ? 0 : 1,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {icon && iconPosition === 'left' && (
            <motion.span
              className="flex-shrink-0"
              whileHover={{ rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {icon}
            </motion.span>
          )}
          
          <span>{children}</span>
          
          {icon && iconPosition === 'right' && (
            <motion.span
              className="flex-shrink-0"
              whileHover={{ rotate: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {icon}
            </motion.span>
          )}
        </motion.div>

        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-inherit overflow-hidden pointer-events-none"
          initial={false}
          animate={isPressed ? { scale: 1 } : { scale: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-white opacity-20"
            initial={{ scale: 0 }}
            animate={isPressed ? { scale: 4 } : { scale: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              borderRadius: '50%',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </motion.div>
      </motion.button>
    </div>
  );
};

export default PremiumButton;
