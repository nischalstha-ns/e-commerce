import { heroui } from '@heroui/react';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Enhanced dark mode colors
        gray: {
          850: '#1f2937',
          950: '#0f172a',
        },
        // E-commerce specific colors
        'ecommerce': {
          'bg-light': '#ffffff',
          'bg-dark': '#0f172a',
          'card-light': '#ffffff',
          'card-dark': '#1e293b',
          'text-light': '#1f2937',
          'text-dark': '#f8fafc',
          'border-light': '#e2e8f0',
          'border-dark': '#475569',
          'accent': '#3b82f6',
          'accent-dark': '#60a5fa',
        },
      },
      animation: {
        'theme-switch': 'theme-switch 0.3s ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
      },
      keyframes: {
        'theme-switch': {
          '0%': { opacity: '0.8', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      transitionProperty: {
        'theme': 'background-color, border-color, color, fill, stroke, box-shadow, transform',
      },
      boxShadow: {
        'theme-light': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'theme-dark': '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
        'card-light': '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        'card-dark': '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
