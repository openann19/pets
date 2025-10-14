import { useCallback, useEffect, useRef } from 'react';

export interface AccessibilityConfig {
  /**
   * Whether to announce page changes
   */
  announcePageChanges?: boolean;
  /**
   * Whether to manage focus
   */
  manageFocus?: boolean;
  /**
   * Whether to handle keyboard navigation
   */
  handleKeyboardNavigation?: boolean;
  /**
   * Whether to provide screen reader support
   */
  screenReaderSupport?: boolean;
  /**
   * Whether to handle color contrast
   */
  handleColorContrast?: boolean;
  /**
   * Whether to provide high contrast mode
   */
  highContrastMode?: boolean;
  /**
   * Whether to handle reduced motion
   */
  handleReducedMotion?: boolean;
}

export interface AccessibilityState {
  /**
   * Whether high contrast mode is enabled
   */
  isHighContrast: boolean;
  /**
   * Whether reduced motion is preferred
   */
  prefersReducedMotion: boolean;
  /**
   * Whether the user is using a screen reader
   */
  isScreenReader: boolean;
  /**
   * Current focus element
   */
  focusedElement: HTMLElement | null;
  /**
   * Whether keyboard navigation is active
   */
  isKeyboardNavigation: boolean;
}

export interface AccessibilityActions {
  /**
   * Announce a message to screen readers
   */
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  /**
   * Set focus to an element
   */
  setFocus: (element: HTMLElement | string) => void;
  /**
   * Trap focus within a container
   */
  trapFocus: (container: HTMLElement) => void;
  /**
   * Release focus trap
   */
  releaseFocus: () => void;
  /**
   * Handle keyboard navigation
   */
  handleKeyDown: (event: KeyboardEvent) => void;
  /**
   * Toggle high contrast mode
   */
  toggleHighContrast: () => void;
  /**
   * Get color contrast ratio
   */
  getColorContrast: (foreground: string, background: string) => number;
  /**
   * Check if color combination meets WCAG standards
   */
  meetsWCAGStandards: (foreground: string, background: string, level?: 'AA' | 'AAA') => boolean;
}

/**
 * Enhanced accessibility hook providing comprehensive WCAG 2.1 AA compliance features
 * Includes screen reader support, keyboard navigation, focus management, and color contrast
 *
 * Usage:
 *   const { announce, setFocus, isHighContrast } = useAccessibility();
 *   announce('Page loaded successfully');
 *   setFocus('#main-content');
 */
