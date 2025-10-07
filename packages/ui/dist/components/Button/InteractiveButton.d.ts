/**
 * PROJECT HYPERION: INTERACTIVE BUTTON COMPONENT
 *
 * Enterprise-grade interactive button with:
 * - Magnetic mouse tracking
 * - Ripple animations on press
 * - Glow effects with animated shadows
 * - Holographic variant with shimmer
 * - Glass morphism variant
 * - Loading states with animated spinners
 * - Haptic feedback integration
 * - Multiple size variants (sm, md, lg, xl)
 */
import React from 'react';
import { ViewStyle, TextStyle, GestureResponderEvent } from 'react-native';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'glass' | 'holographic' | 'neon' | 'premium';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
export interface InteractiveButtonProps {
    title: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: string;
    loading?: boolean;
    disabled?: boolean;
    magnetic?: boolean;
    ripple?: boolean;
    glow?: boolean;
    shimmer?: boolean;
    onPress?: (event: GestureResponderEvent) => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    testID?: string;
}
export declare const InteractiveButton: React.FC<InteractiveButtonProps>;
export default InteractiveButton;
//# sourceMappingURL=InteractiveButton.d.ts.map