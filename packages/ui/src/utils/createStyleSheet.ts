/**
 * Create StyleSheet utility
 * Enhanced StyleSheet creation with design tokens
 */

import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { COLORS } from '../tokens/colors';
import { SPACING } from '../tokens/spacing';
import { TYPOGRAPHY } from '../tokens/typography';
import { SHADOWS } from '../tokens/shadows';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export const createStyleSheet = <T extends NamedStyles<T> | NamedStyles<any>>(
  styles: T | (() => T)
): T => {
  const styleSheet = typeof styles === 'function' ? styles() : styles;
  
  return StyleSheet.create(styleSheet);
};

// Export design tokens for use in styles
export { COLORS, SPACING, TYPOGRAPHY, SHADOWS };
