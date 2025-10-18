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
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  size = 'medium',
  shape = 'circle',
  status = null,
  className = '',
  onClick
}) => {
  const baseClasses = 'relative inline-block overflow-hidden bg-gray-200';

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-24 h-24'
  };

  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-lg'
  };

  const statusClasses = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500'
  };

  const statusSizeClasses = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4',
    xlarge: 'w-5 h-5'
  };

  const cursorClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${shapeClasses[shape]}
        ${cursorClasses}
        ${className}
      `}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover ${shapeClasses[shape]}`}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center text-gray-600 font-medium ${shapeClasses[shape]}`}>
          {alt.slice(0, 2).toUpperCase()}
        </div>
      )}

      {status !== undefined && status !== null && (
        <div
          className={`
            absolute bottom-0 right-0 ${statusClasses[status]} ${statusSizeClasses[size]}
            border-2 border-white rounded-full
          `}
        />
      )}
    </div>
  );
};
