/**
 * ♿ Comprehensive Accessibility Hook
 * Provides accessibility utilities and user preference detection
 */

import { useState, useEffect, useCallback } from 'react';

interface AccessibilityState {
  isReducedMotion: boolean;
  isHighContrast: boolean;
  isScreenReader: boolean;
  isKeyboardUser: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  colorScheme: 'light' | 'dark' | 'auto';
}

interface AccessibilityActions {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  focusElement: (element: HTMLElement | null) => void;
  trapFocus: (container: HTMLElement) => () => void;
  restoreFocus: () => void;
  saveFocus: () => void;
}

export const useAccessibility = (): AccessibilityState & AccessibilityActions => {
  const [state, setState] = useState<AccessibilityState>({
    isReducedMotion: false,
    isHighContrast: false,
    isScreenReader: false,
    isKeyboardUser: false,
    fontSize: 'medium',
    colorScheme: 'auto',
  });

  const [previousFocus, setPreviousFocus] = useState<HTMLElement | null>(null);

  // Detect user preferences
  useEffect(() => {
    // Reduced motion preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setState(prev => ({ ...prev, isReducedMotion: reducedMotionQuery.matches }));

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setState(prev => ({ ...prev, isReducedMotion: e.matches }));
    };

    // High contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    setState(prev => ({ ...prev, isHighContrast: highContrastQuery.matches }));

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setState(prev => ({ ...prev, isHighContrast: e.matches }));
    };

    // Color scheme preference
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setState(prev => ({ 
      ...prev, 
      colorScheme: colorSchemeQuery.matches ? 'dark' : 'light' 
    }));

    const handleColorSchemeChange = (e: MediaQueryListEvent) => {
      setState(prev => ({ 
        ...prev, 
        colorScheme: e.matches ? 'dark' : 'light' 
      }));
    };

    // Screen reader detection (basic)
    const isScreenReaderActive = 
      window.navigator.userAgent.includes('NVDA') ||
      window.navigator.userAgent.includes('JAWS') ||
      window.navigator.userAgent.includes('VoiceOver') ||
      window.navigator.userAgent.includes('TalkBack');
    
    setState(prev => ({ ...prev, isScreenReader: isScreenReaderActive }));

    // Keyboard user detection
    const handleKeyDown = () => {
      setState(prev => ({ ...prev, isKeyboardUser: true }));
    };

    const handleMouseDown = () => {
      setState(prev => ({ ...prev, isKeyboardUser: false }));
    };

    // Font size detection
    const detectFontSize = () => {
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      if (rootFontSize <= 14) return 'small';
      if (rootFontSize <= 16) return 'medium';
      if (rootFontSize <= 18) return 'large';
      return 'xlarge';
    };

    setState(prev => ({ ...prev, fontSize: detectFontSize() }));

    // Event listeners
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    highContrastQuery.addEventListener('change', handleHighContrastChange);
    colorSchemeQuery.addEventListener('change', handleColorSchemeChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      colorSchemeQuery.removeEventListener('change', handleColorSchemeChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Announce messages to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after screen reader has time to read it
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Focus management
  const focusElement = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.focus();
    }
  }, []);

  const saveFocus = useCallback(() => {
    setPreviousFocus(document.activeElement as HTMLElement);
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocus) {
      previousFocus.focus();
      setPreviousFocus(null);
    }
  }, [previousFocus]);

  // Focus trap implementation
  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    // Focus first element when trap activates
    firstElement?.focus();

    container.addEventListener('keydown', handleTabKey);

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return {
    ...state,
    announce,
    focusElement,
    trapFocus,
    restoreFocus,
    saveFocus,
  };
};

// Haptic feedback hook
export const useHaptics = () => {
  const triggerHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (typeof window === 'undefined') return;
    
    if ('vibrate' in navigator) {
      const patterns = {
        light: [8],
        medium: [15],
        heavy: [25, 10, 15],
      };
      navigator.vibrate(patterns[intensity]);
    }
  }, []);

  return { triggerHaptic };
};

// Sound feedback hook
export const useSoundFeedback = () => {
  const triggerSound = useCallback((type: 'hover' | 'press' | 'success' | 'error' = 'press') => {
    if (typeof window === 'undefined') return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const frequencies = { 
        hover: 800, 
        press: 600, 
        success: 1000, 
        error: 300 
      };
      
      oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.debug('Audio feedback not available');
    }
  }, []);

  return { triggerSound };
};

// Color contrast utility
export const useColorContrast = () => {
  const getContrastRatio = useCallback((color1: string, color2: string): number => {
    const getLuminance = (color: string): number => {
      const rgb = hexToRgb(color);
      if (!rgb) return 0;
      
      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }, []);

  const meetsWCAG = useCallback((ratio: number, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const requirements = {
      AA: { normal: 4.5, large: 3 },
      AAA: { normal: 7, large: 4.5 }
    };
    
    return ratio >= requirements[level].normal;
  }, []);

  return { getContrastRatio, meetsWCAG };
};

// Helper function to convert hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};
