/**
 * Secure API Service with SSL Pinning for PawfectMatch Mobile App
 * Provides certificate pinning and secure HTTP communication
 */
import { fetch as sslFetch } from 'react-native-ssl-pinning';
import { logger } from '../services/logger';

const BASE_URL = process.env['EXPO_PUBLIC_API_URL'] || (__DEV__ ? 'http://localhost:3001/api' : 'https://api.pawfectmatch.com/api');

// Certificate fingerprints for SSL pinning
// In production, these should be obtained from your server certificates
const SSL_CERTIFICATES = {
  // Example certificate fingerprints (replace with your actual certificates)
  'api.pawfectmatch.com': [
    {
      algorithm: 'sha256',
      value: 'PLACEHOLDER_CERTIFICATE_FINGERPRINT_SHA256'
    },
    {
      algorithm: 'sha1',
      value: 'PLACEHOLDER_CERTIFICATE_FINGERPRINT_SHA1'
    }
  ],
  // Development certificates
  'localhost': [
    // Development certificates - in production, remove localhost
  ]
};

interface SSLConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

class SecureAPIService {
  private static instance: SecureAPIService;
  private authToken: string | null = null;

  private constructor() { }

  static getInstance(): SecureAPIService {
    if (!SecureAPIService.instance) {
      SecureAPIService.instance = new SecureAPIService();
    }
    return SecureAPIService.instance;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  /**
   * Get SSL configuration for a domain
   */
  private getSSLConfig(domain: string): any {
    const certs = SSL_CERTIFICATES[domain as keyof typeof SSL_CERTIFICATES];
    if (!certs || certs.length === 0) {
      // In development, allow untrusted certificates
      if (__DEV__) {
        return {
          sslPinning: {
            certs: 'public'
          }
        };
      }
      throw new Error(`No SSL certificates configured for domain: ${domain}`);
    }

    return {
      sslPinning: {
        certs: certs
      }
    };
  }

  /**
   * Make a secure HTTP request with SSL pinning
   */
  async request<T = any>(
    endpoint: string,
    options: RequestInit & SSLConfig = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const domain = new URL(url).hostname;

    const {
      timeout = 30000,
      retries = 3,
      retryDelay = 1000,
      ...fetchOptions
    } = options;

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((fetchOptions.headers as Record<string, string>) || {}),
    };

    // Add auth token if available
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    // SSL pinning configuration
    const sslConfig = this.getSSLConfig(domain);

    const requestConfig = {
      method: (fetchOptions.method as string) || 'GET',
      headers,
      body: (fetchOptions.body ?? null) as any,
      timeoutInterval: timeout,
      ...sslConfig,
    };

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        logger.debug(`Secure API request attempt ${attempt + 1}/${retries}`, {
          url,
          method: requestConfig.method
        });

        const response = await sslFetch(url, requestConfig);
        const status = (response as any).status as number;
        const ok = status >= 200 && status < 300;
        if (!ok) {
          const statusText = (response as any).statusText ?? '';
          throw new Error(`HTTP ${status}: ${statusText}`);
        }

        const data = await (response as any).json();
        logger.debug('Secure API request successful', { url, status: response.status });

        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        logger.warn(`Secure API request attempt ${attempt + 1} failed`, {
          url,
          error: lastError.message,
          attempt: attempt + 1,
          maxRetries: retries
        });

        // If not the last attempt, wait before retrying
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    // All retries failed
    logger.error('Secure API request failed after all retries', {
      url,
      error: lastError?.message,
      retries
    });

    throw new SecureAPIError(
      `Request failed after ${retries} attempts: ${lastError?.message}`,
      lastError ?? undefined
    );
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, config?: SSLConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any, config?: SSLConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...(config || {}),
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
    } as RequestInit & SSLConfig);
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any, config?: SSLConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...(config || {}),
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
    } as RequestInit & SSLConfig);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, config?: SSLConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * Check SSL certificate validity
   */
  async validateCertificate(domain: string): Promise<boolean> {
    try {
      const sslConfig = this.getSSLConfig(domain);
      // Perform a test request to validate SSL pinning
      await sslFetch(`https://${domain}`, {
        method: 'HEAD',
        timeoutInterval: 5000,
        ...sslConfig,
      });
      return true;
    } catch (error) {
      logger.error('SSL certificate validation failed', { domain, error });
      return false;
    }
  }

  /**
   * Get security metrics
   */
  getSecurityMetrics(): {
    sslEnabled: boolean;
    certificatePinning: boolean;
    supportedDomains: string[];
  } {
    return {
      sslEnabled: true,
      certificatePinning: true,
      supportedDomains: Object.keys(SSL_CERTIFICATES),
    };
  }
}

/**
 * Custom error class for secure API errors
 */
export class SecureAPIError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'SecureAPIError';
  }
}

// Export singleton instance
export const secureAPI = SecureAPIService.getInstance();

// Export types
export type { SSLConfig };
export default secureAPI;
