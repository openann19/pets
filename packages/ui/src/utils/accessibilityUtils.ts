/**
 * Utility functions for accessibility checks and automated testing
 */

/**
 * Check if the contrast ratio between two colors meets WCAG standards
 * 
 * @param foreground Foreground color in hex format (e.g., '#ffffff')
 * @param background Background color in hex format (e.g., '#000000')
 * @param isLargeText Whether the text is considered "large" (at least 18pt or 14pt bold)
 * @returns Object containing contrast ratio and compliance levels
 */
export function checkContrastRatio(
  foreground: string,
  background: string,
  isLargeText = false
): {
  ratio: number;
  AA: boolean;
  AAA: boolean;
  passesMinimum: boolean;
} {
  // Convert hex colors to RGB
  const fgRGB = hexToRGB(foreground);
  const bgRGB = hexToRGB(background);
  
  if (!fgRGB || !bgRGB) {
    throw new Error('Invalid color format. Expected hex format (e.g., #ffffff)');
  }
  
  // Calculate luminance for each color
  const fgLuminance = calculateLuminance(fgRGB[0], fgRGB[1], fgRGB[2]);
  const bgLuminance = calculateLuminance(bgRGB[0], bgRGB[1], bgRGB[2]);
  
  // Calculate contrast ratio
  const ratio = calculateContrastRatio(fgLuminance, bgLuminance);
  
  // WCAG 2.1 requirements
  const AA = isLargeText ? ratio >= 3 : ratio >= 4.5;
  const AAA = isLargeText ? ratio >= 4.5 : ratio >= 7;
  
  return {
    ratio,
    AA,
    AAA,
    passesMinimum: ratio >= 3, // Minimum ratio for any text
  };
}

/**
 * Convert hex color to RGB values
 */
function hexToRGB(hex: string): [number, number, number] | null {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Handle shorthand hex
  if (hex.length === 3) {
    hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
  }
  
  // Check if valid hex format
  if (hex.length !== 6) {
    return null;
  }
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return [r, g, b];
}

/**
 * Calculate luminance of RGB color
 * Formula from WCAG 2.1
 */
function calculateLuminance(r: number, g: number, b: number): number {
  // Normalize RGB values
  const rSRGB = r / 255;
  const gSRGB = g / 255;
  const bSRGB = b / 255;
  
  // Convert to linear RGB
  const rLinear = rSRGB <= 0.03928
    ? rSRGB / 12.92
    : Math.pow((rSRGB + 0.055) / 1.055, 2.4);
  
  const gLinear = gSRGB <= 0.03928
    ? gSRGB / 12.92
    : Math.pow((gSRGB + 0.055) / 1.055, 2.4);
  
  const bLinear = bSRGB <= 0.03928
    ? bSRGB / 12.92
    : Math.pow((bSRGB + 0.055) / 1.055, 2.4);
  
  // Calculate luminance using the formula
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two luminance values
 * Formula from WCAG 2.1
 */
function calculateContrastRatio(luminance1: number, luminance2: number): number {
  const lightest = Math.max(luminance1, luminance2);
  const darkest = Math.min(luminance1, luminance2);
  
  return (lightest + 0.05) / (darkest + 0.05);
}

/**
 * Generate accessible text color based on background color
 * 
 * @param backgroundColor Background color in hex format (e.g., '#ffffff')
 * @returns White or black color based on contrast
 */
export function getAccessibleTextColor(backgroundColor: string): string {
  const bgRGB = hexToRGB(backgroundColor);
  
  if (!bgRGB) {
    return '#000000'; // Default to black if invalid color
  }
  
  const luminance = calculateLuminance(bgRGB[0], bgRGB[1], bgRGB[2]);
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.179 ? '#000000' : '#ffffff';
}

/**
 * Check if an element is keyboard focusable
 */
export function isKeyboardFocusable(element: Element): boolean {
  const nodeName = element.nodeName.toLowerCase();
  const tabIndex = element.getAttribute('tabindex');
  const hasTabIndex = tabIndex !== null && tabIndex !== '-1';
  
  // Interactive elements that are natively focusable
  const nativelyFocusable =
    nodeName === 'a' ||
    nodeName === 'button' ||
    nodeName === 'input' ||
    nodeName === 'select' ||
    nodeName === 'textarea' ||
    nodeName === 'details' ||
    nodeName === 'summary';
  
  // Check if the element is disabled
  const isDisabled =
    element.hasAttribute('disabled') ||
    element.getAttribute('aria-disabled') === 'true';
  
  return (nativelyFocusable || hasTabIndex) && !isDisabled;
}

/**
 * Check if string has proper casing for screen readers
 * Avoids ALL CAPS which screen readers may spell out letter by letter
 */
export function hasProperCasing(text: string): boolean {
  const words = text.split(/\s+/);
  const allCapsWords = words.filter(word => word.length > 1 && word === word.toUpperCase());
  
  // Allow up to 2 all caps words (e.g., for abbreviations like API, UI)
  return allCapsWords.length <= 2;
}

/**
 * Check if a component has appropriate labels for screen readers
 */
export function hasAccessibleLabel(element: Element): boolean {
  return !!(
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.hasAttribute('title') ||
    // For inputs, check associated label
    (element.nodeName.toLowerCase() === 'input' && 
      document.querySelector(`label[for="${element.id}"]`))
  );
}

/**
 * Ensure a string ID is safe and valid for HTML use
 */
export function createSafeId(prefix: string, value?: string): string {
  const randomPart = Math.random().toString(36).substring(2, 6);
  let id = `${prefix}-${randomPart}`;
  
  if (value) {
    // Sanitize value to be a valid ID
    const sanitized = value
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    id = `${prefix}-${sanitized}-${randomPart}`;
  }
  
  return id;
}

export default {
  checkContrastRatio,
  getAccessibleTextColor,
  isKeyboardFocusable,
  hasProperCasing,
  hasAccessibleLabel,
  createSafeId,
};
