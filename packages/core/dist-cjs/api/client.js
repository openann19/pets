"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = void 0;
const axios_1 = __importDefault(require("axios"));
class ApiClient {
    client;
    constructor() {
        this.client = axios_1.default.create({
            baseURL: process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:5000/api',
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
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
        // Response interceptor for error handling
        this.client.interceptors.response.use((response) => response, (error) => {
            if (error.response?.status === 401) {
                // Handle token refresh or logout
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        });
    }
    // Generic request methods with proper error handling
    async get(url, config) {
        try {
            const response = await this.client.get(url, config);
            return response.data;
        }
        catch (error) {
            const apiError = error;
            throw new Error(apiError.response?.data?.message || apiError.message || 'Request failed');
        }
    }
    async post(url, data, config) {
        try {
            const response = await this.client.post(url, data, config);
            return response.data;
        }
        catch (error) {
            const apiError = error;
            throw new Error(apiError.response?.data?.message || apiError.message || 'Request failed');
        }
    }
    async put(url, data, config) {
        try {
            const response = await this.client.put(url, data, config);
            return response.data;
        }
        catch (error) {
            const apiError = error;
            throw new Error(apiError.response?.data?.message || apiError.message || 'Request failed');
        }
    }
    async patch(url, data, config) {
        try {
            const response = await this.client.patch(url, data, config);
            return response.data;
        }
        catch (error) {
            const apiError = error;
            throw new Error(apiError.response?.data?.message || apiError.message || 'Request failed');
        }
    }
    async delete(url, config) {
        try {
            const response = await this.client.delete(url, config);
            return response.data;
        }
        catch (error) {
            const apiError = error;
            throw new Error(apiError.response?.data?.message || apiError.message || 'Request failed');
        }
    }
    // File upload helper with proper typing
    async uploadFile(url, config) {
        try {
            const formData = new FormData();
            formData.append('file', config.file);
            if (config.additionalData) {
                Object.entries(config.additionalData).forEach(([key, value]) => {
                    formData.append(key, String(value));
                });
            }
            const axiosConfig = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };
            if (config.onProgress) {
                axiosConfig.onUploadProgress = (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        config.onProgress(progress);
                    }
                };
            }
            const response = await this.client.post(url, formData, axiosConfig);
            return response.data;
        }
        catch (error) {
            const apiError = error;
            throw new Error(apiError.response?.data?.message || apiError.message || 'Upload failed');
        }
    }
}
// Create and export singleton instance
exports.apiClient = new ApiClient();
exports.default = exports.apiClient;
