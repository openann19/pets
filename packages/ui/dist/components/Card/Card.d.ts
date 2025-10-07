import React from 'react';
export interface CardProps {
    /**
     * Card content
     */
    children: React.ReactNode;
    /**
     * Whether the card is interactive/clickable
     */
    interactive?: boolean;
    /**
     * Additional CSS class name
     */
    className?: string;
    /**
     * Click handler for interactive cards
     */
    onClick?: () => void;
}
/**
 * A headless card component that can be styled in the consuming application
 */
export declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=Card.d.ts.map