'use client'

import { HeroUIProvider } from "@heroui/react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import NoSSR from "./components/NoSSR";

export function Providers({ children }) {
  return (
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
          <HeroUIProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </HeroUIProvider>
        </ThemeProvider>
      </NoSSR>
    </ErrorBoundary>
  );
}