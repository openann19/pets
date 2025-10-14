/**
 * CSRF Token Provider
 * 
 * Client-side utilities for CSRF token management
 * Automatically includes CSRF tokens in API requests
 */

'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface CsrfContextType {
    token: string | null;
    refreshToken: () => Promise<void>;
    isLoading: boolean;
}

const CsrfContext = createContext<CsrfContextType>({
    token: null,
    refreshToken: async () => { },
    isLoading: true,
});

/**
 * Extract CSRF token from cookies
 */
function getCsrfTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find((cookie) => cookie.trim().startsWith('csrf-token='));

    if (!csrfCookie) return null;

    return csrfCookie.split('=')[1]?.trim() || null;
}

/**
 * Fetch fresh CSRF token from server
 */
async function fetchCsrfToken(): Promise<string | null> {
    try {
        // Make a GET request to any API endpoint to trigger CSRF cookie generation
        const response = await fetch('/api/auth/csrf', {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            console.warn('[CSRF] Failed to fetch token:', response.status);
            return null;
        }

        // Token should now be in cookies
        return getCsrfTokenFromCookie();
    } catch (error) {
        console.error('[CSRF] Error fetching token:', error);
        return null;
    }
}

/**
 * CSRF Token Provider Component
 */
export function CsrfProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshToken = useCallback(async () => {
        setIsLoading(true);

        // First try to get token from existing cookie
        let csrfToken = getCsrfTokenFromCookie();

        // If no token, fetch from server
        if (!csrfToken) {
            csrfToken = await fetchCsrfToken();
        }

        setToken(csrfToken);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        refreshToken();
    }, [refreshToken]);

    return (
        <CsrfContext.Provider value={{ token, refreshToken, isLoading }}>
            {children}
        </CsrfContext.Provider>
    );
}

/**
 * Hook to access CSRF token
 * 
 * @example
 * const { token, refreshToken } = useCsrfToken();
 * 
 * fetch('/api/endpoint', {
 *   method: 'POST',
 *   headers: {
 *     'x-csrf-token': token || '',
 *   },
 * });
 */
export function useCsrfToken() {
    const context = useContext(CsrfContext);

    if (!context) {
        throw new Error('useCsrfToken must be used within CsrfProvider');
    }

    return context;
}

/**
 * Higher-order function to wrap fetch with CSRF token
 * 
 * @example
 * const csrfFetch = withCsrfToken(fetch);
 * await csrfFetch('/api/endpoint', { method: 'POST' });
 */
export function withCsrfToken(fetchFn: typeof fetch): typeof fetch {
    return async (input: RequestInfo | URL, init?: RequestInit) => {
        const token = getCsrfTokenFromCookie();

        if (!token) {
            console.warn('[CSRF] No token available for request');
        }

        const headers = new Headers(init?.headers);

        // Add CSRF token header if making state-changing request
        const method = init?.method?.toUpperCase() || 'GET';
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && token) {
            headers.set('x-csrf-token', token);
        }

        return fetchFn(input, {
            ...init,
            headers,
            credentials: init?.credentials || 'include', // Ensure cookies are sent
        });
    };
}

/**
 * Get CSRF token header for manual requests
 * 
 * @example
 * const headers = getCsrfHeaders();
 * await fetch('/api/endpoint', {
 *   method: 'POST',
 *   headers,
 * });
 */
export function getCsrfHeaders(): Record<string, string> {
    const token = getCsrfTokenFromCookie();

    if (!token) {
        console.warn('[CSRF] No CSRF token available');
        return {};
    }

    return {
        'x-csrf-token': token,
    };
}
