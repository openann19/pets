/**
 * Core API Client for PawfectMatch
 * Provides typed HTTP client with proper error handling and response types
 */

import type { ApiResponse, ApiService } from './types';

class ApiClient implements ApiService {
  private baseURL: string;
  private readonly defaultHeaders: Record<string, string>;

  constructor(baseURL = 'http://localhost:5001') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(fullUrl, config);
      const data = await response.json() as Record<string, unknown>;

      if (!response.ok) {
        return {
          success: false,
          error: (data.message as string) ?? `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      return {
        success: true,
        data: (data.data as T) ?? (data as T),
        message: data.message as string,
        status: response.status,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage,
        status: 0,
      };
    }
  }

  async get<T>(url: string, config?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  async post<T>(url: string, data?: unknown, config?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: data != null ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: unknown, config?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: data != null ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string, config?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  async patch<T>(url: string, data?: unknown, config?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: data != null ? JSON.stringify(data) : undefined,
    });
  }

  setAuthToken(token: string): void {
    this.defaultHeaders.Authorization = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.defaultHeaders.Authorization;
  }

  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }
}

// Create and export the default API client instance
export const apiClient = new ApiClient();

// Export the class for creating custom instances
export { ApiClient };
