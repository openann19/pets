/**
 * Create StyleSheet utility
 * Enhanced StyleSheet creation with design tokens
 */
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { COLORS } from '../tokens/colors';
import { SPACING } from '../tokens/spacing';
import { TYPOGRAPHY } from '../tokens/typography';
import { SHADOWS } from '../tokens/shadows';
type NamedStyles<T> = {
    [P in keyof T]: ViewStyle | TextStyle | ImageStyle;
};
export declare const createStyleSheet: <T extends NamedStyles<T> | NamedStyles<any>>(styles: T | (() => T)) => T;
export { COLORS, SPACING, TYPOGRAPHY, SHADOWS };
//# sourceMappingURL=createStyleSheet.d.ts.map