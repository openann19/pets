import { useFocusRing } from '@react-aria/focus';
import { mergeProps } from '@react-aria/utils';
import React from 'react';

export interface InputProps {
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
   * Input value
   */
  value?: string;

  /**
   * Change handler
   */
  onChange?: (value: string) => void;

  /**
   * Label text
   */
  label?: string;

  /**
   * Placeholder text
   */
  placeholder?: string;

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

  /**
   * Error message to display
   */
  errorMessage?: string;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Read-only state
   */
  readOnly?: boolean;
}

/**
 * A headless input component
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
      errorMessage,
      label,
      value = '',
      onChange,
      placeholder,
      disabled = false,
      readOnly = false,
      ...otherProps
    } = props;

    const ref = React.useRef<HTMLInputElement>(null);
    const { focusProps } = useFocusRing();
    const inputId = React.useId();

    // Merge the refs
    React.useImperativeHandle(forwardedRef, () => ref.current as HTMLInputElement);

    // Handle change events
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

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
      <div className="w-full">
        {Boolean(label) && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
        {leftIcon !== undefined && leftIcon !== null && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
          <input
            {...mergeProps(focusProps, otherProps)}
            ref={ref}
            // eslint-disable-next-line react/jsx-props-no-spreading
            id={inputId}
            type={type}
            value={value}
            onChange={React.useCallback(handleChange, [onChange])}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className={`
              ${baseClasses}
              ${variantClasses[variant]}
              ${sizeClasses[size]}
              ${leftIcon !== undefined && leftIcon !== null ? 'pl-10' : ''}
              ${rightIcon !== undefined && rightIcon !== null ? 'pr-10' : ''}
              ${stateClasses}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${className}
            `}
          />
          {rightIcon !== undefined && rightIcon !== null && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && Boolean(errorMessage) && (
          <div className="mt-1 text-sm text-red-600">
            {errorMessage}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
