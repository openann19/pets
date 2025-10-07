/**
 * 💎 UNIFIED TYPING INDICATOR COMPONENT
 * Advanced typing indicator with smooth animations and user avatars
 * Features: Pulsing dots, user names, and glass morphism styling
 */
interface TypingUser {
    id: string;
    name: string;
    avatar?: string;
}
interface UnifiedTypingIndicatorProps {
    isVisible: boolean;
    users?: TypingUser[];
    userNames?: string[];
    variant?: 'default' | 'glass' | 'elevated' | 'gradient';
    showAvatars?: boolean;
    maxVisibleUsers?: number;
    className?: string;
}
export declare function UnifiedTypingIndicator({ isVisible, users, userNames, variant, showAvatars, maxVisibleUsers, className, }: UnifiedTypingIndicatorProps): import("react/jsx-runtime").JSX.Element | null;
interface CompactTypingIndicatorProps {
    isVisible: boolean;
    userCount?: number;
    className?: string;
}
export declare function CompactTypingIndicator({ isVisible, userCount, className, }: CompactTypingIndicatorProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=UnifiedTypingIndicator.d.ts.map