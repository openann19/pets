/**
 * User Feedback System
 * Comprehensive user feedback with clear error messages, notifications, and recovery options
 */

import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { logger } from '@pawfectmatch/core/services';
import { AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { MotionDiv } from '../../utils/Motion';

export type FeedbackType = 'success' | 'error' | 'warning' | 'info';
export type FeedbackSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  severity: FeedbackSeverity;
  title: string;
  message: string;
  details?: string;
  action?: {
    label: string;
    handler: () => void;
  };
  dismissible?: boolean;
  autoHide?: boolean;
  duration?: number;
  timestamp: Date;
  persistent?: boolean;
  metadata?: Record<string, unknown>;
}

export interface FeedbackContextType {
  messages: FeedbackMessage[];
  showSuccess: (title: string, message: string, options?: Partial<FeedbackMessage>) => void;
  showError: (title: string, message: string, options?: Partial<FeedbackMessage>) => void;
  showWarning: (title: string, message: string, options?: Partial<FeedbackMessage>) => void;
  showInfo: (title: string, message: string, options?: Partial<FeedbackMessage>) => void;
  dismissMessage: (id: string) => void;
  clearAllMessages: () => void;
  showApiError: (error: Error, context?: string) => void;
  showPaymentError: (error: Error, paymentDetails?: unknown) => void;
  showNetworkError: (error: Error, retryAction?: () => void) => void;
  showValidationError: (errors: string[]) => void;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export const useFeedback = (): FeedbackContextType => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

interface FeedbackProviderProps {
  children: ReactNode;
  maxMessages?: number;
  defaultDuration?: number;
}

export const FeedbackProvider: React.FC<FeedbackProviderProps> = ({
  children,
  maxMessages = 5,
  defaultDuration = 5000
}) => {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);

  const generateId = useCallback(() => {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addMessage = useCallback((message: Omit<FeedbackMessage, 'id' | 'timestamp'>) => {
    const newMessage: FeedbackMessage = {
      id: generateId(),
      timestamp: new Date(),
      dismissible: true,
      autoHide: true,
      duration: defaultDuration,
      ...message,
    };

    setMessages(prev => {
      const updated = [newMessage, ...prev];
      return updated.slice(0, maxMessages);
    });

    // Auto-hide message if enabled
    if (newMessage.autoHide && newMessage.duration && newMessage.duration > 0) {
      setTimeout(() => {
        dismissMessage(newMessage.id);
      }, newMessage.duration);
    }

    return newMessage.id;
  }, [generateId, maxMessages, defaultDuration]);

  const dismissMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAllMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const showSuccess = useCallback((title: string, message: string, options?: Partial<FeedbackMessage>) => {
    return addMessage({
      type: 'success',
      severity: 'low',
      title,
      message,
      ...options,
    });
  }, [addMessage]);

  const showError = useCallback((title: string, message: string, options?: Partial<FeedbackMessage>) => {
    return addMessage({
      type: 'error',
      severity: 'high',
      title,
      message,
      autoHide: false,
      persistent: true,
      ...options,
    });
  }, [addMessage]);

  const showWarning = useCallback((title: string, message: string, options?: Partial<FeedbackMessage>) => {
    return addMessage({
      type: 'warning',
      severity: 'medium',
      title,
      message,
      ...options,
    });
  }, [addMessage]);

  const showInfo = useCallback((title: string, message: string, options?: Partial<FeedbackMessage>) => {
    return addMessage({
      type: 'info',
      severity: 'low',
      title,
      message,
      ...options,
    });
  }, [addMessage]);

  const showApiError = useCallback((error: Error, context?: string) => {
    const errorMessage = getApiErrorMessage(error);

    return showError(
      'Request Failed',
      errorMessage.message,
      {
        severity: errorMessage.severity,
        ...(errorMessage.details ? { details: errorMessage.details } : {}),
        ...(errorMessage.retryable
          ? {
            action: {
              label: 'Retry',
              handler: () => {
                // Retry logic would be implemented by the calling component
                logger.info('User requested retry for API error', {
                  action: 'retry',
                  component: 'Feedback',
                  metadata: {
                    error: error.message,
                    context,
                  },
                });
              },
            },
          }
          : {}),
        metadata: {
          error: error.message,
          context,
          stack: error.stack,
        },
      }
    );
  }, [showError]);

  const showPaymentError = useCallback((error: Error, paymentDetails?: unknown) => {
    const errorMessage = getPaymentErrorMessage(error);

    return showError(
      errorMessage.title,
      errorMessage.message,
      {
        severity: 'high',
        ...(errorMessage.details ? { details: errorMessage.details } : {}),
        action: {
          label: 'Try Again',
          handler: () => {
            logger.info('User requested retry for payment error', {
              action: 'retry',
              component: 'Feedback',
              metadata: {
                error: error.message,
                paymentDetails,
              },
            });
          },
        },
        persistent: true,
        metadata: {
          error: error.message,
          paymentDetails,
        },
      }
    );
  }, [showError]);

  const showNetworkError = useCallback((error: Error, retryAction?: () => void) => {
    return showError(
      'Connection Error',
      'Please check your internet connection and try again.',
      {
        severity: 'medium',
        ...(retryAction
          ? {
            action: {
              label: 'Retry',
              handler: retryAction,
            },
          }
          : {}),
        metadata: {
          error: error.message,
        },
      }
    );
  }, [showError]);

  const showValidationError = useCallback((errors: string[]) => {
    const single = errors[0] ?? 'Validation error';
    const message = errors.length === 1
      ? single
      : `Please fix ${errors.length} validation errors`;

    return showError(
      'Validation Error',
      message,
      {
        severity: 'medium',
        ...(errors.length > 1 ? { details: errors.join('\n') } : {}),
        autoHide: true,
        duration: 8000,
      }
    );
  }, [showError]);

  const contextValue: FeedbackContextType = {
    messages,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissMessage,
    clearAllMessages,
    showApiError,
    showPaymentError,
    showNetworkError,
    showValidationError,
  };

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}
      <FeedbackContainer messages={messages} onDismiss={dismissMessage} />
    </FeedbackContext.Provider>
  );
};

