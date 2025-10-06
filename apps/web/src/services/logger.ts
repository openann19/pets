/**
 * Logger Service for Web Application
 * Provides consistent logging across the application
 */

interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  context?: any;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private logLevel: string;
  private isDevelopment: boolean;
  private sessionId: string;

  constructor() {
    this.logLevel = process.env.NODE_ENV === 'development' ? 'debug' : 'info';
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private formatMessage(level: string, message: string, context?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      sessionId: this.sessionId,
      userId: typeof window !== 'undefined' ? localStorage.getItem('userId') || undefined : undefined,
    };
  }

  private log(level: string, message: string, context?: any): void {
    if (!this.shouldLog(level)) return;

    const logEntry = this.formatMessage(level, message, context);

    // Console logging
    if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? 'error' : 
                           level === 'warn' ? 'warn' : 
                           level === 'info' ? 'info' : 'log';
      
      if (context) {
        console[consoleMethod](`[${level.toUpperCase()}] ${message}`, context);
      } else {
        console[consoleMethod](`[${level.toUpperCase()}] ${message}`);
      }
    }

    // Send to external logging service in production
    if (!this.isDevelopment && typeof window !== 'undefined') {
      this.sendToExternalService(logEntry);
    }
  }

  private async sendToExternalService(logEntry: LogEntry): Promise<void> {
    try {
      // Send to your logging service (e.g., Sentry, LogRocket, etc.)
      if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        // Sentry integration would go here
        console.log('Sending log to external service:', logEntry);
      }
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  // Public logging methods
  error(message: string, context?: any): void {
    this.log('error', message, context);
  }

  warn(message: string, context?: any): void {
    this.log('warn', message, context);
  }

  info(message: string, context?: any): void {
    this.log('info', message, context);
  }

  debug(message: string, context?: any): void {
    this.log('debug', message, context);
  }

  // Specialized logging methods
  apiCall(method: string, url: string, status?: number, duration?: number): void {
    this.info(`API ${method} ${url}`, {
      method,
      url,
      status,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  userAction(action: string, context?: any): void {
    this.info(`User action: ${action}`, context);
  }

  performance(metric: string, value: number, context?: any): void {
    this.info(`Performance: ${metric}`, {
      metric,
      value,
      ...context,
    });
  }

  security(event: string, context?: any): void {
    this.warn(`Security event: ${event}`, context);
  }

  // Error tracking
  trackError(error: Error, context?: any): void {
    this.error(`Error: ${error.message}`, {
      name: error.name,
      stack: error.stack,
      ...context,
    });
  }

  // Analytics events
  trackEvent(eventName: string, properties?: any): void {
    this.info(`Analytics event: ${eventName}`, properties);
  }

  // Page tracking
  trackPage(page: string, context?: any): void {
    this.info(`Page view: ${page}`, context);
  }

  // Feature usage
  trackFeature(feature: string, action: string, context?: any): void {
    this.info(`Feature usage: ${feature}.${action}`, context);
  }

  // Network requests
  trackRequest(url: string, method: string, status: number, duration: number): void {
    this.info(`Network request: ${method} ${url}`, {
      url,
      method,
      status,
      duration: `${duration}ms`,
    });
  }

  // Authentication events
  trackAuth(event: string, context?: any): void {
    this.info(`Auth event: ${event}`, context);
  }

  // Chat events
  trackChat(event: string, matchId?: string, context?: any): void {
    this.info(`Chat event: ${event}`, {
      matchId,
      ...context,
    });
  }

  // Match events
  trackMatch(event: string, petId?: string, context?: any): void {
    this.info(`Match event: ${event}`, {
      petId,
      ...context,
    });
  }

  // Premium events
  trackPremium(event: string, context?: any): void {
    this.info(`Premium event: ${event}`, context);
  }

  // Utility methods
  setLogLevel(level: string): void {
    this.logLevel = level;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  // Create a child logger with additional context
  child(context: any): Logger {
    const childLogger = new Logger();
    const originalLog = childLogger.log.bind(childLogger);
    
    childLogger.log = (level: string, message: string, childContext?: any) => {
      originalLog(level, message, { ...context, ...childContext });
    };
    
    return childLogger;
  }
}

// Create singleton instance
const logger = new Logger();

// Export both the instance and the class
export { Logger };
export { logger };
export default logger;