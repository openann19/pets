/**
 * 💎 PREMIUM BUTTON COMPONENT
 * Jaw-dropping button with advanced animations, haptics, sound, and glass morphism
 * The most advanced button component you'll ever see
 */

'use client';

import { useMotionValue, useSpring } from 'framer-motion';
import React, { useCallback, useRef, useState, type JSX } from 'react';
import { hoverVariants, tapVariants, transitions } from '../../animations/premium-motion';
import { COLORS, GRADIENTS, RADIUS, SHADOWS } from '../../theme/design-system';
import { MotionButton, MotionDiv, MotionSpan } from '../../utils/Motion';
import { fromCss, makeConditionalStyle, makeHover, makeTap, springMicro, style as styleMerge } from '../../utils/motionTypes';

interface PremiumButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'glass' | 'gradient' | 'neon' | 'holographic';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  haptic?: boolean;
  sound?: boolean;
  glow?: boolean;
  particles?: boolean;
  magneticEffect?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';

  /**
   * Accessible label for screen readers
   */
  'aria-label'?: string;

  /**
   * Whether the button is disabled for accessibility
   */
  'aria-disabled'?: boolean;

  /**
   * ARIA role override
   */
  role?: string;

  /**
   * Tab index for accessibility
   */
  tabIndex?: number;
}

