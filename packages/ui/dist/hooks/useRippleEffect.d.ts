/**
 * Ripple Effect Hook
 * Provides ripple animations for touch interactions
 */
export declare const useRippleEffect: () => {
    startRipple: (event: any) => void;
    getRippleStyle: () => {
        position: "absolute";
        left: number;
        top: number;
        width: number;
        height: number;
        borderRadius: number;
        backgroundColor: string;
        transform: {
            scale: any;
        }[];
        opacity: any;
    };
};
//# sourceMappingURL=useRippleEffect.d.ts.map