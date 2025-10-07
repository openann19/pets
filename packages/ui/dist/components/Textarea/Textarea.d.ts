import React from 'react';
export interface TextareaProps {
    /**
     * Textarea value
     */
    value?: string;
    /**
     * Change handler
     */
    onChange?: (value: string) => void;
    /**
     * Placeholder text
     */
    placeholder?: string;
    /**
     * Visual style variant
     */
    variant?: 'default' | 'outline' | 'filled';
    /**
     * Textarea size
     */
    size?: 'small' | 'medium' | 'large';
    /**
     * Number of rows
     */
    rows?: number;
    /**
     * Resize behavior
     */
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
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
     * Disabled state
     */
    disabled?: boolean;
    /**
     * Read-only state
     */
    readOnly?: boolean;
    /**
     * Maximum length
     */
    maxLength?: number;
    /**
     * Show character count
     */
    showCharCount?: boolean;
}
/**
 * A headless textarea component built with react-aria
 */
export declare const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;
//# sourceMappingURL=Textarea.d.ts.map