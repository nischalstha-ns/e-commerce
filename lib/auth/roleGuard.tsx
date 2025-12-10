'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading || isRedirecting) return;
    
    if (!user) {
      setIsRedirecting(true);
      router.replace('/login');
      return;
    }
    
    if (userRole && !allowedRoles.includes(userRole)) {
      setIsRedirecting(true);
      router.replace(fallbackPath);
      return;
    }
  }, [user, userRole, isLoading, router, allowedRoles, fallbackPath, isRedirecting]);

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!user || (userRole && !allowedRoles.includes(userRole))) {
    return null;
  }

  return <>{children}</>;
}