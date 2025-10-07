/**
 * Create StyleSheet utility
 * Enhanced StyleSheet creation with design tokens
 */
import { StyleSheet } from 'react-native';
import { COLORS } from '../tokens/colors';
import { SPACING } from '../tokens/spacing';
import { TYPOGRAPHY } from '../tokens/typography';
import { SHADOWS } from '../tokens/shadows';
export const createStyleSheet = (styles) => {
    const styleSheet = typeof styles === 'function' ? styles() : styles;
    return StyleSheet.create(styleSheet);
};
// Export design tokens for use in styles
export { COLORS, SPACING, TYPOGRAPHY, SHADOWS };
//# sourceMappingURL=createStyleSheet.js.map