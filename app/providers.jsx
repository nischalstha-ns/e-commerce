'use client'

import { HeroUIProvider } from "@heroui/react";
import { Toaster } from "react-hot-toast";
import AuthContextProvider from "@/contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";

export function Providers({ children }) {
  return (
    <ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <HeroUIProvider>
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </HeroUIProvider>
    </ErrorBoundary>
  );
}