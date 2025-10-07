/**
 * Debounce utility
 * Debounces function calls
 */
export const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
//# sourceMappingURL=debounce.js.map