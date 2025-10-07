/**
 * Premium Animation System for PawfectMatch
 * Smooth, delightful micro-interactions and transitions
 */
export declare const animations: {
    easing: {
        linear: string;
        ease: string;
        easeIn: string;
        easeOut: string;
        easeInOut: string;
        smooth: string;
        bounce: string;
        elastic: string;
        sharp: string;
        ios: string;
        standard: string;
        decelerated: string;
        accelerated: string;
    };
    duration: {
        instant: number;
        fast: number;
        normal: number;
        slow: number;
        slower: number;
        slowest: number;
    };
    spring: {
        gentle: {
            tension: number;
            friction: number;
            useNativeDriver: boolean;
        };
        wobbly: {
            tension: number;
            friction: number;
            useNativeDriver: boolean;
        };
        stiff: {
            tension: number;
            friction: number;
            useNativeDriver: boolean;
        };
        bouncy: {
            tension: number;
            friction: number;
            useNativeDriver: boolean;
        };
    };
    presets: {
        fadeIn: {
            from: {
                opacity: number;
            };
            to: {
                opacity: number;
            };
            duration: number;
            easing: string;
        };
        fadeOut: {
            from: {
                opacity: number;
            };
            to: {
                opacity: number;
            };
            duration: number;
            easing: string;
        };
        scaleIn: {
            from: {
                opacity: number;
                transform: string;
            };
            to: {
                opacity: number;
                transform: string;
            };
            duration: number;
            easing: string;
        };
        scaleOut: {
            from: {
                opacity: number;
                transform: string;
            };
            to: {
                opacity: number;
                transform: string;
            };
            duration: number;
            easing: string;
        };
        slideInUp: {
            from: {
                opacity: number;
                transform: string;
            };
            to: {
                opacity: number;
                transform: string;
            };
            duration: number;
            easing: string;
        };
        slideInDown: {
            from: {
                opacity: number;
                transform: string;
            };
            to: {
                opacity: number;
                transform: string;
            };
            duration: number;
            easing: string;
        };
        slideInLeft: {
            from: {
                opacity: number;
                transform: string;
            };
            to: {
                opacity: number;
                transform: string;
            };
            duration: number;
            easing: string;
        };
        slideInRight: {
            from: {
                opacity: number;
                transform: string;
            };
            to: {
                opacity: number;
                transform: string;
            };
            duration: number;
            easing: string;
        };
        buttonPress: {
            from: {
                transform: string;
            };
            to: {
                transform: string;
            };
            duration: number;
            easing: string;
        };
        cardHover: {
            from: {
                transform: string;
                boxShadow: string;
            };
            to: {
                transform: string;
                boxShadow: string;
            };
            duration: number;
            easing: string;
        };
        swipeCard: {
            duration: number;
            easing: string;
        };
        matchCelebration: {
            duration: number;
            easing: string;
        };
        typingDot: {
            duration: number;
            easing: string;
            iterationCount: string;
            direction: string;
        };
    };
    stagger: {
        children: number;
        fast: number;
        normal: number;
        slow: number;
    };
    gestures: {
        swipe: {
            threshold: number;
            velocity: number;
            directionalOffset: number;
        };
        panResponder: {
            threshold: number;
            gestureHandlerRootHOC: boolean;
        };
    };
    loading: {
        skeleton: {
            duration: number;
            easing: string;
            iterationCount: string;
        };
        spinner: {
            duration: number;
            easing: string;
            iterationCount: string;
        };
        pulse: {
            duration: number;
            easing: string;
            iterationCount: string;
            direction: string;
        };
    };
    notifications: {
        toast: {
            enter: {
                from: {
                    opacity: number;
                    transform: string;
                };
                to: {
                    opacity: number;
                    transform: string;
                };
                duration: number;
                easing: string;
            };
            exit: {
                from: {
                    opacity: number;
                    transform: string;
                };
                to: {
                    opacity: number;
                    transform: string;
                };
                duration: number;
                easing: string;
            };
        };
        badge: {
            bounce: {
                duration: number;
                easing: string;
            };
        };
    };
};
export declare const createTransition: (property: string | string[], duration?: number, easing?: string) => string;
export declare const createKeyframes: (name: string, frames: Record<string, Record<string, unknown>>) => string;
export declare const withDelay: (animation: Record<string, unknown>, delay: number) => {
    delay: number;
};
export declare const withStagger: (animation: Record<string, unknown>, index: number, staggerDelay?: number) => {
    delay: number;
};
export default animations;
//# sourceMappingURL=animations.d.ts.map