/**
 * 💎 PREMIUM INPUT COMPONENT
 * Advanced input with floating labels, glass morphism, and premium animations
 */
import React from 'react';
interface PremiumInputProps {
    label: string;
    placeholder?: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    variant?: 'default' | 'glass' | 'gradient' | 'neon';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    helperText?: string;
    className?: string;
    autoComplete?: string;
    maxLength?: number;
    glow?: boolean;
}
export declare function PremiumInput({ label, placeholder, type, value, onChange, error, disabled, required, variant, size, icon, rightIcon, helperText, className, autoComplete, maxLength, glow, }: PremiumInputProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PremiumInput.d.ts.map