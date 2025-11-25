import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getTenant, Tenant, canPerformAction } from './tenant';

export function useTenantData() {
  const { tenantId } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      loadTenant();
    } else {
      setLoading(false);
    }
  }, [tenantId]);

  const loadTenant = async () => {
    if (!tenantId) return;
    
    try {
      const data = await getTenant(tenantId);
      setTenant(data);
    } catch (error) {
      console.error('Failed to load tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  return { tenant, loading, refresh: loadTenant };
}

export function useFeatureAccess(feature: 'products' | 'orders' | 'users') {
  const { tenant } = useTenantData();
  
  if (!tenant) return { canAccess: false, limitReached: false };
  
  const canAccess = canPerformAction(tenant, feature);
  const limitReached = !canAccess && tenant.status === 'active';
  
  return { canAccess, limitReached, usage: tenant.usage[feature], limit: tenant.limits[feature] };
}

export function usePlanCheck() {
  const { tenant } = useTenantData();
  
  return {
    isPro: tenant?.plan === 'pro' || tenant?.plan === 'enterprise',
    isEnterprise: tenant?.plan === 'enterprise',
    plan: tenant?.plan || 'basic'
  };
}
