'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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

    useEffect(() => {
      if (isLoading) return;

      if (!user) {
        router.replace(redirectTo);
        return;
      }

      if (requiredRole && userRole !== requiredRole) {
        router.replace(fallbackPath);
        return;
      }
    }, [user, userRole, isLoading, router]);

    if (isLoading) {
      return <LoadingSpinner size="lg" label="Authenticating..." />;
    }

    if (!user) {
      return null;
    }

    if (requiredRole && userRole !== requiredRole) {
      return null;
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
    fallbackPath: '/admin' 
  });
}