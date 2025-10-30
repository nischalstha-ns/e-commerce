'use client';

import { Button } from '@heroui/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle({ className = '', size = 'md' }) {
  const { toggleTheme, isDark } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20
  };

  return (
    <Button
      isIconOnly
      variant="flat"
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        relative overflow-hidden
        bg-white dark:bg-gray-800
        hover:bg-gray-50 dark:hover:bg-gray-700
        border border-gray-200 dark:border-gray-600
        shadow-sm hover:shadow-md
        dark:shadow-black/10
        transition-all duration-300 ease-in-out
        hover:scale-105 active:scale-95
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 90, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Sun 
                size={iconSizes[size]} 
                className="text-amber-500 drop-shadow-sm" 
              />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: 90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: -90, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Moon 
                size={iconSizes[size]} 
                className="text-slate-600 dark:text-slate-300 drop-shadow-sm" 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-current opacity-0"
        whileTap={{ opacity: 0.1, scale: 1.5 }}
        transition={{ duration: 0.2 }}
      />
    </Button>
  );
}

// Compact version for mobile navigation
export function CompactThemeToggle({ className = '' }) {
  const { toggleTheme, isDark } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg
        bg-gray-100 hover:bg-gray-200
        dark:bg-gray-800 dark:hover:bg-gray-700
        text-gray-600 dark:text-gray-300
        border border-gray-200 dark:border-gray-600
        transition-all duration-300
        hover:scale-110 active:scale-95
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="sun-compact"
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 180 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="w-4 h-4 text-amber-500" />
          </motion.div>
        ) : (
          <motion.div
            key="moon-compact"
            initial={{ opacity: 0, rotate: 180 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: -180 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

// Theme colors utility
export const getThemeClasses = (isDark) => ({
  // Backgrounds
  bg: isDark ? 'bg-gray-900' : 'bg-white',
  bgSecondary: isDark ? 'bg-gray-800' : 'bg-gray-50',
  bgCard: isDark ? 'bg-gray-800' : 'bg-white',
  bgHover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
  
  // Text
  text: isDark ? 'text-gray-100' : 'text-gray-900',
  textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
  textMuted: isDark ? 'text-gray-400' : 'text-gray-500',
  
  // Borders
  border: isDark ? 'border-gray-700' : 'border-gray-200',
  borderHover: isDark ? 'border-gray-600' : 'border-gray-300',
  
  // Shadows
  shadow: isDark ? 'shadow-xl shadow-black/20' : 'shadow-sm',
  shadowHover: isDark ? 'hover:shadow-2xl hover:shadow-black/30' : 'hover:shadow-md',
  
  // Accents
  accent: isDark ? 'bg-blue-500' : 'bg-blue-600',
  accentHover: isDark ? 'hover:bg-blue-600' : 'hover:bg-blue-700',
  accentText: isDark ? 'text-blue-400' : 'text-blue-600',
});

// Theme transition classes
export const themeTransition = 'transition-all duration-300 ease-in-out';