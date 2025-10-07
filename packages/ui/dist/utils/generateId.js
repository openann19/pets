/**
 * Generate ID utility
 * Generates unique IDs for components
 */
export const generateId = (prefix = 'id') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};
//# sourceMappingURL=generateId.js.map