/**
 * 💎 UNIFIED PREMIUM CARD COMPONENT
 * Single source of truth for premium card styling across web and mobile
 * Features: Glass morphism, 3D effects, haptic feedback, and WCAG 2.1 AA compliance
 */
import React from 'react';
interface UnifiedPremiumCardProps {
    children: React.ReactNode;
    variant?: 'default' | 'glass' | 'elevated' | 'gradient' | 'neon' | 'holographic';
    hover?: boolean;
    tilt?: boolean;
    glow?: boolean;
    blur?: boolean;
    shimmer?: boolean;
    magnetic?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    onClick?: () => void;
    entrance?: 'fadeInUp' | 'scaleIn' | 'slideInLeft' | 'slideInRight';
    delay?: number;
    haptic?: boolean;
    sound?: boolean;
    disabled?: boolean;
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
export declare function UnifiedPremiumCard({ children, variant, hover, tilt, glow, blur, shimmer, magnetic, padding, className, onClick, entrance, delay, haptic, sound, disabled, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy, 'aria-labelledby': ariaLabelledBy, 'aria-expanded': ariaExpanded, 'aria-selected': ariaSelected, 'aria-hidden': ariaHidden, 'aria-live': ariaLive, 'aria-atomic': ariaAtomic, 'aria-relevant': ariaRelevant, role, tabIndex, 'data-testid': dataTestId, }: UnifiedPremiumCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=UnifiedPremiumCard.d.ts.map