// Performance monitoring
export const perf = {
  mark: (name) => {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(name);
    }
  },
  
  measure: (name, startMark, endMark) => {
    if (typeof window !== 'undefined' && window.performance) {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      return measure?.duration || 0;
    }
    return 0;
  },

  observer: null,

  init() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 100) { // Log slow operations
            console.warn(`Slow operation: ${entry.name} took ${entry.duration}ms`);
          }
        }
      });
      this.observer.observe({ entryTypes: ['measure'] });
    }
  }
};

// Bundle analyzer
export function analyzeBundleSize() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const scripts = Array.from(document.scripts);
    const totalSize = scripts.reduce((size, script) => {
      return size + (script.src ? 1 : script.innerHTML.length);
    }, 0);
    console.log(`Estimated bundle size: ${(totalSize / 1024).toFixed(2)}KB`);
  }
}