/**
 * Enhanced 2025-compliant client-side logger service
 * - Secure structured logging
 * - Complete Sentry & OpenTelemetry integration
 * - Compliance with modern privacy standards
 * - Performance metrics collection
 */

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
}

interface SentryClient {
  captureException: (error: Error, context?: Record<string, unknown>) => void;
  captureMessage: (message: string, level: 'info' | 'warning' | 'error' | 'fatal') => void;
  setContext: (name: string, context: Record<string, unknown>) => void;
  setTags: (tags: Record<string, string>) => void;
  setUser: (user: { id: string; email?: string; username?: string }) => void;
  addBreadcrumb: (breadcrumb: {
    message: string;
    category: string;
    data?: Record<string, unknown>;
    level?: string;
    timestamp?: number;
  }) => void;
  setExtras: (extras: Record<string, unknown>) => void;
}

class Logger {
  private isDevelopment = process.env['NODE_ENV'] === 'development';
  private sentryEnabled = false;
  private openTelemetryEnabled = false;
  private sessionId: string;
  private appVersion: string;
  private consoleLogEnabled: boolean;
  private remoteLogEnabled: boolean;
  private userInfo: { id?: string; email?: string; username?: string } | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.appVersion = process.env['NEXT_PUBLIC_APP_VERSION'] || '1.0.0';
    this.consoleLogEnabled = process.env['NEXT_PUBLIC_CONSOLE_LOGS'] !== 'false';
    this.remoteLogEnabled = process.env['NEXT_PUBLIC_REMOTE_LOGGING'] !== 'false';

    // Check if Sentry is available
    if (
      typeof window !== 'undefined' &&
      (window as unknown as Record<string, unknown>)['Sentry']
    ) {
      this.sentryEnabled = true;
    }

    // Check if OpenTelemetry is available
    if (
      typeof window !== 'undefined' &&
      (window as unknown as Record<string, unknown>)['openTelemetry']
    ) {
      this.openTelemetryEnabled = true;
    }

