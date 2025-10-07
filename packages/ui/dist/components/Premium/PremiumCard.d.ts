/**
 * 💎 PREMIUM CARD COMPONENT
 * Advanced card with glass morphism, 3D effects, and premium animations
 */
import React from 'react';
import { entranceVariants } from '../../animations/premium-motion';
interface PremiumCardProps {
    children: React.ReactNode;
    variant?: 'default' | 'glass' | 'elevated' | 'gradient' | 'neon' | 'holographic';
    hover?: boolean;
    tilt?: boolean;
    glow?: boolean;
    blur?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    onClick?: () => void;
    entrance?: keyof typeof entranceVariants;
    delay?: number;
    'aria-label'?: string;
    'aria-describedby'?: string;
    'aria-labelledby'?: string;
    'aria-expanded'?: boolean;
    'aria-selected'?: boolean;
    'aria-hidden'?: boolean;
    'aria-live'?: 'polite' | 'assertive' | 'off';
    'aria-atomic'?: boolean;
    'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';
    role?: string;
    tabIndex?: number;
    'data-testid'?: string;
}
export declare function PremiumCard({ children, variant, hover, tilt, glow, blur, padding, className, onClick, entrance, delay, }: PremiumCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PremiumCard.d.ts.map