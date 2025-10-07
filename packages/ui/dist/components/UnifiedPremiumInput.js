/**
 * 💎 UNIFIED PREMIUM INPUT COMPONENT
 * Single source of truth for premium input styling across web and mobile
 * Features: Floating labels, focus rings, validation states, icon support
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ANIMATIONS, RADIUS } from '../theme/design-tokens';
export function UnifiedPremiumInput({ label, placeholder, value = '', onChange, onBlur, onFocus, type = 'text', variant = 'default', size = 'md', disabled = false, error, helperText, maxLength, showCharCount = false, leftIcon, rightIcon, required = false, className = '', autoComplete, name, autoFocus = false, }) {
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(value);
    const inputRef = useRef(null);
    const currentValue = value || internalValue;
    const hasValue = currentValue.length > 0;
    const isFloating = isFocused || hasValue;
    const handleFocus = () => {
        setIsFocused(true);
        onFocus?.();
    };
    const handleBlur = () => {
        setIsFocused(false);
        onBlur?.();
    };
    const handleChange = (e) => {
        const newValue = e.target.value;
        if (maxLength && newValue.length > maxLength)
            return;
        setInternalValue(newValue);
        onChange?.(newValue);
    };
    // Get variant styles using design tokens
    const getVariantStyles = () => {
        const variants = {
            default: {
                container: `bg-white dark:bg-gray-800 border-2 ${error ? 'border-red-500' : isFocused ? 'border-pink-500' : 'border-gray-300 dark:border-gray-600'}`,
                input: 'text-gray-900 dark:text-white',
                label: error ? 'text-red-500' : isFocused ? 'text-pink-500' : 'text-gray-600 dark:text-gray-400',
            },
            glass: {
                container: `glass-morphism backdrop-blur-xl border ${error ? 'border-red-400/50' : isFocused ? 'border-pink-400/50' : 'border-white/30'}`,
                input: 'text-gray-900 dark:text-white',
                label: error ? 'text-red-500' : isFocused ? 'text-pink-500' : 'text-gray-700 dark:text-gray-300',
            },
            gradient: {
                container: `bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-2 ${error ? 'border-red-500' : isFocused ? 'border-pink-500' : 'border-pink-200 dark:border-pink-800'}`,
                input: 'text-gray-900 dark:text-white',
                label: error ? 'text-red-500' : isFocused ? 'text-pink-600' : 'text-pink-600 dark:text-pink-400',
            },
            neon: {
                container: `bg-gray-900 border-2 ${error ? 'border-red-500' : isFocused ? 'border-pink-400' : 'border-pink-400/50'} ${isFocused ? 'shadow-[0_0_20px_rgba(236,72,153,0.5)]' : ''}`,
                input: 'text-pink-400',
                label: error ? 'text-red-500' : 'text-pink-400',
            },
            floating: {
                container: `bg-white/10 backdrop-blur-md border-2 ${error ? 'border-red-500' : isFocused ? 'border-blue-400' : 'border-white/20'} ${isFocused ? 'shadow-[0_0_20px_rgba(59,130,246,0.5)]' : ''}`,
                input: 'text-white',
                label: error ? 'text-red-500' : isFocused ? 'text-blue-400' : 'text-white/70',
            },
            outlined: {
                container: `bg-transparent border-2 ${error ? 'border-red-500' : isFocused ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'} ${isFocused ? 'shadow-[0_0_0_3px_rgba(59,130,246,0.1)]' : ''}`,
                input: 'text-gray-900 dark:text-white',
                label: error ? 'text-red-500' : isFocused ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400',
            },
            filled: {
                container: `bg-gray-100 dark:bg-gray-800 border-2 ${error ? 'border-red-500' : isFocused ? 'border-blue-500' : 'border-transparent'} ${isFocused ? 'shadow-[0_0_0_3px_rgba(59,130,246,0.1)]' : ''}`,
                input: 'text-gray-900 dark:text-white',
                label: error ? 'text-red-500' : isFocused ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400',
            },
        };
        return variants[variant];
    };
    // Get size styles using design tokens
    const getSizeStyles = () => {
        const sizes = {
            sm: {
                container: 'h-10',
                input: 'text-sm sm:text-base',
                label: 'text-xs sm:text-sm',
                padding: leftIcon ? 'pl-8 sm:pl-10 pr-3 sm:pr-4' : rightIcon ? 'pl-3 sm:pl-4 pr-8 sm:pr-10' : 'px-3 sm:px-4',
                icon: 'w-4 h-4 sm:w-5 sm:h-5',
            },
            md: {
                container: 'h-12',
                input: 'text-base sm:text-lg',
                label: 'text-sm sm:text-base',
                padding: leftIcon ? 'pl-10 sm:pl-12 pr-3 sm:pr-4' : rightIcon ? 'pl-3 sm:pl-4 pr-10 sm:pr-12' : 'px-3 sm:px-4',
                icon: 'w-5 h-5 sm:w-6 sm:h-6',
            },
            lg: {
                container: 'h-14',
                input: 'text-lg sm:text-xl',
                label: 'text-base sm:text-lg',
                padding: leftIcon ? 'pl-12 sm:pl-14 pr-4 sm:pr-5' : rightIcon ? 'pl-4 sm:pl-5 pr-12 sm:pr-14' : 'px-4 sm:px-5',
                icon: 'w-6 h-6 sm:w-7 sm:h-7',
            },
        };
        return sizes[size];
    };
    const styles = getVariantStyles();
    const sizes = getSizeStyles();
    return (_jsxs("div", { className: `relative ${className}`, children: [_jsxs(motion.div, { className: `
          relative ${sizes.container} transition-all duration-200
          ${styles.container}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
          transform-gpu
        `, style: { borderRadius: RADIUS.lg }, whileTap: !disabled ? { scale: 0.995 } : {}, transition: ANIMATIONS.spring.micro, onClick: () => inputRef.current?.focus(), children: [leftIcon && (_jsx("div", { className: `absolute left-4 top-1/2 -translate-y-1/2 ${styles.label}`, children: _jsx("div", { className: sizes.icon, children: leftIcon }) })), label && (_jsxs(motion.label, { className: `
              absolute left-4 pointer-events-none
              ${styles.label} font-medium
              transition-all duration-200
            `, animate: {
                            y: isFloating ? -20 : 0,
                            scale: isFloating ? 0.85 : 1,
                            x: isFloating ? (leftIcon ? 20 : 0) : (leftIcon ? 32 : 0),
                        }, transition: ANIMATIONS.spring.smooth, style: {
                            top: '50%',
                            originX: 0,
                            originY: 0.5,
                        }, children: [label, required && _jsx("span", { className: "text-red-500 ml-1", children: "*" })] })), _jsx("input", { ref: inputRef, type: type, name: name, value: currentValue, onChange: handleChange, onFocus: handleFocus, onBlur: handleBlur, disabled: disabled, placeholder: !label || isFloating ? placeholder : '', autoComplete: autoComplete, autoFocus: autoFocus, className: `
            w-full h-full bg-transparent
            ${sizes.input} ${styles.input}
            ${sizes.padding}
            outline-none
            ${label ? 'pt-3' : ''}
          ` }), rightIcon && (_jsx("div", { className: `absolute right-4 top-1/2 -translate-y-1/2 ${styles.label}`, children: _jsx("div", { className: sizes.icon, children: rightIcon }) })), _jsx(AnimatePresence, { children: isFocused && !error && (_jsx(motion.div, { className: "absolute inset-0 pointer-events-none", style: { borderRadius: RADIUS.lg }, initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, transition: ANIMATIONS.spring.micro, style: {
                                boxShadow: variant === 'neon'
                                    ? '0 0 20px rgba(236, 72, 153, 0.5)'
                                    : '0 0 0 4px rgba(236, 72, 153, 0.1)',
                                borderRadius: RADIUS.lg,
                            } })) })] }), _jsx(AnimatePresence, { mode: "wait", children: (error || helperText || showCharCount) && (_jsxs(motion.div, { className: "mt-2 flex items-start justify-between gap-2", initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -4 }, transition: ANIMATIONS.spring.micro, children: [(error || helperText) && (_jsx("p", { className: `text-sm ${error ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`, children: error || helperText })), showCharCount && maxLength && (_jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400 ml-auto whitespace-nowrap", children: [currentValue.length, "/", maxLength] }))] })) })] }));
}
//# sourceMappingURL=UnifiedPremiumInput.js.map