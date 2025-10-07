/**
 * 💎 UNIFIED PREMIUM BUTTON COMPONENT
 * Single source of truth for premium button styling across web and mobile
 * Features: Advanced animations, haptic feedback, accessibility, and unified design system
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import { ANIMATIONS, COLORS, GRADIENTS, SHADOWS, TYPOGRAPHY } from '../theme/design-tokens';
export function UnifiedPremiumButton({ children, onClick, variant = 'primary', size = 'md', disabled = false, loading = false, icon, iconPosition = 'left', fullWidth = false, glow = false, magneticEffect = false, className = '', type = 'button', href, as: Component = 'button', isValid = true, isDirty = true, haptic = true, sound = true, particles = false, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy, 'aria-pressed': ariaPressed, 'aria-expanded': ariaExpanded, 'aria-haspopup': ariaHasPopup, 'aria-controls': ariaControls, 'aria-live': ariaLive, 'aria-atomic': ariaAtomic, 'aria-relevant': ariaRelevant, role, tabIndex, 'data-testid': testId, }) {
    const buttonRef = useRef(null);
    const [isPressed, setIsPressed] = useState(false);
    // Magnetic effect using motion values
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, ANIMATIONS.spring.micro);
    const springY = useSpring(y, ANIMATIONS.spring.micro);
    // Enhanced haptic feedback
    const triggerHaptic = useCallback((intensity = 'medium') => {
        if (!haptic || typeof window === 'undefined')
            return;
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
    const triggerSound = useCallback((type = 'press') => {
        if (!sound || typeof window === 'undefined')
            return;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass)
                return;
            const audioContext = new AudioContextClass();
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
        }
        catch {
            // Audio feedback not available
        }
    }, [sound]);
    // Magnetic mouse tracking
    const handleMouseMove = useCallback((event) => {
        if (!magneticEffect || !buttonRef.current || disabled)
            return;
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
    const handleMouseEnter = useCallback(() => {
        triggerSound('hover');
    }, [triggerSound]);
    const handleClick = () => {
        if (disabled || loading)
            return;
        triggerHaptic('medium');
        triggerSound('press');
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 200);
        onClick?.();
    };
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick();
        }
    };
    // Get variant styles using design tokens
    const getVariantStyles = () => {
        const variants = {
            primary: {
                background: GRADIENTS.primary,
                color: COLORS.neutral[0],
                boxShadow: glow ? SHADOWS.primaryGlow : SHADOWS.lg,
                border: '1px solid rgba(255,255,255,0.2)',
                fontWeight: TYPOGRAPHY.weights.semibold,
            },
            secondary: {
                background: GRADIENTS.secondary,
                color: COLORS.neutral[0],
                boxShadow: glow ? SHADOWS.secondaryGlow : SHADOWS.lg,
                border: '1px solid rgba(255,255,255,0.2)',
                fontWeight: TYPOGRAPHY.weights.semibold,
            },
            tertiary: {
                background: GRADIENTS.tertiary,
                color: COLORS.neutral[0],
                boxShadow: glow ? SHADOWS.tertiaryGlow : SHADOWS.lg,
                border: '1px solid rgba(255,255,255,0.2)',
                fontWeight: TYPOGRAPHY.weights.semibold,
            },
            glass: {
                background: GRADIENTS.glass.medium,
                backdropFilter: 'blur(16px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: COLORS.neutral[0],
                boxShadow: SHADOWS.glass,
                fontWeight: TYPOGRAPHY.weights.semibold,
            },
            outline: {
                background: 'transparent',
                color: COLORS.primary[500],
                border: `2px solid ${COLORS.primary[500]}`,
                boxShadow: 'none',
                fontWeight: TYPOGRAPHY.weights.medium,
            },
            ghost: {
                background: 'transparent',
                color: COLORS.neutral[0],
                border: '2px solid rgba(255,255,255,0.3)',
                boxShadow: 'none',
                fontWeight: TYPOGRAPHY.weights.medium,
            },
            danger: {
                background: `linear-gradient(135deg, ${COLORS.error[500]} 0%, ${COLORS.error[600]} 100%)`,
                color: COLORS.neutral[0],
                boxShadow: glow ? SHADOWS.errorGlow : SHADOWS.lg,
                border: '1px solid rgba(255,255,255,0.2)',
                fontWeight: TYPOGRAPHY.weights.semibold,
            },
            success: {
                background: `linear-gradient(135deg, ${COLORS.success[500]} 0%, ${COLORS.success[600]} 100%)`,
                color: COLORS.neutral[0],
                boxShadow: glow ? SHADOWS.successGlow : SHADOWS.lg,
                border: '1px solid rgba(255,255,255,0.2)',
                fontWeight: TYPOGRAPHY.weights.semibold,
            },
            warning: {
                background: `linear-gradient(135deg, ${COLORS.warning[500]} 0%, ${COLORS.warning[600]} 100%)`,
                color: COLORS.neutral[0],
                boxShadow: glow ? SHADOWS.warningGlow : SHADOWS.lg,
                border: '1px solid rgba(255,255,255,0.2)',
                fontWeight: TYPOGRAPHY.weights.semibold,
            },
            holographic: {
                background: GRADIENTS.holographic,
                color: COLORS.neutral[0],
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: SHADOWS.neon,
                backgroundSize: '200% 200%',
                animation: 'holographic 8s ease infinite',
                filter: 'saturate(120%)',
                fontWeight: TYPOGRAPHY.weights.semibold,
            },
            neon: {
                background: GRADIENTS.neon,
                color: COLORS.neutral[0],
                border: '1px solid rgba(16, 185, 129, 0.6)',
                boxShadow: `0 0 30px rgba(16, 185, 129, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)`,
                fontWeight: TYPOGRAPHY.weights.semibold,
            },
        };
        return variants[variant];
    };
    // Get size styles using design tokens
    const getSizeStyles = () => {
        const sizes = {
            sm: {
                padding: '8px 16px',
                fontSize: TYPOGRAPHY.sizes.sm.size,
                minHeight: '36px',
                borderRadius: '0.75rem',
            },
            md: {
                padding: '12px 24px',
                fontSize: TYPOGRAPHY.sizes.base.size,
                minHeight: '44px',
                borderRadius: '1rem',
            },
            lg: {
                padding: '16px 32px',
                fontSize: TYPOGRAPHY.sizes.lg.size,
                minHeight: '52px',
                borderRadius: '1.5rem',
            },
            xl: {
                padding: '20px 40px',
                fontSize: TYPOGRAPHY.sizes.xl.size,
                minHeight: '60px',
                borderRadius: '1.5rem',
            },
        };
        return sizes[size];
    };
    const variantStyle = getVariantStyles();
    const sizeStyle = getSizeStyles();
    const isDisabled = disabled || loading || !isValid || !isDirty;
    const baseClasses = "relative inline-flex items-center justify-center font-semibold transition-all focus:outline-none transform-gpu overflow-hidden backdrop-blur";
    const wrapperClass = fullWidth ? "relative block w-full" : "relative inline-block";
    // If href is provided, render as Link
    if (href) {
        const LinkComponent = Component;
        return (_jsx("div", { className: wrapperClass, children: _jsx(LinkComponent, { href: href, className: "block", children: _jsx(motion.button, { ref: buttonRef, type: type, className: `
              ${baseClasses}
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${fullWidth ? 'w-full' : ''}
              ${className}
            `, style: {
                        ...variantStyle,
                        ...sizeStyle,
                        x: springX,
                        y: springY,
                    }, whileHover: !isDisabled ? {
                        scale: 1.02,
                        y: -2,
                        transition: ANIMATIONS.spring.micro
                    } : {}, whileTap: !isDisabled ? {
                        scale: 0.98,
                        transition: ANIMATIONS.spring.micro
                    } : {}, onMouseMove: handleMouseMove, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, onClick: handleClick, onKeyDown: handleKeyDown, "aria-label": ariaLabel, "aria-describedby": ariaDescribedBy, "aria-pressed": ariaPressed, "aria-expanded": ariaExpanded, "aria-haspopup": ariaHasPopup, "aria-controls": ariaControls, "aria-live": ariaLive, "aria-atomic": ariaAtomic, "aria-relevant": ariaRelevant, role: role, tabIndex: tabIndex, disabled: isDisabled, "aria-disabled": isDisabled, "data-testid": testId, children: renderButtonContent() }) }) }));
    }
    function renderButtonContent() {
        return (_jsxs(_Fragment, { children: [variant === 'holographic' && (_jsx("div", { className: "pointer-events-none absolute inset-0 animate-shimmer", style: {
                        opacity: 0.18,
                        borderRadius: sizeStyle.borderRadius,
                    } })), glow && !isDisabled && (_jsx(motion.div, { className: "absolute inset-0 pointer-events-none", initial: { opacity: 0 }, whileHover: { opacity: 1 }, style: {
                        background: variantStyle.background,
                        filter: 'blur(12px)',
                        zIndex: -1,
                        transform: 'scale(1.1)',
                        borderRadius: sizeStyle.borderRadius,
                    }, transition: ANIMATIONS.spring.micro })), loading && (_jsx(motion.div, { className: "absolute inset-0 flex items-center justify-center bg-black bg-opacity-20", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: ANIMATIONS.spring.micro, style: { borderRadius: sizeStyle.borderRadius }, children: _jsx(motion.div, { className: "w-5 h-5 border-2 border-white border-t-transparent rounded-full", animate: { rotate: 360 }, transition: {
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                        }, "data-testid": "loading-spinner" }) })), _jsxs(motion.div, { className: "flex items-center justify-center gap-2", animate: {
                        scale: isPressed ? 0.95 : 1,
                        opacity: loading ? 0 : 1,
                    }, transition: ANIMATIONS.spring.micro, children: [icon && iconPosition === 'left' && (_jsx(motion.span, { className: "flex-shrink-0", whileHover: { rotate: 5 }, transition: ANIMATIONS.spring.micro, children: icon })), _jsx("span", { children: children }), icon && iconPosition === 'right' && (_jsx(motion.span, { className: "flex-shrink-0", whileHover: { rotate: -5 }, transition: ANIMATIONS.spring.micro, children: icon }))] }), _jsx(motion.div, { className: "absolute inset-0 overflow-hidden pointer-events-none", initial: false, animate: isPressed ? { scale: 1 } : { scale: 0 }, style: { borderRadius: sizeStyle.borderRadius }, children: _jsx(motion.div, { className: "absolute inset-0 bg-white opacity-20", initial: { scale: 0 }, animate: isPressed ? { scale: 4 } : { scale: 0 }, transition: { duration: 0.6, ease: 'easeOut' }, style: {
                            borderRadius: '50%',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                        } }) })] }));
    }
    return (_jsx("div", { className: wrapperClass, children: _jsx(motion.button, { ref: buttonRef, type: type, className: `
          ${baseClasses}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `, style: {
                ...variantStyle,
                ...sizeStyle,
                x: magneticEffect ? springX : 0,
                y: magneticEffect ? springY : 0,
            }, onClick: handleClick, onKeyDown: handleKeyDown, disabled: isDisabled, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave, onMouseEnter: handleMouseEnter, "aria-label": ariaLabel, "aria-describedby": ariaDescribedBy, "aria-pressed": ariaPressed, "aria-expanded": ariaExpanded, "aria-haspopup": ariaHasPopup, "aria-controls": ariaControls, "aria-live": ariaLive, "aria-atomic": ariaAtomic, "aria-relevant": ariaRelevant, "aria-disabled": isDisabled, role: role, tabIndex: tabIndex, "data-testid": testId, ...(!isDisabled ? {
                whileHover: {
                    scale: 1.02,
                    y: -2,
                    rotateY: 1,
                    transition: ANIMATIONS.spring.micro,
                },
                whileTap: {
                    scale: 0.98,
                    y: 0,
                    transition: ANIMATIONS.spring.micro,
                }
            } : {}), 
            // Entry animation
            initial: { opacity: 0, scale: 0.95 }, animate: { opacity: isDisabled ? 0.5 : 1, scale: 1 }, transition: ANIMATIONS.spring.smooth, children: renderButtonContent() }) }));
}
//# sourceMappingURL=UnifiedPremiumButton.js.map