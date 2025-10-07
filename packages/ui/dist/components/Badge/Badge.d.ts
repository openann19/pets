import React from 'react';
export interface BadgeProps {
    /**
     * Badge content
     */
    children?: React.ReactNode;
    /**
     * Badge variant
     */
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    /**
     * Badge size
     */
    size?: 'small' | 'medium' | 'large';
    /**
     * Additional CSS classes
     */
    className?: string;
    /**
     * Remove padding (dot style)
     */
    dot?: boolean;
    /**
     * Outline style
     */
    outline?: boolean;
}
/**
 * A badge component for displaying status, labels, or counts
 */
export declare const Badge: React.FC<BadgeProps>;
//# sourceMappingURL=Badge.d.ts.map