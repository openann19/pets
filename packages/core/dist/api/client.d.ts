import { type AxiosRequestConfig } from 'axios';
export interface ApiClientResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
declare class ApiClient {
    private readonly client;
    constructor();
    private setupInterceptors;
    get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>>;
    post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>>;
    put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>>;
    patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>>;
    delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>>;
    uploadFile<T = unknown>(url: string, file: File, additionalData?: Record<string, unknown>): Promise<ApiClientResponse<T>>;
}
export declare const apiClient: ApiClient;
export default apiClient;
//# sourceMappingURL=client.d.ts.map