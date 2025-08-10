"use client";

import { useState } from 'react';
import { CircularProgress } from '@heroui/react';

export default function LazyImage({ src, alt, className, ...props }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={`relative ${className}`} {...props}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <CircularProgress size="sm" />
        </div>
      )}
      {hasError ? (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Image not found</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
}