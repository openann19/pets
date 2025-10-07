/**
 * 🎨 UNIFIED DESIGN SYSTEM FOR PAWFECTMATCH
 * Single source of truth for consistent visual design across web and mobile
 * Enforces unified button styles, input fields, and interaction patterns
 */
export declare const BUTTON_SYSTEM: {
    readonly variants: {
        readonly primary: {
            readonly web: {
                readonly background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)";
                readonly color: "#ffffff";
                readonly shadow: "0 20px 40px -12px rgba(236, 72, 153, 0.4)";
                readonly border: "none";
                readonly hover: {
                    readonly background: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)";
                    readonly transform: "translateY(-2px)";
                    readonly shadow: "0 20px 40px -12px rgba(236, 72, 153, 0.4)";
                };
                readonly active: {
                    readonly transform: "translateY(0)";
                    readonly shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                };
            };
            readonly mobile: {
                readonly background: readonly ["#ec4899", "#f472b6"];
                readonly color: "#ffffff";
                readonly shadow: "primaryShadow";
                readonly border: "none";
            };
        };
        readonly secondary: {
            readonly web: {
                readonly background: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)";
                readonly color: "#ffffff";
                readonly shadow: "0 20px 40px -12px rgba(14, 165, 233, 0.4)";
                readonly border: "none";
                readonly hover: {
                    readonly background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)";
                    readonly transform: "translateY(-2px)";
                    readonly shadow: "0 20px 40px -12px rgba(14, 165, 233, 0.4)";
                };
            };
            readonly mobile: {
                readonly background: readonly ["#0ea5e9", "#38bdf8"];
                readonly color: "#ffffff";
                readonly shadow: "secondaryShadow";
                readonly border: "none";
            };
        };
        readonly glass: {
            readonly web: {
                readonly background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)";
                readonly backdropFilter: "blur(16px) saturate(180%)";
                readonly border: "1px solid rgba(255, 255, 255, 0.3)";
                readonly color: "#262626";
                readonly shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)";
                readonly hover: {
                    readonly background: "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(244, 114, 182, 0.05) 100%)";
                    readonly border: "1px solid rgba(255, 255, 255, 0.4)";
                    readonly transform: "translateY(-1px)";
                };
            };
            readonly mobile: {
                readonly background: readonly ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"];
                readonly color: "#262626";
                readonly shadow: "lg";
                readonly border: "1px solid rgba(255, 255, 255, 0.3)";
            };
        };
        readonly outline: {
            readonly web: {
                readonly background: "transparent";
                readonly color: "#ec4899";
                readonly border: "2px solid #ec4899";
                readonly shadow: "none";
                readonly hover: {
                    readonly background: "#fdf2f8";
                    readonly transform: "translateY(-1px)";
                };
            };
            readonly mobile: {
                readonly background: "transparent";
                readonly color: "#ec4899";
                readonly border: "2px solid #ec4899";
                readonly shadow: "none";
            };
        };
    };
    readonly sizes: {
        readonly sm: {
            readonly web: {
                readonly padding: "8px 16px";
                readonly fontSize: 14;
                readonly minHeight: "36px";
                readonly borderRadius: 8;
            };
            readonly mobile: {
                readonly paddingHorizontal: 16;
                readonly paddingVertical: 8;
                readonly fontSize: 14;
                readonly minHeight: 36;
                readonly borderRadius: 8;
            };
        };
        readonly md: {
            readonly web: {
                readonly padding: "12px 24px";
                readonly fontSize: 16;
                readonly minHeight: "44px";
                readonly borderRadius: 12;
            };
            readonly mobile: {
                readonly paddingHorizontal: 24;
                readonly paddingVertical: 12;
                readonly fontSize: 16;
                readonly minHeight: 44;
                readonly borderRadius: 12;
            };
        };
        readonly lg: {
            readonly web: {
                readonly padding: "16px 32px";
                readonly fontSize: 18;
                readonly minHeight: "52px";
                readonly borderRadius: 16;
            };
            readonly mobile: {
                readonly paddingHorizontal: 32;
                readonly paddingVertical: 16;
                readonly fontSize: 18;
                readonly minHeight: 52;
                readonly borderRadius: 16;
            };
        };
        readonly xl: {
            readonly web: {
                readonly padding: "20px 40px";
                readonly fontSize: 20;
                readonly minHeight: "60px";
                readonly borderRadius: 16;
            };
            readonly mobile: {
                readonly paddingHorizontal: 40;
                readonly paddingVertical: 20;
                readonly fontSize: 20;
                readonly minHeight: 60;
                readonly borderRadius: 16;
            };
        };
    };
    readonly states: {
        readonly disabled: {
            readonly web: {
                readonly opacity: 0.5;
                readonly cursor: "not-allowed";
                readonly transform: "none";
            };
            readonly mobile: {
                readonly opacity: 0.5;
            };
        };
        readonly loading: {
            readonly web: {
                readonly opacity: 0.8;
                readonly cursor: "wait";
            };
            readonly mobile: {
                readonly opacity: 0.8;
            };
        };
    };
};
export declare const INPUT_SYSTEM: {
    readonly variants: {
        readonly default: {
            readonly web: {
                readonly background: "rgba(255, 255, 255, 0.1)";
                readonly border: "1px solid rgba(255, 255, 255, 0.2)";
                readonly color: "#ffffff";
                readonly focus: {
                    readonly background: "rgba(255, 255, 255, 0.15)";
                    readonly border: "2px solid #f472b6";
                    readonly shadow: "0 0 0 3px #fbcfe840";
                };
            };
            readonly mobile: {
                readonly background: "rgba(255, 255, 255, 0.1)";
                readonly border: "1px solid rgba(255, 255, 255, 0.2)";
                readonly color: "#ffffff";
                readonly focus: {
                    readonly background: "rgba(255, 255, 255, 0.15)";
                    readonly border: "2px solid #ec4899";
                };
            };
        };
        readonly filled: {
            readonly web: {
                readonly background: "#fafafa";
                readonly border: "1px solid #e5e5e5";
                readonly color: "#262626";
                readonly focus: {
                    readonly background: "#ffffff";
                    readonly border: "2px solid #ec4899";
                    readonly shadow: "0 0 0 3px #fce7f3";
                };
            };
            readonly mobile: {
                readonly background: "#fafafa";
                readonly border: "1px solid #e5e5e5";
                readonly color: "#262626";
                readonly focus: {
                    readonly background: "#ffffff";
                    readonly border: "2px solid #ec4899";
                };
            };
        };
        readonly outline: {
            readonly web: {
                readonly background: "transparent";
                readonly border: "2px solid #d4d4d4";
                readonly color: "#262626";
                readonly focus: {
                    readonly border: "2px solid #ec4899";
                    readonly shadow: "0 0 0 3px #fce7f3";
                };
            };
            readonly mobile: {
                readonly background: "transparent";
                readonly border: "2px solid #d4d4d4";
                readonly color: "#262626";
                readonly focus: {
                    readonly border: "2px solid #ec4899";
                };
            };
        };
    };
    readonly sizes: {
        readonly sm: {
            readonly web: {
                readonly padding: "8px 12px";
                readonly fontSize: 14;
                readonly borderRadius: 6;
            };
            readonly mobile: {
                readonly paddingHorizontal: 12;
                readonly paddingVertical: 8;
                readonly fontSize: 14;
                readonly borderRadius: 8;
            };
        };
        readonly md: {
            readonly web: {
                readonly padding: "12px 16px";
                readonly fontSize: 16;
                readonly borderRadius: 8;
            };
            readonly mobile: {
                readonly paddingHorizontal: 16;
                readonly paddingVertical: 12;
                readonly fontSize: 16;
                readonly borderRadius: 12;
            };
        };
        readonly lg: {
            readonly web: {
                readonly padding: "16px 20px";
                readonly fontSize: 18;
                readonly borderRadius: 12;
            };
            readonly mobile: {
                readonly paddingHorizontal: 20;
                readonly paddingVertical: 16;
                readonly fontSize: 18;
                readonly borderRadius: 16;
            };
        };
    };
    readonly states: {
        readonly error: {
            readonly web: {
                readonly border: "2px solid #ef4444";
                readonly background: "#fef2f2";
                readonly shadow: "0 0 0 3px #fee2e2";
            };
            readonly mobile: {
                readonly border: "2px solid #ef4444";
                readonly background: "#fef2f2";
            };
        };
        readonly success: {
            readonly web: {
                readonly border: "2px solid #22c55e";
                readonly background: "#f0fdf4";
                readonly shadow: "0 0 0 3px #dcfce7";
            };
            readonly mobile: {
                readonly border: "2px solid #22c55e";
                readonly background: "#f0fdf4";
            };
        };
        readonly disabled: {
            readonly web: {
                readonly opacity: 0.5;
                readonly cursor: "not-allowed";
                readonly background: "#f5f5f5";
            };
            readonly mobile: {
                readonly opacity: 0.5;
                readonly background: "#f5f5f5";
            };
        };
    };
};
export declare const CARD_SYSTEM: {
    readonly variants: {
        readonly default: {
            readonly web: {
                readonly background: "#ffffff";
                readonly shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                readonly border: "1px solid #e5e5e5";
                readonly borderRadius: 16;
            };
            readonly mobile: {
                readonly background: "#ffffff";
                readonly shadow: "lg";
                readonly border: "1px solid #e5e5e5";
                readonly borderRadius: 16;
            };
        };
        readonly glass: {
            readonly web: {
                readonly background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)";
                readonly backdropFilter: "blur(16px) saturate(180%)";
                readonly border: "1px solid rgba(255, 255, 255, 0.2)";
                readonly shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)";
                readonly borderRadius: 16;
            };
            readonly mobile: {
                readonly background: readonly ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"];
                readonly border: "1px solid rgba(255, 255, 255, 0.2)";
                readonly shadow: "lg";
                readonly borderRadius: 16;
            };
        };
        readonly elevated: {
            readonly web: {
                readonly background: "#ffffff";
                readonly shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
                readonly borderRadius: 16;
                readonly transform: "translateY(-4px)";
            };
            readonly mobile: {
                readonly background: "#ffffff";
                readonly shadow: "2xl";
                readonly borderRadius: 16;
            };
        };
    };
};
export declare const TYPOGRAPHY_SYSTEM: {
    readonly fonts: {
        readonly primary: {
            readonly web: "\"Inter\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif";
            readonly mobile: "System";
        };
        readonly display: {
            readonly web: "\"SF Pro Display\", -apple-system, BlinkMacSystemFont, sans-serif";
            readonly mobile: "System";
        };
    };
    readonly styles: {
        readonly h1: {
            readonly web: {
                readonly fontSize: 36;
                readonly fontWeight: 800;
                readonly lineHeight: 40;
            };
            readonly mobile: {
                readonly fontSize: 32;
                readonly fontWeight: "800";
                readonly lineHeight: 40;
            };
        };
        readonly h2: {
            readonly web: {
                readonly fontSize: 30;
                readonly fontWeight: 700;
                readonly lineHeight: 36;
            };
            readonly mobile: {
                readonly fontSize: 28;
                readonly fontWeight: "700";
                readonly lineHeight: 36;
            };
        };
        readonly h3: {
            readonly web: {
                readonly fontSize: 24;
                readonly fontWeight: 600;
                readonly lineHeight: 32;
            };
            readonly mobile: {
                readonly fontSize: 24;
                readonly fontWeight: "600";
                readonly lineHeight: 32;
            };
        };
        readonly body: {
            readonly web: {
                readonly fontSize: 16;
                readonly fontWeight: 400;
                readonly lineHeight: 24;
            };
            readonly mobile: {
                readonly fontSize: 16;
                readonly fontWeight: "400";
                readonly lineHeight: 24;
            };
        };
        readonly caption: {
            readonly web: {
                readonly fontSize: 14;
                readonly fontWeight: 500;
                readonly lineHeight: 20;
            };
            readonly mobile: {
                readonly fontSize: 14;
                readonly fontWeight: "500";
                readonly lineHeight: 20;
            };
        };
    };
};
export declare const ANIMATION_SYSTEM: {
    readonly transitions: {
        readonly fast: {
            readonly web: {
                readonly duration: 0.15;
                readonly ease: "easeOut";
            };
            readonly mobile: {
                readonly duration: 150;
            };
        };
        readonly medium: {
            readonly web: {
                readonly duration: 0.3;
                readonly ease: "easeOut";
            };
            readonly mobile: {
                readonly duration: 300;
            };
        };
        readonly slow: {
            readonly web: {
                readonly duration: 0.5;
                readonly ease: "easeOut";
            };
            readonly mobile: {
                readonly duration: 500;
            };
        };
    };
    readonly microInteractions: {
        readonly buttonPress: {
            readonly web: {
                readonly scale: 0.95;
            };
            readonly mobile: {
                readonly scale: 0.96;
            };
        };
        readonly cardHover: {
            readonly web: {
                readonly y: -4;
                readonly shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
            };
            readonly mobile: {
                readonly scale: 0.98;
            };
        };
        readonly fadeIn: {
            readonly web: {
                readonly opacity: 0;
                readonly y: 20;
            };
            readonly mobile: {
                readonly opacity: 0;
                readonly translateY: 20;
            };
        };
    };
};
export declare const COLOR_SYSTEM: {
    readonly primary: {
        readonly web: "#ec4899";
        readonly mobile: {
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
    };
    readonly secondary: {
        readonly web: "#0ea5e9";
        readonly mobile: {
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
    };
    readonly success: {
        readonly web: "#22c55e";
        readonly mobile: "#22c55e";
    };
    readonly warning: {
        readonly web: "#f59e0b";
        readonly mobile: {
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
    };
    readonly error: {
        readonly web: "#ef4444";
        readonly mobile: "#ef4444";
    };
    readonly text: {
        readonly primary: {
            readonly web: "#262626";
            readonly mobile: "#262626";
        };
        readonly secondary: {
            readonly web: "#525252";
            readonly mobile: "#525252";
        };
        readonly muted: {
            readonly web: "#737373";
            readonly mobile: "#737373";
        };
    };
    readonly background: {
        readonly primary: {
            readonly web: "#ffffff";
            readonly mobile: "#ffffff";
        };
        readonly secondary: {
            readonly web: "#fafafa";
            readonly mobile: "#fafafa";
        };
    };
};
export declare const utils: {
    readonly getPlatformStyles: <T>(styles: {
        web: T;
        mobile: T;
    }, platform?: "web" | "mobile") => T;
    readonly createButtonStyles: (variant: keyof typeof BUTTON_SYSTEM.variants, size: keyof typeof BUTTON_SYSTEM.sizes, platform?: "web" | "mobile") => {
        padding: "8px 16px";
        fontSize: 14;
        minHeight: "36px";
        borderRadius: 8;
        background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)";
        color: "#ffffff";
        shadow: "0 20px 40px -12px rgba(236, 72, 153, 0.4)";
        border: "none";
        hover: {
            readonly background: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)";
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 40px -12px rgba(236, 72, 153, 0.4)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
        };
    } | {
        paddingHorizontal: 16;
        paddingVertical: 8;
        fontSize: 14;
        minHeight: 36;
        borderRadius: 8;
        background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)";
        color: "#ffffff";
        shadow: "0 20px 40px -12px rgba(236, 72, 153, 0.4)";
        border: "none";
        hover: {
            readonly background: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)";
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 40px -12px rgba(236, 72, 153, 0.4)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
        };
    } | {
        padding: "12px 24px";
        fontSize: 16;
        minHeight: "44px";
        borderRadius: 12;
        background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)";
        color: "#ffffff";
        shadow: "0 20px 40px -12px rgba(236, 72, 153, 0.4)";
        border: "none";
        hover: {
            readonly background: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)";
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 40px -12px rgba(236, 72, 153, 0.4)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
        };
    } | {
        paddingHorizontal: 24;
        paddingVertical: 12;
        fontSize: 16;
        minHeight: 44;
        borderRadius: 12;
        background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)";
        color: "#ffffff";
        shadow: "0 20px 40px -12px rgba(236, 72, 153, 0.4)";
        border: "none";
        hover: {
            readonly background: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)";
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 40px -12px rgba(236, 72, 153, 0.4)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
        };
    } | {
        padding: "16px 32px";
        fontSize: 18;
        minHeight: "52px";
        borderRadius: 16;
        background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)";
        color: "#ffffff";
        shadow: "0 20px 40px -12px rgba(236, 72, 153, 0.4)";
        border: "none";
        hover: {
            readonly background: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)";
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 40px -12px rgba(236, 72, 153, 0.4)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
        };
    } | {
        paddingHorizontal: 32;
        paddingVertical: 16;
        fontSize: 18;
        minHeight: 52;
        borderRadius: 16;
        background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)";
        color: "#ffffff";
        shadow: "0 20px 40px -12px rgba(236, 72, 153, 0.4)";
        border: "none";
        hover: {
            readonly background: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)";
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 40px -12px rgba(236, 72, 153, 0.4)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
        };
    } | {
        padding: "20px 40px";
        fontSize: 20;
        minHeight: "60px";
        borderRadius: 16;
        background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)";
        color: "#ffffff";
        shadow: "0 20px 40px -12px rgba(236, 72, 153, 0.4)";
        border: "none";
        hover: {
            readonly background: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)";
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 40px -12px rgba(236, 72, 153, 0.4)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
        };
    } | {
        paddingHorizontal: 40;
        paddingVertical: 20;
        fontSize: 20;
        minHeight: 60;
        borderRadius: 16;
        background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)";
        color: "#ffffff";
        shadow: "0 20px 40px -12px rgba(236, 72, 153, 0.4)";
        border: "none";
        hover: {
            readonly background: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)";
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 40px -12px rgba(236, 72, 153, 0.4)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
        };
    } | {
        padding: "8px 16px";
        fontSize: 14;
        minHeight: "36px";
        borderRadius: 8;
        background: readonly ["#ec4899", "#f472b6"];
        color: "#ffffff";
        shadow: "primaryShadow";
        border: "none";
    } | {
        paddingHorizontal: 16;
        paddingVertical: 8;
        fontSize: 14;
        minHeight: 36;
        borderRadius: 8;
        background: readonly ["#ec4899", "#f472b6"];
        color: "#ffffff";
        shadow: "primaryShadow";
        border: "none";
    } | {
        padding: "12px 24px";
        fontSize: 16;
        minHeight: "44px";
        borderRadius: 12;
        background: readonly ["#ec4899", "#f472b6"];
        color: "#ffffff";
        shadow: "primaryShadow";
        border: "none";
    } | {
        paddingHorizontal: 24;
        paddingVertical: 12;
        fontSize: 16;
        minHeight: 44;
        borderRadius: 12;
        background: readonly ["#ec4899", "#f472b6"];
        color: "#ffffff";
        shadow: "primaryShadow";
        border: "none";
    } | {
        padding: "16px 32px";
        fontSize: 18;
        minHeight: "52px";
        borderRadius: 16;
        background: readonly ["#ec4899", "#f472b6"];
        color: "#ffffff";
        shadow: "primaryShadow";
        border: "none";
    } | {
        paddingHorizontal: 32;
        paddingVertical: 16;
        fontSize: 18;
        minHeight: 52;
        borderRadius: 16;
        background: readonly ["#ec4899", "#f472b6"];
        color: "#ffffff";
        shadow: "primaryShadow";
        border: "none";
    } | {
        padding: "20px 40px";
        fontSize: 20;
        minHeight: "60px";
        borderRadius: 16;
        background: readonly ["#ec4899", "#f472b6"];
        color: "#ffffff";
        shadow: "primaryShadow";
        border: "none";
    } | {
        paddingHorizontal: 40;
        paddingVertical: 20;
        fontSize: 20;
        minHeight: 60;
        borderRadius: 16;
        background: readonly ["#ec4899", "#f472b6"];
        color: "#ffffff";
        shadow: "primaryShadow";
        border: "none";
    } | {
        padding: "8px 16px";
        fontSize: 14;
        minHeight: "36px";
        borderRadius: 8;
        background: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)";
        color: "#ffffff";
        shadow: "0 20px 40px -12px rgba(14, 165, 233, 0.4)";
        border: "none";
        hover: {
            readonly background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)";
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 40px -12px rgba(14, 165, 233, 0.4)";
        };
    } | {
        paddingHorizontal: 16;
        paddingVertical: 8;
        fontSize: 14;
        minHeight: 36;
        borderRadius: 8;
        background: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)";
        color: "#ffffff";
        shadow: "0 20px 40px -12px rgba(14, 165, 233, 0.4)";
        border: "none";
        hover: {
            readonly background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)";
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 40px -12px rgba(14, 165, 233, 0.4)";
        };
    } | {
        padding: "12px 24px";
        fontSize: 16;
        minHeight: "44px";
        borderRadius: 12;
        background: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)";
        color: "#ffffff";
        shadow: "0 20px 40px -12px rgba(14, 165, 233, 0.4)";
        border: "none";
        hover: {
            readonly background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)";
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 40px -12px rgba(14, 165, 233, 0.4)";
        };
    } | {
        paddingHorizontal: 24;
        paddingVertical: 12;
        fontSize: 16;
        minHeight: 44;
        borderRadius: 12;
        background: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)";
        color: "#ffffff";
        shadow: "0 20px 40px -12px rgba(14, 165, 233, 0.4)";
        border: "none";
        hover: {
            readonly background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)";
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 40px -12px rgba(14, 165, 233, 0.4)";
        };
    } | {
        padding: "16px 32px";
        fontSize: 18;
        minHeight: "52px";
        borderRadius: 16;
        background: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)";
        color: "#ffffff";
        shadow: "0 20px 40px -12px rgba(14, 165, 233, 0.4)";
        border: "none";
        hover: {
            readonly background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)";
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 40px -12px rgba(14, 165, 233, 0.4)";
        };
    } | {
        paddingHorizontal: 32;
        paddingVertical: 16;
        fontSize: 18;
        minHeight: 52;
        borderRadius: 16;
        background: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)";
        color: "#ffffff";
        shadow: "0 20px 40px -12px rgba(14, 165, 233, 0.4)";
        border: "none";
        hover: {
            readonly background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)";
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 40px -12px rgba(14, 165, 233, 0.4)";
        };
    } | {
        padding: "20px 40px";
        fontSize: 20;
        minHeight: "60px";
        borderRadius: 16;
        background: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)";
        color: "#ffffff";
        shadow: "0 20px 40px -12px rgba(14, 165, 233, 0.4)";
        border: "none";
        hover: {
            readonly background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)";
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 40px -12px rgba(14, 165, 233, 0.4)";
        };
    } | {
        paddingHorizontal: 40;
        paddingVertical: 20;
        fontSize: 20;
        minHeight: 60;
        borderRadius: 16;
        background: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)";
        color: "#ffffff";
        shadow: "0 20px 40px -12px rgba(14, 165, 233, 0.4)";
        border: "none";
        hover: {
            readonly background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)";
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 40px -12px rgba(14, 165, 233, 0.4)";
        };
    } | {
        padding: "8px 16px";
        fontSize: 14;
        minHeight: "36px";
        borderRadius: 8;
        background: readonly ["#0ea5e9", "#38bdf8"];
        color: "#ffffff";
        shadow: "secondaryShadow";
        border: "none";
    } | {
        paddingHorizontal: 16;
        paddingVertical: 8;
        fontSize: 14;
        minHeight: 36;
        borderRadius: 8;
        background: readonly ["#0ea5e9", "#38bdf8"];
        color: "#ffffff";
        shadow: "secondaryShadow";
        border: "none";
    } | {
        padding: "12px 24px";
        fontSize: 16;
        minHeight: "44px";
        borderRadius: 12;
        background: readonly ["#0ea5e9", "#38bdf8"];
        color: "#ffffff";
        shadow: "secondaryShadow";
        border: "none";
    } | {
        paddingHorizontal: 24;
        paddingVertical: 12;
        fontSize: 16;
        minHeight: 44;
        borderRadius: 12;
        background: readonly ["#0ea5e9", "#38bdf8"];
        color: "#ffffff";
        shadow: "secondaryShadow";
        border: "none";
    } | {
        padding: "16px 32px";
        fontSize: 18;
        minHeight: "52px";
        borderRadius: 16;
        background: readonly ["#0ea5e9", "#38bdf8"];
        color: "#ffffff";
        shadow: "secondaryShadow";
        border: "none";
    } | {
        paddingHorizontal: 32;
        paddingVertical: 16;
        fontSize: 18;
        minHeight: 52;
        borderRadius: 16;
        background: readonly ["#0ea5e9", "#38bdf8"];
        color: "#ffffff";
        shadow: "secondaryShadow";
        border: "none";
    } | {
        padding: "20px 40px";
        fontSize: 20;
        minHeight: "60px";
        borderRadius: 16;
        background: readonly ["#0ea5e9", "#38bdf8"];
        color: "#ffffff";
        shadow: "secondaryShadow";
        border: "none";
    } | {
        paddingHorizontal: 40;
        paddingVertical: 20;
        fontSize: 20;
        minHeight: 60;
        borderRadius: 16;
        background: readonly ["#0ea5e9", "#38bdf8"];
        color: "#ffffff";
        shadow: "secondaryShadow";
        border: "none";
    } | {
        padding: "8px 16px";
        fontSize: 14;
        minHeight: "36px";
        borderRadius: 8;
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)";
        backdropFilter: "blur(16px) saturate(180%)";
        border: "1px solid rgba(255, 255, 255, 0.3)";
        color: "#262626";
        shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)";
        hover: {
            readonly background: "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(244, 114, 182, 0.05) 100%)";
            readonly border: "1px solid rgba(255, 255, 255, 0.4)";
            readonly transform: "translateY(-1px)";
        };
    } | {
        paddingHorizontal: 16;
        paddingVertical: 8;
        fontSize: 14;
        minHeight: 36;
        borderRadius: 8;
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)";
        backdropFilter: "blur(16px) saturate(180%)";
        border: "1px solid rgba(255, 255, 255, 0.3)";
        color: "#262626";
        shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)";
        hover: {
            readonly background: "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(244, 114, 182, 0.05) 100%)";
            readonly border: "1px solid rgba(255, 255, 255, 0.4)";
            readonly transform: "translateY(-1px)";
        };
    } | {
        padding: "12px 24px";
        fontSize: 16;
        minHeight: "44px";
        borderRadius: 12;
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)";
        backdropFilter: "blur(16px) saturate(180%)";
        border: "1px solid rgba(255, 255, 255, 0.3)";
        color: "#262626";
        shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)";
        hover: {
            readonly background: "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(244, 114, 182, 0.05) 100%)";
            readonly border: "1px solid rgba(255, 255, 255, 0.4)";
            readonly transform: "translateY(-1px)";
        };
    } | {
        paddingHorizontal: 24;
        paddingVertical: 12;
        fontSize: 16;
        minHeight: 44;
        borderRadius: 12;
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)";
        backdropFilter: "blur(16px) saturate(180%)";
        border: "1px solid rgba(255, 255, 255, 0.3)";
        color: "#262626";
        shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)";
        hover: {
            readonly background: "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(244, 114, 182, 0.05) 100%)";
            readonly border: "1px solid rgba(255, 255, 255, 0.4)";
            readonly transform: "translateY(-1px)";
        };
    } | {
        padding: "16px 32px";
        fontSize: 18;
        minHeight: "52px";
        borderRadius: 16;
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)";
        backdropFilter: "blur(16px) saturate(180%)";
        border: "1px solid rgba(255, 255, 255, 0.3)";
        color: "#262626";
        shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)";
        hover: {
            readonly background: "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(244, 114, 182, 0.05) 100%)";
            readonly border: "1px solid rgba(255, 255, 255, 0.4)";
            readonly transform: "translateY(-1px)";
        };
    } | {
        paddingHorizontal: 32;
        paddingVertical: 16;
        fontSize: 18;
        minHeight: 52;
        borderRadius: 16;
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)";
        backdropFilter: "blur(16px) saturate(180%)";
        border: "1px solid rgba(255, 255, 255, 0.3)";
        color: "#262626";
        shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)";
        hover: {
            readonly background: "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(244, 114, 182, 0.05) 100%)";
            readonly border: "1px solid rgba(255, 255, 255, 0.4)";
            readonly transform: "translateY(-1px)";
        };
    } | {
        padding: "20px 40px";
        fontSize: 20;
        minHeight: "60px";
        borderRadius: 16;
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)";
        backdropFilter: "blur(16px) saturate(180%)";
        border: "1px solid rgba(255, 255, 255, 0.3)";
        color: "#262626";
        shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)";
        hover: {
            readonly background: "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(244, 114, 182, 0.05) 100%)";
            readonly border: "1px solid rgba(255, 255, 255, 0.4)";
            readonly transform: "translateY(-1px)";
        };
    } | {
        paddingHorizontal: 40;
        paddingVertical: 20;
        fontSize: 20;
        minHeight: 60;
        borderRadius: 16;
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)";
        backdropFilter: "blur(16px) saturate(180%)";
        border: "1px solid rgba(255, 255, 255, 0.3)";
        color: "#262626";
        shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)";
        hover: {
            readonly background: "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(244, 114, 182, 0.05) 100%)";
            readonly border: "1px solid rgba(255, 255, 255, 0.4)";
            readonly transform: "translateY(-1px)";
        };
    } | {
        padding: "8px 16px";
        fontSize: 14;
        minHeight: "36px";
        borderRadius: 8;
        background: readonly ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"];
        color: "#262626";
        shadow: "lg";
        border: "1px solid rgba(255, 255, 255, 0.3)";
    } | {
        paddingHorizontal: 16;
        paddingVertical: 8;
        fontSize: 14;
        minHeight: 36;
        borderRadius: 8;
        background: readonly ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"];
        color: "#262626";
        shadow: "lg";
        border: "1px solid rgba(255, 255, 255, 0.3)";
    } | {
        padding: "12px 24px";
        fontSize: 16;
        minHeight: "44px";
        borderRadius: 12;
        background: readonly ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"];
        color: "#262626";
        shadow: "lg";
        border: "1px solid rgba(255, 255, 255, 0.3)";
    } | {
        paddingHorizontal: 24;
        paddingVertical: 12;
        fontSize: 16;
        minHeight: 44;
        borderRadius: 12;
        background: readonly ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"];
        color: "#262626";
        shadow: "lg";
        border: "1px solid rgba(255, 255, 255, 0.3)";
    } | {
        padding: "16px 32px";
        fontSize: 18;
        minHeight: "52px";
        borderRadius: 16;
        background: readonly ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"];
        color: "#262626";
        shadow: "lg";
        border: "1px solid rgba(255, 255, 255, 0.3)";
    } | {
        paddingHorizontal: 32;
        paddingVertical: 16;
        fontSize: 18;
        minHeight: 52;
        borderRadius: 16;
        background: readonly ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"];
        color: "#262626";
        shadow: "lg";
        border: "1px solid rgba(255, 255, 255, 0.3)";
    } | {
        padding: "20px 40px";
        fontSize: 20;
        minHeight: "60px";
        borderRadius: 16;
        background: readonly ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"];
        color: "#262626";
        shadow: "lg";
        border: "1px solid rgba(255, 255, 255, 0.3)";
    } | {
        paddingHorizontal: 40;
        paddingVertical: 20;
        fontSize: 20;
        minHeight: 60;
        borderRadius: 16;
        background: readonly ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"];
        color: "#262626";
        shadow: "lg";
        border: "1px solid rgba(255, 255, 255, 0.3)";
    } | {
        padding: "8px 16px";
        fontSize: 14;
        minHeight: "36px";
        borderRadius: 8;
        background: "transparent";
        color: "#ec4899";
        border: "2px solid #ec4899";
        shadow: "none";
        hover: {
            readonly background: "#fdf2f8";
            readonly transform: "translateY(-1px)";
        };
    } | {
        paddingHorizontal: 16;
        paddingVertical: 8;
        fontSize: 14;
        minHeight: 36;
        borderRadius: 8;
        background: "transparent";
        color: "#ec4899";
        border: "2px solid #ec4899";
        shadow: "none";
        hover: {
            readonly background: "#fdf2f8";
            readonly transform: "translateY(-1px)";
        };
    } | {
        padding: "12px 24px";
        fontSize: 16;
        minHeight: "44px";
        borderRadius: 12;
        background: "transparent";
        color: "#ec4899";
        border: "2px solid #ec4899";
        shadow: "none";
        hover: {
            readonly background: "#fdf2f8";
            readonly transform: "translateY(-1px)";
        };
    } | {
        paddingHorizontal: 24;
        paddingVertical: 12;
        fontSize: 16;
        minHeight: 44;
        borderRadius: 12;
        background: "transparent";
        color: "#ec4899";
        border: "2px solid #ec4899";
        shadow: "none";
        hover: {
            readonly background: "#fdf2f8";
            readonly transform: "translateY(-1px)";
        };
    } | {
        padding: "16px 32px";
        fontSize: 18;
        minHeight: "52px";
        borderRadius: 16;
        background: "transparent";
        color: "#ec4899";
        border: "2px solid #ec4899";
        shadow: "none";
        hover: {
            readonly background: "#fdf2f8";
            readonly transform: "translateY(-1px)";
        };
    } | {
        paddingHorizontal: 32;
        paddingVertical: 16;
        fontSize: 18;
        minHeight: 52;
        borderRadius: 16;
        background: "transparent";
        color: "#ec4899";
        border: "2px solid #ec4899";
        shadow: "none";
        hover: {
            readonly background: "#fdf2f8";
            readonly transform: "translateY(-1px)";
        };
    } | {
        padding: "20px 40px";
        fontSize: 20;
        minHeight: "60px";
        borderRadius: 16;
        background: "transparent";
        color: "#ec4899";
        border: "2px solid #ec4899";
        shadow: "none";
        hover: {
            readonly background: "#fdf2f8";
            readonly transform: "translateY(-1px)";
        };
    } | {
        paddingHorizontal: 40;
        paddingVertical: 20;
        fontSize: 20;
        minHeight: 60;
        borderRadius: 16;
        background: "transparent";
        color: "#ec4899";
        border: "2px solid #ec4899";
        shadow: "none";
        hover: {
            readonly background: "#fdf2f8";
            readonly transform: "translateY(-1px)";
        };
    } | {
        padding: "8px 16px";
        fontSize: 14;
        minHeight: "36px";
        borderRadius: 8;
        background: "transparent";
        color: "#ec4899";
        border: "2px solid #ec4899";
        shadow: "none";
    } | {
        paddingHorizontal: 16;
        paddingVertical: 8;
        fontSize: 14;
        minHeight: 36;
        borderRadius: 8;
        background: "transparent";
        color: "#ec4899";
        border: "2px solid #ec4899";
        shadow: "none";
    } | {
        padding: "12px 24px";
        fontSize: 16;
        minHeight: "44px";
        borderRadius: 12;
        background: "transparent";
        color: "#ec4899";
        border: "2px solid #ec4899";
        shadow: "none";
    } | {
        paddingHorizontal: 24;
        paddingVertical: 12;
        fontSize: 16;
        minHeight: 44;
        borderRadius: 12;
        background: "transparent";
        color: "#ec4899";
        border: "2px solid #ec4899";
        shadow: "none";
    } | {
        padding: "16px 32px";
        fontSize: 18;
        minHeight: "52px";
        borderRadius: 16;
        background: "transparent";
        color: "#ec4899";
        border: "2px solid #ec4899";
        shadow: "none";
    } | {
        paddingHorizontal: 32;
        paddingVertical: 16;
        fontSize: 18;
        minHeight: 52;
        borderRadius: 16;
        background: "transparent";
        color: "#ec4899";
        border: "2px solid #ec4899";
        shadow: "none";
    } | {
        padding: "20px 40px";
        fontSize: 20;
        minHeight: "60px";
        borderRadius: 16;
        background: "transparent";
        color: "#ec4899";
        border: "2px solid #ec4899";
        shadow: "none";
    } | {
        paddingHorizontal: 40;
        paddingVertical: 20;
        fontSize: 20;
        minHeight: 60;
        borderRadius: 16;
        background: "transparent";
        color: "#ec4899";
        border: "2px solid #ec4899";
        shadow: "none";
    };
    readonly createInputStyles: (variant: keyof typeof INPUT_SYSTEM.variants, size: keyof typeof INPUT_SYSTEM.sizes, platform?: "web" | "mobile") => {
        padding: "8px 12px";
        fontSize: 14;
        borderRadius: 6;
        background: "rgba(255, 255, 255, 0.1)";
        border: "1px solid rgba(255, 255, 255, 0.2)";
        color: "#ffffff";
        focus: {
            readonly background: "rgba(255, 255, 255, 0.15)";
            readonly border: "2px solid #f472b6";
            readonly shadow: "0 0 0 3px #fbcfe840";
        };
    } | {
        paddingHorizontal: 12;
        paddingVertical: 8;
        fontSize: 14;
        borderRadius: 8;
        background: "rgba(255, 255, 255, 0.1)";
        border: "1px solid rgba(255, 255, 255, 0.2)";
        color: "#ffffff";
        focus: {
            readonly background: "rgba(255, 255, 255, 0.15)";
            readonly border: "2px solid #f472b6";
            readonly shadow: "0 0 0 3px #fbcfe840";
        };
    } | {
        padding: "12px 16px";
        fontSize: 16;
        borderRadius: 8;
        background: "rgba(255, 255, 255, 0.1)";
        border: "1px solid rgba(255, 255, 255, 0.2)";
        color: "#ffffff";
        focus: {
            readonly background: "rgba(255, 255, 255, 0.15)";
            readonly border: "2px solid #f472b6";
            readonly shadow: "0 0 0 3px #fbcfe840";
        };
    } | {
        paddingHorizontal: 16;
        paddingVertical: 12;
        fontSize: 16;
        borderRadius: 12;
        background: "rgba(255, 255, 255, 0.1)";
        border: "1px solid rgba(255, 255, 255, 0.2)";
        color: "#ffffff";
        focus: {
            readonly background: "rgba(255, 255, 255, 0.15)";
            readonly border: "2px solid #f472b6";
            readonly shadow: "0 0 0 3px #fbcfe840";
        };
    } | {
        padding: "16px 20px";
        fontSize: 18;
        borderRadius: 12;
        background: "rgba(255, 255, 255, 0.1)";
        border: "1px solid rgba(255, 255, 255, 0.2)";
        color: "#ffffff";
        focus: {
            readonly background: "rgba(255, 255, 255, 0.15)";
            readonly border: "2px solid #f472b6";
            readonly shadow: "0 0 0 3px #fbcfe840";
        };
    } | {
        paddingHorizontal: 20;
        paddingVertical: 16;
        fontSize: 18;
        borderRadius: 16;
        background: "rgba(255, 255, 255, 0.1)";
        border: "1px solid rgba(255, 255, 255, 0.2)";
        color: "#ffffff";
        focus: {
            readonly background: "rgba(255, 255, 255, 0.15)";
            readonly border: "2px solid #f472b6";
            readonly shadow: "0 0 0 3px #fbcfe840";
        };
    } | {
        padding: "8px 12px";
        fontSize: 14;
        borderRadius: 6;
        background: "rgba(255, 255, 255, 0.1)";
        border: "1px solid rgba(255, 255, 255, 0.2)";
        color: "#ffffff";
        focus: {
            readonly background: "rgba(255, 255, 255, 0.15)";
            readonly border: "2px solid #ec4899";
        };
    } | {
        paddingHorizontal: 12;
        paddingVertical: 8;
        fontSize: 14;
        borderRadius: 8;
        background: "rgba(255, 255, 255, 0.1)";
        border: "1px solid rgba(255, 255, 255, 0.2)";
        color: "#ffffff";
        focus: {
            readonly background: "rgba(255, 255, 255, 0.15)";
            readonly border: "2px solid #ec4899";
        };
    } | {
        padding: "12px 16px";
        fontSize: 16;
        borderRadius: 8;
        background: "rgba(255, 255, 255, 0.1)";
        border: "1px solid rgba(255, 255, 255, 0.2)";
        color: "#ffffff";
        focus: {
            readonly background: "rgba(255, 255, 255, 0.15)";
            readonly border: "2px solid #ec4899";
        };
    } | {
        paddingHorizontal: 16;
        paddingVertical: 12;
        fontSize: 16;
        borderRadius: 12;
        background: "rgba(255, 255, 255, 0.1)";
        border: "1px solid rgba(255, 255, 255, 0.2)";
        color: "#ffffff";
        focus: {
            readonly background: "rgba(255, 255, 255, 0.15)";
            readonly border: "2px solid #ec4899";
        };
    } | {
        padding: "16px 20px";
        fontSize: 18;
        borderRadius: 12;
        background: "rgba(255, 255, 255, 0.1)";
        border: "1px solid rgba(255, 255, 255, 0.2)";
        color: "#ffffff";
        focus: {
            readonly background: "rgba(255, 255, 255, 0.15)";
            readonly border: "2px solid #ec4899";
        };
    } | {
        paddingHorizontal: 20;
        paddingVertical: 16;
        fontSize: 18;
        borderRadius: 16;
        background: "rgba(255, 255, 255, 0.1)";
        border: "1px solid rgba(255, 255, 255, 0.2)";
        color: "#ffffff";
        focus: {
            readonly background: "rgba(255, 255, 255, 0.15)";
            readonly border: "2px solid #ec4899";
        };
    } | {
        padding: "8px 12px";
        fontSize: 14;
        borderRadius: 6;
        background: "#fafafa";
        border: "1px solid #e5e5e5";
        color: "#262626";
        focus: {
            readonly background: "#ffffff";
            readonly border: "2px solid #ec4899";
            readonly shadow: "0 0 0 3px #fce7f3";
        };
    } | {
        paddingHorizontal: 12;
        paddingVertical: 8;
        fontSize: 14;
        borderRadius: 8;
        background: "#fafafa";
        border: "1px solid #e5e5e5";
        color: "#262626";
        focus: {
            readonly background: "#ffffff";
            readonly border: "2px solid #ec4899";
            readonly shadow: "0 0 0 3px #fce7f3";
        };
    } | {
        padding: "12px 16px";
        fontSize: 16;
        borderRadius: 8;
        background: "#fafafa";
        border: "1px solid #e5e5e5";
        color: "#262626";
        focus: {
            readonly background: "#ffffff";
            readonly border: "2px solid #ec4899";
            readonly shadow: "0 0 0 3px #fce7f3";
        };
    } | {
        paddingHorizontal: 16;
        paddingVertical: 12;
        fontSize: 16;
        borderRadius: 12;
        background: "#fafafa";
        border: "1px solid #e5e5e5";
        color: "#262626";
        focus: {
            readonly background: "#ffffff";
            readonly border: "2px solid #ec4899";
            readonly shadow: "0 0 0 3px #fce7f3";
        };
    } | {
        padding: "16px 20px";
        fontSize: 18;
        borderRadius: 12;
        background: "#fafafa";
        border: "1px solid #e5e5e5";
        color: "#262626";
        focus: {
            readonly background: "#ffffff";
            readonly border: "2px solid #ec4899";
            readonly shadow: "0 0 0 3px #fce7f3";
        };
    } | {
        paddingHorizontal: 20;
        paddingVertical: 16;
        fontSize: 18;
        borderRadius: 16;
        background: "#fafafa";
        border: "1px solid #e5e5e5";
        color: "#262626";
        focus: {
            readonly background: "#ffffff";
            readonly border: "2px solid #ec4899";
            readonly shadow: "0 0 0 3px #fce7f3";
        };
    } | {
        padding: "8px 12px";
        fontSize: 14;
        borderRadius: 6;
        background: "#fafafa";
        border: "1px solid #e5e5e5";
        color: "#262626";
        focus: {
            readonly background: "#ffffff";
            readonly border: "2px solid #ec4899";
        };
    } | {
        paddingHorizontal: 12;
        paddingVertical: 8;
        fontSize: 14;
        borderRadius: 8;
        background: "#fafafa";
        border: "1px solid #e5e5e5";
        color: "#262626";
        focus: {
            readonly background: "#ffffff";
            readonly border: "2px solid #ec4899";
        };
    } | {
        padding: "12px 16px";
        fontSize: 16;
        borderRadius: 8;
        background: "#fafafa";
        border: "1px solid #e5e5e5";
        color: "#262626";
        focus: {
            readonly background: "#ffffff";
            readonly border: "2px solid #ec4899";
        };
    } | {
        paddingHorizontal: 16;
        paddingVertical: 12;
        fontSize: 16;
        borderRadius: 12;
        background: "#fafafa";
        border: "1px solid #e5e5e5";
        color: "#262626";
        focus: {
            readonly background: "#ffffff";
            readonly border: "2px solid #ec4899";
        };
    } | {
        padding: "16px 20px";
        fontSize: 18;
        borderRadius: 12;
        background: "#fafafa";
        border: "1px solid #e5e5e5";
        color: "#262626";
        focus: {
            readonly background: "#ffffff";
            readonly border: "2px solid #ec4899";
        };
    } | {
        paddingHorizontal: 20;
        paddingVertical: 16;
        fontSize: 18;
        borderRadius: 16;
        background: "#fafafa";
        border: "1px solid #e5e5e5";
        color: "#262626";
        focus: {
            readonly background: "#ffffff";
            readonly border: "2px solid #ec4899";
        };
    } | {
        padding: "8px 12px";
        fontSize: 14;
        borderRadius: 6;
        background: "transparent";
        border: "2px solid #d4d4d4";
        color: "#262626";
        focus: {
            readonly border: "2px solid #ec4899";
            readonly shadow: "0 0 0 3px #fce7f3";
        };
    } | {
        paddingHorizontal: 12;
        paddingVertical: 8;
        fontSize: 14;
        borderRadius: 8;
        background: "transparent";
        border: "2px solid #d4d4d4";
        color: "#262626";
        focus: {
            readonly border: "2px solid #ec4899";
            readonly shadow: "0 0 0 3px #fce7f3";
        };
    } | {
        padding: "12px 16px";
        fontSize: 16;
        borderRadius: 8;
        background: "transparent";
        border: "2px solid #d4d4d4";
        color: "#262626";
        focus: {
            readonly border: "2px solid #ec4899";
            readonly shadow: "0 0 0 3px #fce7f3";
        };
    } | {
        paddingHorizontal: 16;
        paddingVertical: 12;
        fontSize: 16;
        borderRadius: 12;
        background: "transparent";
        border: "2px solid #d4d4d4";
        color: "#262626";
        focus: {
            readonly border: "2px solid #ec4899";
            readonly shadow: "0 0 0 3px #fce7f3";
        };
    } | {
        padding: "16px 20px";
        fontSize: 18;
        borderRadius: 12;
        background: "transparent";
        border: "2px solid #d4d4d4";
        color: "#262626";
        focus: {
            readonly border: "2px solid #ec4899";
            readonly shadow: "0 0 0 3px #fce7f3";
        };
    } | {
        paddingHorizontal: 20;
        paddingVertical: 16;
        fontSize: 18;
        borderRadius: 16;
        background: "transparent";
        border: "2px solid #d4d4d4";
        color: "#262626";
        focus: {
            readonly border: "2px solid #ec4899";
            readonly shadow: "0 0 0 3px #fce7f3";
        };
    } | {
        padding: "8px 12px";
        fontSize: 14;
        borderRadius: 6;
        background: "transparent";
        border: "2px solid #d4d4d4";
        color: "#262626";
        focus: {
            readonly border: "2px solid #ec4899";
        };
    } | {
        paddingHorizontal: 12;
        paddingVertical: 8;
        fontSize: 14;
        borderRadius: 8;
        background: "transparent";
        border: "2px solid #d4d4d4";
        color: "#262626";
        focus: {
            readonly border: "2px solid #ec4899";
        };
    } | {
        padding: "12px 16px";
        fontSize: 16;
        borderRadius: 8;
        background: "transparent";
        border: "2px solid #d4d4d4";
        color: "#262626";
        focus: {
            readonly border: "2px solid #ec4899";
        };
    } | {
        paddingHorizontal: 16;
        paddingVertical: 12;
        fontSize: 16;
        borderRadius: 12;
        background: "transparent";
        border: "2px solid #d4d4d4";
        color: "#262626";
        focus: {
            readonly border: "2px solid #ec4899";
        };
    } | {
        padding: "16px 20px";
        fontSize: 18;
        borderRadius: 12;
        background: "transparent";
        border: "2px solid #d4d4d4";
        color: "#262626";
        focus: {
            readonly border: "2px solid #ec4899";
        };
    } | {
        paddingHorizontal: 20;
        paddingVertical: 16;
        fontSize: 18;
        borderRadius: 16;
        background: "transparent";
        border: "2px solid #d4d4d4";
        color: "#262626";
        focus: {
            readonly border: "2px solid #ec4899";
        };
    };
    readonly shouldEnableButton: (formState: {
        isValid: boolean;
        isDirty: boolean;
        isLoading?: boolean;
    }) => boolean;
    readonly getThemeColor: (colorKey: keyof typeof COLOR_SYSTEM, platform?: "web" | "mobile") => "#ec4899" | "#f59e0b" | "#ef4444" | "#0ea5e9" | "#22c55e" | {
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
    } | {
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
    } | {
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
    } | {
        readonly primary: {
            readonly web: "#262626";
            readonly mobile: "#262626";
        };
        readonly secondary: {
            readonly web: "#525252";
            readonly mobile: "#525252";
        };
        readonly muted: {
            readonly web: "#737373";
            readonly mobile: "#737373";
        };
    } | {
        readonly primary: {
            readonly web: "#ffffff";
            readonly mobile: "#ffffff";
        };
        readonly secondary: {
            readonly web: "#fafafa";
            readonly mobile: "#fafafa";
        };
    };
};
//# sourceMappingURL=unified-design-system.d.ts.map