/**
 * Design Tokens - Animations
 * Unified animation system for PawfectMatch
 */
export declare const ANIMATIONS: {
    readonly timing: {
        readonly fast: 200;
        readonly normal: 300;
        readonly slow: 500;
        readonly slower: 800;
    };
    readonly spring: {
        readonly gentle: {
            readonly tension: 100;
            readonly friction: 8;
        };
        readonly wobbly: {
            readonly tension: 180;
            readonly friction: 12;
        };
        readonly stiff: {
            readonly tension: 210;
            readonly friction: 20;
        };
    };
    readonly easing: {
        readonly linear: "linear";
        readonly ease: "ease";
        readonly easeIn: "ease-in";
        readonly easeOut: "ease-out";
        readonly easeInOut: "ease-in-out";
    };
    readonly presets: {
        readonly fadeIn: {
            readonly opacity: 1;
            readonly duration: 300;
        };
        readonly fadeOut: {
            readonly opacity: 0;
            readonly duration: 300;
        };
        readonly slideInUp: {
            readonly translateY: 0;
            readonly duration: 300;
        };
        readonly slideOutDown: {
            readonly translateY: 100;
            readonly duration: 300;
        };
        readonly scaleIn: {
            readonly scale: 1;
            readonly duration: 300;
        };
        readonly scaleOut: {
            readonly scale: 0;
            readonly duration: 300;
        };
    };
};
//# sourceMappingURL=animations.d.ts.map