"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export function AuthGuardedFirestore({ children, fallback = null }) {
  const { isLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Add a small delay to ensure auth state is fully settled
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!isReady) {
    return fallback;
  }

  return children;
}

export function withAuthGuard(Component, fallback = null) {
  return function AuthGuardedComponent(props) {
    return (
      <AuthGuardedFirestore fallback={fallback}>
        <Component {...props} />
      </AuthGuardedFirestore>
    );
  };
}