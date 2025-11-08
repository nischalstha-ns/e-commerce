// Performance monitoring - development only
export const perf = {
  observer: null,
  
  mark: (name) => {
    if (typeof window !== 'undefined' && window.performance && process.env.NODE_ENV === 'development') {
      performance.mark(name);
    }
  },
  
  measure: (name, startMark, endMark) => {
    if (typeof window !== 'undefined' && window.performance && process.env.NODE_ENV === 'development') {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      return measure?.duration || 0;
    }
    return 0;
  },

  init() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window && process.env.NODE_ENV === 'development') {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 100) {
            console.warn(`Slow operation: ${entry.name} took ${entry.duration}ms`);
          }
        }
      });
      this.observer.observe({ entryTypes: ['measure'] });
    }
  },
  
  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
};

// Bundle analyzer - development only
export function analyzeBundleSize() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const scripts = Array.from(document.scripts);
    const totalSize = scripts.reduce((size, script) => {
      return size + (script.src ? 1 : script.innerHTML.length);
    }, 0);
    console.log(`Estimated bundle size: ${(totalSize / 1024).toFixed(2)}KB`);
  }
}

// Cleanup function for performance monitoring
export function cleanupPerformanceMonitoring() {
  perf.cleanup();
}