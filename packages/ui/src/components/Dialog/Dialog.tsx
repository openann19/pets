import { useDialog } from '@react-aria/dialog';
import { FocusScope } from '@react-aria/focus';
import { useModal, useOverlay, usePreventScroll } from '@react-aria/overlays';
import { mergeProps } from '@react-aria/utils';
import React, { useEffect, useState } from 'react';
import { useAnimation } from '../../hooks/useAnimation';
import { useTheme } from '../../hooks/useTheme';

export interface DialogProps {
  /**
   * Dialog content
   */
  children: React.ReactNode;

  /**
   * Dialog title
   */
  title?: string;

  /**
   * Dialog description
   */
  description?: string;

  /**
   * Whether the dialog is open
   */
  isOpen: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Dialog size
   */
  size?: 'small' | 'medium' | 'large' | 'fullscreen';

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Whether to close on outside click
   */
  isDismissable?: boolean;

  /**
   * Whether to close on escape key
   */
  isKeyboardDismissDisabled?: boolean;

  /**
   * Visual variant of the dialog
   */
  variant?: 'standard' | 'blurred' | 'minimal' | 'branded';
  
  /**
   * Animation preset for dialog entry
   */
  animationPreset?: 'scale' | 'slide' | 'fade' | 'bounce' | 'none';
  
  /**
   * Position of dialog on screen
   */
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  
  /**
   * Whether to show backdrop blur effect
   */
  blurBackground?: boolean;
  
  /**
   * Whether to render with Neumorphic design style
   */
  neumorphic?: boolean;
  
  /**
   * Custom header component
   */
  headerComponent?: React.ReactNode;
  
  /**
   * Custom footer component
   */
  footerComponent?: React.ReactNode;
  
  /**
   * Whether to allow dragging the dialog (mobile friendly)
   */
  draggable?: boolean;
}

/**
 * A modern dialog/modal component built with react-aria
 * Enhanced with 2025 UI/UX best practices
 */
