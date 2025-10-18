import { useButton } from '@react-aria/button';
import { useFocusRing } from '@react-aria/focus';
import { useHover } from '@react-aria/interactions';
import { mergeProps } from '@react-aria/utils';
import type { AriaButtonProps } from '@react-types/button';
import React from 'react';

export interface ButtonProps extends AriaButtonProps {
  /**
   * The visual style of the button
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * The size of the button
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Accessible label for screen readers
   */
  'aria-label'?: string;

  /**
   * Whether the button is disabled for accessibility
   */
  'aria-disabled'?: boolean;
}

/**
 * A headless button component built with react-aria
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, forwardedRef) => {
    const {
      variant = 'primary',
      size = 'medium',
      className = '',
      children,
      ...otherProps
    } = props;

    const ref = React.useRef<HTMLButtonElement>(null);
    const { buttonProps, isPressed } = useButton(otherProps, ref);
    const { focusProps, isFocused } = useFocusRing();
    const { hoverProps, isHovered } = useHover({});

    // Merge the refs
    React.useImperativeHandle(forwardedRef, () => ref.current!);

    return (
      <button
        {...mergeProps(buttonProps, focusProps, hoverProps)}
        ref={ref}
        aria-label={props['aria-label']}
        aria-disabled={props['aria-disabled']}
        tabIndex={0}
        data-pressed={isPressed || undefined}
        data-focused={isFocused || undefined}
        data-hovered={isHovered || undefined}
        data-variant={variant}
        data-size={size}
        className={className}
        style={{ outline: isFocused ? '2px solid var(--pm-primary)' : undefined }}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
