'use client';

import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { logger } from '../../services/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Production-ready Error Boundary component
 * Catches React errors and displays fallback UI
 */
export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to logging service
    logger.error('React Error Boundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to external error tracking (Sentry, etc.) if configured
    if (typeof window !== 'undefined' && 'Sentry' in window) {
      interface SentryConfig {
        contexts?: Record<string, unknown>;
        tags?: Record<string, string>;
        extra?: Record<string, unknown>;
      }
      const sentrySdk = (window as unknown as { Sentry: { captureException: (error: Error, config: SentryConfig) => void } }).Sentry;
      sentrySdk.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">😿</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
              <p className="text-gray-600">
                We&apos;re sorry for the inconvenience. The error has been logged and we&apos;ll
                look into it.
              </p>
            </div>

            {process.env['NODE_ENV'] === 'development' && this.state.error && (
              <div className="mb-6 text-left">
                <details className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <summary className="cursor-pointer font-semibold text-red-800 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="text-sm text-red-700 space-y-2">
                    <p className="font-mono break-all">
                      <strong>Error:</strong> {this.state.error.message}
                    </p>
                    {this.state.error.stack !== undefined && (
                      <pre className="text-xs overflow-auto max-h-40 bg-red-100 p-2 rounded">
                        {this.state.error.stack}
                      </pre>
                    )}
                    {this.state.errorInfo !== null && (
                      <pre className="text-xs overflow-auto max-h-40 bg-red-100 p-2 rounded">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Try Again
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                Go to Home
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full text-gray-600 px-6 py-2 rounded-lg hover:text-gray-800 transition-all duration-200"
              >
                Refresh Page
              </button>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              If the problem persists, please{' '}
              <a
                href="/support"
                className="text-purple-600 hover:text-purple-700 underline"
              >
                contact support
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