export const useAccessibility = (config: AccessibilityConfig = {}): AccessibilityState & AccessibilityActions => {
  const {
    announcePageChanges = true,
    manageFocus = true,
    handleKeyboardNavigation = true,
    screenReaderSupport = true,
    handleColorContrast = true,
    highContrastMode = false,
    handleReducedMotion = true
  } = config;

  const stateRef = useRef<AccessibilityState>({
    isHighContrast: false,
    prefersReducedMotion: false,
    isScreenReader: false,
    focusedElement: null,
    isKeyboardNavigation: false
  });

  const focusTrapRef = useRef<HTMLElement | null>(null);
  const focusHistoryRef = useRef<HTMLElement[]>([]);

  // Initialize accessibility features
  useEffect(() => {
    // Check for screen reader
    const checkScreenReader = () => {
      const isScreenReader = !!(
        window.navigator.userAgent.includes('NVDA') ||
        window.navigator.userAgent.includes('JAWS') ||
        window.navigator.userAgent.includes('VoiceOver') ||
        window.navigator.userAgent.includes('TalkBack') ||
        window.speechSynthesis ||
        window.navigator.userAgent.includes('Chrome') && window.navigator.userAgent.includes('Accessibility')
      );
      
      stateRef.current.isScreenReader = isScreenReader;
    };

    // Check for reduced motion preference
    const checkReducedMotion = () => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      stateRef.current.prefersReducedMotion = mediaQuery.matches;
      
      const handleChange = (e: MediaQueryListEvent) => {
        stateRef.current.prefersReducedMotion = e.matches;
        if (e.matches) {
          document.documentElement.style.setProperty('--spring-duration', '0.01s');
          document.documentElement.style.setProperty('--spring-timing', 'linear');
        } else {
          document.documentElement.style.setProperty('--spring-duration', '0.4s');
          document.documentElement.style.setProperty('--spring-timing', 'cubic-bezier(0.34, 1.56, 0.64, 1)');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => { mediaQuery.removeEventListener('change', handleChange); };
    };

    // Check for high contrast mode
    const checkHighContrast = () => {
      const mediaQuery = window.matchMedia('(prefers-contrast: high)');
      stateRef.current.isHighContrast = mediaQuery.matches;
      
      const handleChange = (e: MediaQueryListEvent) => {
        stateRef.current.isHighContrast = e.matches;
        if (e.matches) {
          document.documentElement.classList.add('high-contrast');
        } else {
          document.documentElement.classList.remove('high-contrast');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => { mediaQuery.removeEventListener('change', handleChange); };
    };

    // Track keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        stateRef.current.isKeyboardNavigation = true;
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      stateRef.current.isKeyboardNavigation = false;
      document.body.classList.remove('keyboard-navigation');
    };

    // Initialize checks
    checkScreenReader();
    const cleanupReducedMotion = checkReducedMotion();
    const cleanupHighContrast = checkHighContrast();

    // Add event listeners
    if (handleKeyboardNavigation) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleMouseDown);
    }

    // Cleanup
    return () => {
      cleanupReducedMotion();
      cleanupHighContrast();
      if (handleKeyboardNavigation) {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousedown', handleMouseDown);
      }
    };
  }, [handleKeyboardNavigation]);

  // Announce function for screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!screenReaderSupport) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [screenReaderSupport]);

  // Set focus to an element
  const setFocus = useCallback((element: HTMLElement | string) => {
    if (!manageFocus) return;

    const targetElement = typeof element === 'string' 
      ? document.querySelector(element)!
      : element;

    if (targetElement) {
      // Store previous focus
      if (document.activeElement instanceof HTMLElement) {
        focusHistoryRef.current.push(document.activeElement);
      }

      targetElement.focus();
      stateRef.current.focusedElement = targetElement;

      // Announce focus change
      if (screenReaderSupport) {
        const label = targetElement.getAttribute('aria-label') || 
                     targetElement.textContent || 
                     targetElement.getAttribute('title') || 
                     'Element';
        announce(`Focused on ${label}`);
      }
    }
  }, [manageFocus, screenReaderSupport, announce]);

  // Trap focus within a container
  const trapFocus = useCallback((container: HTMLElement) => {
    if (!manageFocus) return;

    focusTrapRef.current = container;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [manageFocus]);

  // Release focus trap
  const releaseFocus = useCallback(() => {
    if (!manageFocus) return;

    focusTrapRef.current = null;
    
    // Restore previous focus
    const previousFocus = focusHistoryRef.current.pop();
    if (previousFocus) {
      previousFocus.focus();
    }
  }, [manageFocus]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!handleKeyboardNavigation) return;

    switch (event.key) {
      case 'Escape':
        // Close modals, dropdowns, etc.
        const activeModal = document.querySelector('[role="dialog"]:not([aria-hidden="true"])');
        if (activeModal) {
          const closeButton = activeModal.querySelector('[aria-label*="close"], [aria-label*="Close"]');
          if (closeButton instanceof HTMLElement) {
            closeButton.click();
          }
        }
        break;

      case 'Enter':
      case ' ':
        // Handle button and link activation
        if (event.target instanceof HTMLElement) {
          const role = event.target.getAttribute('role');
          if (role === 'button' || role === 'link') {
            event.preventDefault();
            event.target.click();
          }
        }
        break;

      case 'ArrowUp':
      case 'ArrowDown':
        // Handle list navigation
        if (event.target instanceof HTMLElement) {
          const listContainer = event.target.closest('[role="listbox"], [role="menu"], [role="tree"]');
          if (listContainer) {
            event.preventDefault();
            const items = Array.from(listContainer.querySelectorAll('[role="option"], [role="menuitem"], [role="treeitem"]'));
            const currentIndex = items.indexOf(event.target);
            const nextIndex = event.key === 'ArrowDown' 
              ? Math.min(currentIndex + 1, items.length - 1)
              : Math.max(currentIndex - 1, 0);
            
            if (items[nextIndex] instanceof HTMLElement) {
              (items[nextIndex]).focus();
            }
          }
        }
        break;
    }
  }, [handleKeyboardNavigation]);

  // Toggle high contrast mode
  const toggleHighContrast = useCallback(() => {
    stateRef.current.isHighContrast = !stateRef.current.isHighContrast;
    
    if (stateRef.current.isHighContrast) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('high-contrast', 'true');
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.setItem('high-contrast', 'false');
    }
  }, []);

  // Get color contrast ratio
  const getColorContrast = useCallback((foreground: string, background: string): number => {
    if (!handleColorContrast) return 0;

    const getLuminance = (color: string): number => {
      const rgb = color.match(/\d+/g);
      if (!rgb || rgb.length < 3) return 0;

      const [r, g, b] = rgb.map(c => {
        const val = parseInt(c) / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const fgLuminance = getLuminance(foreground);
    const bgLuminance = getLuminance(background);

    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);

    return (lighter + 0.05) / (darker + 0.05);
  }, [handleColorContrast]);

  // Check if color combination meets WCAG standards
  const meetsWCAGStandards = useCallback((foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
    if (!handleColorContrast) return false;

    const contrast = getColorContrast(foreground, background);
    const requiredContrast = level === 'AA' ? 4.5 : 7;

    return contrast >= requiredContrast;
  }, [handleColorContrast, getColorContrast]);

  return {
    ...stateRef.current,
    announce,
    setFocus,
    trapFocus,
    releaseFocus,
    handleKeyDown,
    toggleHighContrast,
    getColorContrast,
    meetsWCAGStandards
  };
};

export default useAccessibility;
