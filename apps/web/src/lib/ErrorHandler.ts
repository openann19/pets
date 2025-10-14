/**
 * Centralized Error Handler
 * 
 * Provides consistent error handling across the application with:
 * - Sentry integration for error tracking
 * - User-friendly error messages
 * - Context-aware logging
 * - Error normalization
 * 
 * @example
 * ```typescript
 * try {
 *   await api.fetchData();
 * } catch (error) {
 *   ErrorHandler.handle(error, {
 *     component: 'DataFetcher',
 *     action: 'fetchData',
 *     endpoint: '/api/data',
 *   });
 * }
 * ```
 */

import * as Sentry from '@sentry/nextjs';
import { toast } from 'sonner';

// ============================================================================
// Types
// ============================================================================

export interface ErrorContext {
    /** Component or module where error occurred */
    component: string;

    /** Action being performed when error occurred */
    action: string;

    /** API endpoint (if applicable) */
    endpoint?: string;

    /** User ID (if authenticated) */
    userId?: string;

    /** Additional metadata */
    metadata?: Record<string, unknown>;
}

export enum ErrorType {
    NETWORK_ERROR = 'NETWORK_ERROR',
    AUTH_ERROR = 'AUTH_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
    PERMISSION_ERROR = 'PERMISSION_ERROR',
    RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
    SERVER_ERROR = 'SERVER_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
    OFFLINE_ERROR = 'OFFLINE_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface NormalizedError {
    type: ErrorType;
    message: string;
    statusCode?: number;
    originalError: unknown;
    timestamp: Date;
}

// ============================================================================
// Error Handler Class
// ============================================================================

