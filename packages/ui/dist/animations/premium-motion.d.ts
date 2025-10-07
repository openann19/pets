/**
 * 🎭 PREMIUM MOTION SYSTEM
 * Advanced animation patterns for jaw-dropping user experiences
 * Consistent across web and mobile platforms
 */
import type { Transition, Variants } from 'framer-motion';
import { MOTION_CONFIG } from '../theme/design-system';
export declare const transitions: {
    readonly spring: {
        readonly type: "spring";
        readonly stiffness: 300;
        readonly damping: 30;
        readonly mass: 1;
    };
    readonly micro: {
        readonly type: "spring";
        readonly stiffness: 400;
        readonly damping: 25;
        readonly mass: 0.8;
    };
    readonly smooth: {
        readonly type: "spring";
        readonly stiffness: 200;
        readonly damping: 35;
        readonly mass: 1.2;
    };
    readonly bouncy: {
        readonly type: "spring";
        readonly stiffness: 600;
        readonly damping: 15;
        readonly mass: 0.6;
    };
    readonly layout: {
        readonly type: "spring";
        readonly stiffness: 400;
        readonly damping: 30;
        readonly mass: 1;
    };
};
export declare const entranceVariants: Variants;
export declare const hoverVariants: Variants;
export declare const tapVariants: Variants;
export declare const staggerVariants: Variants;
export declare const pageVariants: Variants;
export declare const modalVariants: Variants;
export declare const loadingVariants: Variants;
export declare const notificationVariants: Variants;
export declare const motionUtils: {
    readonly createSpring: (config: Partial<typeof MOTION_CONFIG.spring>) => Transition;
    readonly createStagger: (staggerDelay?: 0.1, delayChildren?: number) => {
        transition: {
            staggerChildren: 0.1;
            delayChildren: number;
        };
    };
    readonly createEntrance: (from: {
        x?: number;
        y?: number;
        scale?: number;
        rotate?: number;
    }, transition?: Transition) => {
        transition: Transition;
        x?: number;
        y?: number;
        scale?: number;
        rotate?: number;
        opacity: number;
    };
    readonly createHover: (to: {
        x?: number;
        y?: number;
        scale?: number;
        rotate?: number;
    }, transition?: Transition) => {
        transition: Transition;
        x?: number;
        y?: number;
        scale?: number;
        rotate?: number;
    };
    readonly layoutTransition: {
        readonly type: "spring";
        readonly stiffness: 400;
        readonly damping: 30;
        readonly mass: 1;
    };
};
export type EntranceVariant = keyof typeof entranceVariants;
export type HoverVariant = keyof typeof hoverVariants;
export type TapVariant = keyof typeof tapVariants;
export type PageVariant = keyof typeof pageVariants;
export type ModalVariant = keyof typeof modalVariants;
//# sourceMappingURL=premium-motion.d.ts.map