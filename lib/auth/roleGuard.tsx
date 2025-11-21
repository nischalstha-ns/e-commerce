'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
  requireAuth?: boolean;
}

type UserRole = 'admin' | 'shop' | 'customer';

interface AuthState {
  user: any;
  userRole: UserRole | null;
  isLoading: boolean;
}

export default function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackPath = '/dashboard'
}: RoleGuardProps) {
  const authState: AuthState = useAuth();
  const { user, userRole, isLoading } = authState;
  const router = useRouter();

  useEffect(() => {
    try {
      if (isLoading) return;
      
      if (!user) {
        if (process.env.NODE_ENV === 'development') {
          console.info('RoleGuard: Redirecting unauthenticated user to login');
        }
        router.replace('/login');
        return;
      }
      
      if (userRole && !allowedRoles.includes(userRole)) {
        if (process.env.NODE_ENV === 'development') {
          console.info('RoleGuard: Access denied', { userRole, allowedRoles });
        }
        router.replace(fallbackPath);
        return;
      }
      
      if (process.env.NODE_ENV === 'development' && userRole) {
        console.info('RoleGuard: Access granted', { userRole });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('RoleGuard: Navigation error', error);
      }
      router.replace('/login');
    }
  }, [user, userRole, isLoading, router, allowedRoles, fallbackPath]);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner size="lg" label="Checking permissions..." />;
    }

    if (!user || (userRole && !allowedRoles.includes(userRole))) {
      return null;
    }

    return <>{children}</>;
  };

  return renderContent();
}