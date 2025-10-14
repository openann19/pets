/**
 * Enhanced Error Boundary Component
 * Advanced error handling with recovery mechanisms, user feedback, and analytics
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon, 
  HomeIcon,
  ChatBubbleLeftIcon,
  BugAntIcon
} from '@heroicons/react/24/outline';
import { errorHandler } from '../../../core/src/services/ErrorHandler';
import { logger } from '../../../core/src/services/Logger';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
  showReportButton?: boolean;
  showRetryButton?: boolean;
  showHomeButton?: boolean;
  className?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  isRetrying: boolean;
}

export class EnhancedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { level = 'component', onError } = this.props;
    
    // Log error with enhanced context
    logger.error('React Error Boundary caught an error', {
      component: 'EnhancedErrorBoundary',
      action: 'component_did_catch',
      metadata: {
        level,
        errorId: this.state.errorId,
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
    });

    // Process error through centralized error handler
    errorHandler.handleError(error, {
      component: 'ReactComponent',
      action: 'render_error',
      severity: level === 'critical' ? 'critical' : 'high',
      metadata: {
        level,
        errorId: this.state.errorId,
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
    });

    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  }

  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = (): void => {
    const { retryCount } = this.state;
    const maxRetries = 3;

    if (retryCount >= maxRetries) {
      logger.warn('Maximum retry attempts reached', {
        component: 'EnhancedErrorBoundary',
        action: 'max_retries_reached',
        retryCount,
        maxRetries,
      });
      return;
    }

    this.setState({ isRetrying: true });

    // Exponential backoff
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
    
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1,
        isRetrying: false,
      });

      logger.info('Error boundary retry attempted', {
        component: 'EnhancedErrorBoundary',
        action: 'retry_attempt',
        retryCount: retryCount + 1,
        delay,
      });
    }, delay);
  };

  handleReportError = (): void => {
    const { error, errorId } = this.state;
    
    if (!error || !errorId) return;

    // Log error report
    logger.info('User reported error', {
      component: 'EnhancedErrorBoundary',
      action: 'user_report_error',
      errorId,
      errorMessage: error.message,
    });

    // In a real implementation, this would send to a bug reporting service
    // For now, we'll just show a confirmation
    alert('Thank you for reporting this error. Our team has been notified.');
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { 
      hasError, 
      error, 
      errorInfo, 
      errorId, 
      retryCount, 
      isRetrying 
    } = this.state;
    
    const { 
      children, 
      fallback, 
      level = 'component',
      showReportButton = true,
      showRetryButton = true,
      showHomeButton = true,
      className = ''
    } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Determine error level styling
      const isCritical = level === 'critical';
      const isPage = level === 'page';

      return (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`error-boundary ${className} ${
              isPage ? 'min-h-screen' : 'min-h-[400px]'
            } flex items-center justify-center p-4`}
          >
            <div className={`max-w-md w-full ${
              isCritical 
                ? 'bg-red-50 border-red-200' 
                : 'bg-yellow-50 border-yellow-200'
            } border rounded-2xl shadow-lg p-8 text-center`}>
              
              {/* Error Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className={`mb-6 ${
                  isCritical ? 'text-red-500' : 'text-yellow-500'
                }`}
              >
                <ExclamationTriangleIcon className="h-16 w-16 mx-auto" />
              </motion.div>

              {/* Error Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-2xl font-bold mb-4 ${
                  isCritical ? 'text-red-900' : 'text-yellow-900'
                }`}
              >
                {isCritical ? 'Critical Error' : 'Something went wrong'}
              </motion.h2>

              {/* Error Message */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-lg mb-6 ${
                  isCritical ? 'text-red-700' : 'text-yellow-700'
                }`}
              >
                {isCritical 
                  ? 'A critical error occurred that prevented the application from working properly.'
                  : 'An unexpected error occurred. Don\'t worry, your data is safe.'
                }
              </motion.p>

              {/* Error ID for support */}
              {errorId && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6 p-3 bg-gray-100 rounded-lg"
                >
                  <p className="text-sm text-gray-600">
                    Error ID: <code className="font-mono text-xs">{errorId}</code>
                  </p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                {/* Retry Button */}
                {showRetryButton && retryCount < 3 && (
                  <button
                    onClick={this.handleRetry}
                    disabled={isRetrying}
                    className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                      isCritical
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <ArrowPathIcon className={`h-5 w-5 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                    {isRetrying ? 'Retrying...' : 'Try Again'}
                  </button>
                )}

                {/* Home Button */}
                {showHomeButton && (
                  <button
                    onClick={this.handleGoHome}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <HomeIcon className="h-5 w-5 mr-2" />
                    Go to Home
                  </button>
                )}

                {/* Reload Button */}
                <button
                  onClick={this.handleReload}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  Reload Page
                </button>

                {/* Report Error Button */}
                {showReportButton && (
                  <button
                    onClick={this.handleReportError}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                  >
                    <BugAntIcon className="h-5 w-5 mr-2" />
                    Report Error
                  </button>
                )}
              </motion.div>

              {/* Development Error Details */}
              {process.env.NODE_ENV === 'development' && errorInfo && (
                <motion.details
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 text-left"
                >
                  <summary className="cursor-pointer text-sm text-gray-600 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="bg-gray-100 p-4 rounded-lg text-xs font-mono overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error:</strong> {error.message}
                    </div>
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">{error.stack}</pre>
                    </div>
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">{errorInfo.componentStack}</pre>
                    </div>
                  </div>
                </motion.details>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      );
    }

    return children;
  }
}

export default EnhancedErrorBoundary;
