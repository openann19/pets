/**
 * API Client for Mobile App
 * 
 * HTTP client wrapper using axios with JWT token handling,
 * error interceptors, and base URL configuration.
 */

import { logger } from '@pawfectmatch/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios, { AxiosHeaders } from 'axios';

const envApiBaseUrl = process.env['EXPO_PUBLIC_API_URL'];
const API_BASE_URL = typeof envApiBaseUrl === 'string' && envApiBaseUrl.trim().length > 0
    ? envApiBaseUrl
    : 'http://localhost:3001/api';

interface ApiClientConfig {
    baseURL: string;
    timeout?: number;
}

class ApiClient {
    private readonly instance: AxiosInstance;
    private token: string | null = null;

    constructor(config: ApiClientConfig) {
        this.instance = axios.create({
            baseURL: config.baseURL,
            timeout: config.timeout ?? 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
        void this.loadToken();
    }

    /**
     * Load JWT token from AsyncStorage
     */
    private async loadToken(): Promise<void> {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (token !== null) {
                this.token = token;
            }
        } catch (error: unknown) {
            logger.error('api-client.load-token.failed', { error });
        }
    }

    /**
     * Set JWT token for authenticated requests
     */
    public async setToken(token: string): Promise<void> {
        this.token = token;
        try {
            await AsyncStorage.setItem('authToken', token);
        } catch (error: unknown) {
            logger.error('api-client.save-token.failed', { error });
        }
    }

    /**
     * Clear JWT token (logout)
     */
    public async clearToken(): Promise<void> {
        this.token = null;
        try {
            await AsyncStorage.removeItem('authToken');
        } catch (error: unknown) {
            logger.error('api-client.clear-token.failed', { error });
        }
    }

    /**
     * Setup axios interceptors
     */
    private setupInterceptors(): void {
        // Request interceptor - add auth token
        this.instance.interceptors.request.use(
            (config) => {
                if (this.token !== null) {
                    const token = this.token;
                    const headers = new AxiosHeaders(config.headers);
                    headers.set('Authorization', `Bearer ${token}`);
                    config.headers = headers;
                }
                return config;
            },
            (error: unknown) => {
                const reason = error instanceof Error ? error : new Error('Request interceptor rejected');
                return Promise.reject(reason);
            }
        );

        // Response interceptor - handle errors
        this.instance.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                if (error.response !== undefined) {
                    const { status, data } = error.response;

                    if (status === 401) {
                        await this.clearToken();
                        logger.warn('api-client.unauthorized', { status });
                    } else if (status === 403) {
                        logger.error('api-client.forbidden', { status, data });
                    } else if (status === 500) {
                        logger.error('api-client.server-error', { status, data });
                    } else {
                        logger.error('api-client.http-error', { status, data });
                    }
                } else if (error.request !== undefined) {
                    logger.error('api-client.network-error', { message: error.message });
                } else {
                    logger.error('api-client.request-setup-error', { message: error.message });
                }

                const reason = error instanceof Error ? error : new Error('API request failed');
                return Promise.reject(reason);
            }
        );
    }

    /**
     * GET request
     */
    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.instance.get(url, config);
        return response.data;
    }

    /**
     * POST request
     */
    public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.instance.post(url, data, config);
        return response.data;
    }

    /**
     * PUT request
     */
    public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.instance.put(url, data, config);
        return response.data;
    }

    /**
     * PATCH request
     */
    public async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.instance.patch(url, data, config);
        return response.data;
    }

    /**
     * DELETE request
     */
    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.instance.delete(url, config);
        return response.data;
    }

    /**
     * Get axios instance for advanced usage
     */
    public getAxiosInstance(): AxiosInstance {
        return this.instance;
    }
}

// Create and export singleton instance
const apiClient = new ApiClient({
    baseURL: API_BASE_URL,
    timeout: 30000,
});

export default apiClient;
export { ApiClient };
export type { ApiClientConfig };

