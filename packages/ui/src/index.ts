// Core components
export * from './components/Button';
export * from './components/Card';
export * from './components/Input';
export * from './components/Textarea';
export * from './components/Badge';
export * from './components/Avatar';
export * from './components/Dialog';

// Premium components
export * from './components/Premium/PremiumButton';
export * from './components/Premium/PremiumCard';
export * from './components/Premium/PremiumInput';

// Modern UI/UX Components (2025)
export * from './components/DarkModeToggle/DarkModeToggle';
export * from './components/PremiumFeatures/PremiumFeaturesModal';

// AI-Powered Features
export * from './components/AIFeatures/PersonalizedRecommendations';
export * from './components/AIFeatures/VoiceInteraction';
export * from './components/AIFeatures/GestureInteraction';

// Hooks
export * from './hooks/useTheme';
export * from './hooks/useAnimation';
export * from './hooks/useMediaQuery';
export * from './hooks/usePremiumAnimations';

// Design system
export * from './theme/design-system';
export * from './theme/colors';
export * from './theme/typography';
export * from './theme/animations';

// Types
export type * from './types/animations';

// Theme utilities
export { _getThemeColors as getThemeColors } from './theme/colors';
