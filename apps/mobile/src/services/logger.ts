/**
 * Mobile Logger Service
 * Lightweight logging for React Native with Sentry integration
 */

import * as Sentry from '@sentry/react-native';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'security' | 'performance';

export interface LogMetadata {
  [key: string]: unknown;
  error?: Error | unknown;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  duration?: number;
  tags?: string[];
  version?: string;
  timestamp?: string;
}

class MobileLogger {
  private isDevelopment = __DEV__;
  private sessionId: string;
  private appVersion: string;
  private userInfo: {id?: string; email?: string; username?: string} | null = null;
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.appVersion = '1.0.0'; // Could be from app config
  }
  
  private generateSessionId(): string {
    const timestamp = Date.now();
    const randomValue = Math.random().toString(36).substring(2, 10);
    return `mobile_session_${timestamp.toString()}_${randomValue}`;
  }

  /**
   * Sanitizes log data to comply with privacy regulations
   */
  private sanitizeMetadata(data?: Record<string, unknown>): LogMetadata {
    if (!data) return {};
    
    const sanitized: LogMetadata = {};
    const sensitiveFields = [
      'password', 'token', 'accessToken', 'refreshToken', 'secret', 'apiKey', 
      'authorization', 'auth', 'credentials', 'credit', 'card', 'ccv', 'cvv', 'ssn', 
      'social', 'address', 'phone', 'birth', 'zip', 'postal', 'payment'
    ];
    
    const hashValue = (value: string): string => {
      let hash = 0;
      for (let i = 0; i < value.length; i++) {
        const char = value.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash.toString(16).substring(0, 8);
    };
    
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        if (typeof value === 'string') {
          sanitized[key] = `[REDACTED:${hashValue(value)}]`;
        } else {
          sanitized[key] = '[REDACTED]';
        }
      } else if (value instanceof Error) {
        sanitized[key] = {
          message: value.message,
          stack: this.isDevelopment ? value.stack : undefined,
          name: value.name,
          code: (value as Error & { code?: string }).code
        };
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeMetadata(value as LogMetadata);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  private formatLogMessage(level: LogLevel, message: string, metadata?: LogMetadata): string {
    const timestamp = new Date().toISOString();
    const sanitized = this.sanitizeMetadata(metadata);
    
    const parts = [
      `[${timestamp}]`,
      `[${level.toUpperCase()}]`,
      message,
    ];
    
    if (Object.keys(sanitized).length > 0) {
      parts.push(JSON.stringify(sanitized, null, 2));
    }
    
    return parts.join(' ');
  }

  /**
   * Core logging function
   */
  private log(level: LogLevel, message: string, metadata?: LogMetadata): void {
    // Skip debug logs in production
    if (!this.isDevelopment && level === 'debug') {
      return;
    }
    
    // Add standard metadata
    const enhancedMetadata: LogMetadata = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      version: this.appVersion,
      userId: this.userInfo?.id || 'anonymous',
      ...metadata
    };

    const formattedMessage = this.formatLogMessage(level, message, enhancedMetadata);
    const sanitized = this.sanitizeMetadata(enhancedMetadata);

    // Console logging (only in development)
    if (this.isDevelopment) {
      switch (level) {
        case 'debug':
          console.debug(formattedMessage);
          break;
        case 'info':
          console.log(formattedMessage);
          break;
        case 'warn':
          console.warn(formattedMessage);
          break;
        case 'error':
          console.error(formattedMessage);
          break;
        case 'security':
          console.warn(`🔒 ${formattedMessage}`);
          break;
        case 'performance':
          console.info(`⚡ ${formattedMessage}`);
          break;
      }
    }

    // Send to Sentry for errors and security events
    if (level === 'error' || level === 'security') {
      if (metadata?.error instanceof Error) {
        Sentry.captureException(metadata.error, {
          extra: sanitized,
          tags: {
            logLevel: level,
            ...(metadata.tags ? Object.fromEntries(metadata.tags.map(tag => [tag, true])) : {})
          },
        });
      } else {
        const sentryLevel = level === 'security' ? 'warning' : 'error';
        Sentry.captureMessage(message, sentryLevel);
        Sentry.setContext('metadata', sanitized);
      }
    }
  }

  debug(message: string, metadata?: LogMetadata): void {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: LogMetadata): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: LogMetadata): void {
    this.log('error', message, metadata);
  }
  
  /**
   * Log security-related events
   */
  security(message: string, metadata?: LogMetadata): void {
    this.log('security', message, { ...metadata, tags: [...(metadata?.tags || []), 'security'] });
  }
  
  /**
   * Log performance metrics
   */
  performance(operation: string, durationMs: number, metadata?: LogMetadata): void {
    this.log('performance', `${operation} completed in ${durationMs}ms`, {
      ...metadata,
      duration: durationMs,
      operation,
      tags: [...(metadata?.tags || []), 'performance']
    });
  }
  
  /**
   * Create a performance timer that logs when stopped
   */
  startTimer(operation: string): () => void {
    const startTime = Date.now();
    return (metadata?: LogMetadata) => {
      const duration = Math.round(Date.now() - startTime);
      this.performance(operation, duration, metadata);
    };
  }

  /**
   * Set user context for logging systems
   */
  setUser(user: { id: string; email: string; username: string }): void {
    this.userInfo = user;
    
    // Update Sentry user context
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
    
    this.info('User context set', { userId: user.id } as LogMetadata);
  }

  /**
   * Add breadcrumb for tracing and debugging
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, unknown>): void {
    const sanitizedData = this.sanitizeMetadata(data);
    
    // Add to Sentry breadcrumbs
    Sentry.addBreadcrumb({
      message,
      category,
      data: sanitizedData,
      level: 'info',
      timestamp: Date.now() / 1000,
    });
    
    // Debug log the breadcrumb in development
    if (this.isDevelopment) {
      this.debug(`Breadcrumb: ${message}`, { category, ...sanitizedData });
    }
  }
  
  /**
   * Track feature usage
   */
  trackFeature(feature: string, metadata?: LogMetadata): void {
    this.info(`Feature used: ${feature}`, { 
      ...metadata,
      feature,
      tags: [...(metadata?.tags || []), 'feature-usage']
    });
  }
}

export const logger = new MobileLogger();
