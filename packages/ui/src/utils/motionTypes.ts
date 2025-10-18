/**
 * Typed Motion Utilities - Production Grade
 * Eliminates casts by providing strictly typed Motion prop helpers and style mergers.
 */
import type { MotionProps, MotionStyle, SpringOptions } from 'framer-motion';
import type { CSSProperties } from 'react';

// Strictly typed animation prop types
export type HoverAnim = NonNullable<MotionProps['whileHover']>;
export type TapAnim = NonNullable<MotionProps['whileTap']>;
export type InitialAnim = NonNullable<MotionProps['initial']>;
export type AnimateAnim = NonNullable<MotionProps['animate']>;
export type TransitionAnim = NonNullable<MotionProps['transition']>;

// Type-safe factories (identity helpers that enforce correct shapes)
export function makeHover(variant: HoverAnim): HoverAnim { return variant; }
export function makeTap(variant: TapAnim): TapAnim { return variant; }
export function makeInitial(variant: InitialAnim): InitialAnim { return variant; }
export function makeAnimate(variant: AnimateAnim): AnimateAnim { return variant; }
export function makeTransition(transition: TransitionAnim): TransitionAnim { return transition; }

// Style typing utilities
// Style typing utilities
export type StyleMerge = MotionStyle & CSSProperties;
export function style(styles: StyleMerge): StyleMerge { return styles; }
export function makeConditionalStyle(styles: Record<string, unknown>): StyleMerge {
    const filtered = Object.fromEntries(
        Object.entries(styles).filter(([, value]) => value !== undefined)
    );
    return filtered as unknown as StyleMerge;
}

// Convert plain CSSProperties to MotionStyle-compatible object
export function fromCss(css: CSSProperties): MotionStyle {
    return css as unknown as MotionStyle;
}

// Spring option helpers
export const springMicro: SpringOptions = { stiffness: 400, damping: 40, mass: 0.5 };
export const springStandard: SpringOptions = { stiffness: 300, damping: 30, mass: 1 };