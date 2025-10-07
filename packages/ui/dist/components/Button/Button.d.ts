import type { AriaButtonProps } from '@react-types/button';
import React from 'react';
export interface ButtonProps extends AriaButtonProps {
    /**
     * The visual style of the button
     */
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    /**
     * Additional CSS class names
     */
    className?: string;
    /**
     * The size of the button
     */
    size?: 'small' | 'medium' | 'large';
}
/**
 * A styled button component built with react-aria
 */
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=Button.d.ts.map