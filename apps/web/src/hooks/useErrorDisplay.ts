/**
 * 🎯 ERROR DISPLAY HOOK
 * Automatically displays user-friendly error messages using toast notifications
 * Integrates with ApiError classification system
 */

import { useToast } from '@/components/ui/toast';
import { ApiError } from '@/services/api';
import { useCallback } from 'react';

export interface ErrorDisplayOptions {
    /** Show success message on recovery */
    showRecovery?: boolean;
    /** Custom error message override */
    customMessage?: string;
    /** Context for logging */
    context?: Record<string, unknown>;
    /** Callback after error displayed */
    onError?: (error: ApiError) => void;
}

/**
 * Hook to display errors with user-friendly messages
 */
export function useErrorDisplay() {
    const toast = useToast();

    const displayError = useCallback(
        (error: unknown, options: ErrorDisplayOptions = {}) => {
            // Normalize error
            let apiError: ApiError;

            if (error instanceof ApiError) {
                apiError = error;
            } else if (error instanceof Error) {
                apiError = new ApiError(500, error.message);
            } else if (typeof error === 'string') {
                apiError = new ApiError(500, error);
            } else {
                apiError = new ApiError(500, 'An unexpected error occurred');
            }

            // Get user-friendly message
            const message = options.customMessage ?? apiError.getUserFriendlyMessage();

            // Display toast based on severity
            switch (apiError.severity) {
                case 'critical':
                case 'high':
                    toast.error('Error', message);
                    break;
                case 'medium':
                    toast.error('Error', message);
                    break;
                case 'low':
                    toast.warning('Notice', message);
                    break;
            }

            // Log to console in development
            if (process.env.NODE_ENV === 'development') {
                console.error('[Error Display]', apiError.toJSON(), options.context);
            }

            // Call custom error handler
            options.onError?.(apiError);

            return apiError;
        },
        [toast],
    );

    const displaySuccess = useCallback(
        (title: string, message: string) => {
            toast.success(title, message);
        },
        [toast],
    );

    return {
        displayError,
        displaySuccess,
    };
}
