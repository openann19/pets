import axios from 'axios';
import { getItemSync, removeItemSync } from '../utils/storage';
class ApiClient {
    client;
    constructor() {
        this.client = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5001/api',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.setupInterceptors();
    }
    setupInterceptors() {
        // Request interceptor to add auth token
        this.client.interceptors.request.use((config) => {
            const token = getItemSync('accessToken');
            if (token != null && token !== '') {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error) => {
            return Promise.reject(error instanceof Error ? error : new Error('Request failed'));
        });
        // Response interceptor for error handling
        this.client.interceptors.response.use((response) => response, (error) => {
            if (error instanceof Error && 'response' in error &&
                typeof error.response?.status === 'number' &&
                error.response.status === 401) {
                // Handle token refresh or logout
                removeItemSync('accessToken');
                removeItemSync('refreshToken');
                // Only redirect on web platform
                if (typeof window !== 'undefined' && 'location' in window) {
                    window.location.href = '/login';
                }
            }
            return Promise.reject(error instanceof Error ? error : new Error(String(error)));
        });
    }
    // Generic request methods
    async get(url, config) {
        try {
            const response = await this.client.get(url, config);
            return response.data;
        }
        catch (error) {
            let errorMessage = 'Request failed';
            if (error instanceof Error) {
                const axiosError = error;
                errorMessage = axiosError.response?.data?.message ?? error.message ?? 'Request failed';
            }
            throw new Error(errorMessage);
        }
    }
    async post(url, data, config) {
        try {
            const response = await this.client.post(url, data, config);
            return response.data;
        }
        catch (error) {
            let errorMessage = 'Request failed';
            if (error instanceof Error) {
                const axiosError = error;
                errorMessage = axiosError.response?.data?.message ?? error.message ?? 'Request failed';
            }
            throw new Error(errorMessage);
        }
    }
    async put(url, data, config) {
        try {
            const response = await this.client.put(url, data, config);
            return response.data;
        }
        catch (error) {
            let errorMessage = 'Request failed';
            if (error instanceof Error) {
                const axiosError = error;
                errorMessage = axiosError.response?.data?.message ?? error.message ?? 'Request failed';
            }
            throw new Error(errorMessage);
        }
    }
    async patch(url, data, config) {
        try {
            const response = await this.client.patch(url, data, config);
            return response.data;
        }
        catch (error) {
            let errorMessage = 'Request failed';
            if (error instanceof Error) {
                const axiosError = error;
                errorMessage = axiosError.response?.data?.message ?? error.message ?? 'Request failed';
            }
            throw new Error(errorMessage);
        }
    }
    async delete(url, config) {
        try {
            const response = await this.client.delete(url, config);
            return response.data;
        }
        catch (error) {
            let errorMessage = 'Request failed';
            if (error instanceof Error) {
                const axiosError = error;
                errorMessage = axiosError.response?.data?.message ?? error.message ?? 'Request failed';
            }
            throw new Error(errorMessage);
        }
    }
    // File upload helper
    async uploadFile(url, file, additionalData) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (additionalData) {
                Object.entries(additionalData).forEach(([key, value]) => {
                    if (value instanceof Blob) {
                        formData.append(key, value);
                    }
                    else if (value != null) {
                        formData.append(key, String(value));
                    }
                    else {
                        formData.append(key, '');
                    }
                });
            }
            const response = await this.client.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        }
        catch (error) {
            const axiosError = error;
            throw new Error(axiosError.response?.data?.message ?? axiosError.message ?? 'Upload failed');
        }
    }
}
// Create and export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