interface FeedbackContainerProps {
  messages: FeedbackMessage[];
  onDismiss: (id: string) => void;
}

const FeedbackContainer: React.FC<FeedbackContainerProps> = ({ messages, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md w-full">
      <AnimatePresence>
        {messages.map((message) => (
          <FeedbackMessageComponent
            key={message.id}
            message={message}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface FeedbackMessageComponentProps {
  message: FeedbackMessage;
  onDismiss: (id: string) => void;
}

const FeedbackMessageComponent: React.FC<FeedbackMessageComponentProps> = ({
  message,
  onDismiss
}) => {
  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (message.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, x: 300, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.95 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
      className={`${getBackgroundColor()} border rounded-lg shadow-lg p-4`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${getTextColor()}`}>
            {message.title}
          </h3>
          <p className={`mt-1 text-sm ${getTextColor()} opacity-90`}>
            {message.message}
          </p>
          {message.details && (
            <details className="mt-2">
              <summary className="text-xs cursor-pointer opacity-75 hover:opacity-100">
                Show details
              </summary>
              <pre className="mt-1 text-xs whitespace-pre-wrap opacity-75">
                {message.details}
              </pre>
            </details>
          )}
          {message.action && (
            <div className="mt-3">
              <button
                onClick={message.action.handler}
                className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${message.type === 'error'
                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                  : message.type === 'warning'
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : message.type === 'success'
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
              >
                <ArrowPathIcon className="h-3 w-3 mr-1" />
                {message.action.label}
              </button>
            </div>
          )}
        </div>
        {message.dismissible && (
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => onDismiss(message.id)}
              className={`inline-flex rounded-md p-1.5 transition-colors ${message.type === 'error'
                ? 'text-red-500 hover:bg-red-100'
                : message.type === 'warning'
                  ? 'text-yellow-500 hover:bg-yellow-100'
                  : message.type === 'success'
                    ? 'text-green-500 hover:bg-green-100'
                    : 'text-blue-500 hover:bg-blue-100'
                }`}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </MotionDiv>
  );
};

// Helper functions for error message generation
function getApiErrorMessage(error: Error): {
  message: string;
  severity: FeedbackSeverity;
  details?: string;
  retryable: boolean;
} {
  const message = error.message.toLowerCase();

  if (message.includes('network') || message.includes('fetch')) {
    return {
      message: 'Network connection failed. Please check your internet connection.',
      severity: 'medium',
      retryable: true,
    };
  }

  if (message.includes('timeout')) {
    return {
      message: 'Request timed out. Please try again.',
      severity: 'medium',
      retryable: true,
    };
  }

  if (message.includes('unauthorized') || message.includes('401')) {
    return {
      message: 'Your session has expired. Please log in again.',
      severity: 'high',
      retryable: false,
    };
  }

  if (message.includes('forbidden') || message.includes('403')) {
    return {
      message: 'You do not have permission to perform this action.',
      severity: 'high',
      retryable: false,
    };
  }

  if (message.includes('not found') || message.includes('404')) {
    return {
      message: 'The requested resource was not found.',
      severity: 'low',
      retryable: false,
    };
  }

  if (message.includes('server') || message.includes('500')) {
    return {
      message: 'Server error occurred. Please try again later.',
      severity: 'high',
      retryable: true,
    };
  }

  return {
    message: 'An unexpected error occurred. Please try again.',
    severity: 'medium',
    details: error.message,
    retryable: true,
  };
}

function getPaymentErrorMessage(error: Error): {
  title: string;
  message: string;
  details?: string;
} {
  const message = error.message.toLowerCase();

  if (message.includes('card') || message.includes('declined')) {
    return {
      title: 'Payment Declined',
      message: 'Your payment method was declined. Please check your card details or try a different payment method.',
      details: error.message,
    };
  }

  if (message.includes('insufficient') || message.includes('funds')) {
    return {
      title: 'Insufficient Funds',
      message: 'Your account has insufficient funds. Please use a different payment method.',
    };
  }

  if (message.includes('expired')) {
    return {
      title: 'Card Expired',
      message: 'Your payment method has expired. Please update your card information.',
    };
  }

  if (message.includes('security') || message.includes('fraud')) {
    return {
      title: 'Security Check Required',
      message: 'Your payment requires additional verification. Please contact your bank or try a different payment method.',
    };
  }

  if (message.includes('limit') || message.includes('exceeded')) {
    return {
      title: 'Payment Limit Exceeded',
      message: 'Your payment exceeds the allowed limit. Please try a smaller amount or contact support.',
    };
  }

  return {
    title: 'Payment Error',
    message: 'We encountered an issue processing your payment. Please try again or contact support.',
    details: error.message,
  };
}

export default FeedbackProvider;
