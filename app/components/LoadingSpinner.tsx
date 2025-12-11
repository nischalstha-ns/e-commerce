'use client';

import { CircularProgress } from '@heroui/react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export default function LoadingSpinner(props: LoadingSpinnerProps) {
  const { size = 'md', label = 'Loading...', className = '' } = props;
  
  const containerClasses = `flex flex-col items-center justify-center p-8 ${className}`;
  
  return (
    <div className={containerClasses}>
      <CircularProgress size={size} aria-label={label} />
      {label && (
        <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm">
          {label}
        </p>
      )}
    </div>
  );
}