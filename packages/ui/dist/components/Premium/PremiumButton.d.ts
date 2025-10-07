/**
 * 💎 PREMIUM BUTTON COMPONENT
 * Jaw-dropping button with advanced animations, haptics, sound, and glass morphism
 * The most advanced button component you'll ever see
 */
import React from 'react';
interface PremiumButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'glass' | 'gradient' | 'neon' | 'holographic';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    haptic?: boolean;
    sound?: boolean;
    glow?: boolean;
    particles?: boolean;
    magneticEffect?: boolean;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
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
export declare function PremiumButton({ children, onClick, variant, size, disabled, loading, icon, iconPosition, fullWidth, haptic, sound, glow, particles, magneticEffect, className, type, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy, 'aria-pressed': ariaPressed, 'aria-expanded': ariaExpanded, 'aria-haspopup': ariaHasPopup, 'aria-controls': ariaControls, 'aria-live': ariaLive, 'aria-atomic': ariaAtomic, 'aria-relevant': ariaRelevant, role, tabIndex, 'data-testid': testId, ..._restProps }: PremiumButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PremiumButton.d.ts.map