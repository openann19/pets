"use strict";
/**
 * Centralized Logging Service
 * Production-grade logging with structured output, levels, and multiple transports
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
class LoggerService {
    config;
    transports = [];
    logQueue = [];
    isProcessing = false;
    performanceMarks = new Map();
    constructor(config) {
        this.config = {
            level: 'info',
            enableConsole: true,
            enableFile: false,
            enableRemote: false,
            maxFileSize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
            enablePerformanceLogging: true,
            enableErrorTracking: true,
            ...config,
        };
        this.setupTransports();
        this.setupGlobalHandlers();
    }
    /**
     * Update logger configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.setupTransports();
    }
    /**
     * Log debug message
     */
    debug(message, context) {
        this.log('debug', message, context);
    }
    /**
     * Log info message
     */
    info(message, context) {
        this.log('info', message, context);
    }
    /**
     * Log warning message
     */
    warn(message, context) {
        this.log('warn', message, context);
    }
    /**
     * Log error message
     */
    error(message, error, context) {
        this.log('error', message, context, error);
    }
    /**
     * Log critical message
     */
    critical(message, error, context) {
        this.log('critical', message, context, error);
    }
    /**
     * Start performance measurement
     */
    startPerformance(label) {
        if (this.config.enablePerformanceLogging) {
            this.performanceMarks.set(label, Date.now());
        }
    }
    /**
     * End performance measurement and log
     */
    endPerformance(label, context) {
        if (this.config.enablePerformanceLogging) {
            const startTime = this.performanceMarks.get(label);
            if (startTime) {
                const duration = Date.now() - startTime;
                this.log('info', `Performance: ${label}`, {
                    ...context,
                    metadata: {
                        ...context?.metadata,
                        performance: {
                            duration,
                            memoryUsage: process.memoryUsage(),
                        },
                    },
                });
                this.performanceMarks.delete(label);
            }
        }
    }
    /**
     * Log API request
     */
    logApiRequest(method, url, statusCode, duration, context) {
        const level = statusCode >= 400 ? 'error' : 'info';
        this.log(level, `API ${method} ${url}`, {
            ...context,
            action: 'api_request',
            metadata: {
                method,
                url,
                statusCode,
                duration,
            },
        });
    }
    /**
     * Log user action
     */
    logUserAction(action, userId, metadata, context) {
        this.log('info', `User action: ${action}`, {
            ...context,
            userId,
            action: 'user_action',
            metadata: {
                action,
                ...metadata,
            },
        });
    }
    /**
     * Log security event
     */
    logSecurityEvent(event, severity, context) {
        const level = severity === 'critical' ? 'critical' :
            severity === 'high' ? 'error' :
                severity === 'medium' ? 'warn' : 'info';
        this.log(level, `Security event: ${event}`, {
            ...context,
            action: 'security_event',
            metadata: {
                event,
                severity,
            },
        });
    }
    /**
     * Get log statistics
     */
    getStats() {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const recentErrors = this.logQueue.filter(entry => entry.level === 'error' || entry.level === 'critical').filter(entry => entry.timestamp >= oneHourAgo);
        const byLevel = this.logQueue.reduce((acc, entry) => {
            acc[entry.level] = (acc[entry.level] || 0) + 1;
            return acc;
        }, {});
        const byComponent = this.logQueue.reduce((acc, entry) => {
            const component = entry.context?.component || 'unknown';
            acc[component] = (acc[component] || 0) + 1;
            return acc;
        }, {});
        return {
            totalLogs: this.logQueue.length,
            byLevel,
            byComponent,
            recentErrors: recentErrors.slice(-10),
        };
    }
    /**
     * Clear log queue
     */
    clearQueue() {
        this.logQueue = [];
    }
    /**
     * Main logging method
     */
    log(level, message, context, error) {
        // Check if we should log this level
        if (!this.shouldLog(level)) {
            return;
        }
        const entry = {
            level,
            message,
            timestamp: new Date(),
            context: {
                ...context,
                component: context?.component || 'unknown',
            },
        };
        // Add error information if provided
        if (error) {
            entry.error = {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: 'code' in error ? error.code : undefined,
            };
        }
        // Add to queue
        this.addToQueue(entry);
        // Process logs asynchronously
        this.processLogs();
    }
    /**
     * Check if we should log this level
     */
    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error', 'critical'];
        const currentLevelIndex = levels.indexOf(this.config.level);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex >= currentLevelIndex;
    }
    /**
     * Add log entry to queue
     */
    addToQueue(entry) {
        this.logQueue.push(entry);
        // Maintain queue size (keep last 1000 entries)
        if (this.logQueue.length > 1000) {
            this.logQueue = this.logQueue.slice(-1000);
        }
    }
    /**
     * Process logs through transports
     */
    async processLogs() {
        if (this.isProcessing || this.logQueue.length === 0) {
            return;
        }
        this.isProcessing = true;
        try {
            const entries = [...this.logQueue];
            this.logQueue = [];
            for (const entry of entries) {
                await this.writeToTransports(entry);
            }
        }
        catch (error) {
            console.error('Error processing logs:', error);
        }
        finally {
            this.isProcessing = false;
        }
    }
    /**
     * Write log entry to all transports
     */
    async writeToTransports(entry) {
        const promises = this.transports
            .filter(transport => transport.shouldLog(entry.level))
            .map(async (transport) => {
            try {
                await transport.write(entry);
            }
            catch (error) {
                console.error(`Transport ${transport.name} failed:`, error);
            }
        });
        await Promise.allSettled(promises);
    }
    /**
     * Setup log transports
     */
    setupTransports() {
        this.transports = [];
        // Console transport
        if (this.config.enableConsole) {
            this.transports.push(this.createConsoleTransport());
        }
        // File transport
        if (this.config.enableFile && this.config.filePath) {
            this.transports.push(this.createFileTransport());
        }
        // Remote transport
        if (this.config.enableRemote && this.config.remoteEndpoint) {
            this.transports.push(this.createRemoteTransport());
        }
    }
    /**
     * Create console transport
     */
    createConsoleTransport() {
        return {
            name: 'console',
            shouldLog: (level) => this.shouldLog(level),
            write: (entry) => {
                const formattedMessage = this.formatConsoleMessage(entry);
                switch (entry.level) {
                    case 'debug':
                        console.debug(formattedMessage);
                        break;
                    case 'info':
                        console.info(formattedMessage);
                        break;
                    case 'warn':
                        console.warn(formattedMessage);
                        break;
                    case 'error':
                    case 'critical':
                        console.error(formattedMessage);
                        break;
                }
            },
        };
    }
    /**
     * Create file transport
     */
    createFileTransport() {
        return {
            name: 'file',
            shouldLog: (level) => this.shouldLog(level),
            write: async (entry) => {
                // In a real implementation, this would write to a file
                // For now, we'll just log to console in development
                if (process.env['NODE_ENV'] !== 'production') {
                    console.log('File log:', this.formatJsonMessage(entry));
                }
            },
        };
    }
    /**
     * Create remote transport
     */
    createRemoteTransport() {
        return {
            name: 'remote',
            shouldLog: (level) => this.shouldLog(level),
            write: async (entry) => {
                try {
                    // In a real implementation, this would send to a remote logging service
                    // For now, we'll just log to console in development
                    if (process.env['NODE_ENV'] !== 'production') {
                        console.log('Remote log:', this.formatJsonMessage(entry));
                    }
                }
                catch (error) {
                    console.error('Remote logging failed:', error);
                }
            },
        };
    }
    /**
     * Format message for console output
     */
    formatConsoleMessage(entry) {
        const timestamp = entry.timestamp.toISOString();
        const level = entry.level.toUpperCase().padEnd(8);
        const component = entry.context?.component || 'unknown';
        const action = entry.context?.action ? ` [${entry.context.action}]` : '';
        let message = `[${timestamp}] ${level} ${component}${action}: ${entry.message}`;
        if (entry.error) {
            message += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
            if (entry.error.stack && process.env['NODE_ENV'] !== 'production') {
                message += `\n  Stack: ${entry.error.stack}`;
            }
        }
        if (entry.performance) {
            message += `\n  Performance: ${entry.performance.duration}ms`;
        }
        if (entry.context?.metadata && Object.keys(entry.context.metadata).length > 0) {
            message += `\n  Metadata: ${JSON.stringify(entry.context.metadata, null, 2)}`;
        }
        return message;
    }
    /**
     * Format message for JSON output
     */
    formatJsonMessage(entry) {
        return JSON.stringify(entry, null, 2);
    }
    /**
     * Setup global error handlers
     */
    setupGlobalHandlers() {
        if (this.config.enableErrorTracking) {
            // Handle unhandled promise rejections
            if (typeof window !== 'undefined') {
                window.addEventListener('unhandledrejection', (event) => {
                    this.error('Unhandled Promise Rejection', event.reason, {
                        component: 'Global',
                        action: 'unhandled_promise_rejection',
                        metadata: {
                            reason: event.reason,
                            promise: event.promise,
                        },
                    });
                });
                // Handle global errors
                window.addEventListener('error', (event) => {
                    this.error('Global Error', event.error, {
                        component: 'Global',
                        action: 'global_error',
                        metadata: {
                            filename: event.filename,
                            lineno: event.lineno,
                            colno: event.colno,
                        },
                    });
                });
            }
        }
    }
}
// Export singleton instance
exports.logger = new LoggerService();
exports.default = exports.logger;
