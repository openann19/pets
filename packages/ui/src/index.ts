// Core components
export * from './components/Avatar';
export * from './components/Badge';
export * from './components/Button';
export * from './components/Card';
export * from './components/Dialog';
export * from './components/Input';
export * from './components/Textarea';

// Premium components
export * from './components/Premium/PremiumButton';
export * from './components/Premium/PremiumInput';

// Modern UI/UX Components (2025)
export * from './components/DarkModeToggle/DarkModeToggle';
export * from './components/PremiumFeatures/PremiumFeaturesModal';

// AI-Powered Features
export * from './components/AIFeatures/GestureInteraction';
export * from './components/AIFeatures/PersonalizedRecommendations';
export * from './components/AIFeatures/VoiceInteraction';

// Hooks
export * from './hooks/useAnimation';
export * from './hooks/useMediaQuery';
export * from './hooks/usePremiumAnimations';
export * from './hooks/useTheme';

// Design system
export * from './theme/animations';
export * from './theme/colors';
export * from './theme/design-system';
export * from './theme/typography';

// Types
export type * from './types/animations';

// Theme utilities
export { _getThemeColors as getThemeColors } from './theme/colors';

// Motion wrappers
export { MotionButton, MotionDetails, MotionDiv, MotionH2, MotionP } from './utils/Motion';

