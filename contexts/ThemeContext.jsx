"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firestore/firebase';

const ThemeContext = createContext({
  theme: null,
  applyTheme: () => {},
  isLoading: true
});

const defaultTheme = {
  id: "default",
  name: "Default Theme",
  colors: {
    primary: "#3b82f6",
    secondary: "#64748b",
    accent: "#8b5cf6",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#1e293b",
    textSecondary: "#64748b"
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    fontSize: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "30px"
    }
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px"
  },
  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px"
  },
  components: {
    navbar: {
      background: "#ffffff",
      text: "#1e293b",
      height: "64px"
    },
    footer: {
      background: "#1e293b",
      text: "#ffffff"
    },
    button: {
      borderRadius: "8px",
      padding: "12px 24px"
    },
    card: {
      background: "#ffffff",
      borderRadius: "12px",
      shadow: "md"
    }
  }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for active theme changes
    const unsubscribe = onSnapshot(
      doc(db, "settings", "activeTheme"),
      (doc) => {
        if (doc.exists()) {
          const activeThemeData = doc.data();
          setTheme(activeThemeData);
          applyThemeToDOM(activeThemeData);
        } else {
          setTheme(defaultTheme);
          applyThemeToDOM(defaultTheme);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Error listening to theme:", error);
        setTheme(defaultTheme);
        applyThemeToDOM(defaultTheme);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const applyThemeToDOM = (themeData) => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(themeData.colors || {}).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Apply spacing variables
    Object.entries(themeData.spacing || {}).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // Apply border radius variables
    Object.entries(themeData.borderRadius || {}).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
    
    // Apply typography
    if (themeData.typography?.fontFamily) {
      root.style.setProperty('--font-family', themeData.typography.fontFamily);
    }
    
    Object.entries(themeData.typography?.fontSize || {}).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
    
    // Apply component styles
    Object.entries(themeData.components || {}).forEach(([component, styles]) => {
      Object.entries(styles).forEach(([property, value]) => {
        root.style.setProperty(`--${component}-${property}`, value);
      });
    });
  };

  const applyTheme = (newTheme) => {
    setTheme(newTheme);
    applyThemeToDOM(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, applyTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;