/**
 * Performance monitoring and analytics utilities
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'timing' | 'counter' | 'gauge';
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observer: PerformanceObserver | null = null;

  constructor() {
    this.initializeObserver();
  }

  private initializeObserver() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: entry.name,
            value: entry.duration || entry.startTime,
            timestamp: Date.now(),
            type: 'timing'
          });

          // Log slow operations in development
          if (process.env.NODE_ENV === 'development' && entry.duration > 100) {
            console.warn(`Slow operation: ${entry.name} took ${entry.duration}ms`);
          }
        }
      });

      this.observer.observe({ 
        entryTypes: ['measure', 'navigation', 'resource', 'paint'] 
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Performance observer initialization failed:', error);
      }
    }
  }

  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  mark(name: string) {
    if (typeof window !== 'undefined' && window.performance?.mark) {
      try {
        performance.mark(name);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Performance mark failed:', error);
        }
      }
    }
  }

  measure(name: string, startMark: string, endMark?: string) {
    if (typeof window !== 'undefined' && window.performance?.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        return measure?.duration || 0;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Performance measure failed:', error);
        }
        return 0;
      }
    }
    return 0;
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  clearMetrics() {
    this.metrics = [];
  }

  getWebVitals() {
    if (typeof window === 'undefined') return null;

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      return {
        // Core Web Vitals
        FCP: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        LCP: 0, // Would need additional measurement
        CLS: 0, // Would need additional measurement
        FID: 0, // Would need additional measurement
        
        // Navigation timing
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
        
        // Network timing
        dnsLookup: navigation?.domainLookupEnd - navigation?.domainLookupStart || 0,
        tcpConnect: navigation?.connectEnd - navigation?.connectStart || 0,
        serverResponse: navigation?.responseEnd - navigation?.requestStart || 0,
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Web vitals measurement failed:', error);
      }
      return null;
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.clearMetrics();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions
export const trackPageLoad = (pageName: string) => {
  performanceMonitor.mark(`${pageName}-start`);
  
  return () => {
    performanceMonitor.mark(`${pageName}-end`);
    performanceMonitor.measure(`${pageName}-load`, `${pageName}-start`, `${pageName}-end`);
  };
};

export const trackAsyncOperation = async <T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> => {
  performanceMonitor.mark(`${operationName}-start`);
  
  try {
    const result = await operation();
    performanceMonitor.mark(`${operationName}-end`);
    performanceMonitor.measure(operationName, `${operationName}-start`, `${operationName}-end`);
    return result;
  } catch (error) {
    performanceMonitor.mark(`${operationName}-error`);
    performanceMonitor.measure(`${operationName}-failed`, `${operationName}-start`, `${operationName}-error`);
    throw error;
  }
};

export const getBundleSize = () => {
  if (typeof window === 'undefined') return 0;
  
  try {
    const scripts = Array.from(document.scripts);
    return scripts.reduce((size, script) => {
      return size + (script.src ? 1 : script.innerHTML.length);
    }, 0);
  } catch {
    return 0;
  }
};