export class ErrorHandler {
    /**
     * Main error handling entry point
     */
    static handle(error: unknown, context: ErrorContext): void {
        const normalizedError = this.normalize(error);

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error Handler:', {
                error: normalizedError,
                context,
            });
        }

        // Log to Sentry with context
        this.logToSentry(normalizedError, context);

        // Show user-friendly notification
        this.showUserNotification(normalizedError, context);
    }

    /**
     * Normalize various error types into consistent format
     */
    private static normalize(error: unknown): NormalizedError {
        const timestamp = new Date();

        // Network/Fetch errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return {
                type: ErrorType.NETWORK_ERROR,
                message: 'Network connection failed',
                originalError: error,
                timestamp,
            };
        }

        // HTTP Response errors
        if (this.isHttpError(error)) {
            const statusCode = error.status || error.statusCode;

            if (statusCode === 401 || statusCode === 403) {
                return {
                    type: ErrorType.AUTH_ERROR,
                    message: error.message || 'Authentication failed',
                    ...(statusCode && { statusCode }),
                    originalError: error,
                    timestamp,
                };
            }

            if (statusCode === 404) {
                return {
                    type: ErrorType.NOT_FOUND_ERROR,
                    message: error.message || 'Resource not found',
                    ...(statusCode && { statusCode }),
                    originalError: error,
                    timestamp,
                };
            }

            if (statusCode === 429) {
                return {
                    type: ErrorType.RATE_LIMIT_ERROR,
                    message: error.message || 'Too many requests',
                    ...(statusCode && { statusCode }),
                    originalError: error,
                    timestamp,
                };
            }

            if (statusCode && statusCode >= 500) {
                return {
                    type: ErrorType.SERVER_ERROR,
                    message: error.message || 'Server error',
                    statusCode,
                    originalError: error,
                    timestamp,
                };
            }

            if (statusCode && statusCode >= 400) {
                return {
                    type: ErrorType.VALIDATION_ERROR,
                    message: error.message || 'Validation failed',
                    statusCode,
                    originalError: error,
                    timestamp,
                };
            }
        }

        // Timeout errors
        if (error instanceof Error && error.name === 'AbortError') {
            return {
                type: ErrorType.TIMEOUT_ERROR,
                message: 'Request timed out',
                originalError: error,
                timestamp,
            };
        }

        // Offline errors
        if (error instanceof Error && error.message.toLowerCase().includes('offline')) {
            return {
                type: ErrorType.OFFLINE_ERROR,
                message: 'You are offline',
                originalError: error,
                timestamp,
            };
        }

        // Standard Error objects
        if (error instanceof Error) {
            // Check message for common patterns
            const message = error.message.toLowerCase();

            if (message.includes('not connected') || message.includes('connection')) {
                return {
                    type: ErrorType.NETWORK_ERROR,
                    message: error.message,
                    originalError: error,
                    timestamp,
                };
            }

            if (message.includes('peer connection not initialized')) {
                return {
                    type: ErrorType.VALIDATION_ERROR,
                    message: 'Connection not established',
                    originalError: error,
                    timestamp,
                };
            }

            if (message.includes('permission denied')) {
                return {
                    type: ErrorType.PERMISSION_ERROR,
                    message: error.message,
                    originalError: error,
                    timestamp,
                };
            }

            return {
                type: ErrorType.UNKNOWN_ERROR,
                message: error.message,
                originalError: error,
                timestamp,
            };
        }

        // String errors
        if (typeof error === 'string') {
            return {
                type: ErrorType.UNKNOWN_ERROR,
                message: error,
                originalError: error,
                timestamp,
            };
        }

        // Unknown error types
        return {
            type: ErrorType.UNKNOWN_ERROR,
            message: 'An unexpected error occurred',
            originalError: error,
            timestamp,
        };
    }

    /**
     * Type guard for HTTP errors
     */
    private static isHttpError(error: unknown): error is {
        status?: number;
        statusCode?: number;
        message?: string;
    } {
        return (
            typeof error === 'object' &&
            error !== null &&
            ('status' in error || 'statusCode' in error)
        );
    }

    /**
     * Log error to Sentry with context
     */
    private static logToSentry(error: NormalizedError, context: ErrorContext): void {
        try {
            const sentryContext: Parameters<typeof Sentry.captureException>[1] = {
                tags: {
                    errorType: error.type,
                    component: context.component,
                    action: context.action,
                    endpoint: context.endpoint || 'N/A',
                },
                contexts: {
                    error: {
                        normalized_type: error.type,
                        ...(error.statusCode && { status_code: error.statusCode }),
                        timestamp: error.timestamp.toISOString(),
                    },
                    ...(context.metadata && { context: context.metadata }),
                },
                level: this.getSentryLevel(error.type),
            };

            if (context.userId) {
                sentryContext.user = { id: context.userId };
            }

            Sentry.captureException(error.originalError, sentryContext);
        } catch (sentryError) {
            // Fail silently if Sentry logging fails
            console.error('Failed to log to Sentry:', sentryError);
        }
    }

    /**
     * Get Sentry severity level based on error type
     */
    private static getSentryLevel(errorType: ErrorType): Sentry.SeverityLevel {
        switch (errorType) {
            case ErrorType.AUTH_ERROR:
            case ErrorType.PERMISSION_ERROR:
                return 'warning';

            case ErrorType.SERVER_ERROR:
                return 'error';

            case ErrorType.NETWORK_ERROR:
            case ErrorType.TIMEOUT_ERROR:
            case ErrorType.OFFLINE_ERROR:
                return 'info';

            case ErrorType.VALIDATION_ERROR:
            case ErrorType.NOT_FOUND_ERROR:
                return 'warning';

            case ErrorType.RATE_LIMIT_ERROR:
                return 'warning';

            default:
                return 'error';
        }
    }

    /**
     * Show user-friendly notification
     */
    private static showUserNotification(error: NormalizedError, context: ErrorContext): void {
        const userMessage = this.getUserMessage(error, context);

        // Use different toast styles based on error type
        switch (error.type) {
            case ErrorType.AUTH_ERROR:
                toast.error(userMessage, {
                    description: 'Please log in again to continue.',
                    duration: 5000,
                });
                break;

            case ErrorType.NETWORK_ERROR:
            case ErrorType.OFFLINE_ERROR:
                toast.error(userMessage, {
                    description: 'Please check your internet connection.',
                    duration: 4000,
                });
                break;

            case ErrorType.TIMEOUT_ERROR:
                toast.warning(userMessage, {
                    description: 'The request took too long. Please try again.',
                    duration: 4000,
                });
                break;

            case ErrorType.RATE_LIMIT_ERROR:
                toast.warning(userMessage, {
                    description: 'Please wait a moment before trying again.',
                    duration: 5000,
                });
                break;

            case ErrorType.VALIDATION_ERROR:
                toast.error(userMessage, {
                    duration: 4000,
                });
                break;

            case ErrorType.NOT_FOUND_ERROR:
                toast.error(userMessage, {
                    description: 'The requested resource could not be found.',
                    duration: 4000,
                });
                break;

            case ErrorType.PERMISSION_ERROR:
                toast.error(userMessage, {
                    description: 'You do not have permission to perform this action.',
                    duration: 4000,
                });
                break;

            default:
                toast.error(userMessage, {
                    duration: 4000,
                });
        }
    }

    /**
     * Get user-friendly error message
     */
    private static getUserMessage(error: NormalizedError, context: ErrorContext): string {
        // Context-specific messages
        const actionMessages: Record<string, string> = {
            fetchApplications: 'Failed to load applications',
            updateStatus: 'Failed to update status',
            sendMessage: 'Failed to send message',
            processSwipe: 'Failed to process your action',
            fetchPetListings: 'Failed to load pet listings',
            connectCall: 'Failed to connect video call',
            switchCamera: 'Failed to switch camera',
            startRecording: 'Failed to start recording',
        };

        if (context.action && actionMessages[context.action]) {
            return actionMessages[context.action]!;
        }

        // Generic messages by error type
        const genericMessages: Record<ErrorType, string> = {
            [ErrorType.NETWORK_ERROR]: 'Network connection lost',
            [ErrorType.AUTH_ERROR]: 'Session expired',
            [ErrorType.VALIDATION_ERROR]: error.message || 'Invalid input',
            [ErrorType.NOT_FOUND_ERROR]: 'Content not found',
            [ErrorType.PERMISSION_ERROR]: 'Permission denied',
            [ErrorType.RATE_LIMIT_ERROR]: 'Too many requests',
            [ErrorType.SERVER_ERROR]: 'Server error occurred',
            [ErrorType.TIMEOUT_ERROR]: 'Request timed out',
            [ErrorType.OFFLINE_ERROR]: 'You are offline',
            [ErrorType.UNKNOWN_ERROR]: 'Something went wrong',
        };

        return genericMessages[error.type] || 'An error occurred';
    }

    /**
     * Check if error is retryable
     */
    static isRetryable(error: unknown): boolean {
        const normalized = this.normalize(error);

        return [
            ErrorType.NETWORK_ERROR,
            ErrorType.TIMEOUT_ERROR,
            ErrorType.SERVER_ERROR,
            ErrorType.RATE_LIMIT_ERROR,
        ].includes(normalized.type);
    }

    /**
     * Get retry delay based on error type (in milliseconds)
     */
    static getRetryDelay(error: unknown, attempt: number): number {
        const normalized = this.normalize(error);

        if (normalized.type === ErrorType.RATE_LIMIT_ERROR) {
            // Longer delay for rate limits
            return Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30s
        }

        // Standard exponential backoff
        return Math.min(500 * Math.pow(2, attempt), 10000); // Max 10s
    }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Handle error with context
 */
export function handleError(error: unknown, context: ErrorContext): void {
    ErrorHandler.handle(error, context);
}

/**
 * Create error handler for specific component
 */
export function createErrorHandler(component: string) {
    return (error: unknown, action: string, metadata?: Record<string, unknown>) => {
        const context: ErrorContext = {
            component,
            action,
        };
        if (metadata) {
            context.metadata = metadata;
        }
        ErrorHandler.handle(error, context);
    };
}
