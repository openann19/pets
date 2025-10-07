/**
 * Core API Client for PawfectMatch
 * Provides typed HTTP client with proper error handling and response types
 */
import type { ApiResponse, ApiService } from './types';
declare class ApiClient implements ApiService {
    private baseURL;
    private readonly defaultHeaders;
    constructor(baseURL?: string);
    private request;
    get<T>(url: string, config?: RequestInit): Promise<ApiResponse<T>>;
    post<T>(url: string, data?: unknown, config?: RequestInit): Promise<ApiResponse<T>>;
    put<T>(url: string, data?: unknown, config?: RequestInit): Promise<ApiResponse<T>>;
    delete<T>(url: string, config?: RequestInit): Promise<ApiResponse<T>>;
    patch<T>(url: string, data?: unknown, config?: RequestInit): Promise<ApiResponse<T>>;
    setAuthToken(token: string): void;
    removeAuthToken(): void;
    setBaseURL(baseURL: string): void;
}
export declare const apiClient: ApiClient;
export { ApiClient };
//# sourceMappingURL=api-client.d.ts.map