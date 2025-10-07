/**
 * ♿ ACCESSIBILITY AUDITOR UTILITIES
 * Comprehensive accessibility testing and validation utilities
 * Features: WCAG 2.1 AA compliance, keyboard navigation, and screen reader support
 */
import { useRef, useEffect, useCallback } from 'react';
// Color contrast utilities
export const getContrastRatio = (color1, color2) => {
    const getLuminance = (color) => {
        const rgb = hexToRgb(color);
        if (!rgb)
            return 0;
        const { r, g, b } = rgb;
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
};
const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};
export const isContrastCompliant = (foreground, background, level = 'AA') => {
    const ratio = getContrastRatio(foreground, background);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
};
// Focus management utilities
export const useFocusManagement = () => {
    const focusableElements = useRef([]);
    const getFocusableElements = useCallback((container) => {
        const focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'textarea:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]',
        ].join(', ');
        return Array.from(container.querySelectorAll(focusableSelectors));
    }, []);
    const trapFocus = useCallback((container) => {
        const focusable = getFocusableElements(container);
        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];
        const handleTabKey = (e) => {
            if (e.key !== 'Tab')
                return;
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement?.focus();
                    e.preventDefault();
                }
            }
            else {
                if (document.activeElement === lastElement) {
                    firstElement?.focus();
                    e.preventDefault();
                }
            }
        };
        container.addEventListener('keydown', handleTabKey);
        firstElement?.focus();
        return () => {
            container.removeEventListener('keydown', handleTabKey);
        };
    }, [getFocusableElements]);
    const restoreFocus = useCallback((element) => {
        element.focus();
    }, []);
    return {
        getFocusableElements,
        trapFocus,
        restoreFocus,
    };
};
// Keyboard navigation utilities
export const useKeyboardNavigation = (items, onSelect) => {
    const [focusedIndex, setFocusedIndex] = React.useState(-1);
    const handleKeyDown = useCallback((e) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex(prev => Math.min(prev + 1, items.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (focusedIndex >= 0) {
                    onSelect(items[focusedIndex], focusedIndex);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setFocusedIndex(-1);
                break;
        }
    }, [items, focusedIndex, onSelect]);
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
    return {
        focusedIndex,
        setFocusedIndex,
    };
};
// Screen reader utilities
export const useScreenReader = () => {
    const announceRef = useRef(null);
    useEffect(() => {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        document.body.appendChild(liveRegion);
        announceRef.current = liveRegion;
        return () => {
            document.body.removeChild(liveRegion);
        };
    }, []);
    const announce = useCallback((message, priority = 'polite') => {
        if (announceRef.current) {
            announceRef.current.setAttribute('aria-live', priority);
            announceRef.current.textContent = message;
            // Clear after announcement
            setTimeout(() => {
                if (announceRef.current) {
                    announceRef.current.textContent = '';
                }
            }, 1000);
        }
    }, []);
    return { announce };
};
// ARIA utilities
export const generateId = (prefix = 'id') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};
export const useAriaLabelledBy = (label) => {
    const id = useRef(generateId('label'));
    return {
        id: id.current,
        labelProps: {
            id: id.current,
            htmlFor: id.current,
        },
        inputProps: {
            'aria-labelledby': id.current,
        },
    };
};
export const useAriaDescribedBy = (description) => {
    const id = useRef(generateId('description'));
    return {
        id: id.current,
        descriptionProps: {
            id: id.current,
        },
        inputProps: {
            'aria-describedby': id.current,
        },
    };
};
// Accessibility validation
export const validateAccessibility = (element) => {
    const errors = [];
    const warnings = [];
    const suggestions = [];
    // Check for missing alt text on images
    const images = element.querySelectorAll('img');
    images.forEach((img, index) => {
        if (!img.alt && !img.getAttribute('aria-label')) {
            errors.push(`Image ${index + 1} is missing alt text`);
        }
    });
    // Check for missing labels on form inputs
    const inputs = element.querySelectorAll('input, textarea, select');
    inputs.forEach((input, index) => {
        const id = input.id;
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        if (!label && !ariaLabel && !ariaLabelledBy) {
            errors.push(`Form input ${index + 1} is missing a label`);
        }
    });
    // Check for proper heading hierarchy
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        if (level > previousLevel + 1) {
            warnings.push(`Heading hierarchy skipped from h${previousLevel} to h${level} at heading ${index + 1}`);
        }
        previousLevel = level;
    });
    // Check for sufficient color contrast
    const textElements = element.querySelectorAll('p, span, div, a, button, label');
    textElements.forEach((element, index) => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        if (color && backgroundColor && color !== backgroundColor) {
            if (!isContrastCompliant(color, backgroundColor)) {
                errors.push(`Insufficient color contrast for text element ${index + 1}`);
            }
        }
    });
    // Check for keyboard accessibility
    const interactiveElements = element.querySelectorAll('button, a, input, select, textarea, [tabindex]');
    interactiveElements.forEach((element, index) => {
        const tabIndex = element.getAttribute('tabindex');
        if (tabIndex === '-1' && element.matches('button, a, input, select, textarea')) {
            warnings.push(`Interactive element ${index + 1} is not keyboard accessible`);
        }
    });
    // Check for ARIA labels on interactive elements
    interactiveElements.forEach((element, index) => {
        const hasLabel = element.getAttribute('aria-label') ||
            element.getAttribute('aria-labelledby') ||
            element.textContent?.trim();
        if (!hasLabel && element.matches('button, [role="button"]')) {
            errors.push(`Button ${index + 1} is missing accessible name`);
        }
    });
    return { errors, warnings, suggestions };
};
// Reduced motion support
export const useReducedMotion = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);
        const handleChange = (e) => {
            setPrefersReducedMotion(e.matches);
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);
    return prefersReducedMotion;
};
// High contrast mode support
export const useHighContrast = () => {
    const [isHighContrast, setIsHighContrast] = React.useState(false);
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-contrast: high)');
        setIsHighContrast(mediaQuery.matches);
        const handleChange = (e) => {
            setIsHighContrast(e.matches);
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);
    return isHighContrast;
};
// Export React for the utilities that need it
import React from 'react';
//# sourceMappingURL=AccessibilityAuditor.js.map