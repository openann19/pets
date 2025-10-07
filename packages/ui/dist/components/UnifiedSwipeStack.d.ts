/**
 * 💎 UNIFIED SWIPE STACK COMPONENT
 * Advanced swipe stack with fluid animations and premium interactions
 * Features: Smooth stack transitions, 3D effects, and haptic feedback
 */
interface SwipeCardData {
    id: string;
    name: string;
    age?: number;
    breed?: string;
    images: string[];
    description?: string;
    distance?: number;
    [key: string]: any;
}
interface UnifiedSwipeStackProps {
    data: SwipeCardData[];
    onSwipeLeft?: (data: SwipeCardData) => void;
    onSwipeRight?: (data: SwipeCardData) => void;
    onSwipeUp?: (data: SwipeCardData) => void;
    onSwipeDown?: (data: SwipeCardData) => void;
    onCardClick?: (data: SwipeCardData) => void;
    onLoadMore?: () => void;
    variant?: 'default' | 'glass' | 'elevated' | 'gradient' | 'neon' | 'holographic';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    enable3DTilt?: boolean;
    enableMagnetic?: boolean;
    enableHaptic?: boolean;
    enableSound?: boolean;
    enableGlow?: boolean;
    maxVisibleCards?: number;
    loadMoreThreshold?: number;
    isLoading?: boolean;
    swipeThreshold?: number;
    velocityThreshold?: number;
    'aria-label'?: string;
    className?: string;
}
export declare function UnifiedSwipeStack({ data, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onCardClick, onLoadMore, variant, size, enable3DTilt, enableMagnetic, enableHaptic, enableSound, enableGlow, maxVisibleCards, loadMoreThreshold, isLoading, swipeThreshold, velocityThreshold, 'aria-label': ariaLabel, className, }: UnifiedSwipeStackProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=UnifiedSwipeStack.d.ts.map