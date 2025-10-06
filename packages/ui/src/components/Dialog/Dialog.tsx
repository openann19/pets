import { useDialog } from '@react-aria/dialog';
import { FocusScope } from '@react-aria/focus';
import { useModal, useOverlay, usePreventScroll } from '@react-aria/overlays';
import { mergeProps } from '@react-aria/utils';
import React from 'react';

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
}

/**
 * A dialog/modal component built with react-aria
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
  isKeyboardDismissDisabled = false
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const { dialogProps, titleProps } = useDialog({
    role: 'dialog'
  }, ref);

  const { overlayProps } = useOverlay({
    isOpen,
    onClose,
    isDismissable,
    isKeyboardDismissDisabled
  }, ref);

  usePreventScroll();
  useModal();

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    fullscreen: 'w-full h-full max-w-none'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <FocusScope contain restoreFocus autoFocus>
        <div
          {...mergeProps(overlayProps, dialogProps)}
          ref={ref}
          className={`
            bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-auto
            ${className}
          `}
        >
          {((title != null && title !== '') ?? (description != null && description !== '')) && (
            <div className="px-6 py-4 border-b border-gray-200">
              {title != null && title !== '' && (
                <h2 {...titleProps} className="text-lg font-semibold text-gray-900">
                  {title}
                </h2>
              )}
              {description != null && description !== '' && (
                <p className="mt-1 text-sm text-gray-600">
                  {description}
                </p>
              )}
            </div>
          )}

          <div className="p-6">
            {children}
          </div>
        </div>
      </FocusScope>
    </div>
  );
};
