'use client'

import { HeroUIProvider } from "@heroui/react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import GlobalErrorBoundary from "./components/GlobalErrorBoundary";
import OfflineIndicator from "./components/OfflineIndicator";
import NoSSR from "./components/NoSSR";
import { perf } from "@/lib/utils/performance";
import { useEffect } from "react";

export function Providers({ children }) {
  useEffect(() => {
    // Initialize performance monitoring
    perf.init();
    perf.mark('app-start');
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
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                  border: '1px solid var(--toast-border)',
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