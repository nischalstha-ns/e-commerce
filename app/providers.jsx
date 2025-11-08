'use client'

import { HeroUIProvider } from "@heroui/react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import GlobalErrorBoundary from "./components/GlobalErrorBoundary";
import OfflineIndicator from "./components/OfflineIndicator";
import NoSSR from "./components/NoSSR";
import { perf, cleanupPerformanceMonitoring } from "@/lib/utils/performance";
import { useEffect } from "react";

export function Providers({ children }) {
  useEffect(() => {
    // Initialize performance monitoring only in development
    if (process.env.NODE_ENV === 'development') {
      perf.init();
      perf.mark('app-start');
    }
    
    // Cleanup on unmount
    return () => {
      if (process.env.NODE_ENV === 'development') {
        cleanupPerformanceMonitoring();
      }
    };
  }, []);

  return (
    <GlobalErrorBoundary>
      <ErrorBoundary>
        <NoSSR>
          <ThemeProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  pointerEvents: 'auto',
                  userSelect: 'none',
                  cursor: 'pointer',
                  maxWidth: '400px',
                },
                success: {
                  style: {
                    background: '#10b981',
                    color: '#ffffff',
                    border: '1px solid #059669',
                    borderRadius: '8px',
                    fontWeight: '500',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                    color: '#ffffff',
                    border: '1px solid #dc2626',
                    borderRadius: '8px',
                    fontWeight: '500',
                  },
                },
              }}
            />
            <OfflineIndicator />
            <HeroUIProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </HeroUIProvider>
          </ThemeProvider>
        </NoSSR>
      </ErrorBoundary>
    </GlobalErrorBoundary>
  );
}