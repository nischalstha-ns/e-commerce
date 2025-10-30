'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/monitoring/analytics';
import { errorTracker } from '@/lib/monitoring/errorTracking';
import { csrfProtection } from '@/lib/security/csrf';

export default function ClientInit() {
  useEffect(() => {
    // Initialize monitoring
    try {
      analytics.init();
      errorTracker.init();
      csrfProtection.generateToken();
    } catch (error) {
      console.warn('Monitoring initialization failed:', error);
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('SW registered:', registration);
          }
        })
        .catch((error) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('SW registration failed:', error);
          }
        });
    }
  }, []);

  return null;
}