/**
 * Cross-platform storage utility for React Native and Web
 * Provides a unified interface for localStorage (web) and AsyncStorage (React Native)
 */
declare class CrossPlatformStorage {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
}
export declare const storage: CrossPlatformStorage;
export declare const getItemSync: (key: string) => string | null;
export declare const setItemSync: (key: string, value: string) => void;
export declare const removeItemSync: (key: string) => void;
export default storage;
//# sourceMappingURL=storage.d.ts.map