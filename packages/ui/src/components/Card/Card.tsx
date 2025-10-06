import { useFocusRing } from '@react-aria/focus';
import { useHover } from '@react-aria/interactions';
import { mergeProps } from '@react-aria/utils';
import React from 'react';

export interface CardProps {
  /**
   * Card content
   */
  children: React.ReactNode;
  
  /**
   * Whether the card is interactive/clickable
   */
  interactive?: boolean;
  
  /**
   * Additional CSS class name
   */
  className?: string;
  
  /**
   * Click handler for interactive cards
   */
  onClick?: () => void;
}

/**
 * A headless card component that can be styled in the consuming application
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (props, forwardedRef) => {
    const { 
      children, 
      interactive = false, 
      className = '',
      onClick,
      ...otherProps 
    } = props;
    
    const ref = React.useRef<HTMLDivElement>(null);
    const { focusProps, isFocused } = useFocusRing();
    const { hoverProps, isHovered } = useHover({});

    // Merge the refs
    React.useImperativeHandle(forwardedRef, () => ref.current!);

    return (
      <div
        {...(interactive ? mergeProps(focusProps, hoverProps, otherProps) : otherProps)}
        ref={ref}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? 'button' : undefined}
        data-focused={interactive && isFocused ? true : undefined}
        data-hovered={interactive && isHovered ? true : undefined}
        data-interactive={interactive || undefined}
        className={className}
        onClick={interactive ? onClick : undefined}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