export const Dialog: React.FC<DialogProps> = ({
  children,
  title,
  description,
  isOpen,
  onClose,
  size = 'medium',
  className = '',
  isDismissable = true,
  isKeyboardDismissDisabled = false,
  variant = 'standard',
  animationPreset = 'scale',
  position = 'center',
  blurBackground = true,
  neumorphic = false,
  headerComponent,
  footerComponent,
  draggable = false
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const { isDarkMode } = useTheme();
  
  // Animation control
  const { styles, animate } = useAnimation();

  // Handle mounting animation
  useEffect(() => {
    if (isOpen !== null && isOpen !== undefined) {
      setMounted(true);
      animate(animationPreset === 'none' ? 'instant' : animationPreset);
    } else if (mounted !== null && mounted !== undefined) {
      const timer = setTimeout(() => {
        setMounted(false);
      }, 300); // Match animation exit duration
      return () => { clearTimeout(timer); };
    }
    return undefined;
  }, [isOpen, animationPreset, animate]);

  // Dialog accessibility setup
  const { dialogProps, titleProps } = useDialog(
    { role: 'dialog' },
    ref
  );

  const { overlayProps } = useOverlay(
    {
      isOpen,
      onClose,
      isDismissable,
      isKeyboardDismissDisabled
    },
    ref
  );

  usePreventScroll();
  useModal();

  // Handle drag interactions
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent): void => {
    if (!draggable) return;
    
    setDragging(true);
    const clientX = 'touches' in e ? e.touches[0]?.clientX || 0 : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY || 0 : e.clientY;
    
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top
      });
    }
  };

  const handleDragMove = (e: MouseEvent | TouchEvent): void => {
    if (!dragging || !ref.current) return;
    
    const clientX = 'touches' in e ? e.touches[0]?.clientX || 0 : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY || 0 : e.clientY;
    
    ref.current.style.left = `${clientX - dragOffset.x}px`;
    ref.current.style.top = `${clientY - dragOffset.y}px`;
  };

  const handleDragEnd = (): void => {
    setDragging(false);
  };

  useEffect(() => {
    if (draggable !== null && draggable !== undefined) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('touchmove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchend', handleDragEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchend', handleDragEnd);
      };
    }
    return undefined;
  }, [draggable, dragging]);
  
  // Size classes with responsive design
  const sizeClasses = {
    small: 'w-full max-w-md',
    medium: 'w-full max-w-xl',
    large: 'w-full max-w-3xl',
    fullscreen: 'w-[98vw] h-[90vh] max-w-none'
  };
  
  // Position classes
  const positionClasses = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-20',
    bottom: 'items-end justify-center pb-8',
    left: 'items-center justify-start pl-8',
    right: 'items-center justify-end pr-8'
  };
  
  // Variant style classes
  const variantClasses = {
    standard: isDarkMode 
      ? 'bg-gray-900 text-white border border-gray-700' 
      : 'bg-white text-gray-900',
    blurred: isDarkMode 
      ? 'bg-gray-900/80 backdrop-blur-xl text-white border border-gray-700/50' 
      : 'bg-white/90 backdrop-blur-xl text-gray-900',
    minimal: isDarkMode 
      ? 'bg-gray-900/50 backdrop-blur-lg text-white' 
      : 'bg-white/80 backdrop-blur-lg text-gray-900',
    branded: isDarkMode 
      ? 'bg-gradient-to-br from-blue-900 to-indigo-900 text-white' 
      : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900'
  };
  
  // Neumorphic effect classes
  const neumorphicClasses = neumorphic
    ? isDarkMode
      ? 'shadow-[inset_-8px_-8px_16px_rgba(30,30,30,0.6),inset_8px_8px_16px_rgba(10,10,10,0.4)]'
      : 'shadow-[inset_-8px_-8px_16px_rgba(255,255,255,0.7),inset_8px_8px_16px_rgba(174,174,192,0.2)]'
    : '';

  // Animation classes based on preset
  const animationClasses = {
    scale: styles.scaleTransition,
    slide: position === 'top' || position === 'bottom' 
      ? styles.slideVerticalTransition 
      : styles.slideHorizontalTransition,
    fade: styles.fadeTransition,
    bounce: styles.bounceTransition,
    none: ''
  };
  
  // Backdrop classes with blur effect
  const backdropClasses = blurBackground 
    ? 'backdrop-blur-sm'
    : '';

  // Don't render if not open and not mounted (for exit animations)
  if (!isOpen && !mounted) return null;

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex p-4 transition-opacity duration-300
        ${isOpen ? 'opacity-100' : 'opacity-0'}
        ${backdropClasses}
        ${positionClasses[position]}
        ${isDarkMode ? 'bg-black/60' : 'bg-black/40'}
      `}
      aria-hidden={!isOpen}
    >
      <FocusScope contain restoreFocus autoFocus>
        <div
          {...mergeProps(overlayProps, dialogProps)}
          ref={ref}
          className={`
            rounded-xl ${sizeClasses[size]} max-h-[90vh] overflow-auto
            ${variantClasses[variant]}
            ${neumorphicClasses}
            ${animationClasses[animationPreset]}
            ${isOpen ? 'opacity-100' : 'opacity-0'}
            ${draggable ? 'cursor-move' : ''}
            shadow-2xl transition-all
            ${className}
          `}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          {/* Drag handle for mobile (visible only if draggable) */}
          {draggable !== undefined &&  (
            <div className="flex justify-center py-2 touch-none">
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
          )}
          
          {/* Custom header or default header */}
          {headerComponent || ((title || description) && (
            <div className={`
              px-6 py-5 
              ${isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}
            `}>
              {title !== undefined &&  (
                <h2 
                  {...titleProps} 
                  className={`
                    text-xl font-semibold 
                    ${isDarkMode ? 'text-white' : 'text-gray-900'}
                  `}
                >
                  {title}
                </h2>
              )}
              {description !== undefined &&  (
                <p className={`
                  mt-2 text-sm 
                  ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                `}>
                  {description}
                </p>
              )}
            </div>
          ))}

          {/* Content area */}
          <div className="p-6">
            {children}
          </div>
          
          {/* Footer if provided */}
          {footerComponent !== undefined &&  (
            <div className={`
              px-6 py-4 
              ${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}
            `}>
              {footerComponent}
            </div>
          )}
        </div>
      </FocusScope>
    </div>
  );
};
