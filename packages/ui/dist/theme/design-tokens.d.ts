/**
 * 🎨 UNIFIED DESIGN TOKENS - Single Source of Truth
 * Comprehensive design system tokens for consistent styling across web and mobile
 * Optimized for performance, accessibility, and premium user experience
 */
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
    readonly tertiary: {
        readonly 50: "#faf5ff";
        readonly 100: "#f3e8ff";
        readonly 200: "#e9d5ff";
        readonly 300: "#d8b4fe";
        readonly 400: "#c084fc";
        readonly 500: "#a855f7";
        readonly 600: "#9333ea";
        readonly 700: "#7e22ce";
        readonly 800: "#6b21a8";
        readonly 900: "#581c87";
        readonly 950: "#3b0764";
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
    readonly info: {
        readonly 50: "#eff6ff";
        readonly 100: "#dbeafe";
        readonly 200: "#bfdbfe";
        readonly 300: "#93c5fd";
        readonly 400: "#60a5fa";
        readonly 500: "#3b82f6";
        readonly 600: "#2563eb";
        readonly 700: "#1d4ed8";
        readonly 800: "#1e40af";
        readonly 900: "#1e3a8a";
        readonly 950: "#172554";
    };
};
export declare const GRADIENTS: {
    readonly primary: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
    readonly secondary: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)";
    readonly tertiary: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
    readonly mesh: {
        readonly warm: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 25%, #c44569 50%, #a8385d 75%, #7f2c53 100%)";
        readonly cool: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)";
        readonly sunset: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)";
        readonly ocean: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
        readonly royal: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)";
    };
    readonly glass: {
        readonly light: "rgba(255, 255, 255, 0.1)";
        readonly medium: "rgba(255, 255, 255, 0.2)";
        readonly dark: "rgba(0, 0, 0, 0.1)";
        readonly primary: "rgba(236, 72, 153, 0.1)";
        readonly secondary: "rgba(14, 165, 233, 0.1)";
    };
    readonly holographic: "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7b8, #96ceb4, #ffeaa7)";
    readonly neon: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
    readonly rainbow: "linear-gradient(90deg, #ff0080, #ff8c00, #40e0d0, #4169e1, #9370db)";
};
export declare const SHADOWS: {
    readonly sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
    readonly md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    readonly lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
    readonly xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
    readonly '2xl': "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
    readonly premium: "0 20px 40px -12px rgba(0, 0, 0, 0.15)";
    readonly 'premium-lg': "0 30px 60px -12px rgba(0, 0, 0, 0.25)";
    readonly glass: "0 8px 32px 0 rgba(31, 38, 135, 0.15)";
    readonly primaryGlow: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
    readonly secondaryGlow: "0 10px 40px -10px rgba(14, 165, 233, 0.6)";
    readonly tertiaryGlow: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
    readonly successGlow: "0 10px 40px -10px rgba(34, 197, 94, 0.6)";
    readonly errorGlow: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
    readonly warningGlow: "0 10px 40px -10px rgba(245, 158, 11, 0.6)";
    readonly neon: "0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)";
    readonly neonStrong: "0 0 30px rgba(236, 72, 153, 0.7), 0 0 60px rgba(236, 72, 153, 0.5)";
};
export declare const BLUR: {
    readonly none: "blur(0)";
    readonly sm: "blur(4px)";
    readonly md: "blur(8px)";
    readonly lg: "blur(12px)";
    readonly xl: "blur(16px)";
    readonly '2xl': "blur(24px)";
    readonly premium: "blur(16px) saturate(180%)";
};
export declare const RADIUS: {
    readonly none: "0";
    readonly sm: "0.375rem";
    readonly md: "0.5rem";
    readonly lg: "0.75rem";
    readonly xl: "1rem";
    readonly '2xl': "1.5rem";
    readonly '3xl': "2rem";
    readonly full: "9999px";
};
export declare const SPACING: {
    readonly 0: "0";
    readonly 1: "0.25rem";
    readonly 2: "0.5rem";
    readonly 3: "0.75rem";
    readonly 4: "1rem";
    readonly 5: "1.25rem";
    readonly 6: "1.5rem";
    readonly 8: "2rem";
    readonly 10: "2.5rem";
    readonly 12: "3rem";
    readonly 16: "4rem";
    readonly 20: "5rem";
    readonly 24: "6rem";
    readonly 32: "8rem";
};
export declare const TYPOGRAPHY: {
    readonly fonts: {
        readonly primary: readonly ["Inter", "system-ui", "sans-serif"];
        readonly display: readonly ["SF Pro Display", "system-ui", "sans-serif"];
        readonly mono: readonly ["JetBrains Mono", "monospace"];
    };
    readonly sizes: {
        readonly xs: {
            readonly size: "0.75rem";
            readonly lineHeight: "1rem";
        };
        readonly sm: {
            readonly size: "0.875rem";
            readonly lineHeight: "1.25rem";
        };
        readonly base: {
            readonly size: "1rem";
            readonly lineHeight: "1.5rem";
        };
        readonly lg: {
            readonly size: "1.125rem";
            readonly lineHeight: "1.75rem";
        };
        readonly xl: {
            readonly size: "1.25rem";
            readonly lineHeight: "1.75rem";
        };
        readonly '2xl': {
            readonly size: "1.5rem";
            readonly lineHeight: "2rem";
        };
        readonly '3xl': {
            readonly size: "1.875rem";
            readonly lineHeight: "2.25rem";
        };
        readonly '4xl': {
            readonly size: "2.25rem";
            readonly lineHeight: "2.5rem";
        };
        readonly '5xl': {
            readonly size: "3rem";
            readonly lineHeight: "1";
        };
        readonly '6xl': {
            readonly size: "3.75rem";
            readonly lineHeight: "1";
        };
    };
    readonly weights: {
        readonly thin: 100;
        readonly extralight: 200;
        readonly light: 300;
        readonly regular: 400;
        readonly medium: 500;
        readonly semibold: 600;
        readonly bold: 700;
        readonly extrabold: 800;
        readonly black: 900;
    };
};
export declare const ANIMATIONS: {
    readonly spring: {
        readonly gentle: {
            readonly stiffness: 200;
            readonly damping: 35;
        };
        readonly smooth: {
            readonly stiffness: 300;
            readonly damping: 30;
        };
        readonly bouncy: {
            readonly stiffness: 600;
            readonly damping: 15;
        };
        readonly micro: {
            readonly stiffness: 400;
            readonly damping: 25;
        };
    };
    readonly duration: {
        readonly fast: 0.15;
        readonly medium: 0.3;
        readonly slow: 0.5;
        readonly slower: 0.8;
    };
    readonly easing: {
        readonly easeOut: "ease-out";
        readonly easeIn: "ease-in";
        readonly easeInOut: "ease-in-out";
        readonly spring: "cubic-bezier(0.4, 0, 0.2, 1)";
    };
    readonly keyframes: {
        readonly fadeIn: {
            readonly '0%': {
                readonly opacity: "0";
                readonly transform: "translateY(10px)";
            };
            readonly '100%': {
                readonly opacity: "1";
                readonly transform: "translateY(0)";
            };
        };
        readonly slideUp: {
            readonly '0%': {
                readonly opacity: "0";
                readonly transform: "translateY(20px)";
            };
            readonly '100%': {
                readonly opacity: "1";
                readonly transform: "translateY(0)";
            };
        };
        readonly scaleIn: {
            readonly '0%': {
                readonly opacity: "0";
                readonly transform: "scale(0.9)";
            };
            readonly '100%': {
                readonly opacity: "1";
                readonly transform: "scale(1)";
            };
        };
        readonly shimmer: {
            readonly '0%': {
                readonly backgroundPosition: "200% 0";
            };
            readonly '100%': {
                readonly backgroundPosition: "-200% 0";
            };
        };
        readonly holographic: {
            readonly '0%': {
                readonly backgroundPosition: "0% 50%";
            };
            readonly '50%': {
                readonly backgroundPosition: "100% 50%";
            };
            readonly '100%': {
                readonly backgroundPosition: "0% 50%";
            };
        };
    };
};
export declare const ZINDEX: {
    readonly base: 0;
    readonly dropdown: 1000;
    readonly sticky: 1100;
    readonly modal: 1200;
    readonly popover: 1300;
    readonly tooltip: 1400;
    readonly toast: 1500;
};
export declare const BREAKPOINTS: {
    readonly xs: "375px";
    readonly sm: "640px";
    readonly md: "768px";
    readonly lg: "1024px";
    readonly xl: "1280px";
    readonly '2xl': "1536px";
    readonly '3xl': "1600px";
    readonly uhd: "1920px";
    readonly '4k': "3840px";
};
export declare const COMPONENTS: {
    readonly button: {
        readonly sizes: {
            readonly sm: {
                readonly padding: "8px 16px";
                readonly fontSize: "0.875rem";
                readonly minHeight: "36px";
            };
            readonly md: {
                readonly padding: "12px 24px";
                readonly fontSize: "1rem";
                readonly minHeight: "44px";
            };
            readonly lg: {
                readonly padding: "16px 32px";
                readonly fontSize: "1.125rem";
                readonly minHeight: "52px";
            };
            readonly xl: {
                readonly padding: "20px 40px";
                readonly fontSize: "1.25rem";
                readonly minHeight: "60px";
            };
        };
        readonly borderRadius: "1rem";
    };
    readonly input: {
        readonly sizes: {
            readonly sm: {
                readonly padding: "8px 12px";
                readonly fontSize: "0.875rem";
                readonly minHeight: "40px";
            };
            readonly md: {
                readonly padding: "12px 16px";
                readonly fontSize: "1rem";
                readonly minHeight: "48px";
            };
            readonly lg: {
                readonly padding: "16px 20px";
                readonly fontSize: "1.125rem";
                readonly minHeight: "56px";
            };
        };
        readonly borderRadius: "0.75rem";
    };
    readonly card: {
        readonly borderRadius: "1.5rem";
        readonly padding: {
            readonly sm: "0.75rem";
            readonly md: "1.25rem";
            readonly lg: any;
            readonly xl: any;
        };
    };
};
export declare const utils: {
    readonly colorWithOpacity: (color: string, opacity: number) => string;
    readonly responsive: (values: Record<string, string>) => string;
    readonly createCSSVariables: (tokens: Record<string, any>, prefix?: string) => Record<string, string>;
};
//# sourceMappingURL=design-tokens.d.ts.map