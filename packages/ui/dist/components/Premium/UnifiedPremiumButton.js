/**
 * 💎 UNIFIED PREMIUM BUTTON COMPONENT
 * Simplified version with unified design system for consistent styling
 * Enhanced with dynamic validation states and unified visual feedback
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import { ANIMATION_SYSTEM, utils } from '../../theme/unified-design-system';
export function UnifiedPremiumButton({ children, onClick, variant = 'primary', size = 'md', disabled = false, loading = false, icon, iconPosition = 'left', fullWidth = false, glow = false, className = '', type = 'button', isValid = true, isDirty = true, haptic = true, sound = true, particles = false, magneticEffect = false, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy, 'aria-pressed': ariaPressed, 'aria-expanded': ariaExpanded, 'aria-haspopup': ariaHasPopup, 'aria-controls': ariaControls, 'aria-live': ariaLive, 'aria-atomic': ariaAtomic, 'aria-relevant': ariaRelevant, role, tabIndex, 'data-testid': testId, }) {
    // Refs and state
    const buttonRef = useRef(null);
    const [isPressed, setIsPressed] = useState(false);
    const [showParticles, setShowParticles] = useState(false);
    // Motion values for magnetic effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 300, damping: 30 });
    const springY = useSpring(y, { stiffness: 300, damping: 30 });
    // Form validation logic
    const isFormValid = utils.shouldEnableButton({ isValid, isDirty, isLoading: loading });
    const shouldBeActive = variant === 'primary' ? isFormValid : true;
    // Haptic feedback
    const triggerHaptic = useCallback((intensity = 'medium') => {
        if (!haptic || disabled || loading)
            return;
        // Simulate haptic feedback (in real app, use device haptics)
        if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
            const patterns = {
                light: [10],
                medium: [20],
                heavy: [30]
            };
            navigator.vibrate(patterns[intensity]);
        }
    }, [haptic, disabled, loading]);
    // Sound feedback
    const triggerSound = useCallback((type) => {
        if (!sound || disabled || loading)
            return;
        // Simulate sound feedback (in real app, use audio files)
        const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
        const audioContext = new AudioContextClass();
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
    }, [sound, disabled, loading]);
    // Mouse interaction handlers
    const handleMouseMove = useCallback((event) => {
        if (!magneticEffect || disabled || loading)
            return;
        const rect = buttonRef.current?.getBoundingClientRect();
        if (!rect)
            return;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (event.clientX - centerX) * 0.3;
        const deltaY = (event.clientY - centerY) * 0.3;
        x.set(deltaX);
        y.set(deltaY);
    }, [magneticEffect, disabled, loading, x, y]);
    const handleMouseLeave = useCallback(() => {
        if (!magneticEffect)
            return;
        x.set(0);
        y.set(0);
    }, [magneticEffect, x, y]);
    const handleMouseEnter = useCallback(() => {
        if (disabled || loading || !shouldBeActive)
            return;
        triggerHaptic('light');
        triggerSound('hover');
    }, [disabled, loading, shouldBeActive, triggerHaptic, triggerSound]);
    const handleMouseDown = useCallback(() => {
        if (disabled || loading || !shouldBeActive)
            return;
        setIsPressed(true);
        triggerHaptic('medium');
        triggerSound('press');
    }, [disabled, loading, shouldBeActive, triggerHaptic, triggerSound]);
    const handleMouseUp = useCallback(() => {
        setIsPressed(false);
    }, []);
    const handleClick = useCallback(() => {
        if (disabled || loading || !shouldBeActive)
            return;
        if (particles) {
            setShowParticles(true);
            setTimeout(() => setShowParticles(false), 600);
        }
        triggerHaptic('heavy');
        triggerSound('success');
        onClick?.();
    }, [disabled, loading, shouldBeActive, particles, triggerHaptic, triggerSound, onClick]);
    const handleKeyDown = useCallback((event) => {
        if (disabled || loading || !shouldBeActive)
            return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick();
        }
    }, [disabled, loading, shouldBeActive, handleClick]);
    const handleFocus = useCallback(() => {
        if (disabled || loading || !shouldBeActive)
            return;
        triggerHaptic('light');
        triggerSound('hover');
    }, [disabled, loading, shouldBeActive, triggerHaptic, triggerSound]);
    // Get unified button styles
    const getButtonStyles = () => {
        // Map extended variants to supported variants
        const mappedVariant = variant === 'ghost' || variant === 'text' || variant === 'danger' || variant === 'success' || variant === 'warning' || variant === 'holographic' || variant === 'neon'
            ? 'outline'
            : variant;
        const baseStyles = utils.createButtonStyles(mappedVariant, size, 'web');
        // Apply dynamic opacity for inactive primary buttons
        const dynamicOpacity = (variant === 'primary' && !shouldBeActive) ? 0.5 : 1;
        // Convert all styles to strings for motion compatibility
        let background;
        if (Array.isArray(baseStyles.background)) {
            const [firstColor, secondColor] = baseStyles.background;
            background = `linear-gradient(135deg, ${firstColor} 0%, ${secondColor} 100%)`;
        }
        else if (typeof baseStyles.background === 'string') {
            const { background: bgValue } = baseStyles;
            background = bgValue;
        }
        else {
            background = 'transparent';
        }
        // Convert color to string
        let color;
        const colorValue = baseStyles.color;
        if (typeof colorValue === 'string') {
            color = colorValue;
        }
        else if (colorValue != null && typeof colorValue === 'object' && '500' in colorValue) {
            const colorRecord = colorValue;
            const { '500': color500 } = colorRecord;
            color = color500;
        }
        else {
            color = '#ffffff';
        }
        return {
            ...baseStyles,
            background,
            color,
            opacity: disabled ? 0.5 : dynamicOpacity,
            cursor: disabled || (variant === 'primary' && !shouldBeActive) ? 'not-allowed' : 'pointer',
            width: fullWidth ? '100%' : 'auto',
        };
    };
    const buttonStyles = getButtonStyles();
    return (_jsxs("div", { className: "relative inline-block", children: [showParticles && (_jsx("div", { className: "absolute inset-0 pointer-events-none", children: Array.from({ length: 6 }, (_, i) => (_jsx(motion.div, { className: "absolute w-2 h-2 bg-white rounded-full", initial: {
                        x: '50%',
                        y: '50%',
                        opacity: 1,
                        scale: 0,
                    }, animate: {
                        x: `${50 + (Math.random() - 0.5) * 200}%`,
                        y: `${50 + (Math.random() - 0.5) * 200}%`,
                        opacity: 0,
                        scale: 1,
                    }, transition: {
                        duration: 0.6,
                        delay: i * 0.1,
                        ease: 'easeOut',
                    } }, i))) })), _jsxs(motion.button, { ref: buttonRef, type: type, disabled: disabled || loading || (variant === 'primary' && !shouldBeActive), onClick: handleClick, onKeyDown: handleKeyDown, onFocus: handleFocus, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave, onMouseEnter: handleMouseEnter, onMouseDown: handleMouseDown, onMouseUp: handleMouseUp, style: {
                    x: magneticEffect ? springX : 0,
                    y: magneticEffect ? springY : 0,
                    ...buttonStyles,
                }, className: `
          relative inline-flex items-center justify-center
          font-semibold transition-all duration-200
          transform-gpu outline-none
          focus-visible:outline-2 focus-visible:outline-purple-500 
          focus-visible:outline-offset-2 focus-visible:ring-2
          focus-visible:ring-purple-500 focus-visible:ring-opacity-50
          ${disabled || (variant === 'primary' && !shouldBeActive) ? 'pointer-events-none' : ''}
          ${className}
        `, "aria-label": ariaLabel, "aria-describedby": ariaDescribedBy, "aria-pressed": ariaPressed, "aria-expanded": ariaExpanded, "aria-haspopup": ariaHasPopup, "aria-controls": ariaControls, "aria-live": ariaLive, "aria-atomic": ariaAtomic, "aria-relevant": ariaRelevant, "aria-disabled": disabled || loading || (variant === 'primary' && !shouldBeActive), role: role ?? 'button', tabIndex: tabIndex ?? (disabled || (variant === 'primary' && !shouldBeActive) ? -1 : 0), "data-testid": testId, whileHover: !disabled && !loading && shouldBeActive ? "glow" : undefined, whileTap: !disabled && !loading && shouldBeActive ? "press" : undefined, initial: { opacity: 0, scale: 0.9 }, animate: { opacity: disabled ? 0.5 : (variant === 'primary' && !shouldBeActive ? 0.5 : 1), scale: 1 }, transition: ANIMATION_SYSTEM.transitions.fast, children: [glow && !disabled && shouldBeActive && (_jsx(motion.div, { className: "absolute inset-0 rounded-inherit", initial: { opacity: 0 }, whileHover: { opacity: 1 }, style: {
                            background: buttonStyles.background,
                            filter: 'blur(8px)',
                            zIndex: -1,
                        }, transition: ANIMATION_SYSTEM.transitions.fast })), loading && (_jsx(motion.div, { className: "absolute inset-0 rounded-inherit bg-black bg-opacity-20 flex items-center justify-center", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: ANIMATION_SYSTEM.transitions.fast, children: _jsx(motion.div, { className: "w-5 h-5 border-2 border-white border-t-transparent rounded-full", animate: { rotate: 360 }, transition: {
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                            } }) })), _jsxs(motion.div, { className: "flex items-center justify-center gap-2", animate: {
                            scale: isPressed ? ANIMATION_SYSTEM.microInteractions.buttonPress.web.scale : 1,
                            opacity: loading ? 0 : 1,
                        }, transition: ANIMATION_SYSTEM.transitions.fast, children: [icon !== undefined && icon !== null && iconPosition === 'left' && (_jsx(motion.span, { className: "flex-shrink-0", whileHover: { rotate: 10 }, transition: ANIMATION_SYSTEM.transitions.fast, "aria-hidden": "true", children: icon })), _jsx("span", { children: children }), icon !== undefined && icon !== null && iconPosition === 'right' && (_jsx(motion.span, { className: "flex-shrink-0", whileHover: { rotate: -10 }, transition: ANIMATION_SYSTEM.transitions.fast, "aria-hidden": "true", children: icon }))] }), loading && (_jsx("span", { className: "sr-only", "aria-live": "polite", children: "Loading, please wait..." })), _jsx(motion.div, { className: "absolute inset-0 rounded-inherit overflow-hidden pointer-events-none", initial: false, animate: isPressed ? { scale: 1 } : { scale: 0 }, children: _jsx(motion.div, { className: "absolute inset-0 bg-white opacity-20", initial: { scale: 0 }, animate: isPressed ? { scale: 4 } : { scale: 0 }, transition: { duration: 0.6, ease: 'easeOut' }, style: {
                                borderRadius: '50%',
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                            } }) })] }), variant === 'primary' && (_jsx(motion.div, { className: "absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500", initial: { scale: 0 }, animate: { scale: shouldBeActive ? 1 : 0 }, transition: ANIMATION_SYSTEM.transitions.fast }))] }));
}
//# sourceMappingURL=UnifiedPremiumButton.js.map