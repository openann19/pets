/**
 * 🎨 PAWFECTMATCH UNIFIED PREMIUM DESIGN SYSTEM
 * The single source of truth for all design tokens across web and mobile
 * Jaw-dropping, production-ready, and fully consistent
 */
export declare const MOTION_CONFIG: {
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
export declare const TIMING: {
    readonly stagger: {
        readonly slow: 0.15;
        readonly normal: 0.1;
        readonly fast: 0.05;
        readonly instant: 0.02;
    };
    readonly duration: {
        readonly instant: 0.1;
        readonly fast: 0.2;
        readonly normal: 0.3;
        readonly slow: 0.5;
        readonly slower: 0.8;
    };
};
export declare const COLORS: {
    readonly primary: {
        readonly 50: "#fdf2f8";
        readonly 100: "#fce7f3";
        readonly 200: "#fbcfe8";
        readonly 300: "#f9a8d4";
        readonly 400: "#f472b6";
        readonly 500: "#ec4899";
        readonly 600: "#db2777";
        readonly 700: "#be185d";
        readonly 800: "#9d174d";
        readonly 900: "#831843";
        readonly 950: "#500724";
    };
    readonly secondary: {
        readonly 50: "#f0f9ff";
        readonly 100: "#e0f2fe";
        readonly 200: "#bae6fd";
        readonly 300: "#7dd3fc";
        readonly 400: "#38bdf8";
        readonly 500: "#0ea5e9";
        readonly 600: "#0284c7";
        readonly 700: "#0369a1";
        readonly 800: "#075985";
        readonly 900: "#0c4a6e";
        readonly 950: "#082f49";
    };
    readonly purple: {
        readonly 50: "#faf5ff";
        readonly 100: "#f3e8ff";
        readonly 200: "#e9d5ff";
        readonly 300: "#d8b4fe";
        readonly 400: "#c084fc";
        readonly 500: "#a855f7";
        readonly 600: "#9333ea";
        readonly 700: "#7c3aed";
        readonly 800: "#6b21b6";
        readonly 900: "#581c87";
        readonly 950: "#3b0764";
    };
    readonly success: {
        readonly 50: "#f0fdf4";
        readonly 100: "#dcfce7";
        readonly 200: "#bbf7d0";
        readonly 300: "#86efac";
        readonly 400: "#4ade80";
        readonly 500: "#22c55e";
        readonly 600: "#16a34a";
        readonly 700: "#15803d";
        readonly 800: "#166534";
        readonly 900: "#14532d";
        readonly 950: "#052e16";
    };
    readonly warning: {
        readonly 50: "#fffbeb";
        readonly 100: "#fef3c7";
        readonly 200: "#fde68a";
        readonly 300: "#fcd34d";
        readonly 400: "#fbbf24";
        readonly 500: "#f59e0b";
        readonly 600: "#d97706";
        readonly 700: "#b45309";
        readonly 800: "#92400e";
        readonly 900: "#78350f";
        readonly 950: "#451a03";
    };
    readonly error: {
        readonly 50: "#fef2f2";
        readonly 100: "#fee2e2";
        readonly 200: "#fecaca";
        readonly 300: "#fca5a5";
        readonly 400: "#f87171";
        readonly 500: "#ef4444";
        readonly 600: "#dc2626";
        readonly 700: "#b91c1c";
        readonly 800: "#991b1b";
        readonly 900: "#7f1d1d";
        readonly 950: "#450a0a";
    };
    readonly danger: {
        readonly 50: "#fef2f2";
        readonly 100: "#fee2e2";
        readonly 200: "#fecaca";
        readonly 300: "#fca5a5";
        readonly 400: "#f87171";
        readonly 500: "#ef4444";
        readonly 600: "#dc2626";
        readonly 700: "#b91c1c";
        readonly 800: "#991b1b";
        readonly 900: "#7f1d1d";
        readonly 950: "#450a0a";
    };
    readonly neutral: {
        readonly 0: "#ffffff";
        readonly 50: "#fafafa";
        readonly 100: "#f5f5f5";
        readonly 200: "#e5e5e5";
        readonly 300: "#d4d4d4";
        readonly 400: "#a3a3a3";
        readonly 500: "#737373";
        readonly 600: "#525252";
        readonly 700: "#404040";
        readonly 800: "#262626";
        readonly 900: "#171717";
        readonly 950: "#0a0a0a";
        readonly 1000: "#000000";
    };
    readonly semantic: {
        readonly online: "#22c55e";
        readonly offline: "#6b7280";
        readonly typing: "#3b82f6";
        readonly unread: "#ef4444";
        readonly premium: "#f59e0b";
        readonly verified: "#3b82f6";
        readonly new: "#10b981";
        readonly popular: "#f97316";
    };
};
export declare const GRADIENTS: {
    readonly primary: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)";
    readonly primaryLight: "linear-gradient(135deg, #f9a8d4 0%, #fbcfe8 100%)";
    readonly primaryDark: "linear-gradient(135deg, #be185d 0%, #ec4899 100%)";
    readonly secondary: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)";
    readonly secondaryLight: "linear-gradient(135deg, #7dd3fc 0%, #bae6fd 100%)";
    readonly purple: "linear-gradient(135deg, #a855f7 0%, #c084fc 100%)";
    readonly sunset: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)";
    readonly ocean: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)";
    readonly forest: "linear-gradient(135deg, #059669 0%, #10b981 100%)";
    readonly glass: {
        readonly light: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)";
        readonly dark: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)";
        readonly primary: "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(244, 114, 182, 0.05) 100%)";
        readonly secondary: "linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(56, 189, 248, 0.05) 100%)";
    };
    readonly mesh: {
        readonly warm: "linear-gradient(135deg, #ff6b6b 0%, #ffd93d 25%, #6bcf7f 50%, #4d96ff 75%, #9b59b6 100%)";
        readonly cool: "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)";
        readonly sunset: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 25%, #fecfef 50%, #f093fb 75%, #a8edea 100%)";
    };
    readonly success: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)";
    readonly warning: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
    readonly danger: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
    readonly holographic: "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)";
    readonly holographicHover: "linear-gradient(135deg, #764ba2 0%, #f093fb 25%, #f5576c 50%, #4facfe 75%, #667eea 100%)";
    readonly neon: "linear-gradient(135deg, #00f5ff 0%, #ff00ff 50%, #ffff00 100%)";
    readonly neonHover: "linear-gradient(135deg, #ff00ff 0%, #ffff00 50%, #00f5ff 100%)";
};
export declare const TYPOGRAPHY: {
    readonly fonts: {
        readonly primary: "\"Inter\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif";
        readonly display: "\"SF Pro Display\", -apple-system, BlinkMacSystemFont, sans-serif";
        readonly mono: "\"JetBrains Mono\", \"SF Mono\", Monaco, \"Cascadia Code\", monospace";
    };
    readonly weights: {
        readonly thin: 100;
        readonly light: 300;
        readonly regular: 400;
        readonly medium: 500;
        readonly semibold: 600;
        readonly bold: 700;
        readonly extrabold: 800;
        readonly black: 900;
    };
    readonly sizes: {
        readonly xs: {
            readonly size: 12;
            readonly lineHeight: 16;
        };
        readonly sm: {
            readonly size: 14;
            readonly lineHeight: 20;
        };
        readonly base: {
            readonly size: 16;
            readonly lineHeight: 24;
        };
        readonly lg: {
            readonly size: 18;
            readonly lineHeight: 28;
        };
        readonly xl: {
            readonly size: 20;
            readonly lineHeight: 28;
        };
        readonly '2xl': {
            readonly size: 24;
            readonly lineHeight: 32;
        };
        readonly '3xl': {
            readonly size: 30;
            readonly lineHeight: 36;
        };
        readonly '4xl': {
            readonly size: 36;
            readonly lineHeight: 40;
        };
        readonly '5xl': {
            readonly size: 48;
            readonly lineHeight: 56;
        };
        readonly '6xl': {
            readonly size: 60;
            readonly lineHeight: 72;
        };
        readonly '7xl': {
            readonly size: 72;
            readonly lineHeight: 80;
        };
        readonly '8xl': {
            readonly size: 96;
            readonly lineHeight: 104;
        };
        readonly '9xl': {
            readonly size: 128;
            readonly lineHeight: 136;
        };
    };
    readonly letterSpacing: {
        readonly tighter: "-0.05em";
        readonly tight: "-0.025em";
        readonly normal: "0";
        readonly wide: "0.025em";
        readonly wider: "0.05em";
        readonly widest: "0.1em";
    };
};
export declare const SPACING: {
    readonly px: 1;
    readonly 0: 0;
    readonly 0.5: 2;
    readonly 1: 4;
    readonly 1.5: 6;
    readonly 2: 8;
    readonly 2.5: 10;
    readonly 3: 12;
    readonly 3.5: 14;
    readonly 4: 16;
    readonly 5: 20;
    readonly 6: 24;
    readonly 7: 28;
    readonly 8: 32;
    readonly 9: 36;
    readonly 10: 40;
    readonly 11: 44;
    readonly 12: 48;
    readonly 14: 56;
    readonly 16: 64;
    readonly 20: 80;
    readonly 24: 96;
    readonly 28: 112;
    readonly 32: 128;
    readonly 36: 144;
    readonly 40: 160;
    readonly 44: 176;
    readonly 48: 192;
    readonly 52: 208;
    readonly 56: 224;
    readonly 60: 240;
    readonly 64: 256;
    readonly 72: 288;
    readonly 80: 320;
    readonly 96: 384;
};
export declare const RADIUS: {
    readonly none: 0;
    readonly sm: 2;
    readonly base: 4;
    readonly md: 6;
    readonly lg: 8;
    readonly xl: 12;
    readonly '2xl': 16;
    readonly '3xl': 24;
    readonly full: 9999;
};
export declare const SHADOWS: {
    readonly sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
    readonly base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
    readonly md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    readonly lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
    readonly xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
    readonly '2xl': "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
    readonly inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)";
    readonly primaryGlow: "0 20px 40px -12px rgba(236, 72, 153, 0.4)";
    readonly secondaryGlow: "0 20px 40px -12px rgba(14, 165, 233, 0.4)";
    readonly purpleGlow: "0 20px 40px -12px rgba(168, 85, 247, 0.4)";
    readonly successGlow: "0 20px 40px -12px rgba(34, 197, 94, 0.4)";
    readonly warningGlow: "0 20px 40px -12px rgba(245, 158, 11, 0.4)";
    readonly errorGlow: "0 20px 40px -12px rgba(239, 68, 68, 0.4)";
    readonly dangerGlow: "0 20px 40px -12px rgba(239, 68, 68, 0.4)";
    readonly holographicGlow: "0 20px 40px -12px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)";
    readonly neonGlow: "0 0 20px rgba(0, 245, 255, 0.6), 0 0 40px rgba(255, 0, 255, 0.4), 0 0 60px rgba(255, 255, 0, 0.2)";
    readonly glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)";
    readonly glassDark: "0 8px 32px 0 rgba(0, 0, 0, 0.3)";
};
export declare const BACKDROP: {
    readonly blur: {
        readonly none: "none";
        readonly sm: "blur(4px)";
        readonly base: "blur(8px)";
        readonly md: "blur(12px)";
        readonly lg: "blur(16px)";
        readonly xl: "blur(24px)";
        readonly '2xl': "blur(40px)";
        readonly '3xl': "blur(64px)";
    };
    readonly brightness: {
        readonly darkest: "brightness(0.5)";
        readonly darker: "brightness(0.75)";
        readonly normal: "brightness(1)";
        readonly brighter: "brightness(1.25)";
        readonly brightest: "brightness(1.5)";
    };
    readonly contrast: {
        readonly low: "contrast(0.8)";
        readonly normal: "contrast(1)";
        readonly high: "contrast(1.2)";
        readonly highest: "contrast(1.5)";
    };
};
export declare const BREAKPOINTS: {
    readonly xs: 375;
    readonly sm: 640;
    readonly md: 768;
    readonly lg: 1024;
    readonly xl: 1280;
    readonly '2xl': 1536;
};
export declare const Z_INDEX: {
    readonly hide: -1;
    readonly auto: "auto";
    readonly base: 0;
    readonly docked: 10;
    readonly dropdown: 1000;
    readonly sticky: 1100;
    readonly banner: 1200;
    readonly overlay: 1300;
    readonly modal: 1400;
    readonly popover: 1500;
    readonly skipLink: 1600;
    readonly toast: 1700;
    readonly tooltip: 1800;
};
export declare const VARIANTS: {
    readonly button: {
        readonly primary: {
            readonly background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)";
            readonly color: "#ffffff";
            readonly shadow: "0 20px 40px -12px rgba(236, 72, 153, 0.4)";
            readonly hover: {
                readonly transform: "translateY(-2px)";
                readonly shadow: "0 20px 40px -12px rgba(236, 72, 153, 0.4)";
            };
        };
        readonly secondary: {
            readonly background: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)";
            readonly color: "#ffffff";
            readonly shadow: "0 20px 40px -12px rgba(14, 165, 233, 0.4)";
            readonly hover: {
                readonly transform: "translateY(-2px)";
                readonly shadow: "0 20px 40px -12px rgba(14, 165, 233, 0.4)";
            };
        };
        readonly ghost: {
            readonly background: "transparent";
            readonly color: "#404040";
            readonly border: "1px solid #d4d4d4";
            readonly hover: {
                readonly background: "#fafafa";
                readonly transform: "translateY(-1px)";
            };
        };
        readonly glass: {
            readonly background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)";
            readonly backdropFilter: "blur(12px)";
            readonly border: "1px solid rgba(255, 255, 255, 0.2)";
            readonly color: "#262626";
            readonly shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)";
        };
    };
    readonly card: {
        readonly default: {
            readonly background: "#ffffff";
            readonly shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
            readonly border: "1px solid #e5e5e5";
            readonly borderRadius: 16;
        };
        readonly glass: {
            readonly background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)";
            readonly backdropFilter: "blur(16px)";
            readonly border: "1px solid rgba(255, 255, 255, 0.2)";
            readonly shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)";
            readonly borderRadius: 16;
        };
        readonly elevated: {
            readonly background: "#ffffff";
            readonly shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
            readonly borderRadius: 16;
            readonly transform: "translateY(-4px)";
        };
    };
};
export declare const utils: {
    readonly withOpacity: (color: string, opacity: number) => string;
    readonly responsive: <T>(values: Partial<Record<keyof typeof BREAKPOINTS, T>>) => Partial<Record<"sm" | "md" | "lg" | "xl" | "2xl" | "xs", T>>;
    readonly darkMode: (lightColor: string, darkColor: string) => {
        light: string;
        dark: string;
    };
    readonly fadeInUp: {
        readonly initial: {
            readonly opacity: 0;
            readonly y: 20;
        };
        readonly animate: {
            readonly opacity: 1;
            readonly y: 0;
        };
        readonly exit: {
            readonly opacity: 0;
            readonly y: -20;
        };
        readonly transition: {
            readonly type: "spring";
            readonly stiffness: 300;
            readonly damping: 30;
            readonly mass: 1;
        };
    };
    readonly slideIn: (direction?: "left" | "right" | "up" | "down") => {
        initial: {
            x: number;
            opacity: number;
        } | {
            x: number;
            opacity: number;
        } | {
            y: number;
            opacity: number;
        } | {
            y: number;
            opacity: number;
        };
        animate: {
            opacity: number;
            x: number;
            y: number;
        };
        exit: {
            x: number;
            opacity: number;
        } | {
            x: number;
            opacity: number;
        } | {
            y: number;
            opacity: number;
        } | {
            y: number;
            opacity: number;
        };
        transition: {
            readonly type: "spring";
            readonly stiffness: 300;
            readonly damping: 30;
            readonly mass: 1;
        };
    };
    readonly staggerChildren: (delay?: keyof typeof TIMING.stagger) => {
        animate: {
            transition: {
                staggerChildren: 0.1 | 0.05 | 0.15 | 0.02;
            };
        };
    };
};
export type ColorScale = typeof COLORS.primary;
export type SpacingValue = keyof typeof SPACING;
export type RadiusValue = keyof typeof RADIUS;
export type ShadowValue = keyof typeof SHADOWS;
export type TypographySize = keyof typeof TYPOGRAPHY.sizes;
export type FontWeight = keyof typeof TYPOGRAPHY.weights;
export type BreakpointKey = keyof typeof BREAKPOINTS;
//# sourceMappingURL=design-system.d.ts.map