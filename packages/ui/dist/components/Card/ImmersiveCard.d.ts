/**
 * PROJECT HYPERION: IMMERSIVE CARD COMPONENT
 *
 * Enterprise-grade card component with:
 * - 3D tilt effects with gyroscope support
 * - Glass morphism with backdrop blur
 * - Holographic variant with animated gradients
 * - Shimmer effects on hover
 * - Magnetic mouse tracking
 * - Entrance animations (fadeInUp, scaleIn, slideIn)
 * - Glow variants with colored shadows
 */
import React from 'react';
import { ViewStyle, GestureResponderEvent } from 'react-native';
export type CardVariant = 'default' | 'glass' | 'holographic' | 'glow' | '3d';
export type EntranceAnimation = 'fadeInUp' | 'scaleIn' | 'slideIn';
export interface ImmersiveCardProps {
    children: React.ReactNode;
    variant?: CardVariant;
    tilt?: boolean;
    magnetic?: boolean;
    shimmer?: boolean;
    glow?: boolean;
    entrance?: EntranceAnimation;
    onPress?: (event: GestureResponderEvent) => void;
    style?: ViewStyle;
    testID?: string;
}
export declare const ImmersiveCard: React.FC<ImmersiveCardProps>;
export default ImmersiveCard;
//# sourceMappingURL=ImmersiveCard.d.ts.map