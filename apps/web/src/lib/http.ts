/**
 * Typed HTTP Client
 * Centralized fetch wrapper with timeouts, retries, CSRF, and runtime validation
 */

import { z } from 'zod';

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  validateStatus?: (status: number) => boolean;
}

interface HttpClientOptions {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

class HttpClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetries: number;
  private defaultHeaders: Record<string, string>;

  constructor(options: HttpClientOptions = {}) {
    this.baseURL = options.baseURL || '';
    this.defaultTimeout = options.timeout || 30000;
    this.defaultRetries = options.retries || 0;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  /**
   * Set CSRF token from cookie or header
   */
  private getCsrfToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    // Try to get from cookie
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if ((key === 'csrf-token' || key === 'XSRF-TOKEN') && typeof value === 'string' && value.length > 0) {
        return decodeURIComponent(value);
      }
    }
    
    return null;
  }

  /**
   * Normalize different HeadersInit shapes to a plain object
   */
  private normalizeHeaders(init?: HeadersInit): Record<string, string> {
    if (!init) return {};
    if (typeof Headers !== 'undefined' && init instanceof Headers) {
      return Object.fromEntries(init.entries());
    }
    if (Array.isArray(init)) {
      return Object.fromEntries(init);
    }
    return init as Record<string, string>;
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: FetchOptions
  ): Promise<Response> {
    const timeout = options.timeout || this.defaultTimeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Fetch with retries for idempotent requests
   */
  private async fetchWithRetries(
    url: string,
    options: FetchOptions
  ): Promise<Response> {
    const retries = options.retries ?? this.defaultRetries;
    const retryDelay = options.retryDelay || 1000;
    const isIdempotent = !options.method || ['GET', 'HEAD', 'OPTIONS'].includes(options.method);

    let lastError: Error | null = null;
    const attempts = isIdempotent ? retries + 1 : 1;

    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, options);
        
        // Check if we should retry based on status
        const shouldRetry = isIdempotent && 
                           attempt < attempts - 1 && 
                           (response.status === 429 || response.status >= 500);
        
        if (shouldRetry) {
          const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        return response;
      } catch (error) {
        lastError = error as Error;
        if (attempt < attempts - 1 && isIdempotent) {
          const delay = retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }

    throw lastError || new Error('Request failed');
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    url: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    // Get CSRF token for state-changing operations
    const csrfToken = this.getCsrfToken();
    
    const headersObj: Record<string, string> = {
      ...this.defaultHeaders,
      ...this.normalizeHeaders(options.headers),
    };

    // Add CSRF token for non-GET requests
    if (csrfToken && options.method && !['GET', 'HEAD', 'OPTIONS'].includes(options.method)) {
      headersObj['X-CSRF-Token'] = csrfToken;
    }

    const fetchOptions: FetchOptions = {
      ...options,
      headers: headersObj,
      credentials: 'include', // Always send cookies
    };

    const response = await this.fetchWithRetries(fullURL, fetchOptions);

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new HttpError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    // Parse JSON response
    return response.json();
  }

  /**
   * Make request with Zod schema validation
   */
  async requestWithSchema<T>(
    url: string,
    schema: z.ZodSchema<T>,
    options: FetchOptions = {}
  ): Promise<T> {
    const data = await this.request<unknown>(url, options);
    
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Response validation failed', error.errors);
      }
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(url: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  /**
   * GET request with schema validation
   */
  async getWithSchema<T>(
    url: string,
    schema: z.ZodSchema<T>,
    options?: FetchOptions
  ): Promise<T> {
    return this.requestWithSchema(url, schema, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
    });
  }

  /**
   * POST request with schema validation
   */
  async postWithSchema<T>(
    url: string,
    schema: z.ZodSchema<T>,
    data?: unknown,
    options?: FetchOptions
  ): Promise<T> {
    return this.requestWithSchema(url, schema, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
    });
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}

/**
 * Custom HTTP Error
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/**
 * Validation Error
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: z.ZodIssue[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Export singleton instance
export const http = new HttpClient({
  baseURL: '',
  timeout: 30000,
  retries: 2,
});

export default http;
