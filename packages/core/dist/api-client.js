/**
 * Core API Client for PawfectMatch
 * Provides typed HTTP client with proper error handling and response types
 */
class ApiClient {
    baseURL;
    defaultHeaders;
    constructor(baseURL = 'http://localhost:5001') {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }
    async request(url, options = {}) {
        const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
        const config = {
            ...options,
            headers: {
                ...this.defaultHeaders,
                ...options.headers,
            },
        };
        try {
            const response = await fetch(fullUrl, config);
            const data = await response.json();
            if (!response.ok) {
                return {
                    success: false,
                    error: data.message ?? `HTTP ${response.status}: ${response.statusText}`,
                    status: response.status,
                };
            }
            return {
                success: true,
                data: data.data ?? data,
                message: data.message,
                status: response.status,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                success: false,
                error: errorMessage,
                status: 0,
            };
        }
    }
    async get(url, config) {
        return this.request(url, { ...config, method: 'GET' });
    }
    async post(url, data, config) {
        return this.request(url, {
            ...config,
            method: 'POST',
            body: data != null ? JSON.stringify(data) : undefined,
        });
    }
    async put(url, data, config) {
        return this.request(url, {
            ...config,
            method: 'PUT',
            body: data != null ? JSON.stringify(data) : undefined,
        });
    }
    async delete(url, config) {
        return this.request(url, { ...config, method: 'DELETE' });
    }
    async patch(url, data, config) {
        return this.request(url, {
            ...config,
            method: 'PATCH',
            body: data != null ? JSON.stringify(data) : undefined,
        });
    }
    setAuthToken(token) {
        this.defaultHeaders.Authorization = `Bearer ${token}`;
    }
    removeAuthToken() {
        delete this.defaultHeaders.Authorization;
    }
    setBaseURL(baseURL) {
        this.baseURL = baseURL;
    }
}
// Create and export the default API client instance
export const apiClient = new ApiClient();
// Export the class for creating custom instances
export { ApiClient };
