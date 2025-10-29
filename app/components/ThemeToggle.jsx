'use client';

import { Button } from '@heroui/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <Button
      isIconOnly
      variant="light"
      onClick={toggleTheme}
      className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-300 ease-in-out ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5">
        <Sun 
          size={20} 
          className={`absolute inset-0 transition-all duration-300 ease-in-out ${
            isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          } text-yellow-500`}
        />
        <Moon 
          size={20} 
          className={`absolute inset-0 transition-all duration-300 ease-in-out ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          } text-blue-400`}
        />
      </div>
    </Button>
  );
}