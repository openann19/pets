/**
 * ♿ ACCESSIBILITY AUDITOR UTILITIES
 * Comprehensive accessibility testing and validation utilities
 * Features: WCAG 2.1 AA compliance, keyboard navigation, and screen reader support
 */
export declare const getContrastRatio: (color1: string, color2: string) => number;
export declare const isContrastCompliant: (foreground: string, background: string, level?: "AA" | "AAA") => boolean;
export declare const useFocusManagement: () => {
    getFocusableElements: (container: HTMLElement) => HTMLElement[];
    trapFocus: (container: HTMLElement) => () => void;
    restoreFocus: (element: HTMLElement) => void;
};
export declare const useKeyboardNavigation: (items: any[], onSelect: (item: any, index: number) => void) => {
    focusedIndex: number;
    setFocusedIndex: React.Dispatch<React.SetStateAction<number>>;
};
export declare const useScreenReader: () => {
    announce: (message: string, priority?: "polite" | "assertive") => void;
};
export declare const generateId: (prefix?: string) => string;
export declare const useAriaLabelledBy: (label: string) => {
    id: string;
    labelProps: {
        id: string;
        htmlFor: string;
    };
    inputProps: {
        'aria-labelledby': string;
    };
};
export declare const useAriaDescribedBy: (description: string) => {
    id: string;
    descriptionProps: {
        id: string;
    };
    inputProps: {
        'aria-describedby': string;
    };
};
export declare const validateAccessibility: (element: HTMLElement) => {
    errors: string[];
    warnings: string[];
    suggestions: string[];
};
export declare const useReducedMotion: () => boolean;
export declare const useHighContrast: () => boolean;
import React from 'react';
//# sourceMappingURL=AccessibilityAuditor.d.ts.map