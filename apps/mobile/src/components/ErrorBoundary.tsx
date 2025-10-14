import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { logger } from '../services/logger';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showReloadButton?: boolean;
  showReportButton?: boolean;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  showReloadButton?: boolean;
  showReportButton?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Default error fallback component
 */
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  showReloadButton = true,
  showReportButton = true
}) => {
  const { isDark } = useTheme();

  const handleReport = () => {
    Alert.alert(
      'Report Error',
      'Would you like to report this error to help us improve?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          onPress: () => {
            // In production, send error report to service
            logger.error('User reported error', { error: error.message });
            Alert.alert('Thank you!', 'Error report sent successfully.');
          }
        }
      ]
    );
  };

  const handleReload = () => {
    resetError();
    // Force app reload
    // This would typically trigger a navigation reset or app restart
  };

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="warning"
          size={48}
          color={isDark ? '#FF6B6B' : '#F44336'}
        />
      </View>

      <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>
        Oops! Something went wrong
      </Text>

      <Text style={[styles.message, isDark ? styles.messageDark : styles.messageLight]}>
        We're sorry for the inconvenience. Please try again or report the issue.
      </Text>

      {__DEV__ ? <View style={styles.errorDetails}>
        <Text style={[styles.errorText, isDark ? styles.errorTextDark : styles.errorTextLight]}>
          {error.message}
        </Text>
      </View> : null}

      <View style={styles.buttonContainer}>
        {showReloadButton ? <TouchableOpacity
          style={[styles.button, styles.reloadButton]}
          onPress={handleReload}
        >
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity> : null}

        {showReportButton ? <TouchableOpacity
          style={[styles.button, styles.reportButton]}
          onPress={handleReport}
        >
          <Ionicons name="bug" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Report Issue</Text>
        </TouchableOpacity> : null}
      </View>
    </View>
  );
};

/**
 * Error Boundary Component for React Native
 * Catches JavaScript errors anywhere in the component tree
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    logger.error('React Error Boundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  override render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          showReloadButton={this.props.showReloadButton ?? true}
          showReportButton={this.props.showReportButton ?? true}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for error handling in functional components
 */
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, context?: string) => {
    logger.error('Error caught by useErrorHandler', {
      error: error.message,
      stack: error.stack,
      context
    });

    // Show user-friendly error message
    Alert.alert(
      'Something went wrong',
      'Please try again. If the problem persists, contact support.',
      [{ text: 'OK' }]
    );
  }, []);

  return handleError;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#1E1E1E',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  titleLight: {
    color: '#1A1A1A',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  messageLight: {
    color: '#666666',
  },
  messageDark: {
    color: '#CCCCCC',
  },
  errorDetails: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  errorTextLight: {
    color: '#D32F2F',
  },
  errorTextDark: {
    color: '#FF8A80',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  reloadButton: {
    backgroundColor: '#FF6B6B',
  },
  reportButton: {
    backgroundColor: '#666666',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ErrorBoundary;
