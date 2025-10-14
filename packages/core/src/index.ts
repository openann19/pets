/**
 * PawfectMatch Core - Shared Business Logic
 * Rule II.1: Pure, platform-agnostic TypeScript logic
 * Shared between web (React) and mobile (React Native)
 */

// Export all types
export * from './schemas';
export * from './types';

// Export animation configuration
export { animationConfig, useAnimationConfig } from './services/animationConfig';
export * from './types/animations';

// Export utility functions
export * from './utils';

// Export global state stores
export * from './stores';

// Export services (logger from utils only to avoid conflicts)
export { AccountService } from './services/AccountService';
// errorHandler is available via direct import
// errorHandler is available via direct import

// Export API client and hooks
export * from './api';
export * from './hooks';

// Export mappers
export * from './mappers';

// Version
export const _VERSION = '1.0.0';
