/**
 * PawfectMatch Core - Shared Business Logic
 * Rule II.1: Pure, platform-agnostic TypeScript logic
 * Shared between web (React) and mobile (React Native)
 */
// Export all types
export * from './schemas';
export * from './types';
// Export utility functions
export * from './utils';
// Export global state stores
export * from './stores';
// Export services
export * from './services';
// Export API client and hooks
export * from './api';
export * from './hooks';
// Version
export const VERSION = '1.0.0';
