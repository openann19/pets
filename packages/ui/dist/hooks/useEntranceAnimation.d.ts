/**
 * Entrance Animation Hook
 * Provides entrance animations for components
 */
export type EntranceType = 'fadeIn' | 'slideIn' | 'scaleIn' | 'bounceIn';
export declare const useEntranceAnimation: (type?: EntranceType, delay?: number, duration?: number) => {
    animatedValue: any;
    start: () => void;
    reset: () => void;
    getAnimatedStyle: () => {
        opacity: any;
        transform?: undefined;
    } | {
        opacity: any;
        transform: {
            translateY: any;
        }[];
    } | {
        opacity: any;
        transform: {
            scale: any;
        }[];
    };
};
//# sourceMappingURL=useEntranceAnimation.d.ts.map