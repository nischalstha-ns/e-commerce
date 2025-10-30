export type UserRole = 'admin' | 'customer';

export interface UserPermission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

// Optimized permission lookup using Sets for O(1) access
const ADMIN_PERMISSIONS = new Set([
  'products:create', 'products:read', 'products:update', 'products:delete',
  'categories:create', 'categories:read', 'categories:update', 'categories:delete',
  'orders:read', 'orders:update', 'users:read', 'users:update',
  'reviews:read', 'reviews:update', 'reviews:delete'
]);

const CUSTOMER_PERMISSIONS = new Set([
  'products:read', 'categories:read', 'orders:create', 'orders:read',
  'reviews:create', 'reviews:read', 'cart:create', 'cart:read',
  'cart:update', 'cart:delete'
]);

export const USER_PERMISSIONS: Record<UserRole, UserPermission[]> = {
  admin: [
    { resource: 'products', action: 'create' },
    { resource: 'products', action: 'read' },
    { resource: 'products', action: 'update' },
    { resource: 'products', action: 'delete' },
    { resource: 'categories', action: 'create' },
    { resource: 'categories', action: 'read' },
    { resource: 'categories', action: 'update' },
    { resource: 'categories', action: 'delete' },
    { resource: 'orders', action: 'read' },
    { resource: 'orders', action: 'update' },
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' },
    { resource: 'reviews', action: 'read' },
    { resource: 'reviews', action: 'update' },
    { resource: 'reviews', action: 'delete' },
  ],
  customer: [
    { resource: 'products', action: 'read' },
    { resource: 'categories', action: 'read' },
    { resource: 'orders', action: 'create' },
    { resource: 'orders', action: 'read' },
    { resource: 'reviews', action: 'create' },
    { resource: 'reviews', action: 'read' },
    { resource: 'cart', action: 'create' },
    { resource: 'cart', action: 'read' },
    { resource: 'cart', action: 'update' },
    { resource: 'cart', action: 'delete' },
  ],
};

export function hasUserPermission(
  userRole: UserRole | null,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete'
): boolean {
  try {
    if (!userRole || !resource || !action) return false;
    
    const permissionKey = `${resource}:${action}`;
    
    switch (userRole) {
      case 'admin':
        return ADMIN_PERMISSIONS.has(permissionKey);
      case 'customer':
        return CUSTOMER_PERMISSIONS.has(permissionKey);
      default:
        return false;
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Permission check error:', error);
    }
    return false;
  }
}

export function canAccessAdminPanel(userRole: UserRole | null): boolean {
  try {
    return userRole === 'admin';
  } catch {
    return false;
  }
}

export function canManageProducts(userRole: UserRole | null): boolean {
  return hasUserPermission(userRole, 'products', 'create');
}

export function canViewOrders(userRole: UserRole | null): boolean {
  return hasUserPermission(userRole, 'orders', 'read');
}