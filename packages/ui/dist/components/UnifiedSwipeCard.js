/**
 * 💎 UNIFIED SWIPE CARD COMPONENT
 * Advanced swipe card with 3D effects, fluid animations, and premium interactions
 * Features: 3D tilt, magnetic tracking, haptic feedback, and smooth stack animations
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import { HeartIcon, XMarkIcon, StarIcon } from '@heroicons/react/24/solid';
import { ANIMATIONS, COLORS, GRADIENTS, SHADOWS } from '../theme/design-tokens';
export function UnifiedSwipeCard({ data, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onCardClick, variant = 'glass', size = 'md', enable3DTilt = true, enableMagnetic = true, enableHaptic = true, enableSound = true, enableGlow = true, swipeThreshold = 100, velocityThreshold = 500, dragConstraints, stackIndex = 0, isCurrentCard = true, isExiting = false, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy, className = '', }) {
    const cardRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    // Motion values for drag and 3D effects
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    // Spring animations for smooth movement
    const springX = useSpring(x, ANIMATIONS.spring.smooth);
    const springY = useSpring(y, ANIMATIONS.spring.smooth);
    const springRotateX = useSpring(rotateX, ANIMATIONS.spring.micro);
    const springRotateY = useSpring(rotateY, ANIMATIONS.spring.micro);
    // Transform overlays based on drag position
    const likeOverlayOpacity = useTransform(x, [0, swipeThreshold], [0, 1]);
    const passOverlayOpacity = useTransform(x, [-swipeThreshold, 0], [1, 0]);
    const superLikeOverlayOpacity = useTransform(y, [-swipeThreshold, 0], [1, 0]);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
    // Enhanced haptic feedback
    const triggerHaptic = useCallback((intensity = 'medium') => {
        if (!enableHaptic || typeof window === 'undefined')
            return;
        if ('vibrate' in navigator) {
            const patterns = {
                light: [8],
                medium: [15],
                heavy: [25, 10, 15],
            };
            navigator.vibrate(patterns[intensity]);
        }
    }, [enableHaptic]);
    // Enhanced sound feedback
    const triggerSound = useCallback((type = 'swipe') => {
        if (!enableSound || typeof window === 'undefined')
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
            const frequencies = { swipe: 600, hover: 800, tap: 400 };
            oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        }
        catch {
            // Audio feedback not available
        }
    }, [enableSound]);
    // 3D tilt effect
    const handleMouseMove = useCallback((event) => {
        if (!enable3DTilt || !cardRef.current || !isCurrentCard)
            return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (event.clientX - centerX) / (rect.width / 2);
        const deltaY = (event.clientY - centerY) / (rect.height / 2);
        rotateX.set(deltaY * 10);
        rotateY.set(deltaX * 10);
    }, [enable3DTilt, isCurrentCard, rotateX, rotateY]);
    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        if (enable3DTilt) {
            rotateX.set(0);
            rotateY.set(0);
        }
    }, [enable3DTilt, rotateX, rotateY]);
    const handleMouseEnter = useCallback(() => {
        if (!isCurrentCard)
            return;
        setIsHovered(true);
        triggerSound('hover');
    }, [isCurrentCard, triggerSound]);
    // Drag handlers
    const handleDragStart = useCallback(() => {
        if (!isCurrentCard)
            return;
        setIsDragging(true);
        triggerHaptic('light');
    }, [isCurrentCard, triggerHaptic]);
    const handleDragEnd = useCallback((event, info) => {
        if (!isCurrentCard)
            return;
        setIsDragging(false);
        const { offset, velocity } = info;
        // Determine swipe direction and trigger callbacks
        if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > velocityThreshold) {
            if (offset.x > 0) {
                triggerHaptic('medium');
                triggerSound('swipe');
                onSwipeRight?.(data);
            }
            else {
                triggerHaptic('medium');
                triggerSound('swipe');
                onSwipeLeft?.(data);
            }
        }
        else if (Math.abs(offset.y) > swipeThreshold || Math.abs(velocity.y) > velocityThreshold) {
            if (offset.y < 0) {
                triggerHaptic('heavy');
                triggerSound('swipe');
                onSwipeUp?.(data);
            }
            else {
                triggerHaptic('medium');
                triggerSound('swipe');
                onSwipeDown?.(data);
            }
        }
        else {
            // Return to center
            x.set(0);
            y.set(0);
        }
    }, [isCurrentCard, swipeThreshold, velocityThreshold, triggerHaptic, triggerSound, onSwipeRight, onSwipeLeft, onSwipeUp, onSwipeDown, data, x, y]);
    // Get variant styles
    const getVariantStyles = () => {
        const variants = {
            default: {
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: SHADOWS.glass,
            },
            glass: {
                background: GRADIENTS.glass.medium,
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: SHADOWS.glass,
            },
            elevated: {
                background: GRADIENTS.glass.medium,
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: SHADOWS['premium-lg'],
            },
            gradient: {
                background: GRADIENTS.primary,
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: SHADOWS.primaryGlow,
            },
            neon: {
                background: GRADIENTS.neon,
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(16, 185, 129, 0.6)',
                boxShadow: SHADOWS.neon,
            },
            holographic: {
                background: GRADIENTS.holographic,
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: SHADOWS['2xl'],
                backgroundSize: '400% 400%',
                animation: 'holographic 4s ease infinite',
            },
        };
        return variants[variant];
    };
    // Get size styles
    const getSizeStyles = () => {
        const sizes = {
            sm: { width: '280px', height: '400px' },
            md: { width: '320px', height: '480px' },
            lg: { width: '360px', height: '540px' },
            xl: { width: '400px', height: '600px' },
        };
        return sizes[size];
    };
    const variantStyle = getVariantStyles();
    const sizeStyle = getSizeStyles();
    return (_jsx(motion.div, { ref: cardRef, className: `absolute inset-0 ${className}`, style: {
            x: springX,
            y: springY,
            rotateX: enable3DTilt ? springRotateX : 0,
            rotateY: enable3DTilt ? springRotateY : 0,
            rotate,
            opacity,
            zIndex: 10 - stackIndex,
            pointerEvents: isCurrentCard ? 'auto' : 'none',
            filter: !isCurrentCard ? 'brightness(0.8)' : undefined,
        }, drag: isCurrentCard, dragConstraints: dragConstraints, dragElastic: 0.15, onDragStart: handleDragStart, onDragEnd: handleDragEnd, onMouseMove: handleMouseMove, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, onClick: () => onCardClick?.(data), animate: {
            scale: isExiting ? 0.8 : 1 - (stackIndex * 0.05),
            y: stackIndex * 8,
        }, transition: ANIMATIONS.spring.smooth, whileTap: isCurrentCard ? { scale: 0.98 } : {}, whileHover: isCurrentCard && enableGlow ? {
            scale: 1.02,
            y: -5,
            transition: ANIMATIONS.spring.micro
        } : {}, "aria-label": ariaLabel || `${data.name} profile card`, "aria-describedby": ariaDescribedBy, role: "button", tabIndex: isCurrentCard ? 0 : -1, children: _jsxs("div", { className: "w-full h-full rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing relative transform-gpu", style: {
                ...variantStyle,
                ...sizeStyle,
            }, children: [_jsxs(AnimatePresence, { children: [_jsx(motion.div, { className: "absolute top-6 left-6 z-20 px-5 py-2 rounded-full font-bold text-sm shadow-lg backdrop-blur-xl border border-white/20 text-white", style: {
                                opacity: likeOverlayOpacity,
                                background: 'rgba(34, 197, 94, 0.15)',
                                backdropFilter: 'blur(16px) saturate(180%)',
                            }, initial: { opacity: 0, scale: 0.8 }, animate: { opacity: likeOverlayOpacity, scale: 1 }, exit: { opacity: 0, scale: 0.8 }, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(HeartIcon, { className: "w-5 h-5" }), _jsx("span", { children: "LIKE" })] }) }), _jsx(motion.div, { className: "absolute top-6 right-6 z-20 px-5 py-2 rounded-full font-bold text-sm shadow-lg backdrop-blur-xl border border-white/20 text-white", style: {
                                opacity: passOverlayOpacity,
                                background: 'rgba(239, 68, 68, 0.15)',
                                backdropFilter: 'blur(16px) saturate(180%)',
                            }, initial: { opacity: 0, scale: 0.8 }, animate: { opacity: passOverlayOpacity, scale: 1 }, exit: { opacity: 0, scale: 0.8 }, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(XMarkIcon, { className: "w-5 h-5" }), _jsx("span", { children: "PASS" })] }) }), _jsx(motion.div, { className: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 px-6 py-3 rounded-full font-bold text-sm shadow-lg backdrop-blur-xl border border-white/20 text-white", style: {
                                opacity: superLikeOverlayOpacity,
                                background: 'rgba(59, 130, 246, 0.15)',
                                backdropFilter: 'blur(16px) saturate(180%)',
                            }, initial: { opacity: 0, scale: 0.8 }, animate: { opacity: superLikeOverlayOpacity, scale: 1 }, exit: { opacity: 0, scale: 0.8 }, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(StarIcon, { className: "w-5 h-5" }), _jsx("span", { children: "SUPER LIKE" })] }) })] }), _jsxs("div", { className: "relative w-full h-3/4 overflow-hidden", children: [_jsx("img", { src: data.images[0] || '/placeholder-pet.jpg', alt: data.name, className: "w-full h-full object-cover", loading: "lazy" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" }), enableGlow && isHovered && (_jsx(motion.div, { className: "absolute inset-0 pointer-events-none", style: {
                                background: `radial-gradient(circle, ${COLORS.primary[400]}20 0%, transparent 70%)`,
                            }, initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }))] }), _jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-6 text-white", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h3", { className: "text-2xl font-bold", children: data.name }), data.age && _jsxs("span", { className: "text-lg opacity-80", children: [data.age, " years old"] })] }), data.breed && (_jsx("p", { className: "text-lg opacity-80 mb-2", children: data.breed })), data.distance && (_jsxs("p", { className: "text-sm opacity-60 mb-3", children: [data.distance, " miles away"] })), data.description && (_jsx("p", { className: "text-sm opacity-80 line-clamp-2", children: data.description }))] }), isHovered && enableGlow && (_jsx(motion.div, { className: "absolute inset-0 pointer-events-none overflow-hidden", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: _jsx(motion.div, { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -skew-x-12", initial: { x: '-100%' }, animate: { x: '100%' }, transition: { duration: 0.6, ease: 'easeInOut' } }) }))] }) }));
}
//# sourceMappingURL=UnifiedSwipeCard.js.map