'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  isDark: false,
  isLight: true,
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('ecommerce-theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    
    setTimeout(() => {
      root.style.transition = '';
    }, 300);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('ecommerce-theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('ecommerce-theme', newTheme);
    applyTheme(newTheme);
  };

  const setLightTheme = () => {
    setTheme('light');
    localStorage.setItem('ecommerce-theme', 'light');
    applyTheme('light');
  };

  const setDarkTheme = () => {
    setTheme('dark');
    localStorage.setItem('ecommerce-theme', 'dark');
    applyTheme('dark');
  };

  if (!mounted) {
    return <div className="opacity-0">{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      setLightTheme,
      setDarkTheme,
      isDark: theme === 'dark',
      isLight: theme === 'light'
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}