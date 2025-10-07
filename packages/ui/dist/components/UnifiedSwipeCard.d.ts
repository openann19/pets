/**
 * 💎 UNIFIED SWIPE CARD COMPONENT
 * Advanced swipe card with 3D effects, fluid animations, and premium interactions
 * Features: 3D tilt, magnetic tracking, haptic feedback, and smooth stack animations
 */
import React from 'react';
interface SwipeCardData {
    id: string;
    name: string;
    age?: number;
    breed?: string;
    images: string[];
    description?: string;
    distance?: number;
    [key: string]: any;
}
interface UnifiedSwipeCardProps {
    data: SwipeCardData;
    onSwipeLeft?: (data: SwipeCardData) => void;
    onSwipeRight?: (data: SwipeCardData) => void;
    onSwipeUp?: (data: SwipeCardData) => void;
    onSwipeDown?: (data: SwipeCardData) => void;
    onCardClick?: (data: SwipeCardData) => void;
    variant?: 'default' | 'glass' | 'elevated' | 'gradient' | 'neon' | 'holographic';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    enable3DTilt?: boolean;
    enableMagnetic?: boolean;
    enableHaptic?: boolean;
    enableSound?: boolean;
    enableGlow?: boolean;
    swipeThreshold?: number;
    velocityThreshold?: number;
    dragConstraints?: React.RefObject<HTMLElement>;
    stackIndex?: number;
    isCurrentCard?: boolean;
    isExiting?: boolean;
    'aria-label'?: string;
    'aria-describedby'?: string;
    className?: string;
}
export declare function UnifiedSwipeCard({ data, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onCardClick, variant, size, enable3DTilt, enableMagnetic, enableHaptic, enableSound, enableGlow, swipeThreshold, velocityThreshold, dragConstraints, stackIndex, isCurrentCard, isExiting, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy, className, }: UnifiedSwipeCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=UnifiedSwipeCard.d.ts.map