'use client'

import { HeroUIProvider } from "@heroui/react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <HeroUIProvider>
        <AuthProvider>
          <Toaster position="top-right" />
          {children}
        </AuthProvider>
      </HeroUIProvider>
    </ThemeProvider>
  );
}