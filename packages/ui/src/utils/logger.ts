/**
 * Simple logger utility for UI components
 */

export interface Logger {
    debug: (message: string, ...args: unknown[]) => void;
    info: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
    error: (message: string, ...args: unknown[]) => void;
}

// Default logger implementation
export const logger: Logger = {
    debug: (message: string, ...args: unknown[]) => {
        if (typeof window !== 'undefined' && window.localStorage?.getItem('debug') === 'true') {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    },
    info: (message: string, ...args: unknown[]) => {
        console.info(`[INFO] ${message}`, ...args);
    },
    warn: (message: string, ...args: unknown[]) => {
        console.warn(`[WARN] ${message}`, ...args);
    },
    error: (message: string, ...args: unknown[]) => {
        console.error(`[ERROR] ${message}`, ...args);
    }
};

export default logger;