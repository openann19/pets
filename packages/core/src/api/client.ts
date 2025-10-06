import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

export interface ApiClientResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api',
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
        if (token != null && token !== '') {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: Error) => {
        return Promise.reject(error instanceof Error ? error : new Error('Request failed'));
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: unknown) => {
        if (error instanceof Error && 'response' in error && 
            typeof (error as { response?: { status?: number } }).response?.status === 'number' &&
            (error as { response: { status: number } }).response.status === 401) {
          // Handle token refresh or logout
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(error instanceof Error ? error : new Error(String(error)));
      }
    );
  }

  // Generic request methods
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>> {
    try {
      const response = await this.client.get<ApiClientResponse<T>>(url, config);
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Request failed';
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message ?? error.message ?? 'Request failed';
      }
      throw new Error(errorMessage);
    }
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>> {
    try {
      const response = await this.client.post<ApiClientResponse<T>>(url, data, config);
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Request failed';
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message ?? error.message ?? 'Request failed';
      }
      throw new Error(errorMessage);
    }
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>> {
    try {
      const response = await this.client.put<ApiClientResponse<T>>(url, data, config);
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Request failed';
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message ?? error.message ?? 'Request failed';
      }
      throw new Error(errorMessage);
    }
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>> {
    try {
      const response = await this.client.patch<ApiClientResponse<T>>(url, data, config);
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Request failed';
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message ?? error.message ?? 'Request failed';
      }
      throw new Error(errorMessage);
    }
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>> {
    try {
      const response = await this.client.delete<ApiClientResponse<T>>(url, config);
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Request failed';
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message ?? error.message ?? 'Request failed';
      }
      throw new Error(errorMessage);
    }
  }

  // File upload helper
  async uploadFile<T = unknown>(url: string, file: File, additionalData?: Record<string, unknown>): Promise<ApiClientResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          if (value instanceof Blob) {
            formData.append(key, value);
          } else if (value != null) {
            formData.append(key, String(value));
          } else {
            formData.append(key, '');
          }
        });
      }

      const response = await this.client.post<ApiClientResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(axiosError.response?.data?.message ?? axiosError.message ?? 'Upload failed');
    }
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
