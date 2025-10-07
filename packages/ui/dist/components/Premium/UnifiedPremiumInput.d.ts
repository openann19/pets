/**
 * 💎 UNIFIED PREMIUM INPUT COMPONENT
 * Uses the unified design system for consistent styling across web and mobile
 * Enhanced with validation states and unified visual feedback
 */
import React from 'react';
interface UnifiedPremiumInputProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    type?: 'text' | 'email' | 'password' | 'number';
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'glass' | 'outline';
    disabled?: boolean;
    error?: string;
    success?: boolean;
    icon?: React.ReactNode;
    required?: boolean;
    className?: string;
    autoFocus?: boolean;
}
export declare function UnifiedPremiumInput({ label, placeholder, value, onChange, type, size, variant, disabled, error, success, icon, required, className, autoFocus, }: UnifiedPremiumInputProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=UnifiedPremiumInput.d.ts.map