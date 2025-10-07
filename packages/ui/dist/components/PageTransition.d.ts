/**
 * 💎 PAGE TRANSITION COMPONENT
 * Fluid page transitions with Framer Motion for seamless navigation
 * Features: Multiple transition types, reduced motion support, and accessibility
 */
import React from 'react';
interface PageTransitionProps {
    children: React.ReactNode;
    type?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight';
    duration?: number;
    delay?: number;
    className?: string;
}
export declare function PageTransition({ children, type, duration, delay, className, }: PageTransitionProps): import("react/jsx-runtime").JSX.Element;
interface LayoutTransitionProps {
    children: React.ReactNode;
    className?: string;
}
export declare function LayoutTransition({ children, className }: LayoutTransitionProps): import("react/jsx-runtime").JSX.Element;
interface StaggeredListProps {
    children: React.ReactNode;
    className?: string;
    staggerDelay?: number;
}
export declare function StaggeredList({ children, className, staggerDelay }: StaggeredListProps): import("react/jsx-runtime").JSX.Element;
interface FadeInUpProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}
export declare function FadeInUp({ children, delay, duration, className }: FadeInUpProps): import("react/jsx-runtime").JSX.Element;
interface ScaleInProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}
export declare function ScaleIn({ children, delay, duration, className }: ScaleInProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PageTransition.d.ts.map