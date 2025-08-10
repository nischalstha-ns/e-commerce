"use client";

import { useEffect } from 'react';
import { Button } from '@heroui/react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 text-sm">
            We encountered an error while loading the page. Please try again.
          </p>
        </div>
        
        <div className="space-y-3">
          <Button
            color="primary"
            className="w-full"
            onClick={reset}
          >
            Try Again
          </Button>
          
          <Button
            variant="light"
            className="w-full"
            onClick={() => window.location.href = '/'}
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}