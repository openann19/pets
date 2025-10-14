import { useFocusRing } from '@react-aria/focus';
import { mergeProps } from '@react-aria/utils';
import React, { useEffect, useRef, useState } from 'react';
import { useAnimation } from '../../hooks/useAnimation';
import { useTheme } from '../../hooks/useTheme';
import { debounce } from '../../utils/debounce';

export interface TextareaProps {
  /**
   * Current value of the textarea
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
  variant?: 'default' | 'outline' | 'filled' | 'minimal' | 'floating' | 'neumorphic';

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
  
  /**
   * Label text
   */
  label?: string;
  
  /**
   * Helper text
   */
  helperText?: string;
  
  /**
   * Error message text
   */
  errorText?: string;
  
  /**
   * Auto-grow height to match content
   */
  autoGrow?: boolean;
  
  /**
   * Maximum height for auto-grow (in pixels)
   */
  maxHeight?: number;
  
  /**
   * Animation on focus
   */
  animateOnFocus?: boolean;
  
  /**
   * Whether to show word count instead of character count
   */
  showWordCount?: boolean;
  
  /**
   * Automatically focus on render
   */
  autoFocus?: boolean;
  
  /**
   * Whether to display in a circular shape (for creative interfaces)
   */
  circular?: boolean;
  
  /**
   * Icon to display inside the textarea
   */
  icon?: React.ReactNode;
  
  /**
   * Icon position
   */
  iconPosition?: 'left' | 'right';
  
  /**
   * Whether to apply backdrop blur effect
   */
  blurEffect?: boolean;

  /**
   * Whether the field is required
   */
  required?: boolean;
}

