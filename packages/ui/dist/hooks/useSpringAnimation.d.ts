/**
 * Spring Animation Hook
 * Provides smooth spring-based animations
 */
export interface SpringConfig {
    tension?: number;
    friction?: number;
    mass?: number;
}
export declare const useSpringAnimation: (config?: SpringConfig) => {
    animatedValue: any;
    animate: (toValue: number, callback?: () => void) => void;
    reset: () => void;
};
//# sourceMappingURL=useSpringAnimation.d.ts.map