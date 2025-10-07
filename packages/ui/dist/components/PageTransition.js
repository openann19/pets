/**
 * 💎 PAGE TRANSITION COMPONENT
 * Fluid page transitions with Framer Motion for seamless navigation
 * Features: Multiple transition types, reduced motion support, and accessibility
 */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { ANIMATIONS } from '../theme/design-tokens';
// Transition variants
const transitionVariants = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    },
    slide: {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
    },
    scale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.05 },
    },
    slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    },
    slideDown: {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
    },
    slideLeft: {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
    },
    slideRight: {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
    },
};
export function PageTransition({ children, type = 'fade', duration = 0.3, delay = 0, className = '', }) {
    const variant = transitionVariants[type];
    return (_jsx(motion.div, { className: `w-full h-full ${className}`, initial: variant.initial, animate: variant.animate, exit: variant.exit, transition: {
            duration,
            delay,
            ease: ANIMATIONS.easing.easeOut,
        }, 
        // Respect reduced motion preferences
        style: {
            // @ts-ignore - CSS custom property for reduced motion
            '--motion-reduce': 'var(--motion-reduce, 0)',
        }, children: children }));
}
export function LayoutTransition({ children, className = '' }) {
    return (_jsx("div", { className: `min-h-screen ${className}`, children: _jsx(AnimatePresence, { mode: "wait", initial: false, children: _jsx(PageTransition, { type: "fade", duration: 0.2, children: children }) }) }));
}
export function StaggeredList({ children, className = '', staggerDelay = 0.1 }) {
    return (_jsx(motion.div, { className: className, initial: "hidden", animate: "visible", variants: {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren: staggerDelay,
                },
            },
        }, children: React.Children.map(children, (child, index) => (_jsx(motion.div, { variants: {
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
            }, transition: ANIMATIONS.spring.smooth, children: child }, index))) }));
}
export function FadeInUp({ children, delay = 0, duration = 0.5, className = '' }) {
    return (_jsx(motion.div, { className: className, initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: {
            duration,
            delay,
            ease: ANIMATIONS.easing.easeOut,
        }, children: children }));
}
export function ScaleIn({ children, delay = 0, duration = 0.4, className = '' }) {
    return (_jsx(motion.div, { className: className, initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: {
            duration,
            delay,
            ease: ANIMATIONS.easing.easeOut,
        }, children: children }));
}
//# sourceMappingURL=PageTransition.js.map