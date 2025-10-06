import { useFocusRing } from '@react-aria/focus';
import { mergeProps } from '@react-aria/utils';
import React from 'react';

export interface TextareaProps {
  /**
   * Textarea value
   */
  value?: string;

  /**
   * Change handler
   */
  onChange?: (value: string) => void;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Visual style variant
   */
  variant?: 'default' | 'outline' | 'filled';

  /**
   * Textarea size
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Number of rows
   */
  rows?: number;

  /**
   * Resize behavior
   */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';

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
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Read-only state
   */
  readOnly?: boolean;

  /**
   * Maximum length
   */
  maxLength?: number;

  /**
   * Show character count
   */
  showCharCount?: boolean;
}

/**
 * A headless textarea component built with react-aria
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (props, forwardedRef) => {
    const {
      value = '',
      onChange,
      placeholder,
      variant = 'outline',
      size = 'medium',
      rows = 4,
      resize = 'vertical',
      className = '',
      error = false,
      success = false,
      disabled = false,
      readOnly = false,
      maxLength,
      showCharCount = false,
      ...otherProps
    } = props;

    const ref = React.useRef<HTMLTextAreaElement>(null);
    const { focusProps } = useFocusRing();

    // Merge the refs
    React.useImperativeHandle(forwardedRef, () => ref.current as HTMLTextAreaElement);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize'
    };

    return (
      <div className="relative">
        <textarea
          {...mergeProps(focusProps, otherProps)}
          // eslint-disable-next-line react/jsx-props-no-spreading
          ref={ref}
          value={value}
          onChange={React.useCallback(handleChange, [onChange])}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          className={`
            ${baseClasses}
            ${variantClasses[variant]}
            ${sizeClasses[size]}
            ${stateClasses}
            ${resizeClasses[resize]}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
        />
        {showCharCount && Boolean(maxLength) && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