    // Set global context information
    if (this.sentryEnabled) {
      const sentry = this.getSentry();
      if (sentry) {
        sentry.setTags({
          appVersion: this.appVersion,
          sessionId: this.sessionId,
        });
      }
    }
  }

  /**
   * Generates a unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now();
    const randomValue = Math.random().toString(36).substring(2, 10);
    return `session_${timestamp}_${randomValue}`;
  }

  private getSentry(): SentryClient | null {
    if (
      typeof window !== 'undefined' &&
      (window as unknown as Record<string, unknown>)['Sentry']
    ) {
      return ((window as unknown as Record<string, unknown>)['Sentry']) as SentryClient;
    }
    return null;
  }

  /**
   * Sanitizes log data to comply with privacy regulations
   */
  private sanitizeMetadata(data?: LogMetadata): LogMetadata {
    if (!data) return {};

    const sanitized: LogMetadata = {};
    const sensitiveFields = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'apiKey',
      'authorization',
      'auth',
      'credentials',
      'credit',
      'card',
      'ccv',
      'cvv',
      'ssn',
      'social',
      'address',
      'phone',
      'birth',
      'zip',
      'postal',
      'payment',
    ];

    const hashValue = (value: string): string => {
      // Simple hash function for traceability without exposing values
      let hash = 0;
      for (let i = 0; i < value.length; i++) {
        const char = value.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return hash.toString(16).substring(0, 8);
    };

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();

      // Check if this is a sensitive field
      if (sensitiveFields.some((field) => lowerKey.includes(field))) {
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
          code: (value as unknown as { code?: unknown }).code,
        };
      } else if (typeof value === 'object' && value !== null) {
        // Recursively sanitize nested objects
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

    const parts = [`[${timestamp}]`, `[${level.toUpperCase()}]`, message];

    if (Object.keys(sanitized).length > 0) {
      parts.push(JSON.stringify(sanitized, null, 2));
    }

    return parts.join(' ');
  }

  /**
   * Core logging function with multiple transport options
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
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      ...(this.userInfo?.id ? { userId: this.userInfo.id } : {}),
      ...metadata,
    };

    const formattedMessage = this.formatLogMessage(level, message, enhancedMetadata);
    const sanitized = this.sanitizeMetadata(enhancedMetadata);

    // Console logging (if enabled)
    if (this.consoleLogEnabled) {
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

    // Remote logging (if enabled)
    if (this.remoteLogEnabled) {
      // Send to Sentry if enabled
      if (this.sentryEnabled && (level === 'error' || level === 'security')) {
        const sentry = this.getSentry();
        if (sentry) {
          if (metadata?.error instanceof Error) {
            sentry.captureException(metadata.error, {
              extra: sanitized,
              tags: {
                logLevel: level,
                ...(metadata.tags
                  ? Object.fromEntries(metadata.tags.map((tag) => [tag, true]))
                  : {}),
              },
            });
          } else {
            const sentryLevel =
              level === 'security' ? 'warning' : level === 'error' ? 'error' : 'info';
            sentry.captureMessage(message, sentryLevel);
            sentry.setContext('metadata', sanitized);
          }
        }
      }

      // OpenTelemetry integration
      if (
        this.openTelemetryEnabled &&
        typeof window !== 'undefined' &&
        (window as unknown as Record<string, unknown>)['openTelemetry'] &&
        level !== 'debug'
      ) {
        interface OpenTelemetryAPI {
          logs: { log: (severity: string, message: string, data: Record<string, unknown>) => void };
          trace?: {
            getActiveSpan: () => {
              addEvent: (name: string, data: Record<string, unknown>) => void;
              setStatus: (status: { code: string; message: string }) => void;
            } | null;
          };
        }
        const telemetry = (window as unknown as Record<string, unknown>)['openTelemetry'] as unknown as OpenTelemetryAPI;
        const severity = level === 'security' ? 'WARN' : level.toUpperCase();

        try {
          telemetry.logs.log(severity, message, sanitized);

          // Track error as span event
          if (level === 'error' && telemetry.trace) {
            const currentSpan = telemetry.trace.getActiveSpan();
            if (currentSpan) {
              currentSpan.addEvent('error', sanitized);
              if (metadata?.error instanceof Error) {
                currentSpan.setStatus({ code: 'ERROR', message: metadata.error.message });
              }
            }
          }
        } catch (e) {
          // Fall back to console if telemetry fails
          if (this.isDevelopment) {
            console.warn('OpenTelemetry logging failed', e);
          }
        }
      }

      // Analytics and monitoring services
      if (typeof window !== 'undefined') {
        // DataLayer for Google Analytics / Tag Manager
        if ((window as unknown as Record<string, unknown>)['dataLayer']) {
          interface DataLayerEvent {
            event: string;
            logLevel: string;
            logMessage: string;
            logMetadata: Record<string, unknown>;
          }
          ((window as unknown as Record<string, unknown>)['dataLayer'] as unknown as { push: (event: DataLayerEvent) => void }).push({
            event: 'log',
            logLevel: level,
            logMessage: message,
            logMetadata: sanitized,
          });
        }

        // Application monitoring
        if ((window as unknown as Record<string, unknown>)['appMonitoring']) {
          interface AppMonitoring {
            logEvent: (level: string, message: string, data: Record<string, unknown>) => void;
          }
          ((window as unknown as Record<string, unknown>)['appMonitoring'] as unknown as AppMonitoring).logEvent(
            level,
            message,
            sanitized,
          );
        }
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
      tags: [...(metadata?.tags || []), 'performance'],
    });
  }

  /**
   * Create a performance timer that logs when stopped
   */
  startTimer(operation: string): () => void {
    const startTime = performance.now();
    return (metadata?: LogMetadata) => {
      const duration = Math.round(performance.now() - startTime);
      this.performance(operation, duration, metadata);
    };
  }

  /**
   * Set user context for logging systems
   */
  setUser(user: { id: string; email?: string; username?: string }): void {
    this.userInfo = user;

    // Update Sentry user context
    const sentry = this.getSentry();
    if (this.sentryEnabled && sentry) {
      const userPayload: { id: string; email?: string; username?: string } = { id: user.id };
      if (user.email !== undefined) userPayload.email = user.email;
      if (user.username !== undefined) userPayload.username = user.username;
      sentry.setUser(userPayload);
    }

    // Update OpenTelemetry user context
    if (
      this.openTelemetryEnabled &&
      typeof window !== 'undefined' &&
      (window as unknown as Record<string, unknown>)['openTelemetry']
    ) {
      try {
        interface OpenTelemetryResource {
          resource?: {
            addAttributes?: (attrs: Record<string, string>) => void;
          };
        }
        const ot = (window as unknown as Record<string, unknown>)['openTelemetry'] as unknown as OpenTelemetryResource;
        if (ot?.resource?.addAttributes) {
          ot.resource.addAttributes({
            'user.id': user.id,
          });
        }
      } catch {
        // Silent fallback if telemetry fails
      }
    }

    this.info('User context set', { userId: user.id });
  }

  /**
   * Add breadcrumb for tracing and debugging
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, unknown>): void {
    const sanitizedData = this.sanitizeMetadata(data);

    // Add to Sentry breadcrumbs
    const sentry = this.getSentry();
    if (this.sentryEnabled && sentry) {
      sentry.addBreadcrumb({
        message,
        category,
        data: sanitizedData,
        level: 'info',
        timestamp: Date.now() / 1000,
      });
    }

    // Add to OpenTelemetry span events
    if (
      this.openTelemetryEnabled &&
      typeof window !== 'undefined' &&
      (window as unknown as Record<string, unknown>)['openTelemetry']
    ) {
      try {
        interface OpenTelemetryTrace {
          trace?: {
            getActiveSpan: () => {
              addEvent: (message: string, data: Record<string, unknown>) => void;
            } | null;
          };
        }
        const ot = (window as unknown as Record<string, unknown>)['openTelemetry'] as unknown as OpenTelemetryTrace;
        const currentSpan = ot?.trace?.getActiveSpan();
        if (currentSpan) {
          currentSpan.addEvent(message, {
            category,
            ...sanitizedData,
          });
        }
      } catch {
        // Silent fallback
      }
    }

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
      tags: [...(metadata?.tags || []), 'feature-usage'],
    });
  }

  /**
   * Create a group of related logs
   */
  group(groupName: string): {
    debug: (message: string, metadata?: LogMetadata) => void;
    info: (message: string, metadata?: LogMetadata) => void;
    warn: (message: string, metadata?: LogMetadata) => void;
    error: (message: string, metadata?: LogMetadata) => void;
    end: () => void;
  } {
    const baseMetadata: LogMetadata = { group: groupName };

    // Create console group in development
    if (this.isDevelopment && this.consoleLogEnabled) {
      console.group(groupName);
    }

    return {
      debug: (message: string, metadata?: LogMetadata) =>
        this.debug(message, { ...baseMetadata, ...metadata }),
      info: (message: string, metadata?: LogMetadata) =>
        this.info(message, { ...baseMetadata, ...metadata }),
      warn: (message: string, metadata?: LogMetadata) =>
        this.warn(message, { ...baseMetadata, ...metadata }),
      error: (message: string, metadata?: LogMetadata) =>
        this.error(message, { ...baseMetadata, ...metadata }),
      end: () => {
        if (this.isDevelopment && this.consoleLogEnabled) {
          console.groupEnd();
        }
      },
    };
  }
}

export const logger = new Logger();
