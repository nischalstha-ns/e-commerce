'use client';

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasUserPermission, canAccessAdminPanel, UserRole } from './permissions';

export function usePermissions() {
  const { userRole } = useAuth();

  return useMemo(() => {
    try {
      const role = userRole as UserRole;
      
      return {
        hasPermission: (resource: string, action: 'create' | 'read' | 'update' | 'delete') => {
          try {
            return hasUserPermission(role, resource, action);
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Permission check error:', error);
            }
            return false;
          }
        },
        
        canAccessAdminPanel: () => {
          try {
            return canAccessAdminPanel(role);
          } catch {
            return false;
          }
        },
        
        canManageProducts: () => hasUserPermission(role, 'products', 'create'),
        canManageOrders: () => hasUserPermission(role, 'orders', 'update'),
        canManageUsers: () => hasUserPermission(role, 'users', 'update'),
        isAdmin: () => role === 'admin',
        isCustomer: () => role === 'customer',
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('usePermissions error:', error);
      }
      
      return {
        hasPermission: () => false,
        canAccessAdminPanel: () => false,
        canManageProducts: () => false,
        canManageOrders: () => false,
        canManageUsers: () => false,
        isAdmin: () => false,
        isCustomer: () => false,
      };
    }
  }, [userRole]);
}