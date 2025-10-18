import React, { useCallback, useEffect, useState } from 'react';
import { checkContrastRatio } from '../utils/accessibilityUtils';

interface AccessibilityCheckResult {
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
  fixSuggestion?: string;
}

interface AccessibilityCheckerProps {
  /**
   * The component to check
   */
  component: React.ReactNode;

  /**
   * Enable automatic checking on render
   */
  autoCheck?: boolean;

  /**
   * Show detailed results
   */
  showDetails?: boolean;

  /**
   * Only show failures
   */
  showFailuresOnly?: boolean;

  /**
   * Rules to check (all are checked by default)
   */
  rules?: (| 'contrast'
    | 'aria-labels'
    | 'keyboard-focus'
    | 'text-alternatives'
    | 'semantic-structure')[];

  /**
   * Callback when check is complete
   */
  onCheckComplete?: (results: AccessibilityCheckResult[]) => void;

  /**
   * Additional class name
   */
  className?: string;

  /**
   * Whether to render the checked component
   */
  renderComponent?: boolean;
}

/**
 * A component that checks the accessibility of a component
 * This runs automated checks similar to axe-core
 */
export const AccessibilityChecker: React.FC<AccessibilityCheckerProps> = ({
  component,
  autoCheck = true,
  showDetails = true,
  showFailuresOnly = false,
  rules = ['contrast', 'aria-labels', 'keyboard-focus', 'text-alternatives', 'semantic-structure'],
  onCheckComplete,
  className = '',
  renderComponent = true,
}) => {
  const [results, setResults] = useState<AccessibilityCheckResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Function to check contrast ratio
  const checkContrast = useCallback((): AccessibilityCheckResult[] => {
    if (!containerRef.current || !rules.includes('contrast')) return [];

    const results: AccessibilityCheckResult[] = [];
    const elements = containerRef.current.querySelectorAll('*');

    const rgbToHex = (rgb: string): string => {
      const rgbValues = rgb
        .replace(/rgba?\(|\)/g, '')
        .split(',')
        .map(num => parseInt(num.trim(), 10));

      const r = rgbValues[0] || 0;
      const g = rgbValues[1] || 0;
      const b = rgbValues[2] || 0;

      return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
    };

    elements.forEach(element => {
      // Skip elements without text content
      if (!element.textContent?.trim()) return;

      // Get computed styles
      const computedStyle = window.getComputedStyle(element);
      const foregroundColor = computedStyle.color;
      const { backgroundColor } = computedStyle;

      try {
        // Check if background is transparent
        if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
          results.push({
            passed: false,
            message: `Element with text "${element.textContent.trim()}" has transparent background, contrast might be insufficient`,
            severity: 'warning',
            fixSuggestion: 'Ensure the element has a non-transparent background or container',
          });
          return;
        }

        // Convert colors to hex
        const fgHex = rgbToHex(foregroundColor);
        const bgHex = rgbToHex(backgroundColor);

        // Get font size to determine if it's large text
        const fontSize = parseInt(computedStyle.fontSize, 10);
        const fontWeight = parseInt(computedStyle.fontWeight, 10);
        const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);

        // Check contrast using utility helper
        const contrast = checkContrastRatio(fgHex, bgHex, isLargeText);

        if (!contrast.AA) {
          results.push({
            passed: false,
            message: `Insufficient contrast (${contrast.ratio.toFixed(2)}:1) for text "${element.textContent.trim()}"`,
            severity: 'error',
            fixSuggestion: `Use colors with at least ${isLargeText ? '3:1' : '4.5:1'} contrast ratio`,
          });
        }
      } catch (error) {
        void error;
        // Handle errors in color calculation
      }
    });

    return results;
  }, [rules]);

  // Function to check ARIA labels
  const checkAriaLabels = useCallback((): AccessibilityCheckResult[] => {
    if (!containerRef.current || !rules.includes('aria-labels')) return [];

    const results: AccessibilityCheckResult[] = [];

    // Interactive elements that should have accessible names
    const interactiveSelectors = [
      'button',
      'a[href]',
      'input',
      'textarea',
      'select',
      'summary',
      '[role="button"]',
      '[role="link"]',
      '[role="checkbox"]',
      '[role="radio"]',
      '[role="tab"]',
    ];

    const elements = containerRef.current.querySelectorAll(interactiveSelectors.join(','));

    elements.forEach(element => {
      const hasAccessibleName = !!(
        element.hasAttribute('aria-label') ||
        element.hasAttribute('aria-labelledby') ||
        element.hasAttribute('title') ||
        element.textContent?.trim() ||
        element.hasAttribute('alt') ||
        (element instanceof HTMLInputElement &&
          element.type === 'image' &&
          element.hasAttribute('alt'))
      );

      // For inputs, check for associated label
      if (!hasAccessibleName && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) {
        const id = element.getAttribute('id');
        if (id !== null && id !== undefined) {
          const label = document.querySelector(`label[for="${id}"]`);
          if (label && label.textContent?.trim()) {
            return; // Has label, skip
          }
        }
      }

      if (!hasAccessibleName) {
        results.push({
          passed: false,
          message: `Interactive element (${element.tagName.toLowerCase()}) is missing an accessible name`,
          severity: 'error',
          fixSuggestion: 'Add aria-label, aria-labelledby, or visible text content',
        });
      }
    });

    return results;
  }, [rules]);

  // Function to check keyboard focus indicators
  const checkKeyboardFocus = useCallback((): AccessibilityCheckResult[] => {
    if (!containerRef.current || !rules.includes('keyboard-focus')) return [];

    const results: AccessibilityCheckResult[] = [];

    // Check for outline:none without alternative focus styles
    const stylesheet = document.styleSheets;
    let hasGlobalFocusStyleReset = false;

    // Check if there's a global outline:none
    try {
      Array.from(stylesheet).forEach(sheet => {
        try {
          Array.from(sheet.cssRules).forEach(rule => {
            if (rule instanceof CSSStyleRule) {
              if (
                rule.selectorText.includes(':focus') &&
                rule.style.outline === 'none' &&
                !rule.style.boxShadow &&
                !rule.style.borderColor
              ) {
                hasGlobalFocusStyleReset = true;
              }
            }
          });
        } catch (e) {
          void e;
          // Ignore cross-origin stylesheet errors
        }
      });
    } catch (e) {
      void e;
      // Ignore general stylesheet errors
    }

    if (hasGlobalFocusStyleReset) {
      results.push({
        passed: false,
        message: 'Global focus styles may be removed without alternatives',
        severity: 'error',
        fixSuggestion: 'Provide alternative focus indicators when removing outlines',
      });
    }

    // Check for tabindex > 0
    const elementsWithPositiveTabIndex = containerRef.current.querySelectorAll('[tabindex]');
    elementsWithPositiveTabIndex.forEach(element => {
      const tabindex = parseInt(element.getAttribute('tabindex') || '0', 10);
      if (tabindex > 0) {
        results.push({
          passed: false,
          message: `Element has tabindex=${tabindex}, which disrupts natural tab order`,
          severity: 'warning',
          fixSuggestion: 'Use tabindex="0" or restructure HTML for logical tab order',
        });
      }
    });

    return results;
  }, [rules]);

  // Function to check text alternatives
  const checkTextAlternatives = useCallback((): AccessibilityCheckResult[] => {
    if (!containerRef.current || !rules.includes('text-alternatives')) return [];

    const results: AccessibilityCheckResult[] = [];

    // Check images for alt text
    const images = containerRef.current.querySelectorAll('img');
    images.forEach(img => {
      if (!img.hasAttribute('alt')) {
        results.push({
          passed: false,
          message: 'Image is missing alt text',
          severity: 'error',
          fixSuggestion: 'Add alt attribute to describe the image content',
        });
      } else if (img.alt === '' && !img.hasAttribute('role') && !img.hasAttribute('aria-hidden')) {
        // Empty alt is fine for decorative images, but should be explicitly marked
        results.push({
          passed: false,
          message: 'Decorative image with empty alt text should be hidden from screen readers',
          severity: 'warning',
          fixSuggestion: 'Add role="presentation" or aria-hidden="true"',
        });
      }
    });

    // Check for icons without text alternatives
    const svgs = containerRef.current.querySelectorAll('svg');
    svgs.forEach(svg => {
      const hasTitle = svg.querySelector('title');
      const hasAriaLabel = svg.hasAttribute('aria-label');
      const hasAriaLabelledBy = svg.hasAttribute('aria-labelledby');
      const isExplicitlyHidden = svg.hasAttribute('aria-hidden') && svg.getAttribute('aria-hidden') === 'true';

      if (!hasTitle && !hasAriaLabel && !hasAriaLabelledBy && !isExplicitlyHidden) {
        results.push({
          passed: false,
          message: 'SVG icon may be missing text alternative',
          severity: 'warning',
          fixSuggestion: 'Add aria-label, title element, or aria-hidden="true" for decorative icons',
        });
      }
    });

    return results;
  }, [rules]);

  // Function to check semantic structure
  const checkSemanticStructure = useCallback((): AccessibilityCheckResult[] => {
    if (!containerRef.current || !rules.includes('semantic-structure')) return [];

    const results: AccessibilityCheckResult[] = [];

    // Check heading order
    const headings = containerRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousHeadingLevel = 0;

    headings.forEach(heading => {
      const currentLevel = parseInt(heading.tagName.slice(1), 10);

      // Check for skipped heading levels
      if (previousHeadingLevel > 0 && currentLevel > previousHeadingLevel + 1) {
        results.push({
          passed: false,
          message: `Heading level skipped from h${previousHeadingLevel} to h${currentLevel}`,
          severity: 'warning',
          fixSuggestion: `Use h${previousHeadingLevel + 1} to maintain heading hierarchy`,
        });
      }

      previousHeadingLevel = currentLevel;
    });

    // Check for divs used as buttons
    const divButtons = containerRef.current.querySelectorAll('div[onclick], span[onclick]');
    divButtons.forEach(() => {
      results.push({
        passed: false,
        message: 'Non-interactive element has onclick handler without semantic role',
        severity: 'error',
        fixSuggestion: 'Use <button> or add role="button" and proper keyboard event handlers',
      });
    });

    // Check lists
    const lists = containerRef.current.querySelectorAll('ul, ol');
    lists.forEach(list => {
      const children = Array.from(list.children);
      const nonListItems = children.filter(child => child.tagName.toLowerCase() !== 'li');

      if (nonListItems.length > 0) {
        results.push({
          passed: false,
          message: 'List contains non-li elements as direct children',
          severity: 'warning',
          fixSuggestion: 'Use only <li> elements as direct children of <ul> or <ol>',
        });
      }
    });

    return results;
  }, [rules]);

  // Run all checks
  const runChecks = useCallback((): void => {
    setIsChecking(true);

    // Wait for next render to make sure component is mounted
    setTimeout(() => {
      const contrastResults = checkContrast();
      const ariaResults = checkAriaLabels();
      const focusResults = checkKeyboardFocus();
      const textResults = checkTextAlternatives();
      const structureResults = checkSemanticStructure();

      const allResults = [
        ...contrastResults,
        ...ariaResults,
        ...focusResults,
        ...textResults,
        ...structureResults,
      ];

      setResults(allResults);

      if (onCheckComplete) {
        onCheckComplete(allResults);
      }

      setIsChecking(false);
    }, 0);
  }, [checkAriaLabels, checkContrast, checkKeyboardFocus, checkSemanticStructure, checkTextAlternatives, onCheckComplete]);

  // Run checks on mount if autoCheck is true
  useEffect(() => {
    if (autoCheck !== null && autoCheck !== undefined) {
      runChecks();
    }
  }, [component, autoCheck, runChecks]);

  // Filter results if showFailuresOnly is true
  const displayResults = showFailuresOnly
    ? results.filter(result => !result.passed)
    : results;

  return (
    <div className={`accessibility-checker ${className}`}>
      {/* Hidden div to mount component for checking */}
      <div
        ref={containerRef}
        className={renderComponent ? '' : 'sr-only'}
        aria-hidden={!renderComponent}
      >
        {component}
      </div>

      {/* Results */}
      {showDetails !== undefined && (
        <div className="accessibility-results mt-4">
          <h3 className="text-lg font-semibold mb-2">Accessibility Check Results</h3>

          <div className="flex mb-2">
            <button
              onClick={runChecks}
              disabled={isChecking}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isChecking ? 'Checking...' : 'Run Check'}
            </button>
          </div>

          {displayResults.length === 0 ? (
            <p className="text-green-500 font-medium">
              {results.length === 0 && isChecking
                ? 'Running checks...'
                : results.length === 0
                  ? 'No checks run yet'
                  : 'All checks passed!'}
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {displayResults.map((result, index) => (
                <li
                  key={index}
                  className={`p-3 rounded-md ${result.severity === 'error'
                    ? 'bg-red-50 border-l-4 border-red-500'
                    : result.severity === 'warning'
                      ? 'bg-yellow-50 border-l-4 border-yellow-500'
                      : 'bg-blue-50 border-l-4 border-blue-500'
                    }`}
                >
                  <div className="flex items-start">
                    <div className={`mr-2 ${result.severity === 'error'
                      ? 'text-red-500'
                      : result.severity === 'warning'
                        ? 'text-yellow-500'
                        : 'text-blue-500'
                      }`}>
                      {result.severity === 'error' ? (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      ) : result.severity === 'warning' ? (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{result.message}</p>
                      {result.fixSuggestion !== undefined && result.fixSuggestion !== null && (
                        <p className="text-sm mt-1">Suggestion: {result.fixSuggestion}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AccessibilityChecker;
