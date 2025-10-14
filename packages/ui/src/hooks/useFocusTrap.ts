import { useEffect, useRef } from 'react';

interface FocusTrapOptions {
  active?: boolean;
  initialFocus?: boolean;
  returnFocusOnDeactivate?: boolean;
  escapeDeactivates?: boolean;
  clickOutsideDeactivates?: boolean;
  onDeactivate?: () => void;
}

/**
 * A hook that traps focus within a container for accessibility
 * Useful for modals, dialogs, and other components that should contain focus
 * 
 * @param options Options for controlling focus trap behavior
 * @returns Object with ref to attach to the container and methods to control the trap
 */
export function useFocusTrap(options: FocusTrapOptions = {}) {
  const {
    active = true,
    initialFocus = true,
    returnFocusOnDeactivate = true,
    escapeDeactivates = true,
    clickOutsideDeactivates = false,
    onDeactivate
  } = options;
  
  const containerRef = useRef<HTMLElement | null>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const firstFocusableElement = useRef<HTMLElement | null>(null);
  const lastFocusableElement = useRef<HTMLElement | null>(null);
  
  /**
   * Find all focusable elements within the container
   */
  const getFocusableElements = (): HTMLElement[] => {
    if (!containerRef.current) return [];
    
    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    return Array.from(focusableElements);
  };
  
  /**
   * Set initial focus when the trap becomes active
   */
  const setInitialFocus = (): void => {
    if (!initialFocus || !containerRef.current) return;
    
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      // Find an element with [data-autofocus] or default to first focusable
      const autoFocusElement = containerRef.current.querySelector<HTMLElement>('[data-autofocus]');
      
      if (autoFocusElement) {
        autoFocusElement.focus();
      } else {
        focusableElements[0]!.focus();
      }
    }
  };
  
  /**
   * Trap focus within the container
   */
  const handleTabKey = (e: KeyboardEvent): void => {
    if (!active || !containerRef.current) return;
    
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;
    
    firstFocusableElement.current = focusableElements[0]!;
    lastFocusableElement.current = focusableElements[focusableElements.length - 1]!;
    
    // Handle Tab and Shift+Tab
    const isTabPressed = e.key === 'Tab';
    if (!isTabPressed) return;
    
    // If Shift+Tab and focus is on first element, move to last element
    if (e.shiftKey) {
      if (document.activeElement === firstFocusableElement.current) {
        e.preventDefault();
        lastFocusableElement.current?.focus();
      }
    } 
    // If Tab and focus is on last element, move to first element
    else {
      if (document.activeElement === lastFocusableElement.current) {
        e.preventDefault();
        firstFocusableElement.current?.focus();
      }
    }
  };
  
  /**
   * Handle key presses within the focus trap
   */
  const handleKeyDown = (e: KeyboardEvent): void => {
    if (!active || !containerRef.current) return;
    
    // Handle Tab key for focus trapping
    if (e.key === 'Tab') {
      handleTabKey(e);
    }
    
    // Allow Escape to deactivate if enabled
    if (e.key === 'Escape' && escapeDeactivates) {
      e.preventDefault();
      onDeactivate?.();
    }
  };
  
  /**
   * Handle clicks outside the container
   */
  const handleClickOutside = (e: MouseEvent): void => {
    if (!active || !containerRef.current || !clickOutsideDeactivates) return;
    
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      onDeactivate?.();
    }
  };
  
  /**
   * Store previously focused element and set up focus trap
   */
  useEffect(() => {
    if (!active) return;
    
    // Store the previously focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement;
    
    // Set initial focus
    setInitialFocus();
    
    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    if (clickOutsideDeactivates) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      // Remove event listeners
      document.removeEventListener('keydown', handleKeyDown);
      if (clickOutsideDeactivates) {
        document.removeEventListener('mousedown', handleClickOutside);
      }
      
      // Return focus to previously focused element when deactivating
      if (returnFocusOnDeactivate && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [active, clickOutsideDeactivates]);
  
  /**
   * Update focus trap when container changes
   */
  const updateFocusTrap = (): void => {
    if (active) {
      const focusableElements = getFocusableElements();
      firstFocusableElement.current = focusableElements[0] || null;
      lastFocusableElement.current = focusableElements[focusableElements.length - 1] || null;
    }
  };
  
  return {
    containerRef,
    updateFocusTrap,
    setInitialFocus,
    deactivate: () => onDeactivate?.()
  };
}

export default useFocusTrap;
