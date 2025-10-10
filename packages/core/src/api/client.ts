import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Generic API response wrapper
export interface ApiClientResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Error response structure
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  statusCode?: number;
}

// Request configuration types
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

// File upload configuration
export interface FileUploadConfig {
  file: File;
  additionalData?: Record<string, string | number | boolean>;
  onProgress?: (progress: number) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle token refresh or logout
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request methods with proper error handling
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>> {
    try {
      const response = await this.client.get<ApiClientResponse<T>>(url, config);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(apiError.response?.data?.message || apiError.message || 'Request failed');
    }
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>> {
    try {
      const response = await this.client.post<ApiClientResponse<T>>(url, data, config);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(apiError.response?.data?.message || apiError.message || 'Request failed');
    }
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>> {
    try {
      const response = await this.client.put<ApiClientResponse<T>>(url, data, config);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(apiError.response?.data?.message || apiError.message || 'Request failed');
    }
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>> {
    try {
      const response = await this.client.patch<ApiClientResponse<T>>(url, data, config);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(apiError.response?.data?.message || apiError.message || 'Request failed');
    }
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>> {
    try {
      const response = await this.client.delete<ApiClientResponse<T>>(url, config);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(apiError.response?.data?.message || apiError.message || 'Request failed');
    }
  }

  // File upload helper with proper typing
  async uploadFile<T = unknown>(
    url: string, 
    config: FileUploadConfig
  ): Promise<ApiClientResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', config.file);

      if (config.additionalData) {
        Object.entries(config.additionalData).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
      }

      const axiosConfig: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      
      if (config.onProgress) {
        axiosConfig.onUploadProgress = (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            config.onProgress!(progress);
          }
        };
      }

      const response = await this.client.post<ApiClientResponse<T>>(url, formData, axiosConfig);

      return response.data as ApiClientResponse<T>;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(apiError.response?.data?.message || apiError.message || 'Upload failed');
    }
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
