import { useEffect, useRef, useCallback } from 'react';

interface UseFocusTrapOptions {
  enabled?: boolean;
  initialFocus?: HTMLElement | null;
  returnFocus?: boolean;
  escapeDeactivates?: boolean;
}

export function useFocusTrap(options: UseFocusTrapOptions = {}) {
  const {
    enabled = true,
    initialFocus = null,
    returnFocus = true,
    escapeDeactivates = true
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const firstFocusableElement = useRef<HTMLElement | null>(null);
  const lastFocusableElement = useRef<HTMLElement | null>(null);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      'iframe',
      'object',
      'embed',
      'area[href]',
      'audio[controls]',
      'video[controls]',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])',
      '[role="menuitem"]:not([disabled])',
      '[role="option"]:not([disabled])',
      '[role="tab"]:not([disabled])',
      '[role="textbox"]:not([disabled])'
    ].join(', ');

    const elements = Array.from(
      containerRef.current.querySelectorAll(focusableSelectors)
    );

    // Filter out elements that are not visible or have negative tabindex
    return elements.filter(element => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width > 0 &&
        rect.height > 0 &&
        !element.hasAttribute('disabled') &&
        !element.getAttribute('aria-hidden') === 'true'
      );
    });
  }, []);

  // Set focus to the first focusable element
  const focusFirstElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const elementToFocus = initialFocus || focusableElements[0];
    (elementToFocus as HTMLElement)?.focus();
  }, [getFocusableElements, initialFocus]);

  // Set focus to the last focusable element
  const focusLastElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const lastElement = focusableElements[focusableElements.length - 1];
    (lastElement as HTMLElement)?.focus();
  }, [getFocusableElements]);

  // Handle Tab key navigation
  const handleTabKey = useCallback((event: KeyboardEvent) => {
    if (!containerRef.current) return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      // Shift + Tab: Move to previous element
      if (activeElement === firstElement) {
        event.preventDefault();
        (lastElement as HTMLElement)?.focus();
      }
    } else {
      // Tab: Move to next element
      if (activeElement === lastElement) {
        event.preventDefault();
        (firstElement as HTMLElement)?.focus();
      }
    }
  }, [getFocusableElements]);

  // Handle Escape key
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (escapeDeactivates && event.key === 'Escape') {
      event.preventDefault();
      // Dispatch custom event to notify parent component
      const escapeEvent = new CustomEvent('focusTrapEscape', {
        detail: { container: containerRef.current }
      });
      document.dispatchEvent(escapeEvent);
    }
  }, [escapeDeactivates]);

  // Handle keydown events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      handleTabKey(event);
    } else if (event.key === 'Escape') {
      handleEscapeKey(event);
    }
  }, [handleTabKey, handleEscapeKey]);

  // Activate focus trap
  const activate = useCallback(() => {
    if (!containerRef.current) return;

    // Store previously focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Set up focus trap
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      firstFocusableElement.current = focusableElements[0];
      lastFocusableElement.current = focusableElements[focusableElements.length - 1];
    }

    // Focus initial element
    focusFirstElement();

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
  }, [getFocusableElements, focusFirstElement, handleKeyDown]);

  // Deactivate focus trap
  const deactivate = useCallback(() => {
    // Remove event listeners
    document.removeEventListener('keydown', handleKeyDown);

    // Return focus to previously focused element
    if (returnFocus && previouslyFocusedElement.current) {
      (previouslyFocusedElement.current as HTMLElement).focus();
    }

    // Clear references
    previouslyFocusedElement.current = null;
    firstFocusableElement.current = null;
    lastFocusableElement.current = null;
  }, [handleKeyDown, returnFocus]);

  // Update focusable elements when content changes
  const updateFocusableElements = useCallback(() => {
    if (!enabled || !containerRef.current) return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      firstFocusableElement.current = focusableElements[0];
      lastFocusableElement.current = focusableElements[focusableElements.length - 1];
    }
  }, [enabled, getFocusableElements]);

  // Set up focus trap when enabled
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    activate();

    return () => {
      deactivate();
    };
  }, [enabled, activate, deactivate]);

  // Update focusable elements when container content changes
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const observer = new MutationObserver(() => {
      updateFocusableElements();
    });

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'hidden', 'aria-hidden', 'tabindex']
    });

    return () => {
      observer.disconnect();
    };
  }, [enabled, updateFocusableElements]);

  return {
    containerRef,
    activate,
    deactivate,
    focusFirstElement,
    focusLastElement,
    updateFocusableElements
  };
}

// Hook for managing focus restoration
export function useFocusRestoration(enabled = true) {
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    if (enabled) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
    }
  }, [enabled]);

  const restoreFocus = useCallback(() => {
    if (enabled && previouslyFocusedElement.current) {
      (previouslyFocusedElement.current as HTMLElement).focus();
      previouslyFocusedElement.current = null;
    }
  }, [enabled]);

  return {
    saveFocus,
    restoreFocus
  };
}

// Hook for managing focus within a specific element
export function useFocusManagement(containerRef: React.RefObject<HTMLElement>) {
  const focusFirst = useCallback(() => {
    if (!containerRef.current) return;

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    const firstFocusable = containerRef.current.querySelector(focusableSelectors) as HTMLElement;
    (firstFocusable as HTMLElement)?.focus();
  }, [containerRef]);

  const focusLast = useCallback(() => {
    if (!containerRef.current) return;

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    const focusableElements = Array.from(
      containerRef.current.querySelectorAll(focusableSelectors)
    );

    const lastFocusable = focusableElements[focusableElements.length - 1];
    (lastFocusable as HTMLElement)?.focus();
  }, [containerRef]);

  return {
    focusFirst,
    focusLast
  };
}