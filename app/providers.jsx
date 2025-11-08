'use client'

import { HeroUIProvider } from "@heroui/react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import GlobalErrorBoundary from "./components/GlobalErrorBoundary";
import OfflineIndicator from "./components/OfflineIndicator";
import NoSSR from "./components/NoSSR";

// Suppress console warnings in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  console.warn = () => {};
  console.error = () => {};
}
export function Providers({ children }) {

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