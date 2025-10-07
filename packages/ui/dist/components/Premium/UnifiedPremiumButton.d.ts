/**
 * 💎 UNIFIED PREMIUM BUTTON COMPONENT
 * Simplified version with unified design system for consistent styling
 * Enhanced with dynamic validation states and unified visual feedback
 */
import React from 'react';
interface UnifiedPremiumButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'glass' | 'outline' | 'ghost' | 'text' | 'danger' | 'success' | 'warning' | 'holographic' | 'neon';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    glow?: boolean;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    isValid?: boolean;
    isDirty?: boolean;
    haptic?: boolean;
    sound?: boolean;
    particles?: boolean;
    magneticEffect?: boolean;
    'aria-label'?: string;
    'aria-describedby'?: string;
    'aria-pressed'?: boolean;
    'aria-expanded'?: boolean;
    'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
    'aria-controls'?: string;
    'aria-live'?: 'polite' | 'assertive' | 'off';
    'aria-atomic'?: boolean;
    'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';
    role?: string;
    tabIndex?: number;
    'data-testid'?: string;
}
export declare function UnifiedPremiumButton({ children, onClick, variant, size, disabled, loading, icon, iconPosition, fullWidth, glow, className, type, isValid, isDirty, haptic, sound, particles, magneticEffect, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy, 'aria-pressed': ariaPressed, 'aria-expanded': ariaExpanded, 'aria-haspopup': ariaHasPopup, 'aria-controls': ariaControls, 'aria-live': ariaLive, 'aria-atomic': ariaAtomic, 'aria-relevant': ariaRelevant, role, tabIndex, 'data-testid': testId, }: UnifiedPremiumButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=UnifiedPremiumButton.d.ts.map