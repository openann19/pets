import { useCallback } from 'react';

/**
 * A hook to check color contrast between text and background
 * Implements WCAG 2.1 contrast requirements
 */
export function useContrastCheck() {
  /**
   * Convert RGB values to luminance
   * Formula from WCAG 2.1
   */
  const calculateLuminance = useCallback((r: number, g: number, b: number): number => {
    // Convert RGB values to sRGB
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    // Calculate RGB values
    const rValue = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gValue = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bValue = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    // Calculate luminance using the formula
    return 0.2126 * rValue + 0.7152 * gValue + 0.0722 * bValue;
  }, []);

  /**
   * Convert hex color to RGB
   */
  const hexToRgb = useCallback((hex: string): number[] | null => {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Convert 3-digit hex to 6-digit
    if (hex.length === 3) {
      hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
    }

    // Parse hex values
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? [
          parseInt(result[1]!, 16),
          parseInt(result[2]!, 16),
          parseInt(result[3]!, 16)
        ]
      : null;
  }, []);

  /**
   * Calculate contrast ratio between two colors
   * Returns a ratio between 1:1 and 21:1
   */
  const calculateContrastRatio = useCallback((color1: string, color2: string): number => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) {
      console.error('Invalid color format', color1, color2);
      return 1; // Default lowest contrast
    }

    const lum1 = calculateLuminance(rgb1[0]!, rgb1[1]!, rgb1[2]!);
    const lum2 = calculateLuminance(rgb2[0]!, rgb2[1]!, rgb2[2]!);

    // Calculate the contrast ratio
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }, [calculateLuminance, hexToRgb]);

  /**
   * Check if the contrast meets WCAG AA standard
   * 4.5:1 for normal text, 3:1 for large text
   */
  const meetsWCAGAA = useCallback((
    foreground: string, 
    background: string, 
    isLargeText = false
  ): boolean => {
    const requiredRatio = isLargeText ? 3 : 4.5;
    return calculateContrastRatio(foreground, background) >= requiredRatio;
  }, [calculateContrastRatio]);

  /**
   * Check if the contrast meets WCAG AAA standard
   * 7:1 for normal text, 4.5:1 for large text
   */
  const meetsWCAGAAA = useCallback((
    foreground: string, 
    background: string, 
    isLargeText = false
  ): boolean => {
    const requiredRatio = isLargeText ? 4.5 : 7;
    return calculateContrastRatio(foreground, background) >= requiredRatio;
  }, [calculateContrastRatio]);

  return {
    calculateContrastRatio,
    meetsWCAGAA,
    meetsWCAGAAA
  };
}

export default useContrastCheck;
