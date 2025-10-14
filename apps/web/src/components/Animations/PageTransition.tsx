/**
 * 🎬 ULTRA PREMIUM PAGE TRANSITIONS
 * Studio-quality animations with spring physics and shared layouts
 * Framer Motion | WCAG 2.1 AA | prefers-reduced-motion support
 */

'use client';

import type { Variants } from 'framer-motion';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

/**
 * Transition presets with spring physics
 */
export const transitionPresets = {
    // Smooth fade with scale
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { type: 'spring', stiffness: 300, damping: 30 },
    },

    // Scale up from center
    scale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { type: 'spring', stiffness: 300, damping: 30 },
    },

    // Slide from right (forward navigation)
    slideRight: {
        initial: { opacity: 0, x: 100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -100 },
        transition: { type: 'spring', stiffness: 300, damping: 30 },
    },

    // Slide from left (back navigation)
    slideLeft: {
        initial: { opacity: 0, x: -100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 100 },
        transition: { type: 'spring', stiffness: 300, damping: 30 },
    },

    // Slide from bottom (modals)
    slideUp: {
        initial: { opacity: 0, y: 100 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 100 },
        transition: { type: 'spring', stiffness: 300, damping: 30 },
    },

    // Zoom in (emphasis)
    zoom: {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.1 },
        transition: { type: 'spring', stiffness: 300, damping: 30 },
    },

    // Blur fade (premium effect)
    blurFade: {
        initial: { opacity: 0, filter: 'blur(10px)' },
        animate: { opacity: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, filter: 'blur(10px)' },
        transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
} as const;

export type TransitionPreset = keyof typeof transitionPresets;

/**
 * Page transition wrapper with automatic route detection
 */
interface PageTransitionProps {
    children: ReactNode;
    preset?: TransitionPreset;
    className?: string;
    /** Custom animation variants */
    variants?: Variants;
    /** Disable transitions (e.g., for reduced motion preference) */
    disabled?: boolean;
}

export function PageTransition({
    children,
    preset = 'fade',
    className = '',
    variants,
    disabled = false,
}: PageTransitionProps) {
    const pathname = usePathname();
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Detect reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Skip animations if disabled or user prefers reduced motion
    if (disabled || prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    const animationProps = variants || transitionPresets[preset];

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={animationProps.initial as any}
                animate={animationProps.animate as any}
                exit={animationProps.exit as any}
                transition={animationProps.transition as any}
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

/**
 * Stagger animation for lists and grids
 */
interface StaggerContainerProps {
    children: ReactNode;
    staggerDelay?: number;
    className?: string;
}

export function StaggerContainer({ children, staggerDelay = 0.05, className = '' }: StaggerContainerProps) {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
                delayChildren: 0.1,
            },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * Stagger item for use within StaggerContainer
 */
interface StaggerItemProps {
    children: ReactNode;
    className?: string;
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 30 },
        },
    };

    return (
        <motion.div variants={itemVariants} className={className}>
            {children}
        </motion.div>
    );
}

/**
 * Shared layout transition for smooth morphing between elements
 */
interface SharedLayoutProps {
    children: ReactNode;
    layoutId: string;
    className?: string;
}

export function SharedLayout({ children, layoutId, className = '' }: SharedLayoutProps) {
    return (
        <motion.div layoutId={layoutId} className={className} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
            {children}
        </motion.div>
    );
}

/**
 * Presence animation for conditional rendering
 */
interface PresenceProps {
    children: ReactNode;
    show: boolean;
    preset?: TransitionPreset;
    className?: string;
}

export function Presence({ children, show, preset = 'fade', className = '' }: PresenceProps) {
    const animationProps = transitionPresets[preset];

    return (
        <AnimatePresence mode="wait">
            {show && (
                <motion.div
                    initial={animationProps.initial}
                    animate={animationProps.animate}
                    exit={animationProps.exit}
                    transition={animationProps.transition}
                    className={className}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/**
 * Scroll reveal animation
 */
interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
    threshold?: number;
}

export function ScrollReveal({ children, className = '', threshold = 0.1 }: ScrollRevealProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: threshold }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * Hover card animation
 */
interface HoverCardProps {
    children: ReactNode;
    className?: string;
    scale?: number;
}

export function HoverCard({ children, className = '', scale = 1.05 }: HoverCardProps) {
    return (
        <motion.div
            whileHover={{ scale, y: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * Bounce attention animation
 */
interface BounceProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export function Bounce({ children, className = '', delay = 0 }: BounceProps) {
    return (
        <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1, 1.05, 1] }}
            transition={{
                duration: 0.6,
                delay,
                times: [0, 0.2, 0.4, 0.6, 1],
                repeat: 0,
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * Pulse animation for loading states
 */
interface PulseProps {
    children: ReactNode;
    className?: string;
}

export function Pulse({ children, className = '' }: PulseProps) {
    return (
        <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * Route-specific transition variants
 */
export const routeTransitions = {
    '/dashboard': transitionPresets.fade,
    '/swipe': transitionPresets.scale,
    '/matches': transitionPresets.slideRight,
    '/chat': transitionPresets.slideLeft,
    '/profile': transitionPresets.zoom,
    '/settings': transitionPresets.slideUp,
    '/premium': transitionPresets.blurFade,
} as Record<string, typeof transitionPresets[TransitionPreset]>;

/**
 * Get transition preset based on route
 */
export function getRouteTransition(pathname: string): TransitionPreset {
    for (const [route, _] of Object.entries(routeTransitions)) {
        if (pathname.startsWith(route)) {
            return 'fade'; // Default for now
        }
    }
    return 'fade';
}
