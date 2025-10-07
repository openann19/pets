/**
 * Throttle utility
 * Throttles function calls
 */
export declare const throttle: <T extends (...args: any[]) => any>(func: T, limit: number) => ((...args: Parameters<T>) => void);
//# sourceMappingURL=throttle.d.ts.map