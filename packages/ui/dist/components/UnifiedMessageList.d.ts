/**
 * 💎 UNIFIED MESSAGE LIST COMPONENT
 * Advanced message list with smooth animations and premium interactions
 * Features: Staggered animations, auto-scroll, and glass morphism styling
 */
interface MessageData {
    id: string;
    content: string;
    sender: {
        id: string;
        name: string;
        avatar?: string;
    };
    timestamp: Date;
    messageType?: 'text' | 'image' | 'location' | 'system';
    attachments?: Array<{
        url: string;
        fileName?: string;
        type?: string;
    }>;
    reactions?: Array<{
        emoji: string;
        users: string[];
    }>;
    isRead?: boolean;
    isDelivered?: boolean;
}
interface TypingUser {
    id: string;
    name: string;
    avatar?: string;
}
interface UnifiedMessageListProps {
    messages: MessageData[];
    currentUserId: string;
    typingUsers?: TypingUser[];
    isLoading?: boolean;
    hasMoreMessages?: boolean;
    onLoadMore?: () => void;
    onReaction?: (messageId: string, emoji: string) => void;
    onImageClick?: (url: string) => void;
    variant?: 'default' | 'glass' | 'elevated' | 'gradient';
    enableAnimations?: boolean;
    enableReactions?: boolean;
    autoScroll?: boolean;
    className?: string;
}
export declare function UnifiedMessageList({ messages, currentUserId, typingUsers, isLoading, hasMoreMessages, onLoadMore, onReaction, onImageClick, variant, enableAnimations, enableReactions, autoScroll, className, }: UnifiedMessageListProps): import("react/jsx-runtime").JSX.Element;
interface EmptyMessageListProps {
    variant?: 'default' | 'glass' | 'elevated' | 'gradient';
    className?: string;
}
export declare function EmptyMessageList({ variant, className }: EmptyMessageListProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=UnifiedMessageList.d.ts.map