import { useEffect, useRef, useCallback } from 'react';

export function useFocusTrap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstFocusableElement = useRef<HTMLElement | null>(null);
  const lastFocusableElement = useRef<HTMLElement | null>(null);

  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    firstFocusableElement.current = focusableElements[0] as HTMLElement;
    lastFocusableElement.current = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.key === 'Tab' && !e.shiftKey && document.activeElement === lastFocusableElement.current) {
      e.preventDefault();
      firstFocusableElement.current?.focus();
    }

    if (e.key === 'Tab' && e.shiftKey && document.activeElement === firstFocusableElement.current) {
      e.preventDefault();
      lastFocusableElement.current?.focus();
    }
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      handleTabKey(event);
    }
  }, [handleTabKey]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);

    // Focus first element when trap is activated
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return containerRef;
}