export const PremiumButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  haptic = true,
  sound = true,
  glow = false,
  particles = false,
  magneticEffect = false,
  className = '',
  type = 'button',
  'aria-label': ariaLabel,
  'aria-disabled': ariaDisabled,
  role,
  tabIndex,
}: PremiumButtonProps): JSX.Element => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  // Magnetic effect using motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springMicro);
  const springY = useSpring(y, springMicro);

  // Advanced haptic feedback
  const triggerHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!haptic || typeof window === 'undefined') return;

    // Web Haptic API (if available)
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 30],
      };
      navigator.vibrate(patterns[intensity]);
    }
  }, [haptic]);

  // Advanced sound feedback
  const triggerSound = useCallback((type: 'hover' | 'press' | 'success') => {
    if (!sound || typeof window === 'undefined') return;

    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const frequencies = { hover: 800, press: 600, success: 1000 };
      oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch {
      // Audio feedback not available - silently fail
    }
  }, [sound]);

  // Magnetic mouse tracking
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!magneticEffect || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 50;

    if (distance < maxDistance) {
      const strength = 1 - distance / maxDistance;
      x.set(deltaX * strength * 0.3);
      y.set(deltaY * strength * 0.3);
    }
  }, [magneticEffect, x, y]);

  const handleMouseLeave = useCallback(() => {
    if (magneticEffect !== null && magneticEffect !== undefined) {
      x.set(0);
      y.set(0);
    }
  }, [magneticEffect, x, y]);

  // Enhanced click handler
  const handleClick = useCallback(() => {
    if (disabled || loading) return;

    triggerHaptic('medium');
    triggerSound('press');

    if (particles !== null && particles !== undefined) {
      setShowParticles(true);
      setTimeout(() => { setShowParticles(false); }, 600);
    }

    onClick?.();
  }, [disabled, loading, onClick, triggerHaptic, triggerSound, particles]);

  // Get variant styles
  const getVariantStyles = (): React.CSSProperties => {
    const variants = {
      primary: {
        background: GRADIENTS.primary,
        color: COLORS.neutral[0],
        boxShadow: glow ? SHADOWS.primaryGlow : SHADOWS.lg,
        border: 'none',
      },
      secondary: {
        background: GRADIENTS.secondary,
        color: COLORS.neutral[0],
        boxShadow: glow ? SHADOWS.secondaryGlow : SHADOWS.lg,
        border: 'none',
      },
      glass: {
        background: GRADIENTS.glass.light,
        backdropFilter: 'blur(16px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        color: COLORS.neutral[800],
        boxShadow: SHADOWS.glass,
      },
      gradient: {
        background: GRADIENTS.mesh.warm,
        color: COLORS.neutral[0],
        boxShadow: glow ? SHADOWS['2xl'] : SHADOWS.xl,
        border: 'none',
      },
      neon: {
        background: COLORS.neutral[900],
        color: COLORS.primary[400],
        border: `2px solid ${COLORS.primary[400]}`,
        boxShadow: `0 0 20px ${COLORS.primary[400]}40`,
        filter: glow ? `drop-shadow(0 0 10px ${COLORS.primary[400]})` : 'none',
      },
      holographic: {
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7b8, #96ceb4, #ffeaa7)',
        backgroundSize: '400% 400%',
        color: COLORS.neutral[0],
        boxShadow: SHADOWS['2xl'],
        border: 'none',
        animation: 'holographic 3s ease infinite',
      },
    };

    return variants[variant];
  };

  // Get size styles
  const getSizeStyles = (): React.CSSProperties => {
    const sizes = {
      sm: {
        padding: '8px 16px',
        fontSize: '14px',
        minHeight: '36px',
        borderRadius: RADIUS.lg,
      },
      md: {
        padding: '12px 24px',
        fontSize: '16px',
        minHeight: '44px',
        borderRadius: RADIUS.xl,
      },
      lg: {
        padding: '16px 32px',
        fontSize: '18px',
        minHeight: '52px',
        borderRadius: RADIUS['2xl'],
      },
      xl: {
        padding: '20px 40px',
        fontSize: '20px',
        minHeight: '60px',
        borderRadius: RADIUS['2xl'],
      },
    };

    return sizes[size];
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <div className="relative inline-block">
      {/* Particle Effect */}
      {showParticles !== undefined && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <MotionDiv
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              initial={{
                x: '50%',
                y: '50%',
                opacity: 1,
                scale: 0,
              }}
              animate={{
                x: `${50 + (Math.random() - 0.5) * 200}%`,
                y: `${50 + (Math.random() - 0.5) * 200}%`,
                opacity: 0,
                scale: 1,
              }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      <MotionButton
        ref={buttonRef}
        type={type}
        aria-label={ariaLabel}
        aria-disabled={ariaDisabled}
        role={role || 'button'}
        tabIndex={tabIndex ?? 0}
        disabled={disabled || loading}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => {
          triggerHaptic('light');
          triggerSound('hover');
        }}
        onMouseDown={() => { setIsPressed(true); }}
        onMouseUp={() => { setIsPressed(false); }}
        style={styleMerge(makeConditionalStyle({
          x: magneticEffect ? springX : 0,
          y: magneticEffect ? springY : 0,
          ...fromCss(variantStyles),
          ...fromCss(sizeStyles),
          width: fullWidth ? '100%' : 'auto',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          ...(isPressed ? { outline: '2px solid var(--pm-primary)' } : {}),
        }))}
        className={`
          relative inline-flex items-center justify-center
          font-semibold transition-all duration-200
          transform-gpu outline-none focus:outline-none
          ${disabled ? 'pointer-events-none' : ''}
          ${className}
        `}
        {...(!disabled && { whileHover: makeHover(hoverVariants.glow) })}
        {...(!disabled && { whileTap: makeTap(tapVariants.press) })}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: disabled ? 0.5 : 1, scale: 1 }}
        transition={transitions.spring}
      >
        {/* Glow effect overlay */}
        {glow !== undefined && !disabled && (
          <MotionDiv
            className="absolute inset-0 rounded-inherit"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            style={{
              background: typeof variantStyles.background === 'string' ? variantStyles.background : 'currentColor',
              filter: 'blur(8px)',
              zIndex: -1,
            }}
            transition={transitions.micro}
          />
        )}

        {/* Loading overlay */}
        {loading !== undefined && (
          <MotionDiv
            className="absolute inset-0 rounded-inherit bg-black bg-opacity-20 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={transitions.micro}
          >
            <MotionDiv
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </MotionDiv>
        )}

        {/* Content */}
        <MotionDiv
          className="flex items-center justify-center gap-2"
          animate={{
            scale: isPressed ? 0.95 : 1,
            opacity: loading ? 0 : 1,
          }}
          transition={transitions.micro}
        >
          {icon !== undefined && iconPosition === 'left' && (
            <MotionSpan
              className="flex-shrink-0"
              whileHover={{ rotate: 10 }}
              transition={transitions.micro}
            >
              {icon}
            </MotionSpan>
          )}

          <span>{children}</span>

          {icon !== undefined && iconPosition === 'right' && (
            <MotionSpan
              className="flex-shrink-0"
              whileHover={{ rotate: -10 }}
              transition={transitions.micro}
            >
              {icon}
            </MotionSpan>
          )}
        </MotionDiv>

        {/* Ripple effect */}
        <MotionDiv
          className="absolute inset-0 rounded-inherit overflow-hidden pointer-events-none"
          initial={false}
          animate={isPressed ? { scale: 1 } : { scale: 0 }}
        >
          <MotionDiv
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
        </MotionDiv>
      </MotionButton>

      {/* Holographic animation styles */}
      {variant === 'holographic' && (
        <style>{`
          @keyframes holographic {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      )}
    </div>
  );
}
