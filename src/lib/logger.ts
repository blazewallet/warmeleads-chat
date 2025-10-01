type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
  context?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (!this.isDevelopment) {
      return level === 'warn' || level === 'error';
    }
    return true;
  }

  private createLogEntry(level: LogLevel, message: string, data?: any, context?: string): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date(),
      context,
    };
  }

  private addToHistory(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const context = entry.context ? `[${entry.context}]` : '';
    return `${timestamp} ${context} ${entry.message}`;
  }

  debug(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('debug')) return;
    
    const entry = this.createLogEntry('debug', message, data, context);
    this.addToHistory(entry);
    
    if (this.isDevelopment) {
      console.log(this.formatMessage(entry), data || '');
    }
  }

  info(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('info')) return;
    
    const entry = this.createLogEntry('info', message, data, context);
    this.addToHistory(entry);
    
    if (this.isDevelopment) {
      console.info(this.formatMessage(entry), data || '');
    }
  }

  warn(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('warn')) return;
    
    const entry = this.createLogEntry('warn', message, data, context);
    this.addToHistory(entry);
    
    console.warn(this.formatMessage(entry), data || '');
  }

  error(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('error')) return;
    
    const entry = this.createLogEntry('error', message, data, context);
    this.addToHistory(entry);
    
    console.error(this.formatMessage(entry), data || '');
    
    // In production, send to monitoring service
    if (!this.isDevelopment) {
      this.sendToMonitoring(entry);
    }
  }

  private sendToMonitoring(entry: LogEntry): void {
    // Example: Send to Sentry, LogRocket, or custom monitoring service
    // Sentry.captureMessage(entry.message, entry.level as any);
  }

  // Context-specific loggers
  chat(message: string, data?: any): void {
    this.debug(message, data, 'CHAT');
  }

  context(message: string, data?: any): void {
    this.debug(message, data, 'CONTEXT');
  }

  payment(message: string, data?: any): void {
    this.info(message, data, 'PAYMENT');
  }

  auth(message: string, data?: any): void {
    this.debug(message, data, 'AUTH');
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 20): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new Logger();

// Export context-specific loggers for convenience
export const chatLogger = {
  debug: (message: string, data?: any) => logger.chat(message, data),
  info: (message: string, data?: any) => logger.info(message, data, 'CHAT'),
  warn: (message: string, data?: any) => logger.warn(message, data, 'CHAT'),
  error: (message: string, data?: any) => logger.error(message, data, 'CHAT'),
};

export const contextLogger = {
  debug: (message: string, data?: any) => logger.context(message, data),
  info: (message: string, data?: any) => logger.info(message, data, 'CONTEXT'),
  warn: (message: string, data?: any) => logger.warn(message, data, 'CONTEXT'),
  error: (message: string, data?: any) => logger.error(message, data, 'CONTEXT'),
};
