/**
 * Magnetic Effect Hook
 * Provides magnetic mouse tracking for interactive elements
 */
export declare const useMagneticEffect: (strength?: number) => {
    magneticX: any;
    magneticY: any;
    handleMouseMove: (event: any) => void;
    reset: () => void;
    getAnimatedStyle: () => {
        transform: ({
            translateX: any;
            translateY?: undefined;
        } | {
            translateY: any;
            translateX?: undefined;
        })[];
    };
};
//# sourceMappingURL=useMagneticEffect.d.ts.map