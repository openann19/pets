/**
 * 💎 UNIFIED PREMIUM INPUT COMPONENT
 * Single source of truth for premium input styling across web and mobile
 * Features: Floating labels, focus rings, validation states, icon support
 */
import React from 'react';
interface UnifiedPremiumInputProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number';
    variant?: 'default' | 'glass' | 'gradient' | 'neon' | 'floating' | 'outlined' | 'filled';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    error?: string;
    helperText?: string;
    maxLength?: number;
    showCharCount?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    required?: boolean;
    className?: string;
    autoComplete?: string;
    name?: string;
    autoFocus?: boolean;
}
export declare function UnifiedPremiumInput({ label, placeholder, value, onChange, onBlur, onFocus, type, variant, size, disabled, error, helperText, maxLength, showCharCount, leftIcon, rightIcon, required, className, autoComplete, name, autoFocus, }: UnifiedPremiumInputProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=UnifiedPremiumInput.d.ts.map