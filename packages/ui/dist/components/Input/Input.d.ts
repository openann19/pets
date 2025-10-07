import React from 'react';
export interface InputProps {
    /**
     * Input type
     */
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
    /**
     * Visual style variant
     */
    variant?: 'default' | 'outline' | 'filled';
    /**
     * Input size
     */
    size?: 'small' | 'medium' | 'large';
    /**
     * Left icon/addon
     */
    leftIcon?: React.ReactNode;
    /**
     * Right icon/addon
     */
    rightIcon?: React.ReactNode;
    /**
     * Input value
     */
    value?: string;
    /**
     * Change handler
     */
    onChange?: (value: string) => void;
    /**
     * Label text
     */
    label?: string;
    /**
     * Placeholder text
     */
    placeholder?: string;
    /**
     * Additional CSS classes
     */
    className?: string;
    /**
     * Error state
     */
    error?: boolean;
    /**
     * Success state
     */
    success?: boolean;
    /**
     * Error message to display
     */
    errorMessage?: string;
    /**
     * Disabled state
     */
    disabled?: boolean;
    /**
     * Read-only state
     */
    readOnly?: boolean;
}
/**
 * A headless input component
 */
export declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=Input.d.ts.map