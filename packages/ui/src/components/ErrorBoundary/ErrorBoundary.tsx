import { motion } from 'framer-motion';
import type { ErrorInfo, ReactNode } from 'react';
import React, { Component } from 'react';
import { logger } from '../../../web/src/services/logger';

export interface ErrorBoundaryProps {
  /**
   * Children to render
   */
  children: ReactNode;
  /**
   * Fallback component to render on error
   */
  fallback?: ReactNode;
  /**
   * Custom error message
   */
  errorMessage?: string;
  /**
   * Whether to show error details
   */
  showDetails?: boolean;
  /**
   * Custom class names
   */
  className?: string;
  /**
   * Callback when error occurs
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * Whether to reset on prop changes
   */
  resetOnPropsChange?: boolean;
  /**
   * Reset keys to watch for changes
   */
  resetKeys?: (string | number)[];
}

export interface ErrorBoundaryState {
  /**
   * Whether an error has occurred
   */
  hasError: boolean;
  /**
   * The error that occurred
   */
  error?: Error;
  /**
   * Error information
   */
  errorInfo?: ErrorInfo;
}

/**
 * Enhanced error boundary component with better UX and error reporting
 * Provides graceful error handling and recovery options
 *
 * Usage:
 *   <ErrorBoundary fallback={<ErrorFallback />}>
 *     <MyComponent />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Call error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && resetOnPropsChange && resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );

      if (hasResetKeyChanged) {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
      }
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    if (error && errorInfo) {
      // In a real app, you would send this to an error reporting service
      logger.error('Error reported', { error, errorInfo });
      alert('Error has been reported. Thank you for your feedback!');
    }
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { fallback, errorMessage, showDetails, className } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <motion.div
          className={`error-boundary ${className || ''}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm">
            {/* Error Icon */}
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            {/* Error Message */}
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              {errorMessage || 'Something went wrong'}
            </h2>
            
            <p className="text-neutral-600 dark:text-neutral-400 text-center mb-6 max-w-md">
              We apologize for the inconvenience. An unexpected error has occurred.
            </p>

            {/* Error Details */}
            {showDetails && error ? <details className="w-full max-w-md mb-6">
                <summary className="cursor-pointer text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300">
                  Show error details
                </summary>
                <div className="mt-2 p-3 bg-neutral-100 dark:bg-neutral-700 rounded text-xs font-mono text-neutral-800 dark:text-neutral-200 overflow-auto">
                  <div className="mb-2">
                    <strong>Error:</strong> {error.message}
                  </div>
                  {errorInfo ? <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {errorInfo.componentStack}
                      </pre>
                    </div> : null}
                </div>
              </details> : null}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleReportError}
                className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"
              >
                Report Error
              </button>
            </div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook for error boundary functionality
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}

export default ErrorBoundary;