/**
 * A modern textarea component built with react-aria
 * Enhanced with 2025 UI/UX best practices
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
      label,
      helperText,
      errorText,
      autoGrow = false,
      maxHeight,
      animateOnFocus = true,
      showWordCount = false,
      autoFocus = false,
      circular = false,
      icon,
      iconPosition = 'left',
      blurEffect = false,
      ...otherProps
    } = props;

    // Access theme context for dark mode
    const { isDarkMode } = useTheme();
    // Access animation utils
    const { animate } = useAnimation();
    // Check if user prefers reduced motion
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Track focus state for animations
    const [isFocused, setIsFocused] = useState(false);
    const { focusProps, isFocusVisible } = useFocusRing({ within: true });
    
    // Track textarea height for auto-grow
    const [textareaHeight, setTextareaHeight] = useState<string>('auto');
    const ref = React.useRef<HTMLTextAreaElement>(null);
    
    // Word count calculation
    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

    // Merge the refs
    React.useImperativeHandle(forwardedRef, () => ref.current!);

    // Create debounced resize handler for auto-grow functionality
    const debouncedResize = useRef(
      debounce(() => {
        if (!autoGrow || !ref.current) return;
        
        // Reset height to auto to get the correct scrollHeight
        ref.current.style.height = 'auto';
        
        // Calculate new height
        let newHeight = ref.current.scrollHeight;
        
        // Apply max height constraint if provided
        if (maxHeight && newHeight > maxHeight) {
          newHeight = maxHeight;
        }
        
        setTextareaHeight(`${newHeight}px`);
      }, 30)
    ).current;
    
    // Handle auto-grow functionality with debouncing for performance
    useEffect(() => {
      if (autoGrow && ref.current) {
        debouncedResize();
      }
      
      return () => {
        debouncedResize.cancel();
      };
    }, [value, autoGrow, maxHeight, debouncedResize]);
    
    // Apply focus animation with reduced motion preference check
    useEffect(() => {
      if (animateOnFocus && isFocused && !prefersReducedMotion) {
        animate('scale');
      }
    }, [isFocused, animateOnFocus, animate, prefersReducedMotion]);

    // Define types for event handlers in otherProps
    interface TextareaHandlers {
      onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
      onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    }
    
    // Handle focus events
    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>): void => {
      setIsFocused(true);
      if ('onFocus' in otherProps && typeof otherProps.onFocus === 'function') {
        (otherProps as TextareaHandlers).onFocus?.(e);
      }
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>): void => {
      setIsFocused(false);
      if ('onBlur' in otherProps && typeof otherProps.onBlur === 'function') {
        (otherProps as TextareaHandlers).onBlur?.(e);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
      onChange?.(e.target.value);
    };

    // Base classes for consistent styling
    const baseClasses = 'w-full transition-all duration-300 focus:outline-none';

    // Modern variant styling with dark mode support
    const variantClasses = {
      default: isDarkMode 
        ? 'border-0 bg-transparent text-gray-200' 
        : 'border-0 bg-transparent text-gray-700',
      outline: isDarkMode 
        ? 'border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:border-blue-500' 
        : 'border border-gray-300 rounded-lg bg-white text-gray-700 focus:border-blue-500',
      filled: isDarkMode 
        ? 'border-0 bg-gray-800 rounded-lg text-gray-200' 
        : 'border-0 bg-gray-50 rounded-lg text-gray-700',
      minimal: isDarkMode 
        ? 'border-b border-gray-700 bg-transparent rounded-none text-gray-200 focus:border-blue-500' 
        : 'border-b border-gray-300 bg-transparent rounded-none text-gray-700 focus:border-blue-500',
      floating: isDarkMode 
        ? 'border border-gray-700 rounded-lg bg-gray-800/70 backdrop-blur-sm text-gray-200' 
        : 'border border-gray-200 rounded-lg bg-white/70 backdrop-blur-sm text-gray-700',
      neumorphic: isDarkMode 
        ? 'border-0 bg-gray-800 rounded-xl shadow-[inset_-2px_-2px_5px_rgba(60,60,70,0.5),inset_2px_2px_5px_rgba(0,0,0,0.7)] text-gray-200 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.5),inset_-2px_-2px_5px_rgba(60,60,70,0.5),inset_2px_2px_5px_rgba(0,0,0,0.7)]' 
        : 'border-0 bg-gray-50 rounded-xl shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.8),inset_2px_2px_5px_rgba(170,170,190,0.4)] text-gray-700 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.8),inset_2px_2px_5px_rgba(170,170,190,0.4)]'
    };

    // Size classes with better spacing
    const sizeClasses = {
      small: 'px-3 py-2 text-sm',
      medium: 'px-4 py-3 text-base',
      large: 'px-5 py-4 text-lg'
    };

    // Status indicator styling with improved accessibility and keyboard focus styles
    const stateClasses = `
      ${error
        ? isDarkMode 
          ? 'border-red-500 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:border-red-500' 
          : 'border-red-500 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:border-red-500'
        : success
          ? isDarkMode 
            ? 'border-green-500 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:border-green-500' 
            : 'border-green-500 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:border-green-500'
          : isDarkMode 
            ? 'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500' 
            : 'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500'
      }
      ${isFocusVisible ? 'outline-none ring-2 ring-offset-2' : ''}
    `;

    // Resize behavior classes
    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize'
    };
    
    // Circular shape styling
    const circularClasses = circular 
      ? 'rounded-full aspect-square p-6 text-center flex items-center justify-center' 
      : '';
    
    // Blur effect styling
    const blurClasses = blurEffect 
      ? isDarkMode 
        ? 'bg-opacity-80 backdrop-blur-sm' 
        : 'bg-opacity-70 backdrop-blur-sm' 
      : '';
    
    // Animation classes based on focus state - respecting reduced motion preferences
    const animationClasses = animateOnFocus && !prefersReducedMotion
      ? isFocused 
        ? 'transform scale-[1.01] shadow-lg transition-transform' 
        : 'transform scale-100 transition-transform' 
      : '';
      
    // Class for focus ring that doesn't rely solely on color
    const focusRingClass = isFocusVisible 
      ? isDarkMode 
        ? 'outline-none ring-2 ring-blue-500 ring-offset-1 ring-offset-gray-800' 
        : 'outline-none ring-2 ring-blue-500 ring-offset-1 ring-offset-white'
      : '';

    return (
      <div className="relative group w-full">
        {/* Label rendering with floating animation */}
        {label !== undefined &&  (
          <label 
            htmlFor={'id' in otherProps ? String(otherProps.id) : 'textarea'} 
            className={`
              block mb-2 text-sm font-medium transition-all duration-200
              ${isFocused ? 'text-blue-600' : ''}
              ${isDarkMode 
                ? error 
                  ? 'text-red-400' 
                  : success 
                    ? 'text-green-400' 
                    : 'text-gray-300'
                : error 
                  ? 'text-red-500' 
                  : success 
                    ? 'text-green-600' 
                    : 'text-gray-700'
              }
            `}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {/* Icon rendering */}
          {icon !== undefined &&  (
            <div 
              className={`
                absolute ${iconPosition === 'left' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2
                ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
                ${isFocused ? 'text-blue-500' : ''}
                ${error ? 'text-red-500' : ''}
                ${success ? 'text-green-500' : ''}
                transition-colors duration-200
              `}
            >
              {icon}
            </div>
          )}
          
          <textarea
            {...mergeProps(focusProps, otherProps)}
            ref={ref}
            id={'id' in otherProps ? String(otherProps.id) : 'textarea'}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            disabled={disabled}
            readOnly={readOnly}
            autoFocus={autoFocus}
            style={autoGrow ? { height: textareaHeight } : undefined}
            className={`
              ${baseClasses}
              ${variantClasses[variant]}
              ${sizeClasses[size]}
              ${stateClasses}
              ${resizeClasses[resize]}
              ${circularClasses}
              ${blurClasses}
              ${animationClasses}
              ${focusRingClass}
              ${icon !== undefined &&  iconPosition === 'left' ? 'pl-10' : ''}
              ${icon !== undefined &&  iconPosition === 'right' ? 'pr-10' : ''}
              ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
              ${className}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-disabled={disabled ? 'true' : undefined}
            aria-readonly={readOnly ? 'true' : undefined}
            aria-required={props.required !== undefined && props.required !== null ? 'true' : undefined}
            aria-describedby={
              [error && errorText ? 'textarea-error' : '', 
               helperText ? 'textarea-helper' : '',
               maxLength ? 'textarea-counter' : '']
                .filter(Boolean)
                .join(' ') || undefined
            }
          />
          
          {/* Character/Word counter */}
          {(showCharCount || showWordCount) ? <div 
              id="textarea-counter"
              aria-live="polite"
              aria-atomic="true"
              className={`
                absolute bottom-2 right-3 text-xs transition-opacity duration-200
                ${isFocused ? 'opacity-100' : 'opacity-60'}
                ${error 
                  ? 'text-red-500' 
                  : success 
                    ? 'text-green-500' 
                    : isDarkMode 
                      ? 'text-gray-400' 
                      : 'text-gray-500'
                }
              `}
            >
              {showCharCount !== undefined &&  maxLength ? <span className="sr-only">Character count: </span> : null
              }
              {showCharCount !== undefined &&  maxLength ? `${value.length}/${maxLength}` : null}
              
              {showWordCount !== undefined &&  
                <span className="sr-only">Word count: </span>
              }
              {showWordCount !== undefined &&  `${wordCount} words`}
            </div> : null}
        </div>
        
        {/* Helper text or error message */}
        {(helperText || (error && errorText)) ? <div 
            id={error ? 'textarea-error' : 'textarea-helper'}
            className={`
              mt-2 text-sm
              ${error 
                ? isDarkMode 
                  ? 'text-red-400' 
                  : 'text-red-500'
                : isDarkMode 
                  ? 'text-gray-400' 
                  : 'text-gray-500'
              }
            `}
            role={error ? 'alert' : 'status'}
            aria-live={error ? 'assertive' : 'polite'}
          >
            {error ? (
              <>
                <span className="sr-only">Error: </span>
                {errorText}
              </>
            ) : helperText}
          </div> : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
