interface ErrorInfo {
  message: string;
  stack?: string;
  userId?: string;
  url?: string;
  userAgent?: string;
  timestamp: number;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private errors: ErrorInfo[] = [];

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  init() {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        timestamp: Date.now(),
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: Date.now(),
      });
    });
  }

  captureError(error: Partial<ErrorInfo>) {
    const errorInfo: ErrorInfo = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      userId: error.userId,
      url: error.url || window.location.href,
      userAgent: navigator.userAgent,
      timestamp: error.timestamp || Date.now(),
    };

    this.errors.push(errorInfo);

    if (process.env.NODE_ENV === 'production') {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorInfo),
      }).catch(() => {});
    } else {
      console.error('Error tracked:', errorInfo);
    }
  }

  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }
}

export const errorTracker = ErrorTracker.getInstance();

export const captureException = (error: Error, userId?: string) => {
  errorTracker.captureError({
    message: error.message,
    stack: error.stack,
    userId,
    timestamp: Date.now(),
  });
};