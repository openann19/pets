/**
 * API Client for Mobile App
 * 
 * HTTP client wrapper using axios with JWT token handling,
 * error interceptors, and base URL configuration.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

const API_BASE_URL = process.env['EXPO_PUBLIC_API_URL'] || 'http://localhost:3001/api';

interface ApiClientConfig {
    baseURL: string;
    timeout?: number;
}

class ApiClient {
    private instance: AxiosInstance;
    private token: string | null = null;

    constructor(config: ApiClientConfig) {
        this.instance = axios.create({
            baseURL: config.baseURL,
            timeout: config.timeout || 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
        this.loadToken();
    }

    /**
     * Load JWT token from AsyncStorage
     */
    private async loadToken(): Promise<void> {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
                this.token = token;
            }
        } catch (error) {
            console.error('Failed to load auth token:', error);
        }
    }

    /**
     * Set JWT token for authenticated requests
     */
    public async setToken(token: string): Promise<void> {
        this.token = token;
        try {
            await AsyncStorage.setItem('authToken', token);
        } catch (error) {
            console.error('Failed to save auth token:', error);
        }
    }

    /**
     * Clear JWT token (logout)
     */
    public async clearToken(): Promise<void> {
        this.token = null;
        try {
            await AsyncStorage.removeItem('authToken');
        } catch (error) {
            console.error('Failed to clear auth token:', error);
        }
    }

    /**
     * Setup axios interceptors
     */
    private setupInterceptors(): void {
        // Request interceptor - add auth token
        this.instance.interceptors.request.use(
            (config) => {
                if (this.token) {
                    config.headers.Authorization = `Bearer ${this.token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor - handle errors
        this.instance.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                if (error.response) {
                    // Server responded with error status
                    const { status } = error.response;

                    if (status === 401) {
                        // Unauthorized - clear token and redirect to login
                        await this.clearToken();
                        // You can emit an event here to notify app to navigate to login
                    } else if (status === 403) {
                        // Forbidden
                        console.error('Access forbidden:', error.response.data);
                    } else if (status === 500) {
                        // Server error
                        console.error('Server error:', error.response.data);
                    }
                } else if (error.request) {
                    // Request made but no response received
                    console.error('Network error - no response:', error.message);
                } else {
                    // Something else happened
                    console.error('Request setup error:', error.message);
                }

                return Promise.reject(error);
            }
        );
    }

    /**
     * GET request
     */
    public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.instance.get(url, config);
        return response.data;
    }

    /**
     * POST request
     */
    public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.instance.post(url, data, config);
        return response.data;
    }

    /**
     * PUT request
     */
    public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.instance.put(url, data, config);
        return response.data;
    }

    /**
     * PATCH request
     */
    public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.instance.patch(url, data, config);
        return response.data;
    }

    /**
     * DELETE request
     */
    public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
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

