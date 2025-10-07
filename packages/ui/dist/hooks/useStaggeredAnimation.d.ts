/**
 * Staggered Animation Hook
 * Provides staggered animations for lists
 */
export declare const useStaggeredAnimation: (itemCount: number, delay?: number, duration?: number) => {
    animatedValues: any[];
    start: () => void;
    reset: () => void;
    getAnimatedStyle: (index: number) => {
        opacity: any;
        transform: {
            translateY: any;
        }[];
    };
};
//# sourceMappingURL=useStaggeredAnimation.d.ts.map