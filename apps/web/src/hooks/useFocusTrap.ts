/**
 * useFocusTrap Hook
 * 
 * Traps keyboard focus within a modal/dialog for accessibility
 */

import { useEffect, RefObject } from 'react';

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
];

export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll<HTMLElement>(
      FOCUSABLE_ELEMENTS.join(',')
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus first element on mount
    if (firstFocusable) {
      firstFocusable.focus();
    }

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleTab);

    return () => {
      element.removeEventListener('keydown', handleTab);
    };
  }, [ref, enabled]);
}

