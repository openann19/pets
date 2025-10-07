import React from 'react';
export interface AvatarProps {
    /**
     * Avatar image source
     */
    src?: string;
    /**
     * Fallback text (initials or name)
     */
    alt?: string;
    /**
     * Avatar size
     */
    size?: 'small' | 'medium' | 'large' | 'xlarge';
    /**
     * Avatar shape
     */
    shape?: 'circle' | 'square';
    /**
     * Online status indicator
     */
    status?: 'online' | 'offline' | 'away' | null;
    /**
     * Additional CSS classes
     */
    className?: string;
    /**
     * Click handler
     */
    onClick?: () => void;
}
/**
 * An avatar component for displaying user or pet profile pictures
 */
export declare const Avatar: React.FC<AvatarProps>;
//# sourceMappingURL=Avatar.d.ts.map