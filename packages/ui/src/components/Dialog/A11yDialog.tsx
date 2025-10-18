import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { createSafeId } from '../../utils/accessibilityUtils';

export interface A11yDialogProps {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean;

  /**
   * Callback when the dialog should close
   */
  onClose: () => void;

  /**
   * The dialog's title (for accessibility)
   */
  title: string;

  /**
   * Optional description (for accessibility)
   */
  description?: string;

  /**
   * Content of the dialog
   */
  children: React.ReactNode;

  /**
   * Width of the dialog
   */
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /**
   * Whether to close when clicking outside the dialog
   */
  closeOnClickOutside?: boolean;

  /**
   * Whether to close when pressing Escape
   */
  closeOnEsc?: boolean;

  /**
   * Additional CSS class for the dialog
   */
  className?: string;

  /**
   * Label for the close button (for accessibility)
   */
  closeButtonLabel?: string;

  /**
   * Whether to show the close button
   */
  showCloseButton?: boolean;

  /**
   * Override for the dialog's ID
   */
  id?: string;

  /**
   * Additional keyboard shortcuts
   * Format: { key: handler }
   */
  keyboardShortcuts?: Record<string, () => void>;
}

export const A11yDialog: React.FC<A11yDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  width = 'md',
  closeOnClickOutside = true,
  closeOnEsc = true,
  className = '',
  closeButtonLabel = 'Close dialog',
  showCloseButton = true,
  id: propId,
  keyboardShortcuts = {},
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Generate unique IDs
  const dialogId = useRef(propId || createSafeId('dialog'));
  const titleId = useRef(createSafeId('dialog-title'));
  const descriptionId = useRef(description ? createSafeId('dialog-desc') : undefined);

  // Set up focus trap
  const { containerRef } = useFocusTrap({
    active: isOpen,
    returnFocusOnDeactivate: true,
    escapeDeactivates: closeOnEsc,
    clickOutsideDeactivates: closeOnClickOutside,
    onDeactivate: onClose
  });

  // Keyboard shortcuts
  useKeyboardShortcut('Escape', () => {
    if (closeOnEsc && isOpen) {
      onClose();
    }
  }, { enabled: isOpen });

  // Add custom keyboard shortcuts without calling hooks in a loop
  useEffect(() => {
    if (!isOpen) return;

    const handlers: Array<{ key: string; fn: (e: KeyboardEvent) => void }> = [];

    Object.entries(keyboardShortcuts).forEach(([key, handler]) => {
      const fn = (e: KeyboardEvent) => {
        if (e.key === key) {
          handler();
        }
      };
      handlers.push({ key, fn });
      document.addEventListener('keydown', fn);
    });

    return () => {
      handlers.forEach(({ fn }) => document.removeEventListener('keydown', fn));
    };
  }, [isOpen, keyboardShortcuts]);

  // Handle click outside
  const handleClickOverlay = (evt: React.MouseEvent<HTMLDivElement>): void => {
    if (!closeOnClickOutside) return;
    // Close only when clicking directly on the overlay, not children
    if (evt.currentTarget === overlayRef.current) {
      onClose();
    }
  };

  // Set container ref
  const setContainerRef = (node: HTMLDivElement | null): void => {
    dialogRef.current = node;
    containerRef.current = node;
  };

  // Handle body scroll locking
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      return () => { };
    }

    if (isOpen !== null && isOpen !== undefined) {
      // Save current scroll position
      const { scrollY } = window;

      // Prevent body scrolling
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.overflow = 'hidden';

      // Add ARIA attributes to indicate modal is open
      document.body.setAttribute('aria-hidden', 'true');

      return () => {
        // Restore body scrolling
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        document.body.style.overflow = '';

        // Restore scroll position
        window.scrollTo(0, scrollY);

        // Remove ARIA attributes
        document.body.removeAttribute('aria-hidden');
      };
    }
    return () => { };
  }, [isOpen, isMounted]);

  // Width classes
  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full'
  };

  // Only render if client-side
  if (!isMounted) return null;

  // Portal content
  const dialog = isOpen && (
    <div
      role="presentation"
      aria-hidden={!isOpen}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50 p-4"
      onClick={handleClickOverlay}
      ref={overlayRef}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId.current}
        aria-describedby={descriptionId.current}
        id={dialogId.current}
        ref={setContainerRef}
        className={`relative w-full rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 ${widthClasses[width]} ${className}`}
      >
        {/* Header */}
        <header className="mb-4">
          <h2 id={titleId.current} className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {description !== undefined && (
            <p id={descriptionId.current} className="mt-2 text-gray-600 dark:text-gray-300">
              {description}
            </p>
          )}
          {showCloseButton !== undefined && (
            <button
              type="button"
              onClick={onClose}
              aria-label={closeButtonLabel}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              data-autofocus
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </header>

        {/* Content */}
        <div className="dialog-content">
          {children}
        </div>
      </div>
    </div>
  );

  // Create portal
  return isMounted ? createPortal(dialog, document.body) : null;
};

export default A11yDialog;
