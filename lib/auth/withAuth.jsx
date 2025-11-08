'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export function withAuth(WrappedComponent, options = {}) {
  const { 
    requiredRole = null, 
    redirectTo = '/login',
    fallbackPath = '/dashboard' 
  } = options;

  return function AuthenticatedComponent(props) {
    const { user, userRole, isLoading } = useAuth();
    const router = useRouter();
    const [hasRedirected, setHasRedirected] = useState(false);
    const redirectTimeoutRef = useRef(null);

    useEffect(() => {
      // Clear any existing timeout
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }

      if (isLoading || hasRedirected) return;

      // Debounce redirects to prevent race conditions
      redirectTimeoutRef.current = setTimeout(() => {
        if (!user) {
          setHasRedirected(true);
          router.replace(redirectTo);
          return;
        }

        if (requiredRole && userRole !== requiredRole) {
          setHasRedirected(true);
          router.replace(fallbackPath);
          return;
        }
      }, 100);

      return () => {
        if (redirectTimeoutRef.current) {
          clearTimeout(redirectTimeoutRef.current);
        }
      };
    }, [user, userRole, isLoading, router, hasRedirected, requiredRole, redirectTo, fallbackPath]);

    if (isLoading) {
      return <LoadingSpinner size="lg" label="Authenticating..." />;
    }

    if (!user || (requiredRole && userRole !== requiredRole)) {
      return <LoadingSpinner size="lg" label="Redirecting..." />;
    }

    return <WrappedComponent {...props} />;
  };
}

export function withAdminAuth(WrappedComponent) {
  return withAuth(WrappedComponent, { 
    requiredRole: 'admin',
    fallbackPath: '/dashboard' 
  });
}

export function withCustomerAuth(WrappedComponent) {
  return withAuth(WrappedComponent, { 
    requiredRole: 'customer',
    fallbackPath: '/dashboard' 
  });
}