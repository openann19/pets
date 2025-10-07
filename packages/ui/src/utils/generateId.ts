/**
 * Generate ID utility
 * Generates unique IDs for components
 */

export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};
