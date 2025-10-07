/**
 * 💎 PREMIUM INPUT COMPONENT
 * Advanced input with floating labels, glass morphism, and premium animations
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import { transitions } from '../../animations/premium-motion';
import { BACKDROP, COLORS, GRADIENTS, RADIUS, SHADOWS } from '../../theme/design-system';
export function PremiumInput({ label, placeholder, type = 'text', value, onChange, error, disabled = false, required = false, variant = 'default', size = 'md', icon, rightIcon, helperText, className = '', autoComplete, maxLength, glow = false, }) {
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const inputRef = useRef(null);
    const isFloating = isFocused || (value !== '' && value.length > 0);
    const hasError = error !== undefined && error !== '';
    // Focus management
    const handleFocus = useCallback(() => {
        setIsFocused(true);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [setIsFocused]);
    const handleBlur = useCallback(() => {
        setIsFocused(false);
    }, [setIsFocused]);
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
    return (_jsxs(motion.div, { className: `relative ${className}`, initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: transitions.spring, onMouseEnter: useCallback(() => setIsHovered(true), [setIsHovered]), onMouseLeave: useCallback(() => setIsHovered(false), [setIsHovered]), children: [_jsxs(motion.div, { className: "relative", style: {
                    ...variantStyles,
                    ...sizeStyles,
                    borderRadius: RADIUS.xl,
                }, animate: {
                    scale: isHovered && !disabled ? 1.01 : 1,
                    y: isHovered && !disabled ? -1 : 0,
                }, transition: transitions.micro, children: [icon !== undefined && icon !== null && (_jsx(motion.div, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none", animate: {
                            scale: isFocused ? 1.1 : 1,
                            color: isFocused
                                ? hasError ? COLORS.error[500] : COLORS.primary[500]
                                : COLORS.neutral[400],
                        }, transition: transitions.micro, children: icon })), _jsxs(motion.label, { className: "absolute pointer-events-none select-none", style: {
                            left: icon !== undefined && icon !== null ? '48px' : '16px',
                            color: hasError
                                ? COLORS.error[500]
                                : isFocused
                                    ? COLORS.primary[500]
                                    : COLORS.neutral[500],
                            fontSize: isFloating ? '12px' : sizeStyles.fontSize,
                            fontWeight: isFloating ? '500' : '400',
                        }, animate: {
                            top: isFloating ? '8px' : '50%',
                            y: isFloating ? 0 : '-50%',
                            scale: isFloating ? 1 : 1,
                        }, transition: transitions.micro, onClick: handleFocus, children: [label, required && _jsx("span", { className: "text-red-500 ml-1", children: "*" })] }), _jsx("input", { ref: inputRef, type: type, value: value, onChange: useCallback((e) => {
                            onChange(e.target.value);
                        }, [onChange]), onFocus: handleFocus, onBlur: handleBlur, disabled: disabled, placeholder: isFocused ? placeholder : '', autoComplete: autoComplete, maxLength: maxLength, className: "w-full h-full bg-transparent border-none outline-none", style: {
                            paddingTop: isFloating ? '20px' : '0',
                            paddingBottom: isFloating ? '4px' : '0',
                            paddingLeft: icon !== undefined && icon !== null ? '48px' : '16px',
                            paddingRight: rightIcon !== undefined && rightIcon !== null ? '48px' : '16px',
                            fontSize: sizeStyles.fontSize,
                            color: variant === 'gradient' || variant === 'neon'
                                ? COLORS.neutral[0]
                                : COLORS.neutral[800],
                        } }), rightIcon !== undefined && rightIcon !== null && (_jsx(motion.div, { className: "absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none", animate: {
                            scale: isFocused ? 1.1 : 1,
                            color: isFocused
                                ? hasError ? COLORS.error[500] : COLORS.primary[500]
                                : COLORS.neutral[400],
                        }, transition: transitions.micro, children: rightIcon })), maxLength !== undefined && value.length > 0 && (_jsxs(motion.div, { className: "absolute bottom-1 right-3 text-xs", initial: { opacity: 0 }, animate: { opacity: 1 }, style: {
                            color: value.length > (maxLength ?? 0) * 0.8
                                ? COLORS.warning[500]
                                : COLORS.neutral[400],
                        }, children: [value.length, "/", maxLength] })), isFocused && !hasError && (_jsx(motion.div, { className: "absolute inset-0 rounded-inherit pointer-events-none", initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, style: {
                            boxShadow: variant === 'glass'
                                ? `0 0 0 3px ${COLORS.primary[200]}40`
                                : `0 0 0 3px ${COLORS.primary[200]}`,
                        }, transition: transitions.micro })), hasError && (_jsx(motion.div, { className: "absolute inset-0 rounded-inherit pointer-events-none", initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, style: {
                            boxShadow: `0 0 0 3px ${COLORS.error[200]}`,
                        }, transition: transitions.micro })), glow && isFocused && !hasError && (_jsx(motion.div, { className: "absolute inset-0 rounded-inherit pointer-events-none", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, style: {
                            background: GRADIENTS.primary,
                            filter: 'blur(20px)',
                            zIndex: -1,
                            transform: 'scale(1.05)',
                        }, transition: transitions.micro }))] }), _jsx(AnimatePresence, { children: ((helperText !== undefined && helperText !== '') || (error !== undefined && error !== '')) && (_jsx(motion.div, { className: "mt-2 px-1", initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -5 }, transition: transitions.micro, children: _jsx("p", { className: "text-sm", style: {
                            color: hasError ? COLORS.error[500] : COLORS.neutral[600],
                        }, children: error ?? helperText }) })) })] }));
}
//# sourceMappingURL=PremiumInput.js.map