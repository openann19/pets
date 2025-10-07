/**
 * 💎 UNIFIED MESSAGE BUBBLE COMPONENT
 * Advanced message bubble with animations, reactions, and premium styling
 * Features: Smooth animations, message reactions, and glass morphism effects
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
interface UnifiedMessageBubbleProps {
    message: MessageData;
    isOwnMessage: boolean;
    showAvatar?: boolean;
    showTimestamp?: boolean;
    enableReactions?: boolean;
    enableAnimations?: boolean;
    variant?: 'default' | 'glass' | 'elevated' | 'gradient';
    onReaction?: (messageId: string, emoji: string) => void;
    onImageClick?: (url: string) => void;
    className?: string;
}
export declare function UnifiedMessageBubble({ message, isOwnMessage, showAvatar, showTimestamp, enableReactions, enableAnimations, variant, onReaction, onImageClick, className, }: UnifiedMessageBubbleProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=UnifiedMessageBubble.d.ts.map