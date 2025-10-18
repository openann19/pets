/**
 * Payment Error Boundary Component
 * Specialized error handling for payment flows with user-friendly messages and recovery options
 */

import {
  ArrowPathIcon,
  CreditCardIcon,
  PhoneIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { errorHandler, logger } from '@pawfectmatch/core/services';
import { AnimatePresence } from 'framer-motion';
import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { MotionDetails, MotionDiv, MotionH2, MotionP } from '../../utils/Motion';

export interface PaymentErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  onCancel?: () => void;
  paymentMethod?: string;
  amount?: number;
  currency?: string;
}

export interface PaymentErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  isRetrying: boolean;
}

export class PaymentErrorBoundary extends Component<PaymentErrorBoundaryProps, PaymentErrorBoundaryState> {
  private retryTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(props: PaymentErrorBoundaryProps) {
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

  static getDerivedStateFromError(error: Error): Partial<PaymentErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `payment_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, paymentMethod, amount, currency } = this.props;

    // Log payment error with enhanced context
    logger.error('Payment Error Boundary caught an error', error, {
      component: 'PaymentErrorBoundary',
      action: 'payment_error',
      metadata: {
        errorId: this.state.errorId,
        paymentMethod,
        amount,
        currency,
        componentStack: errorInfo.componentStack,
      },
    });

    // Process error through centralized error handler
    errorHandler.handlePaymentError(error, {
      component: 'PaymentFlow',
      action: 'payment_processing',
      severity: 'high',
      metadata: {
        errorId: this.state.errorId,
        paymentMethod,
        amount,
        currency,
        componentStack: errorInfo.componentStack,
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

  override componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = (): void => {
    const { retryCount } = this.state;
    const { onRetry } = this.props;
    const maxRetries = 2; // Fewer retries for payment flows

    if (retryCount >= maxRetries) {
      logger.warn('Maximum payment retry attempts reached', {
        component: 'PaymentErrorBoundary',
        action: 'max_payment_retries_reached',
        metadata: {
          retryCount,
          maxRetries,
        },
      });
      return;
    }

    this.setState({ isRetrying: true });

    // Shorter delay for payment retries
    const delay = Math.min(2000 * Math.pow(1.5, retryCount), 5000);

    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1,
        isRetrying: false,
      });

      // Call custom retry handler if provided
      if (onRetry) {
        onRetry();
      }

      logger.info('Payment error boundary retry attempted', {
        component: 'PaymentErrorBoundary',
        action: 'payment_retry_attempt',
        metadata: {
          retryCount: retryCount + 1,
          delay,
        },
      });
    }, delay);
  };

  handleCancel = (): void => {
    const { onCancel } = this.props;

    logger.info('Payment cancelled by user', {
      component: 'PaymentErrorBoundary',
      action: 'payment_cancelled',
      metadata: { errorId: this.state.errorId },
    });

    if (onCancel) {
      onCancel();
    }
  };

  handleContactSupport = (): void => {
    // In a real implementation, this would open a support chat or redirect to support
    window.open('mailto:support@pawfectmatch.com?subject=Payment Issue', '_blank');

    logger.info('User requested support for payment issue', {
      component: 'PaymentErrorBoundary',
      action: 'contact_support',
      metadata: { errorId: this.state.errorId },
    });
  };

  getPaymentErrorMessage(error: Error): { title: string; message: string; suggestions: string[] } {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('card') || errorMessage.includes('declined')) {
      return {
        title: 'Payment Declined',
        message: 'Your payment method was declined. This could be due to insufficient funds, expired card, or security restrictions.',
        suggestions: [
          'Check that your card details are correct',
          'Ensure you have sufficient funds',
          'Try a different payment method',
          'Contact your bank if the issue persists'
        ]
      };
    }

    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return {
        title: 'Connection Issue',
        message: 'We\'re having trouble processing your payment due to a network connection issue.',
        suggestions: [
          'Check your internet connection',
          'Try again in a few moments',
          'Use a different network if available'
        ]
      };
    }

    if (errorMessage.includes('security') || errorMessage.includes('fraud')) {
      return {
        title: 'Security Check Required',
        message: 'Your payment was flagged for additional security verification.',
        suggestions: [
          'Try using a different payment method',
          'Contact your bank to authorize the transaction',
          'Wait a few minutes and try again'
        ]
      };
    }

    if (errorMessage.includes('limit') || errorMessage.includes('exceeded')) {
      return {
        title: 'Payment Limit Exceeded',
        message: 'Your payment exceeds the allowed limit for this transaction.',
        suggestions: [
          'Try a smaller amount',
          'Use a different payment method',
          'Contact support for assistance'
        ]
      };
    }

    // Default payment error
    return {
      title: 'Payment Processing Error',
      message: 'We encountered an issue while processing your payment. Your card has not been charged.',
      suggestions: [
        'Double-check your payment information',
        'Try a different payment method',
        'Contact support if the problem continues'
      ]
    };
  }

  override render(): ReactNode {
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
      paymentMethod,
      amount,
      currency
    } = this.props;

    if (hasError && error) {
      const errorDetails = this.getPaymentErrorMessage(error);

      return (
        <AnimatePresence>
          <MotionDiv
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="min-h-[500px] flex items-center justify-center p-4"
          >
            <div className="max-w-lg w-full bg-white border border-red-200 rounded-2xl shadow-xl p-8 text-center">

              {/* Payment Error Icon */}
              <MotionDiv
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="text-red-500 mb-6"
              >
                <CreditCardIcon className="h-16 w-16 mx-auto" />
              </MotionDiv>

              {/* Error Title */}
              <MotionH2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-red-900 mb-4"
              >
                {errorDetails.title}
              </MotionH2>

              {/* Error Message */}
              <MotionP
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-red-700 mb-6"
              >
                {errorDetails.message}
              </MotionP>

              {/* Payment Details */}
              {(amount || paymentMethod) && (
                <MotionDiv
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6 p-4 bg-gray-50 rounded-lg"
                >
                  <p className="text-sm text-gray-600">
                    {amount && currency && (
                      <span className="block">Amount: {currency} {amount.toFixed(2)}</span>
                    )}
                    {paymentMethod && (
                      <span className="block">Method: {paymentMethod}</span>
                    )}
                  </p>
                </MotionDiv>
              )}

              {/* Suggestions */}
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6 text-left"
              >
                <h3 className="font-semibold text-gray-900 mb-3">What you can try:</h3>
                <ul className="space-y-2">
                  {errorDetails.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                      <span className="text-red-500 mr-2">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </MotionDiv>

              {/* Action Buttons */}
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                {/* Retry Button */}
                {retryCount < 2 && (
                  <button
                    onClick={this.handleRetry}
                    disabled={isRetrying}
                    className="w-full flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowPathIcon className={`h-5 w-5 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                    {isRetrying ? 'Retrying Payment...' : 'Try Payment Again'}
                  </button>
                )}

                {/* Cancel Button */}
                <button
                  onClick={this.handleCancel}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel Payment
                </button>

                {/* Contact Support Button */}
                <button
                  onClick={this.handleContactSupport}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  Contact Support
                </button>
              </MotionDiv>

              {/* Security Notice */}
              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center justify-center text-green-700">
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Your payment information is secure and encrypted</span>
                </div>
              </MotionDiv>

              {/* Error ID for support */}
              {errorId && (
                <MotionDiv
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600"
                >
                  Error ID: <code className="font-mono">{errorId}</code>
                </MotionDiv>
              )}

              {/* Development Error Details */}
              {((globalThis as any)?.process?.env?.NODE_ENV === 'development') && errorInfo && (
                <MotionDetails
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
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
                </MotionDetails>
              )}
            </div>
          </MotionDiv>
        </AnimatePresence>
      );
    }

    return children;
  }
}

export default PaymentErrorBoundary;
