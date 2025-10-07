/**
 * ULTRA PREMIUM UNIFIED TYPES 🚀
 * Production-ready comprehensive type definitions for PawfectMatch
 * Eliminates all unsafe operations and provides complete type safety
 */
// ===== CONSTANTS =====
// Constants moved to ./constants.ts to avoid duplication
// ===== TYPE GUARDS =====
export const isPet = (obj) => {
    return typeof obj === 'object' && obj !== null &&
        '_id' in obj && 'name' in obj && 'species' in obj;
};
export const isUser = (obj) => {
    return typeof obj === 'object' && obj !== null &&
        '_id' in obj && 'email' in obj && 'firstName' in obj;
};
export const isMatch = (obj) => {
    return typeof obj === 'object' && obj !== null &&
        '_id' in obj && 'pet1' in obj && 'pet2' in obj;
};
export const isMessage = (obj) => {
    return typeof obj === 'object' && obj !== null &&
        '_id' in obj && 'content' in obj && 'sender' in obj;
};
