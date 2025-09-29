import React from 'react';
import { useTextField } from '@react-aria/textfield';
import { useFocusRing } from '@react-aria/focus';
import { mergeProps } from '@react-aria/utils';
import { AriaTextFieldProps } from '@react-types/textfield';

export interface InputProps extends AriaTextFieldProps {
  /**
   * Input type
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

  /**
   * Visual style variant
   */
  variant?: 'default' | 'outline' | 'filled';

  /**
   * Input size
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Left icon/addon
   */
  leftIcon?: React.ReactNode;

  /**
   * Right icon/addon
   */
  rightIcon?: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Error state
   */
  error?: boolean;

  /**
   * Success state
   */
  success?: boolean;
}

/**
 * A headless input component built with react-aria
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (props, forwardedRef) => {
    const {
      type = 'text',
      variant = 'default',
      size = 'medium',
      leftIcon,
      rightIcon,
      className = '',
      error = false,
      success = false,
      ...otherProps
    } = props;

    const ref = React.useRef<HTMLInputElement>(null);
    const { inputProps, labelProps, descriptionProps, errorMessageProps } = useTextField(otherProps, ref);
    const { focusProps, isFocused } = useFocusRing();

    // Merge the refs
    React.useImperativeHandle(forwardedRef, () => ref.current!);

    const baseClasses = 'w-full transition-colors duration-200';

    const variantClasses = {
      default: 'border-0 bg-transparent',
      outline: 'border border-gray-300 rounded-md bg-white',
      filled: 'border-0 bg-gray-50 rounded-md'
    };

    const sizeClasses = {
      small: 'px-3 py-2 text-sm',
      medium: 'px-4 py-3 text-base',
      large: 'px-5 py-4 text-lg'
    };

    const stateClasses = error
      ? 'border-red-500 focus:ring-red-500'
      : success
        ? 'border-green-500 focus:ring-green-500'
        : 'border-gray-300 focus:ring-blue-500';

    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          {...mergeProps(inputProps, focusProps)}
          ref={ref}
          type={type}
          className={`
            ${baseClasses}
            ${variantClasses[variant]}
            ${sizeClasses[size]}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${stateClasses}
            ${className}
          `}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
