/**
 * Glow Effect Hook
 * Provides glow animations for interactive elements
 */
export declare const useGlowEffect: (color?: string, intensity?: number) => {
    glowValue: any;
    start: () => any;
    stop: () => void;
    pulse: () => void;
    getGlowStyle: () => {
        shadowColor: string;
        shadowOffset: {
            width: number;
            height: number;
        };
        shadowOpacity: any;
        shadowRadius: any;
        elevation: any;
    };
};
//# sourceMappingURL=useGlowEffect.d.ts.map