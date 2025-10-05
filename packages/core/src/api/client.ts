import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ApiClientResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
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

  // Generic request methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>> {
    try {
      const response = await this.client.get<ApiClientResponse<T>>(url, config);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Request failed');
    }
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>> {
    try {
      const response = await this.client.post<ApiClientResponse<T>>(url, data, config);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Request failed');
    }
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>> {
    try {
      const response = await this.client.put<ApiClientResponse<T>>(url, data, config);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Request failed');
    }
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>> {
    try {
      const response = await this.client.patch<ApiClientResponse<T>>(url, data, config);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Request failed');
    }
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>> {
    try {
      const response = await this.client.delete<ApiClientResponse<T>>(url, config);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Request failed');
    }
  }

  // File upload helper
  async uploadFile<T = any>(url: string, file: File, additionalData?: Record<string, any>): Promise<ApiClientResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const response = await this.client.post<ApiClientResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Upload failed');
    }
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